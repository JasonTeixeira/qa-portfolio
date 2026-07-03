'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { TOPICS, type TopicKey } from '@/lib/academy/topics'
import type { PathItem, CourseItem } from '@/data/academy/learn-catalog'
import { Icon } from '@/components/academy/ui/Icon'
import { groupByDomain } from './domains'
import styles from './catalog.module.css'

type ResumeCard = { kicker: string; title: string; sub: string; href: string; pct: number }

/** 'all' plus every real topic key — the client-side track filter. */
type TrackFilter = 'all' | TopicKey

function topicVars(key: TopicKey): CSSProperties {
  return { '--topic': TOPICS[key].color } as CSSProperties
}

export function CatalogClient({
  resume,
  courses,
  totalCourses,
  progress = {},
}: {
  resume: ResumeCard | null
  /** Curated multi-course paths — currently empty until rebuilt; kept for prop stability. */
  paths?: PathItem[]
  courses: CourseItem[]
  totalCourses: number
  /** Completed-lesson count per course slug (RLS-scoped, 0 when signed out). */
  progress?: Record<string, number>
}) {
  const [track, setTrack] = useState<TrackFilter>('all')

  // Real catalog stats for the kicker line — computed, never invented.
  const totalLessons = useMemo(
    () => courses.reduce((sum, c) => sum + (c.lessons ?? 0), 0),
    [courses],
  )

  // The real tracks present, in curriculum order (Foundations → … → Growth).
  const trackKeys = useMemo(() => groupByDomain(courses), [courses])

  const filtered = useMemo(
    () => (track === 'all' ? courses : courses.filter((c) => c.topic === track)),
    [courses, track],
  )

  return (
    <div className={styles.page}>
      {/* Header — the catalog stat line + the editorial promise. */}
      <header className={styles.header}>
        <p className={styles.kicker}>
          The catalog · {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} ·{' '}
          {totalLessons} lessons · {trackKeys.length}{' '}
          {trackKeys.length === 1 ? 'track' : 'tracks'}
        </p>
        <h1 className={styles.headline}>
          Every course ends in <em className={styles.headlineEm}>an artifact</em> a reviewer
          trusts.
        </h1>
      </header>

      {/* Continue — only when there is real recorded progress. */}
      {resume && (
        <Link href={resume.href} className={styles.resume}>
          <span className={styles.resumeAccent} aria-hidden="true" />
          <div className={styles.resumeBody}>
            <span className={styles.resumeKicker}>{resume.kicker}</span>
            <span className={styles.resumeTitle}>{resume.title}</span>
            <span className={styles.resumeSub}>{resume.sub}</span>
          </div>
          <div className={styles.resumeMeta}>
            <span className={styles.resumeBar} aria-hidden="true">
              <span style={{ width: `${resume.pct}%` }} />
            </span>
            <span className={styles.resumeBtn}>
              {resume.pct > 0 ? 'Resume' : 'Start'}
              <Icon name="arrow-right" size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      {/* Track filter chips — real tracks, filtered client-side. */}
      <div
        className={styles.filterBar}
        role="group"
        aria-label="Filter courses by track"
      >
        <button
          type="button"
          className={`${styles.chip} ${track === 'all' ? styles.chipOn : ''}`}
          onClick={() => setTrack('all')}
          aria-pressed={track === 'all'}
        >
          All tracks
        </button>
        {trackKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.chip} ${track === key ? styles.chipOn : ''}`}
            onClick={() => setTrack(key)}
            aria-pressed={track === key}
          >
            {TOPICS[key].label}
          </button>
        ))}
        <span className={styles.countLine} role="status">
          {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true">
            <Icon name="search" size={22} />
          </span>
          <p>No courses in this track yet.</p>
          <button
            type="button"
            className={styles.clearFilter}
            onClick={() => setTrack('all')}
          >
            Show the full catalog
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((c) => {
            const done = Math.min(progress[c.slug] ?? 0, c.lessons)
            const started = done > 0
            const finished = c.lessons > 0 && done >= c.lessons
            const pct = c.lessons ? Math.round((done / c.lessons) * 100) : 0
            const action = finished ? 'Review' : started ? 'Continue' : 'Start'
            return (
              <li key={c.slug}>
                <Link
                  href={`/academy/course/${c.slug}`}
                  className={styles.card}
                  style={topicVars(c.topic)}
                  data-state={finished ? 'done' : started ? 'active' : 'new'}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.cardTrack}>{TOPICS[c.topic].label}</span>
                    <span className={styles.cardLevel}>{c.level}</span>
                  </div>

                  <h2 className={styles.cardTitle}>{c.title}</h2>

                  {c.subtitle ? <p className={styles.cardDesc}>{c.subtitle}</p> : null}

                  {/* Progress only when real recorded progress exists — no fake 0% bars. */}
                  {started && !finished ? (
                    <div
                      className={styles.cardProgress}
                      role="img"
                      aria-label={`${done} of ${c.lessons} lessons complete`}
                    >
                      <span className={styles.cardProgressBar} aria-hidden="true">
                        <span style={{ width: `${pct}%` }} />
                      </span>
                      <span className={styles.cardProgressLabel}>
                        {done}/{c.lessons} · {pct}%
                      </span>
                    </div>
                  ) : null}

                  <div className={styles.cardFoot}>
                    <span className={styles.cardMeta}>
                      {c.lessons} lessons · {c.hours}h
                    </span>
                    <span
                      className={`${styles.cardAction} ${finished ? styles.cardDone : ''}`}
                    >
                      {finished ? (
                        <>
                          <Icon name="check" size={14} aria-hidden="true" />
                          {action}
                        </>
                      ) : (
                        <>
                          {action}
                          <Icon name="arrow-right" size={14} aria-hidden="true" />
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {/* Quiet escape hatch — assemble your own path. */}
      <Link href="/academy/build" className={styles.build}>
        <Icon name="plus" size={15} aria-hidden="true" />
        Prefer to assemble your own path? Build one
      </Link>
    </div>
  )
}
