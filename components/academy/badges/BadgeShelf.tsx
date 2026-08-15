import type { CSSProperties } from 'react'
import { BADGE_CATALOG, capstoneBadge } from '@/lib/academy/badges-logic'
import type { EarnedBadge, NextBadgeStep } from '@/lib/academy/badges-logic'
import type { NextBadge } from '@/lib/academy/reward-logic'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './badge-shelf.module.css'

interface BadgeShelfProps {
  earned: EarnedBadge[]
  /** The closest unearned badge — surfaced as a pull-forward hero (null = none left). */
  nextBadge?: NextBadge | null
  /**
   * The ordered chain of nearest unearned badges (closest first). The closest is
   * the hero; the following 1–2 render as a "then…" trail so finishing one hook
   * immediately re-arms the next. Server-derived; presentational only.
   */
  nextChain?: NextBadgeStep[]
}

/**
 * The collectible shelf: a collection-progress meter ("3 of 8 · 5 to go") that
 * makes the incomplete set feel closeable, a NEXT BADGE hero (closest unearned,
 * literal progress bar) with a "then…" chain teasing the following rungs, then
 * every catalog badge shown earned (full) or locked (dimmed icon, blurred label).
 * All earned + distance state is server-verified upstream — purely presentational.
 */
export function BadgeShelf({ earned, nextBadge = null, nextChain = [] }: BadgeShelfProps) {
  const earnedByKey = new Map(earned.map((b) => [b.key, b]))
  const earnedCount = earnedByKey.size
  const total = BADGE_CATALOG.length
  const remaining = Math.max(0, total - earnedCount)
  const collectionPct = total > 0 ? Math.round((earnedCount / total) * 100) : 0
  const isComplete = remaining === 0
  // The "then…" trail = chain rungs after the hero (skip the one shown as hero).
  const heroKey = nextBadge?.key
  const trail = nextChain.filter((s) => s.key !== heroKey).slice(0, 2)
  // The capstone the meter climbs toward: the catalog's final badge. Holding the
  // FULL set culminates in this — the only honest "100%" the system actually backs
  // (no invented reward; just the real last badge). `capstoneEarned` gates whether
  // the meter frames it as a goal still to reach or a status already held.
  const capstone = capstoneBadge()
  const capstoneEarned = capstone ? earnedByKey.has(capstone.key) : false

  return (
    <section className={styles.card} aria-labelledby="badge-shelf-heading">
      <header className={styles.head}>
        <p className={styles.kicker}>Achievements</p>
        <h2 id="badge-shelf-heading" className={styles.title}>
          Your badges
        </h2>
        <p className={styles.sub}>
          Collectible milestones, earned from your real progress — never claimed, always proven.
        </p>
      </header>

      <div className={styles.collection} aria-label="Collection progress">
        <div className={styles.collectionTop}>
          <span className={styles.collectionCount}>
            <strong>{earnedCount}</strong> of {total} badges earned
          </span>
          <span className={styles.collectionGo}>
            {isComplete ? 'Full collection' : `${remaining} to go`}
          </span>
        </div>
        <span
          className={styles.collectionBar}
          role="progressbar"
          aria-valuenow={collectionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            isComplete
              ? `Full collection: all ${total} badges earned`
              : `${earnedCount} of ${total} badges collected${
                  capstone ? `, climbing toward ${capstone.label}` : ''
                }`
          }
        >
          <span className={styles.collectionFill} style={{ width: `${collectionPct}%` }} />
          {/* The capstone marker pinned at 100% — the meter visibly climbs toward the
              catalog's final badge, not an empty "set complete" string. */}
          {capstone ? (
            <span
              className={`${styles.capstoneMark} ${capstoneEarned ? styles.capstoneMarkLit : ''}`}
              aria-hidden="true"
            >
              <Icon name={capstone.icon} size={16} />
            </span>
          ) : null}
        </span>
        {capstone ? (
          <p className={styles.capstoneLine}>
            {isComplete ? (
              <>
                <span className={styles.capstoneStatus}>Full collection</span> — every badge
                earned, capped by{' '}
                <span className={styles.capstoneName}>{capstone.label}</span>.
              </>
            ) : (
              <>
                100% completes the set —{' '}
                <span className={styles.capstoneName}>{capstone.label}</span> is the capstone:{' '}
                {capstone.blurb.replace(/\.$/, '').toLowerCase()}.
              </>
            )}
          </p>
        ) : null}
      </div>

      {nextBadge ? (
        <div className={styles.next} aria-label="Your next badge">
          <span className={styles.nextKicker}>Next badge</span>
          <div className={styles.nextRow}>
            <span className={styles.nextIcon} aria-hidden="true">
              <Icon name="trophy" size={20} />
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
          {trail.length > 0 ? (
            <ol className={styles.trail} aria-label="Badges after that">
              {trail.map((step, i) => (
                <li
                  key={step.key}
                  className={styles.trailItem}
                  /* Progression index drives a stepped recede: rung 0 (closest) is
                     brightest/largest, later rungs dim + shrink so the chain reads as
                     building momentum. Compositor-only (scale + opacity). */
                  style={{ '--step': i } as CSSProperties}
                >
                  <span className={styles.trailGlyph} aria-hidden="true">
                    <Icon name={step.icon} size={16} />
                  </span>
                  <span className={styles.trailText}>
                    then {step.teaser} <span className={styles.trailName}>{step.label}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
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
                  {isEarned ? <Icon name={badge.icon} size={22} /> : <Icon name="lock" size={18} />}
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
