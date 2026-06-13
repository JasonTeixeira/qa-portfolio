# Engineering Spec — Program H: Bridge Traffic, Growth Loop & Distribution

**Status:** Draft
**Depends on:** SEO-audit tool (done — `app/tools/seo-audit/`, `app/api/tools/seo-audit/route.ts`), Program A schema (structured data), Program D attribution (UTM on leads)
**Stack:** Next.js 16 / Supabase / Tailwind / PostHog / Resend
**Owner:** Jason Teixeira (solo)
**Updated:** 2026-06-13

---

## 1. Objective & 99+ Bar

**Objective:** Turn the already-built SEO-audit tool from a one-shot lead magnet into a compounding growth loop. Each audit produces a durable, indexable, shareable public page. That page carries a backlink-generating badge. The aggregate of real audit data funds a flagship original-data report. Outbound and digital-PR activity is tracked against real targets. Content is repurposed systematically. The result is qualified traffic in weeks, not the 6–12 months organic takes cold.

**99+ bar for Brand/Distribution (one of the ten scorecard categories):**

- Referring domains: 25+ within 90 days of launch, 50+ within 6 months, driven by badge embeds + digital-PR + tool shares.
- Branded search volume measurably rising (GSC baseline from Program G4 required).
- Tool report pages indexed in Google and appearing in impressions within 60 days of launch.
- One original-data flagship report live, with inbound links from at least two independent third-party domains.
- Outreach pipeline: 20+ ICP prospects contacted per month, tracked to reply + booking rate.
- Email list: 100+ subscribers seeded from owned channels (GitHub, LinkedIn, existing audiences) before any paid spend.
- UTM attribution covers 100% of off-site links; every lead in the `leads` table has a non-null `utm_source`.

**Guardrail:** Every claim, every data point in the flagship report, every badge number must be real and verifiable. The brand is "receipts, not promises." Violations destroy the moat.

---

## 2. Deliverables

### D1 — Shareable Public Report Pages

**What:** Each SEO audit is persisted to Supabase with a UUID and served at a public, indexable, crawlable URL. The page shows the full report (score, all 10 checks, PSI data), the audited domain, and a timestamp. No email address is ever present in the public payload or rendered HTML. The page carries full metadata (title, description, canonical, OG image, WebPage schema). Share button copies the permalink.

**Files (exact paths):**

- `lib/seo-audit/persist.ts` — NEW. `persistAuditReport(input): Promise<{ id: string }>`. Wraps `supabaseAdmin()` from `lib/supabase/server.ts`. Inserts into `audit_reports`. Returns the generated UUID. Never throws; logs errors and returns a fallback empty-string id so the audit API never degrades.
- `app/api/tools/seo-audit/route.ts` — MODIFY. After `captureLead(...)`, call `persistAuditReport(...)`, and include `{ ..., shareId: id }` in the `NextResponse.json(...)` response body.
- `app/tools/seo-audit/audit-form.tsx` — MODIFY. Extract `shareId` from the API response alongside `score` and `report`. Render a "Share your report" block below the `<Report>` component when `shareId` is truthy: a copyable URL `https://www.sageideas.dev/tools/seo-audit/r/{shareId}` + a badge snippet.
- `app/tools/seo-audit/r/[id]/page.tsx` — NEW. Async RSC. Fetches the stored report from Supabase using the anon client (RLS: public read; see D3). Renders `<ReportPage>` with the stored `report` JSONB cast to `SeoReport` (imported from `lib/seo-audit/analyzer.ts`). Exports `generateMetadata` that sets title `"SEO audit: {audited_url} — score {score}/100 · Sage Ideas"`, description, canonical, and OG via the existing `app/og/route.tsx` endpoint (parameters: `title`, `subtitle`, `eyebrow`, `accent=teal`).
- `app/tools/seo-audit/r/[id]/ReportPage.tsx` — NEW (`"use client"` only for the share-copy button; rest is RSC-compatible). Reuses the existing `<Report score={...} report={...} />` component from `app/tools/seo-audit/report.tsx` verbatim. Adds: audited URL display, score badge, timestamp, WebPage JSON-LD schema block, share button.
- `app/tools/seo-audit/r/[id]/schema.ts` — NEW. Pure function `buildWebPageSchema(id, url, score, createdAt): object`. Returns a `WebPage` + `SoftwareApplication` schema object. No side effects.

