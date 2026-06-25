import Link from 'next/link'
import type { AssessmentState } from '@/lib/academy/assessments'
import { gainBand } from '@/lib/academy/efficacy-logic'
import styles from './assessment-banner.module.css'

const BAND_LABEL = { high: 'High gain', medium: 'Medium gain', low: 'Low gain', negative: 'No gain yet' }

/**
 * Course-page assessment prompt. Shows the pretest baseline before you start,
 * the posttest once the course is complete, and the verified gain afterward.
 * Renders nothing when a course has no question bank authored.
 */
export function AssessmentBanner({
  slug,
  state,
  courseComplete,
}: {
  slug: string
  state: AssessmentState
  courseComplete: boolean
}) {
  if (state.g !== null) {
    return (
      <div className={`${styles.banner} ${styles.done}`}>
        <span className={styles.glyph} aria-hidden="true">
          ↗
        </span>
        <div className={styles.copy}>
          <span className={styles.title}>
            Verified learning gain · g = {state.g.toFixed(2)} ({BAND_LABEL[gainBand(state.g)]})
          </span>
          <span className={styles.sub}>
            Pre {state.pre} → Post {state.post}. This is on your public profile.
          </span>
        </div>
      </div>
    )
  }

  if (state.posttestCount > 0 && courseComplete && !state.posttestTaken) {
    return (
      <Link href={`/academy/course/${slug}/assessment/posttest`} className={`${styles.banner} ${styles.action}`}>
        <span className={styles.glyph} aria-hidden="true">
          ✓
        </span>
        <div className={styles.copy}>
          <span className={styles.title}>You finished — now prove the gain.</span>
          <span className={styles.sub}>Take the {state.posttestCount}-question post-assessment to measure how far you came.</span>
        </div>
        <span className={styles.cta}>Prove it →</span>
      </Link>
    )
  }

  if (state.pretestCount > 0 && !state.pretestTaken) {
    return (
      <Link href={`/academy/course/${slug}/assessment/pretest`} className={`${styles.banner} ${styles.action}`}>
        <span className={styles.glyph} aria-hidden="true">
          ◷
        </span>
        <div className={styles.copy}>
          <span className={styles.title}>Start with a quick baseline.</span>
          <span className={styles.sub}>
            A {state.pretestCount}-question check (no pass/fail) so we can measure exactly how much you gain.
          </span>
        </div>
        <span className={styles.cta}>Begin →</span>
      </Link>
    )
  }

  return null
}
