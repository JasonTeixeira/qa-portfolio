/**
 * Pure community logic — NO 'server-only', NO DB. Unit-testable.
 * Friend streaks (relatedness mechanic) + friendship guards. A friend streak
 * counts consecutive days BOTH friends were active — shared accountability.
 */

export function yesterdayOf(today: string): string {
  return new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10)
}

/**
 * Advance a friend streak when both friends are active "today". Same day → no
 * change; consecutive day → +1; a gap → reset to 1. Called once a pair completes
 * a shared active day.
 */
export function bumpFriendStreak(
  prev: { streak: number; lastBothActive: string | null },
  today: string,
): { streak: number; lastBothActive: string; increased: boolean } {
  if (prev.lastBothActive === today) return { streak: prev.streak, lastBothActive: today, increased: false }
  if (prev.lastBothActive === yesterdayOf(today)) {
    return { streak: prev.streak + 1, lastBothActive: today, increased: true }
  }
  return { streak: 1, lastBothActive: today, increased: true }
}

/** A friend streak is "alive" if the pair was both-active today or yesterday. */
export function friendStreakAlive(lastBothActive: string | null, today: string): boolean {
  if (!lastBothActive) return false
  return lastBothActive === today || lastBothActive === yesterdayOf(today)
}

/** Order-independent key for a friendship pair (dedup / lookup). */
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('::')
}

export type FriendReason = 'ok' | 'not_found' | 'self' | 'exists'

/** Whether a friend request may be created. */
export function friendRequestCheck(
  requesterId: string,
  targetId: string | null,
  alreadyLinked: boolean,
): { ok: boolean; reason: FriendReason } {
  if (!targetId) return { ok: false, reason: 'not_found' }
  if (requesterId === targetId) return { ok: false, reason: 'self' }
  if (alreadyLinked) return { ok: false, reason: 'exists' }
  return { ok: true, reason: 'ok' }
}
