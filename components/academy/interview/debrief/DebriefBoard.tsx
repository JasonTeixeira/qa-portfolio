import Link from 'next/link'
import { DebriefTimeline, type DebriefMoment, type DebriefTurn } from './DebriefTimeline'
import { RubricMovement, type MovementDim } from './RubricMovement'
import { DrillPlanner, type DebriefDrill } from './DrillPlanner'
import styles from './debrief.module.css'

/** A speech-analytics tile — only rendered when interview_verdicts.speech_analytics is present. */
export type SpeechTile = { value: string; label: string; color: string }

type Props = {
  sessionId: string
  headMeta: string
  headTitle: string
  verdictLabel: string
  verdictColor: string
  score: number
  bar: number
  moments: readonly DebriefMoment[]
  turns: readonly DebriefTurn[]
  dims: readonly MovementDim[]
  weakestSlug: string | null
  movementLine: string
  speech: readonly SpeechTile[] | null
  drills: readonly DebriefDrill[]
}

/**
 * The debrief board — the timestamped, tap-to-replay timeline, the session's rubric movement, an
 * optional speech-analytics panel, and the weakest-first drill plan. Every figure is a real graded
 * artifact; there is no fabricated content on this surface (Spec §7). Server-composed; interaction
 * lives in the DebriefTimeline / DrillPlanner client leaves.
 */
export function DebriefBoard({
  sessionId,
  headMeta,
  headTitle,
  verdictLabel,
  verdictColor,
  score,
  bar,
  moments,
  turns,
  dims,
  weakestSlug,
  movementLine,
  speech,
  drills,
}: Props) {
  return (
    <div>
      <div className={styles.head}>
        <div>
          <div className={styles.headMeta}>{headMeta}</div>
          <h1 className={styles.headTitle}>{headTitle}</h1>
        </div>
        <div className={styles.headRail}>
          <div className={styles.railCell}>
            <div className={styles.railLabel}>Committee verdict</div>
            <div className={styles.railVerdict} style={{ color: verdictColor }}>
              {verdictLabel}
            </div>
          </div>
          <div className={styles.railDivider} />
          <div className={styles.railCell}>
            <div className={styles.railLabel}>Session score</div>
            <div className={styles.railScore}>
              {score}
              <span className={styles.railScoreBar}> / bar {bar}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Scored moments — the timestamped, tap-to-replay timeline. */}
        <section className={`${styles.card} ${styles.span7}`}>
          <div className={styles.cardHeadRow}>
            <span className={styles.cardKicker}>Scored moments · from the transcript</span>
            <span className={styles.cardHint}>tap a timestamp to replay</span>
          </div>
          <DebriefTimeline moments={moments} turns={turns} />
        </section>

        {/* Rubric movement. */}
        <section className={`${styles.card} ${styles.span5}`}>
          <div className={styles.cardHeadRow}>
            <span className={styles.cardKicker}>This session&rsquo;s movement</span>
            <span className={styles.cardHint}>│ = the bar</span>
          </div>
          <RubricMovement dims={dims} bar={bar} weakestSlug={weakestSlug} movementLine={movementLine} />
        </section>

        {/* Speech analytics — only when the grade carried it (typed mocks have none). */}
        {speech && speech.length > 0 ? (
          <section className={`${styles.card} ${styles.span12}`}>
            <div className={styles.cardHeadRow}>
              <span className={styles.cardKicker}>Speech analytics</span>
            </div>
            <div className={styles.speechGrid}>
              {speech.map((sp) => (
                <div key={sp.label} className={styles.speechTile}>
                  <div className={styles.speechValue} style={{ color: sp.color }}>
                    {sp.value}
                  </div>
                  <div className={styles.speechLabel}>{sp.label}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* The plan — real drills only (generateDrills), never fabricated. */}
        <section className={`${styles.card} ${styles.cardGold} ${styles.span12} ${styles.planCard}`}>
          <DrillPlanner sessionId={sessionId} drills={drills} />
        </section>
      </div>

      <div className={styles.footRow}>
        <Link href="/academy/interview" className={styles.ctaPrimary}>
          Back to the cockpit →
        </Link>
        <Link href={`/academy/interview/verdict/${sessionId}`} className={styles.ctaGhost}>
          re-read the verdict
        </Link>
      </div>
    </div>
  )
}
