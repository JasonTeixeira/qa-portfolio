import Link from 'next/link'
import type { NextRewards } from '@/lib/academy/reward-logic'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import styles from './next-up.module.css'

interface NextUpProps {
  rewards: NextRewards
  /** Where the badge/level near-miss CTAs send the learner (resume point or catalog). */
  nextHref: string
  /**
   * When true, render every lane as a calm supporting row with NO internal hero —
   * used when NextUp sits beneath the resume action hero, so the page has exactly
   * one hero-scale block. Defaults to false (NextUp elects + promotes its own hero).
   */
  compact?: boolean
}

/**
 * A single near-miss lane, normalised so hero-election and the supporting row can
 * treat badge / level / league uniformly. `pct` is the completion toward the reward
 * (0–100) and is what we elect the hero by — the closest-to-done lane wins. League
 * has no honest pct, so it never becomes the hero, only a supporting line.
 */
interface Lane {
  id: 'badge' | 'level' | 'league'
  glyph: IconName
  /** Bold near-miss figure, e.g. "1 lesson", "40 XP". */
  lead: string
  /** The rest of the line, e.g. "to unlock Five Lessons". */
  toward: string
  href: string
  /** Completion toward this reward, or null when there's no honest progress bar. */
  pct: number | null
  /** Screen-reader label for the progress bar (only when pct != null). */
  barLabel?: string
}

/** Build the present lanes (closest reward in each surfaced track), in priority order. */
function buildLanes(rewards: NextRewards, nextHref: string): Lane[] {
  const { nextBadge, xpToNextLevel, levelPct, nextRank } = rewards
  const lanes: Lane[] = []

  if (nextBadge) {
    lanes.push({
      id: 'badge',
      glyph: 'star',
      lead: nextBadge.remainingLabel,
      toward: `to unlock ${nextBadge.label}`,
      href: '/academy/profile',
      pct: nextBadge.pct,
      barLabel: `${nextBadge.pct}% toward ${nextBadge.label}`,
    })
  }

  if (xpToNextLevel > 0 && levelPct > 0) {
    lanes.push({
      id: 'level',
      glyph: 'bolt',
      lead: `${xpToNextLevel} XP`,
      toward: 'to your next level',
      href: nextHref,
      pct: levelPct,
      barLabel: `${levelPct}% to the next level`,
    })
  }

  if (nextRank) {
    lanes.push({
      id: 'league',
      glyph: 'arrow-up-right',
      lead: `${nextRank.gapXp} XP`,
      toward: `to overtake ${nextRank.aheadOfRankLabel}`,
      href: '/academy/leagues',
      pct: null,
    })
  }

  return lanes
}

/**
 * Elect the ONE dominant "do this next" lane: the reward the learner is closest to
 * finishing (highest pct). Lanes with no honest pct (league) are never elected.
 * Returns the hero plus the remaining lanes, so the caller renders exactly one
 * hero and demotes the rest to a quiet supporting row.
 */
function electHero(lanes: Lane[]): { hero: Lane | null; rest: Lane[] } {
  let hero: Lane | null = null
  for (const lane of lanes) {
    if (lane.pct === null) continue
    // Strict > keeps the earlier (higher-priority) lane on ties.
    if (hero === null || lane.pct > (hero.pct ?? -1)) hero = lane
  }
  if (!hero) return { hero: null, rest: lanes }
  return { hero, rest: lanes.filter((l) => l !== hero) }
}

/**
 * "NEXT UP" — the near-miss surface, now with a single dominant hero. The reward the
 * learner is closest to finishing is promoted to hero scale (large figure, one
 * primary CTA, a literal progress bar); the other near-misses sit in a small,
 * unmistakably secondary row beneath it. Every figure is server-derived
 * (computeNextRewards upstream) — no fabricated urgency.
 *
 * Renders nothing when there's no reward to chase — restraint over an empty band.
 */
export function NextUp({ rewards, nextHref, compact = false }: NextUpProps) {
  const lanes = buildLanes(rewards, nextHref)
  if (lanes.length === 0) return null

  const { hero, rest } = electHero(lanes)
  // No hero-scale block: when compact (the resume action is already the hero), or when
  // only a league lane exists (no honest pct to promote). Render a calm strip instead.
  //
  // Compact drops BOTH the card chrome and the kicker: it is nested inside a bento
  // panel that already draws the hairline card and prints the "NEXT UP" label, so
  // repeating either would render a card-in-a-card under a duplicated heading.
  if (compact || !hero) {
    return (
      <section className={compact ? styles.stripBare : styles.strip} aria-label="Next up">
        {compact ? null : <p className={styles.kicker}>Next up</p>}
        <ul className={styles.supportRow}>
          {lanes.map((lane) => (
            <SupportingItem key={lane.id} lane={lane} />
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className={styles.strip} aria-label="Next up">
      <p className={styles.kicker}>Closest reward</p>

      <Link href={hero.href} className={styles.hero}>
        <span className={styles.heroGlyph} aria-hidden="true">
          <Icon name={hero.glyph} size={22} />
        </span>
        <span className={styles.heroBody}>
          <span className={styles.heroLine}>
            <strong className={styles.heroLead}>{hero.lead}</strong>{' '}
            <span className={styles.heroToward}>{hero.toward}</span>
          </span>
          {hero.pct !== null ? (
            <span
              className={styles.heroBar}
              role="progressbar"
              aria-valuenow={hero.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={hero.barLabel}
            >
              <span className={styles.heroBarFill} style={{ width: `${hero.pct}%` }} />
            </span>
          ) : null}
        </span>
        <span className={styles.heroCta}>
          Finish lesson
          <Icon name="arrow-right" size={16} aria-hidden />
        </span>
      </Link>

      {rest.length > 0 ? (
        <ul className={styles.supportRow}>
          {rest.map((lane) => (
            <SupportingItem key={lane.id} lane={lane} />
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** A demoted near-miss: a single tight line, no hero weight. */
function SupportingItem({ lane }: { lane: Lane }) {
  return (
    <li className={styles.item}>
      <Link href={lane.href} className={styles.link}>
        <span className={styles.glyph} aria-hidden="true">
          <Icon name={lane.glyph} size={15} />
        </span>
        <span className={styles.body}>
          <span className={styles.line}>
            <strong className={styles.lead}>{lane.lead}</strong>
            <span className={styles.toward}> {lane.toward}</span>
          </span>
          {lane.pct !== null ? (
            <span
              className={styles.bar}
              role="progressbar"
              aria-valuenow={lane.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={lane.barLabel}
            >
              <span className={styles.barFill} style={{ width: `${lane.pct}%` }} />
            </span>
          ) : (
            <span className={styles.leagueHint}>Climb a rank this week</span>
          )}
        </span>
      </Link>
    </li>
  )
}
