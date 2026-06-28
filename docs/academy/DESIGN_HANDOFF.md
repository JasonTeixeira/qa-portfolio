# Sage Academy — Front-End Design Handoff

> Everything an external designer/AI needs to design the structure + front-end of Sage Academy to a high-end,
> production-grade standard. Read this top to bottom before touching anything.

## 0. Repo & how to run
- **Repo:** `https://github.com/JasonTeixeira/sageideas.dev` · branch `feat/community-rag-content-ops-cleanup`
- **Stack:** Next.js 16 (App Router, RSC) · React 19 · TypeScript 5.7 · **CSS Modules** (NOT Tailwind) · Supabase (Postgres/auth) · Pyodide (in-browser Python labs). Package name: `qa-portfolio`.
- **Run:** `npm install` → `npm run dev` (use a non-3000 port, e.g. `next dev -p 3050`) OR prod: `npx next build && npx next start -p 3060`. Needs `.env.local` (Supabase URL/keys, already present locally).
- **See it logged-in:** `/login?audience=academy` → email `client2+test@sageideas.org` (a seeded "Demo Learner" with full data). Then `/academy/dashboard`.
- **Seed content:** `node --env-file=.env.local --import tsx scripts/academy/seed-programming-fundamentals.ts --apply` and `…/seed-first-steps.ts --apply` (idempotent).

## 1. The locked visual direction — DO NOT redirect
**Editorial dark-luxury.** Near-black layered surfaces with real depth + hairline rules; a **serif display** (Fraunces) paired with a **grotesk body** (Hanken Grotesk) + **mono** for code/data (JetBrains Mono); ONE disciplined accent used semantically; elevation/overlap/soft-shadow + subtle grain; slow compositor-only motion. "A premium dev magazine that happens to teach." Evolve this — don't reinvent it.

## 2. Non-negotiable rules (these are why the product looks pro, not AI-made)
1. **NO emoji. NO decorative unicode glyphs** (no 🔥 ◆ ◇ ✦ ⬡ ✓ ✗ ★ … as icons/bullets). The system was fully purged — keep it at zero. Use the icon system (§4). Allowed non-ASCII: the middle-dot `·` separator, `⌘`/`↵` kbd hints, em/en dashes, smart quotes, math operators (`≥ − ×`) in prose.
2. **Use the design tokens — never hardcode** palette, fonts, spacing, radius, elevation, or motion. All live as `--ac-*` CSS custom properties (§3).
3. **Accessibility AA, always.** Text ≥ 4.5:1 (never dim text via `opacity`). Keyboard-operable. `prefers-reduced-motion` honored. Semantic HTML. Icons are `aria-hidden` → pair with a text label or `aria-label`.
4. **Motion is compositor-only** — `transform` / `opacity` / `clip-path` only. Never animate width/height/top/left/margin.
5. **CSS Modules**, co-located per component. Match the file organization already in `components/academy/<feature>/`.
6. **Don't break the server/client boundary** (RSC), the Supabase data flow, or the **interactive lab logic** (`LabRunner.tsx` runs Pyodide + a server-verified check — touch presentation only).
7. **Honest data only** — no fake numbers/states. Progress, scores, badges are server-derived.

## 3. The token system (the single source of truth)
**File:** `app/globals.css` — the `:root` block (~line 1700+, search `--ac-bg`). Key groups:
- **Surface ramp** (oklch near-black): `--ac-bg` → `--ac-surface` → `--ac-surface-2` → `--ac-overlay` (~2% L per layer).
- **Ink ramp** (AA-authored): `--ac-ink` (~14:1) / `--ac-ink-soft` (~7.5:1) / `--ac-ink-faint` (~4.6:1). Rules: `--ac-rule` / `--ac-rule-strong`.
- **Accent (one hue, three roles):** `--ac-accent` (non-text: rings/ticks/focus) · `--ac-accent-strong` (AA fills, white-on-accent) · `--ac-accent-text` (accent AS text, AA) · `--ac-accent-wash`. Semantic state tokens: mastery / pending / locked / danger.
- **Type:** `--ac-font-display` (Fraunces serif) · `--ac-font-body` (Hanken Grotesk) · `--ac-font-mono` (JetBrains Mono); fluid clamp scale `--ac-step--1 … --ac-step-6`; tracking + leading tokens.
- **Space / radius / elevation** (`--ac-elev-1/2/3`, layered soft shadows) / **motion** (`--ac-dur-*`, `--ac-ease-out-expo`, `--ac-ease-reveal`) / **grain** (`.ac-grain` utility).

