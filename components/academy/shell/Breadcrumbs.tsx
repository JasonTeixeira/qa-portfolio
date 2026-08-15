import Link from 'next/link'
import { Icon } from '@/components/academy/ui/Icon'

/**
 * The canonical "you are here" trail for deep academy pages — Courses › Course › Lesson.
 * Token-driven (--ac-*), AA contrast, keyboard-reachable links, and the current page
 * marked with aria-current so screen-reader users know where the trail ends.
 *
 * Course/Lesson/Lab pages own their own files (other agents) — import this and drop it
 * near the top of the page, e.g.:
 *
 *   <Breadcrumbs
 *     items={[
 *       { label: 'Courses', href: '/academy/catalog' },
 *       { label: course.title, href: `/academy/course/${course.slug}` },
 *       { label: lesson.title },        // last item = current page, no href
 *     ]}
 *   />
 *
 * The last item is treated as the current page: rendered as plain text with
 * aria-current="page" rather than a link.
 */
export type Crumb = { label: string; href?: string }

export function Breadcrumbs({
  items,
  className = '',
  ariaLabel = 'Breadcrumb',
}: {
  items: readonly Crumb[]
  className?: string
  ariaLabel?: string
}) {
  if (items.length === 0) return null

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--ac-ink-faint)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <Icon name="chevron-right" size={12} className="shrink-0 text-[color:var(--ac-ink-faint)]" />
              ) : null}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-[color:var(--ac-ink-soft)]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-[4px] transition-colors hover:text-[var(--ac-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ac-accent)]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
