import type { BlogPost } from '@/lib/blog-server'
import type { ClusterKey } from '@/lib/blog-schema'
import { CLUSTERS } from '@/data/content/clusters'

/**
 * Resolve `[[slug]]`, `[[cluster/key]]`, and `[[target|label]]` wiki-links in MDX
 * bodies into real markdown links before rendering. This is how contextual
 * in-prose linking (the strongest internal-link signal) stays trivial at scale:
 * authors write `[[rag-evaluation]]` and the engine links it correctly. Unknown
 * targets degrade to plain text — never a broken link.
 */
export function resolveWikiLinks(md: string, posts: BlogPost[]): string {
  const postBySlug = new Map(posts.map((p) => [p.slug, p]))
  const clusterByKey = new Map(Object.entries(CLUSTERS))
  const clusterBySlug = new Map(Object.values(CLUSTERS).map((c) => [c.slug, c]))
  return md.replace(/\[\[([^\]\n]+)\]\]/g, (_m, inner: string) => {
    const [targetRaw, labelRaw] = inner.split('|').map((s) => s.trim())
    const label = labelRaw || ''
    const target = targetRaw.includes('/') ? targetRaw.split('/').pop()!.trim() : targetRaw
    // cluster / topic hub
    const cluster = clusterByKey.get(target) ?? clusterBySlug.get(target)
    if (targetRaw.includes('/') && cluster) return `[${label || cluster.title}](/topics/${cluster.slug})`
    // blog post
    const post = postBySlug.get(target)
    if (post) return `[${label || post.title}](/blog/${post.slug})`
    // bare cluster key/slug also resolves to its hub
    if (cluster) return `[${label || cluster.title}](/topics/${cluster.slug})`
    return label || targetRaw
  })
}

/**
 * The internal-linking engine (see BLOG_SEO_ENGINE.md §2). This is the #1 on-page
 * SEO lever: it builds topical authority by linking every spoke to its cluster
 * siblings + pillar, automatically, so volume never fragments the graph.
 */

function topicalOverlap(a: BlogPost, b: BlogPost): number {
  const set = new Set([...(a.tags ?? []), ...(a.keywords ?? [])].map((t) => t.toLowerCase()))
  return [...(b.tags ?? []), ...(b.keywords ?? [])].filter((t) => set.has(t.toLowerCase())).length
}

/**
 * Related posts, cluster-first: curated `related` slugs in order, then same-cluster
 * posts ranked by topical overlap + recency, then cross-cluster shared-tag fill
 * (preferring `relatedClusters`). Never returns the post itself; never duplicates.
 */
export function getRelatedPosts(post: BlogPost, all: BlogPost[], limit = 4): BlogPost[] {
  const bySlug = new Map(all.map((p) => [p.slug, p]))
  const out: BlogPost[] = []
  const seen = new Set<string>([post.slug])
  const push = (p?: BlogPost) => {
    if (p && !seen.has(p.slug)) {
      seen.add(p.slug)
      out.push(p)
    }
  }

  // 1 — curated overrides (authoritative siblings the author chose)
  for (const slug of post.related ?? []) {
    if (out.length >= limit) break
    push(bySlug.get(slug))
  }

  // 2 — same cluster, ranked by topical overlap then recency
  const sameCluster = all
    .filter((p) => p.cluster === post.cluster && !seen.has(p.slug))
    .sort((a, b) => topicalOverlap(post, b) - topicalOverlap(post, a) || b.date.localeCompare(a.date))
  for (const p of sameCluster) {
    if (out.length >= limit) break
    push(p)
  }

  // 3 — cross-cluster fill: relatedClusters first, then any shared-tag post
  if (out.length < limit) {
    const cross = all
      .filter((p) => p.cluster !== post.cluster && !seen.has(p.slug))
      .map((p) => ({
        p,
        score: (post.relatedClusters?.includes(p.cluster) ? 100 : 0) + topicalOverlap(post, p),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
    for (const { p } of cross) {
      if (out.length >= limit) break
      push(p)
    }
  }

  return out.slice(0, limit)
}

/**
 * Which other clusters this post bridges to — for the "Also relevant" cross-links
 * on hub/article surfaces. Uses curated `relatedClusters`, else infers from the
 * clusters of its strongest cross-cluster related posts.
 */
export function getRelatedClusterKeys(post: BlogPost, all: BlogPost[], limit = 2): ClusterKey[] {
  if (post.relatedClusters?.length) return post.relatedClusters.slice(0, limit)
  const counts = new Map<ClusterKey, number>()
  for (const p of getRelatedPosts(post, all, 6)) {
    if (p.cluster !== post.cluster) counts.set(p.cluster, (counts.get(p.cluster) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k]) => k)
}

/**
 * Which clusters a *hub* bridges to — for the "Related topics" cross-links on a
 * pillar page (linking law §5, SIDEWAYS). Data-driven: aggregates the cross-cluster
 * bridges of every post in the cluster, so the graph reflects real content overlap
 * and improves automatically as posts are added. No hardcoded cluster pairs.
 */
export function getHubRelatedClusters(cluster: ClusterKey, all: BlogPost[], limit = 3): ClusterKey[] {
  const counts = new Map<ClusterKey, number>()
  for (const post of all.filter((p) => p.cluster === cluster)) {
    for (const key of getRelatedClusterKeys(post, all, 3)) {
      if (key !== cluster) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k)
}

/** Orphan check for the build report: a post with no inbound sibling links is weak. */
export function findOrphanSlugs(all: BlogPost[]): string[] {
  const inbound = new Map<string, number>(all.map((p) => [p.slug, 0]))
  for (const post of all) {
    for (const rel of getRelatedPosts(post, all, 4)) {
      inbound.set(rel.slug, (inbound.get(rel.slug) ?? 0) + 1)
    }
  }
  return [...inbound.entries()].filter(([, n]) => n === 0).map(([slug]) => slug)
}
