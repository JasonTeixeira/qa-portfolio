# Engineering Spec — Program E: Conversion, Proof & Close

**Status:** Draft
**Depends on:** Program D events/attribution (PostHog instrumented in `lib/analytics/events.ts`); real proof [YOU]
**Stack:** Next.js 16 / Supabase / Stripe / PostHog (`posthog-js@1.372.8`) / Resend (`resend@4.0.1`)
**Systems:** S1 (experiments), S2 (money-page CRO), S3 (nurture), S4 (E-E-A-T)
**Source of truth:** `docs/ACQUISITION_MASTER_PLAN.txt` §§ Program E, S1–S4

---

## 1. Objective & 99+ Bar

Convert attention into signed deals without lying. The site's brand is "receipts, not promises" (`data/social-proof/testimonials.ts:16`). Every proof element must be named, permissioned, and verifiable; every experiment must be logged; every nurture email must earn a reply.

**99+ bar definitions:**

| Category | Current est. | Target | Gate |
|---|---|---|---|
| Proof / Credibility | 80 | 99 | ≥1 real named testimonial + logo on homepage + /pricing |
| Conversion / CRO | 70 | 99 | ICE-prioritised A/B backlog live; money pages pass CRO rubric |
| Lead Engagement | 75 | 99 | Nurture sequence active; lead scoring surfaced in /admin/leads |
| Analytics | 80 | 99 | Every lead has first-touch source; funnel visible in PostHog |
| E-E-A-T | — | 99 | Author bio + credentials on every blog post; third-party signals |

The score is composite. **A single [YOU] prerequisite (real named proof) is the binding constraint.** No amount of engineering closes that gap.

---

## 2. Deliverables

### D1 — Attributed Testimonial Data Model + Component

**What:** A typed data file and React component for real, named, permissioned testimonials and logos. Populated only when [YOU] supply actual proof. Ships empty (zero rendered items) until filled.

**Files:**
- `data/social-proof/attributed.ts` — new file (attributed testimonials + logos)
- `components/social-proof/AttributedTestimonial.tsx` — new component
- `components/social-proof/LogoBar.tsx` — permissioned logo strip

**Interface / contract:**

```ts
// data/social-proof/attributed.ts
export type AttributedTestimonial = {
  /** Unique stable key; never reused. */
  id: string;
  /** Written permission obtained from this person. Date stored in [YOU] records. */
  permissionDate: string; // ISO-8601 date
  name: string;
  title: string;
  company: string;
  /** Optional: path under /public or absolute URL. Monogram fallback when absent. */
  companyLogo?: string;
  quote: string;
  /** Specific, verifiable outcome — not "great to work with". */
  outcome: string;
  /** Case study slug this ties to, if any. */
  caseStudy?: string;
};

export type PermissionedLogo = {
  id: string;
  permissionDate: string;
  company: string;
  logo: string; // path under /public
  url?: string;
};

/** Empty until [YOU] supply real proof + permission. */
export const attributedTestimonials: AttributedTestimonial[] = [];

/** Empty until [YOU] supply logo permissions. */
export const permissionedLogos: PermissionedLogo[] = [];
```

**AttributedTestimonial component contract:**

```tsx
// components/social-proof/AttributedTestimonial.tsx
// Server component — no "use client" required.
export type AttributedTestimonialProps = {
  testimonial: AttributedTestimonial;
  variant?: 'card' | 'pullquote'; // card = proof grid row; pullquote = inline editorial
};
export function AttributedTestimonial({ testimonial, variant = 'card' }: AttributedTestimonialProps)
```

Renders an empty fragment when `attributedTestimonials.length === 0`. No placeholder copy, no fake quotes.

**Acceptance criteria:**
- [ ] `attributedTestimonials` array can be populated and components render without rebuild
- [ ] Renders `<figure>` with `<blockquote>` + `<figcaption>` (semantic HTML)
- [ ] `companyLogo` present → `<img>` with explicit width/height; absent → monogram initials
- [ ] Zero rendered DOM when array is empty (no empty `<ul>` or skeleton)
- [ ] Passes axe accessibility check (contrast, alt text, landmark roles)
- [ ] Reuses existing design tokens (`var(--sage-brand)`, `var(--sage-lime)`, etc.) — matches `components/social-proof/proof-grid.tsx` visual language

**Tests:**
```
tests/unit/attributed-testimonial.test.ts
  - renders nothing when array is empty
  - renders name, title, company when attributed=true
  - uses monogram when logo absent
  - renders outcome alongside quote
  - permissionDate field present and ISO-8601 valid

tests/ui/AttributedTestimonial.spec.ts (Playwright a11y)
  - axe scan passes on card variant
  - axe scan passes on pullquote variant
```

---

### D2 — /admin/leads Inbox Page

**What:** A server-rendered admin page listing all rows from the `leads` table. Reads via `supabaseAdmin()` (service-role, bypasses RLS). Gate: `requireAdmin()` from `lib/auth.ts`, same pattern as `app/admin/page.tsx`.

