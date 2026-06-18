# PostHog CRO ICE Backlog — UX-8 Phase 8.4

Last updated: 2026-06-17

This backlog turns the design system into a measured revenue system. Every test
must ship behind a PostHog feature flag, use honest copy, and run until it has
enough traffic to make a directional decision.

ICE = `(Impact + Confidence + Ease) / 3`.

## First 5 Experiments

| Rank | Flag key | Hypothesis | Pages | Primary metric | Guardrail | Impact | Confidence | Ease | ICE |
|---:|---|---|---|---|---|---:|---:|---:|---:|
| 1 | `route_finder_hero_entry` | Moving Route Finder into the first viewport increases qualified diagnostic completions because visitors get a useful next step before browsing. | `/`, `/services`, `/pricing` | `route_finder_complete` / sessions | No drop in `booking_click` | 9 | 7 | 7 | 7.7 |
| 2 | `services_matrix_cta_copy` | Replacing generic service CTAs with context-specific verbs increases clicks into service pages and booking. | `/services`, `/services/[slug]` | `route_console_click` and `booking_click` | No drop in `contact_submit` | 8 | 7 | 8 | 7.7 |
| 3 | `pricing_quote_builder_entry` | A quote-builder CTA above tier cards will outperform direct checkout for complex visitors because it lowers commitment anxiety. | `/pricing` | `checkout_start` plus `contact_submit` | No increase in bounce rate | 8 | 6 | 7 | 7.0 |
| 4 | `academy_diagnostic_cta` | Academy pages convert better when the first CTA is a diagnostic path, not a generic course browse CTA. | `/academy`, `/academy/[track]`, `/blog/*` | `academy_track_selected` and `newsletter_signup` | No drop in article read depth | 7 | 7 | 7 | 7.0 |
| 5 | `seo_audit_result_cta` | Audit result pages produce more consultations when the CTA references the detected issue category instead of a generic booking prompt. | `/tools/seo-audit/r/*` | `booking_click` and `contact_submit` | No drop in report shares | 8 | 6 | 6 | 6.7 |

## Implementation Rules

- Control must remain the current live experience.
- Treatment must change one major variable at a time.
- Use `trackEvent()` events from `lib/analytics/events.ts`; do not create ad hoc event names.
- Mask all form/session replay input.
- Minimum run: 14 days unless traffic is too low, then keep running until there are at least 100 primary-metric events or make only a qualitative call.
- Decision states: `ship`, `iterate`, `stop`, `inconclusive`.

## Experiment Specs

### 1. Route Finder Hero Entry

- Control: Route Finder appears as an available tool/resource path.
- Treatment: First-viewport diagnostic CTA module appears under hero/service matrix.
- Primary event: `route_finder_complete`.
- Supporting events: `route_finder_start`, `route_finder_step`, `route_finder_cta_click`.
- Segment cuts: organic, direct, social, returning visitor.

### 2. Services Matrix CTA Copy

- Control: existing CTA labels.
- Treatment: action-specific labels:
  - `Map my AI system`
  - `Scope the app build`
  - `Price the growth engine`
  - `See the operating model`
- Primary event: `route_console_click`.
- Secondary event: `booking_click`.

### 3. Pricing Quote Builder Entry

- Control: current pricing tier CTA hierarchy.
- Treatment: quote-builder CTA appears before tiers and routes to a short diagnostic.
- Primary event: `checkout_start`.
- Secondary events: `contact_submit`, `route_finder_complete`.
- Guardrail: no drop in pricing page scroll depth or CTA clicks.

### 4. Academy Diagnostic CTA

- Control: course/track browsing CTA.
- Treatment: diagnostic CTA that recommends a track based on stage and goal.
- Primary event: `academy_track_selected`.
- Secondary event: `newsletter_signup`.
- Guardrail: no drop in article CTA clicks.

### 5. SEO Audit Result CTA

- Control: generic consult/booking CTA.
- Treatment: CTA copy changes by result category:
  - technical SEO: `Fix the crawl path`
  - content: `Build the authority map`
  - conversion: `Turn this traffic into leads`
- Primary event: `booking_click`.
- Secondary events: `contact_submit`, `lead_magnet_complete`.
- Guardrail: no drop in audit report completion or report return visits.

## PostHog Setup Checklist

- [x] Code-side feature flag helper exists in `lib/analytics/experiments.ts`.
- [x] `route_finder_hero_entry` treatment component exists in `components/cro/RouteFinderHeroExperiment.tsx`.
- [x] Treatment is wired on `/`, `/services`, and `/pricing`.
- [x] Session replay config is code-ready with masked inputs in `components/analytics/posthog-provider.tsx`.
- [ ] Create all flag keys above.
- [ ] Configure 50/50 split for first experiment only.
- [ ] Keep the other four flags created but inactive until prior test is reviewed.
- [ ] Enable session replay in the PostHog workspace.
- [ ] Create saved dashboard from `docs/analytics/posthog-funnels-dashboard.md`.
- [ ] Review dashboard weekly and log decisions below.

## Decision Log

| Date | Experiment | Decision | Evidence | Next action |
|---|---|---|---|---|
| 2026-06-17 | Backlog created | queued | Needs PostHog workspace setup and production traffic. | Configure dashboard and launch first flag. |
| 2026-06-17 | `route_finder_hero_entry` | code ready | Helper, treatment component, event registry, and masked replay config shipped locally. | Create flag in PostHog and start 50/50 split. |
