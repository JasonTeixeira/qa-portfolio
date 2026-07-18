'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { generateDrills } from '@/app/academy/interview/_actions-plan'
import { useStartMock } from '../cockpit/useStartMock'
import styles from './debrief.module.css'

/** One planned drill (interview_drills) joined to its real scenario slug. */
export type DebriefDrill = {
  id: string
  tag: string | null
  title: string
  meta: string | null
  status: string
  scenarioSlug: string | null
}

type Props = {
  sessionId: string
  drills: readonly DebriefDrill[]
}

/** Honest, user-facing copy for every generateDrills failure reason. */
const PLAN_REASONS: Record<string, string> = {
  unauthorized: 'Please sign in to plan your drills.',
  forbidden: 'This mock is not yours to plan.',
  not_graded: 'This mock has no committee grade yet — the plan is built from a real verdict.',
  planner_unavailable: 'The drill planner is offline right now. Try again shortly.',
  no_scenarios: 'No published scenarios are available to drill against yet.',
  plan_failed: 'The planner could not build a set this time — try again.',
  plan_empty: 'The planner returned no drills — try again.',
  insert_failed: 'Could not save the plan — try again.',
  session_required: 'No session selected.',
  server_error: 'Something went wrong — try again.',
}

/**
 * The weakest-first drill plan. Drills are a GRADED ARTIFACT — they exist ONLY when
 * generateDrills (server) has written them from the real verdict + readiness. This component never
 * fabricates a drill: if none exist it offers a "Plan my drills" action that calls generateDrills
 * and refreshes to render the real returned set; if they exist it renders them, each linking to
 * start its real scenario.
 */
export function DrillPlanner({ sessionId, drills }: Props) {
  const router = useRouter()
  const [planning, startPlanning] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { start, pending: starting, startingSlug } = useStartMock()

  function plan() {
    setError(null)
    startPlanning(async () => {
      const result = await generateDrills(sessionId)
      if (result.ok) {
        // The drills now exist server-side — reload so the real set renders from props.
        router.refresh()
        return
      }
      setError(PLAN_REASONS[result.reason] ?? 'Could not plan your drills — try again.')
    })
  }

  // ── No plan yet: the honest "Plan my drills" action ──
  if (drills.length === 0) {
    return (
      <>
        <span className={styles.planMark} aria-hidden>
          ◆
        </span>
        <div className={styles.planMain}>
          <div className={`${styles.cardKicker} ${styles.cardKickerGold}`}>
            Your next three reps · built from this debrief
          </div>
          <p className={styles.planEmptyLine}>
            No drills yet. Plan them from this grade and the committee builds three real reps that
            attack your weakest dimension first — each mapped to a published scenario.
          </p>
          {error ? <span className={styles.planError}>{error}</span> : null}
        </div>
        <button type="button" className={styles.planBtn} onClick={plan} disabled={planning}>
          {planning ? 'Planning…' : 'Plan my drills →'}
        </button>
      </>
    )
  }

  const topDrill = drills[0]

  return (
    <>
      <span className={styles.planMark} aria-hidden>
        ◆
      </span>
      <div className={styles.planMain}>
        <div className={`${styles.cardKicker} ${styles.cardKickerGold}`}>
          Your next three reps · built from this debrief
        </div>
        <div className={styles.drillGrid}>
          {drills.map((d, i) => {
            const isDone = d.status === 'done'
            const launching = starting && startingSlug === d.scenarioSlug
            return (
              <div key={d.id} className={styles.drill}>
                {d.tag ? <div className={styles.drillTag}>{d.tag}</div> : (
                  <div className={styles.drillTag}>{`DRILL ${i + 1}`}</div>
                )}
                <div className={styles.drillTitle}>{d.title}</div>
                {d.meta ? <div className={styles.drillMeta}>{d.meta}</div> : null}
                {isDone ? (
                  <div className={styles.drillDone}>✓ done</div>
                ) : d.scenarioSlug ? (
                  <button
                    type="button"
                    className={styles.drillStart}
                    onClick={() => start(d.scenarioSlug as string)}
                    disabled={starting}
                  >
                    {launching ? 'starting…' : 'start this drill →'}
                  </button>
                ) : (
                  <Link href="/academy/interview/library" className={styles.drillStart}>
                    find in library →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {topDrill.status !== 'done' && topDrill.scenarioSlug ? (
        <button
          type="button"
          className={styles.planBtn}
          onClick={() => start(topDrill.scenarioSlug as string)}
          disabled={starting}
        >
          {starting && startingSlug === topDrill.scenarioSlug ? 'Starting…' : 'Run the top drill →'}
        </button>
      ) : null}
    </>
  )
}
