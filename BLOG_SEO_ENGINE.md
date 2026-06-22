# Sage Ideas — Content Engine & SEO Architecture
**The foundation we pour thousands of posts onto.** Last updated: 2026-06-22

This document is the operating system for the blog. The content changes; this engine does not.
Every post, every cluster, every link follows these rules — so the site compounds in authority
instead of accumulating disconnected pages.

---

## 0 · The thesis
Google ranks **topical authority**, not individual posts. The way you win a topic is the
**hub-and-spoke (pillar-cluster) model**: one authoritative *pillar* page per topic, surrounded by
many *spoke* posts that each go deep on a sub-question, with **dense internal links** tying the
cluster together and pointing up to the pillar. Do this across N topics and the whole domain reads
as an authority. Then **money pages** (services, academy) sit one click from the content that earns
the traffic. That is the entire game, and it's what this architecture enforces mechanically.

```
                 ┌─────────── PILLAR (topic hub) ───────────┐
                 │  /topics/ai-engineering                  │  ← ranks for the head term
                 │  links DOWN to every spoke                │
                 │  links OUT to the money page             │
                 └──────────────┬───────────────────────────┘
        ┌───────────────┬───────┼───────────────┬───────────────┐
     SPOKE           SPOKE    SPOKE           SPOKE           SPOKE   ← long-tail posts
   /blog/rag-eval  /blog/...  ...                                     each links: UP to pillar,
        │  ▲          │                                              ACROSS to 2-4 siblings,
        └──┴──────────┘  (sibling cross-links)                       OUT to money page + academy
```

---

## 1 · The taxonomy (current → target)

**Pillars (clusters) today** — `data/content/clusters.ts`, 6 hubs at `/topics/[slug]`:
| Cluster | Hub | Money page |
|---|---|---|
| Testing & QA | `/topics/testing-qa` | `/services/enterprise-qa` |
| AI Engineering | `/topics/ai-engineering` | `/services/ai-development` |
| Fintech & Trading Systems | `/topics/fintech-trading` | `/services/trading-systems` |
| Cloud & Infrastructure | `/topics/cloud-infra` | `/services/cloud-infrastructure` |
| Solo Studio OS | `/topics/solo-studio` | `/studio` |
| Product Systems | `/topics/product-systems` | `/services/studio-engagement` |

**Target at scale:** when a cluster passes ~25–40 posts, split it into **sub-clusters**
(`/topics/ai-engineering/rag`, `/topics/ai-engineering/agents`, …) so no pillar becomes a dumping
ground and each sub-topic gets its own mini-pillar. The cluster config gains a `subClusters[]` array;
the hub renders grouped sections. New top-level clusters are added the same way (one config entry +
a money-page link) — e.g. **Machine Learning, MLOps, Data Engineering, Security** as the academy
expands. *(This is also where the future multi-language split happens — see §8.)*

---

## 2 · The internal-linking law (the SEO core — enforced in code)
Every published post automatically satisfies ALL of these. This is what `lib/seo/internal-links.ts`
guarantees so it never depends on an author remembering:

1. **UP to the pillar** — every spoke links to its cluster hub (breadcrumb + a prominent in-body
   "Part of: [Pillar]" link). Strengthens the pillar; passes context to Google.
2. **ACROSS to 2–4 siblings** — "Read next in this cluster", ranked **same-cluster first** (today it
   ranks by tags — fixed). Curated overrides via frontmatter `related: [slug, …]`.
3. **DOWN from the pillar** — each hub links to every spoke (and, at scale, to each sub-cluster).
4. **OUT to the money page** — every post + every hub carries the cluster's `moneyPageLink` and an
   academy cross-link. Content → revenue is always one click.
