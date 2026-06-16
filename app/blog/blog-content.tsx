'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MonoLabel, Hairline, Reveal } from '@/components/el'
import { blogPosts } from '@/lib/blogData'

const ALL_CATEGORIES = [
  'All',
  'Architecture',
  'Engineering',
  'Career',
  'Cloud Automation',
  'Trading',
  'Testing',
  'Security',
  'DevOps',
  'AI',
]

const DISPLAY_HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.06,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const sortedPosts = useMemo(
    () => [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [],
  )

  const featuredPost = sortedPosts[0]

  const filteredPosts = useMemo(() => {
    return sortedPosts.filter((post) => {
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        q === '' ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery, sortedPosts])

  const showFeatured =
    activeCategory === 'All' && searchQuery === '' && featuredPost

  const listPosts = showFeatured
    ? filteredPosts.filter((p) => p.slug !== featuredPost.slug)
    : filteredPosts

  return (
    <div className="min-h-screen" style={{ background: 'var(--sage-bg)' }}>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <header className="relative border-b border-[var(--sage-border)] pt-28 pb-14 sm:pt-32 sm:pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex items-center gap-4 mb-8">
              <MonoLabel tone="accent">{'// field notes'}</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="faint">{blogPosts.length} dispatches</MonoLabel>
            </div>
            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(2.6rem,1.4rem+4.8vw,5.5rem)]"
              style={DISPLAY_HEADING_STYLE}
            >
              The engineering <br className="hidden sm:block" />
              <em
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 0" }}
                className="not-italic"
              >
                record.
              </em>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[15px] leading-[1.75] text-[var(--sage-ink-muted)]">
              Production reports on systems, automation, AI, and the craft of
              building software that ships. Written by the engineer who built
              it — not a content team.
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── Featured / lead post ────────────────────────────────────────── */}
      {showFeatured && (
        <section
          aria-label="Featured post"
          className="border-b border-[var(--sage-border)]"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 py-12 sm:py-14">
            <Reveal>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid lg:grid-cols-[5fr_4fr] gap-0 rounded-[3px] overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-surface-1)] hover:border-[var(--sage-border-hover)] transition-[border-color] duration-200"
              >
                {/* Left: text column */}
                <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-[var(--sage-border)]">
                  <div>
                    <div className="flex items-center gap-4 mb-7">
                      <MonoLabel tone="accent">FEATURED</MonoLabel>
                      <span className="h-px flex-1 bg-[var(--sage-border)]" aria-hidden />
                      <MonoLabel tone="faint">{featuredPost.category}</MonoLabel>
                    </div>
                    <h2
                      className="text-[var(--sage-ink)] font-normal text-[clamp(1.75rem,1rem+2.2vw,2.75rem)] group-hover:text-[#0ED3CF] transition-colors duration-200"
                      style={DISPLAY_HEADING_STYLE}
                    >
                      {featuredPost.title}
                    </h2>
                    <p className="mt-5 text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] max-w-[56ch]">
                      {featuredPost.excerpt}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <MonoLabel tone="faint">{formatDate(featuredPost.date)}</MonoLabel>
                      <span className="h-3 w-px bg-[var(--sage-border-strong)]" aria-hidden />
                      <MonoLabel tone="faint">{featuredPost.readTime}</MonoLabel>
                    </div>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace] group-hover:translate-x-0.5 transition-transform duration-200 inline-flex items-center gap-2">
                      Read <span aria-hidden>→</span>
                    </span>
                  </div>
                </div>
                {/* Right: accent panel */}
                <div className="relative hidden lg:flex flex-col justify-between p-10 lg:p-12 bg-[var(--sage-surface-2)]">
                  {/* Registration ticks */}
                  <span className="absolute top-3 right-3 w-2 h-2 border-t border-r border-[var(--sage-border-strong)]" aria-hidden />
                  <span className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-[var(--sage-border-strong)]" aria-hidden />
                  <div>
                    <MonoLabel tone="faint" className="block mb-5">{'// tags'}</MonoLabel>
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-mono text-[var(--sage-ink-faint)] bg-[var(--sage-surface-3)] border border-[var(--sage-border)] px-2.5 py-1 rounded-[2px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                    <div className="text-[11px] font-mono text-[var(--sage-ink-faint)] uppercase tracking-[0.18em] mb-2">Category</div>
                    <div className="text-[28px] font-normal text-[var(--sage-ink-muted)]" style={DISPLAY_HEADING_STYLE}>
                      {featuredPost.category}
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <section
        aria-label="Filter articles"
        className="sticky top-0 z-30 border-b border-[var(--sage-border)] bg-[var(--sage-bg)]/90 backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? 'text-[11px] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-[2px] bg-[#0ED3CF] text-[#08110F] transition-colors'
                    : 'text-[11px] font-mono uppercase tracking-[0.14em] px-3 py-1.5 rounded-[2px] border border-[var(--sage-border)] text-[var(--sage-ink-faint)] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink-muted)] transition-colors'
                }
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <input
              type="search"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-3 text-[12px] text-[var(--sage-ink-muted)] placeholder:text-[var(--sage-ink-faint)] focus:outline-none focus:border-[#0ED3CF]/50 transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
              aria-label="Search articles"
            />
          </div>
        </div>
      </section>

      {/* ── Indexed post list ────────────────────────────────────────────── */}
      <main aria-label="All articles">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {listPosts.length === 0 ? (
            <div className="py-24 text-center">
              <MonoLabel tone="faint" as="p" className="mb-4">No matches</MonoLabel>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('All') }}
                className="text-[12px] font-mono uppercase tracking-[0.12em] text-[#0ED3CF] hover:text-[var(--sage-ink-muted)] transition-colors"
              >
                Clear filters →
              </button>
            </div>
          ) : (
            <ol className="divide-y divide-[var(--sage-border)]" aria-label="Article list">
              {listPosts.map((post, i) => (
                <li key={post.id} className="sage-rise" style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[5rem_1fr_auto] lg:grid-cols-[5.5rem_1fr_auto_7rem] gap-x-5 sm:gap-x-8 items-start py-6 hover:bg-[var(--sage-surface-1)] -mx-5 px-5 sm:-mx-8 sm:px-8 transition-colors duration-150"
                  >
                    {/* Index number */}
                    <span className="hidden sm:block pt-0.5 tabular-nums text-[11px] font-mono text-[var(--sage-ink-faint)] tracking-[0.12em]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {/* Title + excerpt */}
                    <div className="min-w-0">
                      <h2
                        className="text-[var(--sage-ink)] font-normal text-[clamp(1.05rem,0.9rem+0.5vw,1.25rem)] leading-[1.3] group-hover:text-[#0ED3CF] transition-colors duration-200"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                          letterSpacing: '-0.018em',
                        }}
                      >
                        {post.title}
                      </h2>
                      <p className="mt-1.5 text-[13px] leading-[1.6] text-[var(--sage-ink-faint)] line-clamp-2 max-w-[68ch]">
                        {post.excerpt}
                      </p>
                      {/* Tags — mobile visible */}
                      <div className="mt-3 flex flex-wrap gap-1.5 lg:hidden">
                        <MonoLabel tone="accent">{post.category}</MonoLabel>
                        <span className="text-[var(--sage-ink-faint)]">·</span>
                        <MonoLabel tone="faint">{post.readTime}</MonoLabel>
                        <span className="text-[var(--sage-ink-faint)]">·</span>
                        <MonoLabel tone="faint">{formatDate(post.date)}</MonoLabel>
                      </div>
                    </div>
                    {/* Metadata column: category + read time (desktop) */}
                    <div className="hidden lg:flex flex-col items-end gap-1 pt-0.5 text-right shrink-0">
                      <MonoLabel tone="accent">{post.category}</MonoLabel>
                      <MonoLabel tone="faint">{post.readTime}</MonoLabel>
                    </div>
                    {/* Date (desktop) */}
                    <div className="hidden lg:block pt-0.5 text-right shrink-0">
                      <MonoLabel tone="faint" className="tabular-nums">{formatDate(post.date)}</MonoLabel>
                    </div>
                    {/* Arrow (always) */}
                    <span
                      aria-hidden
                      className="col-start-3 row-start-1 sm:col-start-auto pt-0.5 text-[var(--sage-ink-faint)] text-sm group-hover:text-[#0ED3CF] group-hover:translate-x-0.5 transition-all duration-200"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ── Footer count ─────────────────────────────────────────────── */}
        {listPosts.length > 0 && (
          <div className="border-t border-[var(--sage-border)] mt-0 py-6">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 flex items-center gap-4">
              <MonoLabel tone="faint">
                {searchQuery || activeCategory !== 'All'
                  ? `${listPosts.length} article${listPosts.length !== 1 ? 's' : ''} found`
                  : `${blogPosts.length} articles in the archive`}
              </MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="faint">sageideas.dev</MonoLabel>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
