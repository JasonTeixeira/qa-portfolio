'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n))

interface SurfaceSystemXrayProps {
  /** The polished product screenshot (the "surface"). */
  surfaceSrc: string
  /** The architecture / system map revealed beneath (the "system"). */
  systemSrc: string
  surfaceAlt?: string
  systemAlt?: string
  caption?: string
  /** Scroll travel for the pinned scrub, in vh. Lower = quicker wipe. */
  travelVh?: number
}

/**
 * SurfaceSystemXray — the brand thesis made kinetic. The product surface wipes
 * away as you scroll through a pinned stage, x-raying into the architecture map
 * underneath. A glowing seam tracks the reveal. No-JS and reduced-motion render
 * a static surface | system split so the content is always fully visible.
 */
export function SurfaceSystemXray({
  surfaceSrc,
  systemSrc,
  surfaceAlt = '',
  systemAlt = '',
  caption,
  travelVh = 240,
}: SurfaceSystemXrayProps) {
  const [enhanced, setEnhanced] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setEnhanced(true)
  }, [])

  useEffect(() => {
    if (!enhanced) return
    let raf = 0
    const update = () => {
      raf = 0
      const wrap = wrapRef.current
      const stage = stageRef.current
      if (!wrap || !stage) return
      const rect = wrap.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? clamp(-rect.top / travel) : 0
      stage.style.setProperty('--reveal', progress.toFixed(4))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [enhanced])

  const mono = 'font-mono text-[10px] uppercase tracking-[0.18em]'

  // SSR / no-JS / reduced-motion — static surface | system split, fully legible.
  if (!enhanced) {
    return (
      <figure className="m-0">
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
          <div className="relative aspect-[16/10] bg-[var(--sage-surface-1)]">
            <Image src={surfaceSrc} alt={surfaceAlt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
            <span className={`absolute left-3 top-3 rounded-[2px] bg-[rgba(11,11,14,0.7)] px-2 py-1 ${mono} text-[var(--sage-accent-readable)]`}>
              surface
            </span>
          </div>
          <div className="relative aspect-[16/10] bg-[var(--sage-surface-1)]">
            <Image src={systemSrc} alt={systemAlt} fill unoptimized sizes="(max-width: 640px) 100vw, 50vw" className="object-contain p-[4%]" />
            <span className={`absolute right-3 top-3 rounded-[2px] bg-[rgba(11,11,14,0.7)] px-2 py-1 ${mono} text-[var(--sage-accent-readable)]`}>
              system
            </span>
          </div>
        </div>
        {caption ? <figcaption className="mt-3 text-xs leading-6 text-[var(--sage-ink-faint)]">{caption}</figcaption> : null}
      </figure>
    )
  }

  // Enhanced — scroll-scrubbed x-ray.
  return (
    <div ref={wrapRef} className="relative" style={{ height: `${travelVh}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-4 py-[7vh]">
        <div
          ref={stageRef}
          className="relative w-full overflow-hidden rounded-[4px] border border-[var(--sage-border-strong)] bg-[var(--sage-bg)] shadow-[0_40px_120px_rgba(0,0,0,0.5)] [--reveal:0]"
        >
          <div className="relative aspect-[16/10] w-full">
            {/* system map — revealed beneath */}
            <Image src={systemSrc} alt={systemAlt} fill unoptimized priority sizes="100vw" className="object-contain p-[4%]" />
            {/* product surface — wipes away to the right as --reveal grows */}
            <Image
              src={surfaceSrc}
              alt={surfaceAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ clipPath: 'inset(0 0 0 calc(var(--reveal) * 100%))' }}
            />
            {/* glowing seam */}
            <div
              aria-hidden
              className="absolute inset-y-0 w-px bg-[var(--sage-accent)]"
              style={{ left: 'calc(var(--reveal) * 100%)', boxShadow: '0 0 22px 2px rgba(61,90,254,0.7)' }}
            />
            <span className={`absolute left-4 top-4 rounded-[2px] bg-[rgba(11,11,14,0.72)] px-2 py-1 ${mono} text-[var(--sage-accent-readable)] backdrop-blur`}>
              surface
            </span>
            <span className={`absolute right-4 top-4 rounded-[2px] bg-[rgba(11,11,14,0.72)] px-2 py-1 ${mono} text-[var(--sage-accent-readable)] backdrop-blur`}>
              system
            </span>
            <span className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-[var(--sage-border-strong)] bg-[rgba(11,11,14,0.72)] px-3 py-1.5 ${mono} text-[var(--sage-ink-muted)] backdrop-blur`}>
              scroll to x-ray ↓
            </span>
          </div>
        </div>
        {caption ? <p className="max-w-2xl px-4 text-center text-xs leading-6 text-[var(--sage-ink-faint)]">{caption}</p> : null}
      </div>
    </div>
  )
}
