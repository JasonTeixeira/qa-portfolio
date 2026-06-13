# Acquisition Engine — Phase 0 + 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the public sageideas.dev surface into an honest, coherent, measurable customer-acquisition funnel: one canonical design-token system, a restored motion layer, defensible copy, full conversion instrumentation, working public checkout, and a flagship SEO-audit lead magnet.

**Architecture:** Work within the existing Next.js 16 / RSC / Tailwind 4 (CSS-first) app. Phase 0 = foundation (token merge, motion presets, truth pass). Phase 1 = conversion (typed PostHog events, slug-based Stripe checkout + webhook, SEO-audit lead magnet) with all lead sources wired into the existing Supabase pipeline. Pure logic (SEO analyzer, SSRF guard, event/price mapping) is unit-tested; UI/CSS/copy is guarded by Playwright visual-regression + axe.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Framer Motion, Supabase (`supabaseAdmin()`), Stripe (`getStripe()`), Resend, PostHog (`track()`), Zod, Playwright, Lighthouse CI, `tsx` unit runner.

**Branch:** `feat/acquisition-engine-phase-0-1` (already created).

---

## Key facts (verified against the codebase 2026-06-13)

- Layout imports only `app/globals.css` (`app/layout.tsx:4`). `styles/globals.css` is imported **nowhere**; its `.sage-*` classes (used in 30+ components) are therefore dead on the live build.
- Fonts (`app/layout.tsx:16-34`): `Instrument_Serif`→`--font-display`, `Plus_Jakarta_Sans`→`--font-sans`, `JetBrains_Mono`→`--font-mono`. `app/globals.css` `@theme` wrongly sets `--font-sans: 'Inter'` and omits `--font-display`. `.markdown-body code` references a nonexistent `--font-jetbrains-mono`.
- Stripe client: `lib/stripe/client.ts` → `getStripe()`, `getOrCreateCustomer()`, `isStripeConfigured()`.
- Existing webhook: `app/api/stripe/webhook/route.ts` — verifies signature, dedupes via `stripe_webhook_events` (unique `event_id`, `23505` → duplicate), handles `checkout.session.completed` for **invoices**.
- Service tier data: `data/services/tiers.ts` — `Tier` type with `slug`, `name`, `price`, `priceCents`, `cadence: 'one-time'|'monthly'|'custom'`, `stripePriceId`, `stripeProductId`, `cta`, `ctaHref`. Classification helpers in `data/services/tier-classification.ts`.
- `components/studio/checkout-button.tsx` already POSTs `/api/checkout {slug}` and redirects to `data.url`. The route does not exist yet. Its current gate is `Boolean(tier.stripePriceId) && tier.cadence !== 'custom'` (too permissive).
- Supabase server clients: `lib/supabase/server.ts` → `supabaseAdmin()` (service role, bypasses RLS) and `createSupabaseServerClient()` (RLS).
- Rate limiter: `lib/rate-limit.ts` → `rateLimit(req, { limit, windowMs, prefix }): NextResponse | null`.
- Contact route `app/api/contact/route.ts`: Zod validation + `rateLimit` + Resend only (no Supabase write). Resend pattern: `new Resend(process.env.RESEND_API_KEY)`, `from: 'Sage Ideas Contact <contact@sageideas.dev>'`, `to: 'sage@sageideas.dev'`.
- PostHog: `components/analytics/posthog-provider.tsx` exports `track(event: string, props?: Record<string, unknown>)`. No hook.
- Hero copy: `components/sage-hero-terminal.tsx` (`A two-person studio…` paragraph; `20+ engagements shipped` trust strip). Other "20+" copy: `components/navigation.tsx:96`, `components/command-palette.tsx:123`.
- Testimonials: `data/social-proof/testimonials.ts` (6 composite quotes) rendered by `components/social-proof/testimonial-carousel.tsx`, used in `app/page.tsx` ("What happens after the work ships").
- References (real/honest): `data/references.ts` rendered by `components/testimonial-card.tsx` ("Call the people who've worked with us").
- Content validation: `scripts/validate-content.mjs` (`npm run validate`) checks artifact/proof files + GitHub URL shape.
- Unit test runner: `npm run test:unit` → `tsx tests/unit/run.mjs`. E2E: `npm run test:e2e` (Playwright). Lighthouse: `npm run test:lh`.

---

## File map

**Create**
- `lib/motion/presets.ts` — Framer Motion variants + easings.
- `lib/analytics/events.ts` — typed conversion-event wrapper over `track()`.
- `lib/seo-audit/analyzer.ts` — pure SEO analysis + scoring.
- `lib/seo-audit/ssrf.ts` — public-URL guard.
- `lib/seo-audit/psi.ts` — PageSpeed Insights fetch + normalize (graceful fallback).
- `lib/leads/capture.ts` — single helper that writes a lead to Supabase + notifies.
- `app/api/checkout/route.ts` — slug-based Stripe Checkout Session.
- `app/checkout/success/page.tsx`, `app/checkout/cancel/page.tsx`.
- `app/tools/seo-audit/page.tsx` + `app/tools/seo-audit/audit-form.tsx` + `app/tools/seo-audit/report.tsx`.
- `app/api/tools/seo-audit/route.ts`.
- `tests/unit/seo-audit.test.mjs`, `tests/unit/ssrf.test.mjs`, `tests/unit/checkout-map.test.mjs`, `tests/unit/events.test.mjs`.
- `tests/e2e/checkout.spec.ts`, `tests/e2e/seo-audit.spec.ts` (Playwright).
- `tests/visual/phase0.spec.ts` (Playwright visual regression).

