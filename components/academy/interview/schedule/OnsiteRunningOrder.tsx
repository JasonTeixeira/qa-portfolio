import styles from './schedule.module.css'

export type OnsiteEntry = {
  company: string
  role: string | null
  nextAt: string | null
  /** Rounds from a linked company preset, if any. Never fabricated per-round readiness. */
  rounds: readonly { name: string; focus: string | null }[]
}

type Props = {
  onsite: OnsiteEntry
}

function formatWhen(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

/**
 * "The real one" — the onsite from interview_pipeline (stage = 'onsite'). We show only what the
 * pipeline row actually holds (company · role · date) plus the running order IF a company preset is
 * linked. We NEVER invent per-round readiness scores the way the static design mock did — that
 * requires a real loop-sim grade, which is a later phase. Honest omission over a fabricated number.
 */
export function OnsiteRunningOrder({ onsite }: Props) {
  const when = formatWhen(onsite.nextAt)
  const roleLine = [onsite.role?.trim(), when].filter(Boolean).join(' · ')

  return (
    <div className={`${styles.card} ${styles.cardGold}`}>
      <span className={`${styles.panelKicker} ${styles.panelKickerGold}`}>
        The real one{when ? ` · ${when}` : ''}
      </span>
      <h2 className={styles.realTitle}>{onsite.company}</h2>
      {roleLine ? <div className={styles.realMeta}>{roleLine}</div> : null}
      {onsite.rounds.length > 0 ? (
        <div className={styles.realRounds}>
          {onsite.rounds.map((r, i) => (
            <div key={`${r.name}-${i}`} className={styles.realRound}>
              <span className={styles.realRoundTime}>Round {i + 1}</span>
              <span className={styles.realRoundName}>
                {r.name}
                {r.focus ? ` — ${r.focus}` : ''}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.realFoot}>
          Round-by-round readiness lands once you run this company’s loop simulation — no fabricated
          scores until then.
        </div>
      )}
    </div>
  )
}
