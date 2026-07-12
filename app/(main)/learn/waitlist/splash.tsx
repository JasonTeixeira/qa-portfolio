'use client'

import { useEffect, useState } from 'react'
import styles from './waitlist.module.css'

const KEY = 'sage-academy-splash'

/** The Sage Ideas mark — electric "S" (matches the main site). */
export function SageMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 42 42" width={size} height={size} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sage-mark" x1="4" x2="38" y1="8" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3D5AFE" />
          <stop offset="1" stopColor="#BCD2FF" />
        </linearGradient>
      </defs>
      <path
        d="M28.8 7.6c-7.8 1.2-16.3 7-17.5 12.1-.8 3.4 2.2 5.1 8.2 6.7 5.8 1.5 8.8 2.8 8.4 5.3-.5 3.3-7.1 5.1-14.9 4.3"
        stroke="url(#sage-mark)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="30" cy="8" r="3.4" fill="url(#sage-mark)" />
      <circle cx="13.5" cy="35.7" r="2.6" fill="url(#sage-mark)" />
    </svg>
  )
}

/**
 * Splash — matches the main site's intro: the electric Sage mark, the Sage Ideas
 * wordmark + tagline over a dark ink-wash, then a curtain-rise into the page.
 * Once per session, skipped under reduced motion, with a Skip control.
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
    const t1 = window.setTimeout(() => setPhase('out'), 1900)
    const t2 = window.setTimeout(() => setPhase('gone'), 2700)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div className={`${styles.splash} ${phase === 'out' ? styles.splashOut : ''}`} role="presentation">
      <div className={styles.splashScene} aria-hidden="true" />
      <div className={styles.splashInner} aria-hidden="true">
        <span className={styles.splashMark}>
          <SageMark size={84} />
        </span>
        <p className={styles.splashWord}>Sage&nbsp;Ideas</p>
        <p className={styles.splashTagline}>AI-native studio · since 2020</p>
        <span className={styles.splashBar}><i /></span>
      </div>
      <button type="button" className={styles.splashSkip} onClick={() => setPhase('gone')}>
        Skip
      </button>
    </div>
  )
}