**Modify**
- `app/globals.css` (merge target), delete `styles/globals.css`.
- `app/layout.tsx` (only if a font-var fix is needed; import path stays).
- `components/sage-hero-terminal.tsx`, `components/navigation.tsx`, `components/command-palette.tsx` (copy).
- `data/social-proof/testimonials.ts` + `app/page.tsx` (proof section).
- `data/services/tier-classification.ts` (add `isSelfServe`).
- `components/studio/checkout-button.tsx` (use `isSelfServe`; fire events).
- `app/api/stripe/webhook/route.ts` (handle service checkout sessions).
- `app/api/contact/route.ts` + `components/newsletter-signup.tsx` (lead capture + events).
- Various CTA sites for event instrumentation.

---

# PHASE 0 — FOUNDATION

## Task 1: Unify the design-token system into one canonical `app/globals.css`

**Files:**
- Modify: `app/globals.css`
- Delete: `styles/globals.css`
- Test: `tests/visual/phase0.spec.ts` (baseline + compare)

- [ ] **Step 1: Capture a pre-change visual baseline**

Run the dev server (`npm run dev`, port 3040) in one shell. Create `tests/visual/phase0.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/services', '/pricing', '/work', '/contact', '/blog'];
const WIDTHS = [320, 768, 1024, 1440];

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    test(`visual ${route} @ ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`http://localhost:3040${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`${route.replace(/\//g, '_') || 'home'}-${width}.png`, {
        fullPage: true, maxDiffPixelRatio: 0.02, animations: 'disabled',
      });
    });
  }
}
```

Run: `npx playwright test tests/visual/phase0.spec.ts --update-snapshots`
Expected: snapshots written to `tests/visual/phase0.spec.ts-snapshots/`. Commit these as the baseline.

- [ ] **Step 2: Commit the baseline**

```bash
git add tests/visual/phase0.spec.ts tests/visual/phase0.spec.ts-snapshots
git commit -m "test: visual-regression baseline for phase 0 token merge"
```

- [ ] **Step 3: Merge `styles/globals.css` into `app/globals.css`**

Edit `app/globals.css`:
1. In the `@theme inline` block, replace `--font-sans: 'Inter', …` with `--font-sans: var(--font-sans), 'Plus Jakarta Sans', system-ui, sans-serif;` and **add** `--font-display: var(--font-display), 'Instrument Serif', Georgia, serif;`. Keep `--font-mono`.
2. Replace the hex `:root` color block with the OKLCh `:root` + `.dark` blocks from `styles/globals.css` (lines 32–100 there) and adopt its 38 `@theme inline` color tokens + 8 sidebar tokens.
3. Append all **used** `.sage-*` classes from `styles/globals.css` (every class the inventory marked "used": `.sage-rise`/`-d1..d6`, `.sage-hero-pan-*`, `.sage-orb-*`, `.sage-data-line-*`, `.sage-cursor`, `.sage-scanlines`, `.sage-crt-flicker`, `.sage-grid-noise`, `.sage-sweep`, `.sage-glitch`, `.sage-bloom-*`, `.sage-text-bloom-cyan`, `.sage-prompt*`, `.sage-neon-cta`, `.sage-sigil`, `.sage-rule-dashed`, `.prose-sage`) plus their reduced-motion overrides (styles lines 308–327 and the per-class blocks).
4. Add named scale tokens to `@theme` (these are new — see Step 4).
5. Fix `.markdown-body code`: `var(--font-jetbrains-mono)` → `var(--font-mono)`.
6. Remove the confirmed-dead classes (`.gradient-text`, `.gradient-text-animated`, `.card-glow`, `.grid-pattern-animated`, `.btn-magnetic`, `.noise-overlay`, `.animate-float*`, `.animate-glow-pulse`, `.typing-cursor`, `.shimmer`, `.stagger-1..5`, `.backdrop-blur-xs`, `.border-gradient`, `.text-shadow-glow`, `.page-transition-*`, and from styles: `.sage-text-bloom-lime`, `.touch-target`, `.pb-safe`, `.pt-safe`, `.overscroll-contain`). Keep `.grid-pattern`, `.section-label`, `.btn-glow`, `.reading-progress`, `.status-dot`, `.line-clamp-3`, `.skip-to-content`, `.skeleton`, `.command-palette-backdrop`, `.markdown-body` (all verified used).

- [ ] **Step 4: Add fluid type, spacing, radius, and motion scale tokens**

Inside the `@theme` block of `app/globals.css`, add:

```css
  /* Fluid type scale (clamp: min @320px → max @1440px) */
  --text-display: clamp(2.75rem, 1.6rem + 5.75vw, 6rem);
  --text-h1: clamp(2.25rem, 1.5rem + 3.75vw, 4rem);
  --text-h2: clamp(1.75rem, 1.3rem + 2.25vw, 2.75rem);
  --text-h3: clamp(1.375rem, 1.15rem + 1.1vw, 1.875rem);
  --text-h4: clamp(1.125rem, 1.02rem + 0.5vw, 1.375rem);
  --text-body: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-small: 0.875rem;
  --text-micro: 0.75rem;
  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.6;

  /* Spacing rhythm */
  --space-section: clamp(4rem, 3rem + 5vw, 9rem);
  --space-block: clamp(1.5rem, 1.2rem + 1.5vw, 3rem);

  /* Motion */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 600ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
```

- [ ] **Step 5: Delete the orphan and its dead references**

```bash
git rm styles/globals.css
```

Edit `components/telemetry-footer.tsx` and `components/sage/terminal-block.tsx` to remove the comment lines that reference `styles/globals.css` (replace with `app/globals.css` in the comment).

- [ ] **Step 6: Build and verify no CSS regressions**

Run: `npm run build`
Expected: build succeeds, no "unknown utility"/unresolved-var errors.

Run: `npx playwright test tests/visual/phase0.spec.ts`
Expected: **Diffs are expected and desirable** on routes where the previously-dead `.sage-*` motion/polish now renders (orbs, bloom, rise). Manually inspect each diff in the Playwright report. Confirm every diff is an *improvement or neutral* (restored effect), not a layout break. Then refresh the baseline:

```bash
npx playwright test tests/visual/phase0.spec.ts --update-snapshots
```

- [ ] **Step 7: Contrast check on text tokens**

Verify (manually or via an axe run in Step of Task 8) that body text token (`--sage-ink-muted` / `--color-muted-foreground`) on `--color-background` is ≥ 4.5:1. The orphan file already lifted `--sage-ink-subtle` to `#B8B0AB` for AA — preserve that value.

