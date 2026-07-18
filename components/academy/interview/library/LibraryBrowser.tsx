'use client'

import { useMemo, useState } from 'react'
import { ScenarioCard, type LibraryScenario } from './ScenarioCard'
import { LibraryFilters } from './LibraryFilters'
import { TRACK_ORDER, TRACK_LABEL } from './format'
import styles from './library.module.css'

type Props = {
  /** Already weakest-first sorted server-side. Order is preserved through filtering. */
  scenarios: readonly LibraryScenario[]
  /** Weakest dimension label + score for the sidebar "attacks your cap" pill — null with no readiness. */
  weakestLabel: string | null
  weakestScore: number | null
  totalPublished: number
}

const ALL = '__all__'

/**
 * The interactive library: track / difficulty / search over the real published scenarios. The
 * incoming order is the server's weakest-first sort, so filtering only ever removes rows — it never
 * re-orders away from "what fixes your cap first". Filtering is pure client work over already-loaded
 * real rows; nothing here fabricates a scenario.
 */
export function LibraryBrowser({ scenarios, weakestLabel, weakestScore, totalPublished }: Props) {
  const [track, setTrack] = useState<string>(ALL)
  const [difficulty, setDifficulty] = useState<string>(ALL)
  const [query, setQuery] = useState('')

  const trackCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of scenarios) counts.set(s.track, (counts.get(s.track) ?? 0) + 1)
    return counts
  }, [scenarios])

  const trackFilters = useMemo(
    () => [
      { value: ALL, label: 'All', count: scenarios.length },
      ...TRACK_ORDER.filter((t) => (trackCounts.get(t) ?? 0) > 0).map((t) => ({
        value: t,
        label: TRACK_LABEL[t] ?? t,
        count: trackCounts.get(t) ?? 0,
      })),
    ],
    [scenarios.length, trackCounts],
  )

  const difficultyOptions = useMemo(() => {
    const present = new Set(scenarios.map((s) => s.difficulty))
    return Array.from(present)
  }, [scenarios])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scenarios.filter((s) => {
      if (track !== ALL && s.track !== track) return false
      if (difficulty !== ALL && s.difficulty !== difficulty) return false
      if (q && !`${s.title} ${s.description}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [scenarios, track, difficulty, query])

  const hiddenCount = totalPublished - visible.length

  return (
    <div className={styles.lib}>
      <LibraryFilters
        trackFilters={trackFilters}
        activeTrack={track}
        onTrackChange={setTrack}
        difficultyOptions={difficultyOptions}
        activeDifficulty={difficulty}
        onDifficultyChange={setDifficulty}
        allValue={ALL}
        weakestLabel={weakestLabel}
        weakestScore={weakestScore}
      />

      <div>
        <div className={styles.searchBar}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search scenarios by title or description…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search scenarios"
          />
        </div>

        {visible.length === 0 ? (
          <div className={styles.emptyList}>No scenarios match these filters. Clear them to see the full bank.</div>
        ) : (
          <div className={styles.list}>
            {visible.map((s) => (
              <ScenarioCard key={s.slug} scenario={s} />
            ))}
          </div>
        )}

        {hiddenCount > 0 && visible.length > 0 ? (
          <div className={styles.footNote}>
            + {hiddenCount} more in the bank · the interviewer improvises within each scenario, so no
            two runs repeat
          </div>
        ) : null}
      </div>
    </div>
  )
}
