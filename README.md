# 复新生涯 FusionCareer 前端

FusionCareer 的 Vue 3 + Vite 前端。当前仓库包含学生端和管理员端页面，并对接 [FusionCareer-Backend](https://github.com/AUSIO2/FusionCareer-Backend)。

> 当前版本仍是“可联调的 UI 原型”：学生端已有部分真实接口调用，管理员端的岗位管理、投递管理仍主要使用页内模拟数据。接口失败时部分页面会回退到 mock 数据，不能据此判断后端已经联通。

## 快速启动

```bash
git clone https://github.com/daixintongtt-code/FusionCareer-View.git
cd FusionCareer-View
cd "Desktop/FusionCareer Design System_V4"
npm ci
npm run dev
```

浏览器打开终端中 Vite 输出的地址，通常为：

- 学生端：`http://localhost:5173/#/login`
- 管理端：`http://localhost:5173/#/admin`

若 `5173` 已被占用，Vite 会自动改用其他端口（例如 `5174`），以终端输出为准。

前端目前将后端地址写为 `http://localhost:9100`。联调真实接口前，请先在本地启动后端。

## 项目目录

```text
FusionCareer-View/
├── README.md                              # 本文档（唯一完整说明）
└── Desktop/
    └── FusionCareer Design System_V4/     # Vue 应用根目录
        ├── package.json
        ├── vite.config.js
        └── src/
            ├── router/index.js
            ├── assets/css/main.css
            ├── components/
            ├── composables/
            └── views/
                ├── LoginView.vue
                ├── HomeView.vue
                ├── JobDetailView.vue
                ├── ProfileView.vue
                └── AdminView.vue
```

应用目录中的 README 只保留入口说明，避免两份文档长期不同步。

## 技术栈与路由

- Vue `^3.4.0`
- Vue Router `^4.3.0`（Hash 路由）
- Vite `^5.0.0`

| 路径 | 页面 | 当前状态 |
| --- | --- | --- |
| `/#/login` | 登录入口 | 页面已完成；真实 SSO 跳转和 Token 写入待接入 |
| `/#/home` | 岗位列表 | 已调用岗位列表接口，并保留 mock fallback |
| `/#/job/:id` | 岗位详情与投递 | 已调用岗位、问卷和投递接口，并保留部分 fallback |
| `/#/profile` | 我的资料、简历、投递 | 资料和简历已接入；“我的投递”仍需适配分页响应 |
| `/#/admin` | 管理后台 | UI 已完成；除岗位描述标准化请求外，主要仍是本地模拟数据 |

## 后端地址与鉴权

后端默认运行于 `http://localhost:9100`，接口没有 `/api` 前缀。

需要登录的学生端接口使用以下请求头：

```text
Fusion-Token: <token>
```

前端从 `localStorage.getItem('fusion_token')` 读取 Token。后端已有 `/fudan/login`、`/fudan/callback`、`/fudan/logout` 等 SSO 接口，但当前登录页只做前端路由跳转，尚未完成真实 SSO 登录闭环。

当前后端的 `/internal/**` 控制器未使用 Sa-Token 注解。生产部署前应在后端或网关补充管理员鉴权，不能仅依赖前端隐藏入口。

## 后端枚举基准

以下值以当前后端仓库的 Java 枚举为准：

| 业务字段 | 后端枚举值 |
| --- | --- |
| 岗位大类 | `ACADEMIC` / `GOVERNMENT` / `MEDIA` / `ENTERPRISE` / `OTHER` |
| 招聘类型 | `BIG_INTERNSHIP` / `SMALL_INTERNSHIP` / `DAILY_INTERNSHIP` / `CAMPUS_RECRUITMENT` / `CAMPUS_SCREENING` / `OTHER` |
| 工作形式 | `ONLINE` / `OFFLINE` / `HYBRID` |
| 实习时长 | `LESS_THAN_THREE_MONTHS` / `THREE_TO_SIX_MONTHS` / `MORE_THAN_SIX_MONTHS` |
| 每周天数 | `ONE_TO_TWO_DAYS` / `THREE_TO_FOUR_DAYS` / `FIVE_DAYS` |
| 学历层次 | `UNDERGRADUATE` / `ACADEMIC_MASTER` / `PROFESSIONAL_MASTER` / `DOCTORAL` |

已知兼容问题：前端部分页面仍兼容或使用旧值 `BOTH`、`BACHELOR`、`DOCTORATE`。显示层可以继续兼容旧数据，但提交给后端时应统一转换为 `HYBRID`、`UNDERGRADUATE`、`DOCTORAL`。

## 接口接入状态

状态说明：

- **已接入**：后端接口存在，前端已发起真实请求。
- **部分接入**：接口存在，但响应映射、鉴权或页面流程尚未完整打通。
- **待实现**：一端或两端仍缺少实现。

| 模块 | 接口 | 后端 | 前端 | 说明 |
| --- | --- | --- | --- | --- |
| 岗位 | `GET /job/list`、`GET /job/{id}` | 已实现 | 已接入 | 请求失败时会显示 mock 数据 |
| 个人资料 | `GET /user/profile/get`、`PUT /user/profile/save` | 已实现 | 部分接入 | 学历枚举仍需统一 |
| 简历文件 | `GET /user/resume/file/list`、`POST /user/resume/file/upload`、下载、删除 | 已实现 | 部分接入 | 列表、上传、删除已请求真实接口；下载链接未显式附带 Header Token，文件类型校验也需与后端统一 |
| 投递问卷 | 获取题目、上传附件、`POST /questionnaire/submit` | 已实现 | 已接入 | 题目请求失败时会使用静态题目 |
| 我的投递 | `GET /questionnaire/my/list` | 已实现 | 部分接入 | 后端返回 `data.page.list`，前端当前按 `data` 数组解析 |
| 投递草稿与详情 | `POST /questionnaire/draft`、`GET /questionnaire/my/{jobPostId}` | 已实现 | 待接入 | 个人中心的修改投递流程仍使用本地数据 |
| 管理端岗位 CRUD | `/internal/job-post/**` | 已实现 | 待接入 | 列表、保存、发布、删除当前主要修改页内数组 |
| 管理端问卷与审核 | `/internal/questionnaire/**` | 已实现 | 待接入 | 管理端投递和题目数据仍为模拟数据 |
| SSO 登录 | `/fudan/login`、`/fudan/callback`、`/fudan/logout` | 已实现 | 待接入 | 登录页尚未获取并保存真实 Token |
| 导出 | 问卷 Excel、简历 ZIP | 待实现 | 待实现 | 当前后端没有 README 旧版中所写的 export 路由 |
| 岗位推荐 | `recommended` / `is_recommended` | 待实现 | UI 预留 | 当前后端实体和接口尚未提供该字段 |

## 两项新增功能的接口约定

以下是前端已经预留、后端仍待实现的契约。

### 1. 上传简历时同步“我的资料”

`POST /user/resume/file/upload`，`multipart/form-data`：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | File | 是 | PDF/JPG/JPEG/PNG，最大 20 MB |
| `updateProfile` | Boolean | 否 | `true` 时识别简历，并用已识别字段更新个人资料；未识别字段保持原值 |

当前状态：前端已发送 `updateProfile`，后端控制器目前只接收 `file`，因此文件可以上传，但不会同步个人资料。后端完成后，前端会在上传成功时重新请求 `GET /user/profile/get`。

> 前端文件选择器当前使用 `image/*`，范围比后端白名单更宽；正式联调时还需将前端校验收敛到 JPG/JPEG/PNG。

### 2. 岗位描述标准化

`POST /internal/job-post/normalize`

请求体：

```json
{
  "rawDescription": "岗位名称：新媒体运营实习生……"
}
```

响应的 `data` 应使用创建岗位接口的标准字段名，例如：

```json
{
  "positionName": "新媒体运营实习生",
  "companyName": "示例公司",
  "jobCategory": "MEDIA",
  "workMode": "HYBRID",
  "workCity": "上海",
  "jobDesc": "……",
  "reqSkills": "……"
}
```

当前状态：前端会优先请求该接口，并兼容常见 snake_case 字段；后端尚无此路由。请求失败时，前端会用本地规则做演示性解析，管理员仍可编辑后再保存或发布。管理员的实际保存和发布 API 也尚未接入。

## 本地 mock 行为

`HomeView.vue`、`JobDetailView.vue` 等页面在接口失败时可能自动切换到页内 mock 数据。这便于查看 UI，但也可能掩盖网络错误。联调时请同时检查浏览器 Network 和后端日志；生产发布前应决定是移除 fallback，还是增加明确的“演示数据”标识。

## 构建

在应用目录执行：

```bash
npm run build
npm run preview
```

构建产物位于 `Desktop/FusionCareer Design System_V4/dist/`。项目使用 Hash 路由，部署静态文件时不要求额外配置 history fallback。
