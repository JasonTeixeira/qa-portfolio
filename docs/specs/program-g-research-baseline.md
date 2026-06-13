# Engineering Spec — Program G: Research & Baseline

**Status:** Draft  
**Depends on:** GSC access (domain verified + data > 28 days), GA4 Measurement ID `G-XXXXXXXXXX` — both are `[YOU]` prerequisites  
**Stack:** Next.js 16 / Supabase / PostHog  
**Source of truth:** `docs/ACQUISITION_MASTER_PLAN.txt` §G (lines 490–528)  
**Gates:** Programs A–F. No keyword map = no justified content builds. No baseline = no measurable improvement.

---

## 1. Objective & 99+ bar

Program G produces the evidence layer that makes every downstream SEO and content decision auditable. The output is five durable artifacts — a living keyword map, a dated baseline snapshot, a content-audit inventory, a revenue-backwards model, and an ICP + messaging doc — all stored in the repo, all grounded in real data. The 99+ bar per `ACQUISITION_MASTER_PLAN.txt` §G1: *every published page traces to a mapped keyword + intent; every build decision traces to demand*. Concretely: (1) keyword map covers ≥ 100 terms with intent, cluster, and assigned URL, (2) baseline snapshot is dated 2026-06-14 or earlier and committed, (3) all 51 `content/blog/*.mdx` posts have a disposition, (4) revenue model shows explicit traffic target that justifies the content/link build volume, (5) ICP doc is in the repo and referenced from the content SOP.

**KPIs (measurable against this baseline later):**  
`indexed_pages`, `gsc_impressions`, `gsc_clicks`, `avg_position`, `referring_domains`, `cwv_lcp_ms`, `cwv_cls`, `cwv_inp_ms`, `organic_sessions_28d`, `conversion_rate_lead`.

---

## 2. Deliverables

### D1 — Keyword Map (`data/seo/keyword-map.ts`)

**What:** A typed, version-controlled keyword map covering every money page, content cluster, and programmatic SEO surface (services × industries matrix, `/compare/*` pages, blog pillars). Populated from a GSC export + external volume/difficulty data (Ahrefs CSV, Google Keyword Planner, or DataForSEO); not invented. Updated in source control on each quarterly review.

**Files to create:**
- `data/seo/keyword-map.ts` — the typed data array
- `data/seo/README.md` — instructions for refreshing from GSC/Ahrefs CSV

**Interface/contract:**

```typescript
// data/seo/keyword-map.ts

export type Intent = 'informational' | 'navigational' | 'commercial' | 'transactional'

export type Cluster =
  | 'testing-qa'
  | 'ai-engineering'
  | 'fintech-trading'
  | 'cloud-infra'
  | 'solo-studio'
  | 'compare'
  | 'money-page'

export interface KeywordEntry {
  /** The exact search query as it appears in GSC or research tool */
  term: string
  /** Estimated monthly search volume (US). Use 0 if unknown; do not guess. */
  monthlyVolume: number
  /** Keyword difficulty 0–100. Use -1 if unknown. */
  difficulty: number
  intent: Intent
  /** Canonical URL this keyword is assigned to (relative, e.g. '/services/build') */
  assignedUrl: string
  cluster: Cluster
  /** Primary (true) or supporting/secondary (false) */
  isPrimary: boolean
  /** ISO date string of last data refresh */
  lastRefreshed: string
  /** Optional GSC data from the baseline snapshot date */
  gscSnapshot?: {
    impressions28d: number
    clicks28d: number
    avgPosition: number
  }
}

export const keywordMap: KeywordEntry[] = [
  // populated from GSC export + external tool data — see data/seo/README.md
]

export function getKeywordsByCluster(cluster: Cluster): KeywordEntry[] {
  return keywordMap.filter((k) => k.cluster === cluster)
}

export function getKeywordsByUrl(url: string): KeywordEntry[] {
  return keywordMap.filter((k) => k.assignedUrl === url)
}

export function getPrimaryKeyword(url: string): KeywordEntry | undefined {
  return keywordMap.find((k) => k.assignedUrl === url && k.isPrimary)
}
```

