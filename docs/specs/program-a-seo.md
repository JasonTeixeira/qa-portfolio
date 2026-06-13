# Engineering Spec — Program A: SEO Discovery Engine

**Status:** Draft  
**Depends on:** Program G keyword map (can begin D1–D4 immediately; D5 programmatic copy awaits keyword map)  
**Stack:** Next.js 16 / Tailwind 4  
**Acceptance owner:** Jason Teixeira  
**Last updated:** 2026-06-13

---

## 1. Objective & 99+ bar

Make every indexable page on sageideas.dev discoverable, richly displayed, and technically correct in Google Search so organic traffic compounds from day one. The site should achieve:

- Lighthouse SEO score: **100** on every template page (/, /work/[slug], /blog/[slug], /services/[slug], /industries/[slug], /compare/[slug])
- Zero coverage errors in Google Search Console
- Rich result eligibility on: sitelinks search box, breadcrumbs, articles, services, FAQ, case studies
- Zero price contradictions between any user-facing page and `data/services/tiers.ts`
- All 51 blog posts + work + service + industry + compare + lab pages present in `sitemap.xml`
- Core Web Vitals green on GSC field data (LCP < 2.5s, INP < 200ms, CLS < 0.1)

---

## 2. Deliverables

### D1. Dynamic sitemap covering every public URL

**What:** Extend `app/sitemap.ts` to include all 51 blog posts (currently missing entirely), all compare pages (currently missing), and wire `lastModified` to real content dates rather than `new Date()` for posts that have a `date` field.

**Files:**
- `app/sitemap.ts` (modify)
- `lib/blog-server.ts` (read `getAllBlogPosts()` — already exports `slug` and `date`)
- `data/compare/comparisons.ts` (already exports `comparisons` array with `slug`)

**Interface/contract:**

```ts
// app/sitemap.ts — after patch
import type { MetadataRoute } from 'next'
import { tiers, careTiers } from '@/data/services/tiers'
import { extendedTiers } from '@/data/services/extended'
import { verticals } from '@/data/industries/verticals'
import { comparisons } from '@/data/compare/comparisons'
import { getAllBlogPosts } from '@/lib/blog-server'

const SITE = 'https://www.sageideas.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllBlogPosts()           // reads content/blog/*.mdx at build time
  const now = new Date()

  return [
    // … existing staticRoutes …

    // NEW: blog posts — 51 entries, lastModified from frontmatter date
    ...posts.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),

    // NEW: compare pages — 3 entries (sage-vs-in-house-hire, sage-vs-big-consultancy, sage-vs-platform)
    ...comparisons.map((c) => ({
      url: `${SITE}/compare/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),

    // EXISTING: tiers, careTiers, extendedTiers, verticals, workSlugs, labSlugs
    // No change to existing entries except removing the hardcoded workSlugs/labSlugs
    // arrays and sourcing them from data (see D5)
  ]
}
```

**Note:** `getAllBlogPosts()` uses `fs.readFileSync` so it is safe to call from `sitemap()` which runs server-side at build time. No RSC boundary issues.

**Acceptance criteria:**
- `curl https://www.sageideas.dev/sitemap.xml | grep -c '<loc>'` returns ≥ 120 entries
- Every slug from `content/blog/*.mdx` appears in sitemap
- Every slug from `data/compare/comparisons.ts` appears in sitemap
- Blog entries carry the post's frontmatter `date` as `lastModified`, not build time

**Tests:**
```ts
// scripts/test-sitemap-count.mjs
import { execSync } from 'child_process'
const xml = execSync('curl -s http://localhost:3000/sitemap.xml').toString()
const count = (xml.match(/<loc>/g) ?? []).length
const blogCount = (xml.match(/\/blog\//g) ?? []).length
const compareCount = (xml.match(/\/compare\//g) ?? []).length
console.assert(count >= 120, `Expected ≥120 entries, got ${count}`)
console.assert(blogCount >= 51, `Expected ≥51 blog entries, got ${blogCount}`)
console.assert(compareCount >= 3, `Expected ≥3 compare entries, got ${compareCount}`)
console.log('Sitemap entry count:', count, '— PASS')
```

---

### D2. Structured-data builder library `lib/seo/jsonld.ts` + `<JsonLd>` server component

**What:** A typed builder library that constructs valid Schema.org JSON-LD objects. The existing `components/json-ld.tsx` (`<JsonLd data={...}/>`) already exists and is fine; this deliverable is the **builder layer** so each page assembles schemas from typed functions rather than inline object literals scattered everywhere. This reduces duplication and makes schema updates a single-file change.

