# Sage Academy — Design Tokens Reference (`--sa-*`)

Source of truth: `design-source/sage-academy-2026/Sage Academy Design System.dc.html`
(cross-checked against `HANDOFF.md` and `Sage Lesson Player.dc.html`).
Token sheet: `styles/academy-tokens.css`. Every value is verbatim from the design file.

## Font strategy

| Role | Face | Loaded weights | Where used |
|---|---|---|---|
| Display | **Fraunces** (variable, opsz 9..144, wght 400..800; fallback Georgia, serif) | 520 / 560 / 600 in use | h1/h2, figure titles, the italic "vs" seam — every headline |
| Body | **Hanken Grotesk** (400–700) | 400/600 in use | all prose, node labels, buttons, list rows |
| Data / mono | **JetBrains Mono** (400/500) | 400 in use | uppercase kickers, hex readouts, legends, code, axis labels, stats |

Pattern (documented on the page): *"hierarchy: scale contrast, huge serif over quiet mono kicker."* HANDOFF.md OG spec repeats it: ◆ mark, Fraunces headline, mono kicker, `#0B0B0E` bg, `#3D5AFE` accent.

## Color · surfaces

| Token | Value | Found in | Use |
|---|---|---|---|
| `--sa-bg` | `#0B0B0E` | "Surface ramp" card, `surfaces[0]`; page/body bg | page floor |
| `--sa-surface-1` | `#111115` | `surfaces[1]`; every card `background` | default card/panel |
| `--sa-surface-2` | `#141418` | `surfaces[2]`; diagram node `bg` | raised node / inner panel |
| `--sa-surface-3` | `#1A1A20` | `surfaces[3]` | highest surface tier |

## Color · ink & hairlines

| Token | Value | Found in | Use |
|---|---|---|---|
| `--sa-ink` | `#F2EFE9` | "Ink & hairlines" card, `inks[0]`; root `color` | primary text (warm bone) |
| `--sa-ink-subtle` | `#B6B6C0` | `inks[1]`; specimen body, code default | secondary prose |
| `--sa-ink-muted` | `#9C9CA6` | `inks[2]`; ledes, captions, step body | muted prose |
| `--sa-ink-faint` | `#9598A2` | `inks[3]`; kickers, hex readouts, legends | faintest labels |
| `--sa-rule` | `#1E1E24` | `inks[4]` (named "rule / rule-strong"); all card borders + dividers | default hairline |
| `--sa-edge` | `#2A2A33` | swatch borders, Back-button border, vs-seam ring, `tones[4].border` | component border (used everywhere but unnamed in the token card) |
| `--sa-edge-neutral` | `#3A3A44` | diagram `edges[*].color` | neutral edge stroke |
| `--sa-edge-hover` | `#343440` | Back-button `style-hover` | hover border |
| `--sa-ink-ghost` | `#4A4A54` | `tones[4].hex` "muted · out of scope"; code line numbers; cram polyline; arrows | de-emphasized / out-of-scope ink |
| `--sa-ink-comment` | `#5A5A64` | `code[]` comment lines | code comments |
| `--sa-fill-muted` | `#26262E` | `xpBars` non-current color | muted viz bar fill |

## Color · semantic tones ("color carries meaning, not decoration")

Each tone ships as base / soft (fill) / border, exactly as the `tones[]` array defines:

| Token family | Base | Soft | Border | Meaning (verbatim) |
|---|---|---|---|---|
| `--sa-accent*` | `#3D5AFE` | `rgba(61,90,254,0.10)` | `rgba(61,90,254,0.4)` | focus · suspect · primary action |
| `--sa-success*` | `#18B663` | `rgba(24,182,99,0.10)` | `rgba(24,182,99,0.4)` | truth · mastery · passed proof |
| `--sa-warning*` | `#E0A93E` | `rgba(224,169,62,0.10)` | `rgba(224,169,62,0.4)` | risk · blast radius · pending |
| `--sa-danger*` | `#E5484D` | `rgba(229,72,77,0.10)` | `rgba(229,72,77,0.4)` | error · failed proof |
| `--sa-muted*` | `#4A4A54` | `rgba(255,255,255,0.03)` | `#2A2A33` | out of scope |

Accent extras (all used in the file):

