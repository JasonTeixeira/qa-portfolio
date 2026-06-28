import type { QuestProgress } from '@/lib/academy/quest-logic'
import {
  BONUS_VARIES_TEASE,
  bonusHeadline,
  bonusSeedFromString,
  resolveDailyBonus,
  type BonusState,
  type DailyBonus,
  type QuestMetric,
} from '@/lib/academy/quest-logic'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './quest-panel.module.css'

/** One quest row: label, honest progress bar, count + done check. */
function QuestRow({ quest, lead }: { quest: QuestProgress; lead?: boolean }) {
  const pct = quest.target > 0 ? Math.round((quest.progress / quest.target) * 100) : 0
  return (
    <li className={`${styles.row} ${quest.done ? styles.rowDone : ''} ${lead ? styles.rowLead : ''}`}>
      <span className={styles.check} aria-hidden="true">
        {quest.done ? <Icon name="check" size={13} /> : null}
      </span>
      <div className={styles.body}>
        <span className={styles.label}>{quest.label}</span>
        <div
          role="progressbar"
          aria-valuenow={quest.progress}
          aria-valuemin={0}
          aria-valuemax={quest.target}
          aria-label={`${quest.label}: ${quest.progress} of ${quest.target}${quest.done ? ' (complete)' : ''}`}
          className={styles.track}
        >
          <span className={styles.fill} style={{ width: `${pct}%` }} aria-hidden="true" />
        </div>
      </div>
      <span className={styles.count}>
        {quest.progress}
        <span className={styles.countDim}>/{quest.target}</span>
      </span>
    </li>
  )
}

/** A scoped quest list with an honest empty/none-done state. */
function QuestGroup({
  kicker,
  summary,
  quests,
  leadKey,
}: {
  kicker: string
  summary: string
  quests: QuestProgress[]
  /** Key of the single "what to do now" quest to spotlight, if any. */
  leadKey?: string | null
}) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <span className={styles.kicker}>{kicker}</span>
        <span className={styles.summary}>{summary}</span>
      </div>
      <ul className={styles.list}>
        {quests.map((q) => (
          <QuestRow key={q.key} quest={q} lead={q.key === leadKey} />
        ))}
      </ul>
    </div>
  )
}

/**
 * The variable-ratio reward banner — the visual LEAD of the quest panel. Reads
 * as today's claimable prize: a big honest headline value (2x / +N XP), what it
 * is, and how to collect it. The "varies daily" tease surfaces the Hooked
 * variable-ratio anticipation WITHOUT promising a specific future value (it's
 * deterministic-but-unknown to the learner — that's the hook), so it stays
 * truthful: the bonus genuinely changes every UTC day and resets at midnight.
 *
 * Honest data: the reward amount, headline, and collected flag are all
 * server-derived (BonusState); the panel only renders them. armed -> collected
 * flips to a mastery-green "banked" payoff (the claim moment).
 *
 * a11y: state is never color-only — armed vs collected, the headline, and the
 * arm/collect instruction are all carried in the accessible name; no
 * opacity-on-text.
 */
function BonusBanner({ bonus }: { bonus: BonusState }) {
  const collected = bonus.collected
  const headline = bonusHeadline(bonus)
  const armLabel = bonus.metric === 'reviewsToday' ? 'Do a review to collect' : 'Finish a lesson to collect'
  const kicker = collected ? 'Bonus collected' : 'Today’s surprise bonus'
  const ariaLabel = collected
    ? `Daily surprise bonus collected: ${headline}, ${bonus.label}. ${bonus.rewardXp} XP banked. A new surprise unlocks tomorrow.`
    : `Daily surprise bonus armed: ${headline}, ${bonus.label}. ${armLabel}. ${BONUS_VARIES_TEASE}.`
  return (
    <div
      className={`${styles.bonus} ${collected ? styles.bonusDone : styles.bonusArmed}`}
      role="status"
      aria-label={ariaLabel}
    >
      <span className={styles.bonusIcon} aria-hidden="true">
        <Icon name={collected ? 'check' : 'sparkle'} size={18} />
      </span>
      <div className={styles.bonusBody}>
        <span className={styles.bonusKicker} aria-hidden="true">
          <span className={styles.bonusState}>{kicker}</span>
        </span>
        <span className={styles.bonusHeadlineRow} aria-hidden="true">
          <span className={styles.bonusHeadline}>{headline}</span>
          <span className={styles.bonusLabel}>{bonus.label}</span>
        </span>
        <span className={styles.bonusHint} aria-hidden="true">
          {collected ? (
            <>
              <span className={styles.bonusBanked}>+{bonus.rewardXp} XP banked</span>
              <span className={styles.bonusTease}> · tomorrow’s is a new surprise</span>
            </>
          ) : (
            <>
              <span className={styles.bonusArm}>{armLabel}</span>
              <span className={styles.bonusTease}> · {BONUS_VARIES_TEASE}</span>
            </>
          )}
        </span>
      </div>
    </div>
  )
}