**Files:**
- `lib/seo/jsonld.ts` (create)
- `components/json-ld.tsx` (no change — already correct)

**Interface/contract:**

```ts
// lib/seo/jsonld.ts

const SITE = 'https://www.sageideas.dev'

// ── Base types ────────────────────────────────────────────────────────────────

export type LdObject = Record<string, unknown>

// ── Builders ─────────────────────────────────────────────────────────────────

/** WebSite + SearchAction (sitelinks search box) */
export function buildWebSite(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sage Ideas',
    url: SITE,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/blog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Organization (already in layout — expose typed builder for reuse) */
export function buildOrganization(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sage Ideas',
    legalName: 'Sage Ideas LLC',
    url: SITE,
    logo: `${SITE}/brand/logo.svg`,
    founder: { '@type': 'Person', name: 'Jason Teixeira', url: `${SITE}/founder` },
    foundingDate: '2024',
    email: 'sage@sageideas.dev',
    address: { '@type': 'PostalAddress', addressLocality: 'Orlando', addressRegion: 'FL', addressCountry: 'US' },
    sameAs: ['https://github.com/JasonTeixeira', 'https://linkedin.com/in/jason-teixeira'],
    knowsAbout: ['AI Automation', 'Full-Stack Development', 'Cloud Infrastructure', 'Programmatic SEO'],
  }
}

/** Person — Jason Teixeira entity */
export function buildPerson(): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Jason Teixeira',
    url: `${SITE}/founder`,
    jobTitle: 'Founder',
    worksFor: { '@type': 'Organization', name: 'Sage Ideas LLC', url: SITE },
    sameAs: ['https://github.com/JasonTeixeira', 'https://linkedin.com/in/jason-teixeira'],
    knowsAbout: ['AI Automation', 'Software Engineering', 'Programmatic SEO', 'Fintech Systems'],
    address: { '@type': 'PostalAddress', addressLocality: 'Orlando', addressRegion: 'FL', addressCountry: 'US' },
  }
}

/** BreadcrumbList */
export type BreadcrumbItem = { name: string; url: string }
export function buildBreadcrumbList(items: BreadcrumbItem[]): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/** Article / BlogPosting */
export type ArticleArgs = {
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  url: string
  imageUrl?: string
  keywords?: string[]
  articleSection?: string
}
export function buildArticle(args: ArticleArgs): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: args.headline,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    url: args.url,
    mainEntityOfPage: args.url,
    author: { '@type': 'Person', name: 'Jason Teixeira', url: `${SITE}/founder` },
    publisher: { '@type': 'Organization', name: 'Sage Ideas LLC', url: SITE, logo: `${SITE}/brand/logo.svg` },
    ...(args.imageUrl ? { image: args.imageUrl } : {}),
    ...(args.keywords ? { keywords: args.keywords.join(', ') } : {}),
    ...(args.articleSection ? { articleSection: args.articleSection } : {}),
  }
}

/** CaseStudy (uses CreativeWork — closer to real usage than Article) */
export type CaseStudyArgs = {
  name: string
  description: string
  url: string
  datePublished?: string
  keywords?: string[]
}
export function buildCaseStudy(args: CaseStudyArgs): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: args.name,
    headline: args.name,
    description: args.description,
    url: args.url,
    creator: { '@type': 'Organization', name: 'Sage Ideas LLC', url: SITE },
    ...(args.datePublished ? { datePublished: args.datePublished } : {}),
    ...(args.keywords ? { keywords: args.keywords.join(', ') } : {}),
  }
}

/** Service + Offer */
export type ServiceArgs = {
  name: string
  description: string
  url: string
  serviceType: string
  priceCents: number          // 0 = custom/contact
  cadence: 'one-time' | 'monthly' | 'custom'
}
export function buildService(args: ServiceArgs): LdObject {
  const hasPrice = args.priceCents > 0
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    url: args.url,
    serviceType: args.serviceType,
    provider: { '@type': 'Organization', name: 'Sage Ideas LLC', url: SITE },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      url: args.url,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      ...(hasPrice ? { price: (args.priceCents / 100).toFixed(2) } : {}),
      ...(args.cadence === 'monthly' && hasPrice
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: (args.priceCents / 100).toFixed(2),
              priceCurrency: 'USD',
              unitCode: 'MON',
              billingDuration: 'P1M',
            },
          }
        : {}),
    },
  }
}

/** AggregateOffer — pricing index page (all tiers summarized) */
export type AggregateOfferArgs = {
  url: string
  lowPriceCents: number
  offers: { name: string; priceCents: number; url: string }[]
}
export function buildAggregateOffer(args: AggregateOfferArgs): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Sage Ideas Studio Services',
    description: 'Productized engineering, SEO, content, brand, and fractional CTO engagements.',
    url: args.url,
    brand: { '@type': 'Brand', name: 'Sage Ideas' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: (args.lowPriceCents / 100).toFixed(2),
      offerCount: args.offers.length,
      offers: args.offers.map((o) => ({
        '@type': 'Offer',
        name: o.name,
        price: (o.priceCents / 100).toFixed(2),
        priceCurrency: 'USD',
        url: o.url,
        availability: 'https://schema.org/InStock',
      })),
    },
  }
}

/** FAQPage */
export type FaqItem = { q: string; a: string }
export function buildFaqPage(items: FaqItem[]): LdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}
```

