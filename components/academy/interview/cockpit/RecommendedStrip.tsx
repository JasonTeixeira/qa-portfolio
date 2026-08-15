'use client'

import { useStartMock } from './useStartMock'
import styles from './cockpit.module.css'

export type RecoScenario = {
  slug: string
  title: string
  track: string
  estMinutes: number
  /** Dimension slugs this scenario attacks (interview_scenarios.trains). */
  trains?: readonly string[]
}

type Props = {
  scenarios: readonly RecoScenario[]
}

const TRACK_LABEL: Record<string, string> = {
  coding: 'Coding',
  system_design: 'System design',
  behavioral: 'Behavioral',
  negotiation: 'Negotiation',
}

/**
 * The recommended-scenarios strip. Each chip starts that mock directly (own-row RLS insert →
 * route), sharing the same honest start path as the primary CTA. Only real, published scenarios
 * appear here — the strip is empty (and the caller hides it) when there are none.
 */
export function RecommendedStrip({ scenarios }: Props) {
  const { start, pending, startingSlug, error } = useStartMock()

  return (
    <>
      <div className={styles.recoStrip}>
        {scenarios.map((s) => (
          <button
            key={s.slug}
            type="button"
            className={styles.recoChip}
            onClick={() => start(s.slug)}
            disabled={pending}
          >
            <div className={styles.recoTrack}>{TRACK_LABEL[s.track] ?? s.track}</div>
            <div className={styles.recoTitle}>{s.title}</div>
            <div className={styles.recoMeta}>
              {startingSlug === s.slug ? 'starting…' : `~${s.estMinutes} min`}
            </div>
          </button>
        ))}
      </div>
      {error ? (
        <span className={styles.startError} role="alert">
          {error}
        </span>
      ) : null}
    </>
  )
}
