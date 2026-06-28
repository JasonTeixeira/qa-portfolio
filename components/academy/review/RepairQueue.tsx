import Link from 'next/link'
import type { OpenRepair } from '@/lib/academy/repairs'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './repair-queue.module.css'

/**
 * "Needs repair" panel for the review surface. A failed teachback opens a
 * repair; this lists the learner's open repairs with a route back to the
 * lesson to redo the teachback — repair, don't punish, never a dead end.
 *
 * Attention discipline: when there's an active review to do AND nothing to
 * repair, the positive-empty state collapses to a single green status chip so
 * the review card stays the unambiguous hero. The full composed panel only
 * shows when proofs are clear AND there's genuinely no review queued — then it
 * is the page's primary content and has earned the space.
 */
export function RepairQueue({
  repairs,
  hasActiveReview = false,
}: {
  repairs: OpenRepair[]
  hasActiveReview?: boolean
}) {
  const isClear = repairs.length === 0

  // Demoted form: a quiet one-line chip that yields the page to the review card.
  if (isClear && hasActiveReview) {
    return (
      <p className={styles.statusChip} role="status">
        <span className={styles.statusGlyph} aria-hidden="true">
          <Icon name="check" size={14} />
        </span>
        Proofs holding — no repairs due.
      </p>
    )
  }

  return (
    <section
      className={`${styles.panel} ${isClear ? styles.panelClear : ''}`}
      aria-labelledby="repair-queue-heading"
    >
      <header className={styles.head}>
        <p className={styles.kicker}>Needs repair</p>
        {repairs.length > 0 ? (
          <span className={styles.count}>{repairs.length}</span>
        ) : null}
      </header>
      <h2 id="repair-queue-heading" className={styles.srOnly}>
        Open repairs
      </h2>

      {isClear ? (
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true">
            <Icon name="check" size={22} />
          </span>
          <p className={styles.emptyTitle}>No repairs — your proofs are holding.</p>
          <p className={styles.emptyHelp}>
            Every teachback you’ve faced is still passing. Nothing to redo right now.
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {repairs.map((r) => (
            <li key={`${r.courseSlug}:${r.lessonSlug}:${r.unitId}`} className={styles.item}>
              <Link
                href={`/academy/learn/${r.courseSlug}/${r.lessonSlug}`}
                className={styles.link}
              >
                <span className={styles.itemMain}>
                  <span className={styles.itemCourse}>{r.courseTitle}</span>
                  <span className={styles.itemLesson}>{r.lessonTitle}</span>
                </span>
                <span className={styles.itemCta} aria-hidden="true">
                  Redo teachback
                  <Icon name="arrow-right" size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
