'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/events'

const STORAGE_KEY = 'sticky-cta-dismissed-v1'

// External-store glue so we don’t setState in an effect body (React 19 strict).
function subscribeDismissed(onChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange()
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
function getDismissedSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
// Hide on the server pass so the bar never flashes pre-hydration.
function getDismissedServerSnapshot(): boolean {
  return true
}

export function StickyCta({
  pitch = 'Ready to ship your first agent?',
  ctaLabel = 'Book a 30-min call',
  ctaHref = '/contact',
}: {
  pitch?: string
  ctaLabel?: string
  ctaHref?: string
}) {
  const [visible, setVisible] = useState(false)
  const dismissed = useSyncExternalStore(
    subscribeDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (dismissed) return

    const onScroll = () => {
      const scrollTop = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const ratio = max > 0 ? scrollTop / max : 0
      // setState inside a user event callback (scroll) is allowed by
      // react-hooks/set-state-in-effect — only synchronous setState in the
      // effect body itself is flagged.
      setVisible(ratio >= 0.3)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, '1')
        // Notify useSyncExternalStore subscribers in this tab.
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
      } catch {}
    }
  }

  if (dismissed || !visible) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 translate-y-0 pb-safe"
      role="region"
      aria-label="Call to action"
    >
      <div className="border-t border-[var(--sage-border-strong)] bg-[rgba(11,11,14,0.94)] px-4 py-3 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="text-[var(--sage-ink)] text-sm sm:text-base font-medium truncate">
            {pitch}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={ctaHref}
              onClick={() => trackEvent('cta_click', { location: 'sticky', label: ctaLabel, href: ctaHref })}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[var(--sage-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5670ff]"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              onClick={handleDismiss}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-[var(--sage-ink-faint)] transition-colors hover:bg-[var(--sage-surface-2)] hover:text-[var(--sage-ink)]"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
