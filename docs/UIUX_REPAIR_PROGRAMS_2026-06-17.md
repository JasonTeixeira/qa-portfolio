# Sage Ideas UI/UX Repair Programs

Date: 2026-06-17
Source audit: [`UIUX_COHESION_AUDIT_2026-06-17.md`](UIUX_COHESION_AUDIT_2026-06-17.md)

Goal: move the public site from a mixed dark-premium system to one cohesive, motion-led Sage Ideas design ecosystem.

Target: **92-95/100 composite UI/UX before final asset polish**, then push toward 100/100 with real product screenshots, founder media, testimonials, performance tuning, and analytics-backed CRO.

## Program Map

| Program | Name | Purpose | Priority |
|---|---|---|---|
| UX-0 | Design Governance & QA Gates | Lock the rules and scoring system before more page work | P0 |
| UX-1 | Global Chrome & Route Console | Make nav/menu/footer feel like one signature product interface | P0 |
| UX-2 | Motion Graphics & Sound System | Create the reusable motion language that makes the site feel alive | P0 |
| UX-3 | Diagnostic Lead Capture | Turn traffic into routed leads with a useful diagnosis | P0 |
| UX-4 | Money Pages Rebuild | Rebuild home/services/pricing/contact around conversion and offer clarity | P0 |
| UX-5 | Content Machine Rebuild | Fix blog and make academy/resources feel like a premium publishing engine | P1 |
| UX-6 | Showcase & Proof System | Upgrade work/case studies/founder/proof with x-ray storytelling | P1 |
| UX-7 | Visual Asset & Media Production | Replace placeholders with real screenshots, editorial founder media, and owned motion/audio assets | P1 |
| UX-8 | Measurement, CRO & Launch QA | Prove the rebuild works with analytics, E2E, visual QA, CWV, and conversion tracking | P0/P1 |

---

## UX-0 — Design Governance & QA Gates

Purpose: stop the site from drifting into multiple visual systems again.

### Phase 0.1 — Canonical Design Rubric

Deliverables:

- `docs/design/living-systems-rubric.md`
- 100-point scorecard:
  - brand cohesion
  - visual hierarchy
  - interaction quality
  - motion quality
  - conversion clarity
  - accessibility
  - performance
  - SEO/content fit
- Per-route acceptance checklist.

Gate:

- Every rebuilt route gets scored before merge.
- Any page below 85 cannot be called design-complete.

### Phase 0.2 — Component Inventory

Deliverables:

- Inventory current systems:
  - `components/living/*`
  - `components/el/*`
  - legacy dark components
  - auth/portal/admin exceptions
- Mark components as:
  - canonical
  - transitional
  - deprecated
  - private/admin only

Gate:

- No public marketing page should use deprecated surfaces after UX-4.

### Phase 0.3 — Visual Regression Targets

Deliverables:

- Screenshot matrix for:
  - `/`
  - `/services`
  - `/pricing`
  - `/academy`
  - `/blog`
  - `/work`
  - `/contact`
  - `/tools/seo-audit`
  - desktop `1440x900`
  - mobile `390x844`
- Baseline image folder and update process.

Gate:

- Every phase must pass screenshot smoke: no blank sections, no overflow, no console errors.

---

## UX-1 — Global Chrome & Route Console

Purpose: make the first navigational interaction feel like Sage Ideas, not a generic dropdown.

Status:

- Phase 1.2 shipped 2026-06-17: desktop Route Console replaces the generic mega menu.
- Phase 1.3 shipped 2026-06-17: mobile command menu replaces the flat link drawer.
- Verification screenshots:
  - `.design-review/ux1-route-console-services-1440.png`
  - `.design-review/ux1-route-console-resources-1440.png`
  - `.design-review/ux1-route-console-mobile-390.png`

### Phase 1.1 — Canonical Brand Mark

Deliverables:

- One public mark treatment for nav/footer.
- Remove black-box logo treatments.
- Verify no duplicate/competing public logos.
- Decide whether the Recraft logo asset stays or is replaced with a cleaner code-built mark.

Gate:

