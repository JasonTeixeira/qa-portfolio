# Sage Ideas — Acquisition Engine: Phase 0 + 1 Design

**Date:** 2026-06-13
**Status:** Approved (design) — pending implementation plan
**Scope:** First spec in the multi-phase "Acquisition Engine" program. Public marketing surface only.

---

## Goal

Make `sageideas.dev` the studio's primary customer-acquisition channel. This first
spec lays an honest, coherent design foundation (Phase 0) and turns the public site
into a measurable, revenue-driving funnel (Phase 1). Bar: top-0.1% B2B studio site.

Phases 2–4 (exemplary SEO machinery, the content engine, full design polish) are
deferred to their own specs and are explicitly out of scope here.

## Context (current state, audited 2026-06-13)

- **Stack:** Next.js 16 (App Router/RSC/Server Actions), React 19, Tailwind 4
  (CSS-first, no `tailwind.config`), Supabase (Postgres + RLS), Stripe, PostHog,
  Vercel Analytics, Resend + AWS SES, Sentry, Playwright + Lighthouse CI.
- **Design system: 4/10.** `app/layout.tsx` imports `app/globals.css` (old ad-hoc
  hex system; mislabels coral as "violet"; declares `Inter` as `--font-sans` while
  the layout actually loads `Plus_Jakarta_Sans`). The superior OKLCh "sage" token
  system in `styles/globals.css` is **imported nowhere** — orphaned, referenced only
  in comments. No type/spacing/motion scales. Framer Motion scattered across 20+
  one-off components.
- **SEO: 6/10.** Good root metadata + dynamic OG + per-route metadata. (Deeper gaps
  belong to Phase 2.)
- **Conversion: 4/10.** Multiple CTAs and email-first lead capture exist, but **zero
  custom PostHog events** (funnel is blind) and **no public checkout** despite
  advertised fixed prices ($750 audits → $9,500 builds).
- **Credibility: 7/10 but cracked.** Hero says "two-person studio"; telemetry footer
  and everything else say solo. `data/social-proof/testimonials.ts` carries specific
  metrics ("flake rate 12% → 0.4%") that are **composite/non-attributed** — i.e. they
  read as fabricated client quotes.

## Decisions (locked)

1. **Team positioning:** Solo, founder-led. Fix the hero to match everything else.
2. **Social proof:** Testimonials are composite/aspirational → rewrite so nothing
   reads as an attributed client metric. Anchor proof on what's verifiable.
3. **Checkout cutoff:** Low-ticket self-serve (audits + lower fixed-scope, roughly
   ≤ $2.5k) get instant Stripe checkout; high-ticket builds ($9.5k) and the Studio
   Engagement stay application / book-a-call.
4. **Audit engine:** Google PageSpeed Insights API for performance/CWV (one free API
   key), with graceful degradation to heuristic-only checks if the key/quota is
   unavailable.

---

## Components

Each component is independently understandable, has a defined interface, and is
testable on its own.

### 1. Token unification (Phase 0 — foundation)

**What it does:** Establishes one canonical design-token + global CSS file so every
surface renders through a single coherent system.

**Approach:**
- Keep `app/globals.css` as THE imported file. Migrate the superior OKLCh sage tokens
  and any *live-only* utility classes (`.sage-prompt*`, hero-pan, rise, etc.) from
  `styles/globals.css` into it. First implementation task must diff which rules are
  actually live vs orphaned before merging.
- Delete `styles/globals.css` and remove dead references (comments in
  `components/telemetry-footer.tsx`, `components/sage/terminal-block.tsx`).
- Define complete scales via Tailwind 4 `@theme`:
  - **Color:** sage brand (teal `#0ED3CF`, coral `#E85D3A`, lime `#A8C633`, magenta
    `#C7236E`) + warm-tinted neutrals, all OKLCh, each text token verified AA
    (≥ 4.5:1 body, ≥ 3:1 large/UI).
  - **Type:** fluid scale with `clamp()` — display, h1–h6, body, small, mono.
  - **Spacing, radius, motion** (durations + easing curves) as named tokens.
- Fix font drift: `--font-sans` → Plus Jakarta Sans (matching the actual load).

**Depends on:** nothing. **Consumers:** every component/page.

**Acceptance:**
- Zero references to `styles/globals.css`; file deleted.
- `npm run build` green; no unresolved CSS var warnings.
- Playwright visual-regression screenshots (320/768/1024/1440) on home, /services,
  /pricing, /work, a blog post, /contact show **no unintended regression** vs a
  pre-change baseline captured in the same run.
