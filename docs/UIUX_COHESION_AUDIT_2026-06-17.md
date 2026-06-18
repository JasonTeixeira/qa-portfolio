# Sage Ideas UI/UX Cohesion Audit

Date: 2026-06-17
Branch: `feat/acquisition-engine-phase-0-1`
Local audit URL: `http://localhost:3040`
Execution plan: [`UIUX_REPAIR_PROGRAMS_2026-06-17.md`](UIUX_REPAIR_PROGRAMS_2026-06-17.md)

## Executive Diagnosis

The site has strong raw ingredients: premium dark palette, Bricolage/Hanken type, real product proof, useful tools, academy direction, and a clear solo-operator story. It is not yet a cohesive "50M agency" front end because the visual system is applied unevenly and most pages still feel like static dark dashboards instead of one living product/brand ecosystem.

Current composite UI/UX score: **66/100**
Target composite score: **92-95/100 before launch polish**, then iterate with real assets and analytics.

The biggest problem is not content volume. The problem is that the site does not yet have one unmistakable interaction fingerprint repeated across every key route.

## Non-Negotiable Design Fingerprint

The signature should be:

- **Surface -> System x-ray**: every major page shows the visible offer/product surface and the operating system beneath it.
- **Living gradient packets**: gradient is reserved for diagram flow, route maps, audit paths, and data movement.
- **Operator cockpit navigation**: menu becomes a command-center map, not a generic mega menu.
- **Diagnostic lead capture**: the primary conversion object is a short routing/diagnosis experience, not just "contact us."
- **Proof-led motion**: motion reveals real decisions, routes, systems, timelines, and constraints. No decorative blobs, no fake AI illustration.
- **Opt-in sound**: browser-safe sound control only. No autoplay. High-energy audio can exist as a click-to-activate "system pulse."

## Evidence From Audit Sweep

Audited at 1440 and 390:

- `/`
- `/services`
- `/academy`
- `/blog`
- `/lab`
- `/work`
- `/pricing`
- `/compare`
- `/industries`
- `/tools/seo-audit`
- `/reports/ai-search-readiness-2026`
- `/contact`
- `/founder`

Automated checks:

- 0 console errors on audited routes.
- 0 horizontal overflow on audited routes.
- Shared nav present on audited routes.
- Screenshots saved as `.design-review/audit-uiux-*.png`.

## Core Findings

### 1. The Navigation Is Not Yet Signature

Score: **58/100**

Problems:

- Desktop mega menu looks like a generic dark admin panel over the hero.
- It does not feel like the same motion language as the homepage reel.
- Menu items are too text/list-heavy and do not communicate the Sage Ideas ecosystem quickly.
- Mobile menu is functional but flat, plain, and not premium enough.
- The menu has no diagnostic routing moment: the user still has to think too much.

Required fix:

- Replace mega menu with a **Route Console**:
  - left: animated service route map
  - center: Studio / Academy / Tools / Proof lanes
  - right: "diagnose my path" mini flow
  - bottom: persistent CTA strip with `Run audit`, `Choose path`, `Book call`
- Add menu motion:
  - staggered item reveal
  - line-draw route animation
  - hover changes the diagram node/flow
  - reduced-motion fallback
- Mobile menu becomes a full-screen command panel with large route cards, not a plain link list.

### 2. The Homepage Has the Strongest System, But the Hero Still Needs a Better Splash

Score: **78/100**

What works:

- Clear positioning.
- Strong type.
- New first-screen Studio / Academy / Resources matrix improves offer clarity.
- Product reel and proof sections are directionally right.

Problems:

- Splash/intro is still too subtle for the desired "arrival" moment.
- Above-fold diagram is useful but not yet cinematic enough.
- Product screenshots are present, but the storytelling transition from product surface to architecture is not dramatic enough.
- Sound control exists, but needs a polished system pulse UI and optional audio asset.

Required fix:

- Build a **10-12 second skippable intro**:
  - logo mark draw
  - system grid wakes up
  - offer routes light in sequence: Studio, Academy, Tools, Proof
  - final snap to H1
- Add a premium "Enter system" interaction on first load.
- Replace static hero diagram with an interactive route diagram that reacts to hover/touch.
- Add click-to-enable high-energy audio pulse, stored as a real licensed/owned audio file.

### 3. Services And Pricing Are Valuable But Too Static

Services score: **66/100**
Pricing score: **70/100**

Problems:

