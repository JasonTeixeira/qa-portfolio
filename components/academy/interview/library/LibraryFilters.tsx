'use client'

import { difficultyLabel } from './format'
import styles from './library.module.css'

type TrackFilter = { value: string; label: string; count: number }

type Props = {
  trackFilters: readonly TrackFilter[]
  activeTrack: string
  onTrackChange: (value: string) => void
  difficultyOptions: readonly string[]
  activeDifficulty: string
  onDifficultyChange: (value: string) => void
  allValue: string
  /** Real weakest dimension from interview_readiness — null when the learner has no graded mock yet. */
  weakestLabel: string | null
  weakestScore: number | null
}

/**
 * The filter sidebar: track filters (with real per-track counts), a difficulty filter, and the
 * "attacks your cap" readout. That readout shows the learner's REAL weakest dimension + score from
 * interview_readiness; with no readiness yet it says so honestly instead of inventing a cap.
 */
export function LibraryFilters({
  trackFilters,
  activeTrack,
  onTrackChange,
  difficultyOptions,
  activeDifficulty,
  onDifficultyChange,
  allValue,
  weakestLabel,
  weakestScore,
}: Props) {
  return (
    <aside className={styles.filters}>
      <div className={styles.filterKicker}>Track</div>
      <div className={styles.filterList}>
        {trackFilters.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`${styles.filterItem} ${activeTrack === f.value ? styles.filterItemActive : ''}`}
            onClick={() => onTrackChange(f.value)}
          >
            <span>{f.label}</span>
            <span className={styles.filterCount}>{f.count}</span>
          </button>
        ))}
      </div>

      {difficultyOptions.length > 1 ? (
        <div className={styles.filterDivider}>
          <div className={styles.filterKicker}>Difficulty</div>
          <div className={styles.diffRow}>
            <button
              type="button"
              className={`${styles.diffChip} ${activeDifficulty === allValue ? styles.diffChipActive : ''}`}
              onClick={() => onDifficultyChange(allValue)}
            >
              any
            </button>
            {difficultyOptions.map((d) => (
              <button
                key={d}
                type="button"
                className={`${styles.diffChip} ${activeDifficulty === d ? styles.diffChipActive : ''}`}
                onClick={() => onDifficultyChange(d)}
              >
                {difficultyLabel(d)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.filterDivider}>
        <div className={styles.filterKicker}>Attacks your cap</div>
        {weakestLabel ? (
          <span className={styles.capPill}>
            {weakestLabel.toLowerCase()}
            {weakestScore != null ? ` · ${weakestScore}` : ''}
          </span>
        ) : (
          <span className={styles.capNone}>
            No readiness yet — run one graded mock and the bank re-sorts around your weakest habit.
          </span>
        )}
      </div>
    </aside>
  )
}
