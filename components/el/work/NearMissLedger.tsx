import * as React from 'react'
import type { AlmostHappened } from '@/data/work/case-extras'

interface NearMissLedgerProps {
  items: AlmostHappened[]
}

/**
 * NearMissLedger — Engineered Luxury restyle of the "what almost happened"
 * honesty block. A ruled before / after / cost diff on the surface ramp:
 * coral for the trap, lime for the fix, teal for the cost. Hairline-divided,
 * mono-labelled, no gradients-as-decoration. Server component, zero client JS.
 */
export function NearMissLedger({ items }: NearMissLedgerProps) {
  return (
    <div className="not-prose flex flex-col gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-5 py-2.5">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--sage-coral)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'// near-miss · '}
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              diff
            </span>
          </div>

          <div className="divide-y divide-[var(--sage-border)]">
            {/* Before */}
            <div className="flex gap-4 px-5 py-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[var(--sage-coral)]/40 bg-[var(--sage-coral)]/10 text-[11px] leading-none text-[var(--sage-coral)] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                −
              </span>
              <p className="text-sm leading-relaxed text-[var(--sage-ink-muted)]">
                <span className="mr-2 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-coral)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  before
                </span>
                {item.before}
              </p>
            </div>

            {/* After */}
            <div className="flex gap-4 px-5 py-4">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[var(--sage-lime)]/40 bg-[var(--sage-lime)]/10 text-[11px] leading-none text-[var(--sage-lime)] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                +
              </span>
              <p className="text-sm leading-relaxed text-[var(--sage-ink)]">
                <span className="mr-2 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-lime)] [font-family:var(--font-mono),ui-monospace,monospace]">
                  after
                </span>
                {item.after}
              </p>
            </div>

            {/* Cost */}
            <div className="flex gap-4 bg-[var(--sage-surface-1)] px-5 py-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] border border-[#0ED3CF]/40 bg-[#0ED3CF]/10 text-[11px] leading-none text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                $
              </span>
              <p className="text-xs leading-relaxed text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
                <span className="mr-2 uppercase tracking-[0.18em] text-[var(--sage-ink-faint)]">
                  cost
                </span>
                {item.cost}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
