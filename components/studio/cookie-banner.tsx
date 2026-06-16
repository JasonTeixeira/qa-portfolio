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
    // Delay hydration by a moment so the banner doesn't fight the hero CTA on first paint.
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY) as Consent
        setConsent(stored)
      } catch {
        // localStorage unavailable — show banner on every load.
      }
      setHydrated(true)
    }, 5500)
    return () => window.clearTimeout(timer)
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
        className="fixed bottom-3 left-3 right-3 z-[40] pointer-events-none sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-[360px]"
      >
        <div className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)]/92 p-4 shadow-2xl shadow-black/50 backdrop-blur-md pointer-events-auto">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
            Cookies
          </h2>
          <p className="text-[11px] leading-relaxed text-[var(--sage-ink-muted)]">
            Essential cookies keep the site working. Analytics cookies help us understand which
            content is useful. You can change your mind anytime in our{' '}
            <Link
              href="/legal/cookies"
              className="text-[var(--sage-brand)] hover:text-[#6E83FF] underline underline-offset-2"
            >
              Cookie Policy
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-[6px] text-xs text-[var(--sage-ink-muted)] hover:text-[var(--sage-ink)] hover:bg-[var(--sage-surface-2)]"
              onClick={() => persist('essential')}
            >
              Essential only
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-[6px] bg-[var(--sage-brand)] text-xs font-medium text-white hover:bg-[#5670ff]"
              onClick={() => persist('accepted')}
            >
              Accept all
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