**Wiring per route:**

| Route | Schemas to add/replace |
|---|---|
| `app/layout.tsx` | Replace inline `organizationSchema` + `professionalServiceSchema` with `buildOrganization()` + `buildWebSite()` |
| `app/founder/page.tsx` | Add `buildPerson()` + `buildBreadcrumbList([{Home},{Founder}])` |
| `app/blog/[slug]/page.tsx` | Replace inline `jsonLd` object with `buildArticle(...)` + `buildBreadcrumbList(...)` |
| `app/work/[slug]/page.tsx` | Replace inline `creativeWorkSchema` with `buildCaseStudy(...)` (breadcrumb already present) |
| `app/services/[slug]/page.tsx` | Replace inline `serviceSchema` with `buildService(tier)` (faqSchema already using inline — keep pattern or switch to `buildFaqPage`) |
| `app/pricing/page.tsx` | Add `buildAggregateOffer(...)` from `tiers` data |
| `app/industries/[slug]/page.tsx` | Already has FAQPage — add `buildBreadcrumbList([{Home},{Industries},{v.name}])` |
| `app/compare/[slug]/page.tsx` | Add `buildBreadcrumbList([{Home},{Compare},{name}])` — no existing JSON-LD |

**Acceptance criteria:**
- All schemas from `lib/seo/jsonld.ts` pass Google Rich Results Test with 0 errors
- No `any` types in `lib/seo/jsonld.ts`
- `buildService` uses `tier.priceCents` from `data/services/tiers.ts` (not hardcoded numbers)

**Tests:**
- Manual: paste each schema output into https://search.google.com/test/rich-results
- Unit: `__tests__/lib/seo/jsonld.test.ts` — assert that `buildBreadcrumbList` items have correct `position` values, `buildService` correctly formats `priceCents`, `buildFaqPage` wraps each item

---

### D3. `<Breadcrumbs>` server component — visible UI + BreadcrumbList JSON-LD

**What:** A single RSC that renders the visible breadcrumb trail AND injects the `BreadcrumbList` JSON-LD in the same render. Currently breadcrumbs are ad-hoc inline HTML in `app/blog/[slug]/page.tsx` (lines 91-103) and `app/work/[slug]/page.tsx`. The `app/compare/[slug]/page.tsx` has no breadcrumbs at all. Standardize into one component.

**Files:**
- `components/seo/breadcrumbs.tsx` (create)
- `app/blog/[slug]/page.tsx` (replace inline breadcrumb nav)
- `app/work/[slug]/page.tsx` (replace inline breadcrumb nav)
- `app/compare/[slug]/page.tsx` (add — currently missing)
- `app/industries/[slug]/page.tsx` / `IndustryPageContent` (add)
- `app/services/[slug]/page.tsx` (add)

**Interface/contract:**

```tsx
// components/seo/breadcrumbs.tsx
import Link from 'next/link'
import { buildBreadcrumbList, type BreadcrumbItem } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/json-ld'

type Props = {
  items: BreadcrumbItem[]   // [{ name: 'Home', url: 'https://...' }, { name: 'Blog', url: '...' }, ...]
  className?: string
}

// Server Component — no 'use client'
export function Breadcrumbs({ items, className }: Props) {
  return (
    <>
      <JsonLd data={buildBreadcrumbList(items)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex items-center gap-1.5 text-sm text-[#78716C] flex-wrap">
          {items.map((item, i) => (
            <li key={item.url} className="flex items-center gap-1.5">
              {i < items.length - 1 ? (
                <Link href={item.url} className="hover:text-[#0ED3CF] transition-colors">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-[#A8A29E] truncate max-w-xs">
                  {item.name}
                </span>
              )}
              {i < items.length - 1 && <span aria-hidden="true">/</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
```

