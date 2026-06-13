# Engineering Spec — Program D: Analytics & Measurement

**Status:** Draft
**Depends on:** GA4 Measurement ID + GSC/Bing access ([YOU])
**Stack:** Next.js 16 / PostHog / GA4 / `@next/third-parties/google`
**Program source:** `docs/ACQUISITION_MASTER_PLAN.txt` §D1–D4
**Sibling spec:** Program G (Research & Baseline) — consumes the baseline snapshot this program produces

---

## 1. Objective & 99+ bar

Instrument every funnel step — ATTRACT → ENGAGE → CAPTURE → CLOSE — with a
single typed event taxonomy that writes simultaneously to PostHog and GA4, so
**no decision about the site is made on a guess**.

The 99+ bar from the master plan (`ANALYTICS: 80 → 99`) requires all of:

- GA4 baseline snapshot captured (Program G / D4) before any optimization
- All 11 typed events flowing into both PostHog and GA4 from one call site
- Four GA4 key events (conversions) correctly marked
- Every `leads` row carries a first-touch attribution source
- A single PostHog dashboard answers "what worked this week?" in < 30 s
- No tracking fires before user consent; consent state is the sole gatekeeper

---

## 2. Deliverables

### D-1 GA4 Component

**What:** A `GoogleAnalytics` client component using `@next/third-parties/google`
that loads the GA4 gtag snippet. Production-only. Gated by the existing consent
cookie (`sage-cookie-consent-v1 === 'accepted'`).

**Files:**

- `components/analytics/google-analytics.tsx` — new file (component + consent hook)
- `app/layout.tsx` — add `<GoogleAnalytics />` inside `<PostHogProvider>` after the existing `{process.env.NODE_ENV === 'production' && <Analytics />}` line
- `next.config.ts` — add `https://www.googletagmanager.com` to `connect-src` and `script-src` in the CSP directives

**Interface / contract:**

```ts
// components/analytics/google-analytics.tsx
'use client'

import { GoogleAnalytics as NextGA } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sage-cookie-consent-v1'
type Consent = 'accepted' | 'essential' | null

export function GoogleAnalytics() {
  const [consent, setConsent] = useState<Consent>(null)

  useEffect(() => {
    // Read the same key used by CookieBanner (components/studio/cookie-banner.tsx).
    const stored = (() => {
      try { return window.localStorage.getItem(STORAGE_KEY) as Consent }
      catch { return null }
    })()
    setConsent(stored)

    // Re-check if the user updates consent mid-session.
    const handler = () => {
      try { setConsent(window.localStorage.getItem(STORAGE_KEY) as Consent) }
      catch {}
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  if (process.env.NODE_ENV !== 'production') return null
  if (consent !== 'accepted') return null

  return <NextGA gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ''} />
}
```

**Env var (add to `.env.local` and Vercel project settings):**

```
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**app/layout.tsx mount point (inside `<body>`, after Vercel Analytics line):**

```tsx
{process.env.NODE_ENV === 'production' && <Analytics />}
<GoogleAnalytics />
```

**CSP addition in `next.config.ts` `headers()` — extend the existing `cspDirectives` array:**

```ts
// script-src: add
"https://www.googletagmanager.com"

// connect-src: add
"https://www.google-analytics.com"
"https://region1.google-analytics.com"

// img-src already allows https: — no change needed
```

**Acceptance criteria:**

1. GA4 DebugView (`?gtm_debug=1` + GA4 Debug Mode) shows `page_view` on production
2. Component renders `null` in `NODE_ENV !== 'production'`
3. Component renders `null` when consent is `'essential'` or `null`
4. Toggling consent to `'accepted'` mid-session triggers the component (via `storage` event)
5. No `www.googletagmanager.com` requests appear in network panel on localhost

**Tests:**

```ts
// __tests__/google-analytics.test.tsx
import { render } from '@testing-library/react'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'