- Too many cards and tables with similar density.
- Service architecture is not visual enough.
- The buyer does not get a memorable "this is the whole system" moment.
- Pricing reads useful, not iconic.
- Motion is mostly reveal-level, not story-level.

Required fix:

- Services needs a **Build Path Matrix**:
  - Audit -> Sprint -> Build -> Operate
  - AI Systems / SaaS / Brand-Web / Growth layers
  - each cell routes to productized offers
- Pricing needs a **quote-builder interaction** as the hero object, not buried mid-page.
- Add animated scope diagrams:
  - what is included
  - what is excluded
  - what ships
  - handoff path

### 4. Academy Is Closest To Cohesive

Score: **82/100**

What works:

- Strong hero.
- Good system panel.
- Clear curriculum structure.
- Consistent footer/nav.

Problems:

- Needs more distinctive course product visuals.
- Needs lead capture tied to diagnosis: "what should I learn/build first?"
- Needs motion around learning path progression.
- Needs course packaging and checkout once offers are final.

Required fix:

- Add academy diagnostic:
  - "I want to build: product / brand / AI agent / content engine"
  - returns track recommendation
  - captures email for build list
- Add animated curriculum map.
- Add course cards with real product-like lesson interfaces, not static panels.

### 5. Blog Has A Concrete Layout Bug And Weak Discovery UX

Score: **38/100**

Problems:

- Massive empty vertical space appears after the first post/filter area on desktop and mobile.
- The blog does not feel like a premium content machine.
- It lacks editorial hierarchy, topical routing, and content-series visuals.
- Posts are present, but the archive does not feel alive.

Required fix:

- Fix empty-space/layout bug immediately.
- Rebuild blog as **The Build Record**:
  - featured issue
  - topic lanes
  - reading path by intent
  - "start here" routes
  - diagrams for technical posts
- Add motion:
  - filter transitions
  - issue cards reveal
  - scroll-linked topic rail

### 6. Work Page Is Directionally Good, But Not Yet A Showcase Ceiling

Score: **78/100**

What works:

- Good proof positioning.
- Registry structure feels credible.
- Case study standard is honest.

Problems:

- Needs richer project-specific motion.
- Needs real screenshots and architecture diagrams for every flagship.
- Featured case study should be more cinematic.
- Current imagery is not yet uniformly high-end.

Required fix:

- Create one reusable **Case Study X-Ray Scene**:
  - screenshot surface
  - architecture map
  - metrics/proof rail
  - timeline
  - tradeoffs
- Apply to Nexural first, then AlphaStream, Jobpoise, Trayd.

### 7. Contact Is Strong, But Should Become The Diagnostic Funnel

Score: **82/100**

What works:

- Good routing copy.
- Solid form.
- Founder proof makes the operator model real.

Problems:

- It is still mostly a form.
- Lead capture should diagnose and recommend path before asking for full inquiry.
- It does not yet feel like a signature product interaction.

Required fix:

- Build **Sage Route Finder**:
  - 6-8 questions
  - outputs recommended route: Studio / Audit / Sprint / Academy / Tool
  - captures email
  - stores result in leads/acquisition metadata
  - sends to GA4/PostHog
  - produces a shareable/emailed diagnosis summary

### 8. Founder Page Needs More Editorial Premium

Score: **62/100**

Problems:

- Typography and proof are okay, but the page does not feel like a premium founder/operator profile yet.
- Needs real editorial portrait treatment.
- Needs timeline, shipped systems map, philosophy cards, and "why this studio exists" story.

Required fix:

- Rebuild as **Operator Profile**:
  - hero portrait
  - public proof stats
  - shipped products timeline
  - working principles
  - personal brand funnel into academy and studio

## Page Matrix

| Route | Current | Target | Main Gap | Priority |
|---|---:|---:|---|---|
| `/` | 78 | 94 | Needs cinematic splash, stronger interactive hero diagram, better system audio control | P0 |
| Global nav/menu | 58 | 95 | Not a signature route console; desktop and mobile feel generic | P0 |
| `/services` | 66 | 93 | Too card/table heavy; needs animated service matrix and clearer route logic | P0 |
| `/pricing` | 70 | 92 | Useful but static; quote builder should become the hero object | P0 |
| `/blog` | 38 | 90 | Empty-space bug, weak archive UX, no content-machine feel | P0 |
| `/academy` | 82 | 94 | Needs diagnostic lead capture, animated curriculum, course product visuals | P1 |
| `/work` | 78 | 95 | Needs richer case-study x-ray scenes and real visuals | P1 |
| `/contact` | 82 | 94 | Needs route-finder diagnosis before/alongside form | P1 |
| `/lab` | 72 | 92 | Needs stronger tool/product cards and interactive demos | P1 |
| `/compare` | 70 | 90 | Needs visual comparison diagrams, not just panels | P2 |
| `/industries` | 68 | 90 | Needs industry route maps and sector-specific proof | P2 |
| `/tools/seo-audit` | 74 | 92 | Good utility, needs better report preview and lead loop | P2 |
| `/reports/ai-search-readiness-2026` | 72 | 90 | Needs data-viz polish and report credibility visuals | P2 |
| `/founder` | 62 | 90 | Needs editorial rebuild and better proof/storytelling | P2 |
| Legal/auth/portal | 55-75 | 85 | Need polish, but not public conversion priority | P3 |

