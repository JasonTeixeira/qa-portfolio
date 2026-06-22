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
import { resolveWikiLinks } from '@/lib/seo/internal-links'
import { localizedAlternates } from '@/lib/i18n/alternates'
import { getLocale } from '@/lib/i18n/server'
import { getTranslatedPost, getTranslatedLocales } from '@/lib/blog-i18n'
import { CLUSTERS } from '@/data/content/clusters'
import { ArticleConversionSystem } from '@/components/blog/article-conversion-system'
import { ArticleRouteCards } from '@/components/blog/article-route-cards'

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
  const locale = await getLocale()
  const translation = getTranslatedPost(post.slug, locale)
  const title = translation?.title || post.title
  const excerpt = translation?.excerpt || post.excerpt
  // Every post gets a social card: the cover image if set, else a generated one.
  const ogImage = post.coverImage
    ? (post.coverImage.startsWith('http') ? post.coverImage : `${SITE}${post.coverImage}`)
    : `${SITE}/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(post.category)}`
  return {
    title: `${title} — Jason Teixeira`,
    description: excerpt,
    // Honest hreflang: only advertise locales that actually have a translation.
    alternates: localizedAlternates(`/blog/${post.slug}`, locale, undefined, getTranslatedLocales(post.slug)),
    openGraph: {
      title,
      description: excerpt,
      type: 'article',
      url: `${SITE}/blog/${post.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: excerpt,
      images: [ogImage],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Serve the machine-translated body + title when the reader's locale has one.
  const locale = await getLocale()
  const translation = getTranslatedPost(post.slug, locale)
  const displayTitle = translation?.title || post.title
  const displayExcerpt = translation?.excerpt || post.description || post.excerpt

  const rawMd = translation?.body || post.fullContent || post.content
  // Resolve [[slug]] / [[cluster/key]] in-body wiki-links into real internal links.
  const cleanedMd = resolveWikiLinks(rawMd.replace(/^\s*#\s+.+\n+/, ''), getAllBlogPosts())
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
          // FAQPage → eligible for the FAQ rich result when the post declares faq[].
          ...(post.faq?.length
            ? [{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: post.faq.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }]
            : []),
        ]}
      />

      <ReadingProgress targetSelector="#article-body" />

      <ArticleShell
        title={displayTitle}
        description={displayExcerpt}
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
        <ArticleBody html={html} cluster={cluster} currentPost={post} />
        <ArticleRouteCards
          cluster={cluster}
          currentPost={post}
          clusterPosts={clusterPosts}
        />
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
