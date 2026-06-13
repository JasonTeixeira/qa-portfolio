# Engineering Spec — Program B: Content Engine & Blog

**Status:** Draft
**Depends on:** Program G keyword map (`docs/` — not yet produced), Program A schema (`app/sitemap.ts` + JSON-LD in `app/blog/[slug]/page.tsx`)
**Stack:** Next.js 16 / MDX (via `next-mdx-remote`) / Tailwind 4 / Shiki / Zod / Playwright + axe-playwright
**Author:** Jason Teixeira — Sage Ideas LLC
**Dated:** 2026-06-13

---

## 1. Objective & 99+ Bar

The content engine must make a first-time visitor — technical founder, eng lead — decide within one article that Jason Teixeira is the person they want to work with. It must compound: every post earns search traffic, drives a newsletter subscriber, and links back to a money page. No decorative gimmicks. No theatre.

**99+ bar per category:**

| Category | Current | Target | What closes the gap |
|---|---|---|---|
| SEO Content | ~72 | 99 | Cluster architecture, per-post OG + BlogPosting schema complete, hub pages with `generateStaticParams` |
| Content Engine | ~60 | 99 | Cadence SOP, frontmatter schema + validator, templates, repurposing checklist |
| Design / UX | ~75 | 99 | Article shell with intentional typography scale, TOC, prev/next; MDX components that look designed |
| Lead Engagement | ~65 | 99 | In-content newsletter capture at the right moment (mid-article split, already wired in `ArticleBody`), hub-level magnets |
| Accessibility | ~80 | 99 | axe-clean on article + MDX components; keyboard-navigable TOC; reduced-motion safe |

The blog currently renders via `marked` → HTML string → `dangerouslySetInnerHTML` (see `lib/blogMarkdown.ts` and `components/blog/article-body.tsx`). The article shell (`app/blog/[slug]/page.tsx`) already has ReadingProgress, ShareRow, RelatedPosts, and AuthorByline. **Program B does not rip this out** — it extends and upgrades it.

---

## 2. Deliverables

### D1 — Editorial Article Shell

**What:** Upgrade the article page to a best-in-class reading experience. Adds a sticky floating Table of Contents (desktop sidebar, mobile drawer), prev/next post navigation, series pill, cluster breadcrumb, and a tighter typographic shell. TOC is generated from the MDX/HTML H2/H3 headings at render time on the server.

**Files (exact paths):**
- `app/blog/[slug]/page.tsx` — modify (add TOC data extraction, series/cluster props, prev/next)
- `components/blog/article-shell.tsx` — **new**; receives all article metadata + TOC nodes + children, owns the two-column desktop layout
- `components/blog/toc.tsx` — **new**; client component; sticky sidebar TOC with IntersectionObserver-driven active-heading highlight
- `components/blog/prev-next-nav.tsx` — **new**; prev/next links using date-sorted post list
- `components/blog/series-pill.tsx` — **new**; small indicator pill if `series` frontmatter is set
- `components/blog/share-row.tsx` — already exists; extend with "copy link" copy-to-clipboard state (no new dep needed — `navigator.clipboard`)

**Interface / contract:**

```typescript
// components/blog/article-shell.tsx
export interface ArticleShellProps {
  title: string
  description: string
  category: string
  cluster: string         // maps to a ClusterKey in data/content/clusters.ts
  series?: string
  seriesIndex?: number
  datePublished: string
  dateUpdated?: string
  readTime: string
  tags: string[]
  author: AuthorMeta       // { name, href, avatarSrc }
  coverImage?: string
  postUrl: string
  toc: TocNode[]           // { id: string; text: string; level: 2 | 3 }[]
  prev?: { slug: string; title: string }
  next?: { slug: string; title: string }
  children: React.ReactNode
}
```

```typescript
// components/blog/toc.tsx  (client)
export interface TocNode { id: string; text: string; level: 2 | 3 }
export function Toc({ nodes }: { nodes: TocNode[] }): JSX.Element
```

**TOC extraction:** Parse rendered HTML on the server in `app/blog/[slug]/page.tsx` using a lightweight regex over `<h2` / `<h3` tags already produced by `renderMarkdownToHtml`. Inject `id` attributes into the heading HTML so anchor links work. No client-side DOM walk needed.

**Layout spec:** On `lg:` screens, a `grid grid-cols-[1fr_minmax(0,680px)_240px]` layout — left gutter empty, center article, right TOC sidebar sticky to viewport. On mobile, TOC is a `<details>` / `<summary>` progressive-disclosure block above the article body. TOC sidebar becomes sticky via `position: sticky; top: 5.5rem` inside a `lg:block hidden` wrapper.

**Acceptance criteria:**
- A flagship post rendered through ArticleShell passes the design-quality checklist: clear hierarchy by scale contrast, intentional rhythm, depth via the `--sage-surface-raised` surface behind the article, designed hover/focus/active states on TOC items.
- TOC active-heading highlight updates as user scrolls using `IntersectionObserver` — no scroll event listener.
- Prev/next links are visible at article bottom and use the ordered `getAllBlogPosts()` result.
- Reading progress bar (`components/blog/reading-progress.tsx`) still tracks `#article-body`.
- Series pill renders only when `series` is present in frontmatter.
- All interactive elements (TOC links, share button, copy-link) pass keyboard navigation.
- `<h2>` and `<h3>` heading elements in the rendered article have `id` attributes matching TOC `TocNode.id` values.

