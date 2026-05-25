'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

/**
 * Lazy-loader for the marketing CommandPalette.
 *
 * The full palette (~30kb gzipped including search index, route data, and
 * route logic) is deferred until the user signals intent:
 *   - presses Cmd/Ctrl+K
 *   - presses `/`
 *   - the page goes idle for >2s on desktop
 *
 * If mounted via key press, we immediately re-dispatch Cmd+K so the palette's
 * own keybinding opens it on next tick. If mounted via idle, the palette
 * stays closed until the user triggers it.
 */
const CommandPalette = dynamic(
  () => import('@/components/command-palette').then((m) => m.CommandPalette),
  { ssr: false },
)

export function CommandPaletteMarketingLoader() {
  const [shouldMount, setShouldMount] = useState(false)
  const [shouldAutoOpen, setShouldAutoOpen] = useState(false)

  useEffect(() => {
    if (shouldMount) return

    const mountAndOpen = () => {
      setShouldAutoOpen(true)
      setShouldMount(true)
    }
    const mountIdle = () => setShouldMount(true)

    // Trigger on intent key press → mount + open
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === 'k') {
        mountAndOpen()
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        mountAndOpen()
      }
    }

    // Trigger on idle (defer until browser is free)
    let idleId: number | undefined
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const w = window as IdleWindow
    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(mountIdle, { timeout: 3000 })
    } else {
      idleId = window.setTimeout(mountIdle, 2000) as unknown as number
    }

    window.addEventListener('keydown', onKey)
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', onKey)
      if (idleId !== undefined) {
        if (typeof w.cancelIdleCallback === 'function') {
          w.cancelIdleCallback(idleId)
        } else {
          clearTimeout(idleId)
        }
      }
    }
  }, [shouldMount])

  // Once mounted via key press, fire a synthetic Cmd+K so the palette opens.
  useEffect(() => {
    if (!shouldMount || !shouldAutoOpen) return
    // Defer to next tick so the palette's own keydown listener is registered.
    const id = window.setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        ctrlKey: true,
        bubbles: true,
      })
      document.dispatchEvent(event)
    }, 0)
    return () => clearTimeout(id)
  }, [shouldMount, shouldAutoOpen])

  if (!shouldMount) return null
  return <CommandPalette />
}
