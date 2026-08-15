'use client'

import { useStartMock } from '@/components/academy/interview/cockpit/useStartMock'
import styles from './brief.module.css'

/** A queue slug resolved to a real, published interview_scenarios row. */
export type BriefQueueScenario = {
  slug: string
  title: string
  track: string
}

/** Monospace mode glyph per track (mirrors the design's CODE / SYS / BEHAV tags). */
const TRACK_MODE: Record<string, string> = {
  coding: 'CODE',
  system_design: 'SYS',
  behavioral: 'BEHAV',
  negotiation: 'NEG',
}

type Props = {
  scenarios: readonly BriefQueueScenario[]
}

/**
 * The tuned-queue list. Every row starts THAT mock directly through the shared useStartMock
 * hook (the same own-row createSession → route path the Cockpit and Library use), so nothing
 * here is fabricated — each entry is a real scenario the page already resolved from the brief's
 * stored queue slugs. Unresolved slugs are dropped upstream, so this only ever renders real rows.
 */
export function BriefQueue({ scenarios }: Props) {
  const { start, pending, startingSlug, error } = useStartMock()

  if (scenarios.length === 0) {
    return (
      <p className={styles.emptyNote}>
        No queued scenarios resolve to a published mock right now — browse the full library instead.
      </p>
    )
  }

  return (
    <>
      <div className={styles.queue}>
        {scenarios.map((s) => {
          const starting = startingSlug === s.slug
          return (
            <button
              key={s.slug}
              type="button"
              className={styles.queueItem}
              onClick={() => start(s.slug)}
              disabled={pending}
              aria-label={`Start this mock: ${s.title}`}
            >
              <span className={styles.queueMode} aria-hidden>
                {TRACK_MODE[s.track] ?? '◆'}
              </span>
              <span className={styles.queueName}>{s.title}</span>
              <span className={styles.queueMeta}>{starting ? 'starting…' : 'start →'}</span>
            </button>
          )
        })}
      </div>
      {error ? (
        <span className={styles.startError} role="alert">
          {error}
        </span>
      ) : null}
    </>
  )
}