**Files:**
- `app/admin/leads/page.tsx` — new page

**Interface / contract:**

Reads `leads` table (schema: `supabase/migrations/0028_leads.sql`). Columns displayed:

| Column | Display label |
|---|---|
| `created_at` | Time |
| `source` | Source (`contact` / `newsletter` / `seo_audit` / `checkout`) |
| `email` | Email |
| `name` | Name |
| `inquiry_type` | Inquiry |
| `budget` | Budget |
| `amount_cents` | Amount |
| `metadata` | (JSON toggle) |
| `status` | Status (see D2a) |
| `score` | Score (see D5) |

**D2a — status column:** Add `status text not null default 'new'` and `score integer not null default 0` to the leads table via a new migration. Valid status values: `'new' | 'contacted' | 'qualified' | 'disqualified'`. Status updated via a Server Action in the page.

**Migration file:** `supabase/migrations/0029_leads_status_score.sql`

```sql
-- Migration 0029: add status + score to leads table.
alter table public.leads
  add column if not exists status text not null default 'new'
    check (status in ('new','contacted','qualified','disqualified')),
  add column if not exists score integer not null default 0;

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_score_idx  on public.leads (score desc);
```

**Page contract (excerpt):**

```tsx
// app/admin/leads/page.tsx
export const dynamic = 'force-dynamic';
export default async function AdminLeadsPage() {
  await requireAdmin(); // redirects non-admins → /portal, from lib/auth.ts
  const sb = supabaseAdmin();
  const { data: leads } = await sb
    .from('leads')
    .select('id, created_at, source, email, name, inquiry_type, budget, amount_cents, status, score, metadata')
    .order('created_at', { ascending: false })
    .limit(200);
  // ...
}
```

Status-update Server Action:
```ts
// app/admin/leads/actions.ts
'use server';
export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void>
```

**Acceptance criteria:**
- [ ] `/admin/leads` renders for admin role, redirects to `/portal` for non-admin
- [ ] All leads visible, ordered by recency, with source badge color-coded
- [ ] Status dropdown updates via Server Action with no full page reload (progressive enhancement: works without JS)
- [ ] Score column visible (D5 populates it)
- [ ] Metadata toggles to expanded JSON inline
- [ ] Empty state: "No leads yet" when table is empty

**Tests:**
```
tests/rls/leads-admin-read.spec.ts
  - anon SELECT on leads returns 0 rows (RLS policy on 0028)
  - admin authenticated session returns rows
  - non-admin authenticated (client role) returns 0 rows

tests/unit/leads-status-action.test.ts
  - updateLeadStatus with invalid status value rejected (Zod guard)
  - valid status values all accepted
```

---

### D3 — Money-Page CRO Component Set

**What:** A set of composable, accessible components placed on `/pricing` (`app/pricing/page.tsx`) and `/services/[slug]` (`app/services/[slug]/page.tsx`) to address the seven objection categories identified in the CRO playbook (D3a).

**Files:**
- `components/cro/ObjectionList.tsx`
- `components/cro/RiskReversal.tsx`
- `components/cro/FAQ.tsx`
- `components/cro/Comparison.tsx`
- `components/cro/SingleCTA.tsx`
- `components/cro/index.ts` — barrel re-export
- `docs/cro/money-page-playbook.md` — CRO playbook (separate doc, see D3a)

**Component contracts:**

```tsx
// components/cro/ObjectionList.tsx
// Server component.
export type Objection = {
  objection: string;  // "What if I need changes after delivery?"
  answer: string;     // Honest, specific. No marketing fluff.
};
export function ObjectionList({ objections }: { objections: Objection[] })
// Renders as <dl> with dt=objection, dd=answer. Semantic, screenreader-friendly.

// components/cro/RiskReversal.tsx
// Server component.
export type RiskReversalProps = {
  headline: string;   // "Every change reversible in 30 seconds."
  bullets: string[];  // Specific, true, verifiable claims only.
  cta?: { label: string; href: string };
};
export function RiskReversal(props: RiskReversalProps)

// components/cro/FAQ.tsx
// Client component — accordion interaction.
// "use client"
export type FAQItem = { question: string; answer: string };
export function FAQ({ items, id }: { items: FAQItem[]; id: string })
// Renders Radix Accordion; FAQPage JSON-LD injected via <JsonLd> in parent page.
// id prop scopes aria IDs to prevent conflicts when multiple FAQ instances exist.

// components/cro/Comparison.tsx
// Server component.
export type ComparisonRow = {
  feature: string;
  us: string | boolean;       // string = nuanced; boolean = yes/no
  alternative: string | boolean;
  alternativeLabel: string;   // "Agency", "Freelancer", "DIY"
};
export function Comparison({
  rows,
  alternativeLabel,
}: {
  rows: ComparisonRow[];
  alternativeLabel: string;
})
// Renders <table> with scope="col" headers. Honest comparisons only — no invented weaknesses for competitors.

// components/cro/SingleCTA.tsx
// Wrapper that enforces one primary action per money page surface.
// Accepts children (the actual CTA button/link) and a label for tracking.
export function SingleCTA({
  label,
  trackingLocation,
  children,
}: {
  label: string;
  trackingLocation: string; // passed to trackEvent('cta_click', { location, label })
  children: React.ReactNode;
})
```

