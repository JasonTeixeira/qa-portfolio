'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import type { Course } from '@/data/academy/sample-course'
import { Icon } from '@/components/academy/ui/Icon'
import styles from './lesson.module.css'

type RailModule = Course['modules'][number]

/** done / total for a module — real completion only (status === 'done'). */
function moduleProgress(mod: RailModule): { done: number; total: number } {
  return {
    done: mod.lessons.filter((l) => l.status === 'done').length,
    total: mod.lessons.length,
  }
}

/** Index of the module containing the current lesson (for default-expand). */
function currentModuleIndex(modules: RailModule[]): number {
  const i = modules.findIndex((m) => m.lessons.some((l) => l.status === 'current'))
  return i < 0 ? 0 : i
}

function ModuleGroup({
  mod,
  expanded,
  onToggle,
  lessonHref,
  onNavigate,
}: {
  mod: RailModule
  expanded: boolean
  onToggle: () => void
  lessonHref: (slug: string) => string
  onNavigate?: () => void
}) {
  const { done, total } = moduleProgress(mod)
  const panelId = `${useId()}-panel`
  const complete = total > 0 && done === total

  return (
    <div className={styles.module}>
      <button
        type="button"
        className={styles.moduleHead}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <Icon
          name={expanded ? 'chevron-down' : 'chevron-right'}
          size={14}
          className={styles.moduleChevron}
        />
        <span className={styles.moduleName}>{mod.title}</span>
        <span
          className={styles.moduleCount}
          data-complete={complete || undefined}
          aria-label={`${done} of ${total} lessons complete`}
        >
          {complete ? <Icon name="check" size={11} /> : null}
          {done}/{total}
        </span>
      </button>
      <ul
        id={panelId}
        className={styles.lessonList}
        hidden={!expanded}
        aria-label={mod.title}
      >
        {mod.lessons.map((l) => {
          const isLocked = l.status === 'todo'
          return (
            <li key={l.slug}>
              <Link
                href={lessonHref(l.slug)}
                className={`${styles.lessonItem} ${l.status === 'current' ? styles.lessonOn : ''}`}
                data-status={l.status}
                aria-current={l.status === 'current' ? 'page' : undefined}
                onClick={onNavigate}
              >
                <span className={styles.lessonDot} aria-hidden="true">
                  {l.status === 'done' ? <Icon name="check" size={11} /> : null}
                </span>
                <span className={styles.lessonName}>{l.title}</span>
                {l.status === 'current' ? (
                  <span className={styles.lessonHere}>Now</span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** The collapsible MODULE → LESSON tree, shared by the desktop rail + mobile drawer. */
function RailTree({
  course,
  lessonHref,
  onNavigate,
}: {
  course: Course
  lessonHref: (slug: string) => string
  onNavigate?: () => void
}) {
  const pct = course.lessonsTotal
    ? Math.round((course.lessonsDone / course.lessonsTotal) * 100)
    : 0
  // The current lesson's module is open by default; the learner can toggle the rest.
  const [open, setOpen] = useState<Record<number, boolean>>(() => ({
    [currentModuleIndex(course.modules)]: true,
  }))

  return (
    <>
      <div className={styles.railHead}>
        <h2 className={styles.courseTitle}>{course.title}</h2>
        <p className={styles.courseSub}>{course.subtitle.toUpperCase()}</p>
        <div className={styles.bar} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.barLabel}>
          {pct}% complete · {course.lessonsDone} / {course.lessonsTotal} lessons
        </p>
      </div>
      <nav className={styles.tree} aria-label="Course contents">
        {course.modules.map((mod, i) => (
          <ModuleGroup
            key={mod.title}
            mod={mod}
            expanded={!!open[i]}
            onToggle={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            lessonHref={lessonHref}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </>
  )
}

/** Locate the current lesson + its module for the mobile summary control. */
function currentLocation(course: Course): { moduleN: number; title: string } {
  for (let i = 0; i < course.modules.length; i++) {
    const l = course.modules[i].lessons.find((x) => x.status === 'current')
    if (l) return { moduleN: i + 1, title: l.title }
  }
  const first = course.modules[0]?.lessons[0]
  return { moduleN: 1, title: first?.title ?? course.title }
}

export function CourseRail({
  course,
  lessonHref,
}: {
  course: Course
  lessonHref: (slug: string) => string
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const here = currentLocation(course)

  // Lock body scroll + close on Escape while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  return (
    <>
      {/* desktop: sticky, independently scrollable rail */}
      <aside className={styles.sidebar} aria-label="Course navigation">
        <RailTree course={course} lessonHref={lessonHref} />
      </aside>

      {/* mobile: a compact summary control that opens the tree as a sheet */}
      <button
        type="button"
        className={styles.railTrigger}
        aria-expanded={drawerOpen}
        aria-haspopup="dialog"
        onClick={() => setDrawerOpen(true)}
      >
        <span className={styles.railTriggerMod}>Module {here.moduleN}</span>
        <span className={styles.railTriggerSep} aria-hidden="true">
          ·
        </span>
        <span className={styles.railTriggerTitle}>{here.title}</span>
        <span className={styles.railTriggerOpen}>
          Contents <Icon name="chevron-down" size={14} />
        </span>
      </button>

      {drawerOpen ? (
        <div className={styles.drawerRoot} role="dialog" aria-modal="true" aria-label="Course contents">
          <button
            type="button"
            className={styles.drawerScrim}
            aria-label="Close course contents"
            onClick={() => setDrawerOpen(false)}
          />
          <div className={styles.drawerPanel}>
            <div className={styles.drawerBar}>
              <span className={styles.drawerBarLabel}>Course contents</span>
              <button
                type="button"
                className={styles.drawerClose}
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              <RailTree
                course={course}
                lessonHref={lessonHref}
                onNavigate={() => setDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
