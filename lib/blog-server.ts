import fs from 'fs'
import path from 'path'
import {
  PostFrontmatterSchema,
  deriveClusterKey,
  deriveKeywords,
  type ClusterKey,
} from '@/lib/blog-schema'
import { parseFrontmatter } from '@/lib/frontmatter'

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  description: string
  content: string
  fullContent: string
  category: string
  cluster: ClusterKey
  subCluster?: string
  keywords: string[]
  tags: string[]
  /** Curated sibling slugs (overrides auto cluster-first linking). */
  related?: string[]
  /** Cross-cluster bridges for the link graph. */
  relatedClusters?: ClusterKey[]
  faq?: { q: string; a: string }[]
  date: string
  dateUpdated?: string
  readTime: string
  coverImage?: string
  canonical?: string
  series?: string
  seriesIndex?: number
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function parseMdxFile(filename: string): BlogPost | null {
  const filepath = path.join(BLOG_DIR, filename)
  try {
    const raw = fs.readFileSync(filepath, 'utf-8')
    const { data, content } = parseFrontmatter(raw)
    const parsed = PostFrontmatterSchema.safeParse(data)
    if (!parsed.success && process.env.CI) {
      throw new Error(`Invalid frontmatter in ${filename}: ${parsed.error.message}`)
    }
    const fm = parsed.success ? parsed.data : data
    const slug = stringValue(fm.slug) ?? filename.replace(/\.mdx?$/, '')
    const title = stringValue(fm.title) ?? ''
    const category = stringValue(fm.category) ?? 'Engineering'
    const tags = stringArray(fm.tags)
    const cluster = clusterValue(fm.cluster) ?? deriveClusterKey({ title, category, tags, slug })
    const excerpt = stringValue(fm.excerpt) ?? stringValue(fm.description) ?? ''
    return {
      id: numberValue(fm.id) ?? 0,
      slug,
      title,
      excerpt,
      description: stringValue(fm.description) ?? excerpt,
      content: content.slice(0, 200),
      fullContent: content,
      category,
      cluster,
      subCluster: stringValue(fm.subCluster),
      related: nonEmptyStringArray(fm.related),
      relatedClusters: nonEmptyStringArray(fm.relatedClusters)?.filter((c): c is ClusterKey => clusterValue(c) !== undefined),
      faq: Array.isArray(fm.faq) ? (fm.faq as { q: string; a: string }[]) : undefined,
      keywords: nonEmptyStringArray(fm.keywords) ?? deriveKeywords({ title, category, tags, cluster }),
      tags,
      date: stringValue(fm.datePublished) ?? stringValue(fm.date) ?? '2025-01-01',
      dateUpdated: stringValue(fm.dateUpdated),
      readTime: stringValue(fm.readTime) ?? '5 min read',
      coverImage: stringValue(fm.coverImage),
      canonical: stringValue(fm.canonical),
      series: stringValue(fm.series),
      seriesIndex: numberValue(fm.seriesIndex),
    }
  } catch (error) {
    if (process.env.CI) throw error
    return null
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function nonEmptyStringArray(value: unknown): string[] | undefined {
  const items = stringArray(value)
  return items.length > 0 ? items : undefined
}

function clusterValue(value: unknown): ClusterKey | undefined {
  const clusters: readonly ClusterKey[] = [
    'testing-qa',
    'ai-engineering',
    'fintech-trading',
    'cloud-infra',
    'solo-studio',
    'product-systems',
  ]
  return typeof value === 'string' && clusters.includes(value as ClusterKey)
    ? (value as ClusterKey)
    : undefined
}

/**
 * Parse-once content cache (the "fast builds at 1000+ posts" lever, BLOG_SEO_ENGINE §5).
 * `getAllBlogPosts()` is called 10+ times per build (sitemap, RSS, every page, feeds),
 * and each call previously re-read + YAML-parsed + Zod-validated every file. We cache the
 * parsed array keyed on a cheap directory signature (filename:mtime), so repeat calls are
 * O(1) yet the cache still invalidates the instant any post is added, removed, or edited —
 * correct in dev, fast in prod. This delivers Velite's core benefit without rewiring every
 * consumer or adding a build step; a full content-layer migration is the upgrade path once
 * post volume or an image pipeline justifies it.
 */
let postsCache: { signature: string; posts: BlogPost[] } | null = null

function directorySignature(files: string[]): string {
  return files
    .map((f) => {
      try {
        return `${f}:${fs.statSync(path.join(BLOG_DIR, f)).mtimeMs}`
      } catch {
        return f
      }
    })
    .join('|')
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx')).sort()
  const signature = directorySignature(files)
  if (postsCache && postsCache.signature === signature) return postsCache.posts

  const posts = files
    .map(parseMdxFile)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  postsCache = { signature, posts }
  return posts
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const directPath = path.join(BLOG_DIR, slug + '.mdx')
  if (fs.existsSync(directPath)) {
    return parseMdxFile(slug + '.mdx') ?? undefined
  }
  return getAllBlogPosts().find((p) => p.slug === slug || String(p.id) === slug)
}

export function getBlogPostsByCluster(cluster: ClusterKey): BlogPost[] {
  return getAllBlogPosts().filter((post) => post.cluster === cluster)
}

export function getAdjacentBlogPosts(slug: string): {
  prev?: Pick<BlogPost, 'slug' | 'title'>
  next?: Pick<BlogPost, 'slug' | 'title'>
} {
  const posts = getAllBlogPosts()
  const index = posts.findIndex((post) => post.slug === slug)
  if (index === -1) return {}
  const newer = posts[index - 1]
  const older = posts[index + 1]
  return {
    prev: older ? { slug: older.slug, title: older.title } : undefined,
    next: newer ? { slug: newer.slug, title: newer.title } : undefined,
  }
}
