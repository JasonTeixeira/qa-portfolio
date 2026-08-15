import { RUBRIC_DIMENSIONS, barStatus, type BarStatus } from '@/lib/academy/interview/rubric'
import styles from './progress.module.css'

type Props = {
  /** Per-dimension score at the FIRST graded snapshot (slug → score). */
  dimsFirst: Readonly<Record<string, number>>
  /** Per-dimension score at the LATEST snapshot (slug → score). */
  dimsNow: Readonly<Record<string, number>>
  bar: number
  /** True when there are ≥2 snapshots, so from→now movement is real. */
  hasBaseline: boolean
}

function barColor(status: BarStatus): string {
  switch (status) {
    case 'above_bar':
    case 'at_bar':
      return '#18b663'
    case 'near_bar':
      return '#e0a93e'
    case 'below_bar':
      return '#e5484d'
  }
}
function dotColor(status: BarStatus): string {
  return status === 'below_bar' ? '#e5484d' : status === 'near_bar' ? '#f0c36a' : '#18b663'
}
function deltaColor(delta: number): string {
  return delta > 0 ? 'var(--sa-success)' : delta < 0 ? 'var(--sa-danger)' : 'var(--sa-ink-subtle)'
}
function clampPct(n: number): string {
  return `${Math.max(0, Math.min(100, n))}%`
}

/**
 * Six-dimension trajectory — each dimension's real movement from the first graded snapshot to the
 * latest, marked against the level bar. Movement is only drawn from real snapshot dims; with a
 * single snapshot it honestly shows the current standing and says so, never inventing a "from".
 */
export function SkillTrajectories({ dimsFirst, dimsNow, bar, hasBaseline }: Props) {
  // Honest footnote: the dimension that has moved the most (real, from snapshot dims).
  let sharpest: { label: string; gain: number } | null = null
  if (hasBaseline) {
    for (const dim of RUBRIC_DIMENSIONS) {
      const from = dimsFirst[dim.slug]
      const now = dimsNow[dim.slug]
      if (typeof from === 'number' && typeof now === 'number') {
        const gain = now - from
        if (!sharpest || gain > sharpest.gain) sharpest = { label: dim.label, gain }
      }
    }
  }

  return (
    <>
      <div className={styles.cardHeadRow}>
        <span className={styles.cardKicker}>Six dimensions · trajectory</span>
        <span className={styles.cardStatMuted}>{hasBaseline ? 'first → now' : 'current standing'}</span>
      </div>

      <div className={styles.skillList}>
        {RUBRIC_DIMENSIONS.map((dim) => {
          const now = dimsNow[dim.slug]
          if (typeof now !== 'number') {
            return (
              <div key={dim.slug} className={styles.skillRow}>
                <span className={styles.skillName}>{dim.label}</span>
                <div className={styles.skillTrack} />
                <span className={styles.skillDelta} style={{ color: 'var(--sa-ink-faint)' }}>
                  no data
                </span>
              </div>
            )
          }
          const from = dimsFirst[dim.slug]
          const hasFrom = hasBaseline && typeof from === 'number'
          const delta = hasFrom ? now - (from as number) : 0
          const status = barStatus(now, bar)
          const fromPct = hasFrom ? clampPct(Math.min(from as number, now)) : clampPct(now)
          const gainPct = hasFrom ? clampPct(Math.abs(now - (from as number))) : '0%'
          const gainLeft = hasFrom ? clampPct(Math.min(from as number, now)) : clampPct(now)
          return (
            <div key={dim.slug} className={styles.skillRow}>
              <span className={styles.skillName}>{dim.label}</span>
              <div className={styles.skillTrack}>
                {hasFrom ? (
                  <div className={styles.skillGain} style={{ left: gainLeft, width: gainPct }} />
                ) : null}
                <div className={styles.skillFrom} style={{ width: fromPct, background: barColor(status) }} />
                <div className={styles.skillNow} style={{ left: clampPct(now), background: dotColor(status) }} />
                <div className={styles.skillBar} style={{ left: clampPct(bar) }} />
              </div>
              <span className={styles.skillDelta} style={{ color: hasFrom ? deltaColor(delta) : 'var(--sa-ink-subtle)' }}>
                {hasFrom
                  ? `${from}→${now} ${delta > 0 ? `▲${delta}` : delta < 0 ? `▼${Math.abs(delta)}` : '—'}`
                  : String(now)}
              </span>
            </div>
          )
        })}
      </div>

      {sharpest && sharpest.gain > 0 ? (
        <div className={styles.skillFootNote}>
          {sharpest.label} is moving fastest — up {sharpest.gain} since your first graded mock. Every
          number here is read straight from your snapshots.
        </div>
      ) : (
        <div className={styles.skillFootNote}>
          Movement across your six dimensions appears here as you log more graded mocks — measured
          against the {bar} bar.
        </div>
      )}
    </>
  )
}
