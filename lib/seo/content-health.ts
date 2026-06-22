import type { BlogPost } from '@/lib/blog-server'
import type { ClusterKey } from '@/lib/blog-schema'
import { CLUSTERS, clusterList } from '@/data/content/clusters'
import { keywordMap, type Intent, type KeywordEntry } from '@/data/seo/keyword-map'
import { getRelatedPosts, findOrphanSlugs } from '@/lib/seo/internal-links'

/**
 * Shared content-engine health + editorial-planning logic (BLOG_SEO_ENGINE §4/§7).
 * One source of truth consumed by both the CLI report (`scripts/content-report.ts`)
 * and the /content-ops dashboard, so terminal and UI never drift.
 */

const MIN_INTERNAL_LINKS = 2

export interface ClusterHealth {
  key: ClusterKey
  title: string
  slug: string
  count: number
  gaps: string[]
}

export interface ContentHealth {
  total: number
  clusters: ClusterHealth[]
  orphans: string[]
  uncoveredKeywords: KeywordEntry[]
  thinLinked: { slug: string; links: number }[]
  driftCount: number
  issues: number
}

export function getClusterHealth(posts: BlogPost[]): ClusterHealth[] {
  return clusterList.map((cluster) => ({
    key: cluster.key,
    title: cluster.title,
    slug: cluster.slug,
    count: posts.filter((p) => p.cluster === cluster.key).length,
    gaps: cluster.gaps,
  }))
}

export function getContentHealth(posts: BlogPost[]): ContentHealth {
  const liveUrls = new Set<string>([
    ...posts.map((p) => `/blog/${p.slug}`),
    ...clusterList.map((c) => `/topics/${c.slug}`),
  ])
  const uncoveredKeywords = keywordMap.filter((k) =>
    (k.assignedUrl.startsWith('/blog') || k.assignedUrl.startsWith('/topics')) && !liveUrls.has(k.assignedUrl),
  )
  const trackedSlugs = new Set(
    keywordMap
      .map((k) => k.assignedUrl)
      .filter((u) => u.startsWith('/blog/'))
      .map((u) => u.replace('/blog/', '')),
  )
  const orphans = findOrphanSlugs(posts)
  const thinLinked = posts
    .map((p) => ({ slug: p.slug, links: getRelatedPosts(p, posts, 4).length }))
    .filter((p) => p.links < MIN_INTERNAL_LINKS)

  return {
    total: posts.length,
    clusters: getClusterHealth(posts),
    orphans,
    uncoveredKeywords,
    thinLinked,
    driftCount: posts.filter((p) => !trackedSlugs.has(p.slug)).length,
    issues: orphans.length + uncoveredKeywords.length + thinLinked.length,
  }
}

export type CalendarPriority = 'P0' | 'P1' | 'P2'

export interface CalendarItem {
  title: string
  cluster: ClusterKey
  clusterTitle: string
  clusterSlug: string
  priority: CalendarPriority
  reason: string
  suggestedUrl?: string
  intent?: Intent
  volume?: number
}

const INTENT_WEIGHT: Record<Intent, number> = {
  transactional: 4,
  commercial: 3,
  informational: 2,
  navigational: 1,
}

/**
 * The editorial queue (content calendar). Demand-first: keywords we track but have
 * no page for rank highest (validated demand, zero supply), then each pillar's open
 * gaps, with thin clusters (<4 posts) promoted. Sorted by priority then intent×volume.
 */
export function getEditorialQueue(posts: BlogPost[]): CalendarItem[] {
  const counts = new Map<ClusterKey, number>(
    clusterList.map((c) => [c.key, posts.filter((p) => p.cluster === c.key).length]),
  )
  const liveUrls = new Set(posts.map((p) => `/blog/${p.slug}`))
  const items: CalendarItem[] = []

  // 1 — uncovered tracked keywords (validated demand, no page) → P0
  for (const k of keywordMap) {
    if (!k.assignedUrl.startsWith('/blog/')) continue
    if (liveUrls.has(k.assignedUrl)) continue
    const clusterKey = clusterList.find((c) => c.key === (k.cluster as ClusterKey))?.key
    if (!clusterKey) continue
    items.push({
      title: k.term,
      cluster: clusterKey,
      clusterTitle: CLUSTERS[clusterKey].title,
      clusterSlug: CLUSTERS[clusterKey].slug,
      priority: 'P0',
      reason: 'Tracked keyword with no live page yet',
      suggestedUrl: k.assignedUrl,
      intent: k.intent,
      volume: k.monthlyVolume,
    })
  }

  // 2 — pillar gaps (editorial roadmap) → P1 if cluster is thin, else P2
  for (const cluster of clusterList) {
    const thin = (counts.get(cluster.key) ?? 0) < 4
    for (const gap of cluster.gaps) {
      items.push({
        title: gap,
        cluster: cluster.key,
        clusterTitle: cluster.title,
        clusterSlug: cluster.slug,
        priority: thin ? 'P1' : 'P2',
        reason: thin ? 'Open gap in a thin cluster (<4 posts)' : 'Open gap on the pillar roadmap',
      })
    }
  }

  const rank: Record<CalendarPriority, number> = { P0: 0, P1: 1, P2: 2 }
  return items.sort(
    (a, b) =>
      rank[a.priority] - rank[b.priority] ||
      (b.intent ? INTENT_WEIGHT[b.intent] : 0) - (a.intent ? INTENT_WEIGHT[a.intent] : 0) ||
      (b.volume ?? 0) - (a.volume ?? 0),
  )
}