**Interface / contract:**

```ts
// lib/seo-audit/persist.ts
export async function persistAuditReport(input: {
  url: string;
  score: number;
  report: SeoReport; // from lib/seo-audit/analyzer.ts
}): Promise<{ id: string }>;

// app/api/tools/seo-audit/route.ts — modified response shape
// { score: number; report: SeoReport; shareId: string }
// shareId is '' (empty string) when persist fails — client treats '' as no share

// app/tools/seo-audit/r/[id]/page.tsx — generateMetadata signature
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata>;
```

**Acceptance criteria:**

1. `POST /api/tools/seo-audit` response body includes `shareId` (UUID string or `''`).
2. `GET /tools/seo-audit/r/{id}` with a valid UUID renders the stored report in under 500 ms (cold) using Supabase direct query.
3. The rendered HTML of the public page contains zero instances of any email address string (verified by test; see Tests).
4. `<title>` is unique per report (`SEO audit: {domain} — score {n}/100 · Sage Ideas`).
5. The page includes a valid `<link rel="canonical">` pointing to its own URL.
6. OG image URL points to `/og?title=...&eyebrow=SEO+AUDIT&accent=teal`.
7. A JSON-LD `<script type="application/ld+json">` block is present and contains `@type: "WebPage"`.
8. `robots` meta is `index, follow` (not noindex).
9. Share button copies the correct URL to clipboard (Playwright test).

**Tests:**

```ts
// __tests__/seo-audit/persist.test.ts
// Uses a Supabase test client or jest mock of supabaseAdmin
// - persistAuditReport inserts a row and returns a UUID-shaped string
// - persistAuditReport with a DB error returns { id: '' } without throwing

// __tests__/seo-audit/public-report.test.ts (Playwright)
// - navigate to /tools/seo-audit/r/{known-test-id}
// - assert h1 or score element is visible
// - assert page HTML does NOT contain the lead email used during seeding
// - assert canonical link href matches the page URL
// - assert JSON-LD block present and parseable
```

---

### D2 — Embeddable "Audited by Sage Ideas" Badge

**What:** An SVG/HTML snippet users paste into their own site. The badge displays the score, links back to `sageideas.dev/tools/seo-audit`, and includes the audit URL in query params so the backlink is rich. Two endpoints: one returns raw SVG (cacheable, for `<img src="...">` embeds); one returns an HTML code snippet for copy-paste. Both are public, no auth required. A `Link: <...>; rel="canonical"` response header points back to the tool page.

**Files (exact paths):**