**Tests:**
- `tests/visual/article-shell.spec.ts` — Playwright screenshot at 1440, 768, 375 on the "Building a Fintech Platform Solo" post (slugs stable).
- `tests/unit/toc-extraction.test.ts` — unit test: given HTML with mixed H2/H3, returns correct `TocNode[]` array and injected `id` attributes.
- `tests/e2e/article-a11y.spec.ts` — `@axe-core/playwright` run on `/blog/building-a-fintech-platform-solo-185-tables-69-apis-7-systems`; expect 0 critical/serious violations.

---

### D2 — MDX Component Library

**What:** A `components/mdx/` directory with typed, keyboard-accessible, institutionally-styled components surfaced via a central MDX components map. These replace `dangerouslySetInnerHTML` rendering for any new posts that opt into MDX component rendering via `next-mdx-remote` (already in `package.json`). Existing posts rendered through `renderMarkdownToHtml` continue working — this is additive.

**The architecture decision:** `next-mdx-remote` is already installed. New posts can use a thin `compileMdx` path in `lib/blog-server.ts` when they include a `useMdx: true` front-matter flag (or auto-detect by checking for JSX-like syntax). Existing posts fall back to the current `renderMarkdownToHtml` path, zero breakage.

**Files (exact paths):**
- `components/mdx/index.ts` — exports the `MDX_COMPONENTS` map consumed by `next-mdx-remote`'s `MDXRemote`
- `components/mdx/code.tsx` — code block with syntax highlight (reuses Shiki already in `lib/blogMarkdown.ts`), copy-to-clipboard button, optional filename label, language badge
- `components/mdx/callout.tsx` — four variants: `info`, `warn`, `danger`, `tip`; icon + colored left-border; uses `--sage-brand`, `--sage-coral`, `--sage-lime` tokens from `app/globals.css`
- `components/mdx/diagram.tsx` — wrapper for architecture diagrams: accepts a `src` (SVG file path under `/public/diagrams/`) or children; renders with `<figure>` + `<figcaption>`; zoom-on-click with native `<dialog>`
- `components/mdx/comparison-table.tsx` — semantic `<table>` with `<thead>`, `<tbody>`, horizontally scrollable on mobile; supports a `highlight` column prop; styled with `--sage-border` tokens
- `components/mdx/figure.tsx` — `<figure>` wrapper for images: `next/image` with explicit dims, caption, optional credit
- `components/mdx/embed.tsx` — `InteractiveWidget` slot: accepts a React component via a named import in the MDX file; enforced client boundary; `Suspense` + skeleton fallback; renders only when JS is available (no SSR shell leakage on complex widgets)
- `lib/mdx-components.ts` — re-exports `MDX_COMPONENTS` for reuse in `app/blog/[slug]/page.tsx` and topic hub pages

**Interface / contract:**

```typescript
// components/mdx/callout.tsx
export type CalloutVariant = 'info' | 'warn' | 'danger' | 'tip'
export interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

// components/mdx/code.tsx
export interface CodeBlockProps {
  children: string
  className?: string    // "language-ts" etc from MDX transform
  filename?: string
  highlight?: string    // "1,3-5" line range highlight
}

// components/mdx/diagram.tsx
export interface DiagramProps {
  src?: string          // /public/diagrams/foo.svg
  alt: string
  caption?: string
  children?: React.ReactNode
}

// components/mdx/comparison-table.tsx
export interface ComparisonTableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  highlightCol?: number
}

// components/mdx/embed.tsx  (client)
export interface EmbedProps {
  component: React.ComponentType
  height?: number
  label?: string        // accessible label for the iframe-equivalent region
}
```

**Viz standard enforcement:** The `embed.tsx` / `InteractiveWidget` slot is the only surface that may show dynamic data. It must render genuinely functional output — no placeholder animations, no decorative motion. Any chart inside must follow the `DATA_VIZ_STANDARD.md` rule: institutional, PhD-quant-level only. The `diagram.tsx` component renders static SVG only; never auto-animated.

**Acceptance criteria:**
- `MDX_COMPONENTS` map is the single source for all custom elements; it is imported in `app/blog/[slug]/page.tsx` and topic hub pages.
- Code blocks show a "Copy" button; clicking it writes to clipboard and toggles to "Copied ✓" for 2 s.
- Callouts render with appropriate icon from `lucide-react` (`Info`, `AlertTriangle`, `XCircle`, `Lightbulb`) and correct left-border color from `--sage-*` tokens.
- Diagram: clicking the image opens a native `<dialog>` with the full-size SVG and a close button.
- Comparison table: on viewports < 640 px, the `<table>` is wrapped in a horizontally-scrollable div; no horizontal overflow on the page.
- All components: keyboard accessible, WCAG AA contrast, `prefers-reduced-motion` respected (copy-button transition is instant under reduced motion).
- Zero new `dangerouslySetInnerHTML` usages in this deliverable — all MDX component children are typed.

