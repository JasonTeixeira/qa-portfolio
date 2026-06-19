'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * CountUp — institutional odometer. Animates the numeric portion of a stat
 * value from 0 to its target the first time it scrolls into view, preserving
 * any prefix/suffix ("130+", "$2,500", "200+", "<48h", "1 operator") and comma
 * grouping. Non-numeric values render verbatim. SSR and no-JS render the real
 * value; reduced-motion shows the final value with no animation; the count
 * resets to 0 in a layout effect (before paint) so there is never a flash of
 * the final number for above-the-fold strips.
 */

const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect

function prefersReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

type Parsed = {
  prefix: string
  target: number
  decimals: number
  grouped: boolean
  suffix: string
}

function parse(value: string): Parsed | null {
  const match = value.match(/\d[\d,]*(\.\d+)?/)
  if (!match) return null
  const raw = match[0]
  const start = match.index ?? 0
  const grouped = raw.includes(',')
  const decimals = raw.includes('.') ? (raw.split('.')[1]?.length ?? 0) : 0
  return {
    prefix: value.slice(0, start),
    target: parseFloat(raw.replace(/,/g, '')),
    decimals,
    grouped,
    suffix: value.slice(start + raw.length),
  }
}

function render(n: number, p: Parsed): string {
  const fixed = Number(n.toFixed(p.decimals))
  const body = p.grouped
    ? fixed.toLocaleString('en-US', {
        minimumFractionDigits: p.decimals,
        maximumFractionDigits: p.decimals,
      })
    : fixed.toFixed(p.decimals)
  return `${p.prefix}${body}${p.suffix}`
}

interface CountUpProps {
  value: string
  durationMs?: number
  className?: string
}

export function CountUp({ value, durationMs = 1100, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(value)

  // Reset to 0 before first paint so there's no flash of the final number.
  useIsoLayoutEffect(() => {
    const p = parse(value)
    if (!p || prefersReduced()) {
      setDisplay(value)
      return
    }
    setDisplay(render(0, p))
  }, [value])

  useEffect(() => {
    const p = parse(value)
    if (!p || prefersReduced()) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let startedAt = 0
    let fired = false

    const tick = (ts: number) => {
      if (!startedAt) startedAt = ts
      const t = Math.min(1, (ts - startedAt) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(render(p.target * eased, p))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!fired && entries.some((e) => e.isIntersecting)) {
          fired = true
          raf = requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, durationMs])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
