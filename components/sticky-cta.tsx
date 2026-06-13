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
      <div className="bg-[#1A1917]/95 backdrop-blur border-t border-[#2A2826] py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <p className="text-[#FAFAFA] text-sm sm:text-base font-medium truncate">
            {pitch}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={ctaHref}
              onClick={() => trackEvent('cta_click', { location: 'sticky', label: ctaLabel, href: ctaHref })}
              className="inline-flex items-center gap-1.5 bg-[#0ED3CF] hover:bg-[#0AA8A5] text-[#09090B] font-semibold text-sm px-4 py-2.5 min-h-[44px] rounded-lg transition-colors"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#78716C] hover:text-[#FAFAFA] hover:bg-[#2A2826] rounded-lg transition-colors"
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
