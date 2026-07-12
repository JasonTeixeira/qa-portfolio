'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'ag-sticky-cta-dismissed'
const PHONE_QUERY = '(max-width: 719px)'
/** Show the bar once the user has scrolled past 60% of one viewport height. */
const SHOW_AFTER_VIEWPORT_RATIO = 0.6

/**
 * Slim fixed bottom contact bar — phones only (matchMedia gate), mounted from
 * nav.tsx on the homepage only. Sits at z-index 55, below the mobile menu
 * overlay (60), so an open menu fully covers it. Dismissal persists for the
 * session via sessionStorage. Styles live in app/agency/mobile.css.
 */
export function StickyCta() {
  const [isPhone, setIsPhone] = useState<boolean>(false)
  const [isPastThreshold, setIsPastThreshold] = useState<boolean>(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(false)

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
        setIsDismissed(true)
        return
      }
    } catch {
      // Storage unavailable (private mode / blocked) — behave as not dismissed.
    }

    const query = window.matchMedia(PHONE_QUERY)
    setIsPhone(query.matches)
    const handleChange = (event: MediaQueryListEvent): void => setIsPhone(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isPhone || isDismissed) return

    let rafId = 0
    const update = (): void => {
      rafId = 0
      setIsPastThreshold(window.scrollY > window.innerHeight * SHOW_AFTER_VIEWPORT_RATIO)
    }
    const schedule = (): void => {
      if (rafId === 0) rafId = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
    }
  }, [isPhone, isDismissed])

  const handleDismiss = (): void => {
    setIsDismissed(true)
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Storage unavailable — dismissal still applies for this mount.
    }
  }

  if (!isPhone || isDismissed || !isPastThreshold) return null

  return (
    <div className="ag-scta" role="complementary" aria-label="Contact call to action">
      <span className="ag-scta-label">AVAILABLE FOR CONTRACT WORK</span>
      <Link href="/#contact" className="ag-scta-btn">
        HIRE ME
      </Link>
      <button
        type="button"
        className="ag-scta-close"
        onClick={handleDismiss}
        aria-label="Dismiss contact bar"
      >
        ✕
      </button>
    </div>
  )
}
