'use client'

import { useState, useTransition } from 'react'
import { GOAL_CATALOG } from '@/lib/academy/goal-logic'
import { setLearnerGoal } from '@/app/academy/_actions/goals'
import styles from './goal-picker.module.css'

type Props = {
  /** The learner's already-chosen goal key (shows as selected), if any. */
  initialGoalKey?: string | null
  /** Called after a goal is successfully saved (e.g. advance the onboarding step). */
  onSaved?: (goalKey: string) => void
}

export function GoalPicker({ initialGoalKey = null, onSaved }: Props) {
  const [selected, setSelected] = useState<string | null>(initialGoalKey)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const choose = (goalKey: string) => {
    if (pending) return
    setSelected(goalKey)
    setError(null)
    setSavingKey(goalKey)
    start(async () => {
      const result = await setLearnerGoal(goalKey)
      if (result.ok) {
        onSaved?.(goalKey)
      } else {
        setError(result.error)
        setSelected(initialGoalKey)
      }
      setSavingKey(null)
    })
  }

  return (
    <div
      className={styles.grid}
      role="radiogroup"
      aria-label="What do you want to achieve?"
    >
      {GOAL_CATALOG.map((goal) => {
        const isOn = selected === goal.key
        const isSaving = pending && savingKey === goal.key
        return (
          <button
            key={goal.key}
            type="button"
            role="radio"
            aria-checked={isOn}
            disabled={pending}
            data-on={isOn}
            className={styles.card}
            onClick={() => choose(goal.key)}
          >
            <span className={styles.label}>{goal.label}</span>
            <span className={styles.blurb}>{goal.blurb}</span>
            {isSaving ? <span className={styles.saving}>Saving…</span> : null}
          </button>
        )
      })}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