**How it's populated:** Export "Search results → Queries" from GSC (last 12 months, CSV). Map each query to the landing page from the "Pages" tab. Add external volume/difficulty from a tool of your choice (Ahrefs, DataForSEO, or Keyword Planner). Merge into this file. See `data/seo/README.md` for the column mapping. The `gscSnapshot` field is filled in once at baseline time by running `scripts/seo/baseline.mjs` (D2 below).

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes with the file present
- ≥ 1 entry per money page (`/services/*`, `/pricing`, `/industries/*`, `/compare/*`, `/work/*`)
- ≥ 1 entry per blog post that already has measurable GSC impressions
- Every entry has a non-null `intent` and a non-empty `assignedUrl`
- `getKeywordsByUrl` and `getPrimaryKeyword` return correct results for spot-checked URLs

**Tests:** `tests/unit/seo/keyword-map.test.ts`
- Assert schema validates (Zod or manual): every field present + correctly typed
- Assert no duplicate `term + assignedUrl` pairs
- Assert `getPrimaryKeyword` returns exactly one or zero results per URL
- Assert `lastRefreshed` is a valid ISO date string

---

### D2 — Baseline Snapshot Script (`scripts/seo/baseline.mjs`)

**What:** A Node.js ESM script (no TypeScript compilation required — matches the pattern of existing `.mjs` scripts in `scripts/`) that pulls real data from the Google Search Console API and Google Analytics Data API, then writes a dated JSON snapshot to `docs/baselines/<YYYY-MM-DD>.json`. Run once at Program G kickoff, then quarterly.

**Files to create:**
- `scripts/seo/baseline.mjs`
- `docs/baselines/.gitkeep` (so the directory is tracked)
- `docs/baselines/<date>.json` — generated output, **committed to repo** as the "before" record

**Data sources:**

| Data point | API / Source |
|---|---|
| GSC impressions, clicks, avg position (28d) | Search Console API `searchanalytics.query` with `dimensions: ['page', 'query']` |
| Indexed pages count | Search Console API `urlInspection` or `sitemaps.list` + count from `sitemap.xml` |
| Referring domains | Manual entry from Ahrefs/Majestic free lookup **or** Cloudflare Web Analytics (no API yet) — see JSON shape below |
| CWV (LCP, INP, CLS) | GSC Core Web Vitals report via API or PageSpeed Insights API (`googleapis/pagespeed`) |
| GA4 organic sessions 28d | Google Analytics Data API `runReport` with `sessionSourceMedium` filter |
| Conversion events (28d) | GA4 Data API `runReport` filtering key events: `contact_submit`, `checkout_complete`, `lead_magnet_complete`, `booking_click` — mirrors the PostHog `EVENT_NAMES` in `lib/analytics/events.ts` |

**Auth pattern:** Uses a Google service account JSON key. Path set via env var `GOOGLE_APPLICATION_CREDENTIALS`. GSC property is `sc-domain:sageideas.dev`. GA4 property ID is set via env var `GA4_PROPERTY_ID`. Both are `[YOU]` prerequisites (see §6).

**Script interface (CLI):**

```bash
node scripts/seo/baseline.mjs
# writes docs/baselines/2026-06-14.json
# also stamps gscSnapshot into data/seo/keyword-map.ts entries (dry-run flag available)

node scripts/seo/baseline.mjs --dry-run
# prints JSON to stdout, writes nothing
```

**Output JSON shape (`docs/baselines/<date>.json`):**

```typescript
// Type reference only — the script emits this as plain JSON
interface BaselineSnapshot {
  capturedAt: string        // ISO 8601, e.g. "2026-06-14T10:00:00Z"
  capturedBy: string        // "scripts/seo/baseline.mjs v1"
  gsc: {
    property: string        // "sc-domain:sageideas.dev"
    periodDays: 28
    impressions: number
    clicks: number
    avgPosition: number
    indexedPagesApprox: number  // from sitemap or GSC coverage
    topPages: Array<{
      page: string          // relative URL
      impressions: number
      clicks: number
      avgPosition: number
    }>                      // top 25 by impressions
    topQueries: Array<{
      query: string
      impressions: number
      clicks: number
      avgPosition: number
    }>                      // top 50 by impressions
  }
  ga4: {
    propertyId: string
    periodDays: 28
    organicSessions: number
    totalSessions: number
    topOrganicPages: Array<{ page: string; sessions: number }>  // top 20
    conversionEvents: Record<string, number>  // e.g. { "contact_submit": 3 }
  }
  cwv: {
    measuredAt: string
    source: 'pagespeed-api' | 'gsc-cwv-api' | 'manual'
    pages: Array<{
      url: string           // absolute URL
      lcp_ms: number
      cls: number
      inp_ms: number
      mobileScore: number   // Lighthouse performance score 0–100
      desktopScore: number
    }>  // home, /blog, /work, /services, /pricing at minimum
  }
  referringDomains: {
    count: number
    source: 'ahrefs' | 'majestic' | 'manual'
    capturedAt: string
    notes: string
  }
  brandedSearch: {
    impressions28d: number  // from GSC filtering query contains "sage ideas" OR "jason teixeira"
    clicks28d: number
    avgPosition: number
  }
}
```