## Motion System Required

The site should not just have reveal animations. It needs a motion grammar.

Canonical motion primitives:

- **Draw**: SVG route/architecture lines draw on section entry.
- **Packet flow**: gradient particles move along system edges.
- **X-ray**: product surface scrubs into architecture.
- **Route change**: menu hover changes active node and copy.
- **Counter proof**: numbers count only when visible.
- **Panel morph**: diagnostic answers move user through stages.
- **Sound pulse**: optional click-to-enable audio meter reacts visually.

Implementation rules:

- No autoplay audio.
- No motion that hides content by default.
- Respect `prefers-reduced-motion`.
- No Lenis.
- No `content-visibility:auto`.
- Motion must be reusable components, not one-off page hacks.

## Lead Capture System

Build a conversion product, not a contact form.

Name: **Sage Route Finder**

Flow:

1. What are you trying to build?
2. What is broken right now?
3. What do you already have?
4. What timeline matters?
5. Budget/readiness band.
6. Email for diagnosis summary.

Outputs:

- Recommended route: `Audit`, `Sprint`, `Build`, `Operate`, `Academy`.
- Suggested service.
- Suggested academy/resource path.
- Estimated next step.
- Captured lead metadata.
- PostHog/GA4 event path.

Pages where it should appear:

- Homepage hero/final CTA
- Services
- Pricing
- Contact
- SEO audit result
- Academy

## Wave Plan

### Wave 1: Navigation + Design Fingerprint Lock

- Replace desktop mega menu with Route Console.
- Replace mobile menu with full-screen route panel.
- Lock one logo/brand treatment everywhere.
- Add shared animated route diagram primitive.
- Add system pulse sound control polish.

Acceptance:

- Menu feels like the site, not a generic dropdown.
- Route Console screenshot passes 1440 and 390 review.
- No console errors, no overflow.

### Wave 2: Homepage Splash + Lead Diagnostic

- Build skippable splash/entry sequence.
- Upgrade hero diagram into interactive offer router.
- Build Sage Route Finder v1.
- Wire lead capture + analytics events.

Acceptance:

- First viewport clearly explains Studio, Academy, Resources, Proof.
- Lead diagnosis stores source/result.
- Reduced-motion path is static and fully visible.

### Wave 3: Services + Pricing Rebuild

- Services Build Path Matrix.
- Pricing quote-builder as hero object.
- Animated scope/inclusion diagrams.
- Stronger CTA routing to Route Finder.

Acceptance:

- Buyer can understand offer architecture in under 10 seconds.
- Each service tier has a visual system explanation.

### Wave 4: Blog + Content Machine

- Fix empty-space bug.
- Rebuild blog archive as Build Record.
- Add topic routes and editorial cards.
- Add content-to-service CTAs.

Acceptance:

- No dead vertical space.
- Blog feels like a premium publication/product, not a list.

### Wave 5: Work + Case Study X-Ray

- Build reusable case-study x-ray scene.
- Upgrade Nexural first.
- Then AlphaStream, Jobpoise, Trayd.

Acceptance:

- Each case shows surface, system, proof, and buyer path.

### Wave 6: Academy Productization

- Add academy diagnostic.
- Add course product pages and checkout once packaging is final.
- Add animated curriculum map.

Acceptance:

- DIY audience has a clear conversion path separate from high-ticket studio leads.

## Immediate P0 Backlog

1. Replace global nav/menu with Route Console.
2. Fix `/blog` layout dead-space bug.
3. Build reusable `LivingRouteDiagram`.
4. Build `SageRouteFinder` lead diagnostic.
5. Upgrade homepage splash/entry.
6. Rebuild `/services` hero + matrix.
7. Rebuild `/pricing` quote-builder as primary interface.