- One visible brand system across nav, footer, mobile menu, splash, and favicon.

### Phase 1.2 — Desktop Route Console

Deliverables:

- Replace current mega menu with Route Console:
  - left animated route map
  - center lanes: Studio, Academy, Tools, Proof
  - right diagnostic mini-panel
  - bottom CTA strip: `Run audit`, `Choose path`, `Book call`
- Hover changes active route diagram.
- Stagger reveal on open.
- No content hidden if motion fails.

Gate:

- Menu screenshot at 1440 must read as a premium product interface.
- No hero overlap that makes text unreadable.
- Status: shipped.

### Phase 1.3 — Mobile Command Menu

Deliverables:

- Full-screen mobile route console.
- Large tap targets.
- Primary lanes first:
  - Hire the studio
  - Learn in academy
  - Run free audit
  - Read build record
- Sticky bottom CTA.

Gate:

- 390px screenshot has no text clipping, no hidden CTA, no overflow.
- Status: shipped.

### Phase 1.4 — Footer System Map

Deliverables:

- Footer mirrors the Route Console architecture.
- Add mini route diagram.
- Keep legal/admin links quiet.

Gate:

- Footer feels like a terminal/status surface, not a generic sitemap.

---

## UX-2 — Motion Graphics & Sound System

Purpose: make the site feel alive with reusable, meaningful motion.

### Phase 2.1 — Living Motion Primitives

Deliverables:

- `components/living/LivingRouteDiagram.tsx`
- `components/living/LivingPacketFlow.tsx`
- `components/living/LivingXRayPanel.tsx`
- `components/living/LivingMetricRail.tsx`
- `components/living/LivingMotionProvider.tsx`

Motion primitives:

- line draw
- gradient packet flow
- x-ray reveal
- route node activation
- proof count-up
- panel morph

Gate:

- Primitives respect `prefers-reduced-motion`.
- Content visible without JS.
- No Lenis.
- No `content-visibility:auto`.

### Phase 2.2 — Splash / Entry Sequence

Deliverables:

- Skippable 10-12 second first-load sequence:
  - mark draw
  - grid wakes up
  - Studio/Academy/Tools/Proof routes light up
  - H1 locks in
- Skip button.
- Cookie/session flag so it does not replay every page view.

Gate:

- Reduced-motion path skips splash entirely.
- Timeout fallback reveals everything.
- No CLS spike.

### Phase 2.3 — Sound Pulse

Deliverables:

- Click-to-enable audio control.
- Use owned/licensed high-energy loop or generated original asset.
- Visual meter reacts when enabled.
- Global mute state saved locally.

Gate:

- No autoplay.
- No audio without user gesture.
- Keyboard accessible.

### Phase 2.4 — Section-Level Motion Upgrade

Deliverables:

- Apply route diagrams to:
  - services
  - pricing
  - academy
  - blog
  - work
  - contact
- Use motion to explain structure, not decoration.

Gate:

- Each top route has at least one meaningful custom motion scene.

---

## UX-3 — Diagnostic Lead Capture

Purpose: turn site traffic into routed leads and academy subscribers through useful diagnosis.

### Phase 3.1 — Sage Route Finder Model

Status: shipped 2026-06-17.

Deliverables:

- Define questions:
  - what are you building?
  - what is broken?
  - what already exists?
  - timeline
  - budget/readiness
  - DIY vs done-for-you preference
- Define outputs:
  - Audit
  - Sprint
  - Build
  - Operate
  - Academy
  - Free resources
- Scoring logic in `lib/leads/route-finder.ts`.
- Unit coverage for academy, audit, and studio recommendations.

Gate:

- Pure scoring unit tests pass. **Passed.**

### Phase 3.2 — Route Finder UI

Status: shipped 2026-06-17 as `/tools/route-finder`.

Deliverables:

- `app/tools/route-finder/route-finder-content.tsx`. **Done.**
- Stepper/panel morph interaction. **Done as selectable route panels with live recommendation.**
- Progress rail. **Done as numbered diagnostic sections.**
- Email capture at result point. **Done through existing `/api/inquiry`.**
- Result screen with recommended route. **Done.**

