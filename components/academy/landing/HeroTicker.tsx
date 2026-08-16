'use client'

/**
 * Live ticker from the Sage Home design (3.4s rotation, 320ms fade).
 * Honesty delta: the mock's fictional user events ("arjun_r passed gate…")
 * are replaced with true statements about the system — no invented people
 * or activity until the real event feed is wired post-DB-restore.
 */

import { useEffect, useState } from 'react'

const ITEMS = [
  'every lab starts failing — fixing it for real is the only way through',
  'certificates are public records, verifiable at sageideas.dev/verify',
  'spaced recall fires at 1 / 3 / 7 / 30 days — a miss resets the card',
  'every lesson makes the failure a location, not a feeling',
  'scores are capped by your weakest proof — the repair lifts the cap',
  'decision memos and passing checks — pick any claim, follow the artifact',
]

export function HeroTicker() {
  const [tick, setTick] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rotate = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setTick((t) => t + 1)
        setFade(false)
      }, 320)
    }, 3400)
    return () => clearInterval(rotate)
  }, [])

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono), monospace',
        fontSize: 11.5,
        color: '#9C9CA6',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'opacity 0.3s ease',
        opacity: fade ? 0 : 1,
      }}
    >
      {ITEMS[tick % ITEMS.length]}
    </span>
  )
}
