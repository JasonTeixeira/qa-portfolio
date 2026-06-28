/**
 * Pure trigger logic — NO 'server-only', NO DB. Unit-testable in isolation.
 * The DB-touching layer (getTriggers) lives in triggers.ts and imports from here
 * so the tested logic IS the prod logic.
 *
 * Triggers are the loop's ENTRY: timely, in-app nudges that bring the learner back
 * to the single right next action. computeTriggers is a deterministic, total pure
 * function of a state snapshot — it never reads Date.now/Math.random, never touches
 * the DB, and returns [] when the learner is on track (nothing should interrupt
 * someone who's already doing the right thing).
 *
 * Priority order is intentional and load-bearing (highest urgency first):
 *   1. streak-risk      — an active streak about to break TODAY (loss aversion)
 *   2. reviews-due      — spaced-repetition cards are due (retention decays)
 *   3. near-cert        — a certificate is within reach (completion pull)
 *   4. daily-goal-close — today's goal is more than half done (finish-line pull)
 *   5. comeback         — the learner has lapsed for days (re-engagement)
 *   6. first-step       — they've never started a lesson (activation)
 */

export type TriggerKind =
  | 'streak-risk'
  | 'reviews-due'
  | 'near-cert'
  | 'daily-goal-close'
  | 'comeback'
  | 'first-step'

/** Tone drives the banner's semantic color + icon — never decorative. */
export type TriggerTone = 'urgent' | 'warm' | 'neutral'

export interface Trigger {
  /** Stable, unique key for React lists and session-dismiss memory. */
  key: TriggerKind
  kind: TriggerKind
  tone: TriggerTone
  /** Short, learner-facing nudge. Plain text — the banner renders a tone icon. */
  message: string
  /** The call-to-action label on the link. */
  cta: string
  /** Where the CTA sends the learner — always an internal academy route. */
  href: string
}

/**
 * The snapshot computeTriggers evaluates. Built upstream by getTriggers from real
 * service-role reads (streaks, reviews, daily goals, in-progress course). Every
 * field is honest — never client-claimed.
 */
export interface TriggerState {
  /** True when the streak was already advanced today (last_active_date == today). */
  streakActiveToday: boolean
  /** Current streak length in days (0 = no streak). */
  currentStreak: number
  /**
   * Whole hours until the current streak resets (the local-day boundary), when the
   * streak is at risk (no activity yet today). Computed by the server caller from
   * the real clock and passed in so this module stays pure/deterministic. Null when
   * unknown or not at risk. Clamped to >= 1 by the caller so copy never reads "0h".
   */
  hoursUntilReset: number | null
  /** Count of spaced-repetition cards due now. */
  reviewsDue: number
  /** Lessons left to finish the nearest in-progress course's certificate, or null. */
  lessonsToCert: number | null
  /** Percent of today's XP goal already earned, clamped [0, 100]. */
  dailyGoalPct: number
  /** Whole days since the learner was last active (0 = active today). */
  lapsedDays: number
  /** True once the learner has started at least one lesson. */
  startedAnyLesson: boolean
}

const REVIEW_HREF = '/academy/review'

// Tunable thresholds — named so the rules read as intent, not magic numbers.
const NEAR_CERT_LESSONS = 2 // "you're N lessons from a certificate" fires at <= this
const DAILY_GOAL_NEAR_PCT = 50 // half-way to today's goal → finish-line nudge
const COMEBACK_LAPSED_DAYS = 2 // away this many whole days → welcome-back nudge

/**
 * Compute the prioritised list of triggers that should fire for this snapshot.
 *
 * Deterministic + total: same state always yields the same array, in the same
 * order. Returns [] when nothing fires (the learner is on track — don't nudge).
 *
 * `resumeHref` is the learner's resume point (their continue-to lesson, else the
 * catalog) and is used by the triggers that send the learner back into content.
 */
export function computeTriggers(state: TriggerState, resumeHref: string): Trigger[] {
  const triggers: Trigger[] = []

  // 1. streak-risk — an active streak that hasn't been kept alive today. When the
  // server supplies the real hours-until-reset, name the deadline (sharper loss
  // aversion: a concrete countdown beats a vague "at risk").
  if (state.currentStreak >= 1 && !state.streakActiveToday) {
    const hrs = state.hoursUntilReset
    const message =
      hrs !== null && hrs > 0
        ? `Your ${state.currentStreak}-day streak resets in ${hrs}h — one lesson saves it`
        : `Your ${state.currentStreak}-day streak is at risk — a 2-minute review keeps it alive`
    triggers.push({
      key: 'streak-risk',
      kind: 'streak-risk',
      tone: 'urgent',
      message,
      cta: 'Keep it alive',
      href: REVIEW_HREF,
    })
  }

  // 2. reviews-due — spaced-repetition cards are due now.
  if (state.reviewsDue >= 1) {
    const plural = state.reviewsDue === 1 ? 'review is' : 'reviews are'
    triggers.push({
      key: 'reviews-due',
      kind: 'reviews-due',
      tone: 'warm',
      message: `${state.reviewsDue} ${plural} due — lock in what you've learned`,
      cta: 'Start review',
      href: REVIEW_HREF,
    })
  }

  // 3. near-cert — a certificate is within a lesson or two.
  if (state.lessonsToCert !== null && state.lessonsToCert > 0 && state.lessonsToCert <= NEAR_CERT_LESSONS) {
    const plural = state.lessonsToCert === 1 ? 'lesson' : 'lessons'
    triggers.push({
      key: 'near-cert',
      kind: 'near-cert',
      tone: 'warm',
      message: `You're ${state.lessonsToCert} ${plural} from a certificate — finish strong`,
      cta: 'Resume course',
      href: resumeHref,
    })
  }

  // 4. daily-goal-close — today's goal is past halfway but not yet met.
  if (state.dailyGoalPct >= DAILY_GOAL_NEAR_PCT && state.dailyGoalPct < 100) {
    triggers.push({
      key: 'daily-goal-close',
      kind: 'daily-goal-close',
      tone: 'neutral',
      message: `You're ${Math.round(state.dailyGoalPct)}% to today's goal — close the ring`,
      cta: 'Earn XP',
      href: resumeHref,
    })
  }

  // 5. comeback — the learner has been away for a couple of days.
  if (state.lapsedDays >= COMEBACK_LAPSED_DAYS) {
    triggers.push({
      key: 'comeback',
      kind: 'comeback',
      tone: 'neutral',
      message: 'Welcome back — pick up right where you left off',
      cta: 'Resume',
      href: resumeHref,
    })
  }

  // 6. first-step — they've never started a lesson (lowest priority: activation).
  if (!state.startedAnyLesson) {
    triggers.push({
      key: 'first-step',
      kind: 'first-step',
      tone: 'warm',
      message: 'Start your first lesson — the whole path opens from here',
      cta: 'Start learning',
      href: resumeHref,
    })
  }

  return triggers
}