- [ ] **Step 8: Commit**

```bash
git add app/globals.css components/telemetry-footer.tsx components/sage/terminal-block.tsx tests/visual
git commit -m "feat: unify design tokens into single canonical globals.css, restore sage motion layer"
```

---

## Task 2: Motion presets library + convert hero & case-study grid

**Files:**
- Create: `lib/motion/presets.ts`
- Modify: `components/sage-hero-terminal.tsx`, `components/v0-case-study-grid.tsx`
- Test: `tests/visual/phase0.spec.ts` (reduced-motion case)

- [ ] **Step 1: Write the presets**

```ts
// lib/motion/presets.ts
import type { Variants, Transition } from 'framer-motion';

export const EASE_OUT_EXPO: Transition['ease'] = [0.16, 1, 0.3, 1];
export const EASE_OUT_QUINT: Transition['ease'] = [0.22, 1, 0.36, 1];

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_QUINT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
};

export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});
```

- [ ] **Step 2: Convert the hero's ad-hoc transitions to presets**

In `components/sage-hero-terminal.tsx`, import `{ slideUp, fadeIn }` from `@/lib/motion/presets` and replace the inline `initial/animate/transition` props on the headline/paragraph/CTA `motion` elements with `variants={slideUp}` driven by a parent `initial="hidden" animate="show"`. Preserve the existing reduced-motion behavior (the global CSS override + `opacity: 1` fallbacks).

- [ ] **Step 3: Convert the case-study grid entrance animations**

In `components/v0-case-study-grid.tsx`, replace its bespoke `useInView` fade/rise variants with `slideUp` + `stagger()` from the presets. Keep `whileInView="show" viewport={{ once: true }}`.

- [ ] **Step 4: Add a reduced-motion E2E assertion**

Append to `tests/visual/phase0.spec.ts`:

```ts
test('hero respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://localhost:3040/', { waitUntil: 'networkidle' });
  const h1Region = page.getByRole('region', { name: /introduction/i });
  await expect(h1Region).toBeVisible();
});
```

Run: `npx playwright test tests/visual/phase0.spec.ts -g "reduced motion"`
Expected: PASS (content visible with motion disabled).

- [ ] **Step 5: Build + visual check + commit**

Run: `npm run build && npx playwright test tests/visual/phase0.spec.ts`
Expected: no unintended diffs (motion disabled in screenshots, so visuals stable).

```bash
git add lib/motion/presets.ts components/sage-hero-terminal.tsx components/v0-case-study-grid.tsx tests/visual
git commit -m "feat: standardized motion presets; convert hero and case-study grid"
```

---

## Task 3: Truth pass — solo positioning, honest proof, defensible claims

**Files:**
- Modify: `components/sage-hero-terminal.tsx`, `components/navigation.tsx`, `components/command-palette.tsx`
- Modify: `data/social-proof/testimonials.ts`, `app/page.tsx`

- [ ] **Step 1: Fix the hero "two-person" line → solo**

In `components/sage-hero-terminal.tsx`, replace the paragraph text:

> `A two-person studio that builds AI agents, voice systems, and web platforms for founders who measure outcomes — not promises. Twenty productized engagements, transparent pricing, callable references.`

with:

> `A solo, founder-led studio that builds AI agents, voice systems, and web platforms for founders who measure outcomes — not promises. Productized engagements, transparent pricing, callable references.`

(Removes both the team-size contradiction and the unverifiable count in one edit.)

- [ ] **Step 2: Soften the "20+ engagements" claims to something defensible**

- `components/sage-hero-terminal.tsx` trust strip `20+ engagements shipped` → `productized engagements` (no number) **or**, if the real number of shipped engagements is confirmed by the operator, the real figure. Default to no number.
- `components/navigation.tsx:96` and `components/command-palette.tsx:123`: change `'20+ productized engagements'` → `'Productized engagements, fixed scope'`.

- [ ] **Step 3: Replace composite testimonials data with an honest proof model**

Rewrite `data/social-proof/testimonials.ts` so it no longer presents unverifiable metric quotes attributed to roles. Replace the `testimonials` array with a `proofPoints` array anchored on verifiable artifacts:

```ts
// data/social-proof/testimonials.ts
export type ProofPoint = {
  kind: 'shipped' | 'reference' | 'principle';
  label: string;        // e.g. "Nexural — fintech platform"
  detail: string;       // verifiable, factual
  href?: string;        // live URL or GitHub
};

export const proofPoints: ProofPoint[] = [
  { kind: 'shipped', label: 'Nexural', detail: '185 DB tables · 69 API endpoints · live in production', href: '/work/nexural' },
  { kind: 'shipped', label: 'AlphaStream', detail: '200+ indicators · 5 ML models · open on GitHub', href: '/work/alphastream' },
  { kind: 'shipped', label: 'Jobpoise', detail: 'Stripe paywall · Gmail tracking · shipping to users', href: '/work/jobpoise' },
  { kind: 'reference', label: 'Callable references', detail: 'Real past collaborators you can phone before you sign — no invented quotes', href: '/trust#references' },
  { kind: 'principle', label: 'Receipts, not promises', detail: 'Every change reversible in 30s; the person pitching is the person typing', href: '/pov' },
];
```

Keep a thin back-compat export only if other files import the old `testimonials` symbol — grep first: `grep -rn "from '@/data/social-proof/testimonials'" app components`. Update each importer.