describe('GoogleAnalytics', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, writable: true })
    localStorage.clear()
  })

  it('renders null in non-production', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true })
    const { container } = render(<GoogleAnalytics />)
    expect(container.firstChild).toBeNull()
  })

  it('renders null when consent is essential-only', () => {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true })
    localStorage.setItem('sage-cookie-consent-v1', 'essential')
    const { container } = render(<GoogleAnalytics />)
    expect(container.firstChild).toBeNull()
  })
})
```

---

### D-2 Event Bridge (one taxonomy, two sinks)

**What:** Extend `lib/analytics/events.ts` so a single `trackEvent` call fans
out to both PostHog (existing `track()`) and GA4 (`window.gtag`). Adds a
`GA4_KEY_EVENTS` set marking the four conversion events. No callers change.

**Files:**

- `lib/analytics/events.ts` — extend `trackEvent` function; add `GA4_KEY_EVENTS`
- `lib/analytics/gtag.ts` — new file; typed `gtag` wrapper; handles `window.gtag` undefined gracefully

**Interface / contract:**

```ts
// lib/analytics/gtag.ts
export const GA4_KEY_EVENTS = new Set([
  'contact_submit',
  'checkout_complete',
  'lead_magnet_complete',
  'booking_click',
] as const)

/**
 * Fire a GA4 event via the gtag data layer.
 * No-ops when window.gtag is undefined (SSR, non-production, pre-consent).
 */
export function gtagEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: Function }).gtag
  if (typeof gtag !== 'function') return
  gtag('event', name, params ?? {})
}
```

```ts
// lib/analytics/events.ts — updated trackEvent
import { track } from '@/components/analytics/posthog-provider'
import { gtagEvent } from './gtag'

export function trackEvent<E extends EventName>(name: E, props: Payloads[E]): void {
  // Sink 1: PostHog (existing)
  track(name, props as Record<string, unknown>)
  // Sink 2: GA4 — only fires when gtag is loaded (production + consent)
  gtagEvent(name, props as Record<string, string | number | boolean>)
}
```

**GA4 event name mapping:** GA4 event names use the same string as the PostHog
`EventName` (snake_case, ≤ 40 chars). No renaming needed; GA4 accepts custom
event names. The four `GA4_KEY_EVENTS` must be manually marked as "Key events"
in the GA4 property UI after the first event fires (see §6 [YOU] checklist).

**Acceptance criteria:**

1. One `trackEvent('contact_submit', {...})` call produces a PostHog event AND a GA4 DebugView event
2. `gtagEvent` is a no-op in unit tests (no `window.gtag`)
3. All 11 event names appear as custom events in GA4 after first production traffic
4. GA4 key events panel shows `contact_submit`, `checkout_complete`, `lead_magnet_complete`, `booking_click` marked (human step — verified in UI)

**Tests:**

```ts
// __tests__/gtag.test.ts
import { gtagEvent } from '@/lib/analytics/gtag'

it('is a no-op when window.gtag is undefined', () => {
  // jsdom has no gtag — should not throw
  expect(() => gtagEvent('test_event', { foo: 'bar' })).not.toThrow()
})

it('calls window.gtag with correct args when defined', () => {
  const mock = jest.fn()
  ;(window as unknown as { gtag: Function }).gtag = mock
  gtagEvent('contact_submit', { inquiryType: 'audit' })
  expect(mock).toHaveBeenCalledWith('event', 'contact_submit', { inquiryType: 'audit' })
  delete (window as unknown as { gtag?: Function }).gtag
})
```

---

### D-3 First-Touch Attribution

**What:** Capture UTM parameters and referrer on the first page load (client-side,
sessionStorage-persisted so it survives within the visit but resets on a new
session). Forward the attribution into `captureLead` metadata on every lead
insertion, extending `LeadInput` and the `captureLead` call sites.

**Files:**

- `lib/analytics/attribution.ts` — new file; capture + retrieve first-touch data
- `components/analytics/attribution-capture.tsx` — new client component; calls capture on mount
- `app/layout.tsx` — mount `<AttributionCapture />` inside `<PostHogProvider>`
- `lib/leads/capture.ts` — extend `LeadInput` to accept `attribution`; merge into `metadata`
- `app/api/contact/route.ts` — pass `attribution` from request body into `captureLead`
- `app/api/tools/seo-audit/route.ts` — pass `attribution` from request body into `captureLead`
- `app/api/checkout/route.ts` — N/A for this phase; checkout does not call `captureLead` directly; attribution is wired via the contact/seo-audit paths

**Interface / contract:**

```ts
// lib/analytics/attribution.ts
export type Attribution = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string        // document.referrer, truncated to 500 chars
  landing_page?: string    // pathname on first touch
  captured_at: string      // ISO timestamp
}