**Acceptance criteria:**
- [ ] All components pass axe at AA level (contrast, keyboard navigation, ARIA)
- [ ] `FAQ` accordion keyboard-navigable (Enter/Space to open, arrow keys between items)
- [ ] `Comparison` table has `scope="col"` and `scope="row"` correctly set
- [ ] `RiskReversal` and `ObjectionList` contain only claims that are true for this studio
- [ ] `SingleCTA` fires `trackEvent('cta_click', ...)` on click via `lib/analytics/events.ts`
- [ ] No component ships placeholder / lorem ipsum content — data props required

**Tests:**
```
tests/ui/cro-components.spec.ts (Playwright a11y)
  - axe scan ObjectionList
  - axe scan RiskReversal
  - axe scan FAQ (open + closed state)
  - axe scan Comparison
  - FAQ: Enter key opens first item; arrow keys navigate
  - Comparison: has role="table" with proper scope attributes
```

---

### D3a — Money-Page CRO Playbook Document

**File:** `docs/cro/money-page-playbook.md`

This document is the written rubric every `/pricing` and `/services/[slug]` page is audited against. It is not shipped to production; it governs what gets built.

**Content outline (the document itself is written separately):**

1. **Objection map** — 7 buyer objections specific to this studio (solo operator, no agency overhead, price, reversibility, timeline, references, what-happens-if-scope-creeps). For each: the objection, the honest answer, and which component surfaces it.
2. **Risk reversal / guarantee section** — what this studio genuinely offers (every change reversible in 30s; callable references before you sign; no NDA blocking the work from your repo). No invented guarantees.
3. **Proof density rubric** — minimum proof elements per page type: `/pricing` needs ≥1 attributed testimonial OR ProofGrid; `/services/[slug]` needs ≥1 relevant case study link or shipped project.
4. **FAQ requirements** — minimum 5 questions per money page; must include price transparency question.
5. **Honest comparison rules** — compare on dimensions where this studio is genuinely differentiated (solo operator = no handoff; transparent pricing; callable references). Never invent weaknesses for competitors.
6. **Single CTA rule** — one primary CTA per above-the-fold section; secondary CTAs (book a call, view work) allowed below the fold.
7. **Audit checklist** — checkbox rubric run against each money page before release.

---

### D4 — PostHog Experiments + Session Replay Spec + ICE Backlog

**What:** Configuration for PostHog feature flags (A/B experiments) and session replay, plus a scored test backlog.

**Files:**
- `lib/analytics/experiments.ts` — feature flag helpers
- `docs/specs/posthog-ice-backlog.md` — prioritized experiment backlog (human-maintained)

**PostHog init changes** (`components/analytics/posthog-provider.tsx` — extend existing init at line 13):

```ts
posthog.init(key, {
  api_host: host,
  capture_pageview: true,
  capture_pageleave: true,
  person_profiles: 'identified_only',
  // Add:
  session_recording: {
    maskAllInputs: true,           // GDPR: mask form fields
    maskInputFn: (text, element) => {
      // Unmask non-sensitive fields if needed per element
      return text.replace(/./g, '*');
    },
  },
  enable_recording_console_log: false,
});
```

Note: `session_recording` requires `NEXT_PUBLIC_POSTHOG_KEY` and a PostHog project with session replay enabled (paid plan). **[YOU] must enable in PostHog dashboard.**

**Feature flag helper contract:**

```ts
// lib/analytics/experiments.ts
// Client-side only (called in Client Components or effects).
export type ExperimentVariant = 'control' | 'treatment';

/**
 * Read a PostHog feature flag synchronously after posthog.onFeatureFlags() resolves.
 * Returns 'control' when PostHog is uninitialised or the flag is absent —
 * safe default for SSR.
 */
export function getVariant(flagKey: string): ExperimentVariant {
  if (typeof window === 'undefined') return 'control';
  const v = posthog.getFeatureFlag(flagKey);
  return v === 'treatment' ? 'treatment' : 'control';
}

/**
 * Hook for use in Client Components.
 * Re-renders when PostHog resolves flags.
 */
export function useExperiment(flagKey: string): ExperimentVariant
```

**ICE-scored test backlog** (`docs/specs/posthog-ice-backlog.md`) — initial entries:

