'use client'

import { useStartMock } from '@/components/academy/interview/cockpit/useStartMock'
import { TRACK_LABEL, trackGlyph, difficultyLabel, difficultyClass, trainsLabel } from './format'
import styles from './library.module.css'

export type LibraryScenario = {
  slug: string
  track: string
  title: string
  description: string
  estMinutes: number
  difficulty: string
  trains: readonly string[]
  recommended: boolean
  /** True ONLY when the learner has real readiness AND this scenario's trains include their weakest dim. */
  attacksCap: boolean
}

type Props = {
  scenario: LibraryScenario
}

/**
 * One scenario row. "Start this mock" runs the READ-ONLY createSession action (own-row RLS insert)
 * via the shared useStartMock hook — the exact honest start-and-route path the Cockpit uses — and
 * navigates to the live session only on success. The "attacks your cap" badge renders only when the
 * caller marked it (real readiness present); no readiness → no badge, never a fabricated cue.
 */
export function ScenarioCard({ scenario }: Props) {
  const { start, pending, startingSlug, error } = useStartMock()
  const glyph = trackGlyph(scenario.track)
  const starting = startingSlug === scenario.slug

  return (
    <>
      <button
        type="button"
        className={`${styles.card} ${scenario.attacksCap ? styles.cardCap : ''}`}
        onClick={() => start(scenario.slug)}
        disabled={pending}
        aria-label={`Start mock: ${scenario.title}`}
      >
        <span className={`${styles.glyph} ${glyph.cls}`} aria-hidden>
          {glyph.glyph}
        </span>
        <span className={styles.cardMid}>
          <span className={styles.titleRow}>
            <span className={styles.title}>{scenario.title}</span>
            {scenario.attacksCap ? (
              <span className={styles.capBadge}>attacks your cap</span>
            ) : scenario.recommended ? (
              <span className={styles.forYou}>for you</span>
            ) : null}
          </span>
          <span className={styles.desc}>{scenario.description}</span>
          <span className={styles.metaRow}>
            <span>{TRACK_LABEL[scenario.track] ?? scenario.track}</span>
            <span>~{scenario.estMinutes} min</span>
            <span className={difficultyClass(scenario.difficulty)}>{difficultyLabel(scenario.difficulty)}</span>
            <span>trains: {trainsLabel(scenario.trains)}</span>
          </span>
        </span>
        <span className={styles.cardRight}>
          <span className={styles.startLabel}>{starting ? 'starting…' : 'start →'}</span>
        </span>
      </button>
      {error && starting ? (
        <span className={styles.startError} role="alert">
          {error}
        </span>
      ) : null}
    </>
  )
}