- `app/api/badge/[id]/route.ts` — NEW. `export async function GET(req, { params })`. Reads the `audit_reports` row by id (anon client, public read RLS). Returns SVG for `?format=svg` (default), HTML snippet for `?format=html`. Cache-Control: `public, max-age=86400, stale-while-revalidate=604800` (scores don't change; 24-hour fresh + 7-day stale). Response includes `Link` header. Returns 404 if id not found. Returns 400 if id is not a valid UUID format (Zod `z.string().uuid()`).
- `lib/badge/render.ts` — NEW. Pure functions: `renderBadgeSvg(score, label): string` and `renderBadgeHtml(id, score, label): string`. No I/O. `score` is 0–100, `label` is the short score text (`Good` / `Needs work` / `Poor`). SVG uses inline styles only (no external CSS class names, so it renders correctly when embedded anywhere). The SVG `<a>` element links to `https://www.sageideas.dev/tools/seo-audit`. The HTML variant wraps the SVG in a `<a>` with `rel="noopener"`.

**Interface / contract:**

```ts
// lib/badge/render.ts
export function renderBadgeSvg(score: number, label: string): string;
export function renderBadgeHtml(id: string, score: number, label: string): string;

// GET /api/badge/{id}?format=svg   → Content-Type: image/svg+xml
// GET /api/badge/{id}?format=html  → Content-Type: text/html; snippet only, not a full document
// GET /api/badge/{id}              → defaults to svg
```

**SVG contract (minimum viable):**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="28" role="img"
     aria-label="SEO score {score}/100 · Sage Ideas">
  <title>SEO score {score}/100 · Sage Ideas</title>
  <a href="https://www.sageideas.dev/tools/seo-audit" target="_blank" rel="noopener noreferrer">
    <!-- left pill: "SEO Audit" in #2A2826 bg, #A8A29E text -->
    <!-- right pill: score + color band (teal ≥80, lime 50-79, coral <50) -->
  </a>
</svg>
```

Color band logic mirrors `report.tsx`: `score >= 80 ? '#0ED3CF' : score >= 50 ? '#A8C633' : '#E85D3A'`.

**Acceptance criteria:**

1. `GET /api/badge/{valid-id}` returns `Content-Type: image/svg+xml` and a valid SVG document (XML parse succeeds).
2. SVG contains `href="https://www.sageideas.dev/tools/seo-audit"` (backlink).
3. Response includes `Cache-Control: public, max-age=86400`.
4. `GET /api/badge/{nonexistent-id}` returns HTTP 404.
5. `GET /api/badge/not-a-uuid` returns HTTP 400.
6. `?format=html` returns a string containing `<img src=` or inline SVG, not a full `<!DOCTYPE html>` document.
7. Embedded SVG renders without external network requests (all styles inline, no href to external CSS).

**Tests:**

```ts
// __tests__/badge/render.test.ts
// - renderBadgeSvg(85, 'Good') — valid XML, contains correct color (#0ED3CF), score text "85"
// - renderBadgeSvg(55, 'Needs work') — correct color (#A8C633)
// - renderBadgeSvg(30, 'Poor') — correct color (#E85D3A)
// - renderBadgeHtml returns string containing <img or <svg and the sageideas.dev href

// __tests__/badge/route.test.ts (integration, mock Supabase)
// - GET /api/badge/{valid-id} → 200, SVG content-type
// - GET /api/badge/{missing-id} → 404
// - GET /api/badge/garbage → 400
```

---

### D3 — Supabase Data Model: `audit_reports` Table

_(Covered fully in Section 3 below; referenced here as a deliverable.)_

**Files:**

- `supabase/migrations/{timestamp}_create_audit_reports.sql` — NEW. DDL + RLS policies.

**Acceptance criteria:** Table exists in prod; anon role can SELECT `id, audited_url, score, report, created_at`; anon role cannot SELECT `email`; service role can INSERT all columns; no `email` column is exposed via the public API or rendered HTML.

---

### D4 — Original Data Flagship Report Page

**What:** A single-page, human-authored, data-backed editorial report built from REAL data you own (options: Nexural signal book data, trading win-rate stats already in the repo's `evidenceData.ts`, SEO audit aggregate scores from the `audit_reports` table once populated). NOT AI-generated filler. Article schema + Dataset schema. Designed to earn links. Slug is chosen for SEO value (e.g. `/reports/solo-b2b-operator-seo-benchmarks-2026`).

**Files (exact paths):**

- `app/reports/[slug]/page.tsx` — NEW. Async RSC. Reads from a content registry (see below). Exports `generateStaticParams` and `generateMetadata`. Renders the report body via MDX or structured content.
- `lib/reports/registry.ts` — NEW. Exports `REPORTS: ReportMeta[]` array. Each entry: `slug`, `title`, `description`, `publishedAt`, `updatedAt`, `category`, `datasets: DatasetMeta[]`. This is the content model. First entry is the flagship report.
- `lib/reports/types.ts` — NEW. `ReportMeta`, `DatasetMeta`, `DataPoint` type definitions.
- `content/reports/{slug}.mdx` — NEW. The actual report content. Human-written. Each data chart or table references real numbers from the sources above.
- `app/reports/[slug]/schema.ts` — NEW. `buildReportSchema(meta: ReportMeta): object`. Returns combined `Article` + `Dataset` JSON-LD object per schema.org spec.

**Content model (TypeScript types):**

```ts
// lib/reports/types.ts
export type DatasetMeta = {
  name: string;
  description: string;
  url?: string; // direct link to raw data if publishable
  datePublished: string; // ISO 8601
};

export type ReportMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO 8601
  updatedAt: string;
  category: 'seo' | 'trading' | 'agency' | 'engineering';
  datasets: DatasetMeta[];
  wordCount?: number; // for schema.org
};
```

**JSON-LD contract:**

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "...",
      "datePublished": "2026-...",
      "author": { "@type": "Person", "name": "Jason Teixeira", "url": "https://www.sageideas.dev/founder" },
      "publisher": { "@type": "Organization", "name": "Sage Ideas", "url": "https://www.sageideas.dev" }
    },
    {
      "@type": "Dataset",
      "name": "...",
      "description": "...",
      "creator": { "@type": "Person", "name": "Jason Teixeira" }
    }
  ]
}
```

