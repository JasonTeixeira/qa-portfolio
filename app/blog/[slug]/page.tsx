import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getAllBlogPosts, getAdjacentBlogPosts, getBlogPostsByCluster } from '@/lib/blog-server'
import { renderMarkdownToHtml } from '@/lib/blogMarkdown'
import { StickyCta } from '@/components/sticky-cta'
import { ArticleBody } from '@/components/blog/article-body'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { RelatedPosts } from '@/components/blog/related-posts'
import { ArticleShell } from '@/components/blog/article-shell'
import { JsonLd } from '@/components/json-ld'
import { injectHeadingIds } from '@/lib/blog-toc'
import { buildArticle, buildBreadcrumbList } from '@/lib/seo/jsonld'
import { CLUSTERS } from '@/data/content/clusters'
import { ArticleConversionSystem } from '@/components/blog/article-conversion-system'

interface PageProps {
  params: Promise<{ slug: string }>
}

const SITE = 'https://www.sageideas.dev'

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) return { title: 'Post not found' }
  return {
    title: `${post.title} — Jason Teixeira`,
    description: post.excerpt,
    alternates: { canonical: `${SITE}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `${SITE}/blog/${post.slug}`,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      publishedTime: post.date,
      tags: post.tags,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const rawMd = post.fullContent || post.content
  const cleanedMd = rawMd.replace(/^\s*#\s+.+\n+/, '')
  const rendered = await renderMarkdownToHtml(cleanedMd)
  const { html, toc } = injectHeadingIds(rendered)
  const postUrl = `${SITE}/blog/${post.slug}`
  const adjacent = getAdjacentBlogPosts(post.slug)
  const cluster = CLUSTERS[post.cluster]
  const clusterPosts = getBlogPostsByCluster(post.cluster)

  return (
    <>
      <JsonLd
        data={[
          buildArticle({
            headline: post.title,
            description: post.description || post.excerpt,
            datePublished: post.date,
            dateModified: post.dateUpdated,
            url: postUrl,
            imageUrl: post.coverImage ? `${SITE}${post.coverImage}` : undefined,
            keywords: post.keywords,
            articleSection: post.category,
          }),
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Blog', url: `${SITE}/blog` },
            { name: cluster.title, url: `${SITE}/topics/${cluster.slug}` },
            { name: post.title, url: postUrl },
          ]),
        ]}
      />

      <ReadingProgress targetSelector="#article-body" />

      <ArticleShell
        title={post.title}
        description={post.description || post.excerpt}
        category={post.category}
        clusterLabel={cluster.title}
        clusterHref={`/topics/${cluster.slug}`}
        series={post.series}
        seriesIndex={post.seriesIndex}
        datePublished={post.date}
        dateUpdated={post.dateUpdated}
        readTime={post.readTime}
        tags={post.tags}
        postUrl={postUrl}
        toc={toc}
        prev={adjacent.prev}
        next={adjacent.next}
      >
        <ArticleBody html={html} />
        <ArticleConversionSystem
          cluster={cluster}
          currentPost={post}
          clusterPosts={clusterPosts}
        />
      </ArticleShell>

      <section
        aria-label="Related articles"
        className="mx-auto max-w-6xl px-5 pb-12 sm:px-8"
      >
        <div className="max-w-3xl">
          <RelatedPosts currentSlug={post.slug} posts={getAllBlogPosts()} />
        </div>
      </section>

      <StickyCta
        pitch={`Reading ${cluster.title}? Route it into a real build.`}
        ctaLabel="Book a 30-min call"
        ctaHref="/book"
      />
    </>
  )
}
