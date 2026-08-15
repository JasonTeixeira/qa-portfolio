'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { gradeReview } from '@/app/academy/_actions/reviews'
import type { DueReview, ReviewGrade } from '@/lib/academy/fsrs'
import { CelebrationToast } from '@/components/academy/celebration/CelebrationToast'
import { XP_REWARDS, type Celebration } from '@/lib/academy/gamification-logic'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './review.module.css'

/**
 * Recall Queue — the FSRS spaced-recall flashcard flow, reskinned to the Sage
 * Academy "Recall · six minutes, not homework" design. Real data throughout:
 * the due-card queue, per-card recall window, and retention stat are all
 * FSRS-derived, and each rating calls the real `gradeReview` action which
 * reschedules the card via ts-fsrs. Presentation only — no scheduling here.
 */
const GRADES: { key: ReviewGrade; label: string; sub: string }[] = [
  { key: 'again', label: 'Again', sub: 'Forgot' },
  { key: 'hard', label: 'Hard', sub: 'Struggled' },
  { key: 'good', label: 'Good', sub: 'Recalled' },
  { key: 'easy', label: 'Easy', sub: 'Instant' },
]

/** Days from now until `iso`, floored at 1 — "next review in ~D days". */
function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(1, Math.round(ms / 86_400_000))
}

/** Course slug → a readable "Course 00 · concept" kicker, mirroring the design. */
function kickerFor(card: DueReview): string {
  const course = card.courseSlug ? card.courseSlug.replace(/-/g, ' ') : 'Recall'
  const concept = card.lessonSlug ? card.lessonSlug.replace(/-/g, ' ') : card.conceptKey.replace(/-/g, ' ')
  return `${course} · ${concept}`
}

/**
 * Framing for the SAME flashcard flow. `queue` is the full Recall-Queue page
 * ("Recall · six minutes, not homework" + retention stat). `daily` is the
 * Daily-Rep streak-shield page ("Daily Rep · six minutes, shields the streak"
 * + a gold streak pill + streak-shield footer). Only header/footer copy and the
 * right-hand stat differ — the card, dots, reveal, and FSRS grading are identical.
 */
type ReviewVariant = 'daily' | 'queue'

const BRAND_KICKER: Record<ReviewVariant, string> = {
  queue: 'Recall · six minutes, not homework',
  daily: 'Daily Rep · six minutes, shields the streak',
}

const FOOTER_COPY: Record<ReviewVariant, string> = {
  queue: 'FSRS reschedules each card at 90% target retention — the science of not forgetting.',
  daily:
    "clear the rep and today's streak is shielded · miss two days and concepts start to fade",
}

