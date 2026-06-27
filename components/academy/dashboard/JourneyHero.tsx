import Link from 'next/link'
import type { GoalProgress } from '@/lib/academy/goal-logic'
import styles from './journey-hero.module.css'

const ONBOARDING_HREF = '/academy/onboarding'

interface JourneyHeroProps {
  /** Computed by the sibling's computeGoalProgress() upstream; null = no goal set. */
  progress: GoalProgress | null
  /** Where the "next milestone" CTA sends the learner (their resume point or catalog). */
  nextHref: string
}

/**
 * "YOUR JOURNEY" — the reason a learner returns. A prominent hero band at the top
 * of the dashboard that measures real progress toward the learner's chosen goal.
 *
 * Has a goal  → goal label (serif) + progress ring + next-milestone CTA + a compact
 *               milestone trail (done = mastery check, next = accent, upcoming = locked).
 * No goal yet → a warm prompt to set one, linking into the goal picker.
 *
 * Pure presentational server component: all goal math is done upstream by the
 * sibling's computeGoalProgress() and handed in as `progress`.
 */
export function JourneyHero({ progress, nextHref }: JourneyHeroProps) {
  if (!progress) {
    return (
      <section className={styles.hero} aria-labelledby="journey-heading">
        <div className={styles.promptBand}>
          <p className={styles.kicker}>Your journey</p>
          <h2 id="journey-heading" className={styles.promptTitle}>
            Pick a destination. We’ll chart the path.
          </h2>
          <p className={styles.promptBody}>
            Set a goal and every lesson, lab, and certificate starts pointing the same
            direction — so you always know the next move.
          </p>
          <Link href={ONBOARDING_HREF} className={styles.promptCta}>
            Set a goal to start your journey →
          </Link>
        </div>
      </section>
    )
  }

  const pct = Math.max(0, Math.min(100, Math.round(progress.pct)))
  const complete = pct >= 100
  // The first not-yet-done milestone marks the "next" step in the trail.
  const nextKey = progress.nextMilestone?.key ?? null

  return (
    <section className={styles.hero} aria-labelledby="journey-heading">
      <div className={styles.band}>
        <div className={styles.lead}>
          <p className={styles.kicker}>Your journey</p>
          <h2 id="journey-heading" className={styles.goalLabel}>
            {progress.label}
          </h2>

          {complete ? (
            <p className={styles.nextDone}>
              <span className={styles.nextCheck} aria-hidden="true">
                ✓
              </span>
              Goal reached — you’ve done the whole path.
            </p>
          ) : progress.nextMilestone ? (
            <Link href={nextHref} className={styles.nextCta}>
              <span className={styles.nextKicker}>Next</span>
              <span className={styles.nextLabel}>{progress.nextMilestone.label}</span>
              <span className={styles.nextArrow} aria-hidden="true">
                →
              </span>
            </Link>
          ) : null}
        </div>

        <Ring pct={pct} />
      </div>

      <ol className={styles.trail} aria-label="Milestones on your path">
        {progress.milestones.map((m) => {
          const isNext = !m.done && m.key === nextKey
          const state = m.done ? styles.mDone : isNext ? styles.mNext : styles.mUpcoming
          const glyph = m.done ? '✓' : isNext ? '◆' : '○'
          const srState = m.done ? 'complete' : isNext ? 'up next' : 'upcoming'
          return (
            <li key={m.key} className={`${styles.milestone} ${state}`}>
              <span className={styles.mGlyph} aria-hidden="true">
                {glyph}
              </span>
              <span className={styles.mLabel}>{m.label}</span>
              <span className={styles.srOnly}> — {srState}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** Honest progress ring — real % toward the goal. Part of the design system, not decoration. */
function Ring({ pct }: { pct: number }) {
  const size = 92
  const stroke = 7
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const done = pct >= 100
  return (
    <div className={styles.ringWrap}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={styles.ring}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress toward your goal"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ac-rule-strong)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? 'var(--ac-mastery)' : 'var(--ac-accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className={styles.ringPct}>
          {pct}%
        </text>
      </svg>
      <span className={styles.ringCaption}>to goal</span>
    </div>
  )
}
