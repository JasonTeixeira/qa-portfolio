import type { CSSProperties } from 'react'
import Link from 'next/link'
import type { LeagueStandings, StandingRow } from '@/lib/academy/leagues'
import { LEAGUE_TIERS } from '@/lib/academy/leagues-logic'
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
  const { tier, tierName, color, weekStart, total, rows, you, promoteZone, relegateZone, topTier, bottomTier } =
    standings
  const rootStyle = { ['--tier']: color } as CSSProperties
  const thin = total < promoteZone + relegateZone
  const nextTier = topTier ? null : LEAGUE_TIERS[tier + 1]
  const overtake = resolveOvertake(you, rows, nextRank)
  const isLeader = you.rank <= 1

  return (
    <div className={styles.page} style={rootStyle}>
      <div className={styles.atmosphere} aria-hidden="true" />

      <header className={styles.head}>
        <p className={styles.kicker}>Leagues</p>
        <h1 className={styles.title}>
          <span className={styles.gem} aria-hidden="true">
            ◆
          </span>
          {tierName} League
        </h1>
        <p className={styles.sub}>
          You’re <strong>#{you.rank}</strong> of {total} this week · {you.weeklyXp} XP earned · {fmtWeek(weekStart)}
        </p>
      </header>

      {/* Overtake hook — the visual hero. Pull the next rank forward as a
          near-miss with one dominant CTA to the fastest XP action (review). */}
      {overtake ? (
        <section className={styles.overtake} aria-labelledby="overtake-heading">
          <p className={styles.overtakeKicker}>Within reach</p>
          <p id="overtake-heading" className={styles.overtakeLine}>
            You’re <strong className={styles.overtakeGap}>{overtake.gapXp} XP</strong> from{' '}
            <strong>#{overtake.rank}</strong> — one lab does it.
          </p>
          <Link href="/academy/review" className={styles.overtakeCta}>
            Earn XP now →
          </Link>
        </section>
      ) : isLeader ? (
        <section className={styles.overtake} data-leader="true" aria-labelledby="overtake-heading">
          <p className={styles.overtakeKicker}>Top of the table</p>
          <p id="overtake-heading" className={styles.overtakeLine}>
            You’re on top — <strong>defend it.</strong> One more lab keeps the gap open.
          </p>
          <Link href="/academy/review" className={styles.overtakeCta}>
            Defend your lead →
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

      <div className={styles.legend}>
        {!topTier ? <span className={`${styles.legChip} ${styles.legPromote}`}>▲ Top {promoteZone} promote</span> : null}
        {!bottomTier ? (
          <span className={`${styles.legChip} ${styles.legRelegate}`}>▼ Bottom {relegateZone} relegate</span>
        ) : null}
        <span className={styles.legChip}>↻ Resets Monday — fresh start</span>
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
                {r.handle === 'You' ? '★' : r.handle.slice(-2)}
              </span>
              <span className={styles.name}>{r.handle}</span>
              {r.movement !== 'hold' ? (
                <span className={styles.moveTag} aria-label={MOVEMENT_LABEL[r.movement]}>
                  {r.movement === 'promote' ? '▲' : '▼'}
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
            ◆
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
