import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { CourseOverview as Overview, OverviewLesson } from '@/lib/academy/content'
import { TOPICS } from '@/lib/academy/topics'
import styles from './course-map.module.css'

/**
 * Course Map — the syllabus/map for a single course, laid out module-by-module with a
 * lesson list under each. Presentation-only; every value is real course-structure data
 * (title, ordered modules, ordered lessons, real per-lesson completion). No lesson
 * "kind"/type or XP is fabricated — those chips are omitted because the data model
 * (academy_lessons) carries no such fields. Duration is the real est_minutes.
 *
 * Status per lesson is derived from real progress:
 *  - done    → the learner has a completed row for this lesson slug
 *  - current → the resume lesson (first not-completed in course order)
 *  - locked  → any lesson AFTER the resume lesson in course order (not yet reachable)
 *  - todo    → not completed but at/before the resume point (reachable, un-highlighted)
 * A fully-completed course has no current/locked rows.
 */

type Status = 'done' | 'current' | 'locked' | 'todo'

type FlatLesson = OverviewLesson & {
  index: number // 1-based course-wide lesson number
  moduleIndex: number // 0-based module index
  status: Status
}

const NUM = (n: number) => String(n).padStart(2, '0')

function flatten(overview: Overview): FlatLesson[] {
  const out: (OverviewLesson & { index: number; moduleIndex: number })[] = []
  let i = 0
  overview.modules.forEach((m, mi) => {
    for (const l of m.lessons) {
      i += 1
      out.push({ ...l, index: i, moduleIndex: mi })
    }
  })
  return out as FlatLesson[]
}

/** Resolve real status for every lesson from the completed set + the resume point. */
function withStatus(flat: FlatLesson[], completed: Set<string>, resumeSlug: string | null): FlatLesson[] {
  const resumeIdx = resumeSlug ? flat.findIndex((l) => l.slug === resumeSlug) : -1
  return flat.map((l) => {
    let status: Status
    if (completed.has(l.slug)) status = 'done'
    else if (resumeIdx >= 0 && l.slug === resumeSlug) status = 'current'
    else if (resumeIdx >= 0 && l.index > flat[resumeIdx].index) status = 'locked'
    else status = 'todo'
    return { ...l, status }
  })
}

const DOT: Record<Status, string> = { done: '✓', current: '●', locked: '○', todo: '○' }
const CHIP: Record<Status, string> = { done: 'DONE', current: 'RESUME →', locked: 'LOCKED', todo: 'START' }

export function CourseMap({
  overview,
  completed,
  doneCount,
  resumeSlug,
}: {
  overview: Overview
  completed: Set<string>
  doneCount: number
  resumeSlug: string | null
}) {
  const flat = withStatus(flatten(overview), completed, resumeSlug)
  const byIndex = new Map(flat.map((l) => [l.slug, l]))

  const moduleCount = overview.modules.length
  const total = overview.lessonsTotal
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const topicLabel = TOPICS[overview.topic]?.label ?? overview.topic

  const resume = resumeSlug ? byIndex.get(resumeSlug) ?? null : null
  const resumeHref = resumeSlug ? `/academy/learn/${overview.slug}/${resumeSlug}` : null

  // placement = real, honest position in the course (not a fabricated score/level).
  const placement = doneCount === 0 ? 'not started' : doneCount === total ? 'complete' : `lesson ${resume ? NUM(resume.index) : NUM(doneCount + 1)}`

  const rootStyle = {} as CSSProperties

  return (
    <div className={styles.root} style={rootStyle}>
      <main className={styles.main}>
        {/* Ghost numeral — module count, matching the course-overview convention. */}
        <div className={styles.ghost} aria-hidden="true">
          {NUM(moduleCount)}
        </div>

        {/* ── Header: breadcrumb kicker · title · resume CTA · meta ── */}
        <header className={styles.header}>
          <p className={styles.kicker}>
            {topicLabel} · {total} lesson{total === 1 ? '' : 's'} · {moduleCount} module{moduleCount === 1 ? '' : 's'}
          </p>
          <h1 className={styles.title}>{overview.title}</h1>

          <div className={styles.headRow}>
            {resumeHref && resume ? (
              <Link href={resumeHref} className={styles.resume}>
                {doneCount === 0 ? 'Start' : 'Resume'} — Lesson {NUM(resume.index)}
              </Link>
            ) : null}
            <span className={styles.meta}>
              {doneCount} of {total} lessons · your placement:{' '}
              <span className={styles.metaAccent}>{placement}</span>
            </span>
          </div>

          {/* Real progress bar — only rendered once there's recorded progress. */}
          {doneCount > 0 ? (
            <div className={styles.track} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
          ) : null}
        </header>

        {/* ── Module sections ── */}
        <div className={styles.modules}>
          {overview.modules.map((m, mi) => {
            const rows = flat.filter((l) => l.moduleIndex === mi)
            const done = rows.filter((l) => l.status === 'done').length
            const isComplete = rows.length > 0 && done === rows.length
            const inProgress = rows.some((l) => l.status === 'current') || (done > 0 && !isComplete)
            const summary = isComplete
              ? `${done} of ${rows.length} · complete`
              : inProgress
                ? `${done} of ${rows.length} · in progress`
                : `${done} of ${rows.length}`
            const activeModule = rows.some((l) => l.status === 'current')

            return (
              <section
                key={m.title}
                className={styles.module}
                data-active={activeModule || undefined}
                aria-label={`Module ${NUM(mi + 1)}: ${m.title}`}
              >
                <div className={styles.moduleHead}>
                  <div className={styles.moduleHeadMain}>
                    <span className={styles.moduleNum} data-active={activeModule || undefined}>
                      MODULE {NUM(mi + 1)}
                    </span>
                    <span className={styles.moduleName}>{m.title}</span>
                  </div>
                  <span className={styles.moduleSummary} data-state={isComplete ? 'complete' : inProgress ? 'active' : 'idle'}>
                    {summary}
                  </span>
                </div>

                {rows.map((l) => {
                  const href = `/academy/learn/${overview.slug}/${l.slug}`
                  const locked = l.status === 'locked'
                  const row = (
                    <>
                      <span className={styles.rowNum}>{NUM(l.index)}</span>
                      <span className={styles.rowDot} data-status={l.status} aria-hidden="true">
                        {DOT[l.status]}
                      </span>
                      <span className={styles.rowBody}>
                        <span className={styles.rowTitle} data-status={l.status}>
                          {l.title}
                        </span>
                        {l.isFreePreview ? <span className={styles.rowKind}>free preview</span> : null}
                      </span>
                      {l.estMinutes ? <span className={styles.rowLen}>{l.estMinutes} min</span> : <span />}
                      <span className={styles.rowChip} data-status={l.status}>
                        {CHIP[l.status]}
                      </span>
                    </>
                  )
                  return locked ? (
                    <div key={l.slug} className={styles.row} data-status={l.status} aria-disabled="true">
                      {row}
                    </div>
                  ) : (
                    <Link key={l.slug} href={href} className={styles.row} data-status={l.status}>
                      {row}
                    </Link>
                  )
                })}
              </section>
            )
          })}
        </div>

        {/* ── Footer note ── */}
        <div className={styles.footnote}>
          <span className={styles.footMark} aria-hidden="true">
            ¶
          </span>
          <span className={styles.footText}>
            The artifact grows through every module — frame the question → map it → decide → prove it. Keep going, and
            keep your{' '}
            <Link href="/academy/evidence" className={styles.footLink}>
              evidence ledger
            </Link>{' '}
            current.
          </span>
        </div>
      </main>
    </div>
  )
}
