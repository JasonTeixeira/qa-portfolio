/**
 * Pure motion math for the academy micro-interaction layer.
 *
 * No DOM, no React, no side effects — just the easing curves and timing
 * helpers shared by CountUp, GrowBar, and EarnMoment. Keeping this pure means
 * the curves stay testable and the animated components can't drift apart.
 */

/**
 * Cubic ease-out: fast start, gentle settle. Institutional, not bouncy.
 * Mirrors the CSS `--ac-ease` cubic-bezier(0.16, 1, 0.3, 1) feel closely
 * enough for JS-driven number tweens.
 *
 * Input is clamped to [0, 1] so callers never have to guard against overshoot.
 */
export function easeOutCubic(t: number): number {
  const x = clamp01(t)
  return 1 - Math.pow(1 - x, 3)
}

/** Clamp a normalized progress value to the [0, 1] range. */
export function clamp01(t: number): number {
  if (Number.isNaN(t)) return 0
  if (t < 0) return 0
  if (t > 1) return 1
  return t
}

/**
 * Interpolate the displayed value of a count-up at elapsed time `elapsedMs`.
 * Returns the eased, rounded integer between `from` and `to`. Used by CountUp
 * so the per-frame math is unit-testable without a rAF loop.
 *
 * - At elapsed <= 0 → `from`.
 * - At elapsed >= durationMs → exactly `to` (no rounding drift at the end).
 */
export function countUpValueAt(
  from: number,
  to: number,
  elapsedMs: number,
  durationMs: number,
): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return to
  if (elapsedMs <= 0) return from
  const t = clamp01(elapsedMs / durationMs)
  const eased = easeOutCubic(t)
  return Math.round(from + (to - from) * eased)
}

/**
 * Scale the base count-up duration to the magnitude of the change so a jump
 * from 0→4 doesn't feel as slow as 0→2,000, but nothing ever runs absurdly
 * long. Returns a duration in ms, clamped to [minMs, maxMs].
 */
export function countUpDurationMs(
  delta: number,
  baseMs = 600,
  minMs = 300,
  maxMs = 1400,
): number {
  const magnitude = Math.abs(delta)
  if (magnitude <= 1) return minMs
  // Gentle logarithmic growth: each ~order of magnitude adds ~base/2.
  const scaled = baseMs + Math.log10(magnitude) * (baseMs / 2)
  return Math.round(Math.min(maxMs, Math.max(minMs, scaled)))
}