**Tests:**
- `tests/unit/mdx-components.test.ts` — render each component with `@testing-library/react` (via jsdom, already in `devDependencies`): smoke tests for output, aria roles, copy-button state machine.
- `tests/e2e/article-a11y.spec.ts` — include a test post that exercises all MDX components; axe-playwright scan.
- `tests/visual/mdx-components.spec.ts` — Playwright screenshot of a test MDX page rendering Code, Callout (all 4 variants), Diagram (SVG stub), ComparisonTable, Figure.

---

### D3 — Frontmatter Schema (Zod) + Validator Extension

**What:** A single Zod schema that is the authoritative definition of a blog post's frontmatter. Used by `lib/blog-server.ts` (runtime parse) and by a new section in `scripts/validate-content.mjs` (CI check). Prevents posts from shipping with missing `cluster`, `keywords`, or broken `canonical`.

**Files (exact paths):**
- `lib/blog-schema.ts` — **new**; exports `PostFrontmatterSchema` (Zod) and `PostFrontmatter` type
- `lib/blog-server.ts` — modify `parseMdxFile` to call `PostFrontmatterSchema.safeParse(data)` and surface parse errors as warnings (non-fatal in dev, logged; fatal in CI via env flag)
- `scripts/validate-content.mjs` — extend with a new section that reads all `content/blog/*.mdx`, parses frontmatter with `gray-matter`, validates against `PostFrontmatterSchema`, and fails with a list of violations

**Schema contract:**

```typescript
// lib/blog-schema.ts
import { z } from 'zod'

export const ClusterKeys = [
  'testing-qa',
  'ai-engineering',
  'fintech-trading',
  'cloud-infra',
  'solo-studio',
] as const
export type ClusterKey = (typeof ClusterKeys)[number]

export const PostFrontmatterSchema = z.object({
  // Required
  title:          z.string().min(10).max(120),
  description:    z.string().min(50).max(160),
  slug:           z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), // inferred from filename if absent
  datePublished:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),   // ISO date
  category:       z.string().min(2),
  cluster:        z.enum(ClusterKeys),
  keywords:       z.array(z.string()).min(1).max(10),
  tags:           z.array(z.string()).min(1).max(8),

  // Optional
  dateUpdated:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  coverImage:     z.string().startsWith('/').optional(),
  canonical:      z.string().url().optional(),
  author:         z.string().default('Jason Teixeira'),
  series:         z.string().optional(),
  seriesIndex:    z.number().int().positive().optional(),
  readTime:       z.string().regex(/^\d+ min read$/).optional(),  // computed if absent
  id:             z.number().int().nonneg().optional(),           // legacy compat
  excerpt:        z.string().min(80).max(300).optional(),         // falls back to description
  useMdx:         z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>
```

**`lib/blog-server.ts` change:** `parseMdxFile` currently casts `data` fields directly. Replace with:
```typescript
const parsed = PostFrontmatterSchema.safeParse(data)
if (!parsed.success && process.env.CI) {
  throw new Error(`Invalid frontmatter in ${filename}: ${parsed.error.message}`)
}
const fm = parsed.data ?? fallbackFromRawData(data)
```

**`scripts/validate-content.mjs` extension:** New `validateBlogFrontmatter()` async function added after the existing `main()` sections. Reads all `.mdx` files in `content/blog/`, parses with `gray-matter` (already used in `lib/blog-server.ts`; use the ESM build), validates each against the Zod schema (import the compiled JS or inline the schema as plain JS — keep the script Node-only per existing comment). Reports file + field path per failure. Exits non-zero if any required field missing or invalid.

**Required frontmatter additions to existing posts (migration task — not automated, [YOU]):**
- Add `cluster:` to each of the ~40 existing posts using the `ClusterKeys` enum.
- Add `keywords:` array (1–10 terms mapped from the Program G keyword map).
- Add `description:` if missing (currently only `excerpt` is used).

**Acceptance criteria:**
- `node scripts/validate-content.mjs` exits 0 when all posts are valid.
- `node scripts/validate-content.mjs` exits non-zero and names the file + field when any required field is missing.
- `lib/blog-server.ts` type of the return from `parseMdxFile` is now `PostFrontmatter & { content: string; fullContent: string }` — no `any` casts.
- The existing `BlogPost` interface in `lib/blogData.ts` is updated to extend from `PostFrontmatter` (or aliased) so both data sources share the same type.

**Tests:**
- `tests/unit/blog-schema.test.ts` — Zod schema: valid fixture passes, each required field missing individually triggers the expected `ZodError` path.
- `tests/unit/validate-content.test.ts` — spawn `scripts/validate-content.mjs` as a child process against a temp MDX fixture directory; assert exit code 1 when `cluster` is missing.

---

### D4 — Topic Hub / Pillar Pages

**What:** Five cluster pillar pages at `/topics/[hub]/` that list all posts in the cluster, link back to each, carry `CollectionPage` JSON-LD schema, and generate static HTML at build time. Each hub page has a short intro, a list of posts (sorted by date), a "gaps" section noting topics not yet covered (placeholder text for now), and internal links to the most relevant money pages.

