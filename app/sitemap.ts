import type { MetadataRoute } from 'next'
import { tiers, careTiers } from '@/data/services/tiers'
import { verticals } from '@/data/industries/verticals'

const SITE = 'https://sageideas.dev'

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/work', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/lab', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/services', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/capabilities', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/industries', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/process', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/trust', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/studio', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/founder', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/book', priority: 0.85, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
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
  return [
    ...staticRoutes.map((r) => ({
      url: `${SITE}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...tiers.map((t) => ({
      url: `${SITE}/services/${t.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...careTiers.map((c) => ({
      url: `${SITE}/services/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...verticals.map((v) => ({
      url: `${SITE}/industries/${v.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...workSlugs.map((slug) => ({
      url: `${SITE}/work/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    ...labSlugs.map((slug) => ({
      url: `${SITE}/lab/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
