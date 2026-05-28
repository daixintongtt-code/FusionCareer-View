# 复新生涯 FusionCareer — Vue UI Kit

A complete, runnable **Vue 3 + Vite** UI kit covering all 11 screens listed in `brief.md`. This *is* the live product source — the design system inlines it as the source of truth.

## Run

```bash
cd ui_kits/student
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

VSCode + the official **Vue (Volar)** extension is the recommended editor.

## Tech stack

- Vue 3 + Vue Router 4
- Vite 5
- Tabler Icons (CDN webfont)
- Google Fonts: Noto Serif SC + Noto Sans SC

All design tokens (colors, type, radii, shadows) are declared in `src/assets/css/main.css` — these match the project-root `colors_and_type.css` byte-for-byte. Edit either; the other is the snapshot.

## Routes

| Path | Purpose | Per `brief.md` |
|------|---------|----------------|
| `/#/login`    | UIS / 管理员 role-cards   | (login flow) |
| `/#/home`     | 岗位列表 + 推荐轮播 + 搜索筛选 | 用户端 · 首页 |
| `/#/job/:id`  | 详情 + 问卷投递 + 简历选择器   | 用户端 · 岗位详情 |
| `/#/profile`  | 我的资料 / 我的简历 / 我的投递 | 用户端 · 个人中心 |
| `/#/admin`    | 岗位列表 · 新建 · 简历管理     | 管理员端（4 个页面合一） |

## File map

```
ui_kits/student/
├── index.html                    Vite entry
├── package.json                  npm scripts + deps
├── vite.config.js                @/* → ./src
└── src/
    ├── main.js                   createApp + router mount
    ├── App.vue                   <RouterView />
    ├── router/index.js           hash-routed (works on GitHub Pages / static hosts)
    ├── assets/css/main.css       global tokens + component classes
    ├── components/
    │   ├── UserNavbar.vue        sticky brand + nav + avatar
    │   ├── AppToast.vue          bottom-right toast stack
    │   └── RegionSelect.vue      省市联动选择器（见下方说明）
    ├── composables/useToast.js   {show, success, error}
    └── views/
        ├── LoginView.vue         role-cards (student red / admin gold)
        ├── HomeView.vue          carousel + filters + job list + sidebar
        ├── JobDetailView.vue     岗位详情 + 问卷投递弹窗 + 简历选择器
        ├── ProfileView.vue       sidebar nav with 3 panels
        └── AdminView.vue         sidebar layout + stats + 3 admin views
```

## Components

### `RegionSelect.vue` — 省市联动选择器

可独立使用的省份 + 城市级联下拉组件。

**用法：**

```vue
<RegionSelect @change="onRegionChange" />

<script setup>
import RegionSelect from '@/components/RegionSelect.vue'

function onRegionChange({ province, city }) {
  console.log(province, city) // e.g. '广东', '深圳'
}
</script>
```

**Emits：** `change` → `{ province: string, city: string }`

**实现说明：** 使用 `<Teleport to="body">` 将面板挂载到 `body`，配合 `getBoundingClientRect()` 动态定位，彻底解决父容器 `overflow: hidden` 导致面板被裁剪的问题。`HomeView.vue` 内的省份下拉已同步采用相同方案修复。

## Conventions

- **Scoped styles** for view-only CSS. **Global classes** (`.card`, `.btn-primary`, `.badge-*`) live in `main.css`.
- **Inline styles** are used freely for one-off positioning — same pattern as the source codebase. Promote anything that appears 3+ times to a class in `main.css`.
- **Mock data** lives inside each view's `<script setup>`. Replace with API calls when the backend lands.
- **Hash routing** by default — keeps things working on plain static hosting (GitHub Pages, OSS).