- [ ] **Step 4: Replace the fake-quote carousel on the homepage with the proof block**

In `app/page.tsx`, remove the `TestimonialCarousel` usage in the "What happens after the work ships" section and render `proofPoints` as a static proof grid (reuse existing card primitives + `slideUp`/`stagger`). Update the section heading to something honest, e.g. **"The receipts"**. If `components/social-proof/testimonial-carousel.tsx` becomes unused after this, delete it (`grep -rn "testimonial-carousel"` to confirm no other importer).

- [ ] **Step 5: Validate + visual check**

Run: `npm run validate`
Expected: `OK: content validated`.

Run: `npm run build && npx playwright test tests/visual/phase0.spec.ts --update-snapshots`
Expected: intended diffs on `/` (proof block replaces carousel, hero copy). Inspect, then accept.

- [ ] **Step 6: Commit**

```bash
git add components/sage-hero-terminal.tsx components/navigation.tsx components/command-palette.tsx data/social-proof/testimonials.ts app/page.tsx tests/visual
git commit -m "fix: honest positioning — solo studio, verifiable proof block, drop composite quotes"
```

---

# PHASE 1 — CONVERSION ENGINE

## Task 4: Typed conversion-event layer + instrumentation

**Files:**
- Create: `lib/analytics/events.ts`
- Test: `tests/unit/events.test.mjs`
- Modify: CTA/form components (listed in Step 4)

- [ ] **Step 1: Write the failing test for the event wrapper**

```js
// tests/unit/events.test.mjs
import assert from 'node:assert';
import { test } from 'node:test';
import { EVENT_NAMES, isValidEvent } from '../../lib/analytics/events.ts';

test('event name registry is the closed set', () => {
  assert.ok(EVENT_NAMES.includes('checkout_start'));
  assert.ok(EVENT_NAMES.includes('lead_magnet_complete'));
  assert.equal(isValidEvent('not_a_real_event'), false);
  assert.equal(isValidEvent('cta_click'), true);
});
```

- [ ] **Step 2: Run it to confirm failure**

Run: `npm run test:unit`
Expected: FAIL (module/exports missing).

- [ ] **Step 3: Implement the typed wrapper**

```ts
// lib/analytics/events.ts
import { track } from '@/components/analytics/posthog-provider';

export const EVENT_NAMES = [
  'cta_click', 'contact_submit', 'pricing_view', 'service_view',
  'checkout_start', 'checkout_complete', 'lead_magnet_start',
  'lead_magnet_complete', 'booking_click', 'newsletter_signup',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export function isValidEvent(name: string): name is EventName {
  return (EVENT_NAMES as readonly string[]).includes(name);
}

type Payloads = {
  cta_click: { location: string; label: string; href?: string };
  contact_submit: { inquiryType?: string; budget?: string };
  pricing_view: { surface: string };
  service_view: { slug: string };
  checkout_start: { slug: string; priceCents: number };
  checkout_complete: { slug: string };
  lead_magnet_start: { tool: 'seo_audit' };
  lead_magnet_complete: { tool: 'seo_audit'; score: number };
  booking_click: { location: string };
  newsletter_signup: { source: string };
};

export function trackEvent<E extends EventName>(name: E, props: Payloads[E]): void {
  // No PII in payloads; emails/URLs are intentionally excluded by the types above.
  track(name, props as Record<string, unknown>);
}
```

- [ ] **Step 4: Instrument the surfaces**

Add `trackEvent(...)` calls (client components only):
- `components/navigation.tsx` — `./book` button onClick → `trackEvent('booking_click', { location: 'nav' })`; nav CTA clicks → `cta_click`.
- `components/sage-hero-terminal.tsx` — `./book` → `booking_click {location:'hero'}`; `ls work/` → `cta_click`.
- `components/sticky-cta.tsx` — CTA click → `cta_click { location: 'sticky', label, href }`.
- `components/newsletter-signup.tsx` — replace the existing `track('newsletter_subscribe', …)` with `trackEvent('newsletter_signup', { source })`.
- `app/contact/contact-content.tsx` — on successful submit → `trackEvent('contact_submit', { inquiryType, budget })`.
- Pricing tiers (`components/v0-pricing/tier-cards.tsx`) — a `useEffect` on mount → `trackEvent('pricing_view', { surface: 'pricing' })`; tier CTA click → `cta_click`.
- `app/services/[slug]` content — `service_view { slug }` on mount (client wrapper).

- [ ] **Step 5: Run unit test + typecheck**

Run: `npm run test:unit && npm run typecheck`
Expected: PASS; no type errors (payload types enforce correct props at call sites).

- [ ] **Step 6: Commit**

```bash
git add lib/analytics/events.ts tests/unit/events.test.mjs components app
git commit -m "feat: typed conversion-event layer + instrument CTAs, forms, pricing, booking"
```

---

> **DEPENDENCY:** Step 7 of this task and Step 8 of Task 6 import `captureLead` from `lib/leads/capture.ts`, which is created in **Task 7**. When executing strictly task-by-task, do Task 7 Steps 1–2 (create the helper) **before** wiring it in here. The rest of Tasks 5/6 has no such dependency.

## Task 5: Slug-based public Stripe checkout + webhook + success/cancel

**Files:**
- Create: `app/api/checkout/route.ts`, `app/checkout/success/page.tsx`, `app/checkout/cancel/page.tsx`
- Modify: `data/services/tier-classification.ts`, `components/studio/checkout-button.tsx`, `app/api/stripe/webhook/route.ts`
- Test: `tests/unit/checkout-map.test.mjs`, `tests/e2e/checkout.spec.ts`

- [ ] **Step 1: Write the failing test for the self-serve rule**

