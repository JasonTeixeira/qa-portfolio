'use client'

import { useEffect, useRef } from 'react'

/**
 * HeroField — interactive canvas node-field behind the hero. A living
 * automation graph: drifting accent nodes, distance-faded edges, pass-green
 * packet pulses traveling along edges, and a gentle pointer attractor.
 *
 * Hand-rolled (no libs). rAF loop pauses when the hero is offscreen or the
 * tab is hidden. prefers-reduced-motion renders one static frame, no loop.
 * Touch devices get slower drift and no attractor. Canvas is decorative:
 * aria-hidden, pointer-events none (pointer read from window mousemove).
 */

const NODE_COLORS = [
  'rgba(77, 159, 255, 0.75)', // --acc-primary
  'rgba(176, 139, 232, 0.7)', // --acc-ai
  'rgba(56, 189, 248, 0.7)', // --acc-browser
  'rgba(111, 201, 143, 0.7)', // --acc-pass
] as const

const LINK_DIST = 130
const ATTRACT_DIST = 180
const MOBILE_BREAKPOINT = 768
const NODES_DESKTOP = 45
const NODES_MOBILE = 22
const MAX_DPR = 2
const MAX_PACKETS = 3
const PACKET_SPAWN_CHANCE = 0.018
const EDGE_BASE_ALPHA = 0.15
const ATTRACT_EASE = 0.006

interface FieldNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
}

interface Packet {
  from: number
  to: number
  t: number
  speed: number
}

export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches

    let width = 0
    let height = 0
    let rafId = 0
    let running = false
    let inView = true
    let lastTime = 0
    let nodes: FieldNode[] = []
    let packets: Packet[] = []
    const pointer = { x: 0, y: 0, active: false }
    const driftScale = coarse ? 0.5 : 1

    const seedNodes = () => {
      const count = width < MOBILE_BREAKPOINT ? NODES_MOBILE : NODES_DESKTOP
      nodes = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2
        const speed = (0.08 + Math.random() * 0.14) * driftScale
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random(),
          color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
        }
      })
      packets = []
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (nodes.length === 0) seedNodes()
    }

    const spawnPacket = () => {
      const from = Math.floor(Math.random() * nodes.length)
      const origin = nodes[from]
      for (let j = 0; j < nodes.length; j++) {
        if (j === from) continue
        const dx = nodes[j].x - origin.x
        const dy = nodes[j].y - origin.y
        if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) {
          packets = [...packets, { from, to: j, t: 0, speed: 0.014 + Math.random() * 0.014 }]
          return
        }
      }
    }

    const drawFrame = (dt: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height)

      if (animate) {
        const margin = 24
        for (const node of nodes) {
          node.x += node.vx * dt
          node.y += node.vy * dt
          if (node.x < -margin) node.x = width + margin
          if (node.x > width + margin) node.x = -margin
          if (node.y < -margin) node.y = height + margin
          if (node.y > height + margin) node.y = -margin
          if (pointer.active) {
            const dx = pointer.x - node.x
            const dy = pointer.y - node.y
            if (dx * dx + dy * dy < ATTRACT_DIST * ATTRACT_DIST) {
              node.x += dx * ATTRACT_EASE * dt
              node.y += dy * ATTRACT_EASE * dt
            }
          }
        }
      }

      // Edges — O(n²), n ≤ 45.
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const aNear =
          pointer.active &&
          (pointer.x - a.x) ** 2 + (pointer.y - a.y) ** 2 < ATTRACT_DIST * ATTRACT_DIST
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = dx * dx + dy * dy
          if (d2 >= LINK_DIST * LINK_DIST) continue
          const d = Math.sqrt(d2)
          let alpha = (1 - d / LINK_DIST) * EDGE_BASE_ALPHA
          if (
            aNear ||
            (pointer.active &&
              (pointer.x - b.x) ** 2 + (pointer.y - b.y) ** 2 < ATTRACT_DIST * ATTRACT_DIST)
          ) {
            alpha = Math.min(alpha * 2.6, 0.45)
          }
          ctx.strokeStyle = `rgba(150, 182, 240, ${alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // Packets — bright pass-green dots lerping node → node.
      if (animate) {
        if (packets.length < MAX_PACKETS && Math.random() < PACKET_SPAWN_CHANCE * dt) {
          spawnPacket()
        }
        packets = packets.filter((p) => p.t < 1)
        for (const p of packets) {
          p.t = Math.min(p.t + p.speed * dt, 1)
          const a = nodes[p.from]
          const b = nodes[p.to]
          const px = a.x + (b.x - a.x) * p.t
          const py = a.y + (b.y - a.y) * p.t
          ctx.fillStyle = 'rgba(111, 201, 143, 0.18)'
          ctx.beginPath()
          ctx.arc(px, py, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = 'rgba(111, 201, 143, 0.9)'
          ctx.beginPath()
          ctx.arc(px, py, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Nodes — 1-2px accent dots.
      for (const node of nodes) {
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (now: number) => {
      if (!running) return
      const dt = lastTime === 0 ? 1 : Math.min((now - lastTime) / 16.67, 2.5)
      lastTime = now
      drawFrame(dt, true)
      rafId = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      lastTime = 0
      rafId = requestAnimationFrame(loop)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }

    const syncRunning = () => {
      if (inView && document.visibilityState === 'visible') start()
      else stop()
    }

    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.active =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height
    }

    const onResize = () => {
      resize()
      if (reduced) drawFrame(1, false)
    }

    const io = new IntersectionObserver(
      (entries) => {
        inView = entries.some((entry) => entry.isIntersecting)
        syncRunning()
      },
      { threshold: 0 },
    )

    resize()

    if (reduced) {
      drawFrame(1, false)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    io.observe(canvas)
    document.addEventListener('visibilitychange', syncRunning)
    window.addEventListener('resize', onResize)
    if (!coarse) window.addEventListener('mousemove', onMouseMove, { passive: true })
    syncRunning()

    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', syncRunning)
      window.removeEventListener('resize', onResize)
      if (!coarse) window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-hero-field
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
