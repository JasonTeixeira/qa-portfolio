import Link from 'next/link'

type Adjacent = { slug: string; title: string }

export function PrevNextNav({ prev, next }: { prev?: Adjacent; next?: Adjacent }) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="Adjacent articles"
      className="grid gap-3 border-y border-[var(--sage-border)] py-6 sm:grid-cols-2"
    >
      <AdjacentLink label="Previous" item={prev} direction="prev" />
      <AdjacentLink label="Next" item={next} direction="next" />
    </nav>
  )
}

function AdjacentLink({
  label,
  item,
  direction,
}: {
  label: string
  item?: Adjacent
  direction: 'prev' | 'next'
}) {
  if (!item) return <div aria-hidden className="hidden sm:block" />

  return (
    <Link
      href={`/blog/${item.slug}`}
      className={[
        'group block rounded-[4px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-4 transition-colors hover:border-[var(--sage-border-hover)]',
        direction === 'next' ? 'sm:text-right' : '',
      ].join(' ')}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
        {direction === 'prev' ? '< ' : ''}
        {label}
        {direction === 'next' ? ' >' : ''}
      </span>
      <span className="mt-2 block text-[15px] leading-snug text-[var(--sage-ink)] group-hover:text-[#3D5AFE]">
        {item.title}
      </span>
    </Link>
  )
}
