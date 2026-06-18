'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'sage-cookie-consent-v1'
const CONSENT_EVENT = 'sage:cookie-consent'

type Consent = 'accepted' | 'essential' | null

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let released = false

    function release() {
      if (released) return
      released = true
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY) as Consent
        setConsent(stored)
      } catch {
        // localStorage unavailable — show banner on every load.
      }
      setHydrated(true)
      window.removeEventListener('pointerdown', release)
      window.removeEventListener('keydown', release)
      window.removeEventListener('scroll', release)
      window.clearTimeout(fallbackTimer)
    }
    const fallbackTimer = window.setTimeout(release, 20000)

    // Keep the banner out of the initial render/LCP window. It appears after
    // intent or a long idle fallback instead of becoming the page's largest paint.
    window.addEventListener('pointerdown', release, { passive: true, once: true })
    window.addEventListener('keydown', release, { once: true })
    window.addEventListener('scroll', release, { passive: true, once: true })
    return () => {
      window.removeEventListener('pointerdown', release)
      window.removeEventListener('keydown', release)
      window.removeEventListener('scroll', release)
      window.clearTimeout(fallbackTimer)
    }
  }, [])

  const persist = (value: Exclude<Consent, null>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Ignore — privacy-mode browsers may block storage.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { consent: value } }))
    setConsent(value)
  }

  if (!hydrated || consent !== null) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="dialog"
        aria-live="polite"
        aria-label="Cookie consent"
        className="fixed bottom-3 left-3 right-3 z-[40] pointer-events-none sm:bottom-5 sm:right-auto sm:max-w-[520px]"
      >
        <div className="pointer-events-auto border border-[var(--sage-border)] bg-[rgba(20,20,24,0.94)] p-3 shadow-2xl shadow-black/50 backdrop-blur-md sm:p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                Analytics consent
              </h2>
              <p className="text-[10px] leading-relaxed text-[var(--sage-ink-muted)] sm:text-[11px]">
                Essential cookies keep the site working. Analytics helps improve the content and
                funnels. Details live in the{' '}
                <Link
                  href="/legal/cookies"
                  className="text-[var(--sage-accent-readable)] hover:text-white underline underline-offset-2"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
            <div className="grid grid-cols-2 items-stretch gap-2 sm:flex sm:flex-row sm:items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 min-w-0 rounded-[6px] text-[11px] text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)] sm:min-w-[108px] sm:text-xs"
                onClick={() => persist('essential')}
              >
                Essential only
              </Button>
              <Button
                size="sm"
                className="h-8 min-w-0 rounded-[6px] bg-[var(--sage-brand)] text-[11px] font-medium text-white hover:bg-[#5670ff] sm:min-w-[92px] sm:text-xs"
                onClick={() => persist('accepted')}
              >
                Accept all
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
