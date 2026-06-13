# Engineering Spec — Program C: Premium Design & Interactive Showcase

**Status:** Draft
**Depends on:** Phase 0 tokens/motion (shipped), Program A CaseStudy schema (A2)
**Stack:** Next.js 16 / Tailwind 4 / Framer Motion
**Last updated:** 2026-06-13

---

## 1. Objective & 99+ Bar

**Goal:** Turn `/work` into deep, interactive case studies that stand alone as proof in a sales call, and bring every editorial surface (hero, work, pricing, services, founder, studio) to institutional quality by applying the unified token + motion system with discipline. Every interactive element does real work. No decorative gimmicks.

### The 10 Premium Qualities (from `rules/ecc/web/design-quality.md`)

Each meaningful surface must demonstrate **at least 4**. The checklist is applied per-surface in Deliverable 8 (design-rubric doc). The qualities:

1. Clear hierarchy through scale contrast
2. Intentional rhythm in spacing (not uniform padding everywhere)
3. Depth or layering through overlap, shadows, surfaces, or motion
4. Typography with character and a real pairing strategy
5. Color used semantically, not just decoratively
6. Hover, focus, and active states that feel designed
7. Grid-breaking editorial or bento composition where appropriate
8. Texture, grain, or atmosphere where it fits
9. Motion that clarifies flow instead of distracting from it
10. Data visualization treated as part of the design system

### Viz Standard (non-negotiable)

All data-viz components in this program render **only REAL numbers from `data/work/case-studies.ts`**. No placeholder bars. No animated counters on invented stats. No decorative charts. If a real number is not available for a project, the component renders `null` — not a fake value.

Institutional-grade means:
- Axis labels are honest (units stated, baseline shown)
- Color encodes meaning, not decoration
- Charts are legible at 320px viewport
- All numbers match `caseStudies[*].metrics` exactly

---

## 2. Deliverables

### D1 — Deep Case-Study Page Redesign

**What:** Redesign `app/work/[slug]/page.tsx` and `app/work/[slug]/case-study-content.tsx` to use a new component-driven template under `components/work/`. The existing layout (sticky sidebar + flat text blocks) is replaced with a cinematic scrolling structure: full-width hero → metrics strip → problem narrative → interactive architecture diagram → real-metrics viz panel → decisions/trade-offs → build-log timeline → live-links strip → related work CTA.

**Files:**
- `app/work/[slug]/page.tsx` — server component wrapper, unchanged metadata + JSON-LD (already correct); update `CaseStudyContent` import
- `app/work/[slug]/case-study-content.tsx` — rewire to compose `components/work/*` sections
- `components/work/cs-hero.tsx` — full-width hero with poster title, category badge, kicker, scroll indicator
- `components/work/cs-metrics-strip.tsx` — horizontal strip of all `metrics[]`; uses `MetricBar` from `components/viz/`
- `components/work/cs-problem.tsx` — editorial 2-col problem block with pull-quote slot
- `components/work/cs-architecture.tsx` — host for existing `CaseStudyArchitecture` diagrams (already in `components/diagrams/`); adds scroll-driven reveal
- `components/work/cs-metrics-viz.tsx` — rendered viz panel using `components/viz/*`; receives real `metrics[]` data
- `components/work/cs-decisions.tsx` — trade-offs / "almost happened" blocks (consumes `CaseExtras.almostHappened`)
- `components/work/cs-buildlog.tsx` — vertical timeline of shipped milestones; data source: new `buildLog` field on `CaseStudy` (see D3)
- `components/work/cs-live-links.tsx` — live demo / repo / lab links; uses `ctaPrimary`, `ctaSecondary`, `relatedLab`

**Interface/contract:**

```ts
// All section components share this prop signature:
interface CaseStudySectionProps {
  study: CaseStudy     // from data/work/case-studies.ts
  extras?: CaseExtras  // from data/work/case-extras.ts
}
```

