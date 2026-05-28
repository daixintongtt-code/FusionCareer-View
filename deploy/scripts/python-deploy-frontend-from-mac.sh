#!/usr/bin/env bash
# Python 机：从 Mac HTTP 下载 FusionCareer-View 的 dist 包 → 解压到 Nginx 静态目录
#
# 用法:
#   bash python-deploy-frontend-from-mac.sh <Mac_IP> [HTTP_PORT]
#   bash python-deploy-frontend-from-mac.sh 10.230.32.62 8766

set -euo pipefail

MAC_IP="${1:-${MAC_IP:-}}"
HTTP_PORT="${2:-${FRONTEND_HTTP_PORT:-8766}}"
TMP_DIR="${TMP_DIR:-/tmp}"
ARCHIVE="${TMP_DIR}/fusioncareer-frontend-dist.tgz"
DIST_DIR="${PYTHON_DIST_DIR:-${HOME}/fusioncareer/frontend/dist}"

ENV_CANDIDATES=(
  "${HOME}/fusioncareer/.env.frontend"
  "${HOME}/fusioncareer/FusionCareer-View/.env.frontend"
)
for f in "${ENV_CANDIDATES[@]}"; do
  if [[ -f "$f" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$f"
    set +a
    DIST_DIR="${PYTHON_DIST_DIR:-$DIST_DIR}"
    break
  fi
done

if [[ -z "$MAC_IP" ]]; then
  echo "用法: $0 <Mac_IP> [HTTP_PORT]" >&2
  echo "示例: $0 10.230.32.62 8766" >&2
  exit 1
fi

BASE_URL="http://${MAC_IP}:${HTTP_PORT}"

require_cmd() {
  for c in "$@"; do
    command -v "$c" >/dev/null 2>&1 || {
      echo "缺少命令: $c" >&2
      exit 1
    }
  done
}

require_cmd curl tar

echo "=============================================="
echo " Mac      : ${MAC_IP}:${HTTP_PORT}"
echo " 静态目录 : ${DIST_DIR}"
echo "=============================================="

if [[ "$MAC_IP" =~ ^192\.168\. ]]; then
  echo "警告: ${MAC_IP} 多为局域网地址，Python 云机可能无法访问。" >&2
fi

echo "==> [1/4] 测试 Mac HTTP..."
http_code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 8 "${BASE_URL}/" || echo "000")"
if [[ "$http_code" != "200" ]]; then
  echo "无法访问 ${BASE_URL}/ (HTTP ${http_code})" >&2
  echo "Mac 上在 FusionCareer-View 仓库运行: ./deploy/scripts/mac-build-frontend.sh --serve-only" >&2
  exit 1
fi

echo "==> [2/4] 下载前端包..."
curl -f# --connect-timeout 120 -o "$ARCHIVE" "${BASE_URL}/fusioncareer-frontend-dist.tgz"
ls -lh "$ARCHIVE"

echo "==> [3/4] 解压到 ${DIST_DIR}..."
mkdir -p "$DIST_DIR"
find "$DIST_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
tar xzf "$ARCHIVE" -C "$DIST_DIR"
ls -la "$DIST_DIR" | head -10
test -f "$DIST_DIR/index.html"

echo "==> [4/4] 完成。"

if [[ -n "${GATEWAY_PROJECT:-}" && -n "${GATEWAY_COMPOSE_FILE:-}" && -n "${PYTHON_DEPLOY_DIR:-}" ]]; then
  if command -v docker >/dev/null 2>&1; then
    echo "重建网关 Nginx (${GATEWAY_PROJECT})..."
    cd "${PYTHON_DEPLOY_DIR}"
    docker compose -p "${GATEWAY_PROJECT}" -f "${GATEWAY_COMPOSE_FILE}" up -d --force-recreate nginx
  fi
else
  echo ""
  echo "提示: 若 Nginx 未挂载 ${DIST_DIR}，请在 FusionCareer-Backend/deploy 的 compose 中配置 volume。"
fi

echo ""
echo "验证:"
echo "  curl -s -o /dev/null -w 'HTTP %{http_code}\n' -H 'Host: fusioncareer.fudan.edu.cn' http://127.0.0.1/"
echo "  curl -sk -o /dev/null -w 'HTTPS %{http_code}\n' https://fusioncareer.fudan.edu.cn/"
