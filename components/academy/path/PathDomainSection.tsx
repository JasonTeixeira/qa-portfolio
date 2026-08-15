import { topic as topicMeta } from '@/lib/academy/topics'
import type { CSSProperties } from 'react'
import type { PathDomain } from '@/lib/academy/path'
import { PathCourseCard } from './PathCourseCard'
import styles from './path.module.css'

/**
 * One domain on the curriculum spine — a labeled band of courses in catalog
 * order, with the domain's accent dot, an index number (its place on the spine),
 * and a compact done/total + % rollup. The gate course (00) renders with its
 * own emphasis. Presentational only; all progress is computed upstream.
 */

const GATE_COURSE_SLUG = 'career-engineering_judgment_foundation'

export function PathDomainSection({
  domain,
  index,
}: {
  domain: PathDomain
  index: number
}) {
  const t = topicMeta(domain.topic)
  const headingId = `path-domain-${domain.topic}`
  const ordinal = String(index + 1).padStart(2, '0')

  return (
    <section
      aria-labelledby={headingId}
      className={styles.domain}
      style={{ '--domain-color': t.color } as CSSProperties}
    >
      <div className={styles.domainHead}>
        <div className={styles.domainTitleWrap}>
          <span className={styles.domainDot} aria-hidden />
          <span className={styles.domainIndex}>{ordinal}</span>
          <h3 id={headingId} className={styles.domainTitle}>
            {t.label}
          </h3>
        </div>
        <div className={styles.domainMeta}>
          <span>
            {domain.coursesComplete}/{domain.coursesTotal} done
          </span>
          <span
            className={styles.domainMeterMini}
            role="img"
            aria-label={`${t.label}: ${domain.pct}% of lessons complete`}
          >
            <span className={styles.domainMeterMiniFill} style={{ width: `${domain.pct}%` }} />
          </span>
          <span>{domain.pct}%</span>
        </div>
      </div>

      <div className={styles.courseGrid}>
        {domain.courses.map((course) => (
          <PathCourseCard
            key={course.slug}
            course={course}
            isGate={course.slug === GATE_COURSE_SLUG}
          />
        ))}
      </div>
    </section>
  )
}