The server component at `app/work/[slug]/page.tsx` already resolves both `study` and `extras`; just thread them through.

**Acceptance criteria:**
- Each of the 4 primary case studies (nexural, alphastream, jobpoise, trayd) renders all sections without any `undefined` crashes
- Architecture diagram (`CaseStudyArchitecture`) renders for every slug that has a diagram component in `components/diagrams/`
- No section renders fake/placeholder data — missing data fields render a graceful null
- `MetricCounter` (existing `components/metric-counter.tsx`) reused for the metrics strip; no duplicate counter logic
- All sections accessible by keyboard; scroll-triggered animations respect `prefers-reduced-motion` via the existing `MotionConfig` wrapper in `components/motion/index.tsx`
- Build: `pnpm build` passes; 0 TypeScript errors

**Tests:**
- Visual regression: `tests/visual/work-slug.spec.ts` — screenshots at 320/768/1024/1440 for `/work/nexural`, `/work/alphastream`
- Axe a11y scan on both slugs: 0 critical violations
- Reduced-motion test: extend `phase0.spec.ts` pattern to verify architecture diagram section has no residual transforms under `prefers-reduced-motion: reduce`

---

### D2 — Institutional Data-Viz Component Set

**What:** A `components/viz/` directory of composable, typed, SSR-safe chart primitives that render real project metrics. No third-party charting library (no recharts, no d3 direct — use SVG math inline or minimal SVG utilities). Every component is designed to work without JS (static SVG output) and progressively enhance with Framer Motion entry animations.

**Files:**
- `components/viz/metric-bar.tsx` — horizontal proportional bar for a single metric; label + value + bar; suitable for "185 tables / 69 endpoints" comparison
- `components/viz/metric-grid.tsx` — 2×N or 4-col grid of `MetricBar`; wraps the full `metrics[]` array
- `components/viz/timeline-bar.tsx` — compact Gantt-style horizontal span (for build-log phase durations)
- `components/viz/stat-card.tsx` — single large number with trend arrow (up/down/neutral); wraps `MetricCounter`
- `components/viz/index.ts` — barrel export

**Interface/contract:**

```ts
// metric-bar.tsx
export interface MetricBarProps {
  label: string
  value: string          // as stored in CaseStudy.metrics[n].value — display string
  /** 0–1 fill proportion. Caller computes from domain, never inferred from string. */
  proportion?: number
  accentColor?: string   // defaults to var(--sage-brand)
  className?: string
}

// metric-grid.tsx
export interface MetricGridProps {
  metrics: { label: string; value: string }[]  // CaseStudy['metrics']
  /** Optional per-label proportion map. Keys are metric labels. Omit to render bars without fill. */
  proportions?: Record<string, number>
  accentColor?: string
}

// stat-card.tsx
export interface StatCardProps {
  label: string
  value: string
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string    // e.g. "since launch"
  accentColor?: string
}
```

**Acceptance criteria:**
- All components render correct values from `caseStudies` data — verified by unit test assertions against known values
- No component ever renders `0` or a placeholder when the value is missing — it renders `null`
- `MetricBar` uses `--sage-brand` / `--sage-coral` / `--sage-lime` / `--sage-magenta` tokens from `app/globals.css` (never hardcoded hex inside the component)
- `MetricGrid` renders at `320px` without horizontal overflow (verified by visual regression)
- Entry animations use `slideUp` from `lib/motion/presets.ts` — no new easing curves introduced
- All components have `aria-label` or `role="img"` with descriptive text so screen readers get the data, not silence

**Tests:**
- Unit: `tests/unit/viz.test.ts` — render each component with real `caseStudies[0].metrics`; assert value strings appear in output
- Visual regression: `tests/visual/viz.spec.ts` — MetricGrid @ 320 and 1440 for nexural and alphastream data
- Axe: automated scan on each rendered component

---

