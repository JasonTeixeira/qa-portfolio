import * as React from 'react'

export type Metric = { label: string; value: string }

interface MetricRegisterProps {
  metrics: Metric[]
}

/**
 * Parse a leading numeric magnitude out of a metric value for the ruled bar.
 * "185" → 185, "200+" → 200, "5★" → 5, "< 8 min" → 8, "99.96%" → 99.96.
 * Returns null when no comparable number is present (e.g. "EN + ES",
 * "Eliminated", "LinkedIn, Indeed, Greenhouse") — those render as text rows.
 */
function magnitude(value: string): number | null {
  const match = value.match(/-?\d[\d,]*\.?\d*/)
  if (!match) return null
  const n = Number(match[0].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

/**
 * MetricRegister — institutional, hairline-ruled data viz of the REAL case
 * study numbers. No count-up theatre, no fabricated data.
 *
 * Each numeric metric gets a static bar scaled against the max comparable
 * magnitude in the set, with a 0 → max baseline. Non-numeric metrics render
 * as ruled value rows. The whole thing reads as one instrument register —
 * the verbatim value is always printed; the bar is a secondary cue, not the
 * source of truth.
 */
export function MetricRegister({ metrics }: MetricRegisterProps) {
  const rows = metrics.map((m) => ({ ...m, mag: magnitude(m.value) }))
  const numeric = rows.filter((r) => r.mag !== null) as Array<Metric & { mag: number }>
  const max = numeric.length > 0 ? Math.max(...numeric.map((r) => r.mag)) : 0

  return (
    <div className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]">
      {/* Scale header */}
      <div className="flex items-center justify-between border-b border-[var(--sage-border)] px-5 py-3">
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
          metric · value
        </span>
        {numeric.length > 0 && (
          <span className="text-[10px] tabular-nums tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
            scale 0 – {max.toLocaleString()}
          </span>
        )}
      </div>

      <div className="m-0" role="list" aria-label="Case study metrics">
        {rows.map((row, i) => {
          const pct = row.mag !== null && max > 0 ? Math.max((row.mag / max) * 100, 2) : 0
          const isLast = i === rows.length - 1
          return (
            <div
              key={row.label}
              role="listitem"
              className={`grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-[14ch_1fr_auto] ${
                isLast ? '' : 'border-b border-[var(--sage-border)]'
              }`}
            >
              <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                {row.label}
              </span>

              {/* Ruled bar track (numeric only) */}
              <div className="col-span-2 sm:col-span-1 sm:row-auto">
                {row.mag !== null ? (
                  <div className="h-2 w-full overflow-hidden rounded-[1px] bg-[var(--sage-surface-3)]">
                    <div
                      className="h-full rounded-[1px] bg-gradient-to-r from-[#3D5AFE]/70 to-[#3D5AFE]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : (
                  <div aria-hidden className="hidden h-px w-full bg-[var(--sage-border)] sm:block" />
                )}
              </div>

              <span className="text-right text-[clamp(1.1rem,_1rem_+_0.5vw,_1.5rem)] leading-none tabular-nums text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                {row.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