- Automated contrast check passes AA on all text tokens.

### 2. Motion system (Phase 0)

**What it does:** One reusable, reduced-motion-safe animation vocabulary.

**Approach:**
- `lib/motion-presets.ts` exports typed Framer Motion variants (`fadeIn`, `slideUp`,
  `scaleIn`, `stagger`) and shared transition/easing constants (sourced from the
  motion tokens in component 1).
- A `useReducedMotion`-aware helper so every preset degrades to no-op when the user
  prefers reduced motion (belt-and-suspenders with the existing global CSS override).
- Convert the homepage and the case-study grid to the presets now. The long tail of
  one-off animations migrates in Phase 4 (not this spec).

**Depends on:** component 1 (motion tokens). **Consumers:** animated components.

**Acceptance:** homepage + case-study grid use presets; reduced-motion verified in
Playwright (emulate `prefers-reduced-motion: reduce` → no transform/opacity motion);
no Framer Motion bundle regression on those routes.

### 3. Truth pass (Phase 0)

**What it does:** Removes every claim that isn't defensible, per the no-fake-claims
standard.

**Approach:**
- Hero copy: "A two-person studio…" → solo, founder-led framing. Locate the source
  (homepage hero component) and fix.
- `data/social-proof/testimonials.ts`: rewrite so nothing presents as an attributed
  client metric. Replace the fake-quote carousel on the homepage with a **proof block**
  anchored on:
  - callable references (already real/honest — `data/references.ts`),
  - shipped products with verifiable artifacts (live URLs, GitHub stars for
    Nexural / AlphaStream / Jobpoise / Trayd),
  - stated engineering principles (the existing manifesto).
- Sweep the public surface for other unverifiable claims ("20+ engagements shipped",
  specific outcome metrics). For each: substantiate with a real artifact, or soften
  to a defensible statement. Produce a short list of every change in the PR
  description.

**Depends on:** nothing (copy/data). **Consumers:** homepage + any page surfacing
testimonials/counts.

**Acceptance:** no string in the public bundle presents an unverifiable client metric
as a quote; hero says solo; content-validation script (`npm run validate`) green.

### 4. Conversion instrumentation (Phase 1)

**What it does:** Makes the funnel observable.

**Approach:**
- `lib/analytics/events.ts`: a typed, closed union of conversion events with typed
  payloads, wrapping the existing PostHog `track()`:
  `cta_click`, `contact_submit`, `pricing_view`, `service_view`,
  `checkout_start`, `checkout_complete`, `lead_magnet_start`, `lead_magnet_complete`,
  `booking_click`, `newsletter_signup`.
- Each event carries minimal, non-PII context (e.g. `{ slug, location, tier }`).
- Instrument nav/hero/sticky CTAs, the contact form, pricing tiers (view + click),
  booking link, newsletter signup, and the two new Phase 1 features.

**Depends on:** existing PostHog provider. **Consumers:** CTAs/forms/features.

**Acceptance:** firing each instrumented action produces the expected event
(verified via PostHog debug or captured network request in a Playwright run); no
PII in payloads.

### 5. Public Stripe checkout (Phase 1)

**What it does:** Lets buyers purchase low-ticket productized services without a call.

**Approach:**
- `app/api/checkout/route.ts`: validates a service/tier slug, maps slug → Stripe
  price ID (via `STRIPE_PRICE_MAP`), creates a Checkout Session, returns the URL.
  Reuses the Stripe client already used by the portal invoice flow.
- "Start this engagement" buy buttons on pricing + eligible service-detail pages
  (low-ticket only; high-ticket buttons route to `/book` / application).
- `app/checkout/success` and `app/checkout/cancel` routes.
- Extend the Stripe webhook to handle `checkout.session.completed` →
  create a lead/engagement row in Supabase (existing pipeline tables) + Resend
  notification. Idempotent on the Stripe event id.

**Depends on:** components 1 (UI), 4 (events). **Consumers:** pricing/service pages.

**Acceptance:** Playwright E2E drives a low-ticket checkout against Stripe test mode
to the success route; webhook creates exactly one lead row (idempotency verified by
replaying the event); high-ticket tiers show no buy button; `checkout_*` events fire.

### 6. Lead magnet — instant SEO/site-audit tool (Phase 1, flagship)