**Acceptance criteria:**

1. `/reports/{slug}` returns HTTP 200 with a unique `<title>` and canonical link.
2. JSON-LD block validates in Google Rich Results Test (Article + Dataset types).
3. `generateStaticParams` returns all slugs from `REPORTS`; unknown slugs return 404.
4. Page contains at least one real data point (a number with a source attribution).
5. No AI-generated filler content (human gate — `[YOU]` dependency; see Section 6).
6. OG image set via `/og?` route.
7. Lighthouse performance score ≥ 90 on this page (no heavy client bundle; RSC-first).

**Tests:**

```ts
// __tests__/reports/registry.test.ts
// - REPORTS array has at least one entry
// - every entry has slug, title, publishedAt in ISO 8601 format
// - no duplicate slugs

// __tests__/reports/schema.test.ts
// - buildReportSchema returns object with @type Article and @type Dataset
// - datePublished is a valid ISO 8601 string
```

---

### D5 — Outreach & Link Tracking

**What:** A lightweight `outreach` Supabase table (not a full CRM — a simple tracker so you know who you contacted, when, on what channel, and what happened). Surfaced in `/admin` as a read/write view. A companion UTM convention document.

**Files (exact paths):**

- `supabase/migrations/{timestamp}_create_outreach.sql` — NEW. See Section 3 for schema.
- `app/admin/outreach/page.tsx` — NEW. Admin-gated RSC (reuse `app/admin-guard.ts` pattern). Lists outreach rows, sorted by `last_contact_at` DESC. Allows status updates via a Server Action.
- `app/admin/outreach/actions.ts` — NEW. Server Actions: `createOutreach(formData)`, `updateOutreachStatus(id, status)`. Both validate input with Zod, use `supabaseAdmin()`.
- `docs/marketing/utm-conventions.md` — NEW. See D6.

**Outreach table columns:** `id uuid`, `target_name text`, `target_url text`, `channel enum('haro','email','linkedin','podcast','directory','other')`, `status enum('identified','contacted','replied','linked','declined','paused')`, `notes text`, `utm_campaign text`, `first_contact_at timestamptz`, `last_contact_at timestamptz`, `referring_domain text` (populated when a link is secured), `created_at timestamptz default now()`.

**Acceptance criteria:**

1. `/admin/outreach` lists all outreach rows when logged in as admin.
2. Unauthorized access returns redirect to login (reuses existing admin guard).
3. `createOutreach` action inserts a row; `updateOutreachStatus` updates `status` and `last_contact_at`.
4. `referring_domain` column is nullable; populated manually when a link is confirmed.

**Tests:**

```ts
// __tests__/admin/outreach-actions.test.ts (unit, mock supabaseAdmin)
// - createOutreach with valid data inserts row
// - createOutreach with missing required field returns error, no insert
// - updateOutreachStatus updates status field
```

---

### D6 — UTM Convention Document

**File:** `docs/marketing/utm-conventions.md`

**What:** A human-readable SOP (not code) defining the UTM taxonomy for every off-site link. Tied to Program D4 (`D4. ATTRIBUTION + UTM DISCIPLINE` in the master plan). Every channel, every campaign, every content asset gets a documented pattern. Also specifies how to capture UTMs on the lead form and store them in the `leads.metadata` JSONB column (already wired — `lib/leads/capture.ts` accepts `metadata: Record<string, unknown>`).

**Content (minimum required sections):**

