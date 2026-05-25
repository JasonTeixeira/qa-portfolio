# Cross-Browser QA Notes — Sage Ideas Portfolio

_Last updated: 2026-05-24 · feature/phases-6-12-polish_

Field notes from the Phase 6–12 polish pass. Records the modern-CSS features we lean on, where they degrade, and the fallbacks already wired into the codebase.

---

## Support Matrix (target browsers)

| Browser | Min version | Notes |
| --- | --- | --- |
| Chrome (desktop + Android) | 120+ | Primary dev target. All features supported. |
| Edge (Chromium) | 120+ | Identical to Chrome. |
| Safari (macOS) | 17+ | `view-timeline` shipped 17.4. `@starting-style` shipped 17.5. |
| Safari (iOS) | 17+ | Same as desktop. Touch events route via PointerEvent. |
| Firefox (desktop + Android) | 121+ | `view-timeline` behind flag until 132. Fallback path covers it. |

We do **not** test or guarantee IE11 / legacy Edge / Chrome < 120 / Safari < 17 / Firefox < 121. These represent <0.5% of organic traffic per current PostHog data.

---

## Feature Gotchas

### `animation-timeline: view()` (scroll-driven `sage-rise`)
- **Status:** Chrome 115+, Edge 115+, Safari 17.4+. Firefox behind `layout.css.scroll-driven-animations.enabled` flag until 132.
- **Fallback:** Wrapped in `@supports (animation-timeline: view())`. When unsupported, the element keeps the on-mount `sage-rise-fallback` keyframes that play once with the `IntersectionObserver`-free CSS path.
- **Where used:** `globals.css` `sage-rise` utility. Applied on hero copy, project-card grids, evidence strips.

### `@starting-style` (entry transitions on hero terminal)
- **Status:** Chrome 117+, Safari 17.5+. Firefox 129+.
- **Fallback:** Style block is additive — without support, the element simply renders at its final state, no flash.

### `prefers-reduced-motion: reduce`
- **Universal support.** Global override in `styles/globals.css` zeroes `animation`/`transition` on `*` when set. Verified on macOS (System Settings → Accessibility → Display → Reduce motion) and iOS (Settings → Accessibility → Motion).
- **Components that explicitly check:** `MagneticButton`, `metric-counter`, `hero-motion-layer`.

### `backdrop-filter: blur()` (nav + sticky CTA bar)
- **Status:** All modern browsers. Safari needs `-webkit-backdrop-filter` prefix — Tailwind 4 emits it automatically via `backdrop-blur` utility.
- **Verified:** Chrome/Edge/Safari desktop, iOS Safari 17. Android Chrome can show banding on cheap GPUs but it is acceptable.

### `color-mix()` (accent tint overlays)
- **Status:** Chrome 111+, Safari 16.4+, Firefox 113+. Universally available in our target matrix.
- Used in glow-card hover wash and pricing card emphasis. Fallback (when missing) is the bare brand hex — no visual break.

### `aspect-ratio`
- Universal in our matrix. Heavy use in artifact gallery + project-card screens.

### View Transitions API (`document.startViewTransition`)
- **Not relied on.** `PageTransition` is implemented via Framer Motion, not native view transitions, so behavior is consistent across browsers.

### Container Queries (`@container`)
- **Status:** Chrome 105+, Safari 16+, Firefox 110+. Used sparingly inside `evidence-strip` and `logo-strip` for fluid logo sizing.

### `:focus-visible` ring
- Universal. Global `*:focus-visible { outline: 2px solid #0ED3CF; outline-offset: 2px }` set in `globals.css`. Verified keyboard-tab path across nav → main → footer on all browsers.

---

## Device-Specific Notes

### iOS Safari (17.x)
- **Bounce scroll** on `<html>` can reveal the page background past the footer. Confirmed acceptable — `#09090B` continues, no white flash.
- **100vh trap:** Anywhere we set min-height for hero, we use `100svh` (small viewport height) with `100vh` fallback. Confirmed no jump on URL-bar collapse.
- **Tap highlight:** Disabled via `-webkit-tap-highlight-color: transparent` in `globals.css`. Magnetic button keeps focus ring intact.
- **PointerEvent on touch:** `MagneticButton` uses `pointermove` — fires on touch but resets correctly via `pointerleave` because iOS Safari emits `pointerleave` at touch end. Confirmed no stuck-translate state.

### Android Chrome (124+)
- **Address-bar resize** triggers a layout reflow on hero. Mitigated by using `svh` units and `position: sticky` instead of `fixed` on nav.
- **`backdrop-filter` perf:** Acceptable on Pixel 6+, slight jank on older mid-range. Acceptable trade-off.

### Desktop Safari (17.x)
- **Font rendering** of Plus Jakarta Sans is slightly heavier than Chrome. Acceptable — does not break the design grid.
- **Magnetic button** verified smooth at 60fps on M1/M2/M3 Macs.

### Desktop Firefox (132+)
- **Scrollbar gutter:** We set `scrollbar-gutter: stable` so layout does not shift when modals open. Verified.
- `view-timeline` works natively as of FF 132. For earlier versions, the fallback keyframes path takes over — visually equivalent.

### Desktop Edge
- Identical to Chrome. No Edge-specific issues observed.

---

## Known Acceptable Differences

1. **Magnetic button on touch devices** — pull effect is functional but less prominent because hover state is briefly held. Acceptable; the gesture still reads correctly.
2. **Backdrop-filter banding** on older Android GPUs — purely cosmetic, content remains legible.
3. **Code samples (Shiki)** render server-side, so theme is fixed `github-dark-default` across all browsers — by design, no client divergence.
4. **OG image rendering** runs on the Edge runtime via `@vercel/og`. Generated PNGs render identically across all consumer surfaces (Slack, X, LinkedIn, iMessage, Discord) per Phase 12 verification.

---

## Manual Test Routes

The following routes were spot-checked across all five browsers during Phase 12:

- `/` (home)
- `/work` (grid) and `/work/nexural`, `/work/jobpoise`, `/work/trayd`
- `/services`, `/services/ai-development`, `/services/technical-consulting`
- `/pricing` (quote calculator)
- `/contact`, `/book`, `/founder`, `/studio`
- `/blog`, `/blog/[any-post]`
- `/404` and `/500` (terminal frames)

No regressions found that fall outside the "known acceptable" list above.