### D3 — Extended CaseStudy Data Model

**What:** Extend `data/work/case-studies.ts` with new fields needed by the deep template. No new data file; all additions are backward-compatible (all new fields optional).

**Files:**
- `data/work/case-studies.ts` — add fields to `CaseStudy` type and populate for nexural, alphastream, jobpoise, trayd

**Interface/contract — new fields:**

```ts
export type CaseStudy = {
  // ... existing fields unchanged ...

  /**
   * Ordered log of shipped milestones for the build-log timeline.
   * Each entry is a verifiable shipped event — not aspirational.
   */
  buildLog?: {
    date: string        // ISO 8601 date or month string, e.g. "2025-11"
    label: string       // short label: "Schema locked (185 tables)"
    detail?: string     // one-sentence elaboration
    kind: 'foundation' | 'feature' | 'infra' | 'test' | 'release'
  }[]

  /**
   * Architecture diagram variant key.
   * Maps to the named export in components/diagrams/index.ts.
   * If absent, no diagram section renders.
   */
  architectureDiagramKey?: string

  /**
   * Live demo URL — embedded as an iframe or linked; presence drives cs-live-links.tsx.
   */
  demoUrl?: string

  /**
   * Real repo URL for "view source" CTA.
   */
  repoUrl?: string
}
```

**Acceptance criteria:**
- All existing case studies retain all existing fields unchanged
- nexural, alphastream, jobpoise, trayd each have at least 4 `buildLog` entries with truthful dates matching the real development timeline
- `architectureDiagramKey` set for all 4 primary studies; values match exports in `components/diagrams/index.ts`
- TypeScript strict: 0 errors

**[YOU] Dependency:** You must verify the build log dates/labels are accurate before shipping. The template renders what you write — fabricated milestone dates contradict the "receipts, not promises" brand.

---

### D4 — Interactive Architecture Diagrams (Scroll-Driven Reveal)

**What:** Upgrade the existing architecture diagram components in `components/diagrams/` to support a scroll-driven progressive reveal. The diagram components already exist (e.g. `nexural-architecture.tsx`, `alphastream-architecture.tsx`). This deliverable wires them to a scroll context so components highlight in sequence as the user reads the case study.

**Files:**
- `components/work/cs-architecture.tsx` — host wrapper; uses `useInView` from framer-motion to trigger reveal sequence
- `components/diagrams/primitives.tsx` — add `highlighted` prop to existing `Node` and `Edge` primitives to accept a boolean that drives stroke/fill animation
- Each named diagram (`nexural-architecture.tsx`, `alphastream-architecture.tsx`, etc.) — accept `highlightedNodes?: string[]` prop to pass down

**Interface/contract:**

```ts
// cs-architecture.tsx
export interface CsArchitectureProps {
  diagramKey: string    // matches architectureDiagramKey on CaseStudy
  caption?: string
}

// primitives.tsx — additive prop (no breaking change)
export interface NodeProps {
  // ... existing props ...
  highlighted?: boolean  // when true: accent border + subtle bloom glow
}
```

**Acceptance criteria:**
- Diagram reveal sequence fires once on scroll-into-view, not on every scroll event
- `prefers-reduced-motion: reduce` skips the sequence — all nodes render fully visible immediately
- Diagram is legible at 320px (horizontal scroll within a constrained container is acceptable; full-width overflow is not)
- The existing `CaseStudyArchitecture` export in `components/diagrams/index.ts` continues to work unchanged for backward compatibility
- No new SVG libraries introduced

**Tests:**
- Visual regression: diagram section at 768 and 1440 for nexural slug
- Reduced-motion test: verify all nodes visible immediately under `prefers-reduced-motion`

---

### D5 — Build-Log Timeline Component

**What:** A vertically stacked timeline of shipped milestones, rendered per case study from the new `buildLog` field. It distinguishes milestone kinds with the brand color system (foundation=teal, feature=coral, infra=lime, test=magenta, release=white).