5. **SIDEWAYS across clusters** — related clusters link to each other ("Also relevant: Cloud
   Infrastructure" on a fintech post) via a `relatedClusters` map. Builds a connected graph, not 6
   islands.
6. **CONTEXTUAL in-body links** — `[[slug]]` or `[[cluster/slug]]` syntax in MDX auto-resolves to the
   right `/blog/...` or `/topics/...` link at render time. This is how depth is signalled — links
   *inside* the prose, not just in widgets.

**Rule of thumb per post:** ≥3 internal links out (pillar + ≥2 siblings), ≥1 money/academy link, and
it must be linked-to by its pillar + ≥2 siblings (no orphans). The engine reports orphans in the
build.

---

## 3 · The post spec (frontmatter contract)
Validated by Zod (`PostFrontmatterSchema`). The contract that lets anyone — or an AI session —
produce a publish-ready, fully-wired post:

```yaml
---
title: "…"                 # H1 + <title>; target the keyword
slug: "…"                  # URL; kebab-case; stable forever
date: "YYYY-MM-DD"
dateUpdated: "YYYY-MM-DD"  # bump on real edits → freshness signal
excerpt: "…"               # 120–160 chars; doubles as meta description
description: "…"           # optional; overrides excerpt for <meta>
cluster: ai-engineering    # REQUIRED — assigns the pillar
subCluster: rag            # optional — once sub-clusters exist
category: "RAG Systems"
tags: ["RAG","evals","…"]
keywords: ["…"]            # primary + secondary; synced to the keyword map
related: ["slug-a","slug-b"]   # curated siblings (overrides auto)
relatedClusters: ["cloud-infra"]  # optional cross-cluster bridges
series: "…"                # optional
seriesIndex: 1
readTime: "12 min read"
coverImage: "/blog/covers/….png"  # optional; else generated OG
canonical: "…"             # optional; only if syndicated
faq:                       # optional → emits FAQPage schema
  - q: "…"
    a: "…"
---
```

**Body conventions:** open with the answer (featured-snippet bait), H2/H3 with target sub-keywords,
`[[slug]]` links woven into the prose, one custom directive where it earns it (proof-note,
system-diagram, scorecard, offer-cta), close with the money/academy CTA the engine injects.

---

## 4 · The content-production system (how we make hundreds, consistently)
A repeatable pipeline so volume never costs quality or coherence:

1. **Keyword → topic map** (`data/seo/keyword-map.ts`): every target keyword has volume, difficulty,
   **intent** (informational/commercial/transactional), an assigned URL, and a cluster. This is the
   backlog. *Build target:* a coverage report that flags keywords with no post + posts with no
   tracked keyword (drift).
2. **Cluster gaps** (`cluster.gaps[]`): the editorial roadmap per pillar — the next 3–10 posts each
   hub needs to be complete. This is the prioritised queue.
3. **Brief → draft → wire → publish:** pick a gap/keyword → write to the post spec (§3) → the engine
   auto-wires links (§2) → orphan/SEO checks pass at build → push. An AI session can run this loop at
   volume because the spec + engine make "correct" the default.
4. **Refresh loop:** `dateUpdated` bumps on edits; quarterly, re-target decaying posts from GSC data.

**Cadence target:** to reach ~100k reads/mo you need depth + freshness — realistically 4–8 high-
quality, tightly-linked posts/week across the clusters, compounding over 9–18 months. The engine
makes that throughput possible without the site fragmenting.

---

## 5 · Technical SEO at scale (what we build)
- **Pagination:** `/blog`, `/blog/page/[n]` (SSG, 18–24/page) with `rel=prev/next` + sitemap entries.
  Removes the all-posts-in-client problem and makes every post crawlable. *(building now)*
- **Content layer:** parse MDX once at build into a typed index (Velite/Contentlayer) so 1000+ posts
  build fast and queries are O(1). *(phase 2)*
- **Server-side search:** Supabase FTS table mirroring post metadata; replaces client-only search.
- **Schema:** keep BlogPosting + Breadcrumb + CollectionPage; **add FAQPage** (from frontmatter `faq`)
  and `TechArticle` where apt; `Person`/author E-E-A-T on posts.
- **RSS:** per-cluster feeds (`/feed/[cluster].xml`) + `content:encoded`.
- **Hub pages:** sub-cluster sections, "related clusters", and (at scale) their own pagination.
- **Performance:** ISR on posts + hubs; `next/image` in MDX; the existing dynamic OG route stays.

## 6 · Off-page / backlinks (authority)
Rankings need links *in*, not just *out*. The plan:
- **Linkable assets:** original, citable pieces — benchmarks, the AI-search-readiness report,
  redacted teardowns, free tools (`/tools/seo-audit`, route-finder), the academy's free references.
  These earn natural links far better than tutorials.
- **Digital PR / outreach:** pitch the data assets to relevant newsletters/communities; guest pieces
  on the strongest clusters; HARO-style expert quotes.
- **Internal first:** the §2 link graph is the cheapest authority you control — perfect it before
  chasing external links.
- **Programmatic depth:** the `service × industry` pages already exist; topic hubs + sub-clusters add
  more ranking surface without thin content.

## 7 · Measurement
- GSC snapshot already captured per keyword (impressions/clicks/position). Build: a coverage +
  orphan + decay dashboard from `keyword-map.ts` + the post index. Track: indexed pages, cluster
  impressions, internal-link counts/post, and content→money-page click-through.

## 8 · Multi-language readiness (the next-level play)
Build translation-ready *now* so the i18n phase is a swap, not a rewrite:
- Locale-segmented routing (`/es/blog/…`, `/fr/topics/…`) with `hreflang` + `x-default`.
- All copy from a content source (frontmatter + MDX) — no hardcoded strings in components.
- Cluster/keyword maps gain a `locale` dimension; the link engine stays locale-aware (links resolve
  within-locale). One canonical post → N translated spokes, each in its locale's cluster.
- This turns the engine into an international "learn AI in your language" surface — 5–10× the
  addressable audience.

---

## 9 · Build roadmap
- **Phase 1 (now):** cluster-first internal-linking engine + `related`/`relatedClusters` + `[[slug]]`
  in-body links + UP-to-pillar link + pagination (`/blog/page/[n]`) + sitemap pagination. *The
  foundation everything compounds on.*
- **Phase 2:** content layer (Velite) + FAQPage schema + per-cluster RSS + keyword-coverage/orphan
  report + sub-cluster support.
- **Phase 3:** Supabase FTS search + content calendar + decay/refresh tooling + academy↔blog links.
- **Phase 4:** i18n routing + translation pipeline.

**The principle:** automation makes "SEO-correct + fully-linked" the *default* state of every post,
so the team's only job is producing genuinely good content — and the engine compounds it.
