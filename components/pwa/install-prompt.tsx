'use client'

// Phase 1: Branded install prompt. Listens for beforeinstallprompt, surfaces a
// dismissable, low-friction terminal-styled banner. Self-suppresses after the
// user accepts or dismisses (per device, 30-day cooldown).

import { useEffect, useState } from 'react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'sage:install-prompt-dismissed-at'
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Don't show if already installed.
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Respect cooldown.
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw && Date.now() - Number(raw) < COOLDOWN_MS) return
    } catch {
      /* localStorage may be blocked */
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      // Don't show until the user has shown intent (3s after load).
      setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !deferred) return null

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  const install = async () => {
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome !== 'accepted') dismiss()
      else setVisible(false)
    } catch {
      dismiss()
    }
  }

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Install Sage Ideas as an app"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-[#2A2826] bg-[#0B0A09]/95 backdrop-blur shadow-2xl shadow-[#0ED3CF]/10 p-4"
      style={{
        boxShadow:
          '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(14,211,207,0.08), 0 0 40px rgba(14,211,207,0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-[#0ED3CF]/10 border border-[#0ED3CF]/30 flex items-center justify-center">
          <span className="font-mono text-[#0ED3CF] text-sm" aria-hidden>
            ⌘
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0ED3CF]">
            Install
          </div>
          <p className="text-sm text-[#F4F2EF] mt-1 font-medium">
            Pin Sage Ideas to your dock
          </p>
          <p className="text-xs text-[#B8B0AB] mt-1 leading-relaxed">
            Faster loads. Works offline. One-tap to book a call.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={install}
              className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#0ED3CF] text-[#09090B] hover:bg-[#33EBE8] transition-colors"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-xs px-3 py-1.5 rounded-md text-[#B8B0AB] hover:text-[#F4F2EF] transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
