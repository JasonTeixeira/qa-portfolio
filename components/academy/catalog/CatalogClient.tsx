'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { topic, TOPICS, type TopicKey } from '@/lib/academy/topics'
import type { PathItem, CourseItem, Level } from '@/data/academy/learn-catalog'
import { ProgressBar } from '@/components/academy/shell/ProgressBar'
import { Icon } from '@/components/academy/ui/Icon'
import { DOMAIN_BLURB, groupByDomain } from './domains'
import styles from './catalog.module.css'

type ResumeCard = { kicker: string; title: string; sub: string; href: string; pct: number }
type Scope = 'browse' | 'mine'

const LEVELS: Array<'All' | Level> = ['All', 'Beginner', 'Intermediate', 'Advanced']

function tvars(key: TopicKey): CSSProperties {
  const t = topic(key)
  return { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
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
  const [scope, setScope] = useState<Scope>('browse')
  const [level, setLevel] = useState<'All' | Level>('All')
  const [query, setQuery] = useState('')

  /** A course is "mine" only when there is real recorded progress (no fake state). */
  const startedCount = useMemo(
    () => courses.filter((c) => (progress[c.slug] ?? 0) > 0).length,
    [courses, progress],
  )

  const filtered = useMemo(
    () =>
      courses.filter((c) => {
        if (scope === 'mine' && (progress[c.slug] ?? 0) <= 0) return false
        if (level !== 'All' && c.level !== level) return false
        if (query && !c.title.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [courses, scope, level, query, progress],
  )

  // Group the filtered (DB-sorted) courses into the six domains, in curriculum order.
  const domainKeys = useMemo(() => groupByDomain(filtered), [filtered])
  const byDomain = useMemo(() => {
    const map = new Map<TopicKey, CourseItem[]>()
    for (const c of filtered) {
      const list = map.get(c.topic)
      if (list) list.push(c)
      else map.set(c.topic, [c])
    }
    return map
  }, [filtered])

  const filtersActive = scope !== 'browse' || level !== 'All' || query !== ''

  return (
    <div className={styles.page}>
      {/* heading — say plainly what this page is, over the academy scene */}
      <header className={styles.hero}>
        <Image
          src="/path/scenes/academy.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1100px) 100vw, 1100px"
          className={styles.heroScene}
        />
        <span className={styles.heroVeil} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.heroKicker}>Sage Academy</p>
          <h1 className={styles.heroTitle}>The curriculum</h1>
          <p className={styles.heroSub}>
            {totalCourses === 1
              ? 'One course is ready. Start from lesson one — the path begins at Foundations.'
              : `${totalCourses} courses across six domains. New here? Start at Foundations and work down.`}
          </p>
        </div>
      </header>

      {/* continue — only when there is real recorded progress */}
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
              <Icon name="arrow-right" size={16} />
            </span>
          </div>
        </Link>
      )}

      {/* Demoted controls: My/Browse scope + search + level. Quiet utility row that
          sits above the curriculum map without competing with it. */}
      <div className={styles.controlsBar}>
        <div className={styles.scope} role="group" aria-label="Filter by enrollment">
          <button
            type="button"
            className={`${styles.scopeBtn} ${scope === 'browse' ? styles.scopeOn : ''}`}
            onClick={() => setScope('browse')}
            aria-pressed={scope === 'browse'}
          >
            Browse all
          </button>
          <button
            type="button"
            className={`${styles.scopeBtn} ${scope === 'mine' ? styles.scopeOn : ''}`}
            onClick={() => setScope('mine')}
            aria-pressed={scope === 'mine'}
            disabled={startedCount === 0}
          >
            My courses
            {startedCount > 0 ? <span className={styles.scopeCount}>{startedCount}</span> : null}
          </button>
        </div>
        <div className={styles.controls}>
          <label className={styles.search}>
            <Icon name="search" size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search courses"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
            />
          </label>
          <div className={styles.levels} role="group" aria-label="Filter by level">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles.level} ${level === l ? styles.levelOn : ''}`}
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyGlyph} aria-hidden="true">
            <Icon name="search" size={22} />
          </span>
          <p>
            {scope === 'mine'
              ? 'You have no courses in progress yet.'
              : 'No courses match your search.'}
          </p>
          <button
            type="button"
            className={styles.clearFilter}
            onClick={() => {
              setScope('browse')
              setQuery('')
              setLevel('All')
            }}
          >
            Show the full curriculum
          </button>
        </div>
      ) : (
        <div className={styles.curriculum}>
          {filtersActive ? (
            <p className={styles.filterNote} role="status">
              Showing {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}.
            </p>
          ) : null}

          {domainKeys.map((key) => {
            const list = byDomain.get(key) ?? []
            if (list.length === 0) return null
            const t = TOPICS[key]
            const headingId = `domain-${key}`
            return (
              <section
                key={key}
                className={styles.domain}
                style={tvars(key)}
                aria-labelledby={headingId}
              >
                <div className={styles.domainHead}>
                  <span className={styles.domainRail} aria-hidden="true" />
                  <div className={styles.domainHeadText}>
                    <h2 id={headingId} className={styles.domainTitle}>
                      {t.label}
                    </h2>
                    <p className={styles.domainBlurb}>{DOMAIN_BLURB[key]}</p>
                  </div>
                  <span className={styles.domainCount}>
                    {list.length} {list.length === 1 ? 'course' : 'courses'}
                  </span>
                </div>

                <ul className={styles.courseGrid}>
                  {list.map((c) => {
                    const done = Math.min(progress[c.slug] ?? 0, c.lessons)
                    const started = done > 0
                    const pct = c.lessons ? Math.round((done / c.lessons) * 100) : 0
                    const finished = c.lessons > 0 && done >= c.lessons
                    const action = finished ? 'Review' : started ? 'Continue' : 'Start'
                    return (
                      <li key={c.slug}>
                        <Link
                          href={`/academy/course/${c.slug}`}
                          className={styles.courseCard}
                          style={tvars(c.topic)}
                          data-state={finished ? 'done' : started ? 'active' : 'new'}
                        >
                          <div className={styles.courseTop}>
                            <span className={styles.courseTag}>{TOPICS[c.topic].label}</span>
                            <span className={styles.courseLevel}>{c.level}</span>
                          </div>
                          <h3 className={styles.courseTitle}>{c.title}</h3>
                          <span className={styles.courseMeta}>
                            {c.lessons} lessons · {c.hours}h
                          </span>

                          {/* Progress only when there's real recorded progress — no fake 0% bars. */}
                          {started && !finished ? (
                            <div className={styles.courseProgress}>
                              <ProgressBar
                                value={pct}
                                size="sm"
                                ariaLabel={`${c.title}: ${done} of ${c.lessons} lessons complete`}
                              />
                              <span className={styles.courseProgressLabel}>
                                {done}/{c.lessons} lessons · {pct}%
                              </span>
                            </div>
                          ) : null}
                          {finished ? (
                            <span className={styles.courseDone}>
                              <Icon name="check" size={15} aria-hidden="true" />
                              Completed
                            </span>
                          ) : null}

                          {/* ONE obvious action per course */}
                          <span className={styles.courseAction}>
                            {action}
                            <Icon name="arrow-right" size={16} aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}

      {/* quiet escape hatch — never competes with the courses above */}
      <Link href="/academy/build" className={styles.buildLink}>
        <Icon name="plus" size={15} aria-hidden="true" />
        Prefer to assemble your own path? Build one
      </Link>
    </div>
  )
}
