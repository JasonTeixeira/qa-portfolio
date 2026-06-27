'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Trigger, TriggerTone } from '@/lib/academy/trigger-logic'
import styles from './trigger-banner.module.css'

interface TriggerBannerProps {
  /** Prioritised triggers from getTriggers (top-most first). Empty → renders nothing. */
  triggers: Trigger[]
}

// Tone → leading glyph. Semantic, not decoration: urgent = the streak flame the
// copy already references; warm = a forward arrow; neutral = a steady marker.
const TONE_ICON: Record<TriggerTone, string> = {
  urgent: '🔥',
  warm: '→',
  neutral: '•',
}

const TONE_CLASS: Record<TriggerTone, string> = {
  urgent: styles.urgent,
  warm: styles.warm,
  neutral: styles.neutral,
}

/**
 * A slim, dismissible nudge that surfaces the learner's single highest-priority
 * trigger at the top of the dashboard — the loop's entry point back to the right
 * next action.
 *
 * Shows only the top trigger (the engine already ranked them). Dismissing it
 * (close button or Esc) hides it for the rest of the session — no persistence, so
 * the next visit re-evaluates honestly against fresh state.
 *
 * a11y: role="status" so assistive tech announces the nudge without stealing
 * focus; the CTA is a real <Link>; dismiss is a labeled <button> reachable by
 * keyboard, and Esc on the region dismisses too.
 */
export function TriggerBanner({ triggers }: TriggerBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const top = triggers[0]
  if (!top || dismissed) return null

  return (
    <div
      role="status"
      aria-label="Suggested next action"
      className={`${styles.banner} ${TONE_CLASS[top.tone]}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setDismissed(true)
      }}
    >
      <span className={styles.icon} aria-hidden="true">
        {TONE_ICON[top.tone]}
      </span>
      <p className={styles.message}>{top.message}</p>
      <Link href={top.href} className={styles.cta}>
        {top.cta}
        <span aria-hidden="true"> →</span>
      </Link>
      <button
        type="button"
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss this suggestion"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}