**Acceptance criteria:**
- Script exits 0 and writes a valid JSON file to `docs/baselines/`
- JSON validates against the shape above (manual spot-check or Zod parse in the script)
- The baseline file for 2026-06-14 is committed to the repo before Program A work begins
- `--dry-run` flag prints JSON without writing files
- Script does NOT mutate `data/seo/keyword-map.ts` unless `--write-gsc-snapshots` flag is passed (to keep side effects explicit)

**Tests:** `tests/unit/seo/baseline-shape.test.ts`
- Load a fixture JSON matching the interface and assert schema integrity
- Assert `capturedAt` is a valid ISO 8601 date
- Assert `gsc.topPages` has ≤ 25 entries and each has all required fields
- No integration test against live APIs (those run manually)

---

### D3 — Content Audit Tool (`scripts/seo/content-audit.mjs`)

**What:** A Node.js ESM script that reads every `content/blog/*.mdx` file using `gray-matter` (already a prod dependency — see `lib/blog-server.ts` which uses it), scores each post against a rubric, cross-references the keyword map from D1, and emits a dated JSON inventory. No DB writes; pure file I/O.

**Files to create:**
- `scripts/seo/content-audit.mjs`
- `docs/seo/content-inventory.<date>.json` — generated output, committed

**Blog frontmatter shape (actual, from `lib/blog-server.ts` + sampled MDX files):**

```typescript
// Parsed from gray-matter — all fields are what parseMdxFile() in lib/blog-server.ts extracts
interface BlogFrontmatter {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string          // ISO "YYYY-MM-DD"
  category: string
  tags: string[]
  readTime: string
  coverImage?: string   // "/blog/covers/<slug>.png"
}
```

**Scoring rubric (each criterion 0–2; max 10):**

| # | Criterion | 0 | 1 | 2 |
|---|---|---|---|---|
| 1 | Has primary keyword in title | No | Partial | Exact |
| 2 | Word count (proxy: `fullContent.split(' ').length`) | < 500 | 500–1000 | > 1000 |
| 3 | Has `excerpt` (non-empty) | No | — | Yes |
| 4 | Has `coverImage` | No | — | Yes |
| 5 | Assigned to a keyword-map entry (D1) | No | Partial match | Primary match |

**Disposition logic:**

| Score | GSC impressions (28d) | Disposition |
|---|---|---|
| ≥ 8 | any | `keep` |
| 6–7 | > 100 | `keep` |
| 6–7 | ≤ 100 | `improve` |
| 4–5 | > 50 | `improve` |
| 4–5 | ≤ 50 | `merge` (find the pillar it belongs to) |
| < 4 | any | `prune` (301 redirect target required) |

**Output shape (`docs/seo/content-inventory.<date>.json`):**

```typescript
interface ContentInventory {
  generatedAt: string
  postCount: number
  clusterSummary: Record<string, { count: number; avgScore: number }>
  posts: Array<{
    slug: string
    title: string
    date: string
    category: string
    tags: string[]
    wordCountApprox: number
    rubricScore: number         // 0–10
    rubricBreakdown: number[]   // score per criterion
    gscImpressions28d: number   // from baseline snapshot; 0 if no match
    gscClicks28d: number
    gscAvgPosition: number
    assignedKeyword: string | null
    cluster: string | null
    disposition: 'keep' | 'improve' | 'merge' | 'prune'
    mergeTarget: string | null  // slug of the pillar page if disposition is 'merge'
    pruneRedirectTarget: string | null  // URL to 301 to if disposition is 'prune'
    notes: string
  }>
}
```