**Usage in blog:**

```tsx
// app/blog/[slug]/page.tsx — replace existing inline nav (lines 90-103)
const SITE = 'https://www.sageideas.dev'
// …
<Breadcrumbs
  items={[
    { name: 'Home', url: SITE },
    { name: 'Blog', url: `${SITE}/blog` },
    { name: post.title, url: `${SITE}/blog/${post.slug}` },
  ]}
  className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
/>
```

**Acceptance criteria:**
- All BreadcrumbList schemas from the `<Breadcrumbs>` component validate in Rich Results Test
- Visible breadcrumbs are keyboard navigable; last item has `aria-current="page"`
- No duplicate BreadcrumbList injection (remove any inline breadcrumb schemas from page files that adopt the component)

**Tests:**
- Playwright: `tests/e2e/breadcrumbs.spec.ts` — navigate to `/blog/[any-slug]`, assert `nav[aria-label="Breadcrumb"]` is visible and contains "Blog" link; assert JSON-LD script with `BreadcrumbList` type exists in DOM

---

### D4. Per-route metadata audit + fix

**What:** Audit every indexable route for duplicate/missing titles, missing descriptions, missing H1, and missing alt text. Produce a checklist and ship the fixes.

**Gap audit (verified from codebase):**

| Route | Title template | Issue found |
|---|---|---|
| `/` | `'Sage Ideas — AI-Native Studio for B2B Operators'` | OK — unique |
| `/blog` | Missing in `app/blog/page.tsx` exports | Needs `export const metadata` |
| `/compare` | Missing in `app/compare/page.tsx` | Needs `export const metadata` |
| `/compare/[slug]` | `'Sage Ideas vs X — honest comparison'` | OK |
| `/industries/[slug]` | `'${v.name} — Sage Ideas'` — template adds ` — Sage Ideas` again | Redundant suffix |
| `/services/[slug]` | `'${tier.name} — ${tier.price}'` then layout appends ` — Sage Ideas` | Becomes `"Audit — $750 — Sage Ideas"` — acceptable but price in title is debatable; keep for intent |
| `/work/[slug]` | `title: study.title` — layout appends ` — Sage Ideas` | No description OG prefix — OK |
| `/blog/[slug]` | `title: post.title` — no OG image unless `coverImage` set | OG falls back to no image |
| `/pricing` | Title: `'Pricing'` → `'Pricing — Sage Ideas'` | Description 160+ chars — truncate |
| `/founder` | Check that metadata exists | Likely has `export const metadata` |

**Files to modify:**
- `app/blog/page.tsx` — add `export const metadata: Metadata`
- `app/compare/page.tsx` — add `export const metadata: Metadata`
- `app/industries/[slug]/page.tsx` — fix title to not double-append studio name
- `app/blog/[slug]/page.tsx` — add dynamic OG image when no `coverImage`

**OG image fallback for blog posts:**

```tsx
// app/blog/[slug]/page.tsx — in generateMetadata
openGraph: {
  // …
  images: post.coverImage
    ? [{ url: post.coverImage }]
    : [{ url: `/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.excerpt.slice(0,120))}&eyebrow=SAGE+IDEAS+%C2%B7+BLOG` }],
},
```

**Script to detect duplicate titles:**

```ts
// scripts/check-duplicate-meta.mjs
// Run against a local Next.js build: node scripts/check-duplicate-meta.mjs
// Crawl sitemap.xml, fetch each URL, extract <title> and <meta name="description">
// Print any that share a title or description
import { JSDOM } from 'jsdom'
// ... (see full implementation in D7 test plan)
```

**Acceptance criteria:**
- `scripts/check-duplicate-meta.mjs` reports 0 duplicate titles across all public routes
- Every route has a unique `<meta name="description">` of 50-160 chars
- Every page has exactly one `<h1>`

**Tests:**
- `scripts/check-duplicate-meta.mjs` exits 0 in CI
- Playwright: assert `document.querySelectorAll('h1').length === 1` on /, /work, /blog, /pricing, /services/audit

---

### D5. Programmatic services×industries — unique content model

