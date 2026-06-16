export function SeriesPill({ series, index }: { series?: string; index?: number }) {
  if (!series) return null

  return (
    <span className="inline-flex items-center rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
      {series}
      {index ? ` / ${String(index).padStart(2, '0')}` : ''}
    </span>
  )
}