**Files:**
- `components/work/cs-buildlog.tsx`

**Interface/contract:**

```ts
export interface CsBuildlogProps {
  entries: NonNullable<CaseStudy['buildLog']>
  projectAccent?: string   // defaults to var(--sage-brand)
}
```

**Acceptance criteria:**
- Entries render in chronological order
- Color coding uses the 4 brand tokens from `app/globals.css`, not hardcoded hex
- Entry animation: `slideUp` stagger from `lib/motion/presets.ts`; reduced-motion collapses to instant render
- The component renders `null` if `entries` is empty (no empty state chrome)
- Accessible: each entry has a visually hidden date for screen readers even if the date is displayed visually

**Tests:**
- Unit: render with nexural `buildLog`; assert each entry label appears in DOM
- Visual: at 320 and 1440

---

### D6 — Editorial Polish Pass — All Named Surfaces

**What:** A targeted audit-and-fix of 6 surfaces: `/` hero section, `/work` grid, `/pricing`, `/services/[slug]`, `/founder`, `/studio`. Each surface is checked against the 4+ premium quality rubric. Changes are surgical edits to existing components, not rewrites.

**Files (audit order):**
- `app/page.tsx` + hero components — hierarchy, rhythm, depth
- `app/work/work-grid.tsx` + `components/v0-case-study-grid.tsx` — category filter state preserved; add hover/focus states per rubric
- `app/pricing/pricing-content.tsx` + `components/v0-pricing/*.tsx` — designed hover/active states on tier cards; spacing rhythm check
- `app/services/[slug]/flagship-page-content.tsx` + tier templates — color semantic check; CTA state design
- `app/founder/page.tsx` — typography pairing check; depth/layering
- `app/studio/page.tsx` — same

**Acceptance criteria per surface:**
- Each surface scores 4+ of the 10 premium qualities (documented in D8 checklist)
- No default Tailwind card grid patterns without differentiation remain
- All hover/focus/active states are explicitly defined (no browser defaults as the final state)
- Spacing uses `var(--space-section)` and `var(--space-block)` from `globals.css`; no one-off px values for major rhythm decisions

**Tests:**
- Visual regression: all 6 surfaces at 320/768/1024/1440 (added to `tests/visual/program-c.spec.ts`)
- Design rubric sign-off in D8 checklist (per-surface rows)

---

### D7 — Functional Interactivity Elevation

**What:** Three functional upgrades that do real work for the visitor.

**D7a — SEO Audit Tool Promo Placement**
- The SEO audit tool (already shipped at Phase 1) is elevated as a hero lead magnet on `/` and `/services/[slug]` surfaces where relevant
- Files: `app/page.tsx` — add tool call-to-action block above the fold; `app/services/services-content.tsx` — add audit prompt in the services entry surface
- No new code; it is placement + copy that makes the tool discoverable
- Acceptance: tool CTA visible without scrolling at 1440px; has a focus ring; tracked with existing PostHog event `lead_magnet_start`

**D7b — Scope/ROI Calculator Elevation**
- `components/calculators/` already has multiple calculators (`sdr-calculator.tsx`, `rag-calculator.tsx`, etc.) and a `calculator-shell.tsx`
- Elevation means: surface the most relevant calculator on the matching service page, add a clear entry point from the pricing page, and ensure keyboard-navigation works end-to-end
- Files: `app/pricing/pricing-content.tsx` — add calculator entry block; `app/services/[slug]/tier-page-content.tsx` — wire domain-matched calculator
- Acceptance: Tab + Enter navigates all calculator inputs; visible focus rings; result displays in the same scrolled position (no page jump)

**D7c — Command Palette Extension**
- `components/command-palette.tsx` already exists
- Add groups: "Case Studies" (links to all slugs), "Services" (links to service pages), "Tools" (links to calculators + audit tool)
- Files: `components/command-palette.tsx`
- Acceptance: `Cmd+K` / `Ctrl+K` opens the palette; case studies group shows correct titles from `caseStudies` array; keyboard navigation (arrow keys, Enter, Escape) works; focus trap is correct

