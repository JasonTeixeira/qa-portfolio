'use client'

import { useEffect, useState } from 'react'
import type { Celebration } from '@/lib/academy/gamification-logic'
import styles from './celebration.module.css'

const GLYPH: Record<Celebration['kind'], string> = { level: '★', streak: '🔥', goal: '◎' }

/**
 * Brief, premium celebration overlay (level-up / streak-milestone / daily-goal).
 * Shows when `value` becomes non-null, auto-dismisses, click to clear. The
 * dopamine payoff — the "investment" beat of the Hooked loop.
 */
export function CelebrationToast({ value, onClear }: { value: Celebration | null; onClear?: () => void }) {
  const [shown, setShown] = useState<Celebration | null>(null)

  useEffect(() => {
    if (!value) return
    setShown(value)
    const t = setTimeout(() => {
      setShown(null)
      onClear?.()
    }, 2800)
    return () => clearTimeout(t)
  }, [value, onClear])

  if (!shown) return null

  const dismiss = () => {
    setShown(null)
    onClear?.()
  }

  return (
    <div className={styles.overlay} role="status" aria-live="polite" onClick={dismiss}>
      <div className={styles.card} data-kind={shown.kind}>
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ ['--i' as string]: String(i) } as React.CSSProperties} />
          ))}
        </div>
        <span className={styles.glyph} aria-hidden="true">{GLYPH[shown.kind]}</span>
        <span className={styles.value}>{shown.label}</span>
        <span className={styles.sub}>{shown.sub}</span>
      </div>
    </div>
  )
}