export function ReviewSession({
  initialCards,
  retention = null,
  variant = 'queue',
  streakDays = null,
}: {
  initialCards: DueReview[]
  /** Real mean FSRS retrievability (%) across reviewed cards, or null to omit. */
  retention?: number | null
  /** Header/footer framing: full Recall Queue vs the Daily-Rep streak shield. */
  variant?: ReviewVariant
  /** Real current streak length (days) from academy_streaks; null to omit the pill. */
  streakDays?: number | null
}) {
  const router = useRouter()
  const [cards] = useState(initialCards)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [pending, setPending] = useState(false)
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const [streak, setStreak] = useState<number | null>(null)
  const [soonestNextDue, setSoonestNextDue] = useState<string | null>(null)
  // Count only cards the server actually graded (each awards XP_REWARDS.review).
  const [strengthened, setStrengthened] = useState(0)
  const current = cards[index]

  async function grade(g: ReviewGrade) {
    if (!current || pending) return
    setPending(true)
    try {
      const res = await gradeReview(current.id, g)
      if (res && res.ok) setStrengthened((n) => n + 1)
      if (res && 'celebration' in res && res.celebration) setCelebration(res.celebration)
      if (res && typeof res.streak === 'number') setStreak(res.streak)
      if (res && res.nextDueAt) {
        setSoonestNextDue((prev) => (!prev || res.nextDueAt! < prev ? res.nextDueAt! : prev))
      }
    } catch {
      /* best-effort; the queue advances regardless (earns no XP) */
    }
    setPending(false)
    setRevealed(false)
    setIndex((i) => i + 1)
    router.refresh() // update the header streak/XP/Review-badge live
  }

  const total = cards.length
  const brandKicker = <span className={styles.brandKicker}>{BRAND_KICKER[variant]}</span>

  // Right-hand stat. Daily Rep: a gold streak pill — "at stake" only when a rep
  // is actually due today, otherwise honestly "shielded". Queue: retention %.
  const rightStat =
    variant === 'daily'
      ? streakDays != null && streakDays > 0
        ? (() => {
            const shielded = index >= total // every due rep cleared this session
            const label = total === 0 || shielded ? 'shielded' : 'at stake'
            return (
              <span className={styles.streakPill} data-shielded={shielded || total === 0}>
                ◆ {streakDays}-day streak · {label}
              </span>
            )
          })()
        : null
      : retention != null
        ? <span className={styles.retention}>retention {retention}%</span>
        : null

  // ── EMPTY: nothing due — the design's "Queue clear" success summary ─────
  if (total === 0) {
    return (
      <div className={styles.stage}>
        <div className={styles.topbar}>
          {brandKicker}
          {rightStat}
        </div>
        <main className={styles.center}>
          <div className={styles.shell}>
            <div className={styles.summary}>
              <p className={styles.summaryKicker}>Queue clear</p>
              <h1 className={styles.summaryTitle}>You&rsquo;re all caught up.</h1>
              <p className={styles.summaryBody}>
                Nothing&rsquo;s due right now. Prompts resurface on their FSRS schedule, exactly
                when you&rsquo;re about to forget &mdash; nothing to remember to remember.
              </p>
              <div className={styles.summaryActions}>
                <Link href="/academy/dashboard" className={styles.successBtn}>
                  Back to My Learning
                  <Icon name="arrow-right" size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── DONE: session complete ──────────────────────────────────────────────
  if (index >= total) {
    const memoriesLabel = `${strengthened} ${strengthened === 1 ? 'memory' : 'memories'} strengthened`
    const xpEarned = strengthened * XP_REWARDS.review
    const nextInDays = soonestNextDue ? daysUntil(soonestNextDue) : null
    return (
      <div className={styles.stage}>
        <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
        <div className={styles.topbar}>
          {brandKicker}
          {rightStat}
        </div>
        <main className={styles.center}>
          <div className={styles.shell}>
            <div
              className={`${styles.summary} ${styles.summaryEnter}`}
              role="status"
              aria-live="polite"
            >
              <p className={styles.summaryKicker}>Queue clear</p>
              <h1 className={styles.summaryTitle}>Session complete.</h1>
              <ul className={styles.doneStats}>
                <li className={styles.doneStat}>
                  <span className={styles.doneStatNum}>{memoriesLabel}</span>
                </li>
                {xpEarned > 0 ? (
                  <li className={styles.doneStat} data-tone="xp">
                    <span className={styles.doneStatNum}>+{xpEarned} XP earned</span>
                  </li>
                ) : null}
                {streak ? (
                  <li className={styles.doneStat} data-tone="streak">
                    <span className={styles.doneStatNum}>
                      <Icon name="flame" size={15} aria-hidden="true" /> Streak locked in · {streak}{' '}
                      {streak === 1 ? 'day' : 'days'}
                    </span>
                  </li>
                ) : null}
              </ul>
              <p className={styles.summaryBody}>
                {nextInDays
                  ? `Each card returns right before you'd forget it — your next review lands in ~${nextInDays} ${nextInDays === 1 ? 'day' : 'days'}.`
                  : "Each card returns right before you'd forget it."}
              </p>
              <div className={styles.summaryActions}>
                <Link href="/academy/dashboard" className={styles.successBtn}>
                  Back to My Learning
                  <Icon name="arrow-right" size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── ACTIVE: one due card ────────────────────────────────────────────────
  return (
    <div className={styles.stage}>
      <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
      <div className={styles.topbar}>
        {brandKicker}
        {rightStat}
      </div>

      <main className={styles.center}>
        <div className={styles.shell}>
          {/* progress dots + "i of N" */}
          <div className={styles.dots}>
            {cards.map((c, i) => (
              <span
                key={c.id}
                className={styles.dot}
                data-state={i < index ? 'done' : i === index ? 'active' : 'todo'}
                aria-hidden="true"
              />
            ))}
            <span className={styles.dotCounter}>
              {index + 1} of {total}
            </span>
          </div>

          {/* the card */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.kicker}>{kickerFor(current)}</span>
              <span className={styles.due}>due · {current.intervalLabel}</span>
            </div>
            <p className={styles.question}>{current.prompt}</p>

            {!revealed ? (
              <>
                <div className={styles.showRow}>
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={() => setRevealed(true)}
                  >
                    Show answer
                  </button>
                </div>
                <p className={styles.hint}>think first &mdash; the retrieval IS the rep</p>
              </>
            ) : (
              <div className={styles.answerArea}>
                <p className={styles.answerLabel}>Rate your recall</p>
                <p className={styles.answerBody}>
                  Explain the idea out loud or in code, as if teaching it &mdash; the retrieval is
                  the rep.
                  {current.lessonSlug && current.courseSlug ? (
                    <>
                      {' '}
                      <Link
                        href={`/academy/learn/${current.courseSlug}/${current.lessonSlug}`}
                        className={styles.revisit}
                      >
                        Check yourself against the lesson
                        <Icon name="arrow-right" size={13} aria-hidden="true" />
                      </Link>
                    </>
                  ) : null}
                </p>
                <div className={styles.grades}>
                  {GRADES.map((gr) => (
                    <button
                      key={gr.key}
                      type="button"
                      data-grade={gr.key}
                      className={styles.grade}
                      disabled={pending}
                      onClick={() => grade(gr.key)}
                    >
                      <span className={styles.gradeLabel}>{gr.label}</span>
                      <span className={styles.gradeSub}>{gr.sub}</span>
                    </button>
                  ))}
                </div>
                <p className={styles.foot}>{FOOTER_COPY[variant]}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