const SESSION_KEY = 'sage-first-touch-v1'

/** Call once at app mount. Writes only if no attribution is stored yet. */
export function captureFirstTouch(): void {
  if (typeof window === 'undefined') return
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return  // already captured this session
    const params = new URLSearchParams(window.location.search)
    const att: Attribution = {
      utm_source:   params.get('utm_source') ?? undefined,
      utm_medium:   params.get('utm_medium') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
      utm_content:  params.get('utm_content') ?? undefined,
      utm_term:     params.get('utm_term') ?? undefined,
      referrer:     document.referrer?.slice(0, 500) || undefined,
      landing_page: window.location.pathname,
      captured_at:  new Date().toISOString(),
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(att))
  } catch {}
}

/** Retrieve the stored first-touch. Returns null if not yet captured. */
export function getFirstTouch(): Attribution | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : null
  } catch { return null }
}
```

```tsx
// components/analytics/attribution-capture.tsx
'use client'
import { useEffect } from 'react'
import { captureFirstTouch } from '@/lib/analytics/attribution'

export function AttributionCapture() {
  useEffect(() => { captureFirstTouch() }, [])
  return null
}
```

```ts
// lib/leads/capture.ts — extend LeadInput
import type { Attribution } from '@/lib/analytics/attribution'

export type LeadInput = {
  source: LeadSource
  email: string | null
  name: string | null
  detail: string
  inquiryType?: string
  budget?: string
  amountCents?: number | null
  metadata?: Record<string, unknown>
  attribution?: Attribution   // <-- new field
  notify?: boolean
}

// In captureLead, merge attribution into metadata before insert:
metadata: {
  ...(input.metadata ?? {}),
  ...(input.attribution ? { first_touch: input.attribution } : {}),
},
```

**Contact/SEO-audit callers:** The client-side form components must read
`getFirstTouch()` and include it in the POST body under the key `attribution`.
The API routes forward it to `captureLead`. The `ContactSchema` (Zod) must
`.passthrough()` the `attribution` field (it already uses `.passthrough()`).

**App layout mount (inside `<PostHogProvider>`, before `<MarketingChrome>`):**

```tsx
<AttributionCapture />
<MarketingChrome position="top" />
```

**Acceptance criteria:**

1. In DevTools Application > sessionStorage, `sage-first-touch-v1` is written on first page load
2. Second navigation within the same tab does not overwrite it
3. A `leads` row created from the contact form has `metadata.first_touch.utm_source` populated when a UTM link is used
4. A `leads` row created from the SEO audit has the same attribution field
5. `getFirstTouch()` returns `null` in SSR / server context without throwing

**Tests:**

```ts
// __tests__/attribution.test.ts
import { captureFirstTouch, getFirstTouch } from '@/lib/analytics/attribution'

beforeEach(() => sessionStorage.clear())

it('writes attribution on first call', () => {
  captureFirstTouch()
  expect(getFirstTouch()).not.toBeNull()
  expect(getFirstTouch()?.captured_at).toBeTruthy()
})

it('does not overwrite on second call', () => {
  captureFirstTouch()
  const first = getFirstTouch()?.captured_at
  captureFirstTouch()
  expect(getFirstTouch()?.captured_at).toBe(first)
})

