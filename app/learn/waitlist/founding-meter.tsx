'use client'

import { useEffect, useState } from 'react'
import styles from './waitlist.module.css'

const CAP = 1000
const FORMING_BELOW = 25

/**
 * FoundingMeter — real, live count of the founding waitlist with honest cap
 * framing. While the cohort is still tiny it reads "now forming · first 1,000"
 * (early is the selling point); once it has momentum it shows the live count and
 * spots remaining. No fabricated numbers.
 */
export function FoundingMeter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/academy/waitlist-count')
      .then((r) => r.json())
      .then((d) => { if (alive) setCount(typeof d?.count === 'number' ? d.count : 0) })
      .catch(() => { if (alive) setCount(0) })
    return () => { alive = false }
  }, [])

  if (count === null) return null

  const claimed = Math.min(count, CAP)
  const pct = Math.max(2, Math.min(100, (claimed / CAP) * 100))
  const forming = count < FORMING_BELOW

  // Once there's real momentum, surface the live count prominently as proof.
  if (!forming) {
    return (
      <div className={styles.meter} role="status" aria-live="polite">
        <p className={styles.meterBig}>
          <strong>{claimed.toLocaleString()}</strong> builders already in line
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

  return (
    <div className={styles.meter} role="status" aria-live="polite">
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>Founding cohort · now forming</span>
        <span className={styles.meterCount}>First 1,000 lock $20/mo for life</span>
      </div>
      <div className={styles.meterTrack}>
        <i className={styles.meterFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
