'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { gradeReview } from '@/app/academy/_actions/reviews'
import type { DueReview, ReviewGrade } from '@/lib/academy/fsrs'
import { CelebrationToast } from '@/components/academy/celebration/CelebrationToast'
import type { Celebration } from '@/lib/academy/gamification-logic'
import styles from './review.module.css'

const GRADES: { key: ReviewGrade; label: string; sub: string }[] = [
  { key: 'again', label: 'Again', sub: 'Forgot' },
  { key: 'hard', label: 'Hard', sub: 'Struggled' },
  { key: 'good', label: 'Good', sub: 'Recalled' },
  { key: 'easy', label: 'Easy', sub: 'Instant' },
]

export function ReviewSession({ initialCards }: { initialCards: DueReview[] }) {
  const router = useRouter()
  const [cards] = useState(initialCards)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [pending, setPending] = useState(false)
  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const total = cards.length
  const current = cards[index]

  async function grade(g: ReviewGrade) {
    if (!current || pending) return
    setPending(true)
    try {
      const res = await gradeReview(current.id, g)
      if (res && 'celebration' in res && res.celebration) setCelebration(res.celebration)
    } catch {
      /* best-effort; the queue advances regardless */
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
            <span className={styles.emptyGlyph} aria-hidden="true">✓</span>
            <h1 className={styles.emptyTitle}>You’re all caught up.</h1>
            <p className={styles.emptyBody}>
              Nothing’s due right now. Reviews resurface exactly when you’re about to forget — come back tomorrow.
            </p>
            <Link href="/academy/dashboard" className={styles.emptyBtn}>Back to My Learning →</Link>
          </div>
          <div className={styles.schedule} aria-label="How spaced review resurfaces cards">
            <span className={styles.scheduleLabel}>Resurfaces at</span>
            <span className={styles.scheduleStep}>Again · same day</span>
            <span className={styles.scheduleSep} aria-hidden="true">→</span>
            <span className={styles.scheduleStep}>Good · days</span>
            <span className={styles.scheduleSep} aria-hidden="true">→</span>
            <span className={styles.scheduleStep}>Easy · weeks</span>
          </div>
        </div>
      </div>
    )
  }

  if (index >= total) {
    return (
      <div className={styles.page}>
        <p className={styles.kicker}>Spaced review</p>
        <div className={styles.emptyWrap}>
          <div className={styles.empty}>
            <span className={styles.emptyGlyph} aria-hidden="true">★</span>
            <h1 className={styles.emptyTitle}>Review complete.</h1>
            <p className={styles.emptyBody}>
              {total} {total === 1 ? 'card' : 'cards'} reviewed · +{total * 10} XP. Each one is now scheduled to return
              right before you’d forget it.
            </p>
            <Link href="/academy/dashboard" className={styles.emptyBtn}>Back to My Learning →</Link>
          </div>
        </div>
      </div>
    )
  }

  const pct = Math.round((index / total) * 100)

  return (
    <div className={styles.page}>
      <CelebrationToast value={celebration} onClear={() => setCelebration(null)} />
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
                  Revisit the lesson →
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