Gate:

- Works on 390px. **Passed.**
- No form dead ends. **Passed.**
- Accessible controls and labels. **Passed.**

### Phase 3.3 — Backend + Analytics

Status: shipped 2026-06-17.

Deliverables:

- API route or server action to capture diagnosis. **Done via `/api/inquiry`.**
- Store result in lead metadata. **Done through inquiry scope/source and lead capture metadata path.**
- Fire PostHog + GA4 events:
  - `route_finder_start`
  - `route_finder_step`
  - `route_finder_complete`
  - `route_finder_cta_click`
- GA4 conversion registration for `route_finder_complete`. **Done in `lib/analytics/events.ts`.**
- Route Finder client event wiring. **Done in `app/tools/route-finder/route-finder-content.tsx`.**
- Optional Resend summary email later.

Gate:

- Unit tests for scoring and analytics registry. **Passed.**
- Article/route smoke remains visible with no console errors. **Passed through route/page QA runs.**

### Phase 3.4 — Placement

Deliverables:

- Homepage.
- Services.
- Pricing.
- Contact.
- Academy.
- SEO audit result.

Gate:

- Every money page routes to diagnosis or booking clearly.

---

## UX-4 — Money Pages Rebuild

Purpose: fix the pages most likely to convert paid work.

### Phase 4.1 — Homepage V2

Deliverables:

- Splash sequence.
- Interactive offer router.
- Stronger first-screen service/academy/resource distinction.
- Better product x-ray reel transitions.
- Sound pulse polish.

Gate:

- 1440 H1 remains dominant.
- 390 has no overflow.
- Heavy pin disabled on mobile.

### Phase 4.2 — Services Build Path Matrix

Deliverables:

- Rebuild `/services` hero around:
  - Audit -> Sprint -> Build -> Operate
  - AI Systems / Apps-SaaS / Brand-Web / Growth
- Each matrix cell links to relevant offers.
- Animated route diagram in hero.
- Reduce repetitive card density.

Gate:

- Buyer understands offer architecture in under 10 seconds.

### Phase 4.3 — Pricing Quote Builder

Deliverables:

- Move quote builder to primary hero object.
- Animate scope changes.
- Clear distinction:
  - self-serve
  - scoped projects
  - custom build
  - retainers
- Stronger trust/proof near checkout CTAs.

Gate:

- Pricing answers: what it costs, what I get, what happens next.

### Phase 4.4 — Contact As Diagnostic Funnel

Deliverables:

- Route Finder embedded above or alongside form.
- Form becomes final detail capture, not the only conversion path.
- Founder trust block stays but becomes editorial.

Gate:

- User can choose path without writing a long message.

---

## UX-5 — Content Machine Rebuild

Purpose: make the blog, academy, lab, and resources feel like a serious publishing/product engine.

### Phase 5.1 — Blog Layout Bug Fix

Status: shipped 2026-06-17.

Deliverables:

- Fix dead empty space on `/blog`. **Done.**
- Verify desktop/mobile screenshots. **Done.**
- Rebuild `/blog` as a Living Systems content hub with featured dispatch, topic lanes, dense archive console, and reader conversion routes. **Done.**

Gate:

- No large blank section between archive and footer. **Passed.**
- No horizontal overflow at 1440 or 390. **Passed.**

Verification:

- `npm run typecheck`
- `npm run lint -- app/blog/page.tsx app/blog/blog-content.tsx`
- Playwright render/overflow smoke for `/blog` at 1440 and 390.
- Screenshots:
  - `.design-review/ux5-blog-1440.png`
  - `.design-review/ux5-blog-390.png`

### Phase 5.2 — Blog As Build Record

Status: shipped for the blog index and article conversion layer on 2026-06-17.

Deliverables:

- Featured issue. **Done on `/blog`.**
- Topic lanes. **Done on `/blog`.**
- Start-here paths. **Done on `/blog`.**
- Series cards. **Done on article pages via cluster route cards.**
- In-content lead magnets. **Done via cluster-aware article lead magnet.**
- Academy route path from articles. **Done.**

Gate:

- Blog feels like an editorial product, not a list. **Passed.**
- Article pages route readers to cluster, academy, audit, and service offers. **Passed.**

### Phase 5.3 — MDX Visual System

Status: first production pass shipped 2026-06-17.

Follow-up shortcode/directive pass shipped 2026-06-17.

Live editorial shortcode adoption shipped 2026-06-17.

Editorial depth repair pass shipped 2026-06-17.

Deliverables:

- Callout. **Done via enhanced blockquote visual class.**
- Figure. **Partially done through article route/system diagrams; image figure captions remain.**
- Diagram. **Done via article lead/series/conversion SVG route diagrams.**
- Code block. **Done via rendered code panel wrapper.**
- Table. **Done via scorecard/table frame.**
- Proof note. **Done through route-data cards and conversion graph.**
- CTA block. **Done via article lead magnet and conversion system.**
- Reusable future-post directives. **Done: `proof-note`, `system-diagram`, `scorecard`, `checklist`, `offer-cta`.**
- Authoring documentation. **Done: `docs/content/blog-shortcodes.md`.**
- Real post adoption. **Done in five live posts:**
  - `the-ai-agent-boundary-problem`
  - `turning-customer-receipts-into-seo-assets`
  - `why-i-treat-my-portfolio-like-a-production-system`
  - `designing-a-185-table-database-schema-lessons-from-building-nexural`
  - `how-to-evaluate-ai-features-before-you-ship-them`
- Thin-post depth repairs. **Done in three previously weak/truncated posts:**
  - `error-handling-that-respects-your-users`
  - `fixing-docker-compose-connection-errors-in-ci-cd`
  - `why-most-api-documentation-is-useless-and-how-to-fix-yours`

Gate:

- Articles can carry premium visual storytelling without bespoke page work. **Passed for existing Markdown patterns.**
- Future posts can author premium visual blocks without bespoke React page work. **Passed.**
- Shortcodes are visible in real editorial content, not only docs. **Passed.**
- Repaired posts pass the all-article QA gate. **Passed.**

Verification:

- `npm run typecheck`
- `npm run lint -- app/blog/[slug]/page.tsx components/blog/article-body.tsx components/blog/article-route-cards.tsx lib/blogMarkdown.ts app/globals.css`
- `npm run qa:articles` — 58/58 passed after the renderer fallback fix.
- Playwright render/overflow smoke for:
  - `/blog/turning-customer-receipts-into-seo-assets` at 1440 and 390.
  - `/blog/why-i-treat-my-portfolio-like-a-production-system` at 1440 and 390.
- Screenshots:
  - `.design-review/ux5-article-featured-1440.png`
  - `.design-review/ux5-article-featured-390.png`
  - `.design-review/ux5-article-table-1440.png`
  - `.design-review/ux5-article-table-390.png`

### Phase 5.4 — Academy Product UX

Status: shipped 2026-06-17 as the academy course funnel/product pass. This covers the requested "UX-6 Phase 6.1 academy product/course funnel" slice.

Deliverables:

- Animated curriculum map. **Done on academy track/enroll pages.**
- Track recommendation diagnostic. **Done via Route Finder + article cluster-to-track routing.**
- Course cards that look like real learning products. **Done on academy index and track pages.**
- Checkout/product pages when packaging is ready. **Done as honest early-access product pages until real price/Stripe products are approved.**

Gate:

- DIY audience has a clear subscribe/learn/enroll path. **Passed.**

Verification:

- `/academy/ai-native-product-building/enroll` desktop/mobile visual smoke.
- `/tools/route-finder` desktop/mobile visual smoke.
- No horizontal overflow at 1440 or 390.

### Phase 5.5 — Lab/Tools Productization

Deliverables:

- Tool cards become interactive demos.
- SEO audit result preview improves.
- Calculators use consistent motion/diagram language.

Gate:

- Tools feel like products, not forms.

---

## UX-6 — Showcase & Proof System

Purpose: make the work and founder proof feel high-end, specific, and real.

### Phase 6.1 — Case Study X-Ray Template

Deliverables:

