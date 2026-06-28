import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { LeagueStandings, StandingRow } from '@/lib/academy/leagues'
import { LEAGUE_TIERS, relegationStake } from '@/lib/academy/leagues-logic'
import { Icon } from '@/components/academy/ui/Icon'
import { LeagueCountdown } from './LeagueCountdown'
import styles from './leagues.module.css'

/** The pull-forward overtake target: the rank directly above you and the XP gap. */
export interface OvertakeTarget {
  gapXp: number
  rank: number
}

/**
 * Resolve the overtake target. Prefer the server-computed reward gap; fall back
 * to the standings already loaded (the learner directly above you this week).
 * Returns null when there's no one to chase (already #1, or no data).
 */
function resolveOvertake(
  you: StandingRow,
  rows: StandingRow[],
  nextRank: { gapXp: number } | null | undefined,
): OvertakeTarget | null {
  if (you.rank <= 1) return null
  if (nextRank && nextRank.gapXp > 0) {
    // The rank directly above you is, by definition, you.rank - 1.
    return { gapXp: nextRank.gapXp, rank: you.rank - 1 }
  }
  // Fallback: the row immediately ahead in the loaded standings.
  const ahead = rows.find((r) => r.rank === you.rank - 1)
  if (!ahead) return null
  const gap = Math.max(1, ahead.weeklyXp - you.weeklyXp + 1)
  return { gapXp: gap, rank: ahead.rank }
}

/** Avatar monogram from a real display name ("Maya R." to "MR"); falls back to last-2. */
function initials(handle: string): string {
  const parts = handle.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const letters = handle.replace(/[^a-zA-Z]/g, '')
  return (letters.slice(0, 2) || handle.slice(-2)).toUpperCase()
}