**What:** The current `/industries/[slug]` pages render content from `data/industries/verticals.ts` which has rich copy per vertical. The `/services/[slug]` pages render tier data. But there is no `/industries/[slug]/services/[serviceSlug]` or equivalent matrix page. This deliverable specs the content model and route for genuine services×industries pages (e.g. `/industries/fintech/seo-sprint`).

**Files:**
- `data/industries/service-matrix.ts` (create)
- `app/industries/[slug]/[serviceSlug]/page.tsx` (create)
- Update `app/sitemap.ts` to include matrix pages

**Interface/contract:**

```ts
// data/industries/service-matrix.ts

import type { Tier } from '@/data/services/tiers'
import type { Vertical } from '@/data/industries/verticals'

/** Unique copy for a specific service×industry combination.
 *  The `Tier` provides deliverables, phases, pricing.
 *  The `Vertical` provides industry context.
 *  This type adds the content that makes the page unique (not templated). */
export type ServiceIndustryContent = {
  /** e.g. 'fintech' */
  verticalSlug: string
  /** e.g. 'seo-sprint' */
  serviceSlug: string
  /** H1 for the matrix page — specific to the intersection */
  h1: string
  /** 2–3 sentence intro unique to this combination — not copy-pasted from tier or vertical */
  intro: string
  /** 3–4 industry-specific outcomes that frame the generic tier outcomes */
  industryOutcomes: string[]
  /** 2–3 industry-specific FAQ items that layer on top of the tier FAQs */
  additionalFaq: { q: string; a: string }[]
  /** Optional: a real case study slug that exemplifies this combo */
  caseStudySlug?: string
}

/** The matrix: only cells with real unique content get a page.
 *  Do not generate placeholder pages — every entry must pass the
 *  "would a human find this useful?" bar from the master plan. */
export const serviceIndustryMatrix: ServiceIndustryContent[] = [
  {
    verticalSlug: 'fintech',
    serviceSlug: 'seo-sprint',
    h1: 'Technical SEO for Fintech Platforms',
    intro:
      'Fintech pages face unique indexation challenges: dynamic account URLs, gated dashboards, and compliance-driven content restrictions. This 30-day SEO Sprint is scoped to the public marketing surface — pricing, regulatory pages, and product landing pages — without touching authenticated flows.',
    industryOutcomes: [
      'Compliance-aware robots.txt and canonical strategy',
      'Schema.org FinancialProduct and Service markup for regulated offerings',
      'Core Web Vitals pass on landing pages served to high-intent B2B decision-makers',
      'Programmatic SEO architecture for "best [fintech category] for [use-case]" queries',
    ],
    additionalFaq: [
      { q: 'Can you work with compliance-restricted content?', a: 'Yes. We audit only the public surface; gated content stays out of scope. We coordinate with your compliance team on any copy changes before PRs merge.' },
      { q: 'Will schema markup conflict with our existing legal disclaimers?', a: 'No. Schema markup is invisible to end users; it only surfaces in search previews. We review all FinancialProduct schema with you before shipping.' },
    ],
    caseStudySlug: 'alphastream',
  },
  // ... additional cells for high-value intersections only
]

// Index by verticalSlug+serviceSlug for O(1) lookup
export const matrixByKey = Object.fromEntries(
  serviceIndustryMatrix.map((m) => [`${m.verticalSlug}:${m.serviceSlug}`, m])
)
```

**Route:**

```tsx
// app/industries/[slug]/[serviceSlug]/page.tsx
import { matrixByKey, serviceIndustryMatrix } from '@/data/industries/service-matrix'
import { verticalsBySlug } from '@/data/industries/verticals'
import { tiersBySlug } from '@/data/services/tiers'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return serviceIndustryMatrix.map((m) => ({
    slug: m.verticalSlug,
    serviceSlug: m.serviceSlug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, serviceSlug } = await params
  const content = matrixByKey[`${slug}:${serviceSlug}`]
  if (!content) return {}
  return {
    title: content.h1,
    description: content.intro.slice(0, 160),
    alternates: { canonical: `${SITE}/industries/${slug}/${serviceSlug}` },
    openGraph: { /* … dynamic OG */ },
  }
}
```

**Acceptance criteria:**
- Every matrix page has unique `h1`, `intro`, and `industryOutcomes` — not templated filler
- Pages are included in sitemap
- `generateStaticParams` only returns cells that have real content in `serviceIndustryMatrix`
- Each page links to the parent industry page and parent service page (internal linking)

