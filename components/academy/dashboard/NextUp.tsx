import Link from 'next/link'
import type { NextRewards } from '@/lib/academy/reward-logic'
import styles from './next-up.module.css'

interface NextUpProps {
  rewards: NextRewards
  /** Where the badge/level near-miss CTAs send the learner (resume point or catalog). */
  nextHref: string
}

/**
 * "NEXT UP" — the near-miss strip. Turns static inventory into pull-forward: the
 * closest unearned badge, the XP-to-next-level near-win, and the weekly-league
 * gap, each a single tight line with a literal progress bar. Every figure is
 * server-derived (computeNextRewards upstream) — no fabricated urgency.
 *
 * Renders nothing when there's no reward to chase (all badges earned, no league,
 * fresh learner with 0 XP) — restraint over an empty band.
 */
export function NextUp({ rewards, nextHref }: NextUpProps) {
  const { nextBadge, xpToNextLevel, levelPct, nextRank } = rewards
  const showLevel = xpToNextLevel > 0 && levelPct > 0
  const hasAny = Boolean(nextBadge) || showLevel || Boolean(nextRank)
  if (!hasAny) return null

  return (
    <section className={styles.strip} aria-label="Next up">
      <p className={styles.kicker}>Next up</p>
      <ul className={styles.items}>
        {nextBadge ? (
          <li className={styles.item}>
            <Link href="/academy/profile" className={styles.link}>
              <span className={styles.glyph} aria-hidden="true">
                ◆
              </span>
              <span className={styles.body}>
                <span className={styles.line}>
                  <strong className={styles.lead}>{nextBadge.remainingLabel}</strong>
                  <span className={styles.toward}>
                    {' '}
                    to unlock <em>{nextBadge.label}</em>
                  </span>
                </span>
                <span
                  className={styles.bar}
                  role="progressbar"
                  aria-valuenow={nextBadge.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${nextBadge.pct}% toward ${nextBadge.label}`}
                >
                  <span className={styles.barFill} style={{ width: `${nextBadge.pct}%` }} />
                </span>
              </span>
            </Link>
          </li>
        ) : null}

        {showLevel ? (
          <li className={styles.item}>
            <Link href={nextHref} className={styles.link}>
              <span className={styles.glyph} aria-hidden="true">
                ▲
              </span>
              <span className={styles.body}>
                <span className={styles.line}>
                  <strong className={styles.lead}>{xpToNextLevel} XP</strong>
                  <span className={styles.toward}> to your next level</span>
                </span>
                <span
                  className={styles.bar}
                  role="progressbar"
                  aria-valuenow={levelPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${levelPct}% to the next level`}
                >
                  <span className={styles.barFill} style={{ width: `${levelPct}%` }} />
                </span>
              </span>
            </Link>
          </li>
        ) : null}

        {nextRank ? (
          <li className={styles.item}>
            <Link href="/academy/leagues" className={styles.link}>
              <span className={styles.glyph} aria-hidden="true">
                ↑
              </span>
              <span className={styles.body}>
                <span className={styles.line}>
                  <strong className={styles.lead}>{nextRank.gapXp} XP</strong>
                  <span className={styles.toward}>
                    {' '}
                    to overtake {nextRank.aheadOfRankLabel}
                  </span>
                </span>
                <span className={styles.leagueHint}>Climb a rank this week</span>
              </span>
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  )
}
