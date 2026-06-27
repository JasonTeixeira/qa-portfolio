import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/server'
import { getLearnerStats } from '@/lib/academy/goals'
import {
  BADGE_CATALOG,
  earnedBadgeKeys,
  getBadge,
  type BadgeStats,
  type EarnedBadge,
} from '@/lib/academy/badges-logic'
import { emitAcademyEvent } from '@/lib/academy/events'

// Re-export the pure surface so server importers have a single entry point.
export { BADGE_CATALOG, earnedBadgeKeys, getBadge } from '@/lib/academy/badges-logic'
export type { Badge, BadgeStats, EarnedBadge } from '@/lib/academy/badges-logic'

/**
 * Roll the learner's engagement into the badge stat snapshot: getLearnerStats
 * plus the all-time longest streak (academy_streaks.longest_length). Service-role.
 */
async function getBadgeStats(userId: string): Promise<BadgeStats> {
  const admin = supabaseAdmin()
  const [stats, { data: streak }] = await Promise.all([
    getLearnerStats(userId),
    admin.from('academy_streaks').select('longest_length').eq('user_id', userId).maybeSingle(),
  ])
  return { ...stats, longestStreak: streak?.longest_length ?? 0 }
}

/**
 * The learner's earned badges, joined to the catalog (label/blurb/icon), newest
 * first. Rows whose badge_key is no longer in the catalog are dropped. Service-role
 * read; the caller is responsible for passing a server-derived userId.
 */
export async function getEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const admin = supabaseAdmin()
    const { data } = await admin
      .from('academy_badges')
      .select('badge_key, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    const rows = data ?? []
    return rows.flatMap((row) => {
      const badge = getBadge(row.badge_key as string)
      if (!badge) return []
      return [
        {
          key: badge.key,
          label: badge.label,
          blurb: badge.blurb,
          icon: badge.icon,
          earnedAt: row.earned_at as string,
        },
      ]
    })
  } catch (err) {
    console.error('[academy/badges] getEarnedBadges failed', err)
    return []
  }
}

/**
 * Server-verified reconciliation: compute the keys the learner has genuinely
 * earned from their REAL stats and insert any that are newly-earned via the
 * service role (ignore-duplicates on the unique (user_id, badge_key)).
 * Idempotent. Returns the keys that were newly inserted (for the celebration).
 * Best-effort: never throws — a failure here must not block lesson completion.
 */
export async function reconcileBadges(userId: string): Promise<string[]> {
  try {
    const admin = supabaseAdmin()
    const stats = await getBadgeStats(userId)
    const earned = earnedBadgeKeys(stats)
    if (earned.length === 0) return []

    // Which keys does the learner already hold? Only insert the genuinely new ones,
    // so we can report exactly the newly-earned set for the celebration.
    const { data: existingRows } = await admin
      .from('academy_badges')
      .select('badge_key')
      .eq('user_id', userId)
      .in('badge_key', earned)
    const held = new Set((existingRows ?? []).map((r) => r.badge_key as string))
    const newKeys = earned.filter((k) => !held.has(k))
    if (newKeys.length === 0) return []

    const now = new Date().toISOString()
    const { error } = await admin
      .from('academy_badges')
      .upsert(
        newKeys.map((badge_key) => ({ user_id: userId, badge_key, earned_at: now })),
        { onConflict: 'user_id,badge_key', ignoreDuplicates: true },
      )
    if (error) {
      console.error('[academy/badges] reconcileBadges insert failed', error)
      return []
    }
    // STAGE 2 instrumentation (best-effort): one badge_earned per newly-awarded badge.
    for (const badgeKey of newKeys) await emitAcademyEvent(userId, 'badge_earned', { badgeKey })
    return newKeys
  } catch (err) {
    console.error('[academy/badges] reconcileBadges failed', err)
    return []
  }
}

/** Total badges defined — handy for "earned of N" UI copy without leaking checks. */
export const TOTAL_BADGES = BADGE_CATALOG.length
