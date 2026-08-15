import {
  RUBRIC_DIMENSIONS,
  barStatus,
  type BarStatus,
  type DimensionSlug,
} from '@/lib/academy/interview/rubric'
import styles from './cockpit/cockpit.module.css'

/** One real readiness row (from interview_readiness). */
export type ReadinessRow = {
  dimensionSlug: string
  score: number
  trend: number
  barStatus: string | null
}

type Props = {
  /** The learner's six real dimension rows (interview_readiness). */
  rows: readonly ReadinessRow[]
  /** The bar for the target level (rubric.barForLevel). Marks each track. */
  bar: number
  /** The weakest dimension slug — the one that CAPS overall readiness. Flagged as the cap. */
  weakestSlug: DimensionSlug | null
}

/** Map a bar-status to its semantic fill color. Below-bar is the cap → danger. */
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

function trendGlyph(trend: number): string {
  if (trend > 0) return `▲${trend}`
  if (trend < 0) return `▼${Math.abs(trend)}`
  return '—'
}

/**
 * The six-dimension rubric bars, in canonical order, each scored against the target-level bar.
 * Colors carry the real bar_status; the weakest dimension is flagged as the cap. Rows with no
 * data collapse to an honest "no scores yet" line — never a fabricated bar. Pure + server-safe.
 */
export function RubricBars({ rows, bar, weakestSlug }: Props) {
  const bySlug = new Map(rows.map((r) => [r.dimensionSlug, r]))
  const markerLeft = `${Math.max(0, Math.min(100, bar))}%`

  if (rows.length === 0) {
    return (
      <p className={styles.rubricPending}>
        Your six dimension scores appear here after your first graded mock — each measured against
        the level bar, with your weakest habit flagged as the cap.
      </p>
    )
  }

  return (
    <div className={styles.rubricList}>
      {RUBRIC_DIMENSIONS.map((dim) => {
        const row = bySlug.get(dim.slug)
        // A dimension with no row yet is honestly blank (0 fill, muted), not invented.
        const score = row?.score ?? 0
        const hasRow = !!row
        const status: BarStatus =
          hasRow && row?.barStatus
            ? (row.barStatus as BarStatus)
            : barStatus(score, bar)
        const isCap = dim.slug === weakestSlug
        const pct = `${Math.max(0, Math.min(100, score))}%`
        return (
          <div key={dim.slug} className={styles.rubricRow}>
            <div className={styles.rubricLabelRow}>
              <span className={styles.rubricName}>
                {dim.label}
                {isCap ? <span className={styles.rubricCapTag}>cap</span> : null}
              </span>
              <span className={styles.rubricScore} style={{ color: hasRow ? scoreColor(status) : 'var(--sa-ink-faint)' }}>
                {hasRow ? `${score} ${trendGlyph(row.trend)}` : 'no data'}
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
  )
}
