'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
 * Honest progress bar whose fill grows on mount via a compositor-only
 * transform (scaleX from the left) — no layout-affecting width animation.
 *
 * - SSR-honest: the fill's layout width is always the real percentage, so the
 *   bar reads correctly with JS disabled and before hydration.
 * - Reduced-motion: renders fully grown instantly (scaleX(1), no transition).
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
  // Start collapsed so the on-mount effect can animate to full. SSR snapshot is
  // grown (mounted=false → but we render scaleX(1) on the server path below).
  const [grown, setGrown] = useState(false)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = prefersReducedMotion()
    // Next frame, flip to grown so the transition runs from 0 → full.
    const id = requestAnimationFrame(() => setGrown(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const reduced = reducedRef.current
  const fillStyle: CSSProperties = {
    background: color,
    // Reduced-motion or already grown → full. Otherwise collapsed pre-animation.
    transform: reduced || grown ? 'scaleX(1)' : 'scaleX(0)',
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
      {/* outer holds the real layout width; inner scales for the grow effect */}
      <div className={styles.fillOuter} style={{ width: `${pct}%` }}>
        <div className={styles.fill} style={fillStyle} />
      </div>
    </div>
  )
}