| # | Hypothesis | Pages | ICE score | Impact | Confidence | Ease | Flag key |
|---|---|---|---|---|---|---|---|
| 1 | Hero CTA "Book a free call" → "See the work first" reduces friction for cold traffic | `/` | 7.3 | 8 | 7 | 7 | `hero_cta_v2` |
| 2 | Showing price on /pricing as range ("from $750") vs. exact increases click-through to checkout | `/pricing` | 7.0 | 8 | 6 | 7 | `pricing_range_display` |
| 3 | RiskReversal block above vs. below primary CTA on service pages | `/services/[slug]` | 6.7 | 7 | 7 | 6 | `risk_reversal_position` |
| 4 | FAQ collapsed vs. pre-expanded first item on /pricing | `/pricing` | 5.7 | 6 | 6 | 5 | `pricing_faq_expanded` |
| 5 | Exit-intent modal with "Get the free SEO audit" vs. current "Subscribe" offer | `/` | 6.3 | 8 | 5 | 6 | `exit_intent_offer_v2` |

ICE = (Impact + Confidence + Ease) / 3. Re-score monthly. Ship one test per 2–3 weeks. Log results in the backlog doc.

**Acceptance criteria:**
- [ ] `getVariant()` returns `'control'` when PostHog not initialised (no crash)
- [ ] `useExperiment()` triggers re-render when PostHog loads flags
- [ ] Session replay enabled in init and masked for all inputs
- [ ] ICE backlog doc exists with ≥5 scored hypotheses
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` documented in `.env.local.example`

**Tests:**
```
tests/unit/experiments.test.ts
  - getVariant returns 'control' when window is undefined (SSR guard)
  - getVariant returns 'control' for unknown flag key
  - ICE scores are numbers 1-10 (schema validation on backlog)
```

---

### D5 — Lead Scoring

**What:** A deterministic scoring function that assigns an integer score (0–100) to each lead at capture time. Score stored in `leads.score` (added by migration 0029). Score surfaced in `/admin/leads`.

**Files:**
- `lib/leads/scoring.ts` — scoring logic
- Updated `lib/leads/capture.ts` — call `scoreLead()` before insert

**Scoring rules contract:**

```ts
// lib/leads/scoring.ts
export type LeadInput = import('./capture').LeadInput; // reuse existing type

export type ScoreFactors = {
  source: number;       // 0–25 pts
  hasBudget: number;    // 0–20 pts
  budgetTier: number;   // 0–20 pts
  hasName: number;      // 0–10 pts
  hasDetail: number;    // 0–15 pts
  utmSource: number;    // 0–10 pts (from metadata.utm_source)
};

/**
 * Returns a score 0–100.
 * Deterministic — same input always yields same output.
 * No external I/O.
 */
export function scoreLead(input: LeadInput): number
```

**Default scoring matrix:**

| Factor | Condition | Points |
|---|---|---|
| source | `checkout` | 25 |
| source | `contact` | 20 |
| source | `seo_audit` | 10 |
| source | `newsletter` | 5 |
| budget | present | 20 |
| budget | `> $10k` string | +20 (capped at 20 total with above) |
| budget | `$5k–$10k` string | +10 |
| name | present and not blank | 10 |
| detail | ≥ 100 chars | 15 |
| detail | ≥ 20 chars | 8 |
| utm_source in metadata | `linkedin` or `referral` | 10 |

Max possible: 100. Scores are advisory; [YOU] overrides via status field.

**Integration:** `lib/leads/capture.ts` line 31 — compute score before the `sb.from('leads').insert()` call, add `score: scoreLead(input)` to the insert payload.

**Acceptance criteria:**
- [ ] `scoreLead()` is a pure function with no side effects
- [ ] `checkout` source with budget and name scores ≥ 70
- [ ] `newsletter` source with no details scores ≤ 15
- [ ] Score stored in `leads.score` at capture time
- [ ] Visible in `/admin/leads` table

**Tests:**
```
tests/unit/lead-scoring.test.ts
  - checkout + budget + name + detail = high score (≥70)
  - newsletter + no detail = low score (≤15)
  - missing budget = 0 budget points (not undefined error)
  - all inputs validated before scoring (no crash on null metadata)
  - score capped at 100 (fuzz test with max inputs)
```

---

### D6 — B2B Nurture Sequence (Resend + Supabase)

**What:** A 5-step email sequence triggered on lead capture. Sequence tailored by `source` (intent proxy). Steps: welcome → value → proof → soft offer → call invite. Managed via Supabase tables; emails sent via Resend.

**Files:**
- `supabase/migrations/0030_nurture_sequences.sql` — schema
- `lib/nurture/trigger.ts` — enqueue a contact into a sequence
- `lib/nurture/step-runner.ts` — process one pending step (called by cron)
- `app/api/cron/nurture/route.ts` — Vercel cron endpoint
- `data/nurture/sequences.ts` — sequence definitions (step content)

**Schema (migration 0030):**

```sql
-- Nurture sequences table: defines which steps belong to which sequence.
create table if not exists public.nurture_sequences (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique, -- 'contact', 'seo_audit', 'checkout', 'newsletter'
  created_at  timestamptz not null default now()
);

create table if not exists public.nurture_steps (
  id            uuid primary key default gen_random_uuid(),
  sequence_id   uuid not null references public.nurture_sequences(id) on delete cascade,
  step_index    integer not null, -- 0-based order within the sequence
  delay_hours   integer not null, -- hours after enrollment (or previous step)
  subject       text not null,
  body_key      text not null,    -- key into data/nurture/sequences.ts bodies
  constraint nurture_steps_seq_order unique (sequence_id, step_index)
);

