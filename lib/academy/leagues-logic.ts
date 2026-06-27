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

/**
 * The learner's loss-aversion stake: how the relegation line reads for *them*.
 * `relegating` — already in the drop zone (XP needed to climb clear).
 * `safe` — above the line, with the buffer (XP) to the first relegating rank.
 * `none` — relegation can't apply (bottom tier, or the zone can't bite at this
 *   population so the "Bottom N relegate" rule would be self-contradicting).
 *
 * `dropLineRank` is the best rank that still relegates (total - relegateZone + 1),
 * i.e. the worst surviving position is one above it.
 */
export interface RelegationStake {
  kind: 'relegating' | 'safe' | 'none'
  /** Rank gap to the relegation line (positive = how far above; 0 when on/below it). */
  marginXp: number
  yourRank: number
  dropLineRank: number
}

/**
 * Personalize the relegation stake for the learner. Returns 'none' at the bottom
 * tier, or when the league is too thin for the relegation zone to actually demote
 * anyone (total <= relegateZone means everyone would relegate — incoherent — so we
 * suppress the stake rather than show an impossible threat).
 */
export function relegationStake(
  you: { rank: number; weeklyXp: number },
  rows: ReadonlyArray<{ rank: number; weeklyXp: number }>,
  total: number,
  tier: TierIndex,
  relegateZone: number = RELEGATE_ZONE,
): RelegationStake {
  const base = { yourRank: you.rank, dropLineRank: Math.max(1, total - relegateZone + 1) }
  // Bottom tier can't relegate; a league no larger than the zone can't coherently
  // demote a "bottom N" because that would be everyone (or more).
  if (tier <= 0 || total <= relegateZone) {
    return { kind: 'none', marginXp: 0, ...base }
  }
  const firstDropRank = total - relegateZone // worst SAFE rank is this; rank > this relegates
  if (you.rank > firstDropRank) {
    // In the drop zone: XP to overtake the lowest safe seat and climb clear.
    const safeSeat = rows.find((r) => r.rank === firstDropRank)
    const need = safeSeat ? Math.max(1, safeSeat.weeklyXp - you.weeklyXp + 1) : 1
    return { kind: 'relegating', marginXp: need, ...base }
  }
  // Safe: distance to the first relegating learner directly below the line.
  const firstRelegating = rows.find((r) => r.rank === firstDropRank + 1)
  const margin = firstRelegating ? Math.max(0, you.weeklyXp - firstRelegating.weeklyXp) : 0
  return { kind: 'safe', marginXp: margin, ...base }
}

/**
 * The instant this week's league resets: the next Monday 00:00 UTC strictly after
 * `now`. Derived from the current-week Monday so it always lands in the future
 * (a learner viewing on Monday 00:00 gets a full 7 days, not 0). Pure — the client
 * countdown ticks against this ISO string.
 */
export function leagueResetAt(now: Date): string {
  const dow = (now.getUTCDay() + 6) % 7 // Mon=0 … Sun=6
  const reset = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dow + 7, 0, 0, 0, 0),
  )
  return reset.toISOString()
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