**Tests:**
- E2E: `tests/e2e/command-palette.spec.ts` — open palette, search "nexural", press Enter, verify navigation to `/work/nexural`
- Unit: command palette groups populated correctly from `caseStudies` data
- Keyboard: manual pass documented in D8 checklist

---

### D8 — Design-QA Rubric Document + Per-Surface Checklist

**What:** A living document at `docs/design/quality-rubric.md` that codifies the 10 premium quality dimensions into a checkable grid, applied to each surface in Program C.

**Files:**
- `docs/design/quality-rubric.md`

**Content:** The document contains:
1. The 10 quality dimensions (from `rules/ecc/web/design-quality.md`) with concrete pass criteria per dimension
2. A per-surface checklist table (rows: surfaces; cols: the 4+ qualities that must pass; cell: PASS / FAIL / N/A)
3. A banned-patterns checklist (from design-quality rules) — each banned pattern checked as absent or fixed
4. Lighthouse score target: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90 per surface

**Acceptance criteria:**
- Document exists and is filled in before any Deliverable is marked done
- Every surface row shows 4+ PASS cells
- No FAIL cells remain at merge

---

### D9 — Accessibility Deliverables

**What:** Systematic a11y pass over all new and changed surfaces.

**Files:**
- `tests/a11y/program-c.spec.ts` — axe-playwright scans per route
- In-component changes to focus management, contrast, and aria attributes as needed

**Scope:**
- Focus rings: all interactive elements have visible focus rings using `var(--sage-brand)` per the existing `outline-ring/50` base layer — verify new components don't suppress them
- Contrast: all text on `--sage-surface` background passes WCAG AA (4.5:1 for small text, 3:1 for large). The existing `--sage-ink-subtle: #B8B0AB` token was already lifted in Phase 0 for this reason; new components must use it or `--sage-ink-muted` for secondary text, never `--sage-ink-faint: #78716C` at small sizes
- Keyboard nav: all case study sections, diagrams, and calculators navigable by keyboard; no keyboard traps outside dialogs
- Reduced motion: all new Framer Motion animations gated by the existing `MotionConfig` in `components/motion/index.tsx`
- Screen reader text: architecture diagrams and viz components have `aria-label` or `<figcaption>` with the real data values

**Acceptance criteria:**
- `pnpm playwright test tests/a11y/` passes with 0 critical/serious violations on `/work/nexural`, `/work/alphastream`, `/`, `/pricing`, `/services`
- Manual keyboard pass: Tab through the full case-study page top-to-bottom; no focus loss; interactive elements reachable
- Contrast audit: run `axe` with `wcag2aa` ruleset; all passes

**Tests:**
- `tests/a11y/program-c.spec.ts` using `@axe-core/playwright`

---

### D10 — Visual-Regression Expansion

**What:** Extend the existing `tests/visual/phase0.spec.ts` Playwright visual suite with Program C routes and states.

**Files:**
- `tests/visual/program-c.spec.ts`

**New test cases:**
```ts
const NEW_ROUTES = [
  '/work/nexural',
  '/work/alphastream',
  '/work/jobpoise',
  '/work/trayd',
  '/work',          // grid with filter active (category=Fintech)
  '/',              // hero variants: default, reduced-motion
  '/pricing',
  '/services',
  '/founder',
  '/studio',
]
const WIDTHS = [320, 768, 1024, 1440]
```

**Additional test: architecture diagram section**
```ts
test('nexural architecture section visible @ 1440', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('http://localhost:3040/work/nexural')
  await page.locator('[data-section="architecture"]').scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await expect(page.locator('[data-section="architecture"]')).toHaveScreenshot(
    'nexural-architecture-1440.png',
    { maxDiffPixelRatio: 0.02, animations: 'disabled' }
  )
})
```

