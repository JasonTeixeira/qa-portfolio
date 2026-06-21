# Sage Ideas Website Design Handoff

Date: 2026-06-19  
Project path: `/Users/Sage/code/active/sageideas.dev`  
Branch at handoff: `feat/acquisition-engine-phase-0-1`  
Current HEAD at handoff start: `18b85f0`  
Local site URL: `http://localhost:3042/`  
Framework: Next.js 16, React 19, Tailwind CSS 4  

## Purpose

This is the handoff for the current redesigned Sage Ideas agency website version. Use it as the source map for a design-focused polishing session in Claude Code or another coding agent.

The goal for the next session is not to rebuild the product, admin, Revenue OS, Job Application OS, portal, auth, or backend. The goal is to polish the public agency website so it feels cohesive, premium, professional, readable, and conversion-ready across desktop and mobile.

## Current Local Install

Working directory:

```bash
cd /Users/Sage/code/active/sageideas.dev
```

Current local server:

```bash
http://localhost:3042/
```

Useful commands:

```bash
npm run dev
npm run build
npm run typecheck
npx eslint app components data lib --max-warnings=0
```

If port 3042 is already running:

```bash
npm run stop:local
PORT=3042 npm run start:local
```

## Current Website Identity

Brand: Sage Ideas  
Positioning: Solo AI-native studio for product, brand, AI systems, SaaS, growth, SEO, web, and engineering operations.  
Current site concept: dark “Living Systems” / engineered agency site.  
Design tone target: premium, technical, confident, clear, not gimmicky, not over-decorated.

## Design Tokens

Primary token source:

- `app/globals.css`

Important current tokens:

- Background: `--sage-bg: #0B0B0E`
- Surface 1: `--sage-surface-1: #111115`
- Surface 2: `--sage-surface-2: #141418`
- Surface 3: `--sage-surface-3: #1A1A20`
- Text: `--sage-ink: #F2EFE9`
- Muted text: `--sage-ink-muted: #8A8A94`
- Border: `--sage-border: #1E1E24`
- Primary/accent: `--sage-brand: #3D5AFE`
- Secondary accent: `--sage-coral: #FF2D9B`
- Purple accent: `--sage-lime: #7C3AED`

Fonts:

- Display: `Bricolage_Grotesque`
- Sans: `Hanken_Grotesk`
- Mono: `JetBrains_Mono`

Important design constraint:

- Keep the dark premium system.
- Do not turn the site into a one-note blue/purple gradient page.
- Avoid decorative gradient blobs/orbs.
- Preserve the engineered proof-led tone.
- Improve spacing, typography hierarchy, content density, mobile flow, and visual consistency.

## Primary Public Routes To Polish

Homepage:

- `/`
- File: `app/page.tsx`
- Main component: `components/living/LivingSystemsHome.tsx`
- Supporting components:
  - `components/living/LivingSystemsHome.module.css`
  - `components/living/LivingSystemsMotion.tsx`
  - `components/living/SystemFlowLayer.tsx`
  - `components/living/SystemFlowLayer.module.css`
  - `components/living/DeepSystemDiagram.tsx`
  - `components/living/RouteConversionCta.tsx`
  - `components/el/home/CapabilityLanes.tsx`
  - `components/el/home/EngagementTiles.tsx`
  - `components/el/home/ProofLedger.tsx`
  - `components/el/home/ReferenceRoster.tsx`
  - `components/el/home/WorkPreview.tsx`

Marketing chrome:

- `app/layout.tsx`
- `components/marketing-chrome.tsx`
- `components/navigation.tsx`
- `components/footer.tsx`
- `components/command-palette-marketing-loader.tsx`
- `components/command-palette.tsx`
- `components/back-to-top.tsx`
- `components/telemetry-footer.tsx`

Services:

- `/services`
- `app/services/page.tsx`
- `app/services/services-content.tsx`
- `app/services/services-el.tsx`
- `app/services/services-grid.tsx`
- `app/services/extended-catalog.tsx`
- `components/el/services/*`
- Data:
  - `data/services/tiers.ts`
  - `data/services/extended.ts`
  - `data/services/pricing-faq.ts`
  - `data/services/phase13-offers.ts`
  - `data/services/tier-classification.ts`
  - `data/services/visual-meta.ts`
  - `data/services/flagship-visuals.ts`

Individual services:

- `/services/ai-development`
- `/services/cloud-infrastructure`
- `/services/enterprise-qa`
- `/services/fintech`
- `/services/technical-consulting`
- `/services/trading-systems`
- `/services/site-care`
- `/services/site-starter`
- `/services/studio-engagement`
- Dynamic route: `app/services/[slug]/page.tsx`
- Detail shell: `app/services/[slug]/flagship-page-content.tsx`
- Care pages: `app/services/_care/care-page-content.tsx`

Work / proof:

- `/work`
- `app/work/page.tsx`
- `app/work/[slug]/page.tsx`
- `app/work/[slug]/case-study-content.tsx`
- `app/work/[slug]/case-study-extras.tsx`
- Components:
  - `components/el/work/WorkIndex.tsx`
  - `components/el/work/BuildLog.tsx`
  - `components/el/work/EvidenceGallery.tsx`
  - `components/el/work/MetricRegister.tsx`
  - `components/el/work/NearMissLedger.tsx`
  - `components/el/work/ScreenViewer.tsx`
