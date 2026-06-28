import Link from 'next/link'
import { topic, TOPICS } from '@/lib/academy/topics'
import type { CourseOverview as Overview } from '@/lib/academy/content'
import { ProgressBar } from '@/components/academy/shell/ProgressBar'
import { Icon } from '@/components/academy/ui/Icon'
import type { CSSProperties } from 'react'
import styles from './course.module.css'

/** Honest progress ring (real %), tinted to the course's topic colour. */
function Ring({ pct, color, size = 72, stroke = 6 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, pct))
  const offset = circ * (1 - clamped / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ring} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className={styles.ringText}>
        {clamped}%
      </text>
    </svg>
  )
}

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
        {started ? (
          <div className={styles.heroRing}>
            <Ring pct={pct} color={t.color} />
          </div>
        ) : null}
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
        {/* Overall course progress — only with real recorded progress (honest empty state otherwise). */}
        {started ? (
          <div className={styles.progress}>
            <ProgressBar
              value={pct}
              ariaLabel={`Course progress: ${doneCount} of ${overview.lessonsTotal} lessons complete`}
            />
            <span className={styles.progressLabel}>
              {doneCount}/{overview.lessonsTotal} lessons done · {pct}%
            </span>
          </div>
        ) : null}
        <div className={styles.actions}>
          {ctaSlug ? (
            <Link href={`/academy/learn/${overview.slug}/${ctaSlug}`} className={styles.cta}>
              {started ? 'Continue' : 'Start course'} <Icon name="arrow-right" size={15} aria-hidden="true" />
            </Link>
          ) : (
            <span className={styles.soon}>Lessons coming soon</span>
          )}
          <Link href="/academy/catalog" className={styles.back}>
            <Icon name="arrow-left" size={15} aria-hidden="true" /> All courses
          </Link>
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
                      <span className={styles.lessonNum} aria-hidden="true">{done ? <Icon name="check" size={14} /> : String(i + 1).padStart(2, '0')}</span>
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
