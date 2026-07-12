'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './waitlist.module.css'

const CAP = 1000
const POLL_MS = 25000

/**
 * FoundingMeter — real, live count of the founding waitlist. Shows the actual
 * number from the first signup, refetches the moment someone joins (via the
 * 'sage:waitlist-signup' event) and polls periodically so it ticks up as the
 * cohort fills. No fabricated numbers.
 */
export function FoundingMeter() {
  const [count, setCount] = useState<number | null>(null)

  const refetch = useCallback(() => {
    fetch('/api/academy/waitlist-count', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCount(typeof d?.count === 'number' ? d.count : 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    refetch()
    const onSignup = () => refetch()
    window.addEventListener('sage:waitlist-signup', onSignup)
    const id = window.setInterval(refetch, POLL_MS)
    return () => {
      window.removeEventListener('sage:waitlist-signup', onSignup)
      window.clearInterval(id)
    }
  }, [refetch])

  if (count === null) return null

  const claimed = Math.min(count, CAP)
  const pct = Math.max(2, Math.min(100, (claimed / CAP) * 100))

  // Before anyone joins, invite them to be first; after, show the live count.
  if (count < 1) {
    return (
      <div className={styles.meter} role="status" aria-live="polite">
        <div className={styles.meterTop}>
          <span className={styles.meterLabel}>Founding cohort · now forming</span>
          <span className={styles.meterCount}>Be the first of 1,000 — $20/mo for life</span>
        </div>
        <div className={styles.meterTrack}>
          <i className={styles.meterFill} style={{ width: '2%' }} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.meter} role="status" aria-live="polite">
      <p className={styles.meterBig}>
        <strong>{claimed.toLocaleString()}</strong> {claimed === 1 ? 'builder' : 'builders'} in line
      </p>
      <div className={styles.meterTrack}>
        <i className={styles.meterFill} style={{ width: `${pct}%` }} />
      </div>
      <p className={styles.meterSpots}>
        {(CAP - claimed).toLocaleString()} of the first 1,000 founding spots left
      </p>
    </div>
  )
}
