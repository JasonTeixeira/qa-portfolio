'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * CountUp — animates a stat from 0 to its value on first viewport entry
 * (~900ms rAF, comma formatting preserved). Non-numeric values ("92→99.6",
 * "256/256", "52→91%") and reduced-motion render statically as-is.
 * Server-rendered output is the final value, so no hydration mismatch.
 */

const NUMERIC_RE = /^\d{1,3}(?:,\d{3})*$|^\d+$/
const DURATION_MS = 900
const ENTRY_THRESHOLD = 0.4

interface CountUpProps {
  value: string
}

export function CountUp({ value }: CountUpProps) {
  const isNumeric = NUMERIC_RE.test(value)
  const target = isNumeric ? Number(value.replace(/,/g, '')) : 0
  const hasCommas = value.includes(',')
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!isNumeric || target === 0) return
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0
    const format = (n: number) => (hasCommas ? n.toLocaleString('en-US') : String(n))

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        io.disconnect()
        const startTime = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / DURATION_MS, 1)
          const eased = 1 - (1 - progress) ** 3
          setDisplay(format(Math.round(target * eased)))
          if (progress < 1) rafId = requestAnimationFrame(tick)
        }
        setDisplay(format(0))
        rafId = requestAnimationFrame(tick)
      },
      { threshold: ENTRY_THRESHOLD },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [isNumeric, target, hasCommas])

  return <span ref={ref}>{display}</span>
}
