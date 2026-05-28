#!/usr/bin/env bash
# FusionCareer-View — Mac：构建学生端 Vue → 打 dist 包 → HTTP 供 Python 机拉取（或 rsync）
#
# 用法（在 FusionCareer-View 仓库根目录）:
#   ./deploy/scripts/mac-build-frontend.sh
#   ./deploy/scripts/mac-build-frontend.sh --no-serve
#   ./deploy/scripts/mac-build-frontend.sh --serve-only
#   ./deploy/scripts/mac-build-frontend.sh --rsync
#
# 前置: Node.js 18+、npm；Python 机见 python-deploy-frontend-from-mac.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="${FRONTEND_DIR:-ui_kits/student}"
HTTP_PORT="${FRONTEND_HTTP_PORT:-8766}"
TMP_DIR="${TMP_DIR:-/tmp}"
DIST_ARCHIVE="${TMP_DIR}/fusioncareer-frontend-dist.tgz"
PID_FILE="${TMP_DIR}/fc-frontend-http-server.pid"
ENV_FILE="${REPO_ROOT}/.env.frontend"

DO_BUILD=1
DO_SERVE=1
DO_RSYNC=0

for arg in "$@"; do
  case "$arg" in
    --no-serve) DO_SERVE=0 ;;
    --serve-only) DO_BUILD=0 ;;
    --rsync) DO_RSYNC=1; DO_SERVE=0 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "未知参数: $arg（可用 --no-serve | --serve-only | --rsync）" >&2
      exit 1
      ;;
  esac
done

load_env_frontend() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    HTTP_PORT="${FRONTEND_HTTP_PORT:-$HTTP_PORT}"
  fi
}

list_mac_ips() {
  ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" {print $2}' \
    || ip -4 addr show 2>/dev/null | awk '/inet / {split($2,a,"/"); print a[1]}'
}

detect_mac_ip() {
  if [[ -n "${MAC_IP:-}" ]]; then
    echo "$MAC_IP"
    return 0
  fi
  local ip preferred=""
  while IFS= read -r ip; do
    [[ -z "$ip" ]] && continue
    if [[ "$ip" =~ ^10\. ]]; then
      preferred="$ip"
      break
    fi
    if [[ -z "$preferred" ]]; then
      preferred="$ip"
    fi
  done < <(list_mac_ips)
  echo "$preferred"
}

stop_http_server() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid="$(cat "$PID_FILE")"
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      echo "已停止前端 HTTP 服务 (pid $pid)"
    fi
    rm -f "$PID_FILE"
  fi
}

if [[ "$DO_BUILD" -eq 1 ]]; then
  cd "$REPO_ROOT"
  APP_DIR="$REPO_ROOT/$FRONTEND_DIR"
  if [[ ! -f "$APP_DIR/package.json" ]]; then
    echo "找不到前端项目: $APP_DIR/package.json" >&2
    exit 1
  fi

  echo "==> [1/2] npm 构建 ($FRONTEND_DIR)..."
  cd "$APP_DIR"
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
  npm run build
  if [[ ! -f dist/index.html ]]; then
    echo "构建失败: 缺少 dist/index.html" >&2
    exit 1
  fi
  ls -lh dist/index.html dist/assets 2>/dev/null | head -5

  echo "==> [2/2] 打包 dist..."
  COPYFILE_DISABLE=1 tar czf "$DIST_ARCHIVE" -C dist .
  cp "$SCRIPT_DIR/python-deploy-frontend-from-mac.sh" "$TMP_DIR/"
  ls -lh "$DIST_ARCHIVE"
fi

load_env_frontend

if [[ "$DO_RSYNC" -eq 1 ]]; then
  if [[ ! -f "$DIST_ARCHIVE" ]]; then
    echo "缺少 $DIST_ARCHIVE，请先构建（去掉 --rsync 跑一次）" >&2
    exit 1
  fi
  : "${PYTHON_HOST:?请在 .env.frontend 设置 PYTHON_HOST}"
  : "${PYTHON_USER:?请在 .env.frontend 设置 PYTHON_USER}"
  REMOTE_DIR="${PYTHON_DIST_DIR:-/home/${PYTHON_USER}/fusioncareer/frontend/dist}"
  SSH_OPTS="${PYTHON_SSH_OPTS:-}"
  APP_DIR="$REPO_ROOT/$FRONTEND_DIR"
  echo "==> rsync 到 ${PYTHON_USER}@${PYTHON_HOST}:${REMOTE_DIR}"
  # shellcheck disable=SC2086
  ssh $SSH_OPTS "${PYTHON_USER}@${PYTHON_HOST}" "mkdir -p '${REMOTE_DIR}'"
  # shellcheck disable=SC2086
  rsync -avz --delete -e "ssh $SSH_OPTS" "${APP_DIR}/dist/" "${PYTHON_USER}@${PYTHON_HOST}:${REMOTE_DIR}/"
  echo "rsync 完成。"
  exit 0
fi

if [[ "$DO_SERVE" -eq 0 ]]; then
  echo "构建完成（未启动 HTTP）。"
  exit 0
fi

if [[ ! -f "$DIST_ARCHIVE" ]]; then
  echo "缺少文件: $DIST_ARCHIVE" >&2
  exit 1
fi

echo "本机 IPv4 地址:"
list_mac_ips | sed 's/^/  - /'

MAC_IP="$(detect_mac_ip)"
if [[ -z "$MAC_IP" ]]; then
  echo "无法检测 IP，请指定: MAC_IP=10.x.x.x $0 --serve-only" >&2
  exit 1
fi

if [[ "$MAC_IP" =~ ^192\.168\. ]]; then
  echo ""
  echo "警告: 当前使用 $MAC_IP。Python 机 10.107.13.184 可能无法访问 192.168.x。"
  echo "  请连校园网后用 10.x.x.x，例如: MAC_IP=10.230.32.62 $0 --serve-only"
  echo ""
fi

stop_http_server

echo "==> 启动 HTTP :$HTTP_PORT (目录 $TMP_DIR)，绑定 0.0.0.0 ..."
cd "$TMP_DIR"
python3 -m http.server "$HTTP_PORT" --bind 0.0.0.0 >/tmp/fc-frontend-http-server.log 2>&1 &
echo $! >"$PID_FILE"

echo ""
echo "=============================================="
echo " 前端包: http://${MAC_IP}:${HTTP_PORT}/fusioncareer-frontend-dist.tgz"
echo ""
echo " Python 机执行:"
echo ""
echo "   curl -f -o /tmp/python-deploy-frontend-from-mac.sh \\"
echo "     http://${MAC_IP}:${HTTP_PORT}/python-deploy-frontend-from-mac.sh"
echo "   bash /tmp/python-deploy-frontend-from-mac.sh ${MAC_IP} ${HTTP_PORT}"
echo "=============================================="
