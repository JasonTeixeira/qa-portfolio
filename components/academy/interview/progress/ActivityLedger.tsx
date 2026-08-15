import styles from './progress.module.css'

type Props = {
  mocksGraded: number
  drillsDone: number
  drillsTotal: number
  activeDays: number
  clearedBar: number
  sinceLabel: string | null
}

/**
 * The activity ledger — the learner's real record, counted straight from their rows: graded mocks
 * (interview_verdicts), drills completed vs planned (interview_drills.status), distinct active days
 * and bar-clears (interview_readiness_snapshots). No invented streaks or behavioral patterns; every
 * tile is a count of something that actually happened.
 */
export function ActivityLedger({ mocksGraded, drillsDone, drillsTotal, activeDays, clearedBar, sinceLabel }: Props) {
  return (
    <div className={styles.ledgerCol}>
      <span className={styles.cardKicker}>Activity ledger · your real record</span>
      <div className={styles.ledgerGrid}>
        <div className={styles.ledgerTile}>
          <div className={styles.ledgerValue}>{mocksGraded}</div>
          <div className={styles.ledgerLabel}>graded mock{mocksGraded === 1 ? '' : 's'}</div>
        </div>
        <div className={styles.ledgerTile}>
          <div className={styles.ledgerValue}>
            {drillsDone}
            <span style={{ fontSize: 14, color: 'var(--sa-ink-subtle)' }}> / {drillsTotal}</span>
          </div>
          <div className={styles.ledgerLabel}>drills completed</div>
        </div>
        <div className={styles.ledgerTile}>
          <div className={styles.ledgerValue}>{activeDays}</div>
          <div className={styles.ledgerLabel}>day{activeDays === 1 ? '' : 's'} with a graded mock</div>
        </div>
        <div className={styles.ledgerTile}>
          <div className={styles.ledgerValue}>{clearedBar}</div>
          <div className={styles.ledgerLabel}>mock{clearedBar === 1 ? '' : 's'} above the bar</div>
        </div>
      </div>
      {sinceLabel ? <div className={styles.ledgerNote}>tracking since {sinceLabel}</div> : null}
    </div>
  )
}
