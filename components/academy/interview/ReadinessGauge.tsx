import styles from './cockpit/cockpit.module.css'

const RADIUS = 76
const CENTER = 86
// Circumference of the r=76 ring (2·π·76 ≈ 477.5). The design file uses 477 for the
// dash-array total, so we mirror it exactly for pixel parity.
const CIRCUMFERENCE = 477

type Props = {
  /** The real overall readiness (min-capped) 0–100, or null when there is no verdict yet. */
  overall: number | null
  /** The bar for the learner's target level (from rubric.barForLevel). */
  bar: number
  /**
   * Sum of this-week dimension trends, when readiness exists. Drives the ▲/▼ line. Null hides it.
   * This is a real delta (sum of interview_readiness.trend), never fabricated.
   */
  weekTrend?: number | null
}

/**
 * The readiness dial — an SVG ring whose fill is the real overall (min-capped) readiness, with a
 * tick marking the target-level bar. When there is no verdict yet, the ring is empty and the
 * center reads "—" (no fabricated number, Spec §7). Pure + server-renderable.
 */
export function ReadinessGauge({ overall, bar, weekTrend = null }: Props) {
  const hasScore = typeof overall === 'number' && overall > 0
  const dash = hasScore ? Math.round((overall / 100) * CIRCUMFERENCE) : 0
  const delta = bar - (overall ?? 0)

  // Bar tick: fraction of the way around the ring, starting at 12 o'clock going clockwise.
  const barFraction = Math.max(0, Math.min(1, bar / 100))
  const angleRad = (-90 + barFraction * 360) * (Math.PI / 180)
  const tickInner = RADIUS - 9
  const tickOuter = RADIUS + 9
  const tx1 = CENTER + tickInner * Math.cos(angleRad)
  const ty1 = CENTER + tickInner * Math.sin(angleRad)
  const tx2 = CENTER + tickOuter * Math.cos(angleRad)
  const ty2 = CENTER + tickOuter * Math.sin(angleRad)

  const subLine = hasScore
    ? `bar: ${bar} · ${delta > 0 ? `−${delta} to go` : 'above bar'}`
    : `bar: ${bar}`

  const trendClass =
    weekTrend == null
      ? null
      : weekTrend > 0
        ? styles.gaugeTrendUp
        : weekTrend < 0
          ? styles.gaugeTrendDown
          : styles.gaugeTrendFlat

  return (
    <>
      <div className={styles.gaugeWrap}>
        <svg viewBox="0 0 172 172" className={styles.gaugeSvg} aria-hidden>
          <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#1A1A20" strokeWidth={11} />
          {hasScore ? (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="url(#ivGoldGrad)"
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          ) : null}
          {/* Bar marker — where the target-level bar sits on the ring. */}
          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#F0C36A" strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
          <defs>
            <linearGradient id="ivGoldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F0C36A" />
              <stop offset="100%" stopColor="#D99A2B" />
            </linearGradient>
          </defs>
        </svg>
        <div className={styles.gaugeCenter}>
          <div>
            {hasScore ? (
              <div className={styles.gaugeScore}>{overall}</div>
            ) : (
              <div className={styles.gaugeScoreEmpty}>—</div>
            )}
            <div className={styles.gaugeSub}>{subLine}</div>
          </div>
        </div>
      </div>
      {hasScore && weekTrend != null && trendClass ? (
        <div className={`${styles.gaugeTrend} ${trendClass}`}>
          {weekTrend > 0 ? `▲ +${weekTrend} this week` : weekTrend < 0 ? `▼ ${weekTrend} this week` : '— flat this week'}
        </div>
      ) : null}
    </>
  )
}