it('captures utm_source from window.location.search', () => {
  Object.defineProperty(window, 'location', {
    value: { search: '?utm_source=linkedin', pathname: '/services', href: '' },
    writable: true,
  })
  captureFirstTouch()
  expect(getFirstTouch()?.utm_source).toBe('linkedin')
})
```

---

### D-4 GSC + Bing Verification

**What:** Prove domain ownership to Google Search Console and Bing Webmaster
Tools; submit the sitemap; enable query/coverage data to flow into Program G's
baseline snapshot.

**Files:**

- `app/layout.tsx` — add `<meta name="google-site-verification" content="..." />` via `metadata.verification.google` in Next.js Metadata API
- Alternatively: DNS TXT record on the zone apex (preferred; no code change)

**Interface / contract (Next.js Metadata API approach):**

```ts
// app/layout.tsx — extend the existing `metadata` export
export const metadata: Metadata = {
  // ...existing fields...
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? '',
    // Bing uses a separate meta tag — add as other:
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION ?? '',
    },
  },
}
```

```
# .env.local (+ Vercel project settings)
NEXT_PUBLIC_GSC_VERIFICATION=<token from GSC HTML tag option>
NEXT_PUBLIC_BING_VERIFICATION=<token from Bing Webmaster Tools>
```

**Sitemap submission checklist** (human steps, see §6):

1. GSC: Add property → choose `https://www.sageideas.dev` → verify via DNS TXT or HTML meta
2. GSC: Sitemaps panel → add `https://www.sageideas.dev/sitemap.xml`
3. Bing Webmaster: Add site → verify via XML file or BingSiteAuth meta
4. Bing: Submit sitemap at `https://www.bing.com/webmasters/` → Sitemaps

**Acceptance criteria:**

1. GSC shows "Ownership verified" on the property
2. GSC "Sitemaps" panel shows `sitemap.xml` submitted and processing
3. Bing Webmaster shows the site as verified
4. First Search Performance data populates within 2–3 days of live traffic

**Tests:**

- Manual: curl `https://www.sageideas.dev` and grep for `google-site-verification` meta
- Manual: Bing Webmaster Tools shows verified status

---

### D-5 PostHog Funnels & Dashboard

**What:** Create the funnels and insights in PostHog that form the single
source-of-truth dashboard for "what's working this week." All inputs are the
already-flowing typed events from `lib/analytics/events.ts`.

**Files:** PostHog UI only — no code changes. Configuration documented here for
reproducibility.

**Funnels to create:**

| Funnel name | Steps (event names) |
|---|---|
| Main acquisition funnel | `$pageview` → `pricing_view` OR `lead_magnet_start` → `contact_submit` OR `lead_magnet_complete` → `booking_click` OR `checkout_start` → `checkout_complete` |
| SEO audit tool funnel | `lead_magnet_start` {tool=seo_audit} → `lead_magnet_complete` {tool=seo_audit} |
| Checkout funnel | `checkout_start` → `checkout_complete` |
| Booking click funnel | `cta_click` {label=Book a call} → `booking_click` |
| Decision tree funnel | `$pageview` → `decision_tree_complete` |

**Dashboard insights to build:**

1. **Traffic by source** — Sessions grouped by `$referring_domain` (line chart, 30d)
2. **Top landing pages** — `$pageview` breakdown by `$pathname` (table, 7d)
3. **Conversion by CTA** — `cta_click` breakdown by `label` (bar, 7d)
4. **Service views** — `service_view` breakdown by `slug` (bar, 30d)
5. **Lead magnet completion rate** — Funnel: `lead_magnet_start` → `lead_magnet_complete` (funnel, 30d)
6. **Contact / booking volume** — `contact_submit` + `booking_click` counts (trend, 30d)
7. **Checkout conversion** — Funnel: `checkout_start` → `checkout_complete` (funnel, 30d)
8. **Newsletter signups by source** — `newsletter_signup` breakdown by `source` (bar, 30d)
9. **UTM campaigns** — Filter `$pageview` where `utm_campaign IS SET`, breakdown by `utm_campaign` (table, 30d)
10. **Decision tree completion** — `decision_tree_complete` breakdown by `stage` and `pain` (table, 7d)

**Dashboard name:** `Sage Ideas — Acquisition` (pin to PostHog home)

**Acceptance criteria:**

1. All 5 funnels exist in PostHog and show data within 48 h of production traffic
2. The dashboard is pinned and loads in < 3 s with 30d data
3. "What worked this week?" can be answered by reading the dashboard without any additional SQL

---

## 3. Data Model / Schema — Attribution on Leads

The `leads` table already has a `metadata JSONB` column (used in
`lib/leads/capture.ts`). Attribution is stored as a nested object under the
key `first_touch`.

**Schema change required:** None — `metadata` is already `JSONB`. No migration needed.

