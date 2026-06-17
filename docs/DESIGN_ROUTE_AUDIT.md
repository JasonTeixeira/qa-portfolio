# Design Route Audit

Last updated: 2026-06-16

Goal: remove old visual systems from the public site and keep every page aligned to the Living Systems / Living Gradient direction.

Scoring:
- `Done`: cohesive with the Living Systems direction, verified recently.
- `Needs polish`: usable and on-brand enough, but still carries older EL section structure or needs stronger motion/visual hierarchy.
- `Old system`: visibly legacy, plain utility/auth/legal styling, or not yet converted.
- `Private surface`: admin/portal/auth utility surface; should be clean and usable, but not part of the premium marketing wow path.

## Public Marketing Core

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/` | 96 | Done | Locked Living Systems homepage. Nav overlap fixed by forwarding pathname through middleware. | Complete |
| `/work` | 94 | Done | Living hero, proof strip, Surface/System panel. | Complete |
| `/work/[slug]` | 92 | Done | Case study pages have Living System panels and architecture sections. | Complete |
| `/services` | 92 | Done | Living hero, conversion map, service catalog. | Complete |
| `/services/[slug]` | 91 | Done | Dynamic standard and flagship service heroes now use Living shell, hero, diagram, proof strip, and preserved checkout/contact paths. | Complete |
| `/pricing` | 92 | Done | Living hero, proof strip, conversion map, checkout paths. | Complete |
| `/academy` | 92 | Done | Living hero and academy funnel. | Complete |
| `/academy/[track]` | 90 | Done | Track pages aligned. | Complete |
| `/academy/[track]/enroll` | 90 | Done | Early-access product page; final checkout waits for packaging. | Complete |
| `/founder` | 91 | Done | Living hero and founder proof. | Complete |
| `/studio` | 91 | Done | Living studio system page. | Complete |
| `/trust` | 90 | Done | Living trust layer plus empty-safe attributed proof slots. | Complete |
| `/contact` | 91 | Done | Living contact/conversion path. | Complete |
| `/book` | 90 | Done | Living booking route. | Complete |
| `/capabilities` | 90 | Done | Living capability matrix. | Complete |
| `/process` | 89 | Done | Living proof/system layer. | Complete |
| `/compare` | 88 | Done | Converted this pass to Living decision graph. | Complete |
| `/compare/[slug]` | 90 | Done | Dynamic comparison heroes now use Living decision graph and proof strip while preserving the honest tradeoff table. | Complete |
| `/industries` | 90 | Done | Converted to canonical Living shell, hero, diagram, proof strip, and conversion map. | Complete |
| `/industries/[slug]` | 90 | Done | Dynamic industry heroes now use Living shell, industry graph, proof strip, and conversion actions. | Complete |
| `/lab` | 89 | Done | Converted this pass to Living product proof system. | Complete |
| `/lab/[slug]` | 90 | Done | Dynamic lab tearsheets now use Living product graph, proof strip, and product/site actions. | Complete |

## Content / SEO Machine

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/blog` | 87 | Needs polish | Strong content index; old cyan accents replaced with Living accent. Still needs richer cluster CTAs and diagrams. | Batch 3 |
| `/blog/[slug]` | 86 | Needs polish | Articles are readable and indexed; can add richer diagrams/CTAs by cluster. | Batch 3 |
| `/topics` | 91 | Done | Converted to Living content-map hero, diagram panel, proof strip, cluster cards, and reader-routing CTAs. | Complete |
| `/topics/[hub]` | 90 | Done | Converted to Living cluster hero, diagram panel, money-route sidebar, open-gap roadmap, and conversion map. | Complete |
| `/pov` | 87 | Needs polish | Editorial page is palette-aligned to Living accent; still needs a custom system diagram / article CTA layer. | Batch 3 |
| `/changelog` | 78 | Needs polish | Functional; should get living release ledger treatment. | Batch 4 |
| `/engineering-os` | 82 | Needs polish | Strong evidence page; custom older proof-console style. | Batch 4 |
| `/stack` | 76 | Needs polish | Useful but still older tech-grid page. | Batch 4 |