```js
// tests/unit/checkout-map.test.mjs
import assert from 'node:assert';
import { test } from 'node:test';
import { tiersOrdered } from '../../data/services/tiers.ts';
import { isSelfServe } from '../../data/services/tier-classification.ts';

const bySlug = Object.fromEntries(tiersOrdered.map((t) => [t.slug, t]));

test('low-ticket one-time tiers are self-serve', () => {
  assert.equal(isSelfServe(bySlug['audit']), true);   // $750
});
test('high-ticket build is gated', () => {
  assert.equal(isSelfServe(bySlug['build']), false);  // $9,500
});
test('self-serve requires a stripePriceId and one-time cadence under the cap', () => {
  for (const t of tiersOrdered) {
    if (isSelfServe(t)) {
      assert.ok(t.stripePriceId, `${t.slug} needs a price id`);
      assert.equal(t.cadence, 'one-time');
      assert.ok(t.priceCents <= 250000, `${t.slug} over cap`);
    }
  }
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `npm run test:unit`
Expected: FAIL (`isSelfServe` undefined).

- [ ] **Step 3: Implement `isSelfServe`**

Append to `data/services/tier-classification.ts`:

```ts
import type { Tier } from './tiers';

/** Self-serve checkout cap: one-time engagements ≤ $2,500 with a configured price. */
export const SELF_SERVE_PRICE_CAP_CENTS = 250_000;

export function isSelfServe(tier: Tier): boolean {
  return (
    Boolean(tier.stripePriceId) &&
    tier.cadence === 'one-time' &&
    tier.priceCents <= SELF_SERVE_PRICE_CAP_CENTS
  );
}
```

Run: `npm run test:unit` → Expected: PASS.

- [ ] **Step 4: Build the checkout route**

```ts
// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, isStripeConfigured } from '@/lib/stripe/client';
import { tiersOrdered } from '@/data/services/tiers';
import { isSelfServe } from '@/data/services/tier-classification';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
const Body = z.object({ slug: z.string().trim().min(1).max(64) });

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000, prefix: 'checkout' });
  if (limited) return limited;
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Checkout unavailable' }, { status: 503 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const tier = tiersOrdered.find((t) => t.slug === parsed.data.slug);
  if (!tier || !isSelfServe(tier)) {
    return NextResponse.json({ error: 'This engagement is by consultation — please book a call.' }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sageideas.dev';
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: tier.stripePriceId!, quantity: 1 }],
      success_url: `${base}/checkout/success?slug=${tier.slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancel?slug=${tier.slug}`,
      metadata: { kind: 'service', slug: tier.slug },
      payment_intent_data: { metadata: { kind: 'service', slug: tier.slug } },
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] stripe error:', err);
    return NextResponse.json({ error: "Couldn't start checkout. Please try again." }, { status: 502 });
  }
}
```

- [ ] **Step 5: Tighten the button gate + fire events**

In `components/studio/checkout-button.tsx`: import `isSelfServe` and `trackEvent`. Replace `const hasStripeCheckout = Boolean(tier.stripePriceId) && tier.cadence !== 'custom'` with `const hasStripeCheckout = isSelfServe(tier)`. In `onClick`, before the fetch, call `trackEvent('checkout_start', { slug: tier.slug, priceCents: tier.priceCents })`.

- [ ] **Step 6: Success/cancel pages**

```tsx
// app/checkout/success/page.tsx
import Link from 'next/link';
export const dynamic = 'force-dynamic';
export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-h1">You're in.</h1>
      <p className="mt-4 text-body text-[color:var(--color-muted-foreground)]">
        Payment received{slug ? ` for ${slug}` : ''}. Check your inbox — I'll reach out within one business day to kick off.
      </p>
      <Link href="/" className="mt-8 inline-block underline">← back to home</Link>
    </main>
  );
}
```

```tsx
// app/checkout/cancel/page.tsx
import Link from 'next/link';
export default function CheckoutCancel() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-h2">No charge made.</h1>
      <p className="mt-4 text-body text-[color:var(--color-muted-foreground)]">
        Checkout was cancelled. Want to talk it through first? <Link href="/book" className="underline">Book a call</Link>.
      </p>
    </main>
  );
}
```

Add a client `checkout_complete` event on the success page via a small `'use client'` child that calls `trackEvent('checkout_complete', { slug })` in `useEffect`.

- [ ] **Step 7: Handle the service checkout session in the webhook**

In `app/api/stripe/webhook/route.ts`, inside the `checkout.session.completed` handler, branch on `session.metadata?.kind === 'service'`: instead of the invoice path, call the shared lead-capture helper (Task 7) to record the purchase as a lead/engagement and notify. Keep the existing idempotency insert into `stripe_webhook_events` unchanged (it already dedupes by `event.id`).

```ts
if (session.metadata?.kind === 'service') {
  const slug = session.metadata.slug ?? 'unknown';
  await captureLead({
    source: 'checkout',
    email: session.customer_details?.email ?? null,
    name: session.customer_details?.name ?? null,
    detail: `Purchased service: ${slug}`,
    amountCents: session.amount_total ?? null,
  });
  return NextResponse.json({ received: true });
}
```

- [ ] **Step 8: E2E happy path (Stripe test mode)**

```ts
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('low-ticket service starts Stripe checkout', async ({ page }) => {
  await page.goto('/services/audit');
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/checkout') && r.request().method() === 'POST'),
    page.getByRole('button', { name: /audit|start|checkout/i }).first().click(),
  ]);
  const body = await resp.json();
  expect(resp.status()).toBe(200);
  expect(body.url).toContain('checkout.stripe.com');
});