1. Parameter definitions (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) with allowed values per channel.
2. Source taxonomy: `linkedin`, `github`, `newsletter`, `haro`, `guest_post`, `product_hunt`, `reddit`, `hn`, `directory`, `badge` (for backlinks from badge embeds), `outbound_email`.
3. Medium taxonomy: `social`, `email`, `referral`, `cpc` (if used later), `organic` (never UTM-tag organic — it's already attributed).
4. Campaign naming pattern: `{year}-{month}-{initiative}` e.g. `2026-06-tool-launch`.
5. How to build a UTM URL (point to a URL builder; no external tool required — simple template).
6. Lead capture integration note: the AuditForm already submits a `url` but NOT UTMs. The form must be updated to read `utm_*` query params from `window.location.search` on mount and include them in the POST body (extend `BodySchema` in `app/api/tools/seo-audit/route.ts` with optional `utm_*` fields; pass through to `captureLead({ metadata: { ...existingMeta, utm_source, utm_medium, utm_campaign } })`).

**This document is NOT code — it is human-maintained.** Flag it as `[YOU]` to review and approve naming before any campaigns launch.

---

### D7 — "1 Post → N Assets" Repurposing Pipeline SOP

**File:** `docs/marketing/repurposing-pipeline.md`

**What:** A documented, repeatable SOP that defines how each published blog post (or original report) is atomized into distribution assets. Tied to Program F2 and B4 in the master plan. Not code — a human-executable playbook.

**Required sections:**

1. **Trigger:** When to run the pipeline (after every post publish, immediately).
2. **Asset map:**
   - LinkedIn article (long-form; 300–600 words; link back with UTM `utm_source=linkedin&utm_medium=social&utm_campaign=repurpose`).
   - LinkedIn thread (3–7 bullets; hook + insight + CTA).
   - Newsletter blurb (2–3 sentences; link to post; goes in the next digest).
   - X/Twitter thread (optional; same hook, shorter).
   - Dev.to / Medium cross-post with `<link rel="canonical">` pointing to sageideas.dev (specify canonical setup steps).
   - Short video script outline (optional; 60–90 seconds; hook, demo, CTA).
3. **Quality gate:** Every asset must be human-reviewed before publishing. AI drafting is permitted; unedited AI output is not.
4. **UTM tagging:** Each asset uses the UTM convention from D6.
5. **Tracking:** Log each asset publish in a simple table (post slug, asset type, publish date, link).
6. **Time budget:** Estimated 45–60 minutes per post to complete all mandatory assets (LinkedIn article + thread + newsletter). Video is deferred unless capacity allows.

---

### D8 — Tool Launch Checklist

**File:** `docs/marketing/tool-launch-checklist.md`

**What:** A one-time (and repeatable) checklist for launching the SEO-audit tool publicly and subsequent tool launches. Covers pre-launch, launch day, and post-launch tracking. Ties to H1 in the master plan.

**Required sections:**

1. **Pre-launch (technical):**
   - [ ] `audit_reports` table migrated to prod (D3).
   - [ ] `GET /tools/seo-audit/r/{id}` returns 200 for a test report.
   - [ ] Badge endpoint returns valid SVG for a test id.
   - [ ] Public report page is not `noindex`.
   - [ ] OG image renders correctly for a test report (inspect via `opengraph.xyz` or equivalent).
   - [ ] Share button copies the correct URL.
   - [ ] All UTM params for launch links prepared per D6.
   - [ ] PostHog events confirmed firing for `lead_magnet_start` and `lead_magnet_complete`.
   - [ ] `[YOU]` — Stripe and Supabase live creds verified (per §17 of master plan).
2. **Pre-launch (content):**
   - [ ] `[YOU]` — Write the LinkedIn launch post (lead with the tool, not the studio).
   - [ ] `[YOU]` — Prepare the Product Hunt submission (tagline, description, first comment, hunter).
   - [ ] `[YOU]` — Identify 3–5 relevant subreddits and communities (r/webdev, r/SEO, Hacker News Show HN).
   - [ ] `[YOU]` — Prepare the Show HN post title and top comment.
3. **Launch day:**
   - [ ] Submit Product Hunt at 12:01 AM PT (standard timing).
   - [ ] Post LinkedIn article.
   - [ ] Post Show HN.
   - [ ] Post in 2–3 relevant communities.
   - [ ] Reply to every comment same day.
4. **Post-launch (48–72 hours):**
   - [ ] Check GSC for indexing of any shared report URLs.
   - [ ] Check PostHog for `lead_magnet_complete` event volume.
   - [ ] Check Supabase `audit_reports` row count.
   - [ ] Check `leads` table for UTM source = `product_hunt` / `linkedin` / `hn`.
   - [ ] Capture referring domains in outreach table (D5) for any inbound links.
5. **KPIs to track (30-day post-launch):**
   - Tool completions (PostHog `lead_magnet_complete` count).
   - Unique shared report URLs accessed.
   - Badge embeds generated (count of `GET /api/badge/{id}` unique ids).
   - Leads with `source = seo_audit` and `utm_source = {launch channel}`.
   - New referring domains (Ahrefs / GSC).

---

## 3. Data Model / Schema

### `audit_reports` table

```sql
-- supabase/migrations/{timestamp}_create_audit_reports.sql

create table if not exists public.audit_reports (
  id            uuid primary key default gen_random_uuid(),
  audited_url   text not null,
  score         smallint not null check (score between 0 and 100),
  report        jsonb not null,           -- full SeoReport object (no email field)
  email         text,                     -- PRIVATE: captured for lead use only
  created_at    timestamptz not null default now()
);

-- Index for public report lookup (hot path: /tools/seo-audit/r/[id])
create index if not exists audit_reports_id_idx on public.audit_reports (id);

-- Index for admin queries (aggregate, launch metrics)
create index if not exists audit_reports_created_at_idx on public.audit_reports (created_at desc);

-- ── Row-Level Security ─────────────────────────────────────────────────────────

alter table public.audit_reports enable row level security;

-- Public read: anon can SELECT id, audited_url, score, report, created_at ONLY.
-- The email column is excluded via a security-barrier view (see below).
create policy "public_read_audit_reports"
  on public.audit_reports
  for select
  to anon, authenticated
  using (true);

-- Service role (used by the API route handler) can insert all columns.
-- No additional policy needed: service role bypasses RLS by default.
-- authenticated users cannot insert (no self-service writes from the browser).
create policy "no_insert_for_users"
  on public.audit_reports
  for insert
  to authenticated
  with check (false);
```

**PII isolation — the email column problem:**

The RLS policy above allows anon to select all columns including `email`. To prevent PII leakage, use one of two strategies (choose at build time):

- **Option A (recommended):** Create a `security_invoker` view `public.audit_report_public` that explicitly lists columns: `id, audited_url, score, report, created_at`. Grant SELECT on the view to `anon` and `authenticated`. Revoke SELECT on the base table from `anon`. The API route handler uses `supabaseAdmin()` (service role) and selects only `id, audited_url, score, report, created_at` explicitly.
- **Option B:** Never expose email via any select in application code. The `persistAuditReport` function and `audit_reports.select()` in the public RSC must always explicitly list columns: `.select('id, audited_url, score, report, created_at')`. This is the minimum; Option A adds a defense-in-depth database layer.

**The public RSC (`app/tools/seo-audit/r/[id]/page.tsx`) must always use Option B column selection regardless of which option is chosen for the view.**

```ts
// In persist.ts — insert (service role, all columns permitted)
const { data } = await sb.from('audit_reports').insert({
  audited_url: input.url,
  score: input.score,
  report: input.report,    // SeoReport JSONB — never includes email
  email: input.email,      // stored for operator use only, never returned to public
}).select('id').single();

// In public page — anon read, explicit columns only
const { data } = await sb.from('audit_reports')
  .select('id, audited_url, score, report, created_at')
  .eq('id', id)
  .single();
```

### `outreach` table

```sql
-- supabase/migrations/{timestamp}_create_outreach.sql

create type outreach_channel as enum (
  'haro', 'email', 'linkedin', 'podcast', 'directory', 'other'
);

create type outreach_status as enum (
  'identified', 'contacted', 'replied', 'linked', 'declined', 'paused'
);

create table if not exists public.outreach (
  id                  uuid primary key default gen_random_uuid(),
  target_name         text not null,
  target_url          text,
  channel             outreach_channel not null,
  status              outreach_status not null default 'identified',
  notes               text,
  utm_campaign        text,                   -- which campaign this contact is part of
  first_contact_at    timestamptz,
  last_contact_at     timestamptz,
  referring_domain    text,                   -- populated when a link is confirmed earned
  created_at          timestamptz not null default now()
);

alter table public.outreach enable row level security;

-- Outreach is admin-only. No public read.
create policy "admin_only_outreach"
  on public.outreach
  for all
  to authenticated
  using (
    exists (
      select 1 from public.leads
      where leads.email = auth.jwt() ->> 'email'
    )
  );
-- NOTE: Replace with your actual admin role check pattern (e.g. custom claim,
-- or the existing admin-guard.ts logic — see app/admin-guard.ts).
```

---

## 4. Integration Points (Reuse Real Files)

| What | Existing file to reuse | How |
|---|---|---|
| Supabase service-role client | `lib/supabase/server.ts` → `supabaseAdmin()` | Used in `persist.ts`, `badge/route.ts`, admin actions |
| Supabase anon/SSR client | `lib/supabase/server.ts` → `createSupabaseServerClient()` | Used in public RSC `r/[id]/page.tsx` |
| `SeoReport` type | `lib/seo-audit/analyzer.ts` | Imported into `persist.ts`, public RSC, `ReportPage.tsx` |
| `scoreReport` / score color logic | `lib/seo-audit/analyzer.ts` | Re-export or re-derive in `lib/badge/render.ts` |
| `<Report>` component | `app/tools/seo-audit/report.tsx` | Used verbatim in `ReportPage.tsx`; no duplication |
| OG image generator | `app/og/route.tsx` | Public report page passes `?title=...&eyebrow=SEO+AUDIT&accent=teal` |
| Analytics events | `lib/analytics/events.ts` + `trackEvent` | Add `audit_shared` event to `EVENT_NAMES` and `Payloads`; call from share button click handler in `audit-form.tsx` |
| Lead capture | `lib/leads/capture.ts` → `captureLead()` | Already called from `route.ts`; extend `metadata` to carry `utm_*` fields |
| Admin guard | `app/admin-guard.ts` | Used in `app/admin/outreach/page.tsx` |
| Rate limiting | `lib/rate-limit.ts` | Already applied in audit route; apply same to badge route (10 req/min per IP) |
| Score color thresholds | Inline in `app/tools/seo-audit/report.tsx` | Extract to `lib/seo-audit/score-color.ts` (one-liner) so `badge/render.ts` can import without pulling in the React component tree |

**New `trackEvent` additions required in `lib/analytics/events.ts`:**

```ts
// Add to EVENT_NAMES:
'audit_shared'
'badge_viewed'
'report_page_viewed'

// Add to Payloads:
audit_shared: { share_id: string; score: number }
badge_viewed: { share_id: string }
report_page_viewed: { share_id: string; audited_url: string }
```

---

## 5. Definition of Done

- [ ] `audit_reports` migration applied to Supabase prod (requires `[YOU]` live creds).
- [ ] `outreach` migration applied to Supabase prod.
- [ ] `POST /api/tools/seo-audit` response includes non-empty `shareId` for a real audit.
- [ ] `GET /tools/seo-audit/r/{id}` renders the stored report with correct title, OG, canonical, JSON-LD.
- [ ] Public report HTML contains zero occurrences of any email address (automated test passing).
- [ ] `GET /api/badge/{id}` returns valid SVG with backlink to `sageideas.dev/tools/seo-audit`.
- [ ] Badge route 404s for nonexistent ids and 400s for non-UUID strings.
- [ ] `GET /reports/{slug}` renders the flagship report with Article + Dataset JSON-LD.
- [ ] Flagship report content is human-authored with real data (not AI-generated filler — `[YOU]` sign-off required).
- [ ] `/admin/outreach` loads for authenticated admin, is unreachable for unauthenticated.
- [ ] All unit tests passing (`pnpm test`).
- [ ] All Playwright E2E tests passing for the public report page.
- [ ] Build passes (`pnpm build`) with zero TypeScript errors and zero lint errors.
- [ ] `docs/marketing/utm-conventions.md` exists and is reviewed by `[YOU]`.
- [ ] `docs/marketing/repurposing-pipeline.md` exists.
- [ ] `docs/marketing/tool-launch-checklist.md` exists and pre-launch technical checks all pass.
- [ ] PostHog events `audit_shared`, `badge_viewed`, `report_page_viewed` appear in PostHog realtime.
- [ ] Lighthouse on `/tools/seo-audit/r/{id}` scores ≥ 90 performance, ≥ 90 SEO, ≥ 90 accessibility.

---

## 6. [YOU] Prerequisites

These cannot be built, automated, or bypassed. Block the launch gate on all of them.

| # | What | Why blocked |
|---|---|---|
| Y1 | Valid Supabase runtime keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | Migrations cannot be applied; `persistAuditReport` cannot be verified end-to-end |
| Y2 | Apply both migrations to the Supabase project (or approve running them via the CLI / Supabase dashboard) | Tables do not exist in prod |
| Y3 | Author the flagship data report content (`content/reports/{slug}.mdx`) using real data you own | Cannot be outsourced; fake data destroys the brand; this is the core link-earning asset |
| Y4 | Write and schedule the tool launch posts for LinkedIn, Product Hunt, Show HN, and at least one community | The tool launch checklist (D8) specifies exactly what to prepare |
| Y5 | Approve the UTM naming convention in `docs/marketing/utm-conventions.md` before any campaigns fire | UTMs set in campaigns cannot easily be retroactively changed once links are distributed |
| Y6 | Review and approve all public copy on the public report page and the flagship report before indexing | Honesty guardrail — every claim must be true and permissioned |
| Y7 | Confirm which real dataset to use for the flagship report (Nexural signal book: 1254 closed / 32% hit / +0.216R is the strongest candidate per memory; or SEO audit aggregate data once the table has enough rows) | Determines the report's content and credibility |

---

## 7. Rollout & Verification

### Phase 1 — Data Layer (day 1)

1. Apply `audit_reports` and `outreach` migrations.
2. Verify via Supabase dashboard: tables exist, RLS enabled, anon cannot see `email` column (test with `curl` using the anon key).
3. Implement and deploy `lib/seo-audit/persist.ts`.
4. Modify `app/api/tools/seo-audit/route.ts` to call `persistAuditReport` and return `shareId`.
5. Run one real audit via the form; confirm a UUID appears in the response and a row appears in `audit_reports` in Supabase.

### Phase 2 — Public Report Page (days 2–3)

1. Implement `app/tools/seo-audit/r/[id]/page.tsx`, `ReportPage.tsx`, `schema.ts`.
2. Navigate to `/tools/seo-audit/r/{uuid-from-phase-1}` — confirm the report renders.
3. Inspect HTML source: confirm no email, correct title, canonical, JSON-LD.
4. Validate JSON-LD in Google Rich Results Test.
5. Confirm OG image renders (use `opengraph.xyz` or similar).
6. Run Playwright tests.

### Phase 3 — Badge Endpoint (day 4)

1. Implement `lib/badge/render.ts` and `app/api/badge/[id]/route.ts`.
2. `curl https://localhost:3000/api/badge/{id}` — confirm SVG response with backlink.
3. Paste the `<img src="/api/badge/{id}">` into a plain HTML file; confirm it renders and links back.
4. Run unit tests.

### Phase 4 — Admin Outreach (day 5)

1. Implement `app/admin/outreach/page.tsx` and `actions.ts`.
2. Log in as admin; navigate to `/admin/outreach`; confirm table loads.
3. Create a test outreach row; confirm it appears.
4. Verify unauthenticated access redirects.

### Phase 5 — Flagship Report (days 6–8, `[YOU]` gating)

1. `[YOU]` Draft and approve the report content.
2. Implement `lib/reports/registry.ts`, `lib/reports/types.ts`, `app/reports/[slug]/page.tsx`, `app/reports/[slug]/schema.ts`.
3. Place `content/reports/{slug}.mdx`.
4. Validate JSON-LD. Run Lighthouse. Confirm indexable.

### Phase 6 — UTM Integration & Launch Prep (day 9–10)

1. Extend `AuditForm` to read `utm_*` from query params and include in POST body.
2. Extend `BodySchema` in `app/api/tools/seo-audit/route.ts` for optional `utm_*` fields.
3. Pass UTMs through `captureLead({ metadata: { utm_source, utm_medium, utm_campaign } })`.
4. `[YOU]` Review and sign off `docs/marketing/utm-conventions.md`.
5. Complete all technical pre-launch checklist items in `docs/marketing/tool-launch-checklist.md`.
6. `[YOU]` Execute launch (Product Hunt, LinkedIn, Show HN, communities).

### Verification (post-launch, ongoing)

| Check | Tool | Cadence |
|---|---|---|
| New report rows in `audit_reports` | Supabase dashboard or `/admin` | Daily (first 2 weeks) |
| `lead_magnet_complete` events with `utm_source` | PostHog | Daily (first 2 weeks) |
| Badge endpoint requests | Supabase logs or Vercel logs | Weekly |
| Report pages indexed | Google Search Console → Coverage | Weekly |
| New referring domains | GSC + Ahrefs/Moz | Weekly |
| Outreach pipeline progress | `/admin/outreach` | Weekly |
| Flagship report inbound links | GSC → Links report | Monthly |

---

*Spec authored 2026-06-13. Update this document when schema changes are made or new deliverables are added.*
