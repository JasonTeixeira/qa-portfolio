'use client'

import { useEffect, useRef } from 'react'

type Node = { x: number; y: number; vx: number; vy: number; r: number }
type Packet = { from: Node; to: Node; t: number; speed: number }

/**
 * LivingNetworkHero — a real-time, mouse-reactive "living system" rendered on a
 * canvas behind the hero. Nodes drift, connect into a constellation by
 * proximity, send glowing data packets along the links, and reach toward the
 * cursor. Brand-blue. Pauses when the tab is hidden; reduced-motion renders a
 * single static frame. Purely decorative (aria-hidden, pointer-events: none) so
 * it never blocks the headline or CTAs.
 */
export function LivingNetworkHero({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const ctx2d = el.getContext('2d')
    if (!ctx2d) return
    // Bind explicit non-null types so narrowing survives into the nested
    // animation closures below.
    const canvas: HTMLCanvasElement = el
    const ctx: CanvasRenderingContext2D = ctx2d

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let nodes: Node[] = []
    let packets: Packet[] = []
    let raf = 0
    let running = true
    let lastPacket = 0

    const mouse = { x: -9999, y: -9999, active: false }
    const LINK_DIST = 140
    const MOUSE_DIST = 210

    const targetCount = () =>
      Math.max(28, Math.min(96, Math.floor((width * height) / 16000)))

    function seed() {
      nodes = Array.from({ length: targetCount() }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.7 + 0.8,
      }))
      packets = []
    }

    function resize() {
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

    function spawnPacket() {
      if (nodes.length < 2) return
      const from = nodes[(Math.random() * nodes.length) | 0]
      let best: Node | null = null
      let bestD = LINK_DIST
      for (const n of nodes) {
        if (n === from) continue
        const d = Math.hypot(n.x - from.x, n.y - from.y)
        if (d < bestD && Math.random() > 0.5) {
          best = n
          bestD = d
        }
      }
      if (best) packets.push({ from, to: best, t: 0, speed: 0.012 + Math.random() * 0.014 })
    }

    function frame(now: number) {
      ctx.clearRect(0, 0, width, height)

      // cursor glow — the system reacts to you
      if (mouse.active) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_DIST)
        g.addColorStop(0, 'rgba(61,90,254,0.12)')
        g.addColorStop(1, 'rgba(61,90,254,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        if (mouse.active) {
          const dx = mouse.x - n.x
          const dy = mouse.y - n.y
          const d = Math.hypot(dx, dy)
          if (d < MOUSE_DIST && d > 1) {
            n.x += (dx / d) * 0.35
            n.y += (dy / d) * 0.35
          }
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(61,90,254,${(1 - d / LINK_DIST) * 0.6})`
            ctx.lineWidth = 1.1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        if (mouse.active) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y)
          if (d < MOUSE_DIST) {
            ctx.strokeStyle = `rgba(110,131,255,${(1 - d / MOUSE_DIST) * 0.7})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      // data packets
      if (!reduced && now - lastPacket > 420 && packets.length < 14) {
        spawnPacket()
        lastPacket = now
      }
      packets = packets.filter((p) => p.t < 1)
      for (const p of packets) {
        p.t += p.speed
        const x = p.from.x + (p.to.x - p.from.x) * p.t
        const y = p.from.y + (p.to.y - p.from.y) * p.t
        ctx.fillStyle = 'rgba(143,160,255,0.95)'
        ctx.shadowColor = 'rgba(61,90,254,0.9)'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(x, y, 2.1, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // nodes
      for (const n of nodes) {
        const near =
          mouse.active && Math.hypot(n.x - mouse.x, n.y - mouse.y) < MOUSE_DIST
        ctx.fillStyle = near ? 'rgba(190,205,255,1)' : 'rgba(143,160,255,0.95)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, near ? n.r + 0.6 : n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (running && !reduced) raf = requestAnimationFrame(frame)
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouse.active = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
      mouse.x = x
      mouse.y = y
    }
    const onLeave = () => {
      mouse.active = false
    }
    const onVisibility = () => {
      running = document.visibilityState === 'visible'
      if (running && !reduced) raf = requestAnimationFrame(frame)
    }

    resize()
    raf = requestAnimationFrame(frame)
    if (reduced) cancelAnimationFrame(raf) // single static frame already drawn

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
