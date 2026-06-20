'use client'

import { useEffect, useState } from 'react'
import styles from './waitlist.module.css'

const KEY = 'sage-academy-splash'

/**
 * Splash — a brief, brand-matched intro for the waitlist (gradient mark + Sage
 * Academy wordmark on the dark grid), then a curtain-rise into the page. Once
 * per session, skipped under reduced motion, with a Skip control.
 */
export function Splash() {
  const [phase, setPhase] = useState<'show' | 'out' | 'gone'>('show')

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let seen = false
    try {
      seen = window.sessionStorage.getItem(KEY) === '1'
    } catch {
      seen = false
    }
    if (reduced || seen) {
      setPhase('gone')
      return
    }
    try {
      window.sessionStorage.setItem(KEY, '1')
    } catch {
      // Private mode — the splash simply plays again next visit.
    }
    const t1 = window.setTimeout(() => setPhase('out'), 1700)
    const t2 = window.setTimeout(() => setPhase('gone'), 2500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={`${styles.splash} ${phase === 'out' ? styles.splashOut : ''}`} role="presentation">
      <div className={styles.splashInner} aria-hidden="true">
        <span className={styles.splashMark}>S</span>
        <p className={styles.splashWord}>Sage Academy</p>
        <span className={styles.splashBar}><i /></span>
      </div>
      <button type="button" className={styles.splashSkip} onClick={() => setPhase('gone')}>
        Skip
      </button>
    </div>
  )
}
