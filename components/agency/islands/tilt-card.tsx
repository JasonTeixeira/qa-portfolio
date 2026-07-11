'use client'

import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

/**
 * Generic 3D tilt wrapper. Mouse-only depth cue:
 * - perspective 750px, rotation clamped to ±maxDeg (default 6°)
 * - will-change applied on pointerenter, removed on pointerleave
 * - fully disabled for touch pointers and prefers-reduced-motion
 * - purely decorative: children stay in normal flow, keyboard untouched
 */

interface TiltCardProps {
  children: ReactNode
  maxDeg?: number
  className?: string
}

function tiltAllowed(pointerType: string): boolean {
  if (pointerType !== 'mouse') return false
  if (typeof window === 'undefined') return true
  return (
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  )
}

export function TiltCard({ children, maxDeg = 6, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef(false)
  const frameRef = useRef(0)

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || !tiltAllowed(event.pointerType)) return
    activeRef.current = true
    el.style.willChange = 'transform'
    el.style.transition = 'transform 0.12s ease-out'
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || !activeRef.current) return
    const { clientX, clientY } = event
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const rotX = ((clientY - rect.top) / rect.height - 0.5) * -maxDeg
      const rotY = ((clientX - rect.left) / rect.width - 0.5) * maxDeg
      el.style.transform = `perspective(750px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-3px)`
    })
  }

  const handlePointerLeave = () => {
    const el = ref.current
    if (!el || !activeRef.current) return
    activeRef.current = false
    cancelAnimationFrame(frameRef.current)
    el.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.6, 0.2, 1)'
    el.style.transform = 'none'
    el.style.willChange = 'auto'
  }

  return (
    <div
      ref={ref}
      className={`ag-tilt ${className}`.trim()}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  )
}
