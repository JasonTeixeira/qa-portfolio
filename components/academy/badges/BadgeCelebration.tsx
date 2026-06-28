'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/academy/ui/Icon'
import type { IconName } from '@/components/academy/ui/Icon'
import styles from './badge-celebration.module.css'

export interface CelebratedBadge {
  key: string
  label: string
  blurb: string
  icon: IconName
}

/**
 * A tasteful, dismissible toast that animates in once when a NEW badge is earned.
 * Motion is compositor-only (transform/opacity) and honors prefers-reduced-motion.
 * a11y: role=status + aria-live, focus moves to the dismiss control on mount, and
 * Escape closes it. Subtle and institutional — not gaudy.
 */
export function BadgeCelebration({ badge }: { badge: CelebratedBadge | null }) {
  const [shown, setShown] = useState<CelebratedBadge | null>(badge)
  const closeRef = useRef<HTMLButtonElement>(null)

  const dismiss = useCallback(() => setShown(null), [])

  useEffect(() => {
    if (!shown) return
    // Move focus to the dismiss control so keyboard + screen-reader users land on it.
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, dismiss])

  if (!shown) return null

  return (
    <div className={styles.region} role="status" aria-live="polite">
      <div className={styles.toast}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name={shown.icon} size={24} />
        </span>
        <div className={styles.body}>
          <p className={styles.kicker}>Badge earned</p>
          <p className={styles.label}>{shown.label}</p>
          <p className={styles.blurb}>{shown.blurb}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          onClick={dismiss}
          aria-label="Dismiss badge notification"
        >
          <Icon name="x" size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
