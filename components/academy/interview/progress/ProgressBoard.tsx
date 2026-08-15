import { ReadinessChart, type ChartPoint } from './ReadinessChart'
import { CohortStanding, type CohortResult } from './CohortStanding'
import { SkillTrajectories } from './SkillTrajectories'
import { ActivityLedger } from './ActivityLedger'
import styles from './progress.module.css'

type Props = {
  headMeta: string
  headTitle: string
  targetChip: string | null
  bar: number
  series: readonly ChartPoint[]
  cohort: CohortResult
  dimsFirst: Readonly<Record<string, number>>
  dimsNow: Readonly<Record<string, number>>
  hasBaseline: boolean
  mocksGraded: number
  drillsDone: number
  drillsTotal: number
  activeDays: number
  clearedBar: number
  sinceLabel: string | null
}

/**
 * The Progress board — readiness-over-time, cohort standing, six-dimension trajectories, and the
 * activity ledger. Every number is server-derived from real rows (Spec §7): the chart from
 * snapshots, the cohort strictly from committee verdicts (honest-gated), and the ledger from
 * counts. Server-composed and fully static — no client JS needed.
 */
export function ProgressBoard({
  headMeta,
  headTitle,
  targetChip,
  bar,
  series,
  cohort,
  dimsFirst,
  dimsNow,
  hasBaseline,
  mocksGraded,
  drillsDone,
  drillsTotal,
  activeDays,
  clearedBar,
  sinceLabel,
}: Props) {
  return (
    <div>
      <div className={styles.head}>
        <div>
          <div className={styles.headMeta}>{headMeta}</div>
          <h1 className={styles.headTitle}>{headTitle}</h1>
        </div>
        {targetChip ? <span className={styles.targetChip}>◆ {targetChip}</span> : null}
      </div>

      <div className={styles.grid}>
        <section className={`${styles.card} ${styles.cardGold} ${styles.span8}`}>
          <ReadinessChart series={series} bar={bar} />
        </section>

        <section className={`${styles.card} ${styles.span4}`}>
          <CohortStanding cohort={cohort} />
        </section>

        <section className={`${styles.card} ${styles.span7}`}>
          <SkillTrajectories dimsFirst={dimsFirst} dimsNow={dimsNow} bar={bar} hasBaseline={hasBaseline} />
        </section>

        <section className={`${styles.card} ${styles.span5}`}>
          <ActivityLedger
            mocksGraded={mocksGraded}
            drillsDone={drillsDone}
            drillsTotal={drillsTotal}
            activeDays={activeDays}
            clearedBar={clearedBar}
            sinceLabel={sinceLabel}
          />
        </section>

        <section className={`${styles.card} ${styles.cardGold} ${styles.span12} ${styles.proofCard}`}>
          <span className={styles.proofMark} aria-hidden>
            ◆
          </span>
          <div className={styles.proofMain}>
            <div className={`${styles.cardKicker} ${styles.cardKickerGold}`} style={{ marginBottom: 6 }}>
              Interview-ready proof · earned, not granted
            </div>
            <div className={styles.proofBody}>
              Clear the bar in your graded mocks and your evidence portfolio earns a verifiable
              &ldquo;interview-ready&rdquo; seal — backed by the real transcripts. It is counted from
              committee grades, never self-declared.
            </div>
          </div>
          <span className={styles.proofStat}>
            progress: {clearedBar} mock{clearedBar === 1 ? '' : 's'} above bar
          </span>
        </section>
      </div>
    </div>
  )
}