- Reusable case-study page system:
  - surface
  - system
  - proof
  - timeline
  - tradeoffs
  - next route
- Apply to `app/work/[slug]`.

Gate:

- One template handles all flagship products.

### Phase 6.2 — Nexural Flagship Upgrade

Deliverables:

- Real screenshots.
- Architecture diagram.
- Proof metrics.
- Track-record link if permissioned.

Gate:

- One case study reaches 90+ before cloning pattern.

### Phase 6.3 — Remaining Product Cases

Deliverables:

- AlphaStream.
- Jobpoise.
- Trayd.
- Brand Sprint.
- Site Care.

Gate:

- All work pages share the same x-ray storytelling system.

### Phase 6.4 — Founder / Operator Profile

Deliverables:

- Editorial founder hero.
- Shipped-products timeline.
- Working principles.
- Public proof stats.
- Academy/personal-brand path.

Gate:

- Founder page supports both trust and personal brand growth.

---

## UX-7 — Visual Asset & Media Production

Purpose: replace weak/placeholder visuals with assets worthy of the brand.

### Phase 7.1 — Asset Requirements

Deliverables:

- Asset checklist for:
  - product screenshots
  - founder portraits
  - permissioned logos/testimonials
  - product diagrams
  - audio loop
  - short motion clips if needed

Gate:

- No fake testimonial/logo/screenshot claims.

### Phase 7.2 — Screenshot System

Deliverables:

- Standard screenshot frame.
- Product-specific color accent.
- Optional x-ray overlay.
- Responsive treatment.

Gate:

- Product visuals are consistent across home/work/case studies.

### Phase 7.3 — Diagram Library

Deliverables:

- Service diagrams.
- Pricing/scope diagrams.
- Case-study architecture diagrams.
- Academy curriculum diagram.
- SEO/content engine diagram.

Gate:

- Every top page has one custom, useful diagram.

### Phase 7.4 — Sound / Motion Assets

Deliverables:

- Original short loop.
- Optional UI blips.
- Sound control polish.

Gate:

- Audio is opt-in, owned/licensed, and not annoying.

---

## UX-8 — Measurement, CRO & Launch QA

Purpose: make the polish measurable and shippable.

### Phase 8.1 — Analytics Events

Status: route finder analytics slice shipped 2026-06-17; route console/sound/splash/academy continuation shipped 2026-06-17.

Deliverables:

- Add events for:
  - route console open
  - route console click
  - sound enabled
  - splash skipped
  - route finder started/completed
  - quote builder used
  - academy track selected
- Route Finder events shipped:
  - `route_finder_start`
  - `route_finder_step`
  - `route_finder_complete`
  - `route_finder_cta_click`
- Route console / motion / academy events shipped:
  - `route_console_open`
  - `route_console_click`
  - `sound_enabled`
  - `splash_skipped`
  - `academy_track_selected`

Gate:

- Events are typed and compile against the shared analytics registry. **Passed.**
- Events appear in PostHog/GA4 after environment setup. **Environment-dependent.**

### Phase 8.2 — Visual QA

Status: article-route automated QA shipped 2026-06-17.

Deliverables:

- Screenshot smoke suite for top routes.
- Mobile + desktop captures.
- Console-error check.
- Overflow check.
- Blog article route audit for every MDX article. **Done via `scripts/qa/article-audit.mjs`.**

Gate:

- No article route ships with overflow, console errors, missing H1, missing core CTAs, or weak frontmatter metadata. **Passed: 58/58 article routes.**

### Phase 8.3 — Lighthouse / CWV

Status: desktop + mobile UX-8 Lighthouse/CWV optimization pass shipped 2026-06-17.

Deliverables:

- Lighthouse checks for:
  - home
  - services
  - pricing
  - blog
  - academy
  - work
- Budget thresholds. **Done in `lighthouserc.ux8.json` and `lighthouserc.ux8.mobile.json`.**
- Package scripts:
  - `npm run test:lh:ux8`
  - `npm run test:lh:ux8:mobile`

Gate:

