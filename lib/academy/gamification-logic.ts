/**
 * Pure gamification logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (recordActivityAndAward, getGamification) lives in
 * gamification.ts and imports from here so the tested logic IS the prod logic.
 */

export const XP_REWARDS = { lesson: 20, lab: 30, quiz: 15, review: 10 } as const
export type XpSource = keyof typeof XP_REWARDS

export const XP_PER_LEVEL = 150
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365]

export function levelForXp(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1
}

export interface GamificationState {
  streak: { current: number; longest: number; freezes: number; activeToday: boolean }
  xp: { total: number; weekly: number; level: number; intoLevel: number; toNext: number; pct: number }
  dailyGoal: { goalXp: number; todayXp: number; met: boolean }
  awarded?: { xp: number; leveledUp: boolean; streakIncreased: boolean; freezeUsed: boolean; goalJustMet: boolean }
}

export function xpView(total: number, weekly: number) {
  const level = levelForXp(total)
  const intoLevel = total - (level - 1) * XP_PER_LEVEL
  return { total, weekly, level, intoLevel, toNext: XP_PER_LEVEL - intoLevel, pct: Math.round((intoLevel / XP_PER_LEVEL) * 100) }
}

/** ISO date (YYYY-MM-DD) for `now` in the given IANA timezone. */
export function dateInTz(now: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return now.toISOString().slice(0, 10)
  }
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}

export function isoWeekStart(today: string): string {
  const d = new Date(today + 'T00:00:00Z')
  const dow = (d.getUTCDay() + 6) % 7 // Mon=0
  d.setUTCDate(d.getUTCDate() - dow)
  return d.toISOString().slice(0, 10)
}

/**
 * Pure streak transition. Same calendar day → no change. Consecutive day → +1.
 * Exactly one missed day with a freeze available → +1 and consume a freeze.
 * Bigger gap (or no freeze) → reset to 1. `increased` is true whenever today is a
 * new active day (milestone celebrations filter on the resulting value).
 */
export function computeStreakTransition(
  prev: { current: number; lastActive: string | null; freezes: number },
  today: string,
): { current: number; freezes: number; freezeUsed: boolean; increased: boolean } {
  if (prev.lastActive === today) {
    return { current: prev.current, freezes: prev.freezes, freezeUsed: false, increased: false }
  }
  if (!prev.lastActive) {
    return { current: 1, freezes: prev.freezes, freezeUsed: false, increased: true }
  }
  const gap = daysBetween(prev.lastActive, today)
  if (gap === 1) return { current: prev.current + 1, freezes: prev.freezes, freezeUsed: false, increased: true }
  if (gap === 2 && prev.freezes > 0) {
    return { current: prev.current + 1, freezes: prev.freezes - 1, freezeUsed: true, increased: true }
  }
  return { current: 1, freezes: prev.freezes, freezeUsed: false, increased: true }
}

export type Celebration = { kind: 'level' | 'streak' | 'goal'; value: number; label: string; sub: string }

/** The single most significant celebration to show after an award (or null). */
export function pickCelebration(state: GamificationState): Celebration | null {
  const a = state.awarded
  if (!a) return null
  if (a.leveledUp) return { kind: 'level', value: state.xp.level, label: `Level ${state.xp.level}`, sub: 'Level up!' }
  if (a.streakIncreased && STREAK_MILESTONES.includes(state.streak.current)) {
    return { kind: 'streak', value: state.streak.current, label: `${state.streak.current}-day streak`, sub: 'Don’t break the chain' }
  }
  if (a.goalJustMet) return { kind: 'goal', value: state.dailyGoal.goalXp, label: 'Daily goal hit', sub: `${state.dailyGoal.goalXp} XP today` }
  return null
}