function fmtWeek(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00Z')
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const f = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${f(start)} – ${f(end)}`
}

const MOVEMENT_LABEL = { promote: 'Promotion zone', relegate: 'Relegation zone', hold: '' } as const

export function Leagues({
  standings,
  nextRank,
}: {
  standings: LeagueStandings
  nextRank?: { gapXp: number } | null
}) {
  const { tier, tierName, color, weekStart, total, rows, you, promoteZone, relegateZone, topTier, bottomTier, resetAt } =
    standings
  const rootStyle = { ['--tier']: color } as CSSProperties
  const thin = total < promoteZone + relegateZone
  const nextTier = topTier ? null : LEAGUE_TIERS[tier + 1]
  const overtake = resolveOvertake(you, rows, nextRank)
  const isLeader = you.rank <= 1
  const stake = relegationStake(you, rows, total, tier, relegateZone)
  // Name the person directly above for the overtake line ("X XP to pass Maya R.").
  const rival = overtake ? rows.find((r) => r.rank === overtake.rank && !r.isYou) : null

  return (
    <div className={styles.page} style={rootStyle}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <header className={styles.head}>
        <p className={styles.kicker}>Leagues</p>
        <h1 className={styles.title}>
          <span className={styles.gem} aria-hidden="true">
            <Icon name="trophy" size={22} />
          </span>
          {tierName} League
        </h1>
        <p className={styles.sub}>
          You’re <strong>#{you.rank}</strong> of {total} this week · {you.weeklyXp} XP earned · {fmtWeek(weekStart)}
        </p>
        <LeagueCountdown resetAt={resetAt} />
      </header>

      {/* Overtake hook — the visual hero. Pull the next rank forward as a
          near-miss with one dominant CTA to the fastest XP action (review). */}
      {overtake ? (
        <section className={styles.overtake} aria-labelledby="overtake-heading">
          <p className={styles.overtakeKicker}>Within reach</p>
          <p id="overtake-heading" className={styles.overtakeLine}>
            <strong className={styles.overtakeGap}>{overtake.gapXp} XP</strong> to pass{' '}
            <strong>{rival ? rival.handle : `#${overtake.rank}`}</strong> — one lab does it.
          </p>
          <Link href="/academy/review" className={styles.overtakeCta}>
            Earn XP now
            <Icon name="arrow-right" size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : isLeader ? (
        <section className={styles.overtake} data-leader="true" aria-labelledby="overtake-heading">
          <p className={styles.overtakeKicker}>Top of the table</p>
          <p id="overtake-heading" className={styles.overtakeLine}>
            You’re on top — <strong>defend it.</strong> One more lab keeps the gap open.
          </p>
          <Link href="/academy/review" className={styles.overtakeCta}>
            Defend your lead
            <Icon name="arrow-right" size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {/* tier ladder */}
      <ol className={styles.ladder} aria-label="League tiers">
        {LEAGUE_TIERS.map((t, i) => (
          <li
            key={t.key}
            className={`${styles.rung} ${i === tier ? styles.rungOn : ''} ${i < tier ? styles.rungPast : ''}`}
            style={{ ['--rung']: t.color } as CSSProperties}
          >
            <span className={styles.rungDot} aria-hidden="true" />
            <span className={styles.rungName}>{t.name}</span>
          </li>
        ))}
      </ol>

      {/* Loss-aversion stake — only when relegation can credibly bite (not bottom
          tier, not a population too thin to demote). Speaks to the learner's own
          line: how far above the drop, or how far back into safety. */}
      {stake.kind !== 'none' ? (
        <p
          className={`${styles.stake} ${stake.kind === 'relegating' ? styles.stakeDanger : styles.stakeSafe}`}
          role="status"
        >
          {stake.kind === 'safe' ? (
            <>
              <strong>Hold #{you.rank}</strong> — you’re{' '}
              <strong className={styles.stakeNum}>{stake.marginXp} XP</strong> above the drop. Don’t let it close.
            </>
          ) : (
            <>
              <strong>You’re in the drop zone.</strong> Earn{' '}
              <strong className={styles.stakeNum}>{stake.marginXp} XP</strong> to climb back to safety.
            </>
          )}
        </p>
      ) : null}

      <div className={styles.legend}>
        {!topTier ? (
          <span className={`${styles.legChip} ${styles.legPromote}`}>
            <Icon name="chevron-up" size={13} aria-hidden="true" /> Top {promoteZone} promote
          </span>
        ) : null}
        {/* Only advertise relegation when it can actually happen at this population —
            otherwise "Bottom 5 relegate" in a 4-player league reads as impossible. */}
        {!bottomTier && stake.kind !== 'none' ? (
          <span className={`${styles.legChip} ${styles.legRelegate}`}>
            <Icon name="chevron-down" size={13} aria-hidden="true" /> Bottom {relegateZone} relegate
          </span>
        ) : null}
        <span className={styles.legChip}>
          <Icon name="refresh" size={13} aria-hidden="true" /> Resets Monday — fresh start
        </span>
      </div>

      <div className={styles.ledger}>
        <ol className={styles.board}>
          {rows.map((r) => (
            <li
              key={r.rank}
              data-move={r.movement}
              className={`${styles.row} ${r.isYou ? styles.you : ''} ${styles[r.movement] ?? ''}`}
            >
              <span className={styles.rank}>{r.rank}</span>
              <span className={styles.avatar} aria-hidden="true">
                {r.handle === 'You' ? <Icon name="star" size={14} /> : initials(r.handle)}
              </span>
              <span className={styles.name}>{r.handle}</span>
              {r.movement !== 'hold' ? (
                <span className={styles.moveTag} role="img" aria-label={MOVEMENT_LABEL[r.movement]}>
                  <Icon name={r.movement === 'promote' ? 'chevron-up' : 'chevron-down'} size={14} aria-hidden="true" />
                </span>
              ) : null}
              <span className={styles.xp}>
                {r.weeklyXp} <span className={styles.xpUnit}>XP</span>
              </span>
            </li>
          ))}
        </ol>
        {/* empty ledger lines backfill the frame so a sparse board isn't a void */}
        <div className={styles.boardFill} aria-hidden="true" />
      </div>

      {/* Next-tier strip — a composed footer band under the board. */}
      {nextTier ? (
        <div className={styles.nextTier} style={{ ['--nextColor']: nextTier.color } as CSSProperties}>
          <span className={styles.nextTierGem} aria-hidden="true">
            <Icon name="trophy" size={18} />
          </span>
          <div className={styles.nextTierBody}>
            <span className={styles.nextTierLabel}>Next up</span>
            <span className={styles.nextTierName}>{nextTier.name} League</span>
          </div>
          <span className={styles.nextTierHint}>
            Top {promoteZone} promote — keep your streak
          </span>
        </div>
      ) : null}

      {thin ? (
        <p className={styles.thinNote}>
          Standings fill out as more learners earn XP this week. Keep your streak — every lesson, lab, and review
          moves you up.
        </p>
      ) : null}

      {topTier ? (
        <p className={styles.thinNote}>Diamond is the summit. There’s no promotion above this — hold your rank.</p>
      ) : null}
    </div>
  )
}
