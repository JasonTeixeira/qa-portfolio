'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import styles from './grow-bar.module.css'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Props = {
  /** 0–100. Clamped. The real, server-derived value. */
  value: number
  ariaLabel: string
  /** Track height in px. */
  height?: number
  /** Fill colour (CSS value or var). Defaults to mastery green. */
  color?: string
  className?: string
}

/**
 * Honest progress bar whose fill is driven entirely by a compositor-only
 * transform: scaleX(pct) from the left — never a layout-affecting width
 * animation. The full-width fill is scaled down, so both the on-mount reveal
 * AND any later live value change (XP ticking up) animate on the GPU.
 *
 * - SSR-honest: the inline transform on the server path is already the real
 *   percentage, so the bar reads correctly with JS disabled / pre-hydration.
 * - Reduced-motion: snaps to the real value instantly, no transition.
 * - a11y: a real progressbar role + aria-valuenow announces the real percent.
 */
export function GrowBar({
  value,
  ariaLabel,
  height = 6,
  color = 'var(--ac-mastery, #4ade80)',
  className = '',
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  // `mounted` lets us start collapsed for the reveal, then transition to pct.
  // `reduced` short-circuits all motion (set in the effect, client-only).
  const [mounted, setMounted] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Before mount (and on the server), reduced-motion shows the real value while
  // motion-OK clients start at 0 so the first frame can grow up to pct.
  const scale = reduced || mounted ? pct / 100 : 0

  const fillStyle: CSSProperties = {
    background: color,
    transform: `scaleX(${scale})`,
    transition: reduced ? 'none' : undefined,
  }

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={`${styles.track} ${className}`}
      style={{ height }}
    >
      <div className={styles.fill} style={fillStyle} />
    </div>
  )
}
