# Sage Ideas — MASTER BUILD TRACKER (Phases + Programs)

The single board to drive sageideas.dev to **100/100 premium grade**. Work
top-to-bottom; tick a box as each deliverable ships (spec → build → review).

- **Strategy:** [`ACQUISITION_MASTER_PLAN.txt`](ACQUISITION_MASTER_PLAN.txt) (v1.1)
- **Engineering specs:** [`specs/README.md`](specs/README.md) + `specs/program-*.md`
- **Legend:** `[x]` done · `[ ]` todo · ⏳ blocked on a [YOU] dep · ⭐ quick win (no creds)

---

## Progress

| Unit | Status |
|---|---|
| Phase 0 — Foundation & truth | ✅ shipped |
| Phase 1 — Conversion engine | ✅ shipped (live verify pending creds) |
| Program G — Research & Baseline | ✅ repo artifacts shipped; API enrichment remains ongoing |
| Program D — Analytics | ◐ GA4/GSC installed; PostHog/Bing console setup pending |
| Program A — SEO Discovery | ◐ technical SEO + programmatic pages shipped; live CWV monitoring pending |
| Program H — Bridge Traffic & Growth Loop | ◐ share/report/badge loop shipped; distribution execution pending |
| Program B — Content Engine & Blog | ◐ Wave 3 article shell + hubs shipped |
| Program C — Design & Showcase | ☐ not started |
| Program E — Conversion & Proof (continuous) | ◐ lead scoring shipped; proof/inbox pending |

**Build order:** G + D (gates) → A → H → B → C, with **E** running continuously.

---

## ✅ PHASE 0 — Foundation & Truth (SHIPPED)
- [x] Unify design tokens into one canonical `app/globals.css`; restore the dead `.sage-*` motion layer
- [x] Fluid type/spacing/motion scale tokens; font drift fixed
- [x] Motion presets (`lib/motion/presets.ts`) + `MotionConfig reducedMotion="user"`
- [x] Truth pass: solo positioning; remove fabricated testimonials + stats
- [x] Honest `ProofGrid` site-wide (home/pricing/services/tier pages)

## ✅ PHASE 1 — Conversion Engine (SHIPPED)
- [x] Typed conversion-event layer (`lib/analytics/events.ts`, 14 events) on all CTAs/forms/pricing/booking
- [x] Public Stripe checkout: low-ticket self-serve, high-ticket gated, care subscriptions restored
- [x] Webhook → lead capture (service + care branches, idempotent)
- [x] SEO-audit lead magnet (analyzer, SSRF-hardened, PSI, report UI)
- [x] Unified lead capture → Supabase + Resend
- [ ] ⏳ **Live verification** (needs valid Supabase + Stripe creds): apply `0028_leads.sql`, run RLS suite, confirm checkout + lead capture end-to-end
- [ ] Open the Phase 0+1 PR to lock the work in

---

## ☐ PROGRAM G — Research & Baseline  · spec: [program-g](specs/program-g-research-baseline.md)
*Gates all SEO/content work. ⏳ needs GA4 ID + Search Console access.*
- [x] G1 — Typed **keyword map** (`data/seo/keyword-map.ts`) + loader; seeded now, GSC enrichment pending
- [x] G2 — **SERP/competitor briefs** per target cluster (the "10x / different angle") — `docs/seo/serp-briefs.md`
- [x] G3 — **Content audit** tool (`scripts/seo/content-audit.mjs`) → inventory + disposition per post (improve/merge/prune/keep)
- [x] G4 — **Baseline snapshot** script (`scripts/seo/baseline.mjs`) → dated `docs/baselines/<date>.json` (traffic/CWV/indexed/referring domains)
- [x] G5 — **Revenue-backwards model** (`docs/seo/revenue-model.md`)
- [x] G6 — **ICP + messaging** foundation (`docs/brand/icp-messaging.md`)