**Acceptance criteria:**
- All new snapshots committed to baseline
- `maxDiffPixelRatio: 0.02` on all cases (matches Phase 0 standard)
- Reduced-motion hero variant test matches `phase0.spec.ts` pattern

---

## 3. Data Model

The `CaseStudy` type in `data/work/case-studies.ts` drives the entire template. The full current shape is defined in that file. Program C additions (backward-compatible, all optional):

```ts
export type CaseStudy = {
  slug: string
  title: string
  posterTitle?: string
  client: string
  tagline: string
  category: 'Fintech' | 'AI/ML' | 'Infrastructure' | 'Product' | 'DevTools'
  tags: string[]
  kicker: string
  problem: string[]
  approach: string[]
  build: string[]
  outcome: string[]
  metrics: { label: string; value: string }[]   // DRIVES all viz; values are real
  artifacts?: string[]
  heroImage?: string
  cardMetric?: string
  screens?: { src: string; alt: string; caption?: string }[]
  gallery?: {
    src: string; caption: string
    kind: 'diagram' | 'screenshot' | 'terminal' | 'dashboard' | 'report'
    label?: string; aspect?: 'video' | 'square' | 'wide' | 'portrait'
  }[]
  relatedLab?: string
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
  outcomes?: { label: string; detail: string }[]

  // ── Program C additions ──
  buildLog?: {
    date: string       // "2025-11" or "2025-11-14"
    label: string      // "Schema locked — 185 tables"
    detail?: string
    kind: 'foundation' | 'feature' | 'infra' | 'test' | 'release'
  }[]
  architectureDiagramKey?: string  // e.g. "nexural" → maps to components/diagrams/nexural-architecture.tsx
  demoUrl?: string
  repoUrl?: string
}
```

**Real metrics per project (authoritative values from `data/work/case-studies.ts`):**

| Project | Metrics (exact) |
|---|---|
| nexural | 185 DB Tables, 69 API Endpoints, 61 Test Suites, 0 Billing Incidents, 200+ AI Queries/Week, 3 OSS Templates |
| alphastream | 200+ Indicators, 5 ML Models, 5★ GitHub Stars, 2 External Forks |
| jobpoise | 5/5 CI Gates, 3 Pricing Tiers, LinkedIn/Indeed/Greenhouse Job Boards, 0 Open PRs |
| trayd | EN + ES Languages, $0 External Capital, Phoenix Metro Market, Beta Live Status |

These values and only these values may be passed to viz components. If `proportion` is needed for `MetricBar`, the caller computes it from a known domain (e.g. test suites: 61/100 = 0.61). Do not invent domains.

---

## 4. Integration Points

