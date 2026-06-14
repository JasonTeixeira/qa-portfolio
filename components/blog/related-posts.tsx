import Link from 'next/link'
import { MonoLabel, Hairline } from '@/components/el'
import type { BlogPost } from '@/lib/blogData'

interface RelatedPostsProps {
  currentSlug: string
  posts: BlogPost[]
}

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.018em',
  lineHeight: 1.2,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function RelatedPosts({ currentSlug, posts }: RelatedPostsProps) {
  const current = posts.find((p) => p.slug === currentSlug)
  if (!current) return null

  const sameCategory = posts.filter(
    (p) => p.slug !== currentSlug && p.category === current.category,
  )
  const tagSet = new Set(current.tags)
  const sameTags = posts.filter(
    (p) =>
      p.slug !== currentSlug &&
      p.category !== current.category &&
      p.tags.some((t) => tagSet.has(t)),
  )
  const related = [...sameCategory, ...sameTags].slice(0, 3)
  if (related.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <MonoLabel tone="accent">// related reading</MonoLabel>
        <Hairline className="flex-1" />
        <Link href="/blog">
          <MonoLabel tone="faint" className="hover:text-[var(--sage-ink-muted)] transition-colors">
            All posts →
          </MonoLabel>
        </Link>
      </div>
      <ol className="space-y-0 divide-y divide-[var(--sage-border)] border border-[var(--sage-border)] rounded-[3px]">
        {related.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group flex items-start gap-5 px-5 py-5 hover:bg-[var(--sage-surface-1)] transition-colors duration-150"
            >
              <span className="shrink-0 tabular-nums text-[11px] font-mono text-[var(--sage-ink-faint)] tracking-[0.12em] pt-0.5">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <MonoLabel tone="accent">{p.category}</MonoLabel>
                  <MonoLabel tone="faint">{formatDate(p.date)}</MonoLabel>
                  <MonoLabel tone="faint">{p.readTime}</MonoLabel>
                </div>
                <h4
                  className="text-[var(--sage-ink)] font-normal text-[1.0625rem] group-hover:text-[#0ED3CF] transition-colors duration-200 line-clamp-2"
                  style={DISPLAY_STYLE}
                >
                  {p.title}
                </h4>
              </div>
              <span
                aria-hidden
                className="shrink-0 pt-0.5 text-[var(--sage-ink-faint)] group-hover:text-[#0ED3CF] group-hover:translate-x-0.5 transition-all duration-200"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
