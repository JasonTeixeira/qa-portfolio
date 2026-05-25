'use client'

// Phase 1: When a new service worker is waiting, prompt the user to refresh.

import { useEffect, useState } from 'react'

export function UpdateToast() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onUpdate = () => setReady(true)
    window.addEventListener('sage:sw-update-ready', onUpdate)
    return () => window.removeEventListener('sage:sw-update-ready', onUpdate)
  }, [])

  if (!ready) return null

  const refresh = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
        window.location.reload()
      })
    } else {
      window.location.reload()
    }
  }

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 max-w-xs rounded-xl border border-[#2A2826] bg-[#0B0A09]/95 backdrop-blur shadow-2xl p-3 flex items-center gap-3"
    >
      <span className="font-mono text-[10px] uppercase tracking-widest text-[#A8C633]">
        Update ready
      </span>
      <button
        onClick={refresh}
        className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#0ED3CF] text-[#09090B] hover:bg-[#33EBE8]"
      >
        Refresh
      </button>
    </div>
  )
}
