'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * PipelineThread — the signature scroll moment.
 *
 * Fixed dashed vertical track down the left edge (desktop ≥1280px only,
 * aria-hidden, pointer-events: none, z-index below the nav). Six stage dots
 * are mapped to the homepage's document sections: each dot sits at the
 * fraction of total scroll range where its section's top lives, so the
 * accent fill line (scaleY, rAF-throttled passive scroll) reaches a dot
 * exactly when the viewport reaches that section. Missing sections are
 * skipped gracefully. Reduced motion: static render, all dots lit.
 */

interface Stage {
  label: string
  selector: string
}

const STAGES: Stage[] = [
  { label: 'TRIGGER', selector: '#top' },
  { label: 'PROOF', selector: '#proof' },
  { label: 'SYSTEMS', selector: '#case-studies' },
  { label: 'LEDGER', selector: '#ledger' },
  { label: 'SAMPLES', selector: '#work-samples' },
  { label: 'SHIP', selector: '#contact' },
]

interface StagePoint {
  label: string
  /** Position along the scroll range, 0..1 — doubles as rail-height %. */
  fraction: number
}

const DESKTOP_QUERY = '(min-width: 1280px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function PipelineThread() {
  const fillRef = useRef<HTMLDivElement | null>(null)
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const [isReduced, setIsReduced] = useState<boolean>(false)
  const [points, setPoints] = useState<StagePoint[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(0)

  // Environment gates — no scroll work at all below 1280px.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const motion = window.matchMedia(REDUCED_MOTION_QUERY)
    const sync = () => {
      setIsDesktop(desktop.matches)
      setIsReduced(motion.matches)
    }
    sync()
    desktop.addEventListener('change', sync)
    motion.addEventListener('change', sync)
    return () => {
      desktop.removeEventListener('change', sync)
      motion.removeEventListener('change', sync)
    }
  }, [])

  // Measure sections → fractions, then track scroll progress.
  useEffect(() => {
    if (!isDesktop) return

    const measured: { current: StagePoint[] } = { current: [] }
    let rafId = 0
    let lastActive = -1

    const measure = () => {
      const doc = document.documentElement
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight)
      const next: StagePoint[] = []
      STAGES.forEach((stage) => {
        const el = document.querySelector<HTMLElement>(stage.selector)
        if (!el) return // section absent on this page — skip gracefully
        const top = el.getBoundingClientRect().top + window.scrollY
        next.push({
          label: stage.label,
          fraction: Math.min(1, Math.max(0, top / maxScroll)),
        })
      })
      measured.current = next
      setPoints(next)
    }

    const update = () => {
      rafId = 0
      const doc = document.documentElement
      const maxScroll = doc.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleY(${progress.toFixed(4)})`
      }
      let active = 0
      measured.current.forEach((point, index) => {
        if (progress >= point.fraction - 0.001) active = index
      })
      if (active !== lastActive) {
        lastActive = active
        setActiveIndex(active)
      }
    }

    const schedule = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(update)
    }
    const remeasure = () => {
      measure()
      schedule()
    }

    measure()

    if (isReduced) {
      // Static render: full fill, every dot lit, no listeners.
      if (fillRef.current) fillRef.current.style.transform = 'scaleY(1)'
      setActiveIndex(STAGES.length - 1)
      return
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', remeasure, { passive: true })
    // Late-loading content shifts section offsets — remeasure on body growth.
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', remeasure)
      ro.disconnect()
      if (rafId !== 0) window.cancelAnimationFrame(rafId)
    }
  }, [isDesktop, isReduced])

  if (!isDesktop) return null

  return (
    <div className="ag-thread" aria-hidden="true">
      <div className="ag-thread-rail">
        <div className="ag-thread-track" />
        <div ref={fillRef} className="ag-thread-fill" />
        {points.map((point, index) => {
          const lit = index <= activeIndex
          const current = index === activeIndex
          const className = [
            'ag-thread-stage',
            lit ? 'ag-thread-stage--lit' : '',
            current ? 'ag-thread-stage--current' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <div
              key={point.label}
              className={className}
              style={{ top: `${(point.fraction * 100).toFixed(3)}%` }}
            >
              <span className="ag-thread-dot" />
              <span className="ag-thread-label">{point.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
