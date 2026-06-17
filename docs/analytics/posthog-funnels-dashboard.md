# PostHog Funnels + Dashboard — Program D

Last updated: 2026-06-17

## Required Events

Events are defined in `lib/analytics/events.ts` and bridged to GA4.

Primary conversion events:

- `contact_submit`
- `checkout_start`
- `lead_magnet_complete`
- `newsletter_signup`

## Funnels

### 1. Homepage to Booked Call

1. Pageview `/`
2. `cta_click` where `href` contains `/book`
3. Pageview `/book`
4. `booking_click`

### 2. SEO Audit Lead Magnet

1. Pageview `/tools/seo-audit`
2. `lead_magnet_start` with `tool=seo_audit`
3. `lead_magnet_complete` with `tool=seo_audit`
4. Pageview `/tools/seo-audit/r/*`
5. Pageview `/book`

### 3. Service Money Page

1. Pageview `/services`
2. `service_view`
3. `checkout_start` or `booking_click`
4. `contact_submit`

### 4. Content to Conversion

1. Pageview `/blog/*` or `/topics/*`
2. Click to `/academy`, `/tools/seo-audit`, or `/services/*`
3. `newsletter_signup` or `lead_magnet_complete`

### 5. Academy Interest

1. Pageview `/academy`
2. Pageview `/academy/[track]`
3. Pageview `/academy/[track]/enroll`
4. `newsletter_signup` or `checkout_start` when checkout is enabled

## Dashboard Tiles

- Visitors by source / UTM campaign
- Top landing pages by lead conversion
- SEO audit starts and completions
- Public audit report views
- Calls booked by source
- Checkout starts by service slug
- Newsletter signups by content cluster
- Returning visitors from audit report badges
- Session replay playlist: abandoned form, abandoned checkout, long scroll no CTA

## External Setup Still Required

PostHog dashboard creation requires workspace access. Once connected, create the five funnels above and pin the dashboard as:

`Sage Ideas — Acquisition Engine`

Do not mark Program D fully complete until the dashboard exists in PostHog and the first 7 days of data are reviewed.