**What it does:** A free, genuinely useful instant SEO audit that captures qualified
leads and dogfoods the SEO service.

**Approach:**
- `app/tools/seo-audit/page.tsx`: URL + email input → on-page scored report.
- `app/api/tools/seo-audit/route.ts` (Node runtime): server-side fetch of the target
  URL + analysis:
  - **Heuristic checks** (always): title/meta description presence + length, canonical,
    OG/Twitter tags, JSON-LD presence + types, `robots.txt` + `sitemap.xml` reachability,
    heading structure (single h1, hierarchy), image alt coverage, viewport/lang.
  - **Performance/CWV** (when available): Google PageSpeed Insights API; degrade
    gracefully to "performance not scored" if key/quota unavailable.
  - Compose a 0–100 score with category breakdowns + prioritized fixes.
- Rate-limited (reuse the contact route's limiter pattern). Input validation: only
  public http/https URLs; block private/loopback hosts (SSRF guard).
- Render report on-page via the unified design system; email a copy via Resend; write
  the lead into Supabase pipeline + PostHog `lead_magnet_complete` (tagged with score).

**Depends on:** components 1 (UI), 4 (events). **Consumers:** standalone tool route,
linked from nav/SEO service page/footer.

**Acceptance:** unit tests cover the analyzer (fixtures: well-optimized page,
broken page, missing-sitemap page) and scoring; SSRF guard rejects private hosts;
Playwright E2E submits a URL+email and renders a report; lead row + event created.

### Lead → CRM wiring (Phase 1, cross-cutting)

All lead sources (contact, lead magnet, checkout, newsletter) write into the existing
Supabase pipeline/CRM tables so leads appear in `/admin`, not just inbox email. Reuse
the existing schema (no new tables unless a gap is found; if so, a migration is added
and RLS rules updated + tested).

---

## Data flow

```
CTA / form / tool / pricing
        │  (typed event)            ┌──────────────┐
        ├──────────────────────────▶│   PostHog    │
        │                           └──────────────┘
        ▼
   API route (Node)
   ├─ validate + rate-limit
   ├─ Supabase: insert lead / pipeline row (RLS-safe)
   └─ Resend: notify sage@sageideas.dev

Checkout: buy button → /api/checkout → Stripe Checkout
        → success route
        → webhook checkout.session.completed (idempotent)
        → Supabase engagement row + Resend notify
```

## Error handling

- Every API route validates input at the boundary, fails fast with a user-friendly
  message, and logs detailed context to Sentry server-side. No silent swallows.
- PSI/Resend/Stripe failures degrade gracefully: the audit still returns heuristic
  results; checkout surfaces a retryable error; lead writes that fail are retried/
  queued and reported, never lost silently.
- Webhook handlers are idempotent (keyed on Stripe event id).

## Testing (per web testing rules)

- **Unit:** SEO-audit analyzer + scoring; event payload schema validation; checkout
  slug→price mapping.
- **Integration:** API routes (contact, checkout, seo-audit) — validation, rate
  limiting, SSRF guard, Supabase writes.
- **E2E (Playwright):** checkout happy path (Stripe test mode), lead-magnet submit,
  contact submit, reduced-motion.
- **Visual regression:** 320/768/1024/1440 on every changed public route, before/after.
- **A11y:** axe on changed pages; keyboard nav on new forms/buttons.
- **Performance:** Lighthouse CI/CWV budget held (LCP < 2.5s, INP < 200ms, CLS < 0.1).
- **Security:** RLS isolation suite stays green; new routes covered.

## Risks

- **Token merge regression:** mitigated by before/after visual regression and an
  explicit "diff live vs orphaned rules first" task.
- **Stripe price-map drift:** verify every low-ticket slug has a real price ID before
  shipping buy buttons; gate behind a config check.
- **SSRF via audit tool:** strict URL allowlist (public http/https only, block
  private/loopback/link-local) + timeout + size cap.
- **PSI quota/latency:** async with timeout; heuristic fallback path is the default-safe.

## Out of scope (this spec)

Admin/portal redesign; Phase 2 (sitemap/blog-in-sitemap, BreadcrumbList, WebSite/
CaseStudy/AggregateOffer schema, programmatic depth); Phase 3 (content engine);
Phase 4 (full design polish + motion migration of the long tail). Only the minimal
SEO needed by Phase 1 features is included here.