**Files (exact paths):**
- `app/topics/[hub]/page.tsx` — **new**; async RSC; `generateStaticParams` from `ClusterKeys`; `generateMetadata`; renders hub layout
- `app/topics/page.tsx` — **new**; index listing all 5 hubs
- `data/content/clusters.ts` — **new**; maps each `ClusterKey` to hub metadata + the list of post slugs in the cluster

**`data/content/clusters.ts` contract:**

```typescript
// data/content/clusters.ts
import type { ClusterKey } from '@/lib/blog-schema'

export interface HubMeta {
  key: ClusterKey
  slug: string           // URL segment: "testing-qa", etc.
  title: string          // "Testing & QA Mastery"
  headline: string       // H1 variant: "How I actually test production systems"
  description: string    // meta description (140–160 chars)
  keywords: string[]
  moneyPageLink: { href: string; label: string }  // internal link to a money page
  postSlugs: string[]    // ordered by strategic importance, not date
}

export const CLUSTERS: Record<ClusterKey, HubMeta> = {
  'testing-qa': {
    key: 'testing-qa',
    slug: 'testing-qa',
    title: 'Testing & QA',
    headline: 'Production testing without the cargo cult.',
    description: 'How I build test strategies for real systems — flaky test elimination, API frameworks, mobile automation, E2E that doesn't lie.',
    keywords: ['api testing framework', 'flaky test elimination', 'playwright e2e', 'mobile test automation'],
    moneyPageLink: { href: '/services/testing', label: 'Hire me for QA strategy' },
    postSlugs: [
      'building-a-production-ready-api-testing-framework',
      'eliminating-flaky-tests-a-systematic-approach',
      'mobile-test-automation-with-appium-the-complete-guide',
      'page-object-model-beyond-the-basics',
      'performance-testing-from-zero-to-production',
      'owasp-top-10-automated-testing-a-practical-implementation',
      'test-strategy-for-startups-what-to-test-when-you-can',
      'building-a-production-ready-api-testing-framework',
    ],
  },
  'ai-engineering': {
    key: 'ai-engineering',
    slug: 'ai-engineering',
    title: 'AI Engineering',
    headline: 'AI systems that run in production, not demos.',
    description: 'Discord bots, RAG pipelines, voice agents — built with receipts, not hype.',
    keywords: ['ai discord bot', 'llm production', 'rag pipeline', 'ai engineering'],
    moneyPageLink: { href: '/capabilities', label: 'AI engineering services' },
    postSlugs: [
      'building-an-ai-discord-bot-for-a-trading-community',
    ],
  },
  'fintech-trading': {
    key: 'fintech-trading',
    slug: 'fintech-trading',
    title: 'Fintech & Trading Systems',
    headline: 'Building fintech solo, at production scale.',
    description: 'The full story of building Nexural — 185 tables, Stripe, real-time data, backtesting, and what almost broke.',
    keywords: ['fintech platform solo', 'stripe integration', 'backtesting engine', 'trading systems'],
    moneyPageLink: { href: '/work', label: 'See the Nexural case study' },
    postSlugs: [
      'building-a-fintech-platform-solo-185-tables-69-apis-7-systems',
      'designing-a-185-table-database-schema-lessons-from-building-nexural',
      'supabase-in-production-what-i-wish-i-knew-before-185-tables',
      'building-a-backtesting-engine-that-doesn',
      'stripe-integration-lessons-what-the-docs-don',
      'real-time-websocket-architecture-patterns-that-actually-scale',
      'portfolio-risk-math-explained-var-cvar-and-why-covariance-estimation-matters',
      'feature-engineering-for-trading-200-indicators-that-actually-matter',
    ],
  },
  'cloud-infra': {
    key: 'cloud-infra',
    slug: 'cloud-infra',
    title: 'Cloud & Infra',
    headline: 'Production cloud without waste or lock-in.',
    description: 'AWS cost control, OIDC-based CI/CD, Terraform modules, Docker in pipelines — from a solo operator who runs it all.',
    keywords: ['aws cost optimization', 'github oidc aws', 'terraform modules', 'docker ci cd'],
    moneyPageLink: { href: '/services', label: 'Cloud & infra consulting' },
    postSlugs: [
      'github-oidc-aws-no-long-lived-keys-cloud-automation-the-right-way',
      'aws-cost-optimization-how-i-keep-a-production-platform-under-50-month',
      'terraform-module-patterns-how-i-structure-iac-for-reuse',
      'docker-in-ci-cd-the-patterns-that-cut-my-pipeline-time-by-82',
      'fixing-docker-compose-connection-errors-in-ci-cd',
      'monitoring-that-actually-tells-you-something',
      'environment-variables-the-security-hole-in-every-startup',
      'rate-limiting-the-feature-nobody-thinks-about-until-it',
    ],
  },
  'solo-studio': {
    key: 'solo-studio',
    slug: 'solo-studio',
    title: 'Running a Solo Studio',
    headline: 'One person, agency-quality output.',
    description: 'Code review, git workflow, LLC setup, career lessons — how a solo engineer ships at a level most teams don\'t.',
    keywords: ['solo engineering studio', 'running llc engineer', 'code review solo', 'git workflow'],
    moneyPageLink: { href: '/founder', label: 'About Jason Teixeira' },
    postSlugs: [
      'running-an-llc-as-an-engineer-what-nobody-tells-you',
      'i-read-50-senior-engineer-job-descriptions-here',
      'how-to-review-your-own-code-when-there',
      'the-myth-of-the-10x-developer',
      'building-for-the-next-engineer-code-that-outlasts-you',
      'the-case-against-over-engineering-from-someone-who',
      'the-automation-mindset-if-you-do-it-twice-script-it',
      'git-workflows-that-don',
      'the-architecture-decision-nobody-writes-down',
    ],
  },
}
```

