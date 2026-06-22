'use client'

import { useEffect, useState } from 'react'
import styles from './waitlist.module.css'

/**
 * Sticky waitlist CTA — slides in once the hero scrolls out of view and hides again
 * over the final CTA (so it never duplicates the form that's already on screen). One
 * tap scrolls to the hero form and focuses it. Keyboard-safe (out of tab order while
 * hidden) and reduced-motion friendly via CSS.
 */
export function StickyCta() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('wl-hero')
    const final = document.getElementById('wl-final')
    if (!hero) return

    let heroVisible = true
    let finalVisible = false
    const sync = () => setShow(!heroVisible && !finalVisible)

    const heroIo = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting
        sync()
      },
      { threshold: 0 },
    )
    heroIo.observe(hero)

    let finalIo: IntersectionObserver | undefined
    if (final) {
      finalIo = new IntersectionObserver(
        ([entry]) => {
          finalVisible = entry.isIntersecting
          sync()
        },
        { threshold: 0 },
      )
      finalIo.observe(final)
    }

    return () => {
      heroIo.disconnect()
      finalIo?.disconnect()
    }
  }, [])

  // Lift the floating sound toggle above the bar while it's visible (CSS reads this).
  useEffect(() => {
    if (show) document.documentElement.setAttribute('data-wl-sticky', '1')
    else document.documentElement.removeAttribute('data-wl-sticky')
    return () => document.documentElement.removeAttribute('data-wl-sticky')
  }, [show])

  function goToForm() {
    const hero = document.getElementById('wl-hero')
    const input = document.getElementById('waitlist-hero') as HTMLInputElement | null
    ;(hero ?? input)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => input?.focus({ preventScroll: true }), 550)
  }

  return (
    <div className={`${styles.sticky} ${show ? styles.stickyShow : ''}`} aria-hidden={!show}>
      <span className={styles.stickyText}>
        <b>Founding · $20/mo locked for life.</b>
        <span className={styles.stickySub}> Be one of the first 1,000.</span>
      </span>
      <button type="button" className={styles.stickyBtn} onClick={goToForm} tabIndex={show ? 0 : -1}>
        Join the waitlist
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}
