import type { CSSProperties } from 'react'
import type { LeagueStandings } from '@/lib/academy/leagues'
import { LEAGUE_TIERS } from '@/lib/academy/leagues-logic'
import styles from './leagues.module.css'

function fmtWeek(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00Z')
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const f = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  return `${f(start)} – ${f(end)}`
}

const MOVEMENT_LABEL = { promote: 'Promotion zone', relegate: 'Relegation zone', hold: '' } as const

export function Leagues({ standings }: { standings: LeagueStandings }) {
  const { tier, tierName, color, weekStart, total, rows, you, promoteZone, relegateZone, topTier, bottomTier } =
    standings
  const rootStyle = { ['--tier']: color } as CSSProperties
  const thin = total < promoteZone + relegateZone

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