**`app/topics/[hub]/page.tsx` contract:**

```typescript
export async function generateStaticParams() {
  return Object.values(CLUSTERS).map((c) => ({ hub: c.slug }))
}

export async function generateMetadata({ params }): Promise<Metadata> { /* uses hub.description */ }

export default async function HubPage({ params }) {
  const hub = Object.values(CLUSTERS).find((c) => c.slug === params.hub)
  if (!hub) notFound()
  const posts = hub.postSlugs
    .map((s) => getBlogPostBySlug(s))
    .filter(Boolean)
  // Renders: hub headline, description, post list, gaps placeholder, money page CTA
  // JSON-LD: CollectionPage with hasPart[] BlogPosting stubs
}
```

**Internal linking requirement:** Each hub page links to the money page specified in `HubMeta.moneyPageLink`. Each blog post article shell must display its cluster as a breadcrumb link (`/topics/[cluster-slug]`) above the category label.

**Acceptance criteria:**
- `generateStaticParams` returns exactly 5 entries; all 5 `/topics/[hub]` pages build without error.
- Each hub page carries valid `CollectionPage` JSON-LD (validate with Google Rich Results Test URL pattern).
- No post is orphaned: every post in `content/blog/` has a `cluster` frontmatter value that maps to an entry in `CLUSTERS`.
- Hub breadcrumb link on article pages produces a `BreadcrumbList` JSON-LD trail: Home → Blog → [Hub] → [Post].
- `/topics` index page lists all 5 hubs with counts.

**Tests:**
- `tests/unit/clusters.test.ts` — every slug in `CLUSTERS[key].postSlugs` resolves via `getBlogPostBySlug`; no duplicate slugs across clusters.
- `tests/visual/topics.spec.ts` — Playwright screenshot of `/topics/testing-qa` at 1440, 768.
- `tests/e2e/article-a11y.spec.ts` — extend axe run to include `/topics/testing-qa`.

---

### D5 — Content Cadence System

**What:** Post templates, a content calendar stub, and a "1 post → N assets" repurposing checklist. These are static documents — no code. They exist at `docs/content/` and serve as the SOP referenced in `ACQUISITION_MASTER_PLAN.txt §14`.

**Files (exact paths):**
- `docs/content/templates/teardown.md` — **new**; template for "how I built X" teardown posts
- `docs/content/templates/how-i-built.md` — **new**; template for build-log posts
- `docs/content/templates/comparison.md` — **new**; template for honest comparison posts (maps to Program A compare pages)
- `docs/content/templates/deep-dive.md` — **new**; template for deep technical reference posts
- `docs/content/templates/lessons.md` — **new**; template for lessons-learned / retrospective posts
- `docs/content/calendar.md` — **new**; rolling backlog with columns: Topic | Cluster | Keyword | Intent | Status | Draft Due | Publish Date
- `docs/content/repurposing-checklist.md` — **new**; "1 post → N assets" SOP

**Template structure (all templates follow this shape):**

```markdown
# [Template Name] Template

## Purpose
[One sentence on when to use this template.]

## Frontmatter block
\`\`\`yaml
---
title: ""
description: ""   # 50–160 chars, matches search intent
cluster: ""       # one of: testing-qa | ai-engineering | fintech-trading | cloud-infra | solo-studio
keywords: []
tags: []
datePublished: ""
coverImage: ""
author: "Jason Teixeira"
---
\`\`\`

## Structure
[H2 headings specific to the template type]

## Per-Post Checklist (from ACQUISITION_MASTER_PLAN §14)
- [ ] Mapped to a keyword + cluster
- [ ] Unique title + meta + H1; one clear search intent
- [ ] BlogPosting schema generated (automatic from D1 changes)
- [ ] ≥2 internal links in, ≥2 out (money page + related post)
- [ ] One in-content lead magnet / CTA
- [ ] Honest, specific, first-hand only — no filler, no fabricated claims
- [ ] Repurposed to ≥1 off-site channel (see repurposing-checklist.md)
```

**Repurposing checklist (`docs/content/repurposing-checklist.md`):**
Documents the "1 post → N assets" pipeline from `ACQUISITION_MASTER_PLAN §F2`:
1. LinkedIn post (opening hook + 3 key insights + CTA link)
2. LinkedIn thread (expand one section to 5-tweet-style thread)
3. Newsletter blurb (2–3 sentences, link to full post, used in the Program E nurture sequence)
4. Optional: short video script (teardown format, sub-5 min)
5. Optional: dev.to / Medium cross-post with `rel=canonical` pointing to `sageideas.dev`

