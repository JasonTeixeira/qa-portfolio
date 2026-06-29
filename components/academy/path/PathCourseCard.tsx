import Link from 'next/link'
import { Icon } from '@/components/academy/ui/Icon'
import type { ContentMapCourse } from '@/lib/academy/content-map-logic'
import styles from './path.module.css'

/**
 * One course on the path map: title + level eyebrow, a status badge, an honest
 * progress bar (real done/total, never fabricated), and the next action. The
 * card links to the learner's current lesson when in-progress, the first lesson
 * when not-started, or the course overview when complete. Logic for state +
 * currentLessonSlug is derived upstream by buildContentMap (pure, deterministic);
 * this component only presents it. Adapted from the catalog ContentMap card so
 * the two surfaces stay visually consistent without sharing a mutable file.
 */

const LEVEL_LABEL: Record<string, string> = {
  Beginner: 'Beginner',
  Intermediate: 'Intermediate',
  Advanced: 'Advanced',
}

function cardHref(course: ContentMapCourse): string {
  if (course.state === 'complete') return course.href
  if (course.currentLessonSlug) {
    return `/academy/learn/${course.slug}/${course.currentLessonSlug}`
  }
  return course.href
}

function actionLabel(course: ContentMapCourse, isGate: boolean): string {
  if (course.state === 'complete') return 'Review course'
  if (course.state === 'in-progress') return isGate ? 'Continue the gate' : 'Resume'
  return isGate ? 'Begin the gate' : 'Start course'
}

export function PathCourseCard({
  course,
  isGate = false,
}: {
  course: ContentMapCourse
  isGate?: boolean
}) {
  const isComplete = course.state === 'complete'
  const inProgress = course.state === 'in-progress'
  const level = LEVEL_LABEL[course.level] ?? course.level
  const eyebrow = isGate ? `The gate · ${level}` : level
  const status = isComplete ? 'Complete' : inProgress ? 'In progress' : 'Not started'
  const badgeClass = isComplete
    ? styles.badgeDone
    : inProgress
      ? styles.badgeProgress
      : styles.badgeIdle

  return (
    <Link
      href={cardHref(course)}
      className={`${styles.card} ${isGate ? styles.cardGate : ''}`}
    >
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          {eyebrow ? <p className={styles.cardEyebrow}>{eyebrow}</p> : null}
          <h4 className={styles.cardTitle}>{course.title}</h4>
        </div>
        <span className={`${styles.badge} ${badgeClass}`}>{status}</span>
      </div>

      <div className={styles.cardProgressRow}>
        <span>
          {course.done}/{course.total} {course.total === 1 ? 'lesson' : 'lessons'}
        </span>
        <span className={`${styles.cardPct} ${isComplete ? styles.cardPctDone : ''}`}>
          {course.pct}%
        </span>
      </div>
      <div
        className={styles.cardBar}
        role="img"
        aria-label={`${course.title}: ${course.pct}% complete, ${course.done} of ${course.total} lessons`}
      >
        <span
          className={styles.cardBarFill}
          style={{
            width: `${course.pct}%`,
            background: isComplete ? 'var(--ac-mastery)' : 'var(--ac-accent)',
          }}
        />
      </div>

      <span className={`${styles.cardAction} ${isComplete ? styles.cardActionDone : ''}`}>
        {actionLabel(course, isGate)}
        {isComplete ? (
          <span className={styles.cardActionIcon} aria-hidden>
            <Icon name="check" size={14} />
          </span>
        ) : (
          <span className={styles.cardActionIcon} aria-hidden>
            <Icon name="arrow-right" size={14} />
          </span>
        )}
      </span>
    </Link>
  )
}
