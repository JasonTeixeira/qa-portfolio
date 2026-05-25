'use client'

// Phase 1: Registers /sw.js, handles update lifecycle, exposes a global event
// when a new worker is waiting so other UI can prompt for refresh.

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const onLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        })

        // Check for updates every 60 minutes while the tab is open.
        const interval = setInterval(() => registration.update().catch(() => null), 60 * 60 * 1000)

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('sage:sw-update-ready'))
            }
          })
        })

        return () => clearInterval(interval)
      } catch (err) {
        // Silent — SW failures must never break the page.
        console.debug('[sw] register failed', err)
      }
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
  }, [])

  return null
}