**Content calendar (`docs/content/calendar.md`):**
A markdown table pre-seeded with the gaps identified from the 5 clusters. For each cluster, 2–3 gap topics are listed as "Draft" status. These are the topics NOT yet covered by the ~40 existing posts.

**Acceptance criteria:**
- All 5 templates exist and follow the structure above.
- Templates include the per-post checklist verbatim (enables copy-paste workflow).
- `calendar.md` has at least 10 pre-seeded backlog items with assigned cluster and target keyword.
- `repurposing-checklist.md` documents the full "1 post → N assets" sequence.

**Tests:** None required for static documents. Verify files exist in CI:
```bash
# Add to validate-content.mjs or a Makefile target
test -f docs/content/templates/teardown.md && echo "OK"
```

---

### D6 — In-Content Newsletter Capture + Nurture Hook

**What:** The in-content newsletter CTA is already implemented (`components/blog/inline-newsletter-cta.tsx`) and wired via `ArticleBody`. This deliverable upgrades it and adds the nurture hook to Program E.

**What needs to change:**

1. **`components/blog/inline-newsletter-cta.tsx`:** Currently calls `/api/newsletter/subscribe` (note: the route is inconsistent — `newsletter-signup.tsx` calls `/api/lab/newsletter`). Standardize both to `/api/newsletter/subscribe`. Add a `source` prop that is set to `blog-inline-[slug]` so that subscriber source is tracked per post. Pass `cluster` as metadata to Resend/Supabase so the nurture sequence can be cluster-aware.

2. **`components/blog/article-shell.tsx` (D1):** Pass `cluster` and `slug` down to `ArticleBody` → `InlineNewsletterCTA` so source tagging is automatic.

3. **Nurture hook document (`docs/content/nurture-sequence.md`) — new:** Documents the Program E S3 nurture sequence (hook only — implementation is Program E). Specifies:
   - Welcome email: triggered on subscribe, sent by existing Resend integration (`lib/welcomeEmail.ts`)
   - Digest cadence: weekly "what I shipped / learned" (Program E builds this; this spec defines the hook)
   - Cluster-aware: a subscriber who came from `testing-qa` cluster gets a welcome that references testing content
   - Subscriber → lead scoring: tracked in Supabase `subscribers` table via `source` field; surfaced in `/admin` leads inbox (Program E)

**Files (exact paths):**
- `components/blog/inline-newsletter-cta.tsx` — modify: standardize API route, add `source` + `cluster` props
- `components/blog/article-shell.tsx` (D1) — pass `cluster` and `slug` to `InlineNewsletterCTA` via `ArticleBody`
- `components/blog/article-body.tsx` — modify: accept `cluster` and `slug` props, pass to `InlineNewsletterCTA`
- `docs/content/nurture-sequence.md` — **new**; nurture hook document (spec for Program E)

**API route standardization:**
- `app/api/newsletter/subscribe/route.ts` — verify it exists and accepts `{ email, source, cluster? }`. The `source` field already exists in `newsletter-signup.tsx` usage; add `cluster` to the request body and store in the Supabase `subscribers` table (or `leads` table metadata — wherever current schema puts it).
- If `/api/newsletter/subscribe` doesn't exist and only `/api/lab/newsletter` does, create a thin redirect or alias route.

**Acceptance criteria:**
- Both `newsletter-signup.tsx` and `inline-newsletter-cta.tsx` call the same route (`/api/newsletter/subscribe`).
- Subscriptions from blog articles include `source: "blog-inline-[slug]"` and `cluster: "[cluster-key]"` in the stored record.
- The in-content CTA placement is mid-article (between H2 sections via the existing `ArticleBody` split logic) — no change to placement, only to props.
- `docs/content/nurture-sequence.md` documents the intended 3-email welcome sequence structure for Program E to implement.

**Tests:**
- `tests/unit/newsletter-cta.test.ts` — render `InlineNewsletterCTA` with `source="blog-inline-test-post"` and `cluster="testing-qa"`; intercept the fetch call and assert correct payload shape.

---

### D7 — RSS Polish

**What:** Upgrade `app/feed.xml/route.ts` to include `cluster`, `keywords`, `dateUpdated`, and `content:encoded` (full post excerpt). Add an Atom feed at `app/feed.atom/route.ts`. Ensure feed appears in `<head>` auto-discovery links.

**Files (exact paths):**
- `app/feed.xml/route.ts` — modify: add `content:encoded`, `category` per tag (not just post category), `cluster` as a custom namespace element
- `app/feed.atom/route.ts` — **new**; Atom 1.0 feed
- `app/layout.tsx` — add `<link rel="alternate" type="application/rss+xml" href="/feed.xml" />` and `<link rel="alternate" type="application/atom+xml" href="/feed.atom" />` to the `<head>` metadata

**Acceptance criteria:**
- `/feed.xml` validates with W3C Feed Validator.
- `/feed.atom` validates with W3C Feed Validator.
- Both feeds appear in browser auto-discovery on `/blog`.
- `content:encoded` contains the full `excerpt` (not truncated at 200 chars as `content` is).

