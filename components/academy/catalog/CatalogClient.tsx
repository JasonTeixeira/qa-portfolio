'use client'

import { useMemo, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { topic, TOPICS, type TopicKey } from '@/lib/academy/topics'
import { CATEGORIES, TRACKS, type AcademyTrack } from '@/lib/academy/taxonomy'
import type { PathItem, CourseItem, Level } from '@/data/academy/learn-catalog'
import styles from './catalog.module.css'

type ResumeCard = { kicker: string; title: string; sub: string; href: string; pct: number }

const LEVELS: Array<'All' | Level> = ['All', 'Beginner', 'Intermediate', 'Advanced']

function tvars(key: TopicKey): CSSProperties {
  const t = topic(key)
  return { '--topic': t.color, '--topic-soft': t.soft } as CSSProperties
}

export function CatalogClient({
  resume,
  paths,
  courses,
  totalCourses,
}: {
  resume: ResumeCard | null
  paths: PathItem[]
  courses: CourseItem[]
  totalCourses: number
}) {
  const [trackFilter, setTrackFilter] = useState<AcademyTrack | null>(null)
  const [level, setLevel] = useState<'All' | Level>('All')
  const [query, setQuery] = useState('')
  const coursesRef = useRef<HTMLElement>(null)

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (!trackFilter || c.topic === trackFilter.topic) &&
          (level === 'All' || c.level === level) &&
          (!query || c.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [courses, trackFilter, level, query],
  )

  const liveCategory = CATEGORIES.find((c) => c.status === 'live')!
  const liveTracks = TRACKS.filter((t) => t.categoryId === liveCategory.id)

  const focusTrack = (t: AcademyTrack) => {
    setTrackFilter((cur) => (cur?.id === t.id ? null : t))
    coursesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      {/* hero */}
      <header className={styles.hero}>
        <span className={styles.heroKicker}>◆ Sage Academy</span>
        <h1 className={styles.heroTitle}>
          Learn to build with AI —<br />
          <span className={styles.heroEm}>by actually building.</span>
        </h1>
        <p className={styles.heroSub}>
          Project-based tracks, in-browser labs, and a learning engine that won&rsquo;t let you fake it.
          Browse the curriculum, follow a path, or assemble your own.
        </p>
        <div className={styles.heroActions}>
          <Link href="/academy/engine" className={styles.heroPrimary}>See how a sprint works →</Link>
          <Link href="/academy/dashboard" className={styles.heroGhost}>My learning</Link>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search courses, skills, labs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search the catalog"
            />
          </label>
        </div>
      </header>

      {/* category switcher */}
      <nav className={styles.categories} aria-label="Categories">
        {CATEGORIES.map((c) => (
          <div key={c.id} className={styles.category} data-status={c.status}>
            <span className={styles.categoryGlyph} aria-hidden="true">{c.glyph}</span>
            <span className={styles.categoryMeta}>
              <span className={styles.categoryName}>{c.name}</span>
              <span className={styles.categoryTag}>{c.tagline}</span>
            </span>
            {c.status !== 'live' ? <span className={styles.soon}>Coming soon</span> : <span className={styles.liveDot} aria-hidden="true" />}
          </div>
        ))}
      </nav>

      {/* the tracks — the architecture centerpiece */}
      <section className={styles.section} aria-labelledby="tracks-h">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>{liveCategory.name}</p>
          <h2 id="tracks-h" className={styles.h2}>Twelve tracks mapped — two live, the rest in build.</h2>
        </div>
        <div className={styles.trackGrid}>
          {liveTracks.map((t) => {
            const live = t.status === 'live'
            return (
              <button
                key={t.id}
                type="button"
                className={styles.trackCard}
                style={tvars(t.topic)}
                data-on={trackFilter?.id === t.id}
                data-status={t.status}
                onClick={() => (live ? focusTrack(t) : undefined)}
                aria-pressed={trackFilter?.id === t.id}
                aria-disabled={!live}
              >
                <span className={styles.trackTop}>
                  <span className={styles.trackGlyph} aria-hidden="true">{t.glyph}</span>
                  <span className={styles.trackStatus} data-status={t.status}>{live ? 'Live' : 'Building'}</span>
                </span>
                <h3 className={styles.trackName}>{t.name}</h3>
                <p className={styles.trackBlurb}>{t.blurb}</p>
                <span className={styles.trackOutcome}>→ {t.outcome}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* resume — only when there is real recorded progress */}
      {resume && (
        <Link href={resume.href} className={styles.resume}>
          <span className={styles.resumeAccent} aria-hidden="true" />
          <div className={styles.resumeBody}>
            <span className={styles.resumeKicker}>▸ {resume.kicker}</span>
            <span className={styles.resumeTitle}>{resume.title}</span>
          </div>
          <div className={styles.resumeMeta}>
            <span className={styles.resumeSub}>{resume.sub}</span>
            <span className={styles.resumeBar} aria-hidden="true"><span style={{ width: `${resume.pct}%` }} /></span>
          </div>
          <span className={styles.resumeBtn}>{resume.pct > 0 ? 'Resume →' : 'Start →'}</span>
        </Link>
      )}

      {/* curated paths */}
      <section className={styles.section} aria-labelledby="paths-h">
        <div className={styles.sectionHead}>
          <p className={styles.kicker}>Curated paths</p>
          <h2 id="paths-h" className={styles.h2}>Guided journeys — first line to shipped.</h2>
        </div>
        <div className={styles.pathGrid}>
          {paths.map((p) => (
            <Link key={p.slug} href="/academy/preview" className={styles.pathCard} style={tvars(p.topic)}>
              <span className={styles.pathLayers} aria-hidden="true"><i /><i /><i /></span>
              <span className={styles.pathLevel}>{p.level}</span>
              <h3 className={styles.pathName}>{p.name}</h3>
              <span className={styles.pathMeta}>{p.courses} courses · {p.hours} hrs</span>
              <span className={styles.pathBar} aria-hidden="true">
                <span style={{ width: `${Math.round((p.progress ?? 0) * 100)}%` }} />
              </span>
              <span className={styles.pathCta}>
                {p.progress ? `${Math.round(p.progress * 100)}% · continue →` : 'Start path →'}
              </span>
            </Link>
          ))}
          <Link href="/academy/build" className={styles.buildCard}>
            <span className={styles.buildKicker}>⬡ Modular</span>
            <h3 className={styles.buildName}>Build your own path</h3>
            <p className={styles.buildBody}>Pick your outcome, snap together the exact courses + labs you want — your own ordered track.</p>
            <span className={styles.buildBtn}>Start building →</span>
          </Link>
        </div>
      </section>

      {/* all courses */}
      <section className={styles.section} aria-labelledby="courses-h" ref={coursesRef}>
        <div className={styles.browseHead}>
          <div>
            <p className={styles.kicker}>{trackFilter ? trackFilter.name : 'All courses'}</p>
            <h2 id="courses-h" className={styles.h2}>
              {trackFilter ? (
                <>Courses in this track. <button type="button" className={styles.clearFilter} onClick={() => setTrackFilter(null)}>clear ✕</button></>
              ) : (
                <>Browse the catalog. <span className={styles.count}>{totalCourses} live · more rolling out</span></>
              )}
            </h2>
          </div>
          <div className={styles.levels} role="group" aria-label="Filter by level">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                className={`${styles.level} ${level === l ? styles.levelOn : ''}`}
                onClick={() => setLevel(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyGlyph} aria-hidden="true">◇</span>
            <p>{trackFilter ? `${trackFilter.name} sprints are rolling out.` : 'No courses match those filters yet.'}</p>
            <span className={styles.emptySub}>New sprints ship into this engine continuously. {trackFilter ? <button type="button" className={styles.clearFilter} onClick={() => setTrackFilter(null)}>See all courses</button> : 'Widen your filters to see more.'}</span>
          </div>
        ) : (
          <div className={styles.courseGrid}>
            {filtered.map((c) => (
              <Link key={c.slug} href={`/academy/course/${c.slug}`} className={styles.courseCard} style={tvars(c.topic)}>
                <div className={styles.courseTop}>
                  <span className={styles.courseTag}>{TOPICS[c.topic].label}</span>
                  <span className={styles.courseLevel}>{c.level}</span>
                </div>
                <h3 className={styles.courseTitle}>{c.title}</h3>
                <span className={styles.skillBar} aria-hidden="true"><i /><i /><i /><i /></span>
                <span className={styles.courseMeta}>{c.lessons} lessons · {c.hours}h</span>
                <div className={styles.courseFoot}>
                  <span className={styles.courseStart}>Start →</span>
                  <span className={styles.coursePath}>+ add to path</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
