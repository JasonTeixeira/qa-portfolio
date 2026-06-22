import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllBlogPosts } from '@/lib/blog-server'
import { CLUSTERS } from '@/data/content/clusters'
import { JsonLd } from '@/components/json-ld'
import { buildBreadcrumbList, buildCollectionPage } from '@/lib/seo/jsonld'

interface PageProps {
  params: Promise<{ n: string }>
}

const SITE = 'https://www.sageideas.dev'
// Crawlable archive: every post is reachable via a static, indexable page so the
// "all posts live in a client-only Load more" gap is closed. See BLOG_SEO_ENGINE §5.
const PER_PAGE = 12

// Only the generated pages exist; any out-of-range page 404s instead of SSR-ing.
export const dynamicParams = false

function totalPages() {
  return Math.max(1, Math.ceil(getAllBlogPosts().length / PER_PAGE))
}

export function generateStaticParams() {
  return Array.from({ length: totalPages() }, (_, i) => ({ n: String(i + 1) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params
  const page = Number(n)
  const pages = totalPages()
  if (!Number.isInteger(page) || page < 1 || page > pages) return { title: 'Page not found' }

  const title = page === 1 ? 'All Articles — Sage Ideas Journal' : `All Articles — Page ${page} of ${pages}`
  const description = `Field notes on AI engineering, infrastructure, testing, and solo studio operations — page ${page} of ${pages}.`
  // Page 1 is a duplicate of /blog; canonical it there to consolidate signals.
  const canonical = page === 1 ? `${SITE}/blog` : `${SITE}/blog/page/${page}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
    robots: { index: true, follow: true },
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function BlogArchivePage({ params }: PageProps) {
  const { n } = await params
  const page = Number(n)
  const pages = totalPages()
  if (!Number.isInteger(page) || page < 1 || page > pages) notFound()

  const all = getAllBlogPosts()
  const start = (page - 1) * PER_PAGE
  const posts = all.slice(start, start + PER_PAGE)
  const archiveUrl = `${SITE}/blog/page/${page}`
  const prevHref = page === 2 ? '/blog' : page > 2 ? `/blog/page/${page - 1}` : null
  const nextHref = page < pages ? `/blog/page/${page + 1}` : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--sage-bg)' }}>
      <JsonLd
        data={[
          buildCollectionPage({
            name: `Sage Ideas Journal — Page ${page}`,
            description: 'Field notes on AI engineering, infrastructure, and solo studio operations.',
            url: archiveUrl,
            itemUrls: posts.map((post) => `${SITE}/blog/${post.slug}`),
          }),
          buildBreadcrumbList([
            { name: 'Home', url: SITE },
            { name: 'Blog', url: `${SITE}/blog` },
            { name: `Page ${page}`, url: archiveUrl },
          ]),
        ]}
      />

      <header className="border-b border-[var(--sage-border)] pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
            <Link href="/" className="hover:text-[var(--sage-ink-muted)]">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="hover:text-[var(--sage-ink-muted)]">Blog</Link>
            <span aria-hidden>/</span>
            <span className="text-[var(--sage-ink)]">Page {page}</span>
          </nav>
          <h1 className="mt-6 text-[clamp(2rem,1.2rem+3vw,3.2rem)] font-normal text-[var(--sage-ink)]">
            All articles
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.7] text-[var(--sage-ink-muted)]">
            The full archive, newest first. Page {page} of {pages} — {all.length} articles across {Object.keys(CLUSTERS).length} topic clusters.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <ol className="divide-y divide-[var(--sage-border)] border-y border-[var(--sage-border)]">
          {posts.map((post, index) => {
            const cluster = CLUSTERS[post.cluster]
            return (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-4 py-6 transition-colors hover:bg-[rgba(61,90,254,0.06)] sm:grid-cols-[3.5rem_1fr_auto] sm:px-4"
                >
                  <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--sage-accent-readable)]">
                    {String(start + index + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                      {cluster?.title ?? post.category}
                    </span>
                    <span className="mt-1 block text-xl font-semibold text-[var(--sage-ink)] group-hover:text-[var(--sage-accent-readable)]">
                      {post.title}
                    </span>
                    <span className="mt-2 block max-w-[70ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                      {post.excerpt}
                    </span>
                  </span>
                  <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                    {formatDate(post.date)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>

        <nav
          aria-label="Pagination"
          className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--sage-border)] pt-8"
        >
          {prevHref ? (
            <Link
              href={prevHref}
              rel="prev"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sage-border)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-accent)] hover:text-[var(--sage-accent-readable)]"
            >
              &lt;- Newer
            </Link>
          ) : (
            <span aria-hidden />
          )}

          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
            {page} / {pages}
          </span>

          {nextHref ? (
            <Link
              href={nextHref}
              rel="next"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sage-border)] px-4 py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] transition-colors hover:border-[var(--sage-accent)] hover:text-[var(--sage-accent-readable)]"
            >
              Older -&gt;
            </Link>
          ) : (
            <span aria-hidden />
          )}
        </nav>
      </main>
    </div>
  )
}
