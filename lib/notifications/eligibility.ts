/**
 * Pure notification eligibility — NO 'server-only', NO I/O. Unit-testable.
 * Frequency caps, send-time windows, and streak-at-risk detection so the cron
 * (notifications-engine.ts) and tests share the exact same decision logic.
 */

export type NotificationType = 'streak_save' | 'review_due' | 'league_rollover' | 'streak_milestone'

/** Minimum hours between same-type sends to one learner (anti-spam frequency cap). */
export const FREQUENCY_CAP_HOURS: Record<NotificationType, number> = {
  streak_save: 20, // at most ~once per day
  review_due: 20,
  league_rollover: 144, // weekly
  streak_milestone: 1,
}

/** True when a same-type notification was sent too recently to send again. */
export function withinFrequencyCap(
  type: NotificationType,
  lastSentISO: string | null,
  nowISO: string,
): boolean {
  if (!lastSentISO) return false // never sent → not capped
  const capMs = FREQUENCY_CAP_HOURS[type] * 3_600_000
  return Date.parse(nowISO) - Date.parse(lastSentISO) < capMs
}

/** Local hour-of-day (0–23) for an instant in the given IANA timezone. */
export function localHourInTz(now: Date, timeZone: string): number {
  try {
    const h = new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(now)
    const n = parseInt(h, 10)
    return n === 24 ? 0 : n // some runtimes emit "24" for midnight
  } catch {
    return now.getUTCHours()
  }
}

/** Only deliver reminders inside the learner's waking window (local hours). */
export function isWithinSendWindow(localHour: number, startHour = 9, endHour = 21): boolean {
  return localHour >= startHour && localHour < endHour
}

export interface StreakRiskInput {
  current: number
  lastActive: string | null
  today: string
  localHour: number
  /** Hour after which a streak-save nudge is warranted (don't nag in the morning). */
  riskHour?: number
}

/**
 * A streak is "at risk" when the learner has a live streak (≥1), hasn't been
 * active today, and it's late enough in their local day that the streak could
 * actually lapse before they return.
 */
export function streakAtRisk(input: StreakRiskInput): boolean {
  const riskHour = input.riskHour ?? 17
  if (input.current < 1) return false
  if (input.lastActive === input.today) return false // already safe today
  return input.localHour >= riskHour
}

export interface ReminderDecision {
  send: boolean
  reason: string
}

/** The single eligibility gate for a streak-save reminder, combining all rules. */
export function shouldSendStreakReminder(args: {
  current: number
  lastActive: string | null
  today: string
  localHour: number
  lastSentISO: string | null
  nowISO: string
  hasChannel: boolean
}): ReminderDecision {
  if (!args.hasChannel) return { send: false, reason: 'no_channel' }
  if (!streakAtRisk(args)) return { send: false, reason: 'not_at_risk' }
  if (!isWithinSendWindow(args.localHour)) return { send: false, reason: 'outside_window' }
  if (withinFrequencyCap('streak_save', args.lastSentISO, args.nowISO)) {
    return { send: false, reason: 'frequency_capped' }
  }
  return { send: true, reason: 'eligible' }
}
