# 复新生涯 FusionCareer — 前端 UI Kit

Vue 3 + Vite 项目，覆盖全部页面。浏览器统一请求 `/api`，开发环境由 Vite 代理到本机 Java 9100，生产环境由 Nginx 转发。

## 快速启动

```bash
cd ui_kits/student
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

推荐编辑器：VSCode + **Vue (Volar)** 插件。

---

## 技术栈

| 依赖 | 版本 |
|------|------|
| Vue 3 | ^3.4 |
| Vue Router 4 | ^4.3（Hash 模式） |
| Vite 5 | ^5.0 |
| Tabler Icons | CDN webfont（3.19） |
| Google Fonts | Noto Serif SC + Noto Sans SC |

---

## 路由

| 路径 | 页面 | 权限 |
|------|------|------|
| `/#/login` | 登录（UIS 跳转 / 管理员入口） | 公开 |
| `/#/home` | 岗位列表（推荐轮播 + 搜索筛选 + 排序） | 需登录 |
| `/#/job/:id` | 岗位详情 + 问卷投递弹窗 + 简历选择器 | 需登录 |
| `/#/profile` | 个人中心（我的资料 / 我的简历 / 我的投递） | 需登录 |
| `/#/admin` | 管理后台（岗位管理 + 简历导出） | 需管理员角色 |

---

## 文件结构

```
ui_kits/student/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── router/index.js
    ├── assets/css/main.css        全局设计 token + 组件类
    ├── components/
    │   ├── UserNavbar.vue         顶部导航栏
    │   ├── AppToast.vue           右下角 Toast 提示
    │   └── RegionSelect.vue       省市联动下拉（Teleport 方案）
    ├── composables/
    │   └── useToast.js            { show, success, error }
    └── views/
        ├── LoginView.vue
        ├── HomeView.vue
        ├── JobDetailView.vue
        ├── ProfileView.vue
        └── AdminView.vue
```

---

## 后端接口对接说明

### 鉴权

所有需登录的接口都在 Header 中附带：

```
Fusion-Token: <token>
```

Token 从 SSO 回跳 fragment 中读取，并以 `fusion-career-token` 保存。页面通过统一 API 客户端附加认证头：

```js
import { readJson } from '@/lib/api'

const profile = await readJson('/user/profile/get')
```

学生和管理员均使用 UIS 登录；`/user/me` 返回角色，前端路由与后端共同限制 `/admin`。

### 枚举值对照

前端传给后端的枚举值均已对齐，参考下表：

| 业务字段 | 前端显示 | 传给后端的枚举值 |
|---------|---------|---------------|
| 岗位大类 | 新闻媒体 / 企业公司 / 党政机关 / 学术教职 / 其他 | `MEDIA` / `ENTERPRISE` / `GOVERNMENT` / `ACADEMIC` / `OTHER` |
| 招聘类型 | 大实习 / 小实习 / 日常实习 / 应届招聘 | `BIG_INTERNSHIP` / `SMALL_INTERNSHIP` / `DAILY_INTERNSHIP` / `CAMPUS_RECRUITMENT` |
| 工作形式 | 线上 / 线下 / 线上线下均可 | `ONLINE` / `OFFLINE` / `HYBRID` |
| 实习时长 | 3个月以内 / 3–6个月 / 6个月以上 | `LESS_THAN_THREE_MONTHS` / `THREE_TO_SIX_MONTHS` / `MORE_THAN_SIX_MONTHS` |
| 每周天数 | 3天 / 4天 / 5天 | `ONE_TO_TWO_DAYS` / `THREE_TO_FOUR_DAYS` / `FIVE_DAYS` |
| 学历层次 | 本科生 / 学术硕士 / 专业硕士 / 博士 | `UNDERGRADUATE` / `ACADEMIC_MASTER` / `PROFESSIONAL_MASTER` / `DOCTORAL` |

### 各页面调用的接口

#### HomeView — 岗位列表

```
GET /job/list
  参数：page, size, keyword, jobCategory, recruitType, workCity,
        workPeriodType, workDurationType, workMode, salaryMin, salaryMax,
        sortBy(NEWEST|DEADLINE)
```

接口失败时页面显示错误提示，生产代码不回退到模拟数据。

#### JobDetailView — 岗位详情 + 投递

```
GET  /job/{id}                                  获取岗位详情
GET  /questionnaire/questions/{jobPostId}       获取该岗位的问卷题目
POST /questionnaire/submit                      提交问卷（answers 序列化为 JSON 字符串）
POST /questionnaire/draft                       保存问卷草稿
POST /questionnaire/upload                      上传问卷附件（FILE_UPLOAD 题型）
GET  /questionnaire/my/{jobPostId}              读取当前岗位作答
GET  /user/resume/file/list                     加载我的简历列表（供投递时选择）
```

题目、草稿和提交均使用真实后端数据，生产环境不回退静态题目。

#### ProfileView — 个人中心

```
GET  /user/profile/get              读取个人资料
PUT  /user/profile/save             保存个人资料（字段：realName, grade, eduLevel, email, phone）
GET  /user/resume/file/list         简历文件列表
POST /user/resume/file/upload       上传简历（multipart, field: file，≤20MB）
GET  /user/resume/file/{id}/download  下载
DELETE /user/resume/file/{id}       删除
GET  /questionnaire/my/list         我的投递列表与状态数量
```

#### AdminView — 管理后台

```
GET    /admin/job-post/list                              岗位列表（含所有状态）
POST   /admin/job-post                                   创建岗位
PUT    /admin/job-post/{id}                              更新岗位
DELETE /admin/job-post/{id}                              删除岗位
POST   /admin/questionnaire/questions/batch/{id}         批量保存问卷题目（整组替换）
GET    /admin/questionnaire/answers/job/{id}             分页查看投递
GET    /admin/questionnaire/answers/job/{id}/export?format=csv  导出问卷 CSV
GET    /admin/questionnaire/answers/job/{id}/export?format=zip  导出问卷与简历 ZIP
```

> 管理端接口路径前缀 `/admin/**`，必须携带 ADMIN 用户的 `Fusion-Token`。

### 已对齐的跨端能力

`/questionnaire/my/list` 投递列表、岗位 `recommended` 字段、管理端审核以及 CSV/ZIP 导出均由真实后端接口提供。生产视图中不包含岗位、问卷或投递模拟数据。

---

## 组件说明

### `RegionSelect.vue` — 省市联动

```vue
<RegionSelect @change="onRegionChange" />

<script setup>
function onRegionChange({ province, city }) {
  console.log(province, city) // e.g. '上海', '上海'
}
</script>
```

使用 `<Teleport to="body">` + `getBoundingClientRect()` 动态定位，解决父容器 `overflow: hidden` 裁剪问题。

### `AppToast.vue` + `useToast.js`

```js
import { useToast } from '@/composables/useToast'
const toast = useToast()

toast.success('保存成功')
toast.error('请填写必填项')
toast.show('普通提示')
```

---

## 样式约定

- **Scoped styles**：每个 view 内的私有样式写在 `<style scoped>`
- **Global classes**：`.card`、`.btn-primary`、`.badge-*` 等公共类在 `main.css` 定义
- **Inline styles**：一次性定位/间距直接写 inline，出现 3+ 次的提升为 class
- **设计 token**：所有颜色、字号、圆角、阴影均为 CSS 自定义属性，在 `main.css` 顶部定义

---

## 构建 & 部署

```bash
npm run build
# 产物在 dist/，可直接部署到任意静态托管（OSS、Nginx、GitHub Pages）
# Hash 路由无需服务端配置 history fallback
```
