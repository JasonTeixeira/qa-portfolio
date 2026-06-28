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

const GRADES: { key: ReviewGrade; label: string; sub: string }[] = [
  { key: 'again', label: 'Again', sub: 'Forgot' },
  { key: 'hard', label: 'Hard', sub: 'Struggled' },
  { key: 'good', label: 'Good', sub: 'Recalled' },
  { key: 'easy', label: 'Easy', sub: 'Instant' },
]

/** Seconds an average recall card takes — used to frame the session as finishable. */
const SECONDS_PER_CARD = 12

/** Days from now until `iso`, floored at 1 — "next review in ~D days". */
function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(1, Math.round(ms / 86_400_000))
}

/**
 * Estimated minutes to finish a session of `cardCount` cards, at ~12s/card,
 * rounded up and floored at 1 so a non-empty queue never reads "~0 min".
 * Pure. Returns 0 only for an empty queue.
 */
export function estimatedMinutes(cardCount: number, secondsPerCard = SECONDS_PER_CARD): number {
  if (cardCount <= 0) return 0
  return Math.max(1, Math.ceil((cardCount * secondsPerCard) / 60))
}

/**
 * Real XP a full clean run of `cardCount` cards would award — every graded
 * review pays exactly `perCard` (XP_REWARDS.review). This is the entry-banner
 * GAIN preview: it must match the completion math (strengthened * perCard) when
 * the learner grades every card. Pure. No fabrication — purely cardCount * perCard.
 * Returns 0 for an empty queue.
 */
export function reviewGainXp(cardCount: number, perCard: number = XP_REWARDS.review): number {
  if (cardCount <= 0) return 0
  return cardCount * perCard
}