-- Enrollment: one row per contact per sequence.
create table if not exists public.nurture_enrollments (
  id              uuid primary key default gen_random_uuid(),
  lead_id         uuid not null references public.leads(id) on delete cascade,
  sequence_id     uuid not null references public.nurture_sequences(id) on delete cascade,
  email           text not null,
  enrolled_at     timestamptz not null default now(),
  completed_at    timestamptz,
  unsubscribed_at timestamptz,
  constraint nurture_enrollments_unique unique (lead_id, sequence_id)
);

-- Per-step delivery log.
create table if not exists public.nurture_deliveries (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references public.nurture_enrollments(id) on delete cascade,
  step_id         uuid not null references public.nurture_steps(id),
  scheduled_at    timestamptz not null,
  sent_at         timestamptz,
  resend_id       text,           -- Resend email ID for bounce tracking
  status          text not null default 'pending'
    check (status in ('pending','sent','failed','skipped'))
);

create index if not exists nurture_deliveries_scheduled_idx
  on public.nurture_deliveries (scheduled_at)
  where status = 'pending';

-- RLS: nurture tables are server-only (service-role writes; admin reads).
alter table public.nurture_sequences  enable row level security;
alter table public.nurture_steps      enable row level security;
alter table public.nurture_enrollments enable row level security;
alter table public.nurture_deliveries  enable row level security;

create policy nurture_admin_read on public.nurture_sequences
  for select using (exists (
    select 1 from app_users au
    where au.id = (select auth.uid())
      and au.role = any(array['admin','owner'])
  ));
-- (Repeat same policy pattern for nurture_steps, nurture_enrollments, nurture_deliveries)
```

**Trigger contract:**

```ts
// lib/nurture/trigger.ts
/**
 * Enroll a lead in the sequence matching their source.
 * Called from lib/leads/capture.ts after successful insert.
 * Best-effort — errors are logged, never surfaced to caller.
 */
export async function enrollInNurture(params: {
  leadId: string;
  email: string;
  source: LeadSource; // from lib/leads/capture.ts
}): Promise<void>
```

Sequence-to-source mapping:
- `contact` → `contact` sequence (most intent; fastest first step: 1h)
- `checkout` → `checkout` sequence (highest intent; fastest: 30 min)
- `seo_audit` → `seo_audit` sequence (tool users; first step: 2h)
- `newsletter` → `newsletter` sequence (lowest intent; first step: 24h)

**Step runner contract:**

```ts
// lib/nurture/step-runner.ts
/**
 * Find all pending nurture_deliveries where scheduled_at <= now(),
 * send via Resend, update status.
 * Called by /api/cron/nurture/route.ts.
 * Returns count of emails sent.
 */
export async function runPendingNurtureSteps(): Promise<number>
```

**Cron endpoint:**

```ts
// app/api/cron/nurture/route.ts
// Vercel cron: every 30 minutes.
// vercel.json: { "crons": [{ "path": "/api/cron/nurture", "schedule": "*/30 * * * *" }] }
export const runtime = 'nodejs';
export async function GET(req: NextRequest): Promise<NextResponse>
// Guards: CRON_SECRET header check (Vercel sets Authorization: Bearer <secret>).
```

**Sequence content** (`data/nurture/sequences.ts`) — example contact sequence:

| Step | delay_hours | Subject | Intent |
|---|---|---|---|
| 0 | 1 | "Got your message — here's what to expect" | Welcome / set expectations |
| 1 | 48 | "The system I actually use to ship production apps solo" | Value (real content) |
| 2 | 120 | "What past collaborators say (callable, not quoted)" | Proof |
| 3 | 216 | "The honest scope for what you described" | Soft offer |
| 4 | 336 | "15 minutes to figure out if this is the right fit" | Call invite |

**[YOU] prerequisites for D6:** `RESEND_API_KEY` live (already used in `app/api/contact/route.ts`). Verified sending domain `sageideas.dev` in Resend. Vercel cron enabled. `CRON_SECRET` env var set.

**Acceptance criteria:**
- [ ] `enrollInNurture()` creates one row in `nurture_enrollments` + 5 rows in `nurture_deliveries` with correct `scheduled_at` offsets
- [ ] `runPendingNurtureSteps()` sends only steps where `scheduled_at <= now()` and `status = 'pending'`
- [ ] Unsubscribed enrollments (`unsubscribed_at IS NOT NULL`) are skipped
- [ ] Completed enrollments are not re-enrolled (unique constraint on `lead_id, sequence_id`)
- [ ] Cron endpoint returns 401 without `CRON_SECRET`
- [ ] Each email sent has `replyTo: sage@sageideas.dev` (human replies land in inbox)
- [ ] **[YOU] flag:** live send requires `RESEND_API_KEY` + verified domain. Unit tests mock Resend.

**Tests:**
```
tests/unit/nurture-trigger.test.ts
  - enrollInNurture creates correct number of delivery rows
  - scheduled_at offsets match sequence definition
  - duplicate enrollment attempt does not throw (unique constraint respected)
  - unsubscribed lead skipped in step runner

