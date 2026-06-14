import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-server'
import { renderMarkdownToHtml } from '@/lib/blogMarkdown'
import { StickyCta } from '@/components/sticky-cta'
import { ShareRow } from '@/components/blog/share-row'
import { ArticleBody } from '@/components/blog/article-body'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { RelatedPosts } from '@/components/blog/related-posts'
import { AuthorByline } from '@/components/blog/author-byline'
import { MonoLabel, Hairline } from '@/components/el'

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

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.026em',
  lineHeight: 1.06,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const rawMd = post.fullContent || post.content
  const cleanedMd = rawMd.replace(/^\s*#\s+.+\n+/, '')
  const html = await renderMarkdownToHtml(cleanedMd)
  const postUrl = `${SITE}/blog/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: 'Jason Teixeira',
      url: `${SITE}/founder`,
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Organization',
      name: 'Sage Ideas LLC',
      url: SITE,
    },
    mainEntityOfPage: postUrl,
    keywords: post.tags.join(', '),
    articleSection: post.category,
    image: post.coverImage ? `${SITE}${post.coverImage}` : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress targetSelector="#article-body" />

      <div className="min-h-screen" style={{ background: 'var(--sage-bg)' }}>

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <div className="pt-24 sm:pt-28 border-b border-[var(--sage-border)]">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 pb-0">
            <nav aria-label="Breadcrumb" className="py-4 flex items-center gap-2">
              <Link href="/">
                <MonoLabel tone="faint" className="hover:text-[var(--sage-ink-muted)] transition-colors">
                  Home
                </MonoLabel>
              </Link>
              <MonoLabel tone="faint">/</MonoLabel>
              <Link href="/blog">
                <MonoLabel tone="faint" className="hover:text-[var(--sage-ink-muted)] transition-colors">
                  Blog
                </MonoLabel>
              </Link>
              <MonoLabel tone="faint">/</MonoLabel>
              <MonoLabel tone="faint" className="truncate max-w-xs">{post.category}</MonoLabel>
            </nav>
          </div>
        </div>

        {/* ── Article title block ─────────────────────────────────────── */}
        <header className="border-b border-[var(--sage-border)]">
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-12 sm:py-16">

            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-8">
              <MonoLabel tone="accent">{post.category}</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="faint">{post.readTime}</MonoLabel>
            </div>

            {/* Title */}
            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(1.9rem,1.1rem+2.8vw,3.25rem)]"
              style={DISPLAY_STYLE}
            >
              {post.title}
            </h1>

            {/* Lede */}
            {post.excerpt && (
              <p className="mt-5 text-[16px] sm:text-[17px] leading-[1.7] text-[var(--sage-ink-muted)] max-w-[58ch]">
                {post.excerpt}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-8 pt-6 border-t border-[var(--sage-border)] flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-3">
                <MonoLabel tone="faint">By</MonoLabel>
                <Link href="/founder">
                  <MonoLabel tone="muted" className="hover:text-[#0ED3CF] transition-colors">
                    Jason Teixeira
                  </MonoLabel>
                </Link>
              </div>
              <span className="hidden sm:block h-3 w-px bg-[var(--sage-border-strong)]" aria-hidden />
              <MonoLabel tone="faint" className="tabular-nums">{formatDate(post.date)}</MonoLabel>
              <span className="hidden sm:block h-3 w-px bg-[var(--sage-border-strong)]" aria-hidden />
              <MonoLabel tone="faint">{post.readTime}</MonoLabel>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-mono text-[var(--sage-ink-faint)] bg-[var(--sage-surface-2)] border border-[var(--sage-border)] px-2.5 py-1 rounded-[2px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Share row */}
            <div className="mt-6">
              <ShareRow url={postUrl} title={post.title} />
            </div>
          </div>
        </header>

        {/* ── Article body ────────────────────────────────────────────── */}
        <article
          aria-label={post.title}
          className="mx-auto max-w-3xl px-5 sm:px-8 py-12 sm:py-16"
        >
          <ArticleBody html={html} />
        </article>

        {/* ── Hairline section break ──────────────────────────────────── */}
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Hairline accentLead />
        </div>

        {/* ── Related posts ───────────────────────────────────────────── */}
        <section
          aria-label="Related articles"
          className="mx-auto max-w-3xl px-5 sm:px-8 py-12 sm:py-14"
        >
          <RelatedPosts currentSlug={post.slug} posts={getAllBlogPosts()} />
        </section>

        {/* ── Author byline ────────────────────────────────────────────── */}
        <section
          aria-label="Author"
          className="mx-auto max-w-3xl px-5 sm:px-8 pb-12"
        >
          <AuthorByline />
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────── */}
        <section
          aria-label="Call to action"
          className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)]"
        >
          <div className="mx-auto max-w-3xl px-5 sm:px-8 py-14 sm:py-16">
            <div className="flex items-center gap-4 mb-8">
              <MonoLabel tone="accent">// next step</MonoLabel>
              <Hairline className="flex-1" />
            </div>
            <h3
              className="text-[var(--sage-ink)] font-normal text-[clamp(1.5rem,1rem+1.5vw,2.25rem)] mb-4"
              style={DISPLAY_STYLE}
            >
              Want to see this in action?
            </h3>
            <p className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] mb-8 max-w-[50ch]">
              Check out the projects and case studies behind these articles.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/work"
                className="group inline-flex h-11 items-center gap-2.5 rounded-[3px] bg-[#0ED3CF] px-6 text-[13px] font-medium uppercase tracking-[0.08em] text-[#08110F] transition-[background-color,box-shadow] duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[#33EBE8] hover:shadow-[0_0_24px_-4px_rgba(14,211,207,0.5)]"
              >
                View projects <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
              <Link
                href="/contact"
                className="group inline-flex h-11 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
              >
                Book a call <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>

        <StickyCta
          pitch="Like what you read? Let's build something."
          ctaLabel="Book a 30-min call"
          ctaHref="/contact"
        />
      </div>
    </>
  )
}
