import type { MetadataRoute } from 'next'
import conceptsManifest from '@/lib/academy/concepts-manifest.json'
import { tiers, careTiers } from '@/data/services/tiers'
import { verticals } from '@/data/industries/verticals'
import { comparisons } from '@/data/compare/comparisons'
import { clusterList } from '@/data/content/clusters'
import { getAllBlogPosts } from '@/lib/blog-server'
import { getServiceIndustryPages } from '@/lib/seo/service-industry-pages'

const SITE = 'https://www.sageideas.dev'

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/work', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/lab', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/academy', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/interview', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/academy/concepts', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/academy/guarantee', priority: 0.6, changeFrequency: 'monthly' },
  ...(conceptsManifest as { concepts: { slug: string }[] }).concepts.map((c) => ({ path: `/academy/concepts/${c.slug}`, priority: 0.7, changeFrequency: 'monthly' as const })),
  { path: '/engineering-os', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/how-it-works', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/capabilities', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/industries', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/services/studio-engagement', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/process', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/trust', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/studio', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/founder', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/pov', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/book', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/topics', priority: 0.72, changeFrequency: 'weekly' },
  { path: '/compare', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/changelog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/learn/waitlist', priority: 0.82, changeFrequency: 'weekly' },
  { path: '/reports/ai-search-readiness-2026', priority: 0.74, changeFrequency: 'monthly' },
  { path: '/artifacts/sample-audit', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tools/route-finder', priority: 0.76, changeFrequency: 'weekly' },
  { path: '/tools/seo-audit', priority: 0.76, changeFrequency: 'weekly' },
  { path: '/legal', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/privacy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/terms', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/cookies', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/legal/msa', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/nda', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/legal/sow-template', priority: 0.3, changeFrequency: 'yearly' },
]

const workSlugs = [
  'nexural',
  'alphastream',
  'jobpoise',
  'trayd',
  'aws-landing-zone',
  'quality-telemetry',
  'brand-sprint-rebuild',
  'site-care-retainer',
]

const labSlugs = ['nexural', 'jobpoise', 'trayd', 'voza', 'owly', 'alphastream']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const blogPosts = getAllBlogPosts()
  const serviceIndustryPages = getServiceIndustryPages()
  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE}${r.path}`,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...tiers.map((t) => ({
      url: `${SITE}/services/${t.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...careTiers.map((c) => ({
      url: `${SITE}/services/${c.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...verticals.map((v) => ({
      url: `${SITE}/industries/${v.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...workSlugs.map((slug) => ({
      url: `${SITE}/work/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...labSlugs.map((slug) => ({
      url: `${SITE}/lab/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...blogPosts.map((post) => ({
      url: `${SITE}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    // Paginated archive (page 2+; page 1 canonicalises to /blog so it's omitted here).
    ...Array.from(
      { length: Math.max(0, Math.ceil(blogPosts.length / 12) - 1) },
      (_, i) => ({
        url: `${SITE}/blog/page/${i + 2}`,
        changeFrequency: 'weekly' as const,
        priority: 0.45,
      }),
    ),
    ...clusterList.map((cluster) => ({
      url: `${SITE}/topics/${cluster.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.72,
    })),
    ...comparisons.map((c) => ({
      url: `${SITE}/compare/${c.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...serviceIndustryPages.map((page) => ({
      url: `${SITE}${page.path}`,
      changeFrequency: 'monthly' as const,
      priority: 0.62,
    })),
  ]
}