tests/unit/nurture-step-runner.test.ts
  - only picks up deliveries where scheduled_at <= now() (mock clock)
  - marks sent rows with sent_at + resend_id + status='sent'
  - marks failed rows with status='failed' on Resend error
  - returns correct count

tests/rls/nurture-tables.spec.ts
  - anon cannot SELECT from nurture_enrollments
  - admin can SELECT from nurture_enrollments
```

---

### D7 — E-E-A-T Components

**What:** Author bio and credential components for blog posts and landing pages. Signals Google's E-E-A-T requirements: Experience, Expertise, Authoritativeness, Trustworthiness.

**Files:**
- `components/eeat/AuthorBio.tsx`
- `components/eeat/CredentialBadge.tsx`
- `components/eeat/FirstHandSignal.tsx`
- `components/eeat/ThirdPartyValidation.tsx`
- `components/eeat/index.ts`
- `data/eeat/author.ts` — Jason's author profile (real, single source of truth)

**Author profile contract:**

```ts
// data/eeat/author.ts
export type AuthorProfile = {
  name: string;          // "Jason Teixeira"
  title: string;         // "Solo founder, Sage Ideas"
  location: string;      // "Orlando, FL"
  bio: string;           // 2–3 honest sentences. First person, specific.
  /** Real shipped work. Each entry links to /work/[slug] or external. */
  credentials: Array<{
    label: string;        // "Built Nexural: 185 DB tables, 69 API endpoints"
    href?: string;
    verifiable: true;     // Must be true. No aspirational credentials.
  }>;
  /** Links to external presence. */
  links: {
    github: string;
    linkedin: string;
  };
  /** Path under /public to headshot. Until supplied: null (renders initials). */
  headshot: string | null;
};

export const author: AuthorProfile = {
  name: 'Jason Teixeira',
  title: 'Solo founder · Sage Ideas',
  location: 'Orlando, FL',
  bio: 'I build production systems for B2B companies. Every project ships with tests, receipts, and a callable reference.', // [YOU] refine
  credentials: [
    { label: 'Nexural — 185 DB tables, 69 API endpoints, live in production', href: '/work/nexural', verifiable: true },
    { label: 'AlphaStream — 200+ indicators, 5 ML models, open on GitHub', href: '/work/alphastream', verifiable: true },
  ],
  links: {
    github: 'https://github.com/sageideass', // [YOU] confirm correct handle
    linkedin: 'https://linkedin.com/in/jason-teixeira', // [YOU] confirm
  },
  headshot: null, // [YOU] supply: '/images/jason-teixeira.jpg'
};
```

**Component contracts:**

```tsx
// components/eeat/AuthorBio.tsx
// Server component.
// Rendered at the bottom of every blog post and on /about.
export function AuthorBio({ variant }: { variant: 'compact' | 'full' })
// compact: name + title + links (for blog post bylines)
// full: photo/monogram + bio + credentials + links (for /about, author page)

// components/eeat/CredentialBadge.tsx
// Server component.
// Single shipped-work credential pill with optional link.
export function CredentialBadge({ label, href }: { label: string; href?: string })

// components/eeat/FirstHandSignal.tsx
// Server component.
// Wraps a section of prose to signal first-hand experience ("I built X and ran into Y").
// Renders a subtle "First-hand experience" indicator beside the content.
export function FirstHandSignal({ children }: { children: React.ReactNode })

// components/eeat/ThirdPartyValidation.tsx
// Server component.
// GitHub stars, press mentions, reviews. Renders only items supplied.
export type ValidationItem = {
  source: string;   // "GitHub — AlphaStream"
  metric: string;   // "★ 47 stars"
  href: string;
  verified: true;   // Only real, linkable metrics.
};
export function ThirdPartyValidation({ items }: { items: ValidationItem[] })
```

**Acceptance criteria:**
- [ ] `AuthorBio` (full variant) renders semantic `<address>` element with name, title, location
- [ ] `AuthorBio` renders `<img>` with correct alt when headshot supplied; initials monogram when null
- [ ] `CredentialBadge` renders as `<a>` when href present, `<span>` otherwise
- [ ] All components pass axe at AA
- [ ] `author.ts` contains only `verifiable: true` entries (TypeScript enforces this)
- [ ] `ThirdPartyValidation` renders nothing when items array is empty

**Tests:**
```
tests/unit/author-eeat.test.ts
  - author.ts: all credentials have verifiable: true
  - author.ts: github + linkedin links are valid URL format
  - AuthorBio renders name and title in output
  - ThirdPartyValidation renders nothing on empty array

tests/ui/eeat-components.spec.ts (Playwright a11y)
  - axe scan AuthorBio compact
  - axe scan AuthorBio full
  - axe scan ThirdPartyValidation with items
