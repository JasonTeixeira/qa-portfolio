'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { trackEvent } from '@/lib/analytics/events'
import { playCue } from '@/components/motion/soundCues'
import { DEFAULT_BACKDROP, visitBackdrop } from '@/components/motion/visitBackdrop'
import styles from './IntentGate.module.css'

const INTENT_KEY = 'sage-intent'

type Intent = 'hire' | 'learn' | 'explore'
type Phase = 'hidden' | 'in' | 'out'

/**
 * IntentGate — the onboarding moment. After the cinematic splash hands off, a
 * first-time visitor is asked why they're here (hire vs learn) before entering
 * the front page. The choice is stored, tagged for analytics, and written to
 * <html data-intent> so the page can personalize. Returning visitors skip it.
 */
export function IntentGate() {
  const [phase, setPhase] = useState<Phase>('hidden')
  const [bg, setBg] = useState(DEFAULT_BACKDROP)
  const shownRef = useRef(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Pull keyboard focus into the modal when it opens (WCAG 2.4.3 / 2.1.2).
  useEffect(() => {
    if (phase === 'in') {
      requestAnimationFrame(() => dialogRef.current?.querySelector('button')?.focus())
    }
  }, [phase])

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(INTENT_KEY)
    } catch {
      stored = null
    }
    if (stored) {
      document.documentElement.dataset.intent = stored
      return
    }

    // Shared per-visit pick — same landscape as the splash + hero this load.
    setBg(visitBackdrop())

    const reveal = () => {
      if (shownRef.current) return
      shownRef.current = true
      window.scrollTo(0, 0)
      document.body.classList.add('intent-gating')
      setPhase('in')
    }

    // Appear as the splash lifts; fall back to a short delay if no splash plays.
    if (document.body.classList.contains('living-intro')) {
      const observer = new MutationObserver(() => {
        if (document.body.classList.contains('living-visible')) {
          observer.disconnect()
          reveal()
        }
      })
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
      const fallback = window.setTimeout(reveal, 5000)
      return () => {
        observer.disconnect()
        window.clearTimeout(fallback)
      }
    }

    const timer = window.setTimeout(reveal, 450)
    return () => window.clearTimeout(timer)
  }, [])

  const choose = (intent: Intent) => {
    try {
      window.localStorage.setItem(INTENT_KEY, intent)
    } catch {
      // Non-critical: the gate still dismisses, it just re-asks next visit.
    }
    document.documentElement.dataset.intent = intent
    playCue('confirm')
    trackEvent('cta_click', { location: 'intent_gate', label: intent } as never)
    window.dispatchEvent(new CustomEvent('sage:intent', { detail: intent }))
    setPhase('out')
    window.setTimeout(() => {
      document.body.classList.remove('intent-gating')
      setPhase('hidden')
    }, 720)
  }

  if (phase === 'hidden') return null

  return (
    <div
      ref={dialogRef}
      className={`${styles.gate} ${phase === 'out' ? styles.gateOut : styles.gateIn}`}
      role="dialog"
      aria-modal="true"
      aria-label="Why are you here?"
    >
      <div className={styles.scene} aria-hidden="true">
        <Image src={bg} alt="" fill loading="eager" sizes="100vw" className={styles.sceneImg} />
      </div>
      <div className={styles.inner}>
        <p className={styles.kicker}>Before you go in</p>
        <h2 className={styles.title}>Why are you here?</h2>
        <p className={styles.lede}>
          Two ways through Sage Ideas. Pick the one that fits — you can switch any time.
        </p>
        <div className={styles.choices}>
          <button
            type="button"
            className={`${styles.choice} ${styles.choiceHire}`}
            onMouseEnter={() => playCue('hover')}
            onClick={() => choose('hire')}
          >
            <span className={styles.choiceNo}>01</span>
            <span className={styles.choiceLabel}>I&apos;m here to hire</span>
            <span className={styles.choiceSub}>Build my product, brand &amp; AI — done for me</span>
            <span className={styles.choiceArrow} aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className={`${styles.choice} ${styles.choiceLearn}`}
            onMouseEnter={() => playCue('hover')}
            onClick={() => choose('learn')}
          >
            <span className={styles.choiceNo}>02</span>
            <span className={styles.choiceLabel}>I&apos;m here to learn</span>
            <span className={styles.choiceSub}>Master the system myself — academy &amp; playbooks</span>
            <span className={styles.choiceArrow} aria-hidden="true">→</span>
          </button>
        </div>
        <button type="button" className={styles.skip} onClick={() => choose('explore')}>
          Just exploring — take me in →
        </button>
      </div>
    </div>
  )
}