**CLI:**

```bash
node scripts/seo/content-audit.mjs
# reads content/blog/*.mdx + docs/baselines/<latest>.json + data/seo/keyword-map.ts
# writes docs/seo/content-inventory.2026-06-14.json

node scripts/seo/content-audit.mjs --baseline docs/baselines/2026-06-14.json
```

**Acceptance criteria:**
- Script enumerates all 51 MDX files (current count as of 2026-06-13)
- Every post gets a disposition; none is null
- All `prune` dispositions include a `pruneRedirectTarget`
- Output JSON is valid and committed to `docs/seo/`
- Script exits non-zero if `content/blog/` is missing or unreadable

**Tests:** `tests/unit/seo/content-audit.test.ts`
- Test `scorePost()` pure function with fixture frontmatter + content
- Assert `disposition` logic produces correct output for boundary scores
- Assert all dispositions are in the allowed enum
- Fixture: three MDX strings — one thin (score 2, prune), one mid (score 6, improve), one rich (score 9, keep)

---

### D4 — Revenue-Backwards Model (`docs/seo/revenue-model.md`)

**What:** A Markdown doc (human-authored, not generated) that makes the math from `ACQUISITION_MASTER_PLAN.txt` §2 explicit and specific to the actual pricing found in `data/services/tiers.ts`. Fills in real numbers from the baseline (D2) and the existing funnel model. Updated quarterly.

**File to create:** `docs/seo/revenue-model.md`

**Template structure (embed in the file itself as the initial content):**

```
# Revenue-Backwards Model — Sage Ideas

Updated: <date>
Source pricing: data/services/tiers.ts
Baseline snapshot: docs/baselines/<date>.json

## Revenue Goal
Target monthly revenue: $___
Target annual revenue:  $___

## Deal Mix (from data/services/tiers.ts)
| Tier           | Price      | Avg deal size | Assumed mix |
|----------------|------------|---------------|-------------|
| Audit          | $___       | $___          | __ %        |
| Build          | $___       | $___          | __ %        |
| Care retainer  | $___/mo    | $___          | __ %        |
Blended avg deal value: $___

## Funnel Math
Revenue target / blended avg deal = DEALS NEEDED / month: ___
Deals / proposal win rate (25–40%) = CALLS NEEDED:       ___
Calls / call-book rate (20–30%)    = LEADS NEEDED:        ___
Leads / lead rate (2–4%)           = ORGANIC SESSIONS:    ___

## Current Baseline (from docs/baselines/<date>.json)
Organic sessions/month (28d ÷ 28 × 30): ___
Lead rate observed (PostHog):            ___%
Call-book rate observed:                 ___%
Proposal win rate observed:              ___%

## Gap Analysis
Sessions needed: ___   Sessions today: ___   Gap: ___
Gap implies: ___ more keyword rankings / ___ referring domains needed

## Content & Link Volume Required
To close gap in 12 months:
- New indexed pages needed (at __ sessions/page avg): ___
- Referring domains needed (at __ sessions/domain avg): ___
- New posts/month at current depth: ___

## Constraints (solo operator)
Max posts/month (realistic): ___
Months to close gap at that rate: ___
Lever with highest ROI given constraint: ___

## Review cadence
Re-run monthly against latest GA4 + GSC export.
```

**Acceptance criteria:**
- File exists and is committed
- All `$___` placeholders are filled with real numbers before Program A work starts
- Revenue goal is explicit and sourced from Jason's actual target (not invented)
- Funnel math uses the actual conversion rates observed in PostHog once available

**Tests:** None (human doc). Lint: markdown-lint passes.

---

### D5 — ICP + Messaging Foundation (`docs/brand/icp-messaging.md`)

**What:** A single-page, human-authored doc establishing the Ideal Customer Profile and messaging hierarchy that every blog post, money page, and CTA is checked against. Derived from `ACQUISITION_MASTER_PLAN.txt` §1 (North Star, Positioning, Target Buyer, Value Props) but made operationally specific. Paired with `docs/voice-guide.md` (already exists).

**File to create:** `docs/brand/icp-messaging.md`

