# 复新生涯 FusionCareer — Design System

A design system for **复新生涯 FusionCareer**, the careers & job-placement platform built for the **School of Journalism at Fudan University (复旦大学新闻学院)**. The platform connects journalism students with vetted media-industry roles (新华社, 澎湃新闻, 腾讯新闻, etc.) and supports application tracking, resume management, and questionnaire-based submission.

The visual language draws from Fudan University's official identity — **复旦红 (Fudan Red, `#9B2335`)** as the primary, **金 (Gold, `#B8871E`)** as the secondary — on warm cream paper-tones. It's a deliberately scholarly, restrained look: serif display type (Noto Serif SC) for brand and emphasis, sans body (Noto Sans SC) for everything else, no decorative gradients, no emoji.

## Sources

This system was built by reading:

- **Codebase (mounted):** `FusionCareer-View/` — a Vue 3 + Vite SPA. The full design system lives in `src/assets/css/main.css`. We extracted tokens, components, and visual rules from there and from the five page views (`LoginView`, `HomeView`, `JobDetailView`, `ProfileView`, `AdminView`). Note: `ChatView` (AI 对话页) was removed per v1 scope revision.
- **GitHub repo:** [AUSIO2/FusionCareer-View](https://github.com/AUSIO2/FusionCareer-View) — the same project on GitHub. Browse it for additional context (commit history, future component additions).
- **Brand reference (note from PM):** *"参考复旦大学新闻学院官方网站的配色"* — colors take their cue from the **Fudan School of Journalism** official site, which is also crimson + gold on warm neutrals.

If you have access to those sources, read them directly for the freshest source of truth. This design system is a snapshot.

## Products

There is **one product** with two surfaces:

1. **Student app** (`/login` → `/home` → `/job/:id` → `/profile`) — primary red accents. Browse roles, questionnaire-based application, application tracking.
2. **Admin console** (`/admin`) — same shell, **gold accents** instead of red, sidebar layout, data tables.

Both surfaces share the entire token system; only accent assignments shift.

## Project scope (per `brief.md`)

The platform's purpose, taken directly from the project brief: replace ad-hoc 微信群 / 公众号 job postings with a structured careers platform for the Fudan School of Journalism.

| Surface | Pages this design system must cover |
|---|---|
| 用户端 / Student | 首页 (岗位列表 + 推荐轮播 + 搜索筛选 + 排序切换) · 岗位详情 (问卷投递 + 简历选择器) · 个人中心 (我的资料 / 我的简历 / 我的投递 + 修改投递 + 截止状态) |
| 管理员端 / Admin | 岗位列表编辑 · 岗位创建 (手动 + 表格导入) · 岗位详情编辑 · 岗位简历管理 (批量导出) |

The design system focuses on those pages. We do **not** design for: mobile breakpoints, marketing pages, analytics dashboards beyond the four admin stat-cards already in the source, slide decks, or login flows beyond the existing UIS / admin role-cards. If any of those become in-scope, ask before designing.

## 生产部署

```bash
cp deploy/env.frontend.example .env.frontend   # 可选
./deploy/scripts/mac-build-frontend.sh         # Mac 构建 + HTTP :8766
```

Python 网关机拉取静态资源见 [`deploy/scripts/README.md`](deploy/scripts/README.md)。后端 API / Nginx 网关见 [FusionCareer-Backend](https://github.com/AUSIO2/FusionCareer-Backend) 的 `deploy/`。

## Index

| File | What it has |
|------|-------------|
| `colors_and_type.css` | All design tokens — colors, type scale, radii, shadows, spacing — as CSS custom properties. Import this first. |
| `brief.md` | The project brief (PDF) transcribed and translated. Source of truth for *what the platform must do*. |
| `preview/` | 18 small HTML preview cards rendered in the Design System tab. One concept per card. |
| `ui_kits/student/` | **Runnable Vue 3 + Vite project** — every screen in the brief, end-to-end. `cd ui_kits/student && npm install && npm run dev`. Open in VSCode with the Vue (Volar) extension. |
| `deploy/scripts/` | Mac 构建 dist、Python 机部署脚本（`mac-build-frontend.sh` 等）。 |
| `SKILL.md` | Agent-Skill manifest so an LLM agent can self-onboard to this brand. |
| `assets/` | *(intentionally empty — the platform ships no logo file, no photography, and no icon SVGs; it composes its brand mark live from `ti-map-pin-filled` inside a crimson disc. See `preview/brand-logo.html`.)* |
| `slides/` | *(not built — no slide template was provided)* |

---

## CONTENT FUNDAMENTALS

### Voice and tone

- **Language:** Simplified Chinese, primary. Bilingual flourishes only on the brand mark (复新生涯 / FusionCareer) and on a few labels in the admin console.
- **Register:** Professional and warm, not corporate. The platform is run *by the school for its students*, so copy reads like a thoughtful advisor — never aspirational marketing-speak.
- **Person:** Second-person 「你」/「您」 to address the student. The school speaks in the third person 「学院」.

### Examples (lifted directly from the codebase)

| Surface | Copy |
|---|---|
| Login header | 「**复旦大学新闻学院 · 就业与职业发展平台**」 |
| Login CTA | 「**复旦 UIS 统一认证登录**」 |
| Featured rail | 「**学院本周推荐岗位**」 |
| Job match callout | 「**高度匹配，强烈推荐投递**」 / 「您的新闻传播背景、校媒经历与该岗位要求高度吻合。」 |
| Empty / pending | 「功能开发中」 |
| Toast (success) | 「审核通过，已上线」 |
| Toast (error)   | 「请填写岗位名称和公司」 |

### Rules

- **No emoji.** Anywhere. Status, decoration, mood — all carried by Tabler icons + color.
- **No gerunds in CTAs.** Use verb-object: 「立即投递简历」, 「完善个人资料」, 「保存修改」. Avoid 「投递中…」 unless it's literal state.
- **Numbers are honest.** Quote them where shown. 「较上周 +5」「本月投递 +23%」.
- **Punctuation:** full-width Chinese punctuation throughout (，。：「」). Bullet lists use disc bullets, not arrows.
- **Capitalization (the brief Latin we have):** uppercase + extra letter-spacing for brand-en and section labels (`FUSIONCAREER`, `ADMIN CONSOLE`). Sentence-case English elsewhere.
- **Mark institutions in full once, then short.** First mention 「新华社上海分社」, after that 「新华社」.

### Vibe

Imagine a senior journalism professor explaining a career path over green tea — informed, candid, sparing with praise, never cute. The visual frame supports that: cream paper, crimson seal, gold flecks, restrained serif display.

---

## VISUAL FOUNDATIONS

### Color

Defined in full in `colors_and_type.css`. The system uses three families:

**Brand**
- `--red` `#9B2335` — Fudan red, primary. CTAs, active nav, the 4-px top login bar.
- `--red-hover` `#7D1B29`, `--red-light` `#FDF2F3`, `--red-border` `rgba(155,35,53,0.25)`.
- `--gold` `#B8871E` — Admin role, secondary CTA, "premium" recommendation toggle. Paired with `--gold-light` `#FDF8EE`.

**Ink (text + structure)** — a single warm-grey scale, not pure black.
- `--ink` `#1C1A18` (primary text) → `--ink-2` `#504D48` (secondary) → `--ink-3` `#8C8880` (tertiary, placeholder) → `--ink-4` `#E0DDD9` (disabled / hairline).

**Surface**
- `--bg` `#F5F3EF` (page) — warm cream, the canvas.
- `--bg-card` `#FFFFFF` (cards), `--bg-soft` `#F9F8F6` (subtle fills, table headers, soft callouts), `--bg-sunken` `#EDECEA` (hover, pressed grey).

**Semantic** — paired bg + fg, mid-saturation.
- success `--green` `#1E6636` / `--green-bg` `#EAF4EE`
- warn `--amber` `#7A4F00` / `--amber-bg` `#FEF4E0`
- info `--blue` `#1B4F9C` / `--blue-bg` `#EAF0FB`
- danger reuses `--red` / `--red-light`

> **Imagery color vibe:** warm-neutral, paper-tinted, low-saturation. No cool blues outside semantic info. No grain or filter is applied — the warmth comes from `#F5F3EF` showing through.

### Type

- Display & brand: **Noto Serif SC**, weights 600 / 700.
- Body & UI: **Noto Sans SC**, weights 400 / 500 / 700.
- Both loaded from Google Fonts (see `colors_and_type.css`). No local TTFs needed; substitution risk is low because both are open-source CJK fonts maintained by Adobe / Google.
- Root size is **15 px** (not 16) — gives slightly denser layouts that suit the data-heavy admin console.
- Statistics (the large numbers in stat-cards, the match-percent badge) use the **serif**, not the sans. This is a small choice that makes the platform feel scholarly rather than SaaS-y.

### Spacing & shape

- Radius scale: `--r-sm 6` / `--r-md 10` / `--r-lg 14` / `--r-xl 20` / `--r-full 9999`. Soft but not pill-y. Buttons mostly `--r-md`; cards `--r-lg`; modals `--r-xl`.
- Layout: max-width **1100 px**, navbar **60 px** tall, sidebar **210 px** wide.
- Padding rhythm: most card interiors use `1.25rem 1.5rem`; section gaps are `1rem` / `1.5rem`.

### Backgrounds

- **No full-bleed imagery.** Pages are flat warm cream.
- **No gradients in product UI.** The only mild exception is the login page, which scatters three soft `border-radius: 50%` blobs (`--red-light`, `--red-light`, `--gold-light`) in fixed positions at 45–70% opacity. It reads as ink-bleed on paper, not as a tech-bro mesh gradient.
- **No textures, no patterns, no illustrations.** The brand earns warmth from the cream background + serif type + crimson seals, full stop.

### Animation

- One global transition curve: `--t: 180ms ease`. Used on everything that can hover or focus.
- Press: `transform: scale(0.97)` on `.btn:active`. No springy bounces.
- Page entry: `fade-up` (8 px translate + opacity) for hero blocks; cards on the login page stagger by `0.1s`.
- Modals: `slideUp` 0.2 s.
- Carousel: `transform: translateX(...)` with `0.35s ease`.
- Loading: a three-dot blink (`@keyframes blink`), 1.2 s.
- No infinite ambient animation, no shimmer skeletons, no Lottie.

### States

- **Hover (default):** background shifts from `--bg-card` → `--bg-soft` or `--bg-sunken`; border-color steps from `--border` → `--border-mid` or to `--red-border` for affordances the platform wants you to notice. Job cards add `transform: translateX(2px)` — a tiny "I'm clickable" lurch.
- **Hover (primary button):** background `--red` → `--red-hover` (`#7D1B29`). No size change.
- **Press:** all `.btn` shrink to `scale(0.97)`. No color change.
- **Focus:** 3 px outer glow `0 0 0 3px rgba(155,35,53,0.10)` + border becomes `--red`. Used on form fields and the chat composer.
- **Selected (chips, sidebar nav, filter pills, "current step"):** `--red-light` fill + `--red-border` outline + `--red` text. The gold variants (`--gold-light` + `gold`) appear in admin contexts.

### Borders & dividers

- One hairline weight, two opacities: `--border rgba(28,26,24,0.10)` (default) and `--border-mid rgba(28,26,24,0.18)` (form fields, sliders).
- Dashed borders (`1.5px dashed --border-mid`) only on upload zones.
- Dividers: 1 px `--border` strip with `margin: 1rem 0`. Section heads use a 1 px bottom border + `1.1rem` of padding-bottom.

### Shadows

Just two:
- `--shadow-sm: 0 1px 4px rgba(28,26,24,0.08)` — every card by default.
- `--shadow-md: 0 4px 16px rgba(28,26,24,0.10)` — modal, hovered login card, toast.

**No inner shadows.** No glow effects. No layered "lifted" shadows.

### Transparency & blur

Reserved for the sticky navbar: `background: rgba(255,255,255,0.92)` + `backdrop-filter: blur(10px)`. That's it — no glass cards, no acrylic. Modal mask uses a flat `rgba(28,26,24,0.5)`.

### Cards

Universal recipe:

```css
background: var(--bg-card);
border: 1px solid var(--border);
border-radius: var(--r-lg);
box-shadow: var(--shadow-sm);
padding: 1.25rem 1.5rem;  /* .card-p */
```

Variants in the wild add a 3 px top accent stripe (login role-cards: red for student, gold for admin) or swap the background to `--bg-soft` for a "softer" feeling card.

### Layout rules

- One fixed element: the navbar. Everything else scrolls.
- Sidebars are `position: sticky`, not fixed, so they end with the main content.
- Page content lives in `.wrap { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem }`. Admin breaks this and goes full-width inside its 210-px sidebar layout.
- Mobile responsiveness is **out of scope** in the source — the platform targets desktop browsers in computer labs and admin offices. Designs should be drawn for desktop unless the user explicitly asks otherwise.

---

## ICONOGRAPHY

- **Primary set:** [Tabler Icons](https://tabler.io/icons), loaded via CDN as a webfont:
  ```html
  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css" />
  ```
  Use as `<i class="ti ti-name" />`. Two-tone variants (`ti-star-filled`) are reserved for emphasis (the brand mark dot, the gold "currently recommended" toggle on admin tables).
- **No icon font shipped locally.** We rely on the CDN — same as the source codebase. (If you need an offline copy, install `@tabler/icons-webfont` and serve from `assets/icons/`.)
- **No SVG icon sprite.** Tabler covers every glyph the product uses; nothing custom.
- **No emoji.** Even where you'd expect them (toast feedback, success states), the system uses Tabler glyphs in semantic colors instead.
- **No unicode-as-icon hacks.** No `→`, `✓`, `★`. Everything is `ti-arrow-right`, `ti-check`, `ti-star-filled`.

### Recurring icons (the "house set")

| Concept | Glyph |
|---|---|
| Brand mark | `ti-map-pin-filled` (in a crimson circle) |
| Jobs | `ti-briefcase` |
| Resume | `ti-file-text`, `ti-file-description` |
| Profile | `ti-user`, `ti-user-graduate` |
| Admin | `ti-settings-2` |
| Upload | `ti-cloud-upload`, `ti-upload` |
| Send / submit | `ti-send`, `ti-send-2` |
| Status: success | `ti-check`, `ti-circle-check-filled` |
| Status: warn | `ti-bulb`, `ti-clock` |
| Recommend (gold) | `ti-star-filled` |
| Sort / chevrons | `ti-chevron-left`, `ti-chevron-right`, `ti-arrow-right` |

When a needed icon isn't in Tabler, **search Tabler harder before substituting** — the set has 4,500+ glyphs. If a true gap exists, flag it to the user; don't draw it.

---

## CAVEATS for this design-system snapshot

- **Fonts:** Loaded from Google Fonts CDN. No local `.ttf`. If we need fully offline builds, ask the user to confirm we can either bundle the Google webfont files or substitute (Noto SC is already an excellent free CJK; substitution risk is near zero).
- **No real product imagery.** The platform doesn't ship photographs; cards use serif initials in soft squares (`新` `澎` `腾` `字` `人` `财`). Don't introduce stock photography.
- **Mobile breakpoints:** undefined in source. Treat designs as desktop-only unless a user asks otherwise.
- **Brand reference site:** the original brief mentioned the Fudan School of Journalism site as a color reference. The codebase's chosen `#9B2335 / #B8871E` already matches that family, so we didn't pull additional colors from the site. If the user wants to align further (specific typography, layout patterns), ask them for a screenshot or a URL we can fetch.
