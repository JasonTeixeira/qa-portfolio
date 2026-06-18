'use client'

import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import styles from './LivingPageSystem.module.css'

export type LivingDiagramStat = {
  label: string
  value: string
}

export type ScrollDrawDiagramProps = {
  eyebrow: string
  title: string
  nodes?: string[]
  stats?: LivingDiagramStat[]
  variant?: 'studio' | 'academy' | 'growth' | 'systems'
}

const fallbackNodes = ['Surface', 'Data', 'AI', 'Ops']
const fallbackStats = [
  { label: 'visible by default', value: 'PE' },
  { label: 'native scroll', value: '0 hijack' },
  { label: 'proof first', value: 'real' },
]

const pathsByVariant = {
  studio: {
    primary: 'M 54 184 C 128 72, 238 66, 318 146 S 488 256, 596 114',
    secondary: 'M 88 232 C 202 160, 318 194, 408 116 S 528 86, 604 162',
    tertiary: 'M 76 94 C 194 148, 260 226, 390 210 S 528 178, 604 218',
    packet: 'M 54 184 C 128 72, 238 66, 318 146 S 488 256, 596 114',
  },
  academy: {
    primary: 'M 66 176 C 154 118, 248 88, 344 148 S 480 220, 594 112',
    secondary: 'M 86 228 C 208 132, 308 182, 416 150 S 536 106, 604 188',
    tertiary: 'M 82 98 C 196 142, 276 214, 394 196 S 514 166, 594 222',
    packet: 'M 66 176 C 154 118, 248 88, 344 148 S 480 220, 594 112',
  },
  growth: {
    primary: 'M 56 222 C 132 188, 186 82, 284 104 S 398 242, 594 88',
    secondary: 'M 78 124 C 194 76, 282 216, 388 172 S 520 128, 606 206',
    tertiary: 'M 88 238 C 212 170, 320 154, 430 118 S 536 116, 602 150',
    packet: 'M 56 222 C 132 188, 186 82, 284 104 S 398 242, 594 88',
  },
  systems: {
    primary: 'M 60 150 C 144 70, 214 218, 310 142 S 486 80, 596 154',
    secondary: 'M 86 218 C 180 110, 276 96, 380 184 S 516 238, 604 102',
    tertiary: 'M 82 96 C 194 160, 298 214, 406 188 S 526 136, 596 206',
    packet: 'M 60 150 C 144 70, 214 218, 310 142 S 486 80, 596 154',
  },
} as const

export function ScrollDrawDiagram({
  eyebrow,
  title,
  nodes = fallbackNodes,
  stats = fallbackStats,
  variant = 'studio',
}: ScrollDrawDiagramProps) {
  const rootRef = useRef<HTMLElement>(null)
  const gradientId = useId().replace(/:/g, '')
  const reduced = useReducedMotion()
  const paddedNodes = [...nodes, ...fallbackNodes].slice(0, 4)
  const paths = pathsByVariant[variant]

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (reduced) {
      root.style.setProperty('--diagram-progress', '1')
      root.dataset.diagramActive = 'false'
      return
    }

    let frame = 0
    const updateProgress = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      const viewport = window.innerHeight || 1
      const start = viewport * 0.9
      const end = viewport * 0.18
      const raw = (start - rect.top) / (start - end)
      const progress = Math.max(0, Math.min(1, raw))
      root.style.setProperty('--diagram-progress', progress.toFixed(3))
    }

    const requestUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isActive = Boolean(entry?.isIntersecting)
        root.dataset.diagramActive = isActive ? 'true' : 'false'
        const svg = root.querySelector('svg')
        if (svg && 'pauseAnimations' in svg && 'unpauseAnimations' in svg) {
          if (isActive) svg.unpauseAnimations()
          else svg.pauseAnimations()
        }
        if (isActive) requestUpdate()
      },
      { threshold: 0.12 },
    )

    observer.observe(root)
    updateProgress()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reduced])

  return (
    <aside
      ref={rootRef}
      className={`${styles.systemPanel} ${styles.scrollDiagram} min-h-[360px] p-5 sm:p-6`}
      data-diagram-active="false"
      aria-label={title}
    >
      <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--sage-accent-readable)]">
            {eyebrow}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
            Surface ⇄ System
          </p>
        </div>

        <svg
          className="my-8 h-[190px] w-full overflow-visible"
          viewBox="0 0 650 300"
          role="img"
          aria-label="Scroll-drawn system architecture diagram"
        >
          <defs>
            <linearGradient id={`${gradientId}-line`} x1="0" x2="1" y1="0" y2="0">
              <stop stopColor="#3D5AFE" offset="0%" />
              <stop stopColor="#7C3AED" offset="52%" />
              <stop stopColor="#FF2D9B" offset="100%" />
            </linearGradient>
            <filter id={`${gradientId}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            className={styles.diagramPathPrimary}
            d={paths.primary}
            fill="none"
            pathLength="1"
            stroke={`url(#${gradientId}-line)`}
            strokeLinecap="round"
            strokeWidth="2.4"
            filter={`url(#${gradientId}-glow)`}
          />
          <path
            className={styles.diagramPathSecondary}
            d={paths.secondary}
            fill="none"
            pathLength="1"
            stroke="rgba(242,239,233,0.18)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <path
            className={styles.diagramPathTertiary}
            d={paths.tertiary}
            fill="none"
            pathLength="1"
            stroke="rgba(242,239,233,0.13)"
            strokeLinecap="round"
            strokeWidth="1"
          />
          <circle className={styles.diagramPacket} r="5" fill="#FF2D9B">
            <animateMotion dur="5.2s" repeatCount="indefinite" path={paths.packet} />
          </circle>
          <circle className={styles.diagramPacketTwo} r="4" fill="#3D5AFE">
            <animateMotion dur="6.2s" repeatCount="indefinite" path={paths.secondary} />
          </circle>
          {[
            [70, 180],
            [246, 94],
            [404, 204],
            [584, 118],
          ].map(([x, y], index) => (
            <g key={`${x}-${y}`} className={styles.diagramNode}>
              <circle cx={x} cy={y} r="24" fill="rgba(61,90,254,0.04)" />
              <circle cx={x} cy={y} r="8" fill="#0B0B0E" stroke={`url(#${gradientId}-line)`} strokeWidth="2" />
              <text
                x={x}
                y={y + 48}
                fill="#8A8A94"
                fontFamily="var(--font-mono)"
                fontSize="11"
                textAnchor="middle"
                letterSpacing="1.6"
              >
                {paddedNodes[index]}
              </text>
            </g>
          ))}
        </svg>

        <dl className="grid grid-cols-3 gap-px bg-[var(--sage-border)]">
          {stats.map((stat) => (
            <div className="bg-[rgba(11,11,14,0.72)] p-3" key={stat.label}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                {stat.label}
              </dt>
              <dd className="mt-2 font-mono text-sm text-[var(--sage-ink)]">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  )
}
