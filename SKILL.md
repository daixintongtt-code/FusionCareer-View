---
name: fusioncareer-design
description: Use this skill to generate well-branded interfaces and assets for 复新生涯 FusionCareer — Fudan University School of Journalism's career platform. Contains essential design guidelines, colors, type, fonts, assets, and a UI-kit component library for prototyping student- and admin-side screens.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.

## Quick reference

- **Tokens:** `colors_and_type.css` — all colors, type scale, radii, shadows, layout.
- **Brand:** 复旦红 `#9B2335` (primary) + 金 `#B8871E` (admin / "recommended"). Warm cream page `#F5F3EF`. Warm-grey ink scale (no pure black).
- **Type:** Noto Serif SC (display, brand, stat numerals) + Noto Sans SC (body, UI). Google Fonts CDN.
- **Icons:** Tabler Icons via webfont CDN — `<i class="ti ti-name" />`. No emoji, no unicode shortcuts.
- **Voice:** Simplified Chinese; second-person 「你」/「您」 for the user; warm-professional school-advisor tone; no marketing fluff.
- **Components:** see `preview/*.html` for visual reference + `ui_kits/student/` for the live **Vue 3 + Vite** project (every screen from `brief.md`, runnable with `npm install && npm run dev`).

## When generating production code
Copy `colors_and_type.css` directly. Mirror the class vocabulary in `ui_kits/student/styles.css` (`.btn`, `.btn-primary`, `.card`, `.badge`, `.form-control`, `.wf-bar`, `.step-trail`, etc.) — these match the names used in the live `FusionCareer-View` codebase, so handoff is one-to-one.

## When designing throwaway mocks
Start by reading `README.md` end-to-end, then load `colors_and_type.css` (or `ui_kits/student/src/assets/css/main.css` — they're identical) in your HTML and you have the whole vocabulary available. Or `cd ui_kits/student && npm run dev` and use the live Vue project as a sandbox.
