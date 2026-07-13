'use client'

import { useEffect, useState } from 'react'
import type { LessonBlock } from '@/data/academy/sample-course'
import styles from './archetype.module.css'

/** The four visual archetypes every block type maps to. Shared so the player,
 *  the sprint sections, and this spine agree on how a block reads. */
export type Archetype = 'narrative' | 'interactive' | 'proof' | 'viz'

const ARCHETYPE_BY_TYPE: Record<string, Archetype> = {
  // NARRATIVE — editorial prose, no card
  mission: 'narrative',
  context: 'narrative',
  concept: 'narrative',
  prose: 'narrative',
  'worked-example': 'narrative',
  'sprint-contract': 'narrative',
  // DO / INTERACTIVE — console/panel + primary button
  pretest: 'interactive',
  quiz: 'interactive',
  calibration: 'interactive',
  lab: 'interactive',
  teachback: 'interactive',
  transfer: 'interactive',
  code: 'interactive',
  'code-walkthrough': 'interactive',
  video: 'interactive',
  // PROOF / GATE — reserved semantic-color surfaces
  verification: 'proof',
  'unlock-gate': 'proof',
  'spaced-review': 'proof',
  // COMPARISON / VIZ — diagram-forward / two-column
  compare: 'viz',
  tradeoff: 'viz',
  diagram: 'viz',
  viz: 'viz',
  callout: 'viz',
  debug: 'viz',
}

/** Short human phase label per block type — the spine reads as the lesson's shape. */
const PHASE_LABEL: Record<string, string> = {
  'sprint-contract': 'Contract',
  mission: 'Mission',
  context: 'Context',
  prose: 'Read',
  concept: 'Concept',
  'worked-example': 'Worked example',
  pretest: 'Pretest',
  lab: 'Lab',
  code: 'Code',
  'code-walkthrough': 'Walkthrough',
  video: 'Watch',
  quiz: 'Quick check',
  calibration: 'Calibration',
  teachback: 'Teach-back',
  transfer: 'Transfer',
  debug: 'Broken case',
  tradeoff: 'Tradeoff',
  compare: 'Compare',
  diagram: 'System map',
  viz: 'Visual',
  callout: 'Note',
  verification: 'Verification',
  'unlock-gate': 'Unlock gate',
  'spaced-review': 'Spaced review',
}

export function archetypeFor(type: string): Archetype {
  return ARCHETYPE_BY_TYPE[type] ?? 'interactive'
}

/** Stable DOM id for a block anchor so the spine can observe + jump to it. */
export function blockAnchorId(index: number): string {
  return `lesson-block-${index}`
}

/** In-lesson progress spine — a thin step track over the numbered blocks with a
 *  live position readout. Tracks the active block by intersection so the learner
 *  always sees the lesson's shape and how far along they are. Decorative track is
 *  aria-hidden (the numbered blocks are the real structure); the phase readout is
 *  announced politely. Reduced-motion safe (CSS gates the transitions). */
export function LessonSpine({ blocks }: { blocks: LessonBlock[] }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (blocks.length === 0) return
    const els = blocks
      .map((_, i) => document.getElementById(blockAnchorId(i)))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return

    // The block whose top is closest to a band just under the topbar wins.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (!visible) return
        const idx = Number((visible.target as HTMLElement).dataset.blockIndex)
        if (!Number.isNaN(idx)) setActive(idx)
      },
      { rootMargin: '-96px 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [blocks])

  if (blocks.length < 2) return null

  const current = blocks[active]
  const phase = current ? (PHASE_LABEL[current.type] ?? 'Lesson') : 'Lesson'

  return (
    <div className={styles.spine}>
      <div className={styles.spineTrack} aria-hidden="true">
        {blocks.map((_, i) => (
          <span
            key={i}
            className={styles.spineStep}
            data-state={i < active ? 'done' : i === active ? 'current' : 'todo'}
          />
        ))}
      </div>
      <p className={styles.spineMeta} role="status" aria-live="polite">
        <span className={styles.spinePhase}>{phase}</span>
        {/* Explicit per-lesson step locator (blocker #5) — "Step N of M" so this
            reads as position-in-lesson, never confused with the sidebar's
            course-level "% · lessons" or the header's best-mastery score. */}
        <span className={styles.spineCount}>
          Step {active + 1} of {blocks.length}
        </span>
      </p>
    </div>
  )
}
