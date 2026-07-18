'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleReminder } from '@/app/academy/interview/_actions-plan'
import styles from './schedule.module.css'

export type ReminderState = {
  label: string
  enabled: boolean
}

type Props = {
  reminders: readonly ReminderState[]
}

/**
 * Reminder toggles wired to the spine's toggleReminder (own-row upsert keyed on label). The toggle
 * state is REAL: each row's `enabled` came from a server read of interview_reminders, and toggling
 * upserts the row then optimistically flips local state (reverting on failure). The product-defined
 * label set is passed in from the server, which merges it with the learner's actual rows — so a
 * fresh learner sees the standard reminders all off, not fabricated as on.
 */
export function ReminderToggles({ reminders }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState<ReminderState[]>(() => reminders.map((r) => ({ ...r })))

  function handleToggle(index: number) {
    const target = state[index]
    if (!target) return
    const next = !target.enabled
    // Optimistic flip.
    setState((prev) => prev.map((r, i) => (i === index ? { ...r, enabled: next } : r)))
    startTransition(async () => {
      const result = await toggleReminder({ label: target.label, enabled: next })
      if (!result.ok) {
        // Revert on failure — never leave the UI asserting a state the DB rejected.
        setState((prev) => prev.map((r, i) => (i === index ? { ...r, enabled: !next } : r)))
        return
      }
      router.refresh()
    })
  }

  return (
    <div>
      {state.map((r, i) => (
        <button
          key={r.label}
          type="button"
          className={styles.remRow}
          onClick={() => handleToggle(i)}
          disabled={pending}
          aria-pressed={r.enabled}
        >
          <span className={`${styles.remPill} ${r.enabled ? styles.remPillOn : ''}`}>
            <span className={`${styles.remKnob} ${r.enabled ? styles.remKnobOn : ''}`} />
          </span>
          <span className={styles.remLabel}>{r.label}</span>
        </button>
      ))}
    </div>
  )
}
