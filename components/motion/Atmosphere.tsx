'use client'

import { useEffect, useRef } from 'react'

type Particle = { x: number; y: number; vx: number; vy: number; r: number; life: number; max: number; tw: number }

interface AtmosphereProps {
  /** 'cool' = pale moonlight motes drifting up; 'ember' = warm embers rising. */
  variant?: 'cool' | 'ember'
  /** Density multiplier. */
  density?: number
  className?: string
}

/**
 * Atmosphere — a living particle field layered over a cinematic scene. Cool
 * variant drifts pale moonlight motes; ember variant lifts warm sparks from the
 * base. Canvas 2D + rAF, capped count, pauses when the tab is hidden; renders a
 * single static frame under reduced-motion. Purely decorative.
 */
export function Atmosphere({ variant = 'cool', density = 1, className }: AtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const ember = variant === 'ember'

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let raf = 0
    let running = true

    const count = () =>
      Math.round(Math.min(ember ? 70 : 90, Math.max(18, (width * height) / 26000)) * density)

    const spawn = (initial: boolean): Particle => {
      const max = ember ? 140 + Math.random() * 160 : 260 + Math.random() * 320
      return {
        x: Math.random() * width,
        y: ember ? (initial ? Math.random() * height : height + 8) : Math.random() * height,
        vx: (Math.random() - 0.5) * (ember ? 0.22 : 0.14),
        vy: ember ? -(0.25 + Math.random() * 0.55) : -(0.05 + Math.random() * 0.12),
        r: ember ? Math.random() * 1.6 + 0.6 : Math.random() * 1.5 + 0.5,
        life: initial ? Math.random() * max : 0,
        max,
        tw: Math.random() * Math.PI * 2,
      }
    }

    const seed = () => {
      particles = Array.from({ length: count() }, () => spawn(true))
    }

    const resize = () => {
      const parent = canvas.parentElement
      width = parent ? parent.clientWidth : window.innerWidth
      height = parent ? parent.clientHeight : window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
    }

    const frame = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.life += 1
        p.x += p.vx + Math.sin((p.life + p.tw) * 0.02) * (ember ? 0.18 : 0.1)
        p.y += p.vy
        const t = p.life / p.max
        const fade = Math.sin(Math.min(t, 1) * Math.PI) // ease in/out over life
        const twinkle = 0.6 + 0.4 * Math.sin(p.life * 0.06 + p.tw)
        if (ember) {
          const alpha = fade * twinkle * 0.85
          ctx.fillStyle = `rgba(255, ${140 + Math.round(p.tw * 10) % 60}, 70, ${alpha})`
          ctx.shadowColor = 'rgba(255,120,50,0.8)'
          ctx.shadowBlur = 8
        } else {
          ctx.fillStyle = `rgba(190, 210, 255, ${fade * twinkle * 0.5})`
          ctx.shadowBlur = 0
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        if (t >= 1 || p.y < -10 || p.x < -10 || p.x > width + 10) {
          Object.assign(p, spawn(false))
        }
      }
      if (running && !reduced) raf = requestAnimationFrame(frame)
    }

    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running && !reduced) raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    if (reduced) cancelAnimationFrame(raf)

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [variant, density])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
