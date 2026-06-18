# PostHog Funnels + Dashboard — UX-8 / Program D

Last updated: 2026-06-17

## Purpose

This is the build spec for the operating dashboard. It should answer, in under
30 seconds: where visitors came from, which pages moved them, where they stalled,
and which offers created leads, calls, checkout starts, or academy interest.

Events are defined in `lib/analytics/events.ts` and bridged to GA4 through
`trackEvent()`.

## Required Events

- `contact_submit`
- `checkout_start`
- `checkout_complete`
- `booking_click`
- `lead_magnet_start`
- `lead_magnet_complete`
- `newsletter_signup`
- `pricing_view`
- `service_view`
- `route_finder_start`
- `route_finder_step`
- `route_finder_complete`
- `route_finder_cta_click`
- `route_console_open`
- `route_console_click`
- `academy_track_selected`
- `experiment_viewed`

## Funnels

### 1. Studio Acquisition Funnel

Window: 30 days. Conversion window: 7 days.

1. `$pageview` where `$pathname` is `/`, `/services`, `/pricing`, `/work`, `/blog`, or starts with `/services/`
2. `route_console_click` OR `pricing_view` OR `service_view` OR `lead_magnet_start`
3. `contact_submit` OR `booking_click` OR `checkout_start` OR `route_finder_complete`
4. `checkout_complete` OR `contact_submit`

### 2. SEO Audit Lead Magnet

Window: 30 days. Conversion window: 24 hours.

1. Pageview `/tools/seo-audit`
2. `lead_magnet_start` with `tool=seo_audit`
3. `lead_magnet_complete` with `tool=seo_audit`
4. Pageview `/tools/seo-audit/r/*`
5. Pageview `/book`

### 3. Route Finder Diagnostic

Window: 30 days. Conversion window: 24 hours.

1. Pageview `/tools/route-finder`
2. `route_finder_start`
3. `route_finder_step`
4. `route_finder_complete`
5. `route_finder_cta_click`
6. `contact_submit` OR `booking_click` OR `checkout_start`

### 4. Service Money Page

Window: 30 days. Conversion window: 7 days.

1. Pageview `/services`
2. `service_view`
3. `route_console_click` OR `cta_click`
4. `checkout_start` OR `booking_click` OR `contact_submit`
5. `checkout_complete` OR `contact_submit`

### 5. Content to Conversion

Window: 30 days. Conversion window: 7 days.

1. Pageview `/blog/*` or `/topics/*`
2. `academy_track_selected` OR `lead_magnet_start` OR `route_console_click`
3. `newsletter_signup` OR `lead_magnet_complete` OR `route_finder_complete`
4. `booking_click` OR `checkout_start` OR `contact_submit`

### 6. Academy Interest

Window: 30 days. Conversion window: 7 days.

1. Pageview `/academy`
2. `academy_track_selected`
3. Pageview `/academy/[track]`
4. Pageview `/academy/[track]/enroll` OR `newsletter_signup`
5. `checkout_start` when checkout is enabled

## Dashboard Tiles

Pin these to one dashboard named `Sage Ideas — Acquisition Engine`.

| Tile | Type | Window | Breakdown / filter |
|---|---|---:|---|
| Visitors by source | Line | 30d | `$referring_domain`, `utm_source` |
| Top landing pages by conversion | Table | 30d | `$pathname`; metric: any core conversion |
| Studio acquisition funnel | Funnel | 30d | Funnel 1 above |
| Route Finder completion | Funnel | 30d | Funnel 3 above |
| SEO audit completion | Funnel | 30d | Funnel 2 above |
| Service demand | Bar | 30d | `service_view.slug` |
| Pricing intent | Trend | 30d | `pricing_view`, `checkout_start` |
| Content to lead | Funnel | 30d | Funnel 5 above |
| Academy interest | Funnel | 30d | Funnel 6 above |
| CTA clicks | Bar | 7d | `cta_click.label`, `route_console_click.label` |
| Calls booked by source | Table | 30d | `booking_click` by `utm_source` / `$referring_domain` |
| Checkout starts by service | Bar | 30d | `checkout_start.slug` |
| Newsletter signups | Bar | 30d | `newsletter_signup.source` |
| Web vitals regression watch | Table | 7d | `web_vital` by route, if available |
| Session replay triage | Playlist | 7d | abandoned form, abandoned checkout, long scroll no CTA |

## Dashboard Filters

- Date range: last 30 days by default.
- Exclude internal traffic where email/domain or IP filters are available.
- Saved segments:
  - `Organic search`
  - `AI referrals`
  - `Social`
  - `Direct`
  - `Returning visitors`
  - `Academy intent`
  - `Studio intent`

## Weekly Review Ritual

Every Monday, review:

1. Highest-converting landing page.
2. Highest-dropoff funnel step.
3. Top CTA by clicks and conversion.
4. Top service by demand.
5. Top article/topic by next action.
6. Sessions with rage clicks, form abandonment, or >75% scroll and no CTA click.
7. One experiment to start, stop, or keep running.

## External Setup Still Required

PostHog dashboard creation requires workspace access. The code is ready:

- `components/analytics/posthog-provider.tsx` initializes PostHog with masked session replay config.
- `lib/analytics/experiments.ts` exposes the `route_finder_hero_entry` feature flag helper.
- `components/cro/RouteFinderHeroExperiment.tsx` renders the first treatment on `/`, `/services`, and `/pricing`.
- `experiment_viewed` events are registered in `lib/analytics/events.ts`.

Once connected, create the funnels above and pin the dashboard as:

`Sage Ideas — Acquisition Engine`

Do not mark Program D fully complete until the dashboard exists in PostHog, internal traffic is filtered, session replay is enabled with masked inputs, and the first 7 days of data are reviewed.
