import { z } from 'zod'

export const ClusterKeys = [
  'testing-qa',
  'ai-engineering',
  'fintech-trading',
  'cloud-infra',
  'solo-studio',
  'product-systems',
] as const

export type ClusterKey = (typeof ClusterKeys)[number]

export const PostFrontmatterSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  title: z.string().min(10).max(140),
  excerpt: z.string().min(40).max(320).optional(),
  description: z.string().min(40).max(320).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  datePublished: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category: z.string().min(2).default('Engineering'),
  cluster: z.enum(ClusterKeys).optional(),
  subCluster: z.string().optional(),
  keywords: z.array(z.string()).min(1).max(12).optional(),
  tags: z.array(z.string()).default([]),
  // Internal-linking contract (see BLOG_SEO_ENGINE.md §2). Curated overrides for
  // the auto cluster-first linking; empty/absent = fully automatic.
  related: z.array(z.string()).optional(),
  relatedClusters: z.array(z.enum(ClusterKeys)).optional(),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  readTime: z.string().regex(/^\d+ min read$/).optional(),
  coverImage: z.string().startsWith('/').optional(),
  canonical: z.string().url().optional(),
  author: z.string().default('Jason Teixeira'),
  series: z.string().optional(),
  seriesIndex: z.number().int().positive().optional(),
  useMdx: z.boolean().default(false),
})

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>

const clusterMatchers: Array<{ cluster: ClusterKey; re: RegExp }> = [
  { cluster: 'testing-qa', re: /\b(test|testing|qa|selenium|appium|coverage|flaky|owasp|security scanner)\b/i },
  { cluster: 'fintech-trading', re: /\b(trading|fintech|risk|portfolio|backtesting|nexural|alphastream|futures|indicator|var|cvar)\b/i },
  { cluster: 'cloud-infra', re: /\b(aws|cloud|terraform|docker|ci\/cd|oidc|supabase|postgres|infrastructure|monitoring|websocket)\b/i },
  { cluster: 'ai-engineering', re: /\b(ai|agent|gpt|llm|discord bot|automation)\b/i },
  { cluster: 'solo-studio', re: /\b(solo|career|llc|interview|recruiter|building in public|book|portfolio)\b/i },
]

export function deriveClusterKey(input: {
  title?: string
  category?: string
  tags?: string[]
  slug?: string
}): ClusterKey {
  const haystack = [input.title, input.category, input.slug, ...(input.tags ?? [])]
    .filter(Boolean)
    .join(' ')

  for (const matcher of clusterMatchers) {
    if (matcher.re.test(haystack)) return matcher.cluster
  }

  return 'product-systems'
}

export function deriveKeywords(input: {
  title: string
  category: string
  tags: string[]
  cluster: ClusterKey
}): string[] {
  const base = [
    ...input.tags,
    input.category,
    input.cluster.replace(/-/g, ' '),
    ...input.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 4),
  ]

  return Array.from(new Set(base.map((item) => item.trim()).filter(Boolean))).slice(0, 10)
}
