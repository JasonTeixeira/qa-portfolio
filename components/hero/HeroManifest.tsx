'use client'

import * as React from 'react'

/**
 * HeroManifest — the right-hand "receipts" panel, redesigned as a precise
 * engineering spec-sheet rather than a CRT terminal. Hairline-ruled rows,
 * mono metadata, a single live accent indicator. Swiss-watch, not cyberpunk.
 *
 * Decorative for screen readers (the H1 + trust strip carry the real content),
 * so the whole panel is aria-hidden; the visible data mirrors page copy.
 */

interface ManifestRow {
  index: string
  name: string
  meta: string
  status: string
}

const ROWS: ManifestRow[] = [
  { index: '01', name: 'Nexural', meta: '185 tables · 69 endpoints', status: 'SHIPPED' },
  { index: '02', name: 'AlphaStream', meta: '200+ indicators · 5 models', status: 'SHIPPED' },
  { index: '03', name: 'Jobpoise', meta: 'Stripe · Gmail · 3 tiers', status: 'SHIPPED' },
  { index: '04', name: 'Quality Telemetry', meta: '13 frameworks · CI-gated', status: 'SHIPPED' },
]

export function HeroManifest() {
  return (
    <aside
      aria-hidden
      className="relative w-full select-none [font-family:var(--font-mono),ui-monospace,monospace]"
    >
      {/* Hairline frame with corner ticks */}
      <div className="relative rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]/70 backdrop-blur-[1px]">
        <CornerTicks />

        {/* Panel header — reads like an instrument label */}
        <header className="flex items-center justify-between gap-4 border-b border-[var(--sage-border)] px-5 py-3.5">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--sage-ink-muted)]">
            manifest&nbsp;·&nbsp;shipped
          </span>
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)]">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-[#0ED3CF] [animation:status-dot_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
              <span className="absolute inset-0 rounded-full bg-[#0ED3CF]" />
            </span>
            <span className="text-[#0ED3CF]/90">live</span>
          </span>
        </header>

        {/* Ruled rows */}
        <ul className="divide-y divide-[var(--sage-border)]">
          {ROWS.map((row) => (
            <li
              key={row.index}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 px-5 py-3.5"
            >
              <span className="text-[11px] tabular-nums text-[var(--sage-ink-faint)]">
                {row.index}
              </span>
              <span className="flex flex-col gap-1 overflow-hidden">
                <span className="truncate text-[13px] tracking-tight text-[var(--sage-ink)]">
                  {row.name}
                </span>
                <span className="truncate text-[10px] tracking-[0.04em] text-[var(--sage-ink-muted)]">
                  {row.meta}
                </span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)]">
                {row.status}
              </span>
            </li>
          ))}
        </ul>

        {/* Footer readout */}
        <footer className="flex items-center justify-between gap-4 border-t border-[var(--sage-border)] px-5 py-3.5 text-[10px] uppercase tracking-[0.2em]">
          <span className="text-[var(--sage-ink-muted)]">
            <span className="text-[var(--sage-ink)]">06</span> products shipped
          </span>
          <span className="text-[var(--sage-ink-faint)]">
            build&nbsp;<span className="text-[#0ED3CF]/80">2026.5</span>
          </span>
        </footer>
      </div>
    </aside>
  )
}

function CornerTicks() {
  // Four L-shaped hairline ticks at the panel corners — precision-instrument cue.
  const base = 'pointer-events-none absolute h-3 w-3 border-[#0ED3CF]/40'
  return (
    <>
      <span className={`${base} -left-px -top-px border-l border-t`} aria-hidden />
      <span className={`${base} -right-px -top-px border-r border-t`} aria-hidden />
      <span className={`${base} -bottom-px -left-px border-b border-l`} aria-hidden />
      <span className={`${base} -bottom-px -right-px border-b border-r`} aria-hidden />
    </>
  )
}
