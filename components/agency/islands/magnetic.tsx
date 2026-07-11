'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Maximum translation toward the cursor, in px. */
const MAX_SHIFT_PX = 5

interface MagneticProps {
  children: ReactNode
  className?: string
}

/**
 * Magnetic hover wrapper: children translate up to 5px toward the cursor and
 * spring back on leave (CSS transition on transform — compositor-only).
 *
 * Disabled entirely on touch/coarse pointers and for prefers-reduced-motion
 * (checked once on mount). The wrapper is a plain span: focus flows straight
 * through to the wrapped control, nothing is trapped. Pointer tracking is
 * rAF-throttled.
 */
export function Magnetic({ children, className = '' }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!finePointer.matches || reducedMotion.matches) return

    let rafId = 0
    let targetX = 0
    let targetY = 0

    const apply = () => {
      rafId = 0
      el.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      targetX = Math.max(-1, Math.min(1, relX)) * MAX_SHIFT_PX
      targetY = Math.max(-1, Math.min(1, relY)) * MAX_SHIFT_PX
      if (rafId === 0) rafId = window.requestAnimationFrame(apply)
    }

    const onPointerLeave = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId)
        rafId = 0
      }
      // Clear to base state; .ag-magnetic's transition springs it back.
      el.style.transform = ''
    }

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerLeave)
    return () => {
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerLeave)
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <span ref={ref} className={`ag-magnetic ${className}`.trim()}>
      {children}
    </span>
  )
}
