import Link from 'next/link'
import type { ReactNode } from 'react'
import { Hairline, MonoLabel } from '@/components/el'
import { ShareRow } from '@/components/blog/share-row'
import { AuthorByline } from '@/components/blog/author-byline'
import { Toc } from '@/components/blog/toc'
import { PrevNextNav } from '@/components/blog/prev-next-nav'
import { SeriesPill } from '@/components/blog/series-pill'
import type { TocNode } from '@/lib/blog-toc'

interface Adjacent {
  slug: string
  title: string
}

export interface ArticleShellProps {
  title: string
  description: string
  category: string
  clusterLabel: string
  clusterHref: string
  series?: string
  seriesIndex?: number
  datePublished: string
  dateUpdated?: string
  readTime: string
  tags: string[]
  postUrl: string
  toc: TocNode[]
  prev?: Adjacent
  next?: Adjacent
  children: ReactNode
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

export function ArticleShell({
  title,
  description,
  category,
  clusterLabel,
  clusterHref,
  series,
  seriesIndex,
  datePublished,
  dateUpdated,
  readTime,
  tags,
  postUrl,
  toc,
  prev,
  next,
  children,
}: ArticleShellProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--sage-bg)' }}>
      <div className="border-b border-[var(--sage-border)] pt-24 sm:pt-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 py-4">
            <Link href="/"><MonoLabel tone="faint">Home</MonoLabel></Link>
            <MonoLabel tone="faint">/</MonoLabel>
            <Link href="/blog"><MonoLabel tone="faint">Blog</MonoLabel></Link>
            <MonoLabel tone="faint">/</MonoLabel>
            <Link href={clusterHref}><MonoLabel tone="faint">{clusterLabel}</MonoLabel></Link>
          </nav>
        </div>
      </div>

      <header className="border-b border-[var(--sage-border)]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <div className="mb-8 flex items-center gap-4">
              <MonoLabel tone="accent">{category}</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="faint">{readTime}</MonoLabel>
            </div>
            <SeriesPill series={series} index={seriesIndex} />
            <h1
              className="mt-4 text-[clamp(2rem,1.2rem+3.1vw,3.7rem)] font-normal text-[var(--sage-ink)]"
              style={DISPLAY_STYLE}
            >
              {title}
            </h1>
            <p className="mt-5 max-w-[62ch] text-[16px] leading-[1.72] text-[var(--sage-ink-muted)] sm:text-[18px]">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--sage-border)] pt-6">
              <MonoLabel tone="faint">By Jason Teixeira</MonoLabel>
              <span className="hidden h-3 w-px bg-[var(--sage-border-strong)] sm:block" aria-hidden />
              <MonoLabel tone="faint" className="tabular-nums">{formatDate(datePublished)}</MonoLabel>
              {dateUpdated && dateUpdated !== datePublished ? (
                <>
                  <span className="hidden h-3 w-px bg-[var(--sage-border-strong)] sm:block" aria-hidden />
                  <MonoLabel tone="faint">Updated {formatDate(dateUpdated)}</MonoLabel>
                </>
              ) : null}
            </div>
            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--sage-ink-faint)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <ShareRow url={postUrl} title={title} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          {toc.length > 0 && (
            <details className="mb-8 rounded-[4px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-4 lg:hidden">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)]">
                On this page
              </summary>
              <div className="mt-4">
                <Toc nodes={toc} />
              </div>
            </details>
          )}
          <article aria-label={title} className="max-w-3xl">
            {children}
          </article>
          <div className="mt-12 max-w-3xl">
            <PrevNextNav prev={prev} next={next} />
          </div>
          <section aria-label="Author" className="max-w-3xl py-12">
            <AuthorByline />
          </section>
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Toc nodes={toc} />
            <div className="mt-8 rounded-[4px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-4">
              <MonoLabel tone="accent">Cluster</MonoLabel>
              <Link href={clusterHref} className="mt-2 block text-[14px] leading-snug text-[var(--sage-ink-muted)] hover:text-[#3D5AFE]">
                {clusterLabel} -&gt;
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
