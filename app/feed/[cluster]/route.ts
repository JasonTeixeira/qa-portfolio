import { getBlogPostsByCluster } from '@/lib/blog-server'
import { clusterList, getClusterBySlug } from '@/data/content/clusters'
import { buildRssFeed } from '@/lib/seo/rss'

// Per-cluster RSS feeds at /feed/<cluster>.xml (the param carries the .xml suffix).
export const dynamicParams = false

export function generateStaticParams() {
  return clusterList.map((cluster) => ({ cluster: `${cluster.slug}.xml` }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ cluster: string }> }) {
  const { cluster: raw } = await params
  const slug = raw.replace(/\.xml$/, '')
  const cluster = getClusterBySlug(slug)
  if (!cluster) {
    return new Response('Not found', { status: 404 })
  }

  const posts = getBlogPostsByCluster(cluster.key)
  const xml = buildRssFeed(
    {
      title: `Sage Ideas — ${cluster.title}`,
      description: cluster.description,
      feedPath: `/feed/${cluster.slug}.xml`,
      link: `/topics/${cluster.slug}`,
    },
    posts,
  )

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
