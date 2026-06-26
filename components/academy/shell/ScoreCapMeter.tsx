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
}: {
  resolution: ScoreResolution
  className?: string
}) {
  const { score, binding } = resolution
  const capped = binding !== null
  const accent = capped ? 'var(--ac-pending)' : 'var(--ac-mastery)'
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="font-mono text-[11px] uppercase tracking-[0.1em]"
          style={{ color: 'var(--ac-ink-faint)' }}
        >
          Mastery score
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums" style={{ color: accent }}>
          {score}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Mastery score"
        style={{ background: 'var(--ac-surface-2)' }}
      >
        <span
          className="block h-full rounded-full"
          style={{ width: `${score}%`, background: accent, transition: 'width var(--ac-dur) var(--ac-ease)' }}
        />
      </div>
      {capped && (
        <p className="text-[12px]" style={{ color: 'var(--ac-ink-soft)' }}>
          Capped at {binding.cap} — {binding.reason}.{' '}
          <span style={{ color: 'var(--ac-ink)' }}>Next: {binding.lift}.</span>
        </p>
      )}
    </div>
  )
}
