import Link from 'next/link'
import type { OpenRepair } from '@/lib/academy/repairs'
import styles from './repair-queue.module.css'

/**
 * "Needs repair" panel for the review surface. A failed teachback opens a
 * repair; this lists the learner's open repairs with a route back to the
 * lesson to redo the teachback — repair, don't punish, never a dead end.
 * Honest empty state when there's nothing outstanding.
 */
export function RepairQueue({ repairs }: { repairs: OpenRepair[] }) {
  return (
    <section className={styles.panel} aria-labelledby="repair-queue-heading">
      <header className={styles.head}>
        <p className={styles.kicker}>Needs repair</p>
        {repairs.length > 0 ? (
          <span className={styles.count}>{repairs.length}</span>
        ) : null}
      </header>
      <h2 id="repair-queue-heading" className={styles.srOnly}>
        Open repairs
      </h2>

      {repairs.length === 0 ? (
        <p className={styles.empty}>No repairs — your proofs are holding.</p>
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
                  Redo teachback →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
