'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

interface CinematicBackdropProps {
  src: string
  alt?: string
  /** Image brightness multiplier — lower keeps cream text readable. */
  brightness?: number
  /** Parallax travel in px across the section. 0 disables. */
  parallax?: number
  /** Where the readable text sits, so the dark grade anchors there. */
  textAnchor?: 'bottom-left' | 'bottom' | 'center'
  className?: string
}

/**
 * CinematicBackdrop — a full-bleed cinematic image layered behind real content.
 * Scroll parallax gives depth; a directional grade darkens the side the text
 * sits on so headlines stay legible while the landscape breathes behind them.
 * Decorative (aria-hidden, pointer-events: none); reduced-motion drops parallax.
 */
export function CinematicBackdrop({
  src,
  alt = '',
  brightness = 0.42,
  parallax = 64,
  textAnchor = 'bottom-left',
  className,
}: CinematicBackdropProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (parallax === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const wrap = wrapRef.current
    const layer = layerRef.current
    if (!wrap || !layer) return

    let raf = 0
    const update = () => {
      raf = 0
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // progress: 0 when section top is at viewport top, grows as it scrolls up
      const progress = -rect.top / vh
      layer.style.transform = `translate3d(0, ${(progress * parallax).toFixed(1)}px, 0) scale(1.14)`
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
  }, [parallax])

  const grade =
    textAnchor === 'bottom-left'
      ? 'linear-gradient(90deg, rgba(11,11,14,0.94) 0%, rgba(11,11,14,0.55) 32%, rgba(11,11,14,0.08) 62%, transparent 80%),' +
        'linear-gradient(0deg, var(--sage-bg) 0%, rgba(11,11,14,0.78) 13%, rgba(11,11,14,0.12) 44%, transparent 60%),' +
        'linear-gradient(180deg, rgba(11,11,14,0.72) 0%, rgba(11,11,14,0.1) 18%, transparent 34%)'
      : textAnchor === 'center'
        ? 'radial-gradient(120% 100% at 50% 50%, transparent 18%, rgba(11,11,14,0.55) 62%, var(--sage-bg) 100%),' +
          'linear-gradient(0deg, var(--sage-bg) 0%, transparent 30%)'
        : 'linear-gradient(0deg, var(--sage-bg) 0%, rgba(11,11,14,0.8) 16%, rgba(11,11,14,0.18) 46%, transparent 64%),' +
          'linear-gradient(180deg, rgba(11,11,14,0.7) 0%, transparent 30%)'

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`}
    >
      <div ref={layerRef} className="absolute inset-0 will-change-transform" style={{ transform: 'scale(1.14)' }}>
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: `brightness(${brightness}) saturate(1.06) contrast(1.04)` }}
        />
      </div>
      <div className="absolute inset-0" style={{ background: grade }} />
    </div>
  )
}
