import { BADGE_CATALOG } from '@/lib/academy/badges-logic'
import type { EarnedBadge } from '@/lib/academy/badges-logic'
import styles from './badge-shelf.module.css'

/**
 * The collectible shelf: every catalog badge, shown earned (full) or locked
 * (dimmed, blurred label) so the learner sees what's left to chase. Earned state
 * is server-verified upstream — this is purely presentational.
 */
export function BadgeShelf({ earned }: { earned: EarnedBadge[] }) {
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
