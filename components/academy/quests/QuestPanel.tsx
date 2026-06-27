import type { QuestProgress } from '@/lib/academy/quest-logic'
import styles from './quest-panel.module.css'

/** One quest row: label, honest progress bar, count + done check. */
function QuestRow({ quest }: { quest: QuestProgress }) {
  const pct = quest.target > 0 ? Math.round((quest.progress / quest.target) * 100) : 0
  return (
    <li className={`${styles.row} ${quest.done ? styles.rowDone : ''}`}>
      <span className={styles.check} aria-hidden="true">
        {quest.done ? '✓' : '○'}
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
}: {
  kicker: string
  summary: string
  quests: QuestProgress[]
}) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <span className={styles.kicker}>{kicker}</span>
        <span className={styles.summary}>{summary}</span>
      </div>
      <ul className={styles.list}>
        {quests.map((q) => (
          <QuestRow key={q.key} quest={q} />
        ))}
      </ul>
    </div>
  )
}

interface QuestPanelProps {
  daily: QuestProgress[]
  weekly: QuestProgress[]
}

/**
 * Compact "Today" + "This week" quest list. Progress is honest — every value is
 * server-derived from the learner's real activity (see lib/academy/quests.ts).
 * Renders nothing when there are no quests at all (defensive; catalogs are
 * non-empty in practice).
 */
export function QuestPanel({ daily, weekly }: QuestPanelProps) {
  if (daily.length === 0 && weekly.length === 0) return null

  const dailyDone = daily.filter((q) => q.done).length
  const weeklyDone = weekly.filter((q) => q.done).length

  const dailySummary =
    daily.length === 0
      ? ''
      : dailyDone === daily.length
        ? '✓ All done today'
        : dailyDone > 0
          ? `${dailyDone}/${daily.length} done`
          : 'None yet — pick one off'

  const weeklySummary =
    weekly.length === 0
      ? ''
      : weeklyDone === weekly.length
        ? '✓ All done this week'
        : weeklyDone > 0
          ? `${weeklyDone}/${weekly.length} done`
          : 'None yet — a full week to go'

  return (
    <section className={styles.panel} aria-label="Quests">
      {daily.length > 0 ? (
        <QuestGroup kicker="Today" summary={dailySummary} quests={daily} />
      ) : null}
      {weekly.length > 0 ? (
        <QuestGroup kicker="This week" summary={weeklySummary} quests={weekly} />
      ) : null}
    </section>
  )
}
