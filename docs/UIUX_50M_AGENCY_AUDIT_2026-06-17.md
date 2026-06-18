# Sage Ideas UI/UX Audit — $50M Agency Bar

Date: 2026-06-17
Scope: public marketing front end, 1440 desktop + 390 mobile screenshots
Evidence folder: `.design-review/frontend-audit-50m/`

## Executive Read

The site is technically stable and now has a coherent dark Living Systems direction, but it is not yet at the "50M agency" bar. It has a strong homepage foundation, a repaired global nav, large typography, useful conversion routes, and consistent dark surfaces. The gap is not basic UI anymore. The gap is art direction, motion signature, unique visuals, proof assets, and page-specific storytelling.

The current system can look premium in isolated screenshots, but too many pages use the same composition:

- giant left H1
- right-side grid panel with the same wave/route diagram
- metric strip
- dark cards
- limited animation count

That creates consistency, but it also makes the site feel templated. A top-tier agency site needs each page to feel like it belongs to one system while having its own scene, diagram, motion behavior, and conversion purpose.

## Technical Findings

Automated route smoke covered 15 public routes at desktop and mobile:

- All routes returned `200`.
- No console errors were detected.
- No horizontal overflow was detected at `1440` or `390`.
- Homepage H1 renders at `136px` desktop and `56.3px` mobile.
- Most non-home routes have only `2-4` detected animation/motion hooks.
- Homepage has materially more motion and visual density than the rest of the site.

This means the foundation is safe enough to polish aggressively. The weak point is the creative system, not broken rendering.

## Category Scores

| Category | Current | Target | Gap |
| --- | ---: | ---: | --- |
| Brand identity | 78 | 100 | Mark and typography improved, but the visual fingerprint is not unmistakable yet. |
| Global navigation | 82 | 100 | Newly improved; needs final dropdown choreography, active-state polish, and stronger mobile finish. |
| Visual cohesion | 76 | 100 | Palette/type are consistent, but page compositions are too repetitive. |
| Motion graphics | 42 | 100 | Motion exists mostly as small reveals/diagram loops; no sitewide cinematic motion grammar yet. |
| Storytelling diagrams | 58 | 100 | Diagrams are on-brand but too similar. Need page-specific architecture/data-flow visuals. |
| Conversion clarity | 74 | 100 | CTAs exist, but diagnostic route and offer hierarchy are not dominant enough above the fold. |
| Proof/trust | 63 | 100 | Real stats are honest, but proof assets/screenshots/testimonials/logos are under-integrated. |
| Editorial/content engine | 72 | 100 | Blog structure is improved; article templates need richer visual components and better topic journeys. |
| Academy funnel | 68 | 100 | Good direction, but it needs productized course pages, outcomes, curriculum previews, and purchase path. |
| Mobile polish | 74 | 100 | No overflow, but mobile pages still feel like stacked desktop sections more than designed mobile scenes. |
| Accessibility/readability | 82 | 100 | Strong base; some faint mono labels and dense panels need contrast/legibility review. |
| Performance readiness | 84 | 100 | Recent LCP work is strong; motion/video/audio additions need strict budgets. |

Composite premium-readiness score: **69/100**.

## Route Matrix

| Route | Score | Status | Main Issue | Fix |
| --- | ---: | --- | --- | --- |
| `/` | 82 | Strong foundation | Most complete page, but hero still needs a clearer service/academy/resource map above fold. | Add animated offer matrix and route-finder entry without crowding hero. |
| `/services` | 70 | Cohesive but generic | Strong type, but "Custom welcome" reads awkward and the right diagram is reused language. | Build a service matrix scene with AI/apps/SaaS/brand/growth lanes. |
| `/pricing` | 72 | Clear but static | Good honesty, weak drama; pricing should feel like an operating console. | Add interactive tier comparator and checkout/readiness path motion. |
| `/work` | 68 | Underpowered for proof | Should be the most visually impressive proof page; currently feels like another template hero. | Use real product screenshots, x-ray overlays, case-study reel, system diagrams per product. |
| `/blog` | 73 | Solid editorial base | Looks cleaner, but lacks magazine-level editorial hierarchy and content journeys. | Add featured story treatment, topic rails, series cards, visual shortcode previews. |
| `/academy` | 70 | Promising but not productized | Needs to feel like a premium learning product, not a section of the agency site. | Add course catalog, curriculum preview, outcomes, enrollment flow, learner path diagram. |
| `/lab` | 69 | Good concept, thin proof | Product proof needs actual product visuals and stronger product identity. | Replace generic panels with product screenshots and build architecture cards. |
| `/compare` | 68 | Useful but plain | Comparison pages are conversion assets but lack sharp visual contrast. | Add decision matrices, cost curves, risk maps, and "choose this when" flows. |
| `/contact` | 66 | Functional, not premium | Contact page should diagnose the lead, not just offer form choices. | Replace with Sage Route Finder diagnostic intake plus direct booking fallback. |
| `/tools/route-finder` | 76 | Strategically important | Right idea, not visually central enough to brand. | Turn into a signature interactive diagnostic with animated result map. |
| `/tools/seo-audit` | 72 | Useful lead magnet | Needs more premium report-preview storytelling. | Add live report preview, crawl visual, before/after SEO architecture. |
| `/services/[slug]` | 70 | Better than average | Strong copy, repeated visual template. | Each service gets unique process diagram, deliverables map, proof block, CTA logic. |
| `/industries/[slug]` | 68 | Needs specificity | Industry pages need domain-specific proof and visuals. | Add industry threat/opportunity maps and service route matrix. |
| `/lab/[slug]` | 65 | Proof gap | Product pages need real screenshots and architecture depth. | Add product media, tech stack, schema/API/system map, shipped evidence. |
| `/compare/[slug]` | 68 | Conversion useful | Needs stronger executive decision framing. | Add interactive decision scorecard and cost/time/risk visualization. |

