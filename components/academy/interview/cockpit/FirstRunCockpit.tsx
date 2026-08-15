import Link from 'next/link'
import { StartMockButton } from './StartMockButton'
import styles from './cockpit.module.css'

type Props = {
  /** The scenario the first mock launches (a recommended, published scenario slug). */
  placementScenarioSlug: string
}

/**
 * The first-run cockpit: the learner has set a target (onboarded) but has zero sessions, so there
 * is no readiness dial, no rubric, no history to show — and we render none of it (no fabricated
 * numbers, Spec §7). One prominent action fixes it: the placement mock.
 */
export function FirstRunCockpit({ placementScenarioSlug }: Props) {
  return (
    <div className={styles.firstRun}>
      <span className={styles.orb} aria-hidden>
        ◆
      </span>
      <h1 className={styles.firstRunTitle}>No score. No plan. One mock fixes both.</h1>
      <p className={styles.firstRunBody}>
        Everything in this cockpit — your readiness score, your weakest-skill drills, your session
        history — is generated from your first mock. It takes about 35 minutes and requires zero
        prep. That&rsquo;s the point.
      </p>
      <div className={styles.ctaRow}>
        <StartMockButton scenarioSlug={placementScenarioSlug} label="Start your first mock" />
        <Link href="/academy/interview/onboarding" className={styles.ctaGhostLink}>
          change my target first →
        </Link>
      </div>
      <div className={styles.stepGrid}>
        <div className={styles.stepCard}>
          <div className={styles.stepKicker}>DURING</div>
          <div className={styles.stepBody}>
            Marlowe interviews you, calibrated to your target level. Rough is fine — rough is data.
          </div>
        </div>
        <div className={styles.stepCard}>
          <div className={styles.stepKicker}>AFTER · MINUTE 1</div>
          <div className={styles.stepBody}>
            Your readiness score, six dimensions, and the one habit capping you — with transcript
            evidence.
          </div>
        </div>
        <div className={styles.stepCard}>
          <div className={styles.stepKicker}>AFTER · MINUTE 2</div>
          <div className={styles.stepBody}>
            Your week-by-week plan, working backwards from your interview date. Then it&rsquo;s just
            reps.
          </div>
        </div>
      </div>
    </div>
  )
}
