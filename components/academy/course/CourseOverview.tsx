import Link from 'next/link'
import { topic, TOPICS } from '@/lib/academy/topics'
import type { CourseOverview as Overview } from '@/lib/academy/content'
import type { CSSProperties } from 'react'
import styles from './course.module.css'

export function CourseOverview({
  overview,
  completed,
  doneCount,
  continueSlug,
}: {
  overview: Overview
  completed: Set<string>
  doneCount: number
  continueSlug: string | null
}) {
  const t = topic(overview.topic)
  const rootStyle = { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
  const started = doneCount > 0
  const ctaSlug = continueSlug ?? overview.firstLessonSlug
  const pct = overview.lessonsTotal ? Math.round((doneCount / overview.lessonsTotal) * 100) : 0

  return (
    <div className={styles.page} style={rootStyle}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>
          <span className={styles.tag}>{TOPICS[overview.topic].label}</span>
          <span className={styles.sep}>·</span>
          <span className={styles.level}>{overview.level}</span>
        </p>
        <h1 className={styles.title}>{overview.title}</h1>
        {overview.subtitle ? <p className={styles.subtitle}>{overview.subtitle}</p> : null}
        <p className={styles.meta}>
          {overview.lessonsTotal} lessons · {overview.hours}h · {overview.level}
        </p>
        {started ? (
          <div className={styles.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
        ) : null}
        <div className={styles.actions}>
          {ctaSlug ? (
            <Link href={`/academy/learn/${overview.slug}/${ctaSlug}`} className={styles.cta}>
              {started ? `Continue · ${pct}%` : 'Start course'} →
            </Link>
          ) : (
            <span className={styles.soon}>Lessons coming soon</span>
          )}
          <Link href="/academy/catalog" className={styles.back}>← All courses</Link>
        </div>
      </header>

      <section className={styles.syllabus} aria-label="Syllabus">
        <div className={styles.syllabusHead}>
          <h2 className={styles.h2}>Syllabus</h2>
          <span className={styles.syllabusMeta}>{doneCount} / {overview.lessonsTotal} complete</span>
        </div>
        {overview.modules.map((m) => (
          <div key={m.title} className={styles.module}>
            <h3 className={styles.moduleTitle}>{m.title}</h3>
            <ol className={styles.lessons}>
              {m.lessons.map((l, i) => {
                const done = completed.has(l.slug)
                return (
                  <li key={l.slug}>
                    <Link href={`/academy/learn/${overview.slug}/${l.slug}`} className={styles.lesson} data-done={done}>
                      <span className={styles.lessonNum} aria-hidden="true">{done ? '✓' : String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.lessonTitle}>{l.title}</span>
                      {l.isFreePreview ? <span className={styles.free}>Free</span> : null}
                      <span className={styles.lessonMin}>{l.estMinutes} min</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </section>
    </div>
  )
}
