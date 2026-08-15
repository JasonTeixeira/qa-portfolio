import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { levelForXp } from '@/lib/academy/gamification-logic'
import { getLearnerStats } from '@/lib/academy/goals'
import { earnedBadgeKeys } from '@/lib/academy/badges-logic'
import { getOrAssignCurrentLeague } from '@/lib/academy/leagues'
import { rankMembers } from '@/lib/academy/leagues-logic'
import {
  computeNextRewards,
  type NextRewards,
  type RewardStats,
} from '@/lib/academy/reward-logic'

// Re-export the pure surface so server importers have a single entry point.
export { computeNextRewards } from '@/lib/academy/reward-logic'
export type { NextRewards, NextBadge, NextRank, RewardStats } from '@/lib/academy/reward-logic'

/** Non-identifying display handle (no PII), matching the league standings convention. */
function displayHandle(userId: string): string {
  return `Learner ${userId.slice(0, 4).toUpperCase()}`
}

/**
 * The learner's near-miss bundle: the closest unearned badge, the XP to the next
 * level, and the weekly-league gap to the rank above. Read-only — gathers the
 * same server-verified facts the dashboard/badge surfaces already use, then runs
 * the pure computeNextRewards. Best-effort: never throws (a near-miss strip must
 * not break a dashboard render). Falls back to an empty bundle on failure.
 */
export async function getNextRewards(userId: string): Promise<NextRewards> {
  const empty: NextRewards = { nextBadge: null, xpToNextLevel: 0, levelPct: 0, nextRank: null }
  try {
    const admin = supabaseAdmin()

    // Badge stats = learner stats + all-time longest streak (the badge snapshot).
    const [stats, { data: streak }, { data: xpRow }] = await Promise.all([
      getLearnerStats(userId),
      admin.from('academy_streaks').select('longest_length').eq('user_id', userId).maybeSingle(),
      admin.from('academy_xp').select('total_xp').eq('user_id', userId).maybeSingle(),
    ])

    const rewardStats: RewardStats = { ...stats, longestStreak: streak?.longest_length ?? 0 }
    const earned = earnedBadgeKeys(rewardStats)
    const totalXp = xpRow?.total_xp ?? 0

    // The learner's seated league + its roster, ranked by this week's league XP.
    let leagueStandings:
      | { userId: string; weeklyXp: number; handle: string }[]
      | undefined
    try {
      const { leagueId } = await getOrAssignCurrentLeague(userId)
      const { data: members } = await admin
        .from('academy_league_members')
        .select('user_id, weekly_xp, joined_at')
        .eq('league_id', leagueId)
      const ranked = rankMembers(
        (members ?? []).map((m) => ({
          userId: m.user_id as string,
          weeklyXp: (m.weekly_xp as number) ?? 0,
          joinedAt: m.joined_at as string,
        })),
      )
      leagueStandings = ranked.map((m) => ({
        userId: m.userId,
        weeklyXp: m.weeklyXp,
        handle: m.userId === userId ? 'You' : displayHandle(m.userId),
      }))
    } catch (err) {
      // League is non-critical to the near-miss strip — degrade gracefully.
      console.error('[academy/rewards] league standings unavailable', err)
    }

    return computeNextRewards({
      stats: rewardStats,
      earnedBadgeKeys: earned,
      totalXp,
      level: levelForXp(totalXp),
      leagueStandings,
      currentUserId: userId,
    })
  } catch (err) {
    console.error('[academy/rewards] getNextRewards failed', err)
    return empty
  }
}