interface QuestPanelProps {
  daily: QuestProgress[]
  weekly: QuestProgress[]
  /**
   * Today's server-verified surprise bonus (from getDailyBonus). When omitted,
   * the panel reconstructs an honest presentational bonus from the daily quest
   * rows it already holds (eligibility maps to the real daily-lesson/-review
   * rows shown below). Pass the server value to show the exact awarded XP.
   */
  bonus?: BonusState
}

/**
 * Build a deterministic presentational bonus from the daily quest rows alone,
 * for when the server BonusState prop isn't wired through. Pure — the seed is
 * derived from the daily quest progress signature (no Date/Math.random), and
 * "collected" maps to the real daily-lesson / daily-review quest completion the
 * learner already sees. The reward amount is a small fixed surprise; the
 * authoritative XP comes from the server prop when present.
 */
function deriveBonusFromDaily(daily: QuestProgress[]): BonusState | null {
  if (daily.length === 0) return null
  const lesson = daily.find((q) => q.key === 'daily-lesson')
  const review = daily.find((q) => q.key === 'daily-review')
  // Seed from the quest keys + targets so the surprise is stable within a render
  // and varies as the catalog evolves, without reaching for Date/random.
  const signature = daily.map((q) => `${q.key}:${q.target}`).join('|')
  const seed = bonusSeedFromString(signature)
  // 3-in-5 -> lesson multiplier, else review flat — same split shape as dailyBonus.
  const multiplierDay = seed % 5 < 3
  const arm: QuestProgress | undefined = multiplierDay ? lesson : review
  if (!arm) return null
  const metric: QuestMetric = multiplierDay ? 'lessonsToday' : 'reviewsToday'
  const multiplier = (seed >>> 3) % 4 === 0 ? 3 : 2
  const flatXp = (seed >>> 3) % 4 >= 2 ? 15 : 10
  const bonusSpec: DailyBonus = multiplierDay
    ? { seed, kind: 'multiplier', metric, target: 1, multiplier, flatXp: 0, label: `${multiplier}× XP on your next lesson` }
    : { seed, kind: 'flat', metric, target: 1, multiplier: 1, flatXp, label: `+${flatXp} surprise XP for a review` }
  // Resolve against the real arming quest's progress (honest activity).
  return resolveDailyBonus(bonusSpec, {
    lessonsToday: lesson?.progress ?? 0,
    xpToday: 0,
    reviewsToday: review?.progress ?? 0,
    lessonsThisWeek: 0,
    labsThisWeek: 0,
    streakDays: 0,
  })
}

/** Pick the single "what to do now" — first not-done daily quest, else first not-done weekly. */
function leadQuestKey(daily: QuestProgress[], weekly: QuestProgress[]): string | null {
  const d = daily.find((q) => !q.done)
  if (d) return d.key
  const w = weekly.find((q) => !q.done)
  return w ? w.key : null
}

/**
 * Compact "Today" + "This week" quest board with a variable-ratio surprise
 * bonus. Progress is honest — every value is server-derived from the learner's
 * real activity (see lib/academy/quests.ts). The bonus surfaces the Hooked
 * "variable reward": a payout that changes per day/learner but is deterministic
 * and server-verified, collected only by doing the real activity it targets.
 */
export function QuestPanel({ daily, weekly, bonus }: QuestPanelProps) {
  if (daily.length === 0 && weekly.length === 0) return null

  const effectiveBonus = bonus ?? deriveBonusFromDaily(daily)
  const leadKey = leadQuestKey(daily, weekly)

  const dailyDone = daily.filter((q) => q.done).length
  const weeklyDone = weekly.filter((q) => q.done).length

  const dailySummary =
    daily.length === 0
      ? ''
      : dailyDone === daily.length
        ? 'All done — resets at UTC midnight'
        : dailyDone > 0
          ? `${dailyDone}/${daily.length} done · resets 00:00 UTC`
          : 'Fresh board · resets 00:00 UTC'

  const weeklySummary =
    weekly.length === 0
      ? ''
      : weeklyDone === weekly.length
        ? 'All done this week'
        : weeklyDone > 0
          ? `${weeklyDone}/${weekly.length} done`
          : 'None yet — a full week to go'

  return (
    <section className={styles.panel} aria-label="Quests">
      {effectiveBonus ? (
        <div className={styles.bonusWrap}>
          <BonusBanner bonus={effectiveBonus} />
        </div>
      ) : null}
      {daily.length > 0 ? (
        <QuestGroup kicker="Today" summary={dailySummary} quests={daily} leadKey={leadKey} />
      ) : null}
      {weekly.length > 0 ? (
        <QuestGroup kicker="This week" summary={weeklySummary} quests={weekly} leadKey={leadKey} />
      ) : null}
    </section>
  )
}