- Data:
  - `data/work/case-studies.ts`
  - `data/work/case-extras.ts`
  - `data/case-studies.ts`
  - `data/projects.ts`

Pricing:

- `/pricing`
- `app/pricing/page.tsx`
- `app/pricing/pricing-el.tsx`
- `components/pricing/quote-calculator.tsx`

Contact:

- `/contact`
- `app/contact/page.tsx`
- `app/contact/contact-content.tsx`
- `app/contact/contact-relaunch-content.tsx`
- API: `app/api/contact/route.ts`

Compare / conversion:

- `/compare`
- `/compare/[slug]`
- `app/compare/page.tsx`
- `app/compare/[slug]/page.tsx`
- Data: `data/compare/comparisons.ts`

Industries:

- `/industries`
- `/industries/[slug]`
- `app/industries/page.tsx`
- `app/industries/industries-index-content.tsx`
- `app/industries/[slug]/page.tsx`
- `app/industries/[slug]/industry-page-content.tsx`
- Data: `data/industries/verticals.ts`

Lab / tools / resources:

- `/lab`
- `/lab/[slug]`
- `/tools/route-finder`
- `/tools/seo-audit`
- `app/lab/page.tsx`
- `app/lab/lab-grid.tsx`
- `app/lab/[slug]/page.tsx`
- `app/tools/route-finder/*`
- `app/tools/seo-audit/*`
- Data:
  - `data/lab/products.ts`
  - `data/lab/templates.ts`
  - `data/lab/ai-readiness-questions.ts`
  - `data/lab/ai-readiness-tiers.ts`

Content / blog:

- `/blog`
- `/blog/[slug]`
- `app/blog/page.tsx`
- `app/blog/blog-content.tsx`
- `app/blog/[slug]/page.tsx`
- `components/blog/*`
- Content: `content/blog/*.mdx`
- MDX components: `components/mdx/*`

Other public pages:

- `/studio`: `app/studio/page.tsx`, `app/studio/studio-animations.tsx`
- `/founder`: `app/founder/page.tsx`, `app/founder/founder-animations.tsx`
- `/capabilities`: `app/capabilities/page.tsx`, `app/capabilities/capabilities-content.tsx`
- `/trust`: `app/trust/page.tsx`, `app/trust/trust-content.tsx`
- `/stack`: `app/stack/page.tsx`, `app/stack/stack-content.tsx`
- `/process`: `app/process/page.tsx`, `app/process/process-content.tsx`
- `/path`: `app/path/page.tsx`, `app/path/path.css`, `components/path/CinematicPath.tsx`

## Important Component Families

Current shared “EL” design components:

- `components/el/Section.tsx`
- `components/el/Surface.tsx`
- `components/el/CtaLink.tsx`
- `components/el/Hairline.tsx`
- `components/el/MonoLabel.tsx`
- `components/el/Reveal.tsx`
- `components/el/RegistrationTicks.tsx`
- `components/el/StatDisplay.tsx`

Living-system components:

- `components/living/LivingSystemsHome.tsx`
- `components/living/LivingPageSystem.tsx`
- `components/living/DynamicRouteDeepening.tsx`
- `components/living/DeepSystemDiagram.tsx`
- `components/living/ScrollDrawDiagram.tsx`
- `components/living/SystemFlowLayer.tsx`
- `components/living/RouteConversionCta.tsx`

Visual/proof helpers:

- `components/evidence-strip.tsx`
- `components/logo-strip.tsx`
- `components/social-proof/*`
- `components/diagrams/*`
- `components/pipeline/*`
- `components/pull-quote.tsx`
- `components/page-hero-bg.tsx`

Brand/logo:

- `components/brand/sage-living-mark.tsx`
- `components/sage-logo.tsx`
- `components/sage/*`

## Data Sources

Primary website data:

- `data/services/*`
- `data/work/*`
- `data/projects.ts`
- `data/case-studies.ts`
- `data/compare/comparisons.ts`
- `data/industries/verticals.ts`
- `data/lab/*`
- `data/references.ts`
- `data/social-proof/*`
- `data/home/living-projects.ts`
- `data/seo/keyword-map.ts`

Content:

- `content/blog/*.mdx`
- `content/legal/*.mdx`

SEO:

- `app/sitemap.ts`
- `app/robots.ts`
- `app/feed.xml/route.ts`
- `app/atom.xml/route.ts`
- `app/og/route.tsx`
- `lib/seo/*`
- `data/seo/*`
- `docs/seo/*`

## Existing Design Docs And Audits

Use these as background:

- `docs/BRAND_CREATIVE_BRIEF.md`
- `docs/DESIGN_BRIEF_V2.md`
- `docs/DESIGN_LABS_MASTER_PROMPT.md`
- `docs/DESIGN_ROUTE_AUDIT.md`
- `docs/UIUX_50M_AGENCY_AUDIT_2026-06-17.md`
- `docs/UIUX_COHESION_AUDIT_2026-06-17.md`
- `docs/UIUX_REPAIR_PROGRAMS_2026-06-17.md`
- `docs/codex-design-qa-handoff.md`
- `docs/design/quality-rubric.md`
- `docs/design-reference/living-systems-mock/*`
- `docs/marketing/proof-system.md`
- `docs/marketing/distribution-launch-calendar.md`
- `docs/marketing/program-h-launch-execution.md`

## Screenshot / Design Evidence

Design review artifacts are under:

- `.design-review/`

High-signal screenshots:

- `.design-review/final-live-home-1440.png`
- `.design-review/final-live-home-390.png`
- `.design-review/design-lock-home-1440.png`
- `.design-review/design-lock-home-390.png`
- `.design-review/audit-uiux-home-1440.png`
- `.design-review/audit-uiux-home-390.png`
- `.design-review/audit-uiux-services-1440.png`
- `.design-review/audit-uiux-services-390.png`
- `.design-review/audit-uiux-work-1440.png`
- `.design-review/audit-uiux-work-390.png`
- `.design-review/audit-uiux-pricing-1440.png`
- `.design-review/audit-uiux-pricing-390.png`
- `.design-review/audit-uiux-contact-1440.png`
- `.design-review/audit-uiux-contact-390.png`
- `.design-review/cohesion-services-ai-development-1440.png`
- `.design-review/cohesion-services-ai-development-390.png`
- `.design-review/cohesion-industries-final-1440.png`
- `.design-review/cohesion-industries-final-390.png`

Prototype folders:

- `.design-review/dojo-scroll-prototype/`
- `.design-review/dojo-scroll-prototype-v2/`
- `.design-review/dojo-scroll-prototype-v3/`
- `.design-review/dojo-scroll-prototype-v4/`
- `.design-review/dark-kinetic/`
- `.design-review/dark-kinetic-v2/`
- `.design-review/dark-kinetic-v3/`
- `.design-review/dark-kinetic-v4/`
- `.design-review/system-v5/`
- `.design-review/waveA/`
- `.design-review/waveB/`
- `.design-review/waveC/`
- `.design-review/wave-d/`
- `.design-review/wave3/`
- `.design-review/wave4-7/`

## What To Polish

Primary design goals:

1. Make the homepage feel finished, premium, and immediately legible.
2. Improve visual hierarchy on services, work, pricing, contact, industries, compare, lab, and blog.
3. Normalize spacing and section rhythm across all public routes.
4. Tighten mobile layouts and nav behavior.
5. Make proof/case-study pages feel like professional agency proof, not internal notes.
6. Reduce visual noise while preserving the Living Systems identity.
7. Keep CTAs clear and consistent.
8. Preserve SEO content, route structure, metadata, and public API behavior.
9. Do not alter admin, portal, Revenue OS, Job Application OS, auth, or Supabase behavior.
10. Do not delete screenshots or design-review artifacts.

## Design Constraints

Do:

- Use existing token system in `app/globals.css`.
- Prefer existing component families before inventing new primitives.
- Preserve route URLs and content structure.
- Maintain dark, premium, engineered tone.
- Verify desktop and mobile with screenshots.
- Keep text readable: no overlapping text, no clipped buttons, no hero text hidden below folds.
- Use real screenshots/assets where they clarify proof.

Do not:

- Do not introduce decorative gradient orb backgrounds.
- Do not convert the site into a landing-page template.
- Do not hide actual work/proof behind vague visual decoration.
- Do not break admin/portal auth.
- Do not commit secrets.
- Do not remove SEO routes, sitemap, feed, or OG route.
- Do not push to live from the design-only session.

## Suggested Design QA Viewports

Run Playwright or manual browser screenshots at:

- 390 x 844
- 768 x 1024
- 1024 x 768
- 1440 x 1000
- 1728 x 1117

Primary route set:

- `/`
- `/services`
- `/services/ai-development`
- `/work`
- `/work/nexural`
- `/pricing`
- `/contact`
- `/compare`
- `/industries`
- `/lab`
- `/blog`
- `/studio`

## Verification Status At Handoff

Recently verified locally:

- `npm run typecheck` passed.
- `npm run build` passed.
- Local server is running at `http://localhost:3042/`.
- Homepage returns `200 OK`.

Known caveats:

- The working tree contains many unrelated local changes across admin, Discord, Job Application OS, content, and design-review artifacts.
- Full global `npm run lint` previously hit unrelated existing script lint errors in `scripts/create-samurai-layers.cjs`.
- This handoff is for design polish only. Treat non-public-app code as out of scope unless a public page imports it.

## Deliverables Expected From Design Polish Session

The design-focused session should return:

1. A short summary of visual changes.
2. A list of files edited.
3. Before/after screenshots or screenshot paths for desktop and mobile.
4. Verification commands and results.
5. Any remaining design risks.
6. A clean patch that can be brought back here for final testing and deployment.

## Copy-Paste Prompt

Use the separate prompt file:

- `docs/design/SAGE_IDEAS_DESIGN_POLISH_PROMPT_2026-06-19.md`

