'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * MagneticButton — wraps an interactive child (button / link) and translates it
 * toward the cursor on hover. Respects `prefers-reduced-motion`: when the user
 * has reduced motion enabled, the wrapper renders children identically with
 * no listeners attached.
 *
 * Why a wrapper, not the element itself: the transform must live on a child
 * so that focus rings, click targets, and underlying anchor semantics stay
 * intact. We translate the inner span, not the link, so a11y is unaffected.
 */
interface MagneticButtonProps {
  children: ReactNode
  /** 0 → no pull, 1 → cursor moves the element 1:1. Default 0.3 (subtle). */
  strength?: number
  /** Hard cap on translation distance in pixels. Default 10. */
  maxOffset?: number
  /** Forwarded to outer wrapper for layout control. */
  className?: string
}

export function MagneticButton({
  children,
  strength = 0.3,
  maxOffset = 10,
  className,
}: MagneticButtonProps) {
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const innerRef = useRef<HTMLSpanElement | null>(null)
  const [enabled, setEnabled] = useState(false)

  // Detect reduced-motion preference on mount + react to changes.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(!mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    let rafId = 0
    let targetX = 0
    let targetY = 0

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength
      targetX = Math.max(-maxOffset, Math.min(maxOffset, dx))
      targetY = Math.max(-maxOffset, Math.min(maxOffset, dy))
      if (!rafId) {
        rafId = requestAnimationFrame(apply)
      }
    }

    const apply = () => {
      rafId = 0
      inner.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`
    }

    const reset = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      targetX = 0
      targetY = 0
      inner.style.transform = 'translate3d(0, 0, 0)'
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', reset)
    wrap.addEventListener('blur', reset, true)

    return () => {
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', reset)
      wrap.removeEventListener('blur', reset, true)
      if (rafId) cancelAnimationFrame(rafId)
      inner.style.transform = ''
    }
  }, [enabled, strength, maxOffset])

  return (
    <span
      ref={wrapRef}
      className={className}
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <span
        ref={innerRef}
        style={{
          display: 'inline-block',
          willChange: enabled ? 'transform' : undefined,
          transition: 'transform 280ms cubic-bezier(0.2, 0.9, 0.2, 1)',
        }}
      >
        {children}
      </span>
    </span>
  )
}