test('high-ticket build does not expose self-serve checkout', async ({ page }) => {
  await page.goto('/services/build');
  // Build routes to /book or /contact, never /api/checkout.
  await expect(page.getByRole('link', { name: /book|apply|contact/i }).first()).toBeVisible();
});
```

Run (requires Stripe test keys + dev server): `npm run test:e2e -- checkout`
Expected: PASS. (If keys absent in CI, mark this spec `test.skip` behind an env guard so the suite stays green.)

- [ ] **Step 9: Typecheck, unit, commit**

Run: `npm run typecheck && npm run test:unit`
Expected: PASS.

```bash
git add app/api/checkout app/checkout data/services/tier-classification.ts components/studio/checkout-button.tsx app/api/stripe/webhook/route.ts tests/unit/checkout-map.test.mjs tests/e2e/checkout.spec.ts
git commit -m "feat: slug-based public Stripe checkout for low-ticket services + webhook + success/cancel"
```

---

## Task 6: SEO-audit lead magnet (analyzer, SSRF guard, PSI, page, API)

**Files:**
- Create: `lib/seo-audit/analyzer.ts`, `lib/seo-audit/ssrf.ts`, `lib/seo-audit/psi.ts`, `app/api/tools/seo-audit/route.ts`, `app/tools/seo-audit/page.tsx`, `app/tools/seo-audit/audit-form.tsx`, `app/tools/seo-audit/report.tsx`
- Test: `tests/unit/ssrf.test.mjs`, `tests/unit/seo-audit.test.mjs`, `tests/e2e/seo-audit.spec.ts`

- [ ] **Step 1: Failing test for the SSRF guard**

```js
// tests/unit/ssrf.test.mjs
import assert from 'node:assert';
import { test } from 'node:test';
import { assertPublicUrl, isPrivateIp } from '../../lib/seo-audit/ssrf.ts';

test('rejects non-http protocols', () => {
  assert.throws(() => assertPublicUrl('file:///etc/passwd'));
  assert.throws(() => assertPublicUrl('ftp://example.com'));
});
test('rejects localhost and private literals', () => {
  assert.throws(() => assertPublicUrl('http://localhost/'));
  assert.throws(() => assertPublicUrl('http://127.0.0.1/'));
  assert.throws(() => assertPublicUrl('http://169.254.169.254/'));
  assert.equal(isPrivateIp('10.0.0.5'), true);
  assert.equal(isPrivateIp('192.168.1.1'), true);
  assert.equal(isPrivateIp('8.8.8.8'), false);
});
test('accepts a normal public https url', () => {
  const u = assertPublicUrl('https://example.com/path');
  assert.equal(u.hostname, 'example.com');
});
```

- [ ] **Step 2: Run → FAIL.** `npm run test:unit` → Expected: FAIL.

- [ ] **Step 3: Implement the guard**

```ts
// lib/seo-audit/ssrf.ts
export function isPrivateIp(ip: string): boolean {
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;          // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true;          // 192.168/16
  return false;
}

export function assertPublicUrl(input: string): URL {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Enter a valid URL (https://…).'); }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only http/https URLs are supported.');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new Error('That host is not allowed.');
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateIp(host)) throw new Error('That host is not allowed.');
  return url;
}
```

Run: `npm run test:unit` → Expected: PASS for ssrf.

- [ ] **Step 4: Failing test for the analyzer**

```js
// tests/unit/seo-audit.test.mjs
import assert from 'node:assert';
import { test } from 'node:test';
import { analyzeHtml, scoreReport } from '../../lib/seo-audit/analyzer.ts';

const GOOD = `<!doctype html><html lang="en"><head>
<title>Great Page — 50 chars of a sensible descriptive title</title>
<meta name="description" content="${'x'.repeat(140)}">
<meta property="og:title" content="t"><meta name="twitter:card" content="summary">
<link rel="canonical" href="https://e.com/">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script type="application/ld+json">{"@type":"Organization"}</script>
</head><body><h1>One heading</h1><img src="a.png" alt="described"></body></html>`;

const BAD = `<!doctype html><html><head></head><body><h1>a</h1><h1>b</h1><img src="x.png"></body></html>`;

test('good page scores high and finds title/desc/og/jsonld', () => {
  const r = analyzeHtml(GOOD, 'https://e.com/');
  assert.equal(r.checks.title.pass, true);
  assert.equal(r.checks.metaDescription.pass, true);
  assert.equal(r.checks.openGraph.pass, true);
  assert.equal(r.checks.structuredData.pass, true);
  assert.equal(r.checks.singleH1.pass, true);
  assert.ok(scoreReport(r) >= 80);
});

test('bad page scores low: no title, multiple h1, missing alt', () => {
  const r = analyzeHtml(BAD, 'https://e.com/');
  assert.equal(r.checks.title.pass, false);
  assert.equal(r.checks.singleH1.pass, false);
  assert.equal(r.checks.imageAlt.pass, false);
  assert.ok(scoreReport(r) < 50);
});
```

- [ ] **Step 5: Run → FAIL.** `npm run test:unit` → Expected: FAIL (analyzer missing).

- [ ] **Step 6: Implement the analyzer (pure, regex-based — no DOM dep)**

```ts
// lib/seo-audit/analyzer.ts
export type Check = { pass: boolean; weight: number; label: string; detail: string };
export type SeoReport = {
  url: string;
  checks: Record<string, Check>;
  performance?: { score: number | null; lcpMs?: number; cls?: number };
};

const between = (n: number, lo: number, hi: number) => n >= lo && n <= hi;
const has = (re: RegExp, s: string) => re.test(s);
const all = (re: RegExp, s: string) => s.match(re) ?? [];

