import type { ScoreResolution } from '@/lib/academy/caps-logic'

/**
 * Makes the anti-fake score spine legible: shows the binding score, why it's
 * capped, and the next action that lifts it. The score is the MIN of all caps
 * (caps-logic.resolveScore) — this never computes its own number, it only
 * displays one. A capped score reads gold (--ac-pending); fully-earned reads
 * mastery-green. Internal evidence tops out at 98 by design.
 */
export function ScoreCapMeter({
  resolution,
  className = '',
  label = 'Mastery score',
}: {
  resolution: ScoreResolution
  className?: string
  /** Caption above the meter. Defaults to "Mastery score"; the lesson player
   *  passes "Best mastery" to disambiguate prior/best from this-session progress. */
  label?: string
}) {
  const { score, binding } = resolution
  const capped = binding !== null
  const accent = capped ? 'var(--ac-pending)' : 'var(--ac-mastery)'
  // Instrument GAUGE — a ticked readout track (0/25/50/75/100 graticule) with a
  // mono value and a "/100" denominator so the number reads as an instrument
  // measurement, not a decorative bar. Ticks are aria-hidden decoration.
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="font-mono text-[11px] uppercase tracking-[0.14em]"
          style={{ color: 'var(--ac-ink-faint)' }}
        >
          {label}
        </span>
        <span className="font-mono tabular-nums" style={{ color: accent }}>
          <span className="text-lg font-semibold">{score}</span>
          <span className="text-[11px]" style={{ color: 'var(--ac-ink-faint)' }}>
            /100
          </span>
        </span>
      </div>
      <div
        className="relative h-2 w-full overflow-hidden rounded-[3px]"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Mastery score"
        style={{ background: 'var(--ac-surface-2)', border: '1px solid var(--ac-rule)' }}
      >
        <span
          className="block h-full rounded-[2px]"
          style={{ width: `${score}%`, background: accent, transition: 'width var(--ac-dur) var(--ac-ease)' }}
        />
        {/* graticule tick marks at each quartile */}
        {[25, 50, 75].map((t) => (
          <span
            key={t}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 h-full"
            style={{ left: `${t}%`, width: 1, background: 'var(--ac-bg)', opacity: 0.55 }}
          />
        ))}
      </div>
      {capped && (
        <p className="font-mono text-[11px] leading-relaxed" style={{ color: 'var(--ac-ink-soft)' }}>
          <span style={{ color: 'var(--ac-pending)' }}>CAP {binding.cap}</span> — {binding.reason}.{' '}
          <span style={{ color: 'var(--ac-ink)' }}>Next: {binding.lift}.</span>
        </p>
      )}
    </div>
  )
}
