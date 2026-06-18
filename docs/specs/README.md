# Sage Ideas — Engineering Spec Set (Path to 99+)

These are the **buildable engineering specs** that execute the strategy in
[`../ACQUISITION_MASTER_PLAN.txt`](../ACQUISITION_MASTER_PLAN.txt). Each spec is
grounded in the actual codebase (real file paths, real types, real patterns) and
follows the same shape: Objective & 99+ bar → itemized Deliverables (files /
interface / acceptance / tests) → Data model → Integration points → Definition of
Done → [YOU] prerequisites → Rollout & verification.

Execution model: each deliverable is sized to be **spec → build → two-stage review
(spec compliance, then code quality)**, the same subagent-driven workflow that
shipped Phase 0+1.

> Status legend: ✅ shipped · 🔜 next · ⏳ blocked on a [YOU] dependency

## The specs

### Revenue OS institutional roadmap

- [revenue-os-institutional-completion-plan.md](revenue-os-institutional-completion-plan.md) — the 12-program completion plan for taking the current Acquisition/Revenue OS from proof-mode to real data, real workers, real dashboards, multi-tenant SaaS readiness, and production operations.

### Growth-site specs

| Program | Spec | Owns | 99+ categories it raises |
|---|---|---|---|
| **G** | [program-g-research-baseline.md](program-g-research-baseline.md) | Keyword map, SERP/competitor briefs, content audit, dated baseline, revenue model, ICP/messaging | Analytics, Content, SEO, Strategy |
| **A** | [program-a-seo.md](program-a-seo.md) | Sitemap completeness, JSON-LD library, breadcrumbs, on-page, programmatic pages, **price reconciliation**, CWV | SEO completeness, Performance |
| **B** | [program-b-content-engine.md](program-b-content-engine.md) | Editorial blog, MDX component library, topic hubs, cadence, frontmatter schema, newsletter | Content, Brand, SEO |
| **C** | [program-c-design-showcase.md](program-c-design-showcase.md) | Deep interactive case studies, institutional viz, editorial polish, a11y, visual regression | Design/UX, Proof, Performance |
| **D** | [program-d-analytics.md](program-d-analytics.md) | GA4 install + event bridge, attribution, GSC/Bing, PostHog funnels/dashboards | Analytics, CRO |
| **E** | [program-e-conversion-proof.md](program-e-conversion-proof.md) | Attributed testimonials, /admin leads inbox, money-page CRO, experiments, nurture, lead scoring, E-E-A-T | Conversion, Proof, Lead engagement |
| **H** | [program-h-growth-distribution.md](program-h-growth-distribution.md) | Shareable public audit reports + badge (growth loop), original data report, digital-PR/link engine, UTM, repurposing | Distribution/Brand, Lead engagement |

`F` (distribution channels) and the `S1–S5` systems (experiments, money-page CRO,
nurture, E-E-A-T, lean execution) are folded into D/E/H above rather than given
their own files.

## Build order & dependency graph

```
        ┌─────────────────────────────┐
        │  G  Research & Baseline      │  (gates everything — validate, don't guess)
        │  D  Analytics (events/attr)  │  (measure before optimizing)
        └───────────────┬─────────────┘
                        │ keyword map + baseline + attribution
        ┌───────────────▼─────────────┐
        │  A  SEO Discovery Engine     │  (get found; uses G's keyword map)
        └───────────────┬─────────────┘
                        │ schema + indexable pages
        ┌───────────────▼─────────────┐
        │  H  Bridge Traffic + Loop    │  (drive leads NOW while SEO matures)
        └───────────────┬─────────────┘
                        │
        ┌───────────────▼─────────────┐
        │  B  Content Engine & Blog    │  (fuel; validated topics + E-E-A-T)
        └───────────────┬─────────────┘
                        │
        ┌───────────────▼─────────────┐
        │  C  Design & Showcase + CRO  │  (showroom + money-page conversion)
        └─────────────────────────────┘
   CONTINUOUS:  E (proof/nurture/experiments) · monthly scorecard re-score
```

Recommended sequence: **G + D → A → H → B → C**, with **E** running continuously.

## Cross-cutting findings the specs surfaced (fix these — confirmed in code)

- **Blog posts (51 `.mdx`) and `/compare` pages are missing from `app/sitemap.ts`** → invisible to Google. (Program A, D1)
- **Price contradiction**: `components/v0-pricing/tier-cards.tsx` and
  `components/pricing-table.tsx` hardcode `$1,500`/`$4,900` while
  `data/services/tiers.ts` says `$750`/`from $9,500`. One source of truth.
  (Program A)
- **Breadcrumbs inconsistent**: `/blog` has inline HTML w/ no JSON-LD; `/work`
  has JSON-LD w/ different HTML; `/compare` has neither. (Program A)
- **Two newsletter routes** (`/api/lab/newsletter` vs `/api/newsletter/subscribe`)
  — standardize. (Program B)
- **Blog `[slug]` has no `generateStaticParams`** — dynamic-rendered. (Program A/B)
- Reuse, don't reinvent: `components/json-ld.tsx`, `lib/blog-server.ts`,
  `lib/analytics/events.ts` (typed `trackEvent`), `lib/leads/capture.ts`,
  `lib/motion/presets.ts`, `app/globals.css` tokens, `app/og/route.tsx`.

## Consolidated [YOU] prerequisites (the hard ceiling without these)

| Dependency | Unblocks | Without it |
|---|---|---|
| Valid **Supabase** token / 3 runtime keys | E (leads inbox, nurture), H (stored reports), live verify | revenue plumbing unproven |
| **Stripe** keys (test) | live checkout verification | checkout unverified |
| **GA4 Measurement ID** + **Search Console** access | D (analytics, attribution, GSC) | no provable score |
| **Real named testimonials / logos / metrics** | E (attributed proof) | Proof capped ~80, Conversion lower |
| **Real per-project assets** (screenshots, verified diagram topology, build-log dates) | C (deep case studies) | showcase stays generic |
| **Sustained weekly content + distribution** | B, H, F | score decays |

## How this maps to the 99+ scorecard

Each program lifts specific rows of the §16 scorecard in the master plan (see the
"99+ categories it raises" column above). The **composite 99 is an outcome, not a
build**: ship the deliverables → re-score §16 monthly against real KPIs (traffic,
leads, closes) → sustain for 2–3 months. Honesty guardrail governs all of it:
every claim true and permissioned.

## Definition of Done (program-level)

A program is "done" when: every deliverable's acceptance criteria pass, its tests
are green (unit / e2e / visual / lighthouse / a11y as specified), its [YOU]
prerequisites are satisfied, and the KPIs it owns have a baseline + are trending
in the right direction.