## Primary Weaknesses

### 1. No Finished Motion Graphics System

The site has motion pieces, not a motion identity. A $50M agency site needs recognizable motion rules:

- nav opens like a command/control surface
- page transitions have a shared wipe/reveal language
- diagrams draw on scroll
- data packets move only inside systems/diagrams
- product surfaces x-ray into architecture
- metrics count up when visible
- panels respond subtly to cursor/scroll
- offscreen loops pause
- reduced motion stays fully static and readable

Current issue: too many routes have only light reveal motion.

### 2. Repeated Diagram Language

The wave-line diagram is now overused. It helped unify the design, but it is becoming wallpaper.

Needed:

- service matrix diagram
- pricing engine diagram
- content flywheel diagram
- academy learning path diagram
- product architecture diagrams
- comparison decision maps
- route-finder diagnostic graph

Same palette, different structures.

### 3. Proof Assets Are Not Strong Enough

The brand promise is "I build the product, the brand, and the AI that runs it." The proof pages need to show products.

Needed:

- real screenshots for Nexural, AlphaStream, Jobpoise, Trayd
- founder photo
- verified testimonials or testimonial source links
- GitHub/repo proof module
- case study visuals with surface/system toggle
- real deployment/product links where safe

Without this, the site still feels concept-driven instead of evidence-driven.

### 4. Offer Architecture Is Not Immediate Enough

Above the fold, a new visitor should understand the business in 5 seconds:

- Hire the studio
- Run a diagnostic/audit
- Learn through academy
- Read/use resources

Current homepage is strong emotionally, but the service/academy/resource map needs to be more immediate and interactive.

### 5. Mobile Needs Designed Moments

Mobile is not broken, but it is not yet special. A premium mobile experience should have:

- compact animated route chooser
- sticky diagnostic CTA
- shorter hero rhythm
- swipeable proof/product cards
- less repeated tall panel stacking

## Repair Programs

### Program UX-A — Design Lock Foundation

Goal: freeze the system so every page shares one premium language.

Phases:

1. Finalize logo/header/menu/footer.
2. Build canonical motion primitives.
3. Build canonical diagram primitives.
4. Build page-section templates with strict usage rules.
5. Add visual QA checklist and screenshot gate.

Definition of done:

- no old visual surfaces on public marketing pages
- nav/menu feels premium on desktop/mobile
- all pages use the same palette/type/token system
- no repeated generic diagram where a custom one is needed

### Program UX-B — Homepage / Conversion Front Door

Goal: make the first viewport explain the offer and generate action.

Phases:

1. Add above-fold service/academy/resources matrix.
2. Add route-finder diagnostic entry.
3. Add motion choreography to hero/service matrix.
4. Tighten final CTA hierarchy.
5. Verify 1440/390 visual density and LCP.

### Program UX-C — Motion Graphics System

Goal: make the site feel alive without harming performance.

Phases:

1. Shared page transition and section reveal system.
2. Scroll-drawn SVG diagrams.
3. Data packet primitives for system diagrams.
4. Product x-ray overlay primitive.
5. IntersectionObserver pause/resume for loops.
6. Reduced-motion fallback audit.

### Program UX-D — Proof / Work / Lab Upgrade

Goal: make shipped work undeniable.

Phases:

1. Real product screenshots.
2. Product-specific surface/system cards.
3. Case study architecture diagrams.
4. Founder/operator proof section.
5. Testimonial/proof-source integration.

### Program UX-E — Revenue Pages

Goal: make services, pricing, compare, and contact convert.

Phases:

1. `/services` service matrix and route paths.
2. `/services/[slug]` custom diagram and proof block per service.
3. `/pricing` interactive tier comparison.
4. `/compare` decision maps.
5. `/contact` diagnostic-first intake.

### Program UX-F — Content / Academy Machine

Goal: turn readers into academy buyers and studio leads.

Phases:

1. Blog editorial hierarchy pass.
2. Article page visual component pass.
3. Academy course product pages.
4. Topic hubs and internal linking paths.
5. Lead magnets and content upgrades.

## Immediate Next Build Wave

Do **UX-A Phase 2 + UX-C Phase 1** next:

- build canonical motion primitives
- apply them to the top shared page shell
- make section reveals/diagram draws consistent
- add visible but restrained motion to services, pricing, work, blog, academy
- verify screenshots at 1440 and 390

This is the fastest path from "cohesive but static" to "premium and alive."