**Tests:**
- `tests/unit/rss.test.ts` — fetch `/feed.xml` in a test environment; assert valid XML; assert all posts appear; assert `<content:encoded>` is present.

---

## 3. Data Model / Schema

### Frontmatter Schema (canonical — from D3)

```
title           string   required   10–120 chars
description     string   required   50–160 chars (meta description)
slug            string   optional   inferred from filename
datePublished   string   required   YYYY-MM-DD
dateUpdated     string   optional   YYYY-MM-DD
category        string   required   matches one of the ALL_CATEGORIES list in blog-content.tsx
cluster         enum     required   'testing-qa' | 'ai-engineering' | 'fintech-trading' | 'cloud-infra' | 'solo-studio'
keywords        string[] required   1–10 terms (from Program G keyword map)
tags            string[] required   1–8 display tags
coverImage      string   optional   /blog/covers/[slug].png
canonical       url      optional   defaults to https://www.sageideas.dev/blog/[slug]
author          string   default    "Jason Teixeira"
series          string   optional   series display name
seriesIndex     int      optional   position in series (1-based)
readTime        string   optional   "N min read" — computed by lib/blog-server.ts if absent
id              int      optional   legacy compat with blogData.ts
excerpt         string   optional   80–300 chars — falls back to description
useMdx          bool     default    false — enables next-mdx-remote render path
```

### Cluster Taxonomy

5 clusters, defined in `data/content/clusters.ts` (see D4). Each cluster maps to:
- A `ClusterKey` (enum literal)
- A URL slug (`/topics/[slug]`)
- A set of post slugs
- A money-page internal link target

### TOC Node

```typescript
interface TocNode {
  id: string    // kebab-cased heading text, e.g. "api-architecture"
  text: string  // raw heading text
  level: 2 | 3
}
```

### Supabase subscribers table (extension — verify schema matches)

Confirm `source` column exists in the `subscribers` or `newsletter_subscribers` table; add `cluster` column (varchar, nullable) if missing. This is a migration task to be applied via `supabase/schema_part2_seed.sql` or a new migration file.

---

## 4. Integration Points (reuse real files)

| Reused file | How D-deliverable uses it |
|---|---|
| `lib/blog-server.ts` | D3 adds `PostFrontmatterSchema.safeParse` in `parseMdxFile`; D1 reads `getAllBlogPosts()` for prev/next |
| `lib/blogMarkdown.ts` (Shiki) | D2 `code.tsx` imports `codeToHtml` with same `SHIKI_THEME` constant |
| `lib/motion/presets.ts` | D1 `article-shell.tsx` uses `slideUp` for article entrance; `EASE_OUT_EXPO` for TOC transitions |
| `components/blog/reading-progress.tsx` | Unchanged; continues to track `#article-body` which lives inside D1's `ArticleShell` |
| `components/blog/inline-newsletter-cta.tsx` | D6 modifies props and API route |
| `components/blog/article-body.tsx` | D6 adds `cluster` + `slug` props |
| `components/blog/related-posts.tsx` | Unchanged; rendered inside D1's `ArticleShell` |
| `components/blog/author-byline.tsx` | Unchanged; rendered inside D1's `ArticleShell` |
| `components/blog/share-row.tsx` | D1 extends with copy-to-clipboard state |
| `app/blog/[slug]/page.tsx` | D1 modifies to extract TOC, pass prev/next, add cluster breadcrumb JSON-LD |
| `app/feed.xml/route.ts` | D7 modifies |
| `app/globals.css` | All MDX components use `--sage-*` tokens; no new tokens needed |
| `scripts/validate-content.mjs` | D3 extends |
| `next-mdx-remote` (package) | D2 uses for MDX component rendering path |
| `@axe-core/playwright` (devDep) | D1, D2 tests |
| `zod` (package) | D3 uses |
| `gray-matter` (package) | D3 validator uses in `scripts/validate-content.mjs` |

---

## 5. Definition of Done

- [ ] D1: `article-shell.tsx` renders on a flagship post (see test post below); TOC visible desktop; TOC hidden mobile (uses `<details>`); prev/next links functional; series pill renders; cluster breadcrumb links to `/topics/[hub]`.
- [ ] D2: All 6 MDX components exist in `components/mdx/`; `MDX_COMPONENTS` map exported from `lib/mdx-components.ts`; copy button works; callout colors match `--sage-*` tokens; diagram dialog opens/closes with keyboard.
- [ ] D3: `PostFrontmatterSchema` exported from `lib/blog-schema.ts`; `lib/blog-server.ts` calls it; `scripts/validate-content.mjs` extended; all ~40 existing posts pass validation (requires [YOU] migration for `cluster` + `keywords` fields).
- [ ] D4: 5 hub pages build statically; `CLUSTERS` map in `data/content/clusters.ts`; no orphaned posts; `CollectionPage` JSON-LD on each hub.
- [ ] D5: 5 templates + calendar + repurposing checklist exist at `docs/content/`.
- [ ] D6: Both newsletter components use `/api/newsletter/subscribe`; source tagging includes slug + cluster; `docs/content/nurture-sequence.md` written.
- [ ] D7: `/feed.xml` and `/feed.atom` validate; both appear in `<head>` auto-discovery.
- [ ] All tests listed in D1–D4, D6–D7 pass (or are green in CI).
- [ ] `pnpm build` exits 0.
- [ ] axe-playwright on `/blog/building-a-fintech-platform-solo-185-tables-69-apis-7-systems` reports 0 critical/serious violations.
- [ ] BlogPosting JSON-LD on a post validates in Google Rich Results Test.
- [ ] CollectionPage JSON-LD on `/topics/testing-qa` validates in Google Rich Results Test.
- [ ] Lighthouse CI: LCP < 2.5 s, CLS < 0.1, TBT < 200 ms on the article page template.