**Required sections:**

1. **ICP** — industry, company size, role (title), trigger event (the moment they search), core pain, anti-ICP (who not to target)
2. **Value hierarchy** — the single sentence + the three supporting pillars (sourced from the "receipts, not promises" positioning in the plan)
3. **Messaging map per page type** — money pages / blog / compare / founder — one-sentence angle each
4. **Objection map** — top 5 objections + honest one-sentence rebuttals (no marketing spin)
5. **Voice constraints** — what to say / not say (complements `docs/voice-guide.md`)
6. **Content gate** — a three-question checklist every blog post must pass before publish

**Acceptance criteria:**
- File exists and is committed
- ICP section has at least: industry, role, trigger event, pain, anti-ICP
- Objection map has ≥ 5 entries
- Content gate has ≥ 3 questions
- Referenced from `docs/AGENCY_OPERATIONS.md` or the daily SOP (add a line in §14 of the master plan once written)

**Tests:** None (human doc).

---

## 3. Data model / schema

Program G does not persist to Supabase. All artifacts are flat files in the repo. The one exception: if a future iteration wants to surface keyword or audit data in the `/admin` UI, the following migration would apply then.

```sql
-- Future only — not in Program G scope
-- create table seo_keyword_map (
--   id uuid primary key default gen_random_uuid(),
--   term text not null,
--   monthly_volume int,
--   difficulty int,
--   intent text check (intent in ('informational','navigational','commercial','transactional')),
--   assigned_url text not null,
--   cluster text not null,
--   is_primary boolean default false,
--   last_refreshed timestamptz,
--   created_at timestamptz default now()
-- );
```

TypeScript types for D1 (keyword map) and D2/D3 (snapshot + inventory) are defined inline with the deliverables above and live entirely in `data/seo/` and `docs/`. No Supabase client (`lib/supabase/server.ts`) is required for Program G.

---

## 4. Integration points

**Blog frontmatter parser — reuse directly:**  
`lib/blog-server.ts` → `parseMdxFile()` uses `gray-matter` (dep already installed). `scripts/seo/content-audit.mjs` should replicate this parsing logic in plain Node.js ESM (no TS compilation, matching the pattern of `scripts/validate-content.mjs` which already does manual `.ts` source parsing). Use `gray-matter` via `import matter from 'gray-matter'` — it ships CommonJS with ESM-compatible default export.

**Existing script conventions:**  
`scripts/validate-content.mjs` is the canonical pattern: Node-only, no build step, reads files with `fs/promises`, parses source with regex or a library, exits with a non-zero code on failure. Follow the same pattern exactly.

**Sitemap for indexed-page count:**  
`app/sitemap.ts` generates the sitemap dynamically; `SITE = 'https://www.sageideas.dev'`. The baseline script can `fetch('https://www.sageideas.dev/sitemap.xml')` (in production) or count `app/sitemap.ts` entries statically in dev mode. In dev, call the GSC Coverage report API instead.

**PostHog event taxonomy:**  
Conversion event names in `lib/analytics/events.ts` (`EVENT_NAMES`) are the canonical list for GA4 conversion filtering. The baseline script maps these exact event names when querying the GA4 Data API: `contact_submit`, `checkout_complete`, `lead_magnet_complete`, `booking_click`.

**Supabase client:**  
Not used in Program G. The pattern (`supabaseAdmin()` / `createSupabaseServerClient()` in `lib/supabase/server.ts`) is available if a future admin route surfaces keyword or audit data, but is out of scope here.

**TypeScript path aliases:**  
`@/` resolves to the project root per `tsconfig.json`. `data/seo/keyword-map.ts` is importable as `@/data/seo/keyword-map` from any Next.js file (server components, route handlers) if a future page needs the data. The audit script runs as a standalone Node process and uses relative paths instead.

---

## 5. Definition of Done

