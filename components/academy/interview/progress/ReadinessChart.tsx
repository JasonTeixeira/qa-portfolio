import styles from './progress.module.css'

/** One real graded snapshot (interview_readiness_snapshots). */
export type ChartPoint = {
  overall: number
  label: string
  event: string | null
}

type Props = {
  /** Real snapshots, oldest → newest. Never synthesized. */
  series: readonly ChartPoint[]
  /** The target-level bar (rubric.barForLevel). */
  bar: number
}

// Chart geometry (matches the design's viewBox math: y = BOTTOM - score/100 * SPAN).
const VIEW_W = 720
const BOTTOM = 200
const SPAN = 175
const X_LEFT = 40
const X_RIGHT = 680
const PROJECTION_DX = 60

function yFor(score: number): number {
  return BOTTOM - (Math.max(0, Math.min(100, score)) / 100) * SPAN
}

function dotColor(event: string | null, isLast: boolean): string {
  if (isLast) return '#f0c36a'
  if (event && event.startsWith('loop')) return '#8fa0ff'
  if (event === 'placement') return '#9598a2'
  return '#9598a2'
}

/**
 * Readiness over time — a line over the REAL snapshot series vs the target-level bar. No fabricated
 * history: a single snapshot renders one honest point (and the note tells the learner the trend
 * appears after more graded mocks); a projection is drawn ONLY with ≥3 real points, is visually
 * distinct (dashed, faded) and explicitly labeled "projection", never presented as history.
 */
export function ReadinessChart({ series, bar }: Props) {
  const n = series.length
  const barY = yFor(bar)

  const xs =
    n === 1
      ? [Math.round((X_LEFT + X_RIGHT) / 2)]
      : series.map((_, i) => Math.round(X_LEFT + (i * (X_RIGHT - X_LEFT)) / (n - 1)))

  const pts = series.map((p, i) => ({ x: xs[i], y: yFor(p.overall), point: p, isLast: i === n - 1 }))
  const curve = pts.map((p) => `${p.x},${Math.round(p.y)}`).join(' ')
  const areaPts = `${xs[0]},${BOTTOM} ${curve} ${xs[n - 1]},${BOTTOM}`

  // Honest projection: only with ≥3 real points; one step at the recent average pace.
  let projection: string | null = null
  if (n >= 3) {
    const last = series[n - 1].overall
    const window = series.slice(-3)
    const perStep = (window[window.length - 1].overall - window[0].overall) / (window.length - 1)
    const projected = Math.max(0, Math.min(100, last + perStep))
    const lastX = xs[n - 1]
    projection = `${lastX},${Math.round(yFor(last))} ${Math.min(VIEW_W, lastX + PROJECTION_DX)},${Math.round(yFor(projected))}`
  }

  const first = series[0].overall
  const now = series[n - 1].overall
  const gain = now - first

  return (
    <>
      <div className={styles.cardHeadRow}>
        <span className={`${styles.cardKicker} ${styles.cardKickerGold}`}>
          Readiness over time · vs the bar
        </span>
        {n >= 2 ? (
          <span className={styles.cardStat} style={{ color: gain >= 0 ? 'var(--sa-success)' : 'var(--sa-danger)' }}>
            {first} → {now} · {gain >= 0 ? '▲' : '▼'}
            {Math.abs(gain)} across {n} mocks
          </span>
        ) : (
          <span className={styles.cardStatMuted}>1 mock logged</span>
        )}
      </div>

      <svg viewBox={`0 0 ${VIEW_W} 220`} className={styles.chartSvg} role="img" aria-label="Readiness over time versus the target bar">
        {/* The bar reference line. */}
        <line x1="0" y1={barY} x2={VIEW_W} y2={barY} stroke="rgba(240,195,106,0.45)" strokeWidth="1.5" strokeDasharray="6 5" />
        <text x="6" y={barY - 7} fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#f0c36a">
          the bar · {bar}
        </text>
        <line x1="0" y1={BOTTOM} x2={VIEW_W} y2={BOTTOM} stroke="#1e1e24" strokeWidth="1" />

        {n >= 2 ? (
          <>
            <polyline points={areaPts} fill="rgba(224,169,62,0.09)" stroke="none" />
            <polyline
              points={curve}
              fill="none"
              stroke="#e0a93e"
              strokeWidth="2.5"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              className={styles.chartCurve}
            />
            {projection ? (
              <polyline points={projection} fill="none" stroke="rgba(224,169,62,0.5)" strokeWidth="2" strokeDasharray="3 6" />
            ) : null}
          </>
        ) : null}

        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0b0b0e" stroke={dotColor(p.point.event, p.isLast)} strokeWidth="2" />
            <text x={p.x} y="215" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#63636d" textAnchor="middle">
              {p.point.label}
            </text>
          </g>
        ))}
      </svg>

      <div className={styles.chartLegend}>
        <span className={styles.legendReal}>— your readiness</span>
        {projection ? <span className={styles.legendProjection}>┄ projection at current pace</span> : null}
        <span>○ = graded mock</span>
      </div>

      {n < 2 ? (
        <div className={styles.chartNote}>
          Your trend line appears after a few graded mocks — we won&rsquo;t draw a curve from a single
          point.
        </div>
      ) : null}
    </>
  )
}
