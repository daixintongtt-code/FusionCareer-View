# 复新生涯 FusionCareer 前端

FusionCareer 的 Vue 3 + Vite 前端，包含学生端与管理员端，并与 FusionCareer Java 后端及 Python Agent 完成接口对齐。

## 快速启动

先启动本地 Java 后端 `http://127.0.0.1:9100`，然后：

```bash
cd "Desktop/FusionCareer Design System_V4"
npm ci
npm run dev
```

浏览器通常打开 `http://127.0.0.1:5173/#/login`。开发环境由 Vite 将 `/api` 和 `/fudan` 转发至 Java；生产环境由 Nginx 负责转发。

## 项目目录

```text
FusionCareer-View/
├── README.md
└── Desktop/FusionCareer Design System_V4/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── lib/                 # API 与认证
        ├── router/              # 登录及角色守卫
        ├── composables/         # 问卷共享流程
        ├── components/
        └── views/
```

## 登录与权限

- 浏览器通过统一 API 客户端请求 `/api/**`，客户端自动附加 `Fusion-Token`。
- SSO 回跳 Token 会从 URL 中取出、保存并立即从地址栏清除。
- `/admin` 同时受前端 ADMIN 角色守卫和后端权限校验保护。
- 开发环境登录页可选择学生或管理员；生产环境统一进入复旦认证。
- 401 会清除失效 Token，不使用页面级 mock 绕过登录或接口错误。

## 路由

| 路径 | 页面 | 权限 |
| --- | --- | --- |
| `/#/login` | 登录 | 公开 |
| `/#/home` | 岗位搜索与筛选 | 登录用户 |
| `/#/job/:id` | 岗位详情和问卷投递 | 登录用户 |
| `/#/profile` | 资料、简历、投递记录 | 登录用户 |
| `/#/admin` | 岗位、问卷、审核和导出 | ADMIN |

## 已接入能力

### 学生端

- 岗位列表、搜索、筛选、排序和详情；
- 动态问卷、草稿、附件、提交和修改投递；
- 个人资料与在线简历读写；
- 简历文件列表、配额、上传、下载和删除；
- 上传时可选 AI 更新资料，默认不勾选；
- AI 只覆盖识别到的非空字段，失败保留文件并支持重试；
- 我的投递列表与状态筛选。

### 管理员端

- 岗位列表、新建、编辑、草稿、发布、下线和删除；
- 问卷题目整组保存；
- 投递查看、审核及 CSV/ZIP 导出；
- 粘贴岗位原文后调用 `POST /admin/job-post/structure`；
- 支持一段原文识别多个岗位、切换编辑和 warnings；
- AI 结果不会自动保存或发布。

生产页面不会在接口失败时回退岗位、问卷或投递模拟数据。

## 枚举基准

| 字段 | 枚举 |
| --- | --- |
| 学历 | `UNDERGRADUATE` / `ACADEMIC_MASTER` / `PROFESSIONAL_MASTER` / `DOCTORAL` |
| 岗位大类 | `ACADEMIC` / `GOVERNMENT` / `MEDIA` / `ENTERPRISE` / `OTHER` |
| 工作形式 | `ONLINE` / `OFFLINE` / `HYBRID` |
| 招聘类型 | `BIG_INTERNSHIP` / `SMALL_INTERNSHIP` / `DAILY_INTERNSHIP` / `CAMPUS_RECRUITMENT` / `CAMPUS_SCREENING` / `OTHER` |

显示层兼容历史学历值 `BACHELOR`、`DOCTORATE`，提交时只使用当前后端枚举。

## 配置与构建

默认 API 前缀为 `/api`，需要覆盖时设置：

```bash
VITE_API_BASE=/api
```

生产构建：

```bash
npm ci
npm run build
```

产物位于 `Desktop/FusionCareer Design System_V4/dist/`。项目使用 Hash 路由，不需要服务器 history fallback。