- [ ] `data/seo/keyword-map.ts` exists, compiles, and has ≥ 50 real keyword entries
- [ ] `data/seo/README.md` documents the GSC → file refresh workflow
- [ ] `scripts/seo/baseline.mjs` runs without error against live credentials and writes a JSON file
- [ ] `docs/baselines/2026-06-14.json` (or nearest date) is committed and non-empty
- [ ] `scripts/seo/content-audit.mjs` runs against the 51 MDX posts and emits `docs/seo/content-inventory.<date>.json`
- [ ] All 51 posts have a disposition (`keep` / `improve` / `merge` / `prune`)
- [ ] All `prune` dispositions have a `pruneRedirectTarget`
- [ ] `docs/seo/revenue-model.md` exists with all placeholders filled from real data
- [ ] `docs/brand/icp-messaging.md` exists with ICP, value hierarchy, objection map, and content gate
- [ ] `pnpm tsc --noEmit` still exits 0 after adding `data/seo/keyword-map.ts`
- [ ] Unit tests in `tests/unit/seo/` pass (`pnpm test`)
- [ ] No secrets committed (GSC service account key stays in `.env.local` / CI secrets, never in the JSON baseline files)
- [ ] The baseline snapshot date appears in `docs/13-phase-summary.md` or the master plan as a recorded milestone

---

## 6. [YOU] prerequisites

| # | What | Why blocked on you |
|---|---|---|
| 1 | Google Search Console domain verification (`sc-domain:sageideas.dev`) | Requires DNS TXT record addition |
| 2 | GSC data age ≥ 28 days after verification | API returns null for unverified or new properties |
| 3 | GA4 Measurement ID (`G-XXXXXXXXXX`) | Required for `baseline.mjs` GA4 Data API queries; also unblocks Program D |
| 4 | Google Cloud project + service account JSON key with `Search Console API` + `Analytics Data API` enabled | `baseline.mjs` uses Application Default Credentials via `GOOGLE_APPLICATION_CREDENTIALS` |
| 5 | Actual revenue target (monthly/annual) | Needed to fill `docs/seo/revenue-model.md` — cannot be derived from code |
| 6 | Current referring-domain count from Ahrefs / Majestic free lookup | GSC does not expose backlink data; baseline JSON has a manual-entry field for this |
| 7 | ICP sign-off (who is the exact buyer, what is the trigger event) | `docs/brand/icp-messaging.md` has a human-auth section that needs founder input |

Set `GOOGLE_APPLICATION_CREDENTIALS`, `GA4_PROPERTY_ID`, and `GSC_SITE_URL` in `.env.local` (already gitignored). Do not commit the service account JSON.

---

## 7. Rollout & verification

**Order of operations:**

```
[YOU] complete §6 prerequisites
  → commit data/seo/keyword-map.ts (with ≥ 50 entries from GSC export)
  → run: node scripts/seo/baseline.mjs
  → commit docs/baselines/<date>.json
  → run: node scripts/seo/content-audit.mjs --baseline docs/baselines/<date>.json
  → commit docs/seo/content-inventory.<date>.json
  → fill docs/seo/revenue-model.md (human step)
  → fill docs/brand/icp-messaging.md (human step)
  → run: pnpm tsc --noEmit   (must exit 0)
  → run: pnpm test tests/unit/seo/   (must exit 0)
  → update docs/13-phase-summary.md with baseline date
  → Program G: DONE — unblock Programs A–F
```

**Verification checklist (run before marking Program G complete):**

- [ ] `node scripts/seo/baseline.mjs --dry-run` prints valid JSON (smoke test without live credentials)
- [ ] `node scripts/seo/content-audit.mjs` exits 0 and post count in output matches `ls content/blog/*.mdx | wc -l`
- [ ] `data/seo/keyword-map.ts` imported in a scratch RSC renders without TS error
- [ ] `docs/baselines/<date>.json` CWV section has entries for `/`, `/blog`, `/work`, `/services`, `/pricing`
- [ ] Revenue model shows a concrete traffic gap number (not a placeholder)
- [ ] ICP doc is linked from `docs/AGENCY_OPERATIONS.md` or the weekly SOP comment in `docs/ACQUISITION_MASTER_PLAN.txt` §14

**Quarterly refresh (after launch):**

1. Re-run `node scripts/seo/baseline.mjs` — new dated file in `docs/baselines/`
2. Diff against previous: impressions, clicks, CWV, referring domains
3. Re-run `node scripts/seo/content-audit.mjs` — updated inventory
4. Update `data/seo/keyword-map.ts` with refreshed GSC data (`--write-gsc-snapshots` flag)
5. Re-score revenue model against new actuals
