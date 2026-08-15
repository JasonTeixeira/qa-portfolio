import Link from 'next/link'

/**
 * The canonical tab / sub-tab control — one component for every tabbed surface
 * (course Overview/Syllabus/Progress/Board; Progress Mastery/Activity/Certificates/
 * Evidence/Refer). Active tab gets the accent underline; the rest read soft.
 * Semantic <nav> + aria-current for keyboard/SR users. Token-driven (--ac-*).
 */
export type Tab = { href: string; label: string; key: string }

export function TabBar({
  tabs,
  active,
  ariaLabel = 'Section tabs',
  className = '',
}: {
  tabs: readonly Tab[]
  active: string
  ariaLabel?: string
  className?: string
}) {
  return (
    <nav
      className={`flex gap-1 overflow-x-auto border-b ${className}`}
      style={{ borderColor: 'var(--ac-rule)' }}
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const on = tab.key === active
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={on ? 'page' : undefined}
            className="relative whitespace-nowrap px-3 py-2.5 text-sm transition-colors"
            style={{ color: on ? 'var(--ac-ink)' : 'var(--ac-ink-soft)' }}
          >
            {tab.label}
            {on && (
              <span
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                style={{ background: 'var(--ac-accent)' }}
                aria-hidden
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