## Tools / Lead Magnets

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/tools/seo-audit` | 78 | Needs polish | Functional lead magnet; needs Living visual system and stronger conversion bridge. | Batch 4 |
| `/lab/ai-readiness` | 76 | Needs polish | Useful diagnostic; needs premium result surface and Living wrapper. | Batch 4 |
| `/lab/calculators` | 74 | Needs polish | Useful calculators; older utility presentation. | Batch 4 |
| `/lab/templates` | 74 | Needs polish | Utility library; needs stronger academy/content funnel design. | Batch 4 |
| `/lab/templates/[slug]` | 72 | Needs polish | Template details need stronger visual and CTA treatment. | Batch 4 |

## Legacy Service Alias Pages

These routes are older SEO/service pages and should either redirect into canonical `/services/[slug]` pages or be reskinned with the same Living dynamic template.

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/services/ai-development` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/cloud-infrastructure` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/enterprise-qa` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/fintech` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/technical-consulting` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/trading-systems` | 88 | Done | Converted to shared Living legacy-service alias template while preserving SEO route intent. | Complete |
| `/services/site-starter` | 70 | Needs polish | Productized legacy page; either canonicalize or reskin. | Batch 2 |
| `/services/studio-engagement` | 70 | Needs polish | Important custom-scope page; should be converted, not removed. | Batch 2 |
| `/services/site-care` | 72 | Needs polish | Care template; reskin after alias decision. | Batch 2 |
| `/services/brand-care` | 72 | Needs polish | Care template; reskin after alias decision. | Batch 2 |
| `/services/content-care` | 72 | Needs polish | Care template; reskin after alias decision. | Batch 2 |

## Utility / Legal / Auth

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/legal` | 68 | Old system | Should be quiet, not cinematic; needs token cleanup. | Batch 5 |
| `/legal/privacy` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/legal/terms` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/legal/cookies` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/legal/msa` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/legal/nda` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/legal/sow-template` | 66 | Old system | Legal doc shell. | Batch 5 |
| `/login` | 70 | Private surface | Clean enough for auth, not marketing. | Batch 5 |
| `/signup` | 70 | Private surface | Clean enough for auth, not marketing. | Batch 5 |
| `/auth/*` | 68 | Private surface | Utility auth states. | Batch 5 |
| `/checkout/success` | 68 | Needs polish | Money-path state should be premium. | Batch 5 |
| `/checkout/cancel` | 68 | Needs polish | Money-path state should be premium. | Batch 5 |
| `/offline` | 64 | Old system | PWA utility. | Batch 5 |
| `/unsubscribe` | 64 | Old system | Email utility. | Batch 5 |
| `/onboarding` | 68 | Private surface | Portal onboarding. | Batch 5 |
| `/pending-approval` | 68 | Private surface | Portal utility. | Batch 5 |
| `/hire-ai-engineer` | 72 | Needs polish | Recruiter page, not agency core; decide keep vs archive. | Batch 5 |

## Batch Plan

1. **Batch 1: old public aliases and indexes**
   - Completed `/industries`.
   - Completed shared Living reskin for legacy service aliases while preserving their SEO entry routes.
   - Remaining cleanup: decide whether old content-only helpers in `app/services/services-content.tsx` should be archived.

2. **Batch 2: dynamic page upper sections**
   - Completed `/services/[slug]` standard and flagship heroes.
   - Completed `/industries/[slug]`, `/lab/[slug]`, and `/compare/[slug]` upper sections.
   - Kept data-driven deepening layer and existing conversion paths.

3. **Batch 3: editorial/content system polish**
   - Completed Living cluster diagrams and routing on `/topics` and `/topics/[hub]`.
   - Replaced old content-scope cyan accents on `/blog` and `/pov`.
   - Remaining: stronger article CTAs by cluster and academy/internal-link modules in `/blog/[slug]`.

4. **Batch 4: tools and proof utilities**
   - Reskin SEO audit, readiness score, calculators, templates, engineering OS, stack, changelog.
   - Make each tool route a conversion route.

5. **Batch 5: utility states**
   - Legal/auth/checkout/offline/unsubscribe cleanup.
   - Quiet, consistent, accessible, low-motion.

## Current Priority

Immediate fix completed:
- Homepage duplicate nav removed by forwarding `x-pathname` through middleware.
- `/compare` and `/lab` converted to Living-style page shells in this pass.
- Batch 1 global cohesion pass added canonical Living shell/hero/section/diagram/CTA/proof components.
- `/industries` and six legacy service aliases converted to the Living system.

Next page to clean:
- Editorial/content system polish: `/blog/[slug]` article template CTAs, then `/pov` custom diagram/CTA layer.
