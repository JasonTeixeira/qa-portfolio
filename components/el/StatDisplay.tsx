import * as React from 'react'
import { cn } from '@/lib/utils'
import { CountUp } from '@/components/motion/CountUp'

export interface Stat {
  /** The headline value, e.g. "185". */
  value: string
  /** The label beneath it, e.g. "DB tables". */
  label: string
}

export interface StatDisplayProps {
  stats: Stat[]
  /** Number of columns. Default derived from stat count (capped at 4). */
  columns?: number
  className?: string
}

const COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
}

/**
 * StatDisplay — a ruled, hairline-gridded row of receipts. Derived from the
 * hero's trust strip: tabular mono values over small-caps labels, joined by a
 * 1px grid so the whole reads as one instrument panel. Values count up once on
 * scroll-in (reduced-motion safe) — an institutional odometer, not theatre.
 */
export function StatDisplay({ stats, columns, className }: StatDisplayProps) {
  const colCount = columns ?? Math.min(stats.length, 4)
  return (
    <dl
      className={cn(
        'grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] [font-family:var(--font-mono),ui-monospace,monospace]',
        COLS[colCount] ?? 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col gap-2 bg-[var(--sage-surface-1)] px-5 py-6 sm:px-6 sm:py-7"
        >
          <dt className="text-[clamp(1.75rem,1rem+2vw,2.5rem)] leading-none tabular-nums text-[var(--sage-ink)]">
            <CountUp value={stat.value} />
          </dt>
          <dd className="text-[10px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)]">
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}