| Token | Value | Found in | Use |
|---|---|---|---|
| `--sa-accent-hover` | `#6E83FF` | "Next step →" `style-hover`; 5× in Lesson Player | primary button hover |
| `--sa-accent-text` | `#8FA0FF` | focus-visible outline; type-section kickers; legend dash; 14× in Lesson Player | accent as text on dark; focus ring |
| `--sa-accent-node-border` / `-bg` | `rgba(61,90,254,0.6)` / `0.08` | "Checkout Service" suspect node | suspect diagram node |
| `--sa-success-node-border` / `-bg` | `rgba(24,182,99,0.6)` / `0.07` | "Charge Ledger" node | source-of-truth node |
| `--sa-warning-node-bg` | `rgba(224,169,62,0.08)` | "retry?" decision node | risk node fill |
| `--sa-selection` | `rgba(61,90,254,0.35)` | `::selection` rule in helmet CSS | text selection |
| `--sa-bg-wash` | two radial-gradients (see CSS) | page wrapper `background-image` | page atmosphere |

No per-topic accents are defined anywhere in the design file — omitted rather than guessed.

## Typography scale (as designed)

| Token group | Value | Found in |
|---|---|---|
| display | `clamp(38px, 5vw, 64px)` · w560 · lh 1.02 · ls −0.025em | header `h1` |
| hero specimen | `clamp(32px, 4.4vw, 56px)` · w600 · lh 1.03 | Type section Fraunces sample |
| h2 | `28px` · w520 · ls −0.02em | every section heading |
| title | `21px` · w560 · ls −0.015em | SageDiagram figure title |
| title-sm | `19px` · w560 · lh 1.25 · ls −0.01em | viz card titles, walkthrough step title |
| body | `16px` / lh 1.6 (root); lede `17px`; specimen `16.5px`; sm `14px`; caption `13.5px` | root div, header p, type card, step body, list rows |
| kicker | mono `10.5px` · uppercase · ls `0.12em` (page-top kicker `12px`/`0.14em`; card headers `0.1em`) | every eyebrow label |
| mono data | `13px` / lh 1.9; labels `11px`; code `12.5px` / lh 1.9 | data specimen, legends/hex readouts, code walkthrough |

## Radii · borders · elevation

- Documented on the page footer: **"radius: 7 / 14 / 24"** → `--sa-radius-sm/md/lg`.
- Observed in use: buttons `8px` (`--sa-radius-btn`), diagram nodes `10px` (`--sa-radius-node`), dots `50%`. (Lesson Player additionally uses 16/22px on large shells — not canonized here.)
- Hairline: `1px solid #1E1E24`; diagram nodes: `1.5px` borders.
- One shadow in the whole file: `0 24px 60px -30px rgba(0,0,0,0.8)` on the VisualFrame (`--sa-shadow-frame`).

## Motion

- Ease (documented): `cubic-bezier(0.16, 1, 0.3, 1)` → `--sa-ease`.
- Durations used: `0.2s` UI transition (step dots), `0.9s` linear infinite `edgeDash` on the live suspect edge.
- Keyframes defined: `edgeDash` (stroke-dashoffset −14), `fadeUp` (opacity 0→1, translateY 8px→0).
- `prefers-reduced-motion: reduce` collapses all animation/transition to `0.01ms !important`.

## Layout

`--sa-shell-max: 1180px`; shell padding `clamp(48px,6vw,88px)` y / `clamp(20px,4vw,48px)` x; `--sa-section-gap: 64px`; card padding `24px` (large specimen `clamp(24px,4vw,44px)`); grid gap `20px`. The design file documents **no abstract spacing scale** — these are the literal layout values it uses; a t-shirt scale was deliberately not invented.

## Do / don't rules documented on the design-system page

- "color carries meaning, not decoration" — semantic tones only; no decorative color.
- "motion: transform + opacity only" (footer of Type card).
- "hierarchy: scale contrast, huge serif over quiet mono kicker."
- SageViz: "honest axes, one accent series, zero chartjunk"; "current week in accent · tabular numerals · no gridlines that lie."
- SageCompare must "work in grayscale" (shape markers ▲/✓ carry meaning, not color alone).
- Focus visibility is designed in: 2px `#8FA0FF` outline, 2px offset, 4px radius.

---

## GAP note — migration map: current `--ac-*` (app/globals.css:1720–1815) ↔ new `--sa-*`

### Direct equivalents (same value or same intent)

