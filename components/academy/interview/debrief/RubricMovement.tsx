import { RUBRIC_DIMENSIONS, barStatus, type BarStatus } from '@/lib/academy/interview/rubric'
import styles from './debrief.module.css'

/** One graded dimension from interview_verdicts.dims. */
export type MovementDim = {
  slug: string
  score: number
  delta: number
  barStatus: string
}

type Props = {
  dims: readonly MovementDim[]
  bar: number
  weakestSlug: string | null
  /** Honest movement summary (readiness prev → now), or the first-mock line. */
  movementLine: string
}

function fillColor(status: BarStatus): string {
  switch (status) {
    case 'above_bar':
    case 'at_bar':
      return 'var(--sa-success)'
    case 'near_bar':
      return 'var(--sa-warning)'
    case 'below_bar':
      return 'var(--sa-danger)'
  }
}

function scoreColor(status: BarStatus): string {
  return status === 'below_bar'
    ? 'var(--sa-danger)'
    : status === 'near_bar'
      ? 'var(--iv-gold-bright, #f0c36a)'
      : 'var(--sa-success)'
}

function trendGlyph(delta: number): string {
  if (delta > 0) return `▲${delta}`
  if (delta < 0) return `▼${Math.abs(delta)}`
  return '—'
}

/**
 * This session's rubric movement — the six real dimensions in canonical order, each scored against
 * the level bar with its real delta, the weakest flagged as the cap. Pure + server-safe: a
 * dimension with no graded row collapses to an honest blank rather than a fabricated bar.
 */
export function RubricMovement({ dims, bar, weakestSlug, movementLine }: Props) {
  const bySlug = new Map(dims.map((d) => [d.slug, d]))
  const markerLeft = `${Math.max(0, Math.min(100, bar))}%`

  return (
    <>
      <div className={styles.rubric}>
        {RUBRIC_DIMENSIONS.map((dim) => {
          const row = bySlug.get(dim.slug)
          const hasRow = !!row
          const score = row?.score ?? 0
          const status: BarStatus =
            hasRow && row?.barStatus ? (row.barStatus as BarStatus) : barStatus(score, bar)
          const isCap = dim.slug === weakestSlug
          const pct = `${Math.max(0, Math.min(100, score))}%`
          return (
            <div key={dim.slug} className={styles.rubricRow}>
              <div className={styles.rubricRowHead}>
                <span className={styles.rubricName}>
                  {dim.label}
                  {isCap ? <span className={styles.rubricCap}>cap</span> : null}
                </span>
                <span
                  className={styles.rubricScore}
                  style={{ color: hasRow ? scoreColor(status) : 'var(--sa-ink-faint)' }}
                >
                  {hasRow ? `${score} ${trendGlyph(row.delta)}` : 'no data'}
                </span>
              </div>
              <div className={styles.rubricTrack}>
                {hasRow ? (
                  <div className={styles.rubricFill} style={{ width: pct, background: fillColor(status) }} />
                ) : null}
                <div className={styles.rubricMarker} style={{ left: markerLeft }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className={styles.movementNote}>{movementLine}</div>
    </>
  )
}