---

## 6. [YOU] Prerequisites

These are human/owner actions that cannot be automated:

- **[YOU] Add `cluster` + `keywords` + `description` to all ~40 existing `.mdx` files** in `content/blog/`. The schema validator (`D3`) will tell you exactly which files and fields are missing when you run `node scripts/validate-content.mjs`. Each `cluster` value must be one of the 5 `ClusterKey` values.
- **[YOU] Provide/approve `data/content/clusters.ts` post assignments.** The draft in D4 is an initial mapping. You must verify each post slug is assigned to the most accurate cluster. Slugs with typos (e.g., `building-a-backtesting-engine-that-doesn`) must match actual filenames exactly.
- **[YOU] Provide a headshot at `/images/headshot.jpg`** (already used by `AuthorByline` — if missing, D1 will show a broken image; confirm the file exists at `public/images/headshot.jpg`).
- **[YOU] Commission or produce architecture diagram SVGs** for the `diagram.tsx` component to be useful. Suggested: one architecture diagram for the Nexural platform (placed at `/public/diagrams/nexural-architecture.svg`) as a flagship example.
- **[YOU] Approve content calendar backlog** in `docs/content/calendar.md` — the pre-seeded topics are based on the cluster gaps analysis, but keyword intent must be validated against the Program G keyword map before any new posts are drafted.
- **[YOU] Verify Supabase schema** has a `cluster` column (or equivalent metadata column) in the subscribers table before D6 is shipped.
- **[YOU] Supply GA4 ID** (Program D dependency) — required to confirm newsletter subscriber tracking flows through GA4 as well as PostHog.

---

## 7. Rollout & Verification

### Build order (within Program B)

```
D3 (schema) → D4 (clusters data) → D5 (templates, no code) → D1 (article shell) → D2 (MDX components) → D6 (newsletter wiring) → D7 (RSS)
```

D3 first because D1, D2, D4, and D6 all depend on `PostFrontmatterSchema` or `ClusterKey` types. D5 is documentation, unblocked.

### Verification steps

1. **Schema validation:** `node scripts/validate-content.mjs` — expect 0 failures after [YOU] frontmatter migration.
2. **Build:** `pnpm build` — expect 0 errors. `next.config.ts` has `typescript: { ignoreBuildErrors: true }` but Program B code must type-check cleanly; run `pnpm tsc --noEmit` separately.
3. **Hub pages:** Visit `http://localhost:3000/topics/testing-qa` — confirm posts list, money-page link, and breadcrumb.
4. **Article shell:** Visit `http://localhost:3000/blog/building-a-fintech-platform-solo-185-tables-69-apis-7-systems` — confirm TOC visible at 1440, hidden at 375, reading progress bar tracks scroll, prev/next links work, cluster breadcrumb present.
5. **MDX components:** Create a test post at `content/blog/mdx-component-test.mdx` with `useMdx: true` and one instance of each component. Visit `/blog/mdx-component-test`. Confirm Code copy button, Callout variants, Diagram dialog.
6. **RSS:** `curl https://www.sageideas.dev/feed.xml` and validate at [https://validator.w3.org/feed/](https://validator.w3.org/feed/).
7. **Rich Results:** Paste `https://www.sageideas.dev/blog/building-a-fintech-platform-solo-185-tables-69-apis-7-systems` into Google Rich Results Test — expect `BlogPosting` as valid.
8. **Accessibility:** `pnpm exec playwright test tests/e2e/article-a11y.spec.ts` — expect 0 critical/serious axe violations.
9. **Visual regression:** `pnpm exec playwright test tests/visual/article-shell.spec.ts` — approve baseline screenshots.
10. **Lighthouse:** `pnpm lhci autorun` (config already in `lighthouserc.json`) against the article page template.

### Staging gate

Ship D3 + D4 (no user-facing change) first as a single PR. Then D1 + D2 + D5 as a second PR. Then D6 + D7 as a third PR. Each PR must pass `pnpm build` + visual regression + axe before merge.

### Rollback

All changes are additive. D1 wraps the existing article layout in a new shell component; the old `app/blog/[slug]/page.tsx` structure is the fallback if D1 is reverted. D2 is purely additive (new `components/mdx/` directory, no existing file removed). D3 validator changes are non-fatal in dev (only fatal in CI via env flag). D4 adds new routes only.
