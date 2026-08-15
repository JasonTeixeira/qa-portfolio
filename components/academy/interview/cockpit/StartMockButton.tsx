'use client'

import { useStartMock } from './useStartMock'
import styles from './cockpit.module.css'

type Props = {
  /** The scenario to launch (slug of a published interview_scenarios row). */
  scenarioSlug: string
  /** Button label. */
  label: string
}

/**
 * The primary "start a mock" CTA. Thin wrapper over useStartMock so the first-run state, the
 * recommended strip, and the hero all share one honest start-and-route path.
 */
export function StartMockButton({ scenarioSlug, label }: Props) {
  const { start, pending, error } = useStartMock()

  return (
    <>
      <button
        type="button"
        className={styles.ctaPrimary}
        onClick={() => start(scenarioSlug)}
        disabled={pending}
      >
        {pending ? 'Starting…' : label}
      </button>
      {error ? (
        <span className={styles.startError} role="alert">
          {error}
        </span>
      ) : null}
    </>
  )
}