### Token System (`app/globals.css`)
All Program C components consume tokens, never hardcoded values:
- Surface colors: `var(--sage-surface)` (#09090B), `var(--sage-surface-raised)` (#12110F), `var(--sage-surface-overlay)` (#1A1917)
- Borders: `var(--sage-border)` (#2A2826), `var(--sage-border-hover)` (#3D3A37)
- Ink: `var(--sage-ink)` (#F4F2EF), `var(--sage-ink-muted)` (#A8A29E), `var(--sage-ink-subtle)` (#B8B0AB) — never `var(--sage-ink-faint)` at small sizes
- Accents: `var(--sage-brand)` (#0ED3CF), `var(--sage-coral)` (#E85D3A), `var(--sage-lime)` (#A8C633), `var(--sage-magenta)` (#C7236E)
- Bloom shadows: `var(--sage-bloom-cyan)`, `var(--sage-bloom-coral)`, `var(--sage-bloom-lime)`, `var(--sage-bloom-magenta)`
- Typography scale: `var(--text-display)` through `var(--text-micro)` (all fluid `clamp()` values)
- Spacing: `var(--space-section)`, `var(--space-block)`
- Motion: `var(--duration-fast)` 150ms, `var(--duration-normal)` 300ms, `var(--duration-slow)` 600ms, `var(--ease-out-expo)`

### Motion Presets (`lib/motion/presets.ts`)
```ts
// Use these; add none new without amending the presets file:
import { fadeIn, slideUp, slideUpVisible, slideUpVisibleDelay, scaleIn, stagger, EASE_OUT_EXPO, EASE_OUT_QUINT } from '@/lib/motion/presets'
```
New animation timelines: camelCase with intent, e.g. `csHeroRevealTl`, `archRevealTl`. All wrapped in `useReducedMotion()` guard.

### Existing Work Components (reuse before new)
- `components/metric-counter.tsx` — existing animated counter; reuse in `components/viz/stat-card.tsx` via composition
- `components/diagrams/index.ts` — barrel export for all architecture diagrams; `CaseStudyArchitecture` component already dispatches by slug
- `components/work/screens-carousel.tsx` — already handles `study.screens[]`; reuse in `cs-hero.tsx`
- `components/work/almost-happened.tsx` — already handles `CaseExtras.almostHappened`; reuse in `cs-decisions.tsx`
- `components/glow-card.tsx` — use for card surfaces in the sidebar and metrics panels
- `components/section-label.tsx` — reuse for all section eyebrows
- `components/motion/index.tsx` — existing `MotionConfig` wrapper with `reducedMotion="user"`; never bypass

### Case Study Grid (`components/v0-case-study-grid.tsx`)
The grid component uses its own local `CASE_STUDIES` array with **placeholder client names** (Meridian Banking, Atlas Inference, etc.) — these are the v0 generated demo stubs, not real data. Program C connects the grid to real data:
- `app/work/work-grid.tsx` already uses `caseStudies` from `data/work/case-studies.ts`
- The v0 grid component is available as a design reference/override but the live `/work` page must show real slugs

---

## 5. Definition of Done

The following must all be true before Program C is closed:

- [ ] All 10 deliverables (D1–D10) accepted
- [ ] `pnpm build` exits 0 with 0 TypeScript errors
- [ ] `pnpm playwright test tests/visual/program-c.spec.ts` — all baselines committed, 0 failures
- [ ] `pnpm playwright test tests/a11y/program-c.spec.ts` — 0 critical/serious axe violations
- [ ] `pnpm playwright test tests/e2e/command-palette.spec.ts` — passes
- [ ] Lighthouse CI on `/work/nexural`: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 90 (matches existing `lighthouserc.json` budget)
- [ ] Design rubric doc (`docs/design/quality-rubric.md`) shows 4+ PASS per surface, 0 FAIL
- [ ] All viz components render real values from `data/work/case-studies.ts` — confirmed by unit test assertions against known strings
- [ ] No banned design patterns present (no default card grids without differentiation, no generic centered-hero blobs, no uniform radius/spacing everywhere, no hardcoded palette in new components)
- [ ] [YOU] Build-log entries for the 4 primary projects verified as accurate

---

## 6. [YOU] Prerequisites — Real Metrics & Assets Per Project

These are human-action items that block the viz and case-study template from rendering truthfully. Automation cannot supply them.

### 6a — Build Log Verification
For each of nexural, alphastream, jobpoise, trayd: confirm approximate milestone dates so `buildLog[]` entries reflect the real development arc. Even rough month-level dates ("2025-Q3: schema design") are fine. Fabricated specific dates are not acceptable.

### 6b — Architecture Diagrams Audit
The diagram components in `components/diagrams/` are already present. Before Program C ships, open each one (`nexural-architecture.tsx`, `alphastream-architecture.tsx`, `jobpoise-architecture.tsx`, `trayd-architecture.tsx`) and confirm the topology matches the real system. If any node or edge is aspirational (e.g. a service that isn't built), remove it or label it "(planned)".

### 6c — Real Screenshots for `/work/screens/`
The `screens[]` entries in `caseStudies` reference `/work/screens/nexural-1.png`, `/work/screens/alphastream-1.png`, etc. These files must exist in `public/`. If they don't, the `ScreensCarousel` component renders broken `<Image>` elements. Supply real product screenshots or remove the `screens` field for projects without real screenshots — do not generate fake product UI images.

### 6d — Hero Images
`heroImage` fields reference `/work/heroes/nexural.png` etc. Confirm these exist in `public/`. They were listed as generated by fal-ai in the Phase 0 handoff — verify they're in the repo, not just referenced.

### 6e — AlphaStream Metrics Clarification
AlphaStream reports `5★ GitHub Stars` and `2 External Forks`. If the repo is public at the referenced URL (`github.com/jteixeira/alphastream`), these are live stats that will drift. Consider whether to link to the live badge or keep the point-in-time values. Either choice is honest; pick one and document it in the case study copy.

### 6f — demoUrl / repoUrl Population
`demoUrl` and `repoUrl` are new optional fields (D3). Populate only with real live URLs. If a project has no live demo, leave `demoUrl` undefined — the `cs-live-links.tsx` component renders null for missing fields.

---

## 7. Rollout & Verification

### Build Order (sequence matters for imports)
1. D3 first — extend `CaseStudy` type; everything else imports from it
2. D2 — `components/viz/*`; no page dependencies
3. D5 — `components/work/cs-buildlog.tsx`; depends on D3
4. D4 — `components/diagrams/primitives.tsx` update; depends on nothing new
5. D1 — full case-study template; depends on D2, D3, D4, D5
6. D6 — editorial polish; parallel with D1–D5 (different files)
7. D7 — functional interactivity; parallel with D6
8. D8 — rubric doc; filled in as D1–D7 land
9. D9 + D10 — tests; written alongside each deliverable, finalized last

### Local Verification Sequence
```bash
# 1. Type check (incremental)
pnpm tsc --noEmit --pretty false

# 2. Unit tests
pnpm jest tests/unit/

# 3. Dev server for visual check
pnpm dev --port 3040

# 4. Visual regression (run after dev server is up)
pnpm playwright test tests/visual/program-c.spec.ts --update-snapshots  # first run
pnpm playwright test tests/visual/program-c.spec.ts                     # subsequent

# 5. Accessibility
pnpm playwright test tests/a11y/program-c.spec.ts

# 6. E2E
pnpm playwright test tests/e2e/command-palette.spec.ts

# 7. Production build
pnpm build

# 8. Lighthouse (against production build)
pnpm lhci autorun
```

### Regression Protection
The existing 25 visual baselines in `tests/visual/phase0.spec.ts` must continue to pass after Program C lands. Run the Phase 0 suite before merging:
```bash
pnpm playwright test tests/visual/phase0.spec.ts
```

### Cross-Browser Minimum
Chrome, Firefox, Safari. The architecture diagrams (SVG) and `components/viz/` (SVG math) are the highest-risk surfaces for cross-browser divergence. Test on Safari specifically for SVG rendering.

### Responsive Breakpoints
320, 375, 768, 1024, 1440, 1920. The 320 breakpoint is the hardest for the architecture diagrams and `MetricGrid`. Handle by wrapping diagrams in a `overflow-x: auto` scroll container at small viewports — never allow horizontal page overflow.

### Performance Budget (from `lighthouserc.json`)
- LCP < 2.5s on `/work/nexural` (hero image is the likely LCP element; it has `priority` + `sizes` already set in `case-study-content.tsx`)
- CLS < 0.1 — architecture diagrams must have explicit dimensions (SVG `viewBox` + `width`/`height` or `aspect-ratio` CSS)
- TBT < 200ms — defer heavy Framer Motion features below the fold; only the hero section needs eager animation