export function ReviewSession({ initialCards }: { initialCards: DueReview[] }) {
  const router = useRouter()
  const [cards] = useState(initialCards)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [pending, setPending] = useState(false)
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  // Session payoff data, accumulated honestly from each graded card's real result.
  const [streak, setStreak] = useState<number | null>(null)
  const [soonestNextDue, setSoonestNextDue] = useState<string | null>(null)
  // Count only cards the server actually graded (each awards XP_REWARDS.review).
  // A failed grade still advances the queue but earns nothing — so XP stays honest.
  const [strengthened, setStrengthened] = useState(0)
  const total = cards.length
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
        // Keep the soonest next-due across the run — that's when the learner returns.
        setSoonestNextDue((prev) => (!prev || res.nextDueAt! < prev ? res.nextDueAt! : prev))
      }
    } catch {
      /* best-effort; the queue advances regardless (earns no XP) */
    }
    setPending(false)
    setRevealed(false)
    setIndex((i) => i + 1)
    router.refresh() // update the header streak/XP/Review-badge live (client session state persists)
  }

  if (total === 0) {
    return (
      <div className={styles.page}>
        <p className={styles.kicker}>Spaced review</p>
        <div className={styles.emptyWrap}>
          <div className={styles.empty}>
            <span className={styles.emptyGlyph} aria-hidden="true"><Icon name="check" size={26} /></span>
            <h1 className={styles.emptyTitle}>You’re all caught up.</h1>
            <p className={styles.emptyBody}>
              Nothing’s due right now. Reviews resurface exactly when you’re about to forget — come back tomorrow.
            </p>
            <Link href="/academy/dashboard" className={styles.emptyBtn}>
              Back to My Learning
              <Icon name="arrow-right" size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.schedule} aria-label="How spaced review resurfaces cards">
            <span className={styles.scheduleLabel}>Resurfaces at</span>
            <span className={styles.scheduleStep}>Again · same day</span>
            <span className={styles.scheduleSep} aria-hidden="true"><Icon name="arrow-right" size={13} /></span>
            <span className={styles.scheduleStep}>Good · days</span>
            <span className={styles.scheduleSep} aria-hidden="true"><Icon name="arrow-right" size={13} /></span>
            <span className={styles.scheduleStep}>Easy · weeks</span>
          </div>
        </div>
      </div>
    )
  }

  if (index >= total) {
    // Real values only: `strengthened` counts cards the server confirmed graded,
    // and each graded review awards exactly XP_REWARDS.review XP.
    const memoriesLabel = `${strengthened} ${strengthened === 1 ? 'memory' : 'memories'} strengthened`
    const xpEarned = strengthened * XP_REWARDS.review
    const nextInDays = soonestNextDue ? daysUntil(soonestNextDue) : null
    return (
      <div className={styles.page}>
        <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
        <p className={styles.kicker}>Spaced review</p>
        <div className={styles.emptyWrap}>
          {/* End-of-session reward moment: a single compositor-only rise/settle, no confetti. */}
          <div className={styles.done} role="status" aria-live="polite">
            <span className={styles.doneGlyph} aria-hidden="true"><Icon name="star" size={26} /></span>
            <p className={styles.doneEyebrow}>Memory strengthened</p>
            <h1 className={styles.doneTitle}>Session complete.</h1>
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
                    <Icon name="flame" size={15} aria-hidden="true" /> Streak locked in · {streak} {streak === 1 ? 'day' : 'days'}
                  </span>
                </li>
              ) : null}
            </ul>
            <p className={styles.doneBody}>
              {nextInDays
                ? `Each card is scheduled to return right before you’d forget — your next review lands in ~${nextInDays} ${nextInDays === 1 ? 'day' : 'days'}.`
                : 'Each card is scheduled to return right before you’d forget it.'}
            </p>
            <p className={styles.doneSignoff}>See you tomorrow — keep the chain alive.</p>
            <Link href="/academy/dashboard" className={styles.doneBtn}>
              Back to My Learning
              <Icon name="arrow-right" size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const pct = Math.round((index / total) * 100)
  // Entry ritual: only on the first, un-revealed card — frames the session as a
  // small, finishable daily rep with a concrete personal stake.
  const isEntry = index === 0 && !revealed
  const estMin = estimatedMinutes(total)
  // Balancing GAIN preview — real XP only: a clean run pays total × XP_REWARDS.review.
  const gainXp = reviewGainXp(total)

  return (
    <div className={styles.page}>
      <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
      {isEntry ? (
        <section className={styles.ritual} aria-label="Today’s review">
          <p className={styles.ritualKicker}>Today’s rep</p>
          {/* Finishability lever first: the "~N min" promise is the strongest pull,
              so it renders dominant (display scale/weight/ink) ahead of the count.
              The banner line sells the BOUNDED RITUAL — count + time, no consequence. */}
          <p className={styles.ritualLine}>
            <strong className={styles.ritualTime}>~{estMin} min</strong>
            <span className={styles.ritualDot} aria-hidden="true">·</span>
            <span className={styles.ritualCount}>{total}</span>
            <span className={styles.ritualUnit}>{total === 1 ? 'card' : 'cards'}</span>
          </p>
          {/* Balancing GAIN preview — pairs the downside stake below with a concrete
              upside. Real numbers only: total × XP_REWARDS.review, matched to the
              completion beat. Gives the session a reason-TO, not just a reason-against. */}
          <p className={styles.ritualGain}>
            <span className={styles.ritualGainDot} aria-hidden="true"><Icon name="plus" size={13} /></span>
            Lock in ~{gainXp} XP · strengthen all {total} {total === 1 ? 'card' : 'cards'}
          </p>
          {/* Loss aversion, reframed so it ESCALATES rather than echoes the count above:
              due cards have already decayed to FSRS target retention, so skipping keeps
              the weakest ones decaying. Phrased as a distinct consequence, not a restated N. */}
          <p className={styles.ritualStake}>
            <span className={styles.ritualStakeDot} aria-hidden="true"><Icon name="dot" size={13} /></span>
            {total === 1
              ? 'Skip today and your weakest card keeps decaying below recall.'
              : 'Skip today and your weakest cards keep decaying below recall.'}
          </p>
        </section>
      ) : null}
      <div className={styles.head}>
        <p className={styles.kicker}>Spaced review</p>
        <span className={styles.counter}>
          {index + 1} <span className={styles.counterDim}>/ {total}</span>
        </span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.card}>
        {current.courseSlug ? <span className={styles.cardTag}>{current.courseSlug.replace(/-/g, ' ')}</span> : null}
        <p className={styles.prompt}>{current.prompt}</p>

        {!revealed ? (
          <button type="button" className={styles.reveal} onClick={() => setRevealed(true)}>
            Reveal · rate your recall
          </button>
        ) : (
          <div className={styles.gradeArea}>
            <p className={styles.recallNote}>
              Recall it out loud or in code, then rate how it went.{' '}
              {current.lessonSlug && current.courseSlug ? (
                <Link href={`/academy/learn/${current.courseSlug}/${current.lessonSlug}`} className={styles.revisit}>
                  Revisit the lesson
                  <Icon name="arrow-right" size={13} aria-hidden="true" />
                </Link>
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
          </div>
        )}
      </div>

      <p className={styles.foot}>Scheduled by FSRS at 90% target retention — the science of not forgetting.</p>
    </div>
  )
}