- Desktop route audits meet budget after optimization. **Passed in direct Lighthouse verification.**
- Mobile 390 route audits meet budget after optimization. **Passed in direct Lighthouse verification.**
- No hard accessibility / best-practices / SEO failures in the UX-8 suites. **Passed after contrast/accessibility-token fix.**
- LCP optimization:
  - Cookie banner no longer renders into the initial LCP window.
  - Homepage loader no longer blocks first paint; content remains visible by default.
  - Local Lighthouse service worker registration is disabled on `127.0.0.1:4173` to avoid stale chunk/cache artifacts.
- Verified with direct Lighthouse JSON reports after LHCI multi-route collection showed intermittent local 500s:
  - Desktop: home `0.97` perf / `1325ms` LCP; services `0.99` / `882ms`; pricing `0.99` / `900ms`; blog `0.99` / `868ms`; academy `1.00` / `820ms`; work `0.99` / `880ms`.
  - Mobile 390: home `1.00` perf / `1334ms` LCP; services `1.00` / `931ms`; pricing `1.00` / `931ms`; blog `1.00` / `970ms`; academy `1.00` / `865ms`; work `1.00` / `925ms`.
  - CLS `0` on all six routes; TBT `0-30ms`.

### Phase 8.4 — CRO Backlog

Status: CRO operating spec + first experiment code shipped 2026-06-17; PostHog workspace setup remains external.

Deliverables:

- PostHog funnel dashboard spec. **Done in `docs/analytics/posthog-funnels-dashboard.md`.**
- ICE-scored experiment list. **Done in `docs/cro/posthog-ice-backlog.md`.**
- Masked PostHog session replay config. **Code-ready in `components/analytics/posthog-provider.tsx`; workspace enablement still external.**
- Experiment flag helper. **Done in `lib/analytics/experiments.ts`.**
- First experiment treatment surface. **Done in `components/cro/RouteFinderHeroExperiment.tsx`; wired on `/`, `/services`, and `/pricing`.**
- First 5 experiments:
  - route finder above fold vs below fold
  - services matrix CTA copy
  - pricing quote-builder CTA
  - academy diagnostic CTA
  - SEO audit result CTA

Gate:

- CRO work is measured after design lock.
- External setup needed: create the dashboard/flags inside PostHog and let production traffic accumulate.

### Phase 8.5 — Deterministic Lighthouse

Status: shipped 2026-06-17.

Deliverables:

- Replaced flaky multi-route LHCI collection with `scripts/qa/lighthouse-ux8.mjs`.
- `npm run test:lh:ux8` now builds once, starts one local production server, runs each desktop route separately, retries failures, enforces budgets, and writes `.lighthouseci/ux8-desktop/summary.json`.
- `npm run test:lh:ux8:mobile` does the same for 390px mobile and writes `.lighthouseci/ux8-mobile/summary.json`.

Gate:

- Desktop deterministic suite passed 6/6.
- Mobile deterministic suite passed 6/6.
- Remaining external risk: real production CWV still depends on deployed hosting, analytics scripts, and user devices.

---

## Recommended Build Order

1. **UX-1 Phase 1.2 + 1.3**: Route Console desktop/mobile.
2. **UX-5 Phase 5.1**: fix blog dead-space bug.
3. **UX-2 Phase 2.1**: living motion primitives.
4. **UX-3 Phase 3.1 + 3.2**: Sage Route Finder model/UI.
5. **UX-4 Phase 4.2**: services matrix rebuild.
6. **UX-4 Phase 4.3**: pricing quote-builder rebuild.
7. **UX-4 Phase 4.1**: homepage splash + interactive router.
8. **UX-5 Phase 5.2-5.5**: content machine and academy/lab upgrades.
9. **UX-6**: case studies and founder proof.
10. **UX-7 + UX-8**: asset production, QA, measurement, CRO.

## Definition Of Done Per Phase

Every phase must include:

- Code implemented in canonical components.
- Reduced-motion fallback.
- 1440 screenshot.
- 390 screenshot.
- No console errors.
- No horizontal overflow.
- `npm run typecheck`.
- `npm run lint`.
- Relevant unit/E2E tests when behavior changes.
- Build check for major public changes.
