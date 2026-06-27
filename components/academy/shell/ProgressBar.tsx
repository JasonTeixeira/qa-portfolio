import type { CSSProperties } from 'react'

/**
 * Shared, honest course-progress bar. Mastery-green fill on a surface-2 track.
 * Compositor-only (transform/width via CSS width — set once on the server, no
 * animation churn). A11y: a real progressbar role + aria-valuenow so screen
 * readers announce the real percentage. Token-driven (--ac-*), no glow.
 *
 * The visible "X/Y lessons · N%" caption is rendered by callers (it varies per
 * surface); pass an `ariaLabel` so the bar itself is self-describing.
 */
export function ProgressBar({
  value,
  ariaLabel,
  size = 'md',
  className = '',
}: {
  /** 0–100. Clamped. */
  value: number
  ariaLabel: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  const height = size === 'sm' ? 4 : 6
  const trackStyle: CSSProperties = {
    height,
    background: 'var(--ac-surface-2)',
    border: '1px solid var(--ac-rule)',
  }
  const fillStyle: CSSProperties = {
    width: `${pct}%`,
    background: 'var(--ac-mastery)',
  }
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`overflow-hidden rounded-full ${className}`}
      style={trackStyle}
    >
      <div className="h-full rounded-full" style={fillStyle} />
    </div>
  )
}
