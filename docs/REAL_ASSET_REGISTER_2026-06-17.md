# Real Asset Register — 2026-06-17

This file records what the site can honestly use today and what is still blocked.

## Approved / Available In Repo

- Founder photo: `public/founder/portrait.jpg`
- Founder alternate: `public/founder/portrait-ai.png`
- Editorial founder image: `public/images/founder-editorial.jpg`
- Product hero images:
  - `public/work/heroes/nexural.png`
  - `public/work/heroes/alphastream.png`
  - `public/work/heroes/jobpoise.png`
  - `public/work/heroes/trayd.png`
  - `public/work/heroes/aws-landing-zone.png`
  - `public/work/heroes/quality-telemetry.png`
  - `public/work/heroes/brand-sprint-rebuild.png`
  - `public/work/heroes/site-care-retainer.png`
- Product screenshots:
  - `public/work/screens/*`
- Real architecture diagrams:
  - `public/images/diagrams/nexural-ecosystem.svg`
  - `public/images/diagrams/alphastream-pipeline.svg`
  - `public/images/diagrams/aws-landing-zone.svg`
  - `public/images/diagrams/cicd-pipeline.svg`
  - `public/images/diagrams/trade-engine-states.svg`

## Approved To Show As Anonymous / NDA-Safe

- Anonymous reference rows in `data/references.ts`
- Monogram-style proof blocks where the client name/logo is intentionally withheld

## Blocked Until Provided / Approved

- Named testimonials with written permission
- Client logos with written permission
- Stripe product IDs and price IDs for academy checkout
- Stripe test purchases for all academy tracks

## Implementation Notes

- Do not fabricate testimonials, metrics, or logos.
- Do not present concept UI as a real screenshot unless it is labeled as concept/demo.
- Use `public/founder/portrait.jpg` as the canonical founder image until a newer approved portrait is provided.
- Academy enrollment shows defined packages/prices/policies, but remains early-access until the blocked Stripe items above are resolved.
