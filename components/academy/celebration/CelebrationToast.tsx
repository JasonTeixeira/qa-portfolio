'use client'

import { useEffect, useState } from 'react'
import type { Celebration } from '@/lib/academy/gamification-logic'
import { Icon, type IconName } from '@/components/academy/ui/Icon'
import styles from './celebration.module.css'

const GLYPH: Record<Celebration['kind'], IconName> = { level: 'star', streak: 'flame', goal: 'target', progress: 'bolt' }

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
    // Routine +XP nudges are lighter and more frequent — dismiss them faster
    // than the rare, full-screen milestone celebrations.
    const ms = value.kind === 'progress' ? 2000 : 2800
    const t = setTimeout(() => {
      setShown(null)
      onClear?.()
    }, ms)
    return () => clearTimeout(t)
  }, [value, onClear])

  if (!shown) return null

  const dismiss = () => {
    setShown(null)
    onClear?.()
  }

  // Routine progress: a gentle, non-blocking corner toast.
  if (shown.kind === 'progress') {
    return (
      <div className={styles.toastWrap} role="status" aria-live="polite">
        <div className={styles.toast} onClick={dismiss}>
          <span className={styles.tGlyph} aria-hidden="true"><Icon name={GLYPH[shown.kind]} size={20} /></span>
          <span className={styles.tText}>
            <span className={styles.tValue}>{shown.label}</span>
            <span className={styles.tSub}>{shown.sub}</span>
          </span>
        </div>
      </div>
    )
  }

  // Milestones: the full-screen celebration overlay.
  return (
    <div className={styles.overlay} role="status" aria-live="polite" onClick={dismiss}>
      <div className={styles.card} data-kind={shown.kind}>
        <div className={styles.burst} aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ ['--i' as string]: String(i) } as React.CSSProperties} />
          ))}
        </div>
        <span className={styles.glyph} aria-hidden="true"><Icon name={GLYPH[shown.kind]} size={28} /></span>
        <span className={styles.value}>{shown.label}</span>
        <span className={styles.sub}>{shown.sub}</span>
      </div>
    </div>
  )
}
