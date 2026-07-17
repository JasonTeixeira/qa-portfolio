import type { Metadata } from 'next'
import Link from 'next/link'
import { InterviewShell } from '@/components/academy/interview/InterviewShell'
import styles from '@/components/academy/interview/interview.module.css'

export const metadata: Metadata = {
  title: 'Interview Mastery — Prep cockpit',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * The prep Cockpit. Phase 0 ships ONLY the first-run empty state: a new subscriber has no
 * sessions and no verdicts, so there is no readiness dial, no rubric, no history to show —
 * and we render none of it (no fabricated numbers, Spec §7). The rich cockpit lands in Phase 1
 * once real interview_sessions / interview_verdicts exist.
 */
export default function InterviewCockpitPage() {
  return (
    <InterviewShell active="prep">
      <div className={styles.firstRun}>
        <span className={styles.orb} aria-hidden>
          ◆
        </span>
        <h1 className={styles.firstRunTitle}>No score. No plan. One mock fixes both.</h1>
        <p className={styles.firstRunBody}>
          Everything in this cockpit — your readiness score, your weekly plan, your weakest-skill
          drills — is generated from your first placement mock. It takes about 25 minutes and
          requires zero prep. That&rsquo;s the point.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/academy/interview/onboarding" className={styles.ctaPrimary}>
            Start the placement mock
          </Link>
          <Link href="/academy/interview/onboarding" className={styles.ctaGhost}>
            set my target first →
          </Link>
        </div>
        <div className={styles.stepGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepKicker}>DURING</div>
            <div className={styles.stepBody}>
              Marlowe interviews you, calibrated to your target level. Rough is fine — rough is
              data.
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
              Your week-by-week plan, working backwards from your interview date. Then it&rsquo;s
              just reps.
            </div>
          </div>
        </div>
      </div>
    </InterviewShell>
  )
}
