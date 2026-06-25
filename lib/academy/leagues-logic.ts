/**
 * Pure league logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (getOrAssignCurrentLeague, getLeagueStandings) lives in
 * leagues.ts and imports from here so the tested logic IS the prod logic.
 *
 * Engagement-tier leagues (Duolingo model): learners compete on weekly XP inside
 * a tier; the top promote, the bottom relegate, and every week resets fresh.
 */

export const LEAGUE_TIERS = [
  { key: 'bronze', name: 'Bronze', color: '#cd7f32' },
  { key: 'silver', name: 'Silver', color: '#9aa3ad' },
  { key: 'gold', name: 'Gold', color: '#f5a623' },
  { key: 'sapphire', name: 'Sapphire', color: '#3D6BFF' },
  { key: 'ruby', name: 'Ruby', color: '#e0245e' },
  { key: 'diamond', name: 'Diamond', color: '#22d3ee' },
] as const

export type TierIndex = number // index into LEAGUE_TIERS

export const TOP_TIER: TierIndex = LEAGUE_TIERS.length - 1
export const PROMOTE_ZONE = 7 // top N promote to the next tier
export const RELEGATE_ZONE = 5 // bottom N relegate to the previous tier
export const LEAGUE_CAPACITY = 30 // soft cap per league instance

export function tierMeta(tier: TierIndex) {
  return LEAGUE_TIERS[Math.max(0, Math.min(TOP_TIER, tier))]
}

/** Where a learner seeds their first league — every 3 levels lifts one tier, capped. */
export function seedTierForLevel(level: number): TierIndex {
  return Math.max(0, Math.min(TOP_TIER, Math.floor((Math.max(1, level) - 1) / 3)))
}

export function nextTier(tier: TierIndex): TierIndex {
  return Math.min(TOP_TIER, tier + 1)
}
export function prevTier(tier: TierIndex): TierIndex {
  return Math.max(0, tier - 1)
}

export interface RankInput {
  userId: string
  weeklyXp: number
  /** ISO timestamp — earlier joiners win ties (rewards consistency, fully deterministic). */
  joinedAt?: string
}
export interface RankedMember extends RankInput {
  rank: number
}

/** Rank by weekly XP desc, tie-broken deterministically (joinedAt asc, then userId asc). */
export function rankMembers(members: RankInput[]): RankedMember[] {
  return [...members]
    .sort(
      (a, b) =>
        b.weeklyXp - a.weeklyXp ||
        (a.joinedAt ?? '').localeCompare(b.joinedAt ?? '') ||
        a.userId.localeCompare(b.userId),
    )
    .map((m, i) => ({ ...m, rank: i + 1 }))
}

export type Movement = 'promote' | 'relegate' | 'hold'

/**
 * Fate of a given rank at week rollover. Promotion is evaluated first, so in a
 * thin league (fewer members than the combined zones) nobody is both promoted
 * and relegated. Top tier can't promote; bottom tier can't relegate.
 */
export function movementForRank(rank: number, total: number, tier: TierIndex): Movement {
  if (tier < TOP_TIER && rank <= PROMOTE_ZONE) return 'promote'
  if (tier > 0 && rank > total - RELEGATE_ZONE) return 'relegate'
  return 'hold'
}
