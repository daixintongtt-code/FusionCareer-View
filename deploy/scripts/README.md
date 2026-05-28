# FusionCareer-View 部署脚本

前端独立仓库；网关与 Java API 见 [FusionCareer-Backend](https://github.com/AUSIO2/FusionCareer-Backend) 的 `deploy/`。

## 流程

```text
Mac (FusionCareer-View):  mac-build-frontend.sh  →  dist.tgz + HTTP :8766
Python 机:                python-deploy-frontend-from-mac.sh  →  ~/fusioncareer/frontend/dist
```

## Mac

```bash
cd /path/to/FusionCareer-View
cp deploy/env.frontend.example .env.frontend   # 可选

chmod +x deploy/scripts/*.sh
./deploy/scripts/mac-build-frontend.sh
```

| 参数 | 说明 |
|------|------|
| `--no-serve` | 只 build + 打 tar |
| `--serve-only` | `/tmp` 已有包，只启 HTTP |
| `--rsync` | build 后 rsync（需 `.env.frontend` 里 PYTHON_HOST） |

## Python 机（10.107.13.184）

```bash
mkdir -p ~/fusioncareer/frontend/dist
curl -f -o /tmp/python-deploy-frontend-from-mac.sh \
  http://<Mac_10.x_IP>:8766/python-deploy-frontend-from-mac.sh
bash /tmp/python-deploy-frontend-from-mac.sh <Mac_10.x_IP> 8766
```

## 本地开发

```bash
cd ui_kits/student
npm ci && npm run dev
```

API 代理见 `ui_kits/student/vite.config.js`（默认 `/api`、`/fudan` → localhost:9100）。
