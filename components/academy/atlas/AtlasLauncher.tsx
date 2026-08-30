'use client'

import { useEffect, useState } from 'react'
import { AtlasIntake } from './AtlasIntake'

const SEEN_KEY = 'sage-atlas-v1'
/** Auto-open after the splash (~2.1s) has cleared, on first visit only. */
const AUTO_OPEN_DELAY = 2700

/**
 * Mounts the Atlas intake: a persistent "Find your path" launcher plus a
 * one-per-visitor auto-open after the splash. The launcher stays available
 * forever; the auto-open fires once (tracked in localStorage).
 */
export function AtlasLauncher() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return
    const id = window.setTimeout(() => {
      setOpen(true)
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch {
        /* private mode — fine, it just may re-open next visit */
      }
    }, AUTO_OPEN_DELAY)
    return () => window.clearTimeout(id)
  }, [])

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (!mounted) return null

  return (
    <>
      {open ? (
        <AtlasIntake
          onClose={() => {
            setOpen(false)
            markSeen()
          }}
        />
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            left: 20,
            bottom: 20,
            zIndex: 90,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 16px',
            borderRadius: 24,
            border: '1px solid rgba(143,160,255,0.35)',
            background: 'rgba(17,17,24,0.86)',
            backdropFilter: 'blur(8px)',
            color: '#F2EFE9',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 12px 32px -12px rgba(0,0,0,0.7)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #A9B6FF, #3D5AFE)',
              boxShadow: '0 0 10px rgba(61,90,254,0.7)',
            }}
          />
          Find your path
        </button>
      )}
    </>
  )
}
