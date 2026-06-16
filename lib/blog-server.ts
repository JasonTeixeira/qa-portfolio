import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  PostFrontmatterSchema,
  deriveClusterKey,
  deriveKeywords,
  type ClusterKey,
} from '@/lib/blog-schema'

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
  keywords: string[]
  tags: string[]
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
    const { data, content } = matter(raw)
    const parsed = PostFrontmatterSchema.safeParse(data)
    if (!parsed.success && process.env.CI) {
      throw new Error(`Invalid frontmatter in ${filename}: ${parsed.error.message}`)
    }
    const fm = parsed.success ? parsed.data : data
    const slug = fm.slug ?? filename.replace(/\.mdx?$/, '')
    const title = fm.title ?? ''
    const category = fm.category ?? 'Engineering'
    const tags = Array.isArray(fm.tags) ? fm.tags : []
    const cluster = fm.cluster ?? deriveClusterKey({ title, category, tags, slug })
    const excerpt = fm.excerpt ?? fm.description ?? ''
    return {
      id: fm.id ?? 0,
      slug,
      title,
      excerpt,
      description: fm.description ?? excerpt,
      content: content.slice(0, 200),
      fullContent: content,
      category,
      cluster,
      keywords: fm.keywords ?? deriveKeywords({ title, category, tags, cluster }),
      tags,
      date: fm.datePublished ?? fm.date ?? '2025-01-01',
      dateUpdated: fm.dateUpdated,
      readTime: fm.readTime ?? '5 min read',
      coverImage: fm.coverImage,
      canonical: fm.canonical,
      series: fm.series,
      seriesIndex: fm.seriesIndex,
    }
  } catch (error) {
    if (process.env.CI) throw error
    return null
  }
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))
  return files
    .map(parseMdxFile)
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