## 4. The icon system (replaces ALL glyphs)
**File:** `components/academy/ui/Icon.tsx`. Usage: `import { Icon } from '@/components/academy/ui/Icon'` → `<Icon name="arrow-right" size={16} />` (currentColor, aria-hidden). Names: `check, x, arrow-right, arrow-left, arrow-up-right, chevron-right/-down/-up, flame, bolt, target, circle, star, sparkle, refresh, search, play, plus, lock, trophy, book, compass, users, bell, bell-off, alert, award, shield, swap, dot`. Need a new icon? Add a 24×24 / 1.6-stroke path to this file — never reach for a glyph.

## 5. The surfaces to design (each = an RSC page + a client component + a CSS module)
| Surface | Page (RSC) | Component(s) + module |
|---|---|---|
| **Dashboard** (post-login home) | `app/academy/dashboard/page.tsx` | `components/academy/dashboard/{Dashboard,JourneyHero,NextUp}.tsx` + `dashboard.module.css`; `quests/QuestPanel`, `triggers/TriggerBanner`, `rewards/EarnMoment` |
| **Catalog** | `app/academy/catalog/page.tsx` | `components/academy/catalog/{CatalogClient,ContentMap}.tsx` + `catalog.module.css` |
| **Course overview** | `app/academy/course/[slug]/page.tsx` | `components/academy/course/CourseOverview.tsx` |
| **Lesson player** | `app/academy/learn/[course]/[lesson]/page.tsx` | `components/academy/lesson/{LessonPlayer,SprintBlocks}.tsx` + `lesson.module.css`, `sprint.module.css` — renders the 20 block types |
| **Lab** (interactive) | `app/academy/learn/[course]/[lesson]/lab/page.tsx` | `components/academy/lab/LabRunner.tsx` + `lab.module.css` — **logic locked, restyle only** |
| **Landing** | `app/academy/page.tsx` | `components/academy/landing/AcademyLanding.tsx` |
| **Shell / nav** | (layout) | `components/academy/academy-shell.tsx`, `components/academy/shell/*` |
| Secondary | — | `leagues/`, `review/`, `profile/`, `badges/`, `onboarding/`, `tutor/`, `resources/` |

**The lesson content model** (what the lesson player must render): `data/academy/sample-course.ts` — the `LessonBlock` union (20 types: sprint-contract, mission, context, pretest, concept, worked-example, code, callout, lab, debug, quiz, verification, teachback, transfer, spaced-review, calibration, tradeoff, video, prose, unlock-gate). **Designing each block-type with character — distinctive but coherent — is the single biggest visual lever.**

## 6. The standard / definition of done (gates the work must pass)
- Hierarchy via scale-contrast · intentional rhythm · depth/layering · the real serif×grotesk pairing · semantic color · designed hover/focus/active states · editorial composition · texture/atmosphere · motion that clarifies.
- `npx tsc --noEmit` = 0 · `npx next build` = 0 · **a11y 0 serious/critical** (axe) at 320/768/1024/1440 · Core Web Vitals (LCP<2.5s, CLS<0.1) · reduced-motion correct · **zero emoji** scan clean.
- Reference for the bar + the loop: `docs/academy/DESIGN_OS_PROGRAM.md` (+ `DESIGN_SYSTEM.md`, `DESIGN_OS_SCORECARD.md`). Course/lesson structure: `docs/academy/COURSE_TEMPLATE.md`.

## 7. What's already done (don't redo)
Token foundation (§3), the icon system (§4), system-wide emoji purge (zero), font standardization, a simplified single nav, a rebuilt dumb-proof catalog, and an editorial lesson header. **What remains:** the full editorial treatment of all 20 lesson block-types, the lab surface, the course overview + landing, and a design-panel ≥95 pass on each surface at every breakpoint.