**Tests:**
- Playwright: visit one matrix page, assert H1 is unique (not the same as the tier page H1)
- Unit: assert `serviceIndustryMatrix` has no duplicate `verticalSlug:serviceSlug` keys

---

### D6. Price reconciliation — single source of truth

**What:** Two components hardcode prices that contradict `data/services/tiers.ts`:

- `components/v0-pricing/tier-cards.tsx` (lines 11, 32): `"$1,500"` (Audit), `"$4,900"` (Build)
- `components/pricing-table.tsx` (lines 12, 37): `"$1,500"` (Audit), `"$4,900"` (Build)

The canonical data in `data/services/tiers.ts` says:
- `audit`: `price: '$750'`, `priceCents: 75_000`
- `build`: `price: 'from $9,500'`, `priceCents: 950_000`

These two components are displaying a **legacy pricing tier structure** (`"Sage Audit"` + `"Sage Build"`) that does not map 1:1 to the current tiers. The $1,500 and $4,900 price points do not appear anywhere in `data/services/tiers.ts`.

**Root cause:** `components/v0-pricing/tier-cards.tsx` and `components/pricing-table.tsx` contain a parallel hardcoded data model that was never removed when `data/services/tiers.ts` was built out.

**Fix options:**

- **Option A (recommended):** Remove `components/pricing-table.tsx` and `components/v0-pricing/tier-cards.tsx` from any user-facing rendering path and replace with components that read from `tiers` (already done for the main pricing page via `V0PricingPage` which renders `tier-cards.tsx` with hardcoded data). Refactor `V0PricingPage` to accept `tiers` as a prop.

- **Option B (stopgap):** Delete the hardcoded `const tiers = [...]` arrays inside both files and import from `data/services/tiers.ts` instead, mapping fields.

**Recommended implementation (Option A):**

```tsx
// components/v0-pricing/tier-cards.tsx — refactored
'use client'
import { tiers } from '@/data/services/tiers'  // import from data, not hardcoded

// Use tiers.slice(0, 3) or a curated subset for the hero pricing display
// Map tier.price (string) for display, tier.ctaHref for CTA
```

**Files:**
- `components/v0-pricing/tier-cards.tsx` (modify — remove hardcoded `const tiers`)
- `components/pricing-table.tsx` (modify — remove hardcoded `const tiers`)
- `app/pricing/page.tsx` (no change needed if components read from data)

**Acceptance criteria:**
- `grep -rn '"\\$1,500"\|"\\$4,900"' components/` returns 0 results after the fix
- The pricing page renders the same prices as `data/services/tiers.ts`
- The `buildService` schema in D2 therefore displays the correct price in rich results

**Tests:**
- `scripts/check-price-consistency.mjs`: parse `data/services/tiers.ts`, crawl `/pricing` page HTML, assert no price appears on page that does not exist in `tiers` data
- Unit: assert `tier-cards.tsx` has no literal `$1,500` or `$4,900` string after fix

---

### D7. Core Web Vitals / Lighthouse CI budgets

**What:** Tighten the existing `lighthouserc.json` performance threshold (currently `warn` at 0.88), add the blog and services/[slug] template URLs, add a Lighthouse CI budget for LCP/CLS/TBT, and ship an image optimization audit.

**Files:**
- `lighthouserc.json` (modify)
- `lighthouserc.mobile.json` (modify — add template URLs)
- `next.config.ts` (verify `images.formats` includes `avif, webp`)

**Current `lighthouserc.json` state:**
- URLs: /, /services, /work, /pricing, /blog, /contact
- Performance: `warn` at 0.88 — too loose
- Missing: /blog/[slug], /services/[slug], /industries/[slug]

