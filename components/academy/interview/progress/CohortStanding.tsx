import styles from './progress.module.css'

/**
 * The cohort result — derived on the server ONLY from interview_verdicts (service-authored, un-
 * fakeable) and gated on a real member threshold. `ready: false` is the honest, correct answer
 * until the cohort is large enough; the client never sees an invented percentile.
 */
export type CohortResult =
  | { ready: true; percentile: number; you: number; median: number; cohortSize: number }
  | { ready: false; gradedMembers: number; threshold: number }

type Props = { cohort: CohortResult }

function clampPct(n: number): string {
  return `${Math.max(0, Math.min(100, n))}%`
}

/**
 * Cohort standing. When the cohort is real and large enough it shows the learner's percentile
 * against graded members plus the honest You-vs-median bars; below the threshold it shows a plain
 * "not enough data yet" panel. It NEVER fabricates a percentile.
 */
export function CohortStanding({ cohort }: Props) {
  if (!cohort.ready) {
    return (
      <div className={styles.cohortCol}>
        <span className={styles.cardKicker}>Cohort standing</span>
        <div>
          <div className={styles.cohortEmptyBig}>Not enough data yet</div>
          <p className={styles.cohortEmpty}>
            Your percentile appears once at least {cohort.threshold} members have a graded mock — it
            is computed only from real committee grades, never from self-reported numbers. So far:{' '}
            {cohort.gradedMembers} graded member{cohort.gradedMembers === 1 ? '' : 's'}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.cohortCol}>
      <span className={styles.cardKicker}>Cohort standing</span>
      <div>
        <div className={styles.percentileBig}>P{cohort.percentile}</div>
        <div className={styles.percentileSub}>
          of {cohort.cohortSize} graded members, by latest committee score
        </div>
      </div>
      <div className={styles.cohortBars}>
        <div>
          <div className={styles.cohortRowHead}>
            <span className={styles.cohortNameYou}>You</span>
            <span className={styles.cohortVal}>{cohort.you}</span>
          </div>
          <div className={styles.cohortTrack}>
            <div className={styles.cohortFill} style={{ width: clampPct(cohort.you), background: '#e0a93e' }} />
          </div>
        </div>
        <div>
          <div className={styles.cohortRowHead}>
            <span className={styles.cohortName}>Cohort median</span>
            <span className={styles.cohortVal}>{cohort.median}</span>
          </div>
          <div className={styles.cohortTrack}>
            <div className={styles.cohortFill} style={{ width: clampPct(cohort.median), background: '#3d5afe' }} />
          </div>
        </div>
      </div>
      <div className={styles.cohortNote}>
        Percentile and median are computed from graded committee scores across members — the only
        un-fakeable signal.
      </div>
    </div>
  )
}
