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
| `/services/[slug]` | 88 | Needs polish | Deepening layer added; upper service template still uses older EL styling. | Batch 2 |
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
| `/compare/[slug]` | 87 | Needs polish | Deepening layer added; table section still older EL. | Batch 2 |
| `/industries` | 82 | Needs polish | Good EL page; should get Living hero/proof strip like `/lab`. | Batch 1 |
| `/industries/[slug]` | 86 | Needs polish | Deepening layer added; upper sections still older EL. | Batch 2 |
| `/lab` | 89 | Done | Converted this pass to Living product proof system. | Complete |
| `/lab/[slug]` | 86 | Needs polish | Deepening layer + screenshots added; upper tearsheet still older EL. | Batch 2 |

## Content / SEO Machine

| Route | Grade | Status | Notes | Batch |
| --- | ---: | --- | --- | --- |
| `/blog` | 86 | Needs polish | Strong content index; still more editorial than Living. React key warning fixed. | Batch 3 |
| `/blog/[slug]` | 86 | Needs polish | Articles are readable and indexed; can add richer diagrams/CTAs by cluster. | Batch 3 |
| `/topics` | 82 | Needs polish | Useful hub index; needs Living hero/proof strip. | Batch 3 |
| `/topics/[hub]` | 84 | Needs polish | Hub pages work; need stronger cluster diagrams and academy/service routing. | Batch 3 |
| `/pov` | 84 | Needs polish | On-brand editorial, older composition. | Batch 3 |
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
| `/services/ai-development` | 62 | Old system | Legacy alias page. | Batch 1 |
| `/services/cloud-infrastructure` | 62 | Old system | Legacy alias page. | Batch 1 |
| `/services/enterprise-qa` | 60 | Old system | Legacy alias page. | Batch 1 |
| `/services/fintech` | 62 | Old system | Legacy alias page. | Batch 1 |
| `/services/technical-consulting` | 62 | Old system | Legacy alias page. | Batch 1 |
| `/services/trading-systems` | 62 | Old system | Legacy alias page. | Batch 1 |
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
   - Finish `/industries`.
   - Decide redirects vs reskins for legacy service aliases.
   - Convert or canonicalize old aliases that compete with `/services/[slug]`.

2. **Batch 2: dynamic page upper sections**
   - Bring `/services/[slug]`, `/industries/[slug]`, `/lab/[slug]`, `/compare/[slug]` upper sections fully into Living typography/palette.
   - Keep data-driven deepening layer.

3. **Batch 3: editorial/content system polish**
   - Living cluster diagrams on `/topics` and `/topics/[hub]`.
   - Stronger article CTAs by cluster.
   - Academy/internal-link modules in articles.

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

Next page to clean:
- `/industries` index, then legacy service aliases.