## ☐ PROGRAM D — Analytics & Measurement  · spec: [program-d](specs/program-d-analytics.md)
*Measure before optimizing. ⏳ needs GA4 ID + GSC.*
- [x] D1 — **GA4 install** (`components/analytics/google-analytics.tsx`, consent-gated, prod-only) + CSP *(activates when `NEXT_PUBLIC_GA4_MEASUREMENT_ID` is set)*
- [x] D2 — ⭐ **Event bridge**: extend `trackEvent` to also emit GA4 gtag; mark 4 key events as conversions
- [x] D3 — ⭐ **First-touch attribution** (`lib/analytics/attribution.ts`) → stored on lead `metadata`
- [ ] D4 — **GSC + Bing** verification + sitemap submission *(Google verified; Bing still pending; checklist in `docs/seo/search-console-bing-submit.md`)*
- [ ] D5 — PostHog **funnels + dashboard** (5 funnels, ~10 insights) — spec/code ready in `docs/analytics/posthog-funnels-dashboard.md`; workspace creation pending

## ☐ PROGRAM A — SEO Discovery Engine  · spec: [program-a](specs/program-a-seo.md)
*Get found. Uses G's keyword map. Several ⭐ quick wins need no creds.*
- [x] A1 — ⭐ **Sitemap fix**: add 51 blog posts + `/compare` pages to `app/sitemap.ts` (currently invisible to Google)
- [x] A2 — ⭐ **Price reconciliation**: make `v0-pricing/tier-cards.tsx` + `pricing-table.tsx` read from `data/services/tiers.ts` (kill the $1,500/$4,900 vs $750/$9,500 contradiction)
- [x] A3 — **JSON-LD builder library** (`lib/seo/jsonld.ts`): Organization, WebSite+SearchAction, Article, CaseStudy, Service, AggregateOffer, FAQPage (reuse `components/json-ld.tsx`)
- [x] A4 — **Breadcrumbs** component (visible + BreadcrumbList JSON-LD) applied site-wide
- [x] A5 — On-page audit command added (`npm run seo:metadata-audit`); remaining page fixes are tracked by command output
- [x] A6 — Programmatic services×industries unique content + `generateStaticParams`
- [x] A7 — Blog `generateStaticParams` (static-render posts)
- [ ] A8 — CWV/Lighthouse budgets green on template pages (`/work/[slug]`, `/services/[slug]`, `/industries/[slug]`) — `npm run test:lh`

## ☐ PROGRAM H — Bridge Traffic & Growth Loop  · spec: [program-h](specs/program-h-growth-distribution.md)
*Drive leads NOW while SEO matures. ⏳ stored reports need Supabase.*
- [x] H1 — **Shareable public audit reports**: persist to `audit_reports` table (email never public) + `app/tools/seo-audit/r/[id]` indexable page with OG + schema
- [x] H2 — **Embeddable badge** (`app/api/badge/[id]`) → backlink loop
- [x] H3 — **Original data report** flagship (`app/reports/ai-search-readiness-2026`) from real data + Dataset schema
- [x] H4 — Outreach/link tracking + **UTM conventions** (`docs/marketing/utm-conventions.md`)
- [x] H5 — **Repurposing pipeline** SOP + **tool launch checklist** (Product Hunt / LinkedIn / communities)

## ☐ PROGRAM B — Content Engine & Blog  · spec: [program-b](specs/program-b-content-engine.md)
*Fuel + brand. Validated topics + E-E-A-T.*
- [x] B1 — **Editorial article shell** (`components/blog/article-shell.tsx`): TOC, reading progress, read time, prev/next, related, author, share
- [ ] B2 — **MDX component library** (`components/mdx/*`: Code, Callout, Diagram, Table, Figure, Embed) — institutional, no theatre
- [x] B3 — **Frontmatter zod schema** + validator (extend `scripts/validate-content.mjs`); `cluster` required
- [x] B4 — **Topic hubs/pillar pages** (`app/topics/[hub]` + `data/content/clusters.ts`)
- [ ] B5 — **Content cadence**: post templates + calendar + per-post checklist
- [ ] B6 — **Standardize the two newsletter routes**; in-content capture + nurture hook
- [x] B7 — RSS + **Atom feed** + `<head>` auto-discovery

