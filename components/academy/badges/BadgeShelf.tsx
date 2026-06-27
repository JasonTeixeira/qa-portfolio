import { BADGE_CATALOG } from '@/lib/academy/badges-logic'
import type { EarnedBadge } from '@/lib/academy/badges-logic'
import type { NextBadge } from '@/lib/academy/reward-logic'
import styles from './badge-shelf.module.css'

interface BadgeShelfProps {
  earned: EarnedBadge[]
  /** The closest unearned badge — surfaced as a pull-forward hero (null = none left). */
  nextBadge?: NextBadge | null
}

/**
 * The collectible shelf: a NEXT BADGE hero (the closest unearned badge with a
 * literal progress bar) pulling the learner forward, then every catalog badge
 * shown earned (full) or locked (dimmed, blurred label). Earned + next-badge
 * state are server-verified upstream — this is purely presentational.
 */
export function BadgeShelf({ earned, nextBadge = null }: BadgeShelfProps) {
  const earnedByKey = new Map(earned.map((b) => [b.key, b]))
  const earnedCount = earnedByKey.size
  const total = BADGE_CATALOG.length

  return (
    <section className={styles.card} aria-labelledby="badge-shelf-heading">
      <header className={styles.head}>
        <p className={styles.kicker}>Achievements</p>
        <h2 id="badge-shelf-heading" className={styles.title}>
          Your badges
        </h2>
        <p className={styles.sub}>
          Collectible milestones, earned from your real progress — never claimed, always proven.{' '}
          <span className={styles.count}>
            {earnedCount} of {total} unlocked
          </span>
          .
        </p>
      </header>

      {nextBadge ? (
        <div className={styles.next} aria-label="Your next badge">
          <span className={styles.nextKicker}>Next badge</span>
          <div className={styles.nextRow}>
            <span className={styles.nextIcon} aria-hidden="true">
              ◆
            </span>
            <div className={styles.nextBody}>
              <p className={styles.nextLine}>
                <strong>{nextBadge.remainingLabel}</strong> to unlock{' '}
                <span className={styles.nextName}>{nextBadge.label}</span>
              </p>
              <span
                className={styles.nextBar}
                role="progressbar"
                aria-valuenow={nextBadge.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${nextBadge.pct}% toward ${nextBadge.label}`}
              >
                <span className={styles.nextFill} style={{ width: `${nextBadge.pct}%` }} />
              </span>
            </div>
            <span className={styles.nextPct}>{nextBadge.pct}%</span>
          </div>
        </div>
      ) : null}

      <ul className={styles.grid} aria-label="Achievement badges">
        {BADGE_CATALOG.map((badge) => {
          const got = earnedByKey.get(badge.key)
          const isEarned = Boolean(got)
          return (
            <li key={badge.key}>
              <div
                className={`${styles.badge} ${isEarned ? styles.earned : styles.locked}`}
                aria-label={
                  isEarned
                    ? `${badge.label}, earned: ${badge.blurb}`
                    : `Locked badge: ${badge.blurb}`
                }
              >
                <span className={styles.icon} aria-hidden="true">
                  {isEarned ? badge.icon : '·'}
                </span>
                <span className={styles.label} aria-hidden={!isEarned}>
                  {isEarned ? badge.label : 'Locked'}
                </span>
                <span className={styles.blurb}>{badge.blurb}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