| Current `--ac-*` | New `--sa-*` | Note |
|---|---|---|
| `--ac-bg` `#0B0B0E` | `--sa-bg` | identical |
| `--ac-surface` `#111115` | `--sa-surface-1` | identical |
| `--ac-surface-2` `oklch(21% 0.008 285)` | `--sa-surface-2` `#141418` | **value drift** — design file uses hex tier |
| `--ac-ink` `#F2EFE9` | `--sa-ink` | identical |
| `--ac-ink-soft` `oklch(80% 0.012 285)` | `--sa-ink-subtle` `#B6B6C0` | drift; design also adds a 4th step `#9C9CA6` (`--sa-ink-muted`) with no `--ac-` counterpart |
| `--ac-ink-faint` `#9598A2` | `--sa-ink-faint` | identical |
| `--ac-rule` `#1E1E24` | `--sa-rule` | identical |
| `--ac-rule-strong` `oklch(33% 0.009 285)` | `--sa-edge` `#2A2A33` | drift — design uses `#2A2A33` |
| `--ac-accent` `#3D5AFE` | `--sa-accent` | identical |
| `--ac-accent-text` `oklch(76% 0.14 264)` | `--sa-accent-text` `#8FA0FF` | drift — design pins the hex |
| `--ac-accent-wash` `rgb(61 90 254 / 0.1)` | `--sa-accent-soft` | identical value |
| `--ac-mastery` `#18B663` | `--sa-success` | identical value, renamed |
| `--ac-pending` `#E0A93E` | `--sa-warning` | identical value, renamed |
| `--ac-danger` `#E5484D` | `--sa-danger` | identical |
| `--ac-locked` `oklch(55% 0.01 285)` | `--sa-muted` `#4A4A54` | same role, design pins hex |
| `--ac-font-display/body/mono` | `--sa-font-display/body/mono` | same faces; `--ac-` routes through next/font vars — **keep that wiring**, point fallbacks at `--sa-` stacks |
| `--ac-track-display` `-0.022em` | `--sa-text-display-tracking` `-0.025em` | drift |
| `--ac-track-label` `0.12em` | `--sa-text-kicker-tracking` | identical |
| `--ac-leading-tight` `1.06` | `--sa-text-display-leading` `1.02` | drift |
| `--ac-leading-body` `1.62` | `--sa-text-body-leading` `1.6` | drift |
| `--ac-radius-lg` `14px` | `--sa-radius-md` | same value, different tier name (**collision hazard when migrating**) |
| `--ac-radius` `8px` | `--sa-radius-btn` | design's default chip radius is 7px, buttons 8px |
| `--ac-radius-pill` `999px` | `--sa-radius-pill` `50%` | same intent |
| `--ac-ease` / `--ac-ease-out-expo` | `--sa-ease` | identical curve |
| `--ac-elev-3` (large soft) | `--sa-shadow-frame` | closest analog; values differ |

### `--ac-*` tokens with NO counterpart in the new system → **keep**

- Fluid type scale `--ac-step--1 … --ac-step-6` (design specifies fixed/clamp sizes per role, not a modular scale) — keep, or re-point clamp endpoints to `--sa-text-*` sizes.
- Spacing scale `--ac-space-3xs…2xl`, `--ac-space`, `--ac-gutter` — design documents no spacing scale; keep.
- `--ac-maxw-prose` (68ch), `--ac-maxw-shell` (1320px vs design's 1180px shell — decide; design page uses 1180px).
- `--ac-overlay`, `--ac-accent-strong`, `--ac-radius-sm` (4px), `--ac-elev-1/2`, `--ac-shadow`, `--ac-dur-fast/dur/dur-slow`, `--ac-ease-reveal`, `--ac-grain-opacity`, `--ac-vignette`, `--ac-leading-snug`, `--ac-track-body` — no design-file counterpart; keep.
- Legacy local aliases defined in module CSS (`--ac-line`, `--ac-line-strong`, `--ac-mono`, `--ac-sans`, `--ac-display`, `--ac-g1/g2/g3`, `--ac-accent-ink`, `--ac-green`, `--ac-gold`, `--ac-muted`, `--ac-faint`, `--ac-pad` in `app/learn/*.module.css`, `components/academy/{landing,course}/*.module.css`) — pre-consolidation duplicates; migrate to `--sa-*` or the canonical `--ac-*` opportunistically.

### New `--sa-*` tokens with NO current `--ac-*` equivalent

- `--sa-surface-3` (#1A1A20) — 4-tier surface ramp vs current 3+overlay.
- `--sa-ink-muted` (#9C9CA6) — 4-step ink ramp vs current 3.
- Per-tone **soft + border pairs** for success/warning/danger/muted (current system only has `--ac-accent-wash`).
- `--sa-accent-hover` (#6E83FF) — designed hover fill; current system has no hover token.
- Diagram node tokens (`--sa-*-node-border/-bg`), `--sa-edge-neutral`, `--sa-ink-comment`, `--sa-fill-muted` — the SageDiagram/Code/Viz vocabulary.
- `--sa-selection`, `--sa-bg-wash`, `--sa-focus-outline/offset/radius`, `--sa-radius-node` (10px), `--sa-radius-lg` (24px), `--sa-dur-dash`, `--sa-shell-*`, `--sa-section-gap`, `--sa-card-pad*`.