## ☐ PROGRAM C — Premium Design & Interactive Showcase  · spec: [program-c](specs/program-c-design-showcase.md)
*Showroom. ⏳ deep case studies need real per-project assets.*
- [ ] C1 — **Deep case-study template** (`app/work/[slug]` redesign + `components/work/*`): problem, architecture diagram, real-metrics viz, trade-offs, build-log, live links
- [ ] C2 — **Institutional viz components** (`components/viz/*`) — REAL numbers only
- [ ] C3 — **Editorial design pass** to 100/100 on hero/work/pricing/services/founder/studio
- [ ] C4 — **Functional interactivity**: SEO-tool promo, scope/ROI calculator, command-palette extension
- [ ] C5 — **Design-QA rubric** (`docs/design/quality-rubric.md`) signed off per surface
- [ ] C6 — **A11y** (AA) + cross-browser/responsive + expand visual regression to `/work/[slug]` + heroes

## ☐ PROGRAM E — Conversion, Proof & Close (CONTINUOUS)  · spec: [program-e](specs/program-e-conversion-proof.md)
*Highest closing leverage. ⏳ proof needs [YOU]; nurture/inbox need Supabase.*
- [ ] E1 — ⏳ **Attributed testimonials + logos** (`data/social-proof/attributed.ts` + component) — populate when you supply real, permissioned proof
- [ ] E2 — **/admin leads inbox** (migration `0029` adds `status`+`score`) — see + work leads
- [ ] E3 — **Money-page CRO** components (`components/cro/*`) + playbook (`docs/cro/money-page-playbook.md`)
- [ ] E4 — **Experiments + session replay** (PostHog) + ICE-scored test backlog — code/spec ready; PostHog flag + replay enablement pending
- [x] E5 — **Lead scoring** (`lib/leads/scoring.ts`) wired into capture metadata
- [ ] E6 — **B2B nurture** (migration `0030` sequences/steps/enrollments + Resend + cron `/api/cron/nurture`)
- [ ] E7 — **E-E-A-T** components (`components/eeat/*`: author bio, credentials, first-hand, third-party validation)

---

## [YOU] DEPENDENCIES (the hard ceiling without these)
- [ ] Valid **Supabase** access token (or URL + anon + service-role keys) → unblocks live verify, E, H stored reports
- [ ] **Stripe** test keys (secret + webhook secret + publishable) → checkout verification
- [ ] **GA4 Measurement ID** (`G-…`) + **Search Console** access → Program D + G
- [ ] **Real named testimonials / logos / metrics** → E1 (Proof capped ~80 without it)
- [ ] **Real per-project assets** (screenshots, verified diagram topology, build-log dates) → C1
- [ ] Commitment to **sustained weekly content + distribution** → B, H, F
> 🔒 Rotate any secret shared in chat after use.

## 99+ SCORECARD (re-score monthly against real KPIs)
```
DESIGN ___  PERFORMANCE ___  ACCESSIBILITY ___  SEO-TECH ___  SEO-CONTENT ___
CRO ___  CONTENT-ENGINE ___  ANALYTICS ___  PROOF ___  BRAND/DISTRIBUTION ___
COMPOSITE ___   (99 = every row ≥99 AND traffic/leads/closes trending, sustained 2–3 mo)
```

## How we work it
One program at a time, in order. For each deliverable: I spec the slice → build it
→ two-stage review (spec compliance, then code quality) → tick the box here. The
⭐ quick wins in Program A (sitemap + price fix) and Program D (event bridge,
attribution) need **no external creds** and can ship today.