export function analyzeHtml(html: string, url: string): SeoReport {
  const head = (html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1]) ?? html;
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
  const desc = head.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? '';
  const h1s = all(/<h1[\s>]/gi, html).length;
  const imgs = all(/<img\b[^>]*>/gi, html);
  const imgsNoAlt = imgs.filter((t) => !/\balt=/i.test(t)).length;

  const checks: Record<string, Check> = {
    title: { pass: between(title.length, 15, 65), weight: 15, label: 'Title tag', detail: title ? `${title.length} chars` : 'missing' },
    metaDescription: { pass: between(desc.length, 50, 160), weight: 12, label: 'Meta description', detail: desc ? `${desc.length} chars` : 'missing' },
    canonical: { pass: has(/<link[^>]+rel=["']canonical["']/i, head), weight: 8, label: 'Canonical link', detail: '' },
    openGraph: { pass: has(/property=["']og:title["']/i, head), weight: 10, label: 'Open Graph tags', detail: '' },
    twitter: { pass: has(/name=["']twitter:card["']/i, head), weight: 5, label: 'Twitter card', detail: '' },
    structuredData: { pass: has(/<script[^>]+application\/ld\+json/i, html), weight: 12, label: 'Structured data (JSON-LD)', detail: '' },
    viewport: { pass: has(/name=["']viewport["']/i, head), weight: 6, label: 'Viewport meta', detail: '' },
    langAttr: { pass: has(/<html[^>]+lang=/i, html), weight: 4, label: 'html lang', detail: '' },
    singleH1: { pass: h1s === 1, weight: 10, label: 'Single H1', detail: `${h1s} found` },
    imageAlt: { pass: imgs.length === 0 || imgsNoAlt === 0, weight: 8, label: 'Image alt text', detail: `${imgsNoAlt}/${imgs.length} missing alt` },
  };
  return { url, checks };
}

export function scoreReport(report: SeoReport): number {
  const entries = Object.values(report.checks);
  const total = entries.reduce((s, c) => s + c.weight, 0);
  const earned = entries.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  const onPage = total ? (earned / total) * 100 : 0;
  if (report.performance?.score == null) return Math.round(onPage);
  // Blend 70% on-page / 30% performance when PSI is available.
  return Math.round(onPage * 0.7 + report.performance.score * 0.3);
}
```

Run: `npm run test:unit` → Expected: PASS.

- [ ] **Step 7: PSI fetch with graceful fallback**

```ts
// lib/seo-audit/psi.ts
export async function fetchPsi(url: string): Promise<{ score: number | null; lcpMs?: number; cls?: number }> {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) return { score: null };
  try {
    const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    api.searchParams.set('url', url);
    api.searchParams.set('strategy', 'mobile');
    api.searchParams.set('category', 'performance');
    api.searchParams.set('key', key);
    const res = await fetch(api, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return { score: null };
    const json = await res.json();
    const score = json?.lighthouseResult?.categories?.performance?.score;
    const audits = json?.lighthouseResult?.audits ?? {};
    return {
      score: typeof score === 'number' ? Math.round(score * 100) : null,
      lcpMs: audits['largest-contentful-paint']?.numericValue,
      cls: audits['cumulative-layout-shift']?.numericValue,
    };
  } catch {
    return { score: null };
  }
}
```

- [ ] **Step 8: The API route (fetch target + analyze + PSI + capture lead + email)**

```ts
// app/api/tools/seo-audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { assertPublicUrl } from '@/lib/seo-audit/ssrf';
import { analyzeHtml, scoreReport } from '@/lib/seo-audit/analyzer';
import { fetchPsi } from '@/lib/seo-audit/psi';
import { captureLead } from '@/lib/leads/capture';

export const runtime = 'nodejs';
const Body = z.object({
  url: z.string().trim().min(4).max(2048),
  email: z.string().trim().email().max(320),
  honey: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowMs: 60_000, prefix: 'seo-audit' });
  if (limited) return limited;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  if (parsed.data.honey) return NextResponse.json({ ok: true }); // bot trap

  let target;
  try { target = assertPublicUrl(parsed.data.url); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 400 }); }

  let html = '';
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(12_000), headers: { 'user-agent': 'SageIdeas-SEO-Audit/1.0' } });
    html = (await res.text()).slice(0, 2_000_000); // 2MB cap
  } catch {
    return NextResponse.json({ error: 'Could not reach that URL.' }, { status: 502 });
  }

  const report = analyzeHtml(html, target.toString());
  report.performance = await fetchPsi(target.toString());
  const score = scoreReport(report);

  await captureLead({ source: 'seo_audit', email: parsed.data.email, name: null, detail: `SEO audit of ${target.toString()} — score ${score}` });

  return NextResponse.json({ score, report });
}
```

- [ ] **Step 9: The page, form, and report UI**

Build `app/tools/seo-audit/page.tsx` (server component: metadata + heading + renders `<AuditForm/>`), `audit-form.tsx` (`'use client'`: URL+email inputs, honeypot, `trackEvent('lead_magnet_start', {tool:'seo_audit'})` on submit, POSTs the route, on success `trackEvent('lead_magnet_complete', {tool:'seo_audit', score})` and renders `<Report report score/>`), and `report.tsx` (score ring + per-check pass/fail list + prioritized fixes, styled with the unified tokens + `slideUp`). Add `generateMetadata` (title: "Free instant SEO audit — Sage Ideas") and a link to the tool from `components/navigation.tsx` Resources menu + the SEO service page.

- [ ] **Step 10: E2E for the magnet**

```ts
// tests/e2e/seo-audit.spec.ts
import { test, expect } from '@playwright/test';

test('seo audit returns a scored report', async ({ page }) => {
  await page.goto('/tools/seo-audit');
  await page.getByLabel(/url/i).fill('https://example.com');
  await page.getByLabel(/email/i).fill('lead@example.com');
  await page.getByRole('button', { name: /audit|analyze|run/i }).click();
  await expect(page.getByText(/score/i)).toBeVisible({ timeout: 20_000 });
});
```

Run: `npm run test:unit` (analyzer+ssrf) then `npm run test:e2e -- seo-audit`.
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add lib/seo-audit app/api/tools app/tools tests/unit/ssrf.test.mjs tests/unit/seo-audit.test.mjs tests/e2e/seo-audit.spec.ts components/navigation.tsx
git commit -m "feat: instant SEO-audit lead magnet (analyzer, SSRF guard, PSI, page, capture)"
```

---

## Task 7: Lead → CRM capture helper (wire all sources into Supabase)

**Files:**
- Create: `lib/leads/capture.ts`
- Modify: `app/api/contact/route.ts`, `components/newsletter-signup.tsx` (+ its API path if one is added)

- [ ] **Step 1: Inspect the leads schema**

Run: `grep -n "create table" supabase/schema_part1_tables.sql | grep -iE "lead|inquir|engage|contact"`
Decide the target: if a `leads`/`inquiries` table exists, use it; otherwise record into `engagements` (status `'lead'`) or add a minimal `leads` table via a new migration `supabase/migrations/<ts>_leads.sql` with RLS (service-role insert; admin read) and update `tests/rls`. Document the chosen table in the commit.

- [ ] **Step 2: Implement the capture helper**

```ts
// lib/leads/capture.ts
import { supabaseAdmin } from '@/lib/supabase/server';
import { Resend } from 'resend';

export type LeadInput = {
  source: 'contact' | 'newsletter' | 'seo_audit' | 'checkout';
  email: string | null;
  name: string | null;
  detail: string;
  inquiryType?: string;
  budget?: string;
  amountCents?: number | null;
};

export async function captureLead(input: LeadInput): Promise<void> {
  // 1) Persist (never throw to the caller's happy path; log + continue).
  try {
    const sb = supabaseAdmin();
    await sb.from('leads').insert({
      source: input.source, email: input.email, name: input.name,
      detail: input.detail, inquiry_type: input.inquiryType ?? null,
      budget: input.budget ?? null, amount_cents: input.amountCents ?? null,
    });
  } catch (e) {
    console.error('[captureLead] persist failed:', e);
  }
  // 2) Notify (best-effort).
  try {
    const key = process.env.RESEND_API_KEY;
    if (key && input.email) {
      await new Resend(key).emails.send({
        from: 'Sage Ideas Leads <leads@sageideas.dev>',
        to: 'sage@sageideas.dev', replyTo: input.email,
        subject: `New ${input.source} lead`,
        text: `${input.detail}\nEmail: ${input.email}\nName: ${input.name ?? '—'}`,
      });
    }
  } catch (e) {
    console.error('[captureLead] notify failed:', e);
  }
}
```

(Adjust the inserted columns to match the actual table chosen in Step 1.)

- [ ] **Step 3: Route the contact form through it**

In `app/api/contact/route.ts`, after successful validation and before/with the existing Resend send, call `await captureLead({ source: 'contact', email: data.email, name: data.name, detail: data.message, inquiryType: data.inquiryType, budget: data.budget })`. Keep the existing direct Resend send (or consolidate into the helper — but do not regress the existing 502 error contract the form relies on).

- [ ] **Step 4: Newsletter capture**

If `components/newsletter-signup.tsx` only fires PostHog today, add a POST to a new `app/api/newsletter/route.ts` that validates email, rate-limits, and calls `captureLead({ source: 'newsletter', email, name: null, detail: 'Newsletter signup' })`.

- [ ] **Step 5: Verify writes + RLS still green**

Run: `npm run test:rls`
Expected: PASS (10/10). Manually confirm a contact submit + a seo-audit run each create one row in the chosen table (dev Supabase).

- [ ] **Step 6: Commit**

```bash
git add lib/leads/capture.ts app/api/contact/route.ts components/newsletter-signup.tsx app/api/newsletter supabase
git commit -m "feat: unify lead capture into Supabase pipeline across contact, newsletter, audit, checkout"
```

---

## Task 8: Full verification gate

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + lint + build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 2: Unit + RLS**

Run: `npm run test:unit && npm run test:rls`
Expected: PASS.

- [ ] **Step 3: Visual regression + a11y + E2E**

Run: `npx playwright test tests/visual` then `npm run test:e2e`
Expected: visual diffs only where intended (accepted in Tasks 1–3); E2E green (checkout/audit guarded by env where keys absent). Run axe (existing a11y harness) on `/`, `/pricing`, `/tools/seo-audit`, `/checkout/success`.

- [ ] **Step 4: Lighthouse / CWV budget**

Run: `npm run test:lh`
Expected: budgets held (LCP < 2.5s, CLS < 0.1, INP proxy/TBT < 200ms) on the configured pages.

- [ ] **Step 5: Final commit / open PR**

```bash
git add -A && git commit -m "chore: phase 0+1 verification pass"
```
Open a PR from `feat/acquisition-engine-phase-0-1` summarizing: token unification (+ restored motion layer), honest copy, conversion instrumentation, public checkout, SEO-audit magnet, lead→CRM. List every copy/claim change explicitly in the PR body.

---

## Self-review notes (gaps closed during planning)

- **Spec→task coverage:** token unification (T1), motion system (T2), truth pass (T3), instrumentation (T4), checkout (T5), lead magnet (T6), lead→CRM (T7), testing matrix (T8). All six spec components + cross-cutting CRM covered.
- **Discovered reality vs spec:** checkout was *half-built* (button exists, route missing) → T5 builds the route + tightens the gate rather than building UI from scratch. CSS "dual system" is actually *one live + one dead* file with a silently-missing motion layer → T1 reframed as merge+restore with a visual baseline captured *first*.
- **Open item for the operator (not a blocker):** the marketing pricing page (`components/v0-pricing/tier-cards.tsx`) shows headline tiers (Audit $1,500 / Build $4,900 / Studio $25k) that do **not** match `data/services/tiers.ts` (Audit $750 / Build $9,500). T3 softens claims; reconciling these two price sources to a single source of truth is recommended as an early Phase 2 item — flagged here so it isn't lost.