```

---

## 3. Data Model / Schema

### Existing (read, do not modify)

**`leads` table** — `supabase/migrations/0028_leads.sql`
```
id uuid PK | created_at timestamptz | source text | email text | name text
detail text | inquiry_type text | budget text | amount_cents integer | metadata jsonb
```
RLS: admin/owner role via `app_users.role` check.

### New migrations

**`0029_leads_status_score.sql`** (D2a, D5)
```sql
ALTER TABLE public.leads ADD COLUMN status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new','contacted','qualified','disqualified'));
ALTER TABLE public.leads ADD COLUMN score integer NOT NULL DEFAULT 0;
```

**`0030_nurture_sequences.sql`** (D6)
Tables: `nurture_sequences`, `nurture_steps`, `nurture_enrollments`, `nurture_deliveries`.
Full DDL in D6 section above. RLS: service-role write, admin/owner read.

### Static data files (no DB)

- `data/social-proof/attributed.ts` — `AttributedTestimonial[]` + `PermissionedLogo[]` (starts empty)
- `data/eeat/author.ts` — `AuthorProfile` (one record, always present)
- `data/nurture/sequences.ts` — step content bodies keyed by `body_key`

---

## 4. Integration Points (Reuse Real Files)

| New deliverable | Reuses | How |
|---|---|---|
| D2 `/admin/leads` | `lib/auth.ts:requireAdmin()` | Same gate as `app/admin/layout.tsx:18` |
| D2 `/admin/leads` | `supabaseAdmin()` from `lib/supabase/server.ts` | Same pattern as `app/admin/page.tsx:91` |
| D2 Server Actions | `app/admin/settings/actions.ts` pattern | Follow same `'use server'` + Zod shape |
| D5 `scoreLead()` | `lib/leads/capture.ts:LeadInput` | Import type, call before insert at line 31 |
| D6 `enrollInNurture()` | `lib/leads/capture.ts:captureLead()` | Call after successful insert (best-effort, same error pattern) |
| D6 Resend send | `Resend` from `resend` (already in deps) | Same pattern as `app/api/contact/route.ts:124` |
| D6 cron auth | `CRON_SECRET` | Standard Vercel cron pattern; add to `vercel.json` |
| D4 `trackEvent()` | `lib/analytics/events.ts:trackEvent()` | `SingleCTA` calls this; add `cta_click` payload |
| D1 `TestimonialCard` design | `components/testimonial-card.tsx` design tokens | Same `var(--sage-brand)`, `[#0ED3CF]`, border colors |
| D3 `FAQ` | `@radix-ui/react-accordion` (already in deps) | Use existing Radix installation |
| D7 `AuthorBio` | `data/references.ts:Reference` | Cross-link `callAvailable` references from author bio |

**Event taxonomy extension** — add two new events to `lib/analytics/events.ts` for nurture and experiment tracking:

```ts
// Add to EVENT_NAMES:
'nurture_enrolled'   // fires when enrollInNurture() succeeds (server-side PostHog capture)
'experiment_viewed'  // fires when useExperiment() returns a variant in a Client Component
```

Update the count guard in `tests/unit/run.mjs` from 11 to 13.

---

## 5. Definition of Done

- [ ] All 7 deliverables (D1–D7) built, typed, and passing their acceptance criteria
- [ ] Migrations 0029 + 0030 applied to local Supabase and committed
- [ ] Unit tests: `node --import tsx tests/unit/run.mjs` — 0 failures (add new suites alongside existing)
- [ ] RLS tests: leads admin read, nurture tables anon blocked
- [ ] Playwright a11y tests: axe clean on CRO components, E-E-A-T components, attributed testimonial
- [ ] `/admin/leads` renders for admin, redirects for non-admin
- [ ] `scoreLead()` integrated into `lib/leads/capture.ts` — new leads arrive with score
- [ ] Nurture sequence enrolled on lead capture — verify with a test form submission (requires live Supabase + Resend)
- [ ] PostHog session replay init in `posthog-provider.tsx` — verify in PostHog dashboard ([YOU])
- [ ] ICE backlog doc exists at `docs/specs/posthog-ice-backlog.md` with ≥5 entries
- [ ] CRO playbook doc exists at `docs/cro/money-page-playbook.md`
- [ ] `data/social-proof/attributed.ts` exists with empty arrays — no build errors
- [ ] `data/eeat/author.ts` populated with real (verified) author data [YOU]
- [ ] `pnpm build` passes — 0 type errors, 0 lint errors
- [ ] Visual regression: no unintended UI regressions on `/`, `/pricing`, `/services/[slug]` (run `playwright.visual.config.ts`)

---

## 6. [YOU] Prerequisites

These cannot be automated. Nothing in D1, D6, D7 reaches production without them.

| # | What | Where it unlocks |
|---|---|---|
| P1 | **Real named testimonial(s)** — name, title, company, quote, specific outcome, written permission. At least 1. | D1 `attributedTestimonials[]`; unlocks `99` Proof score |
| P2 | **Logo permission** — for each company logo you want to display, written OK from them. | D1 `permissionedLogos[]`; LogoBar component |
| P3 | **Headshot** — supply `/public/images/jason-teixeira.jpg` (or equivalent). Square, ≥ 400px. | D7 `author.headshot`; AuthorBio full variant |
| P4 | **LinkedIn URL + GitHub handle** — confirm exact handles. | D7 `author.links`; E-E-A-T schema |
| P5 | **Author bio copy** — 2–3 sentences, first person, specific. Refine the placeholder in `data/eeat/author.ts`. | D7 `author.bio` |
| P6 | **Resend verified domain** — `sageideas.dev` already used in `app/api/contact/route.ts`; confirm live and deliverable. | D6 nurture emails send |
| P7 | **`CRON_SECRET` env var** — set in Vercel dashboard + `.env.local`. | D6 cron endpoint auth |
| P8 | **PostHog session replay** — enable in PostHog project settings (paid plan required). Confirm `NEXT_PUBLIC_POSTHOG_KEY` is live. | D4 session recording |
| P9 | **Nurture email copy** — 5 emails per sequence × 4 sequences. Drafts in `data/nurture/sequences.ts`; you must approve each before cron runs live. | D6 step content |
| P10 | **Third-party validation metrics** — actual GitHub star counts, press mentions, reviews. Only real, linkable numbers. | D7 `ThirdPartyValidation` items |

**GUARDRAIL (from `ACQUISITION_MASTER_PLAN.txt §0`):** Every claim on this site must be true and verifiable. `attributedTestimonials` and `permissionedLogos` arrays remain empty until [YOU] supply real proof. The codebase enforces this: `AttributedTestimonial` only renders when the array is non-empty.

---

## 7. Rollout & Verification

### Phase 1 — Infrastructure (no user-visible changes)

1. Run migration 0029 (`status` + `score` on leads)
2. Implement and test `scoreLead()` — unit tests pass
3. Wire `scoreLead()` into `captureLead()` — submit a test contact form, verify `score > 0` in Supabase
4. Run migration 0030 (nurture tables)
5. Implement `enrollInNurture()` — verify a lead row creates enrollment + delivery rows
6. Add cron endpoint; test locally with `curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/nurture`

**Gate:** All unit tests pass; local `pnpm build` clean.

### Phase 2 — Admin surfaces (internal only)

1. Build `/admin/leads` — verify admin sees leads, non-admin redirects
2. RLS test suite passes for leads table
3. Add nurture enrollment count to the `/admin/leads` row (how many emails queued)

**Gate:** Admin pages load; RLS tests clean.

### Phase 3 — CRO components (staging)

1. Build `components/cro/*` — run Playwright a11y tests
2. Write `docs/cro/money-page-playbook.md`
3. Place `ObjectionList` + `RiskReversal` + `FAQ` on `/pricing` and one `/services/[slug]`
4. Playwright visual regression: confirm no layout regressions
5. Add `SingleCTA` wrapper to primary CTAs on money pages

**Gate:** Axe clean; visual regression clean; no new TypeScript errors.

### Phase 4 — Proof + E-E-A-T (depends on [YOU] prerequisites P1–P5)

1. [YOU] supplies P1, P2, P3, P4, P5
2. Populate `data/social-proof/attributed.ts` and `data/eeat/author.ts`
3. Place `AttributedTestimonial` on homepage and `/pricing`
4. Place `AuthorBio` on all blog posts and `/about`
5. Visual QA of testimonial + bio blocks at 320, 768, 1440

**Gate:** Real proof live; no placeholder copy or lorem ipsum anywhere.

### Phase 5 — Experiments + session replay ([YOU] prerequisites P8)

1. [YOU] enables session replay in PostHog
2. Merge PostHog init changes to `posthog-provider.tsx`
3. Implement `lib/analytics/experiments.ts`
4. Create first experiment (hero CTA) in PostHog dashboard; wire `useExperiment('hero_cta_v2')` in homepage component
5. Verify variant split in PostHog UI after 48h of traffic

**Gate:** PostHog shows session recordings; first experiment has variant data.

### Phase 6 — Nurture goes live ([YOU] prerequisites P6, P7, P9)

1. [YOU] approves all nurture email copy in `data/nurture/sequences.ts`
2. Verify Resend domain
3. Set `CRON_SECRET` in Vercel
4. Enable cron in `vercel.json`
5. Submit a test lead; confirm email arrives in inbox within expected delay
6. Monitor Resend delivery dashboard for bounces in first 48h

**Gate:** Test email received; no bounces; delivery log populated in `nurture_deliveries`.

### Ongoing — monthly re-score

After each program increment: re-score the `§16 SCORECARD` in `ACQUISITION_MASTER_PLAN.txt`. Target: Proof/Credibility 99+, Conversion/CRO 99+, Lead Engagement 99+. The score is a trailing metric; it requires real traffic, real sends, and real wins.