**Modified `lighthouserc.json`:**

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 2,
      "startServerCommand": "npm run build && node scripts/serve-prod.mjs",
      "url": [
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/services",
        "http://127.0.0.1:4173/services/audit",
        "http://127.0.0.1:4173/work",
        "http://127.0.0.1:4173/work/nexural",
        "http://127.0.0.1:4173/pricing",
        "http://127.0.0.1:4173/blog",
        "http://127.0.0.1:4173/industries/fintech",
        "http://127.0.0.1:4173/compare/sage-vs-in-house-hire",
        "http://127.0.0.1:4173/contact"
      ],
      "settings": {
        "preset": "desktop",
        "onlyCategories": ["performance", "accessibility", "best-practices", "seo"],
        "throttlingMethod": "provided"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance":     ["error", { "minScore": 0.90 }],
        "categories:accessibility":   ["error", { "minScore": 0.95 }],
        "categories:best-practices":  ["error", { "minScore": 0.95 }],
        "categories:seo":             ["error", { "minScore": 0.98 }],
        "largest-contentful-paint":   ["warn",  { "maxNumericValue": 2500 }],
        "cumulative-layout-shift":    ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time":        ["warn",  { "maxNumericValue": 200 }],
        "interactive":                ["warn",  { "maxNumericValue": 3500 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Image optimization deliverables:**

1. **`next.config.ts`** — verify `images.formats: ['image/avif', 'image/webp']` is set
2. **Hero images** — ensure `priority` prop on LCP `<Image>` on /, /work/[slug], /services/[slug]
3. **Below-fold images** — verify `loading="lazy"` (Next.js `<Image>` default is lazy; audit any `<img>` tags)
4. **Explicit dimensions** — `<Image>` components without `fill` must have `width` and `height`

**Font loading (already in layout.tsx):**
- `Instrument_Serif`, `Plus_Jakarta_Sans`, `JetBrains_Mono` all use `display: 'swap'` — OK
- `preconnect` to fonts.googleapis.com and fonts.gstatic.com already present — OK
- No change needed unless Lighthouse CI flags font as render-blocking

**Acceptance criteria:**
- `npx lhci autorun` exits 0 on all 10 URLs
- LCP measured in Lighthouse < 2.5s on / and /work/nexural
- CLS < 0.1 on all pages
- Lighthouse SEO score = 100 on /services/audit (has Service + FAQ schema), /blog/[slug] (has BlogPosting), /work/nexural (has BreadcrumbList + CreativeWork)

**Tests:**
- `npx lhci autorun` in CI (already configured for Vercel uploads)
- Playwright visual regression on hero image to catch layout shifts

---

## 3. Data model / schema

No new database tables. All structured data is build-time from existing files.

**Canonical price source** (after D6 fix):

```
data/services/tiers.ts → tier.price (string display) + tier.priceCents (integer, cents)
                       ↓
All display components + JSON-LD Service schema
```

**Services×Industries matrix** (new file from D5):

```
data/industries/service-matrix.ts
  ServiceIndustryContent {
    verticalSlug: string        // FK → verticals.slug
    serviceSlug: string         // FK → tiers.slug
    h1: string
    intro: string
    industryOutcomes: string[]
    additionalFaq: FaqItem[]
    caseStudySlug?: string      // FK → case-studies.slug
  }
```

**Sitemap data sources** (after D1 fix):

```
Static routes   → staticRoutes[] (hardcoded, stable)
Blog posts      → getAllBlogPosts() from lib/blog-server.ts → content/blog/*.mdx
Work            → workSlugs[] (hardcoded — matches data/work/case-studies.ts slugs)
Services        → tiers[] + careTiers[] + extendedTiers[]
Industries      → verticals[]
Lab             → labSlugs[]
Compare         → comparisons[]              ← ADDED in D1
Matrix pages    → serviceIndustryMatrix[]    ← ADDED in D5
```

---

## 4. Integration points (reuse real files)

| What | Existing file | Notes |
|---|---|---|
| JSON-LD component | `components/json-ld.tsx` | Already exists, no change needed |
| Blog post data | `lib/blog-server.ts` → `getAllBlogPosts()` | Safe to call in `sitemap.ts` at build time |
| Service tiers | `data/services/tiers.ts` → `tiers`, `careTiers` | Single source of truth post D6 |
| Industry verticals | `data/industries/verticals.ts` → `verticals`, `verticalsBySlug` | Already used in sitemap |
| Comparisons | `data/compare/comparisons.ts` → `comparisons` | Add to sitemap in D1 |
| OG image generator | `app/og/route.tsx` | Parameterized: `?title=&subtitle=&eyebrow=&accent=` — use for all missing OG images |
| Robots | `app/robots.ts` | No change needed — already correct |
| Extended tiers | `data/services/extended.ts` | Include in sitemap if not already |
| Lighthouse CI | `lighthouserc.json`, `lighthouserc.mobile.json` | Modify in D7 |

**`<Breadcrumbs>` replaces these inline patterns:**

- `app/blog/[slug]/page.tsx` lines 90-103 (inline `<nav>` with no JSON-LD)
- `app/work/[slug]/page.tsx` lines 68-81 (inline `breadcrumbSchema` + separate `<JsonLd>`)

After D3, both those files import `<Breadcrumbs>` which handles both concerns.

---

## 5. Definition of Done

- [ ] `app/sitemap.ts` includes ≥ 51 blog entries + ≥ 3 compare entries
- [ ] `lib/seo/jsonld.ts` exists with all 8 builder functions, 0 TypeScript errors
- [ ] `components/seo/breadcrumbs.tsx` is used on: `/blog/[slug]`, `/work/[slug]`, `/compare/[slug]`, `/industries/[slug]`, `/services/[slug]`
- [ ] `scripts/check-duplicate-meta.mjs` exits 0 — no duplicate titles or descriptions
- [ ] `data/industries/service-matrix.ts` has ≥ 5 real content cells (not placeholder text)
- [ ] `grep -rn '"\\$1,500"\|"\\$4,900"' components/` returns 0 matches
- [ ] `npx lhci autorun` exits 0 on all 10 URLs
- [ ] Google Rich Results Test passes on `/services/audit`, `/blog/[one-slug]`, `/work/nexural`, `/pricing`
- [ ] GSC shows 0 critical coverage errors within 72h of sitemap resubmission

---

## 6. [YOU] prerequisites

These require Jason's direct action and cannot be automated:

1. **[YOU] Google Search Console access** — verify ownership token is in `public/` or DNS, submit `sitemap.xml` after D1 ships
2. **[YOU] Bing Webmaster** — submit sitemap to Bing Webmaster Tools (separate from GSC)
3. **[YOU] Google Business Profile** — verify or create GBP listing for "Sage Ideas LLC" in Orlando, FL; ensure NAP (Name, Address, Phone) matches `app/layout.tsx` schema exactly
4. **[YOU] Program G keyword map** — D5 matrix page copy must be grounded in real keyword intent data; do not write matrix page `h1`/`intro` until keyword map is available (D1-D4 can ship before this)
5. **[YOU] Content for matrix pages** — the `ServiceIndustryContent.intro` and `industryOutcomes` per cell must be written from real knowledge of the industry×service intersection; the spec provides the data model and route, not the copy
6. **[YOU] Rich Results Test validation** — manually verify each schema type after deployment (automated validation cannot replicate Google's renderer)

---

## 7. Rollout & verification

### Phase 1 — Foundation (D1 + D6, no new content)

Deploy D1 (sitemap) and D6 (price fix) first. These are low-risk changes with high immediate impact.

**Verification:**
```bash
# 1. Confirm sitemap count
curl https://www.sageideas.dev/sitemap.xml | grep -c '<loc>'
# Expected: ≥ 120

# 2. Confirm no hardcoded prices remain
grep -rn '"$1,500"\|"$4,900"' components/
# Expected: 0 results

# 3. Submit to GSC
# [YOU] navigate to GSC → Sitemaps → submit https://www.sageideas.dev/sitemap.xml
```

### Phase 2 — Structured Data (D2 + D3)

Deploy `lib/seo/jsonld.ts` and `<Breadcrumbs>`. No user-visible changes — JSON-LD only.

**Verification:**
```bash
# Test each schema type in Rich Results Test
# https://search.google.com/test/rich-results?url=https://www.sageideas.dev/services/audit
# https://search.google.com/test/rich-results?url=https://www.sageideas.dev/blog/[any-slug]
# https://search.google.com/test/rich-results?url=https://www.sageideas.dev/work/nexural
# https://search.google.com/test/rich-results?url=https://www.sageideas.dev/pricing
```

### Phase 3 — On-Page + Lighthouse (D4 + D7)

Fix metadata gaps and tighten Lighthouse CI thresholds.

**Verification:**
```bash
# Run duplicate meta check
node scripts/check-duplicate-meta.mjs

# Run Lighthouse CI
npx lhci autorun

# Playwright E2E for H1 uniqueness
npx playwright test tests/e2e/seo-h1.spec.ts
```

### Phase 4 — Programmatic (D5)

Ship services×industries matrix pages. Requires keyword map from Program G.

**Verification:**
- Spot-check 3 matrix pages in Google Rich Results Test
- Confirm matrix pages appear in sitemap
- Confirm each page passes "would a human find this useful?" review — written by Jason, not templated

### Post-launch monitoring

- GSC: check Coverage → Valid/Error counts after each phase
- GSC: check Rich results → Breadcrumbs, FAQ, Job Posting tabs after Phase 2
- Lighthouse CI: run in CI on every PR touching `app/`, `components/`, `data/`, or `lib/seo/`
- Set GSC alert for coverage errors > 5 new per week