**Resulting row shape:**

```json
{
  "source": "contact",
  "email": "buyer@company.com",
  "name": "Alex",
  "detail": "...",
  "inquiry_type": "build",
  "budget": "$10k+",
  "metadata": {
    "first_touch": {
      "utm_source": "linkedin",
      "utm_medium": "social",
      "utm_campaign": "june-launch",
      "referrer": "https://www.linkedin.com/",
      "landing_page": "/services/build",
      "captured_at": "2026-06-13T14:22:00.000Z"
    }
  }
}
```

**Supabase query to validate (run in Table Editor or SQL Editor):**

```sql
SELECT
  id,
  source,
  email,
  metadata->'first_touch'->>'utm_source'   AS utm_source,
  metadata->'first_touch'->>'referrer'      AS referrer,
  metadata->'first_touch'->>'landing_page'  AS landing_page,
  inserted_at
FROM leads
ORDER BY inserted_at DESC
LIMIT 20;
```

---

## 4. Integration Points — Reuse Real Files

| File | Role in Program D | Change type |
|---|---|---|
| `components/studio/cookie-banner.tsx` | Consent source of truth. Writes `sage-cookie-consent-v1` to `localStorage`. `GoogleAnalytics` reads the same key. | Read-only — no change |
| `components/analytics/posthog-provider.tsx` | Existing PostHog sink. `track()` is called from `trackEvent`. `initialized` flag is private — `gtagEvent` is a parallel path. | Read-only — no change |
| `lib/analytics/events.ts` | The single typed taxonomy. Extended to fan-out to `gtagEvent`. | Modified (D-2) |
| `lib/leads/capture.ts` | Lead persistence. Extended to accept and merge `attribution`. | Modified (D-3) |
| `app/api/contact/route.ts` | Reads `attribution` from body, passes to `captureLead`. Already uses `.passthrough()` on its Zod schema. | Modified (D-3) |
| `app/api/tools/seo-audit/route.ts` | Reads `attribution` from body, passes to `captureLead`. Zod schema must add optional `attribution` field. | Modified (D-3) |
| `app/layout.tsx` | Mounts `<GoogleAnalytics />`, `<AttributionCapture />`, and (if using metadata API) GSC verification token. | Modified (D-1, D-3, D-4) |
| `next.config.ts` | CSP must allow `www.googletagmanager.com` and `www.google-analytics.com`. | Modified (D-1) |
| `components/studio/contact-form.tsx` (or equivalent) | Must call `getFirstTouch()` and include result in the POST body. | Modified (D-3) |
| `components/lab/seo-audit-form.tsx` (or equivalent) | Same as contact form. | Modified (D-3) |

**Program G baseline integration point:** Once GA4 is live and GSC is verified,
Program G step G4 (Baseline Snapshot) runs immediately — capture the dated
`docs/specs/program-g-baseline.md` from GA4 realtime + GSC Search Performance.
Program D gates G4; G4 gates Program A optimization.

---

## 5. Definition of Done

- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID` set in Vercel project settings (production environment only)
- [ ] `GoogleAnalytics` component renders only when `NODE_ENV === 'production'` AND consent is `'accepted'`
- [ ] GA4 DebugView confirms all 11 event names appear after a single session on production with cookies accepted
- [ ] GA4 Admin → Key events: `contact_submit`, `checkout_complete`, `lead_magnet_complete`, `booking_click` are all marked
- [ ] `gtagEvent` unit test passes: no-op when `window.gtag` absent; calls gtag with correct args when present
- [ ] Attribution unit tests pass (write once, referrer capture, utm_source capture)
- [ ] At least one `leads` row in Supabase has `metadata.first_touch` populated with a real utm_source
- [ ] GSC shows "Verified" and `sitemap.xml` submitted
- [ ] Bing Webmaster shows the site as verified
- [ ] PostHog: all 5 funnels created; `Sage Ideas — Acquisition` dashboard pinned
- [ ] CSP updated in `next.config.ts`; no CSP violations in production Console for GA4 requests
- [ ] `pnpm build` passes with zero TypeScript errors on the changed files

---

## 6. [YOU] Prerequisites

These cannot be automated. All are blockers before D-1 can go live.

| # | Action | Where |
|---|---|---|
| 1 | Create a GA4 property at analytics.google.com. Note the Measurement ID (`G-XXXXXXXXXX`). | GA4 Admin |
| 2 | Set `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX` in Vercel project settings under **Production** environment only. | Vercel Dashboard |
| 3 | After first GA4 events fire: mark `contact_submit`, `checkout_complete`, `lead_magnet_complete`, `booking_click` as **Key events** in GA4 Admin → Events. | GA4 Admin |
| 4 | Add `www.sageideas.dev` as a property in Google Search Console. Verify via **DNS TXT** (preferred) or HTML meta tag. | GSC + DNS provider |
| 5 | Submit `https://www.sageideas.dev/sitemap.xml` in GSC Sitemaps panel. | GSC |
| 6 | Add `www.sageideas.dev` in Bing Webmaster Tools. Verify via BingSiteAuth meta (set `NEXT_PUBLIC_BING_VERIFICATION` env var) or XML file. | Bing Webmaster |
| 7 | Submit sitemap in Bing Webmaster. | Bing Webmaster |
| 8 | Decide on consent UX: the current banner already separates "Essential only" from "Accept all." Analytics fires only on "Accept all." Confirm this is legally sufficient for your jurisdiction (FL-based B2B site — GDPR does not directly apply, but CCPA opt-out rights may apply to CA visitors). | Legal / Owner |
| 9 | UTM convention: agree on a standard template, e.g. `utm_source=linkedin&utm_medium=social&utm_campaign=YYYY-MM-<slug>`. Document in `docs/sops/utm-convention.md`. | Owner |

---

## 7. Rollout & Verification

### Rollout order

1. **Branch:** `feat/program-d-analytics`
2. **D-2 first** (event bridge) — pure logic, no side effects, safe to merge to main before GA4 ID exists. `gtagEvent` no-ops without `window.gtag`.
3. **D-3** (attribution capture) — depends only on `sessionStorage`; no external service.
4. **[YOU]** Provide `NEXT_PUBLIC_GA4_MEASUREMENT_ID` in Vercel before D-1 is deployed.
5. **D-1** (GA4 component) — deploy to production. Verify in DebugView.
6. **[YOU]** D-4 (GSC + Bing verification) — human steps; can run in parallel with D-1 deploy.
7. **D-5** (PostHog funnels) — configure in PostHog UI after first traffic flows.

### Verification checklist

```
GA4 smoke test (run on production, cookies accepted):
  [ ] Open https://www.sageideas.dev with ?gtm_debug=1 appended
  [ ] GA4 DebugView → see page_view event
  [ ] Click a CTA → see cta_click with { location, label }
  [ ] Submit contact form → see contact_submit; confirm in GA4 key events stream
  [ ] Run the SEO audit → see lead_magnet_start then lead_magnet_complete
  [ ] Click "Book a call" → see booking_click

Consent gate:
  [ ] Clear localStorage; confirm no GA4 requests in network panel
  [ ] Click "Essential only" in banner; confirm still no GA4 requests
  [ ] Click "Accept all"; confirm GA4 requests begin firing

Attribution:
  [ ] Visit https://www.sageideas.dev?utm_source=linkedin&utm_medium=social
  [ ] Submit contact form
  [ ] Query Supabase leads table: confirm latest row has metadata.first_touch.utm_source = 'linkedin'

PostHog:
  [ ] Main acquisition funnel shows data
  [ ] Dashboard loads without errors

GSC:
  [ ] Property shows "Verified"
  [ ] Sitemap shows "Success" (may take 1–3 days for coverage to populate)

CSP:
  [ ] No CSP violations in production browser Console for *.googletagmanager.com or *.google-analytics.com
```

### Program G handoff

Once D-1 is deployed and GSC is verified, immediately capture the G4 baseline:

- Export GA4 realtime + 7-day overview screenshot
- Export GSC Search Performance 3-month view (if data exists)
- Record indexed page count, avg position, top 5 queries
- Date-stamp and store in `docs/specs/program-g-baseline.md`

This snapshot is the "before" for every optimization Program A–C runs on.
