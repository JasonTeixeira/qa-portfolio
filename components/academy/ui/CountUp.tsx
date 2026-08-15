'use client'

import { useEffect, useRef, useState } from 'react'
import { countUpDurationMs, countUpValueAt } from '@/lib/academy/motion-logic'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type Props = {
  /** The real, server-rendered final value. This is the source of truth. */
  value: number
  /**
   * Animation length. When omitted, the duration scales to the magnitude of the
   * value so 0→4 doesn't drag like 0→2,000 (see countUpDurationMs).
   */
  durationMs?: number
  /** Format the displayed (and final) number, e.g. for thousands separators. */
  format?: (n: number) => string
}

/**
 * Animates a number from 0 → `value` on mount via requestAnimationFrame.
 *
 * - Compositor-friendly: only the text content changes; no layout-affecting
 *   style is animated.
 * - Reduced-motion: renders the final value instantly, with no animation.
 * - a11y: the rendered text IS the final value once settled, so screen readers
 *   announce the real number. We intentionally do not use aria-live — there is
 *   no announcement churn during the count.
 *
 * SSR-safe: the component initialises to the final value so server output and
 * the first client paint both show the real number; the count-up only kicks in
 * after mount for motion-OK clients.
 */
export function CountUp({ value, durationMs, format }: Props) {
  const fmt = format ?? ((n: number) => String(n))
  // Start at the real value so SSR + first paint are honest. An effect resets to
  // 0 and animates up only when motion is allowed.
  const [display, setDisplay] = useState(value)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDisplay(value)
      return
    }

    const from = 0
    const duration = durationMs ?? countUpDurationMs(value - from)
    const start = performance.now()

    setDisplay(from)

    const tick = (now: number) => {
      const elapsed = now - start
      const current = countUpValueAt(from, value, elapsed, duration)
      setDisplay(current)
      if (elapsed < duration) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setDisplay(value) // guarantee we land exactly on the real value
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [value, durationMs])

  return <>{fmt(display)}</>
}
