'use client'

/**
 * Pipeline — cinematic visual journey for a Sage Ideas service.
 *
 * Renders a horizontal animated pipeline on desktop (SVG path with progressive
 * line drawing + flowing particles) and a vertical version on mobile.
 *
 * Interactions:
 *   - Scroll-triggered: line draws as the section enters the viewport.
 *   - Hover a stage: a tooltip shows the tagline + duration.
 *   - Click a stage: opens an expanded panel with deliverables, what you do,
 *     and what Sage does.
 *   - Auto-play: a "Play the journey" button auto-walks through stages,
 *     opening each panel for ~2.4s.
 *
 * Particles flow along the visible part of the line for ambient motion.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Play, Pause, X, ArrowRight } from 'lucide-react'
import type { PipelineDefinition, PipelineStage } from './types'
import { PIPELINE_TONES } from './types'
import { PIPELINE_ICON_MAP } from './icons'
import { cn } from '@/lib/utils'

type PipelineProps = {
  pipeline: PipelineDefinition
  /** Compact embed mode for use on service detail pages. */
  compact?: boolean
  className?: string
}

const PARTICLE_COUNT = 6
const AUTOPLAY_INTERVAL_MS = 2400

export function Pipeline({ pipeline, compact = false, className }: PipelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const inView = useInView(sectionRef, { once: true, amount: 0.2 })
  const prefersReducedMotion = useReducedMotion()
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [autoplayIndex, setAutoplayIndex] = useState<number | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const accent = pipeline.accent ?? 'gradient'

  // ----- Autoplay loop --------------------------------------------------------
  useEffect(() => {
    if (autoplayIndex === null) return
    if (autoplayIndex >= pipeline.stages.length) {
      setAutoplayIndex(null)
      setActiveStage(null)
      return
    }
    setActiveStage(pipeline.stages[autoplayIndex].id)
    const t = setTimeout(() => {
      setAutoplayIndex(autoplayIndex + 1)
    }, AUTOPLAY_INTERVAL_MS)
    return () => clearTimeout(t)
  }, [autoplayIndex, pipeline.stages])

  const activeStageObj = useMemo(
    () => pipeline.stages.find((s) => s.id === activeStage) ?? null,
    [pipeline.stages, activeStage],
  )

  return (
    <div
      ref={sectionRef}
      className={cn('relative w-full', className)}
      aria-label={`${pipeline.title} pipeline`}
    >
      {!compact && (
        <PipelineHeader
          pipeline={pipeline}
          autoplayActive={autoplayIndex !== null}
          onToggleAutoplay={() => {
            if (autoplayIndex !== null) {
              setAutoplayIndex(null)
              setActiveStage(null)
            } else {
              setAutoplayIndex(0)
            }
          }}
        />
      )}

      {/* Desktop: horizontal pipeline */}
      <div className="hidden md:block">
        <DesktopPipeline
          pipeline={pipeline}
          inView={inView}
          activeStage={activeStage}
          hoverIndex={hoverIndex}
          onSelect={(id) => {
            setActiveStage(id)
            setAutoplayIndex(null)
          }}
          onHover={setHoverIndex}
          reducedMotion={!!prefersReducedMotion}
        />
      </div>

      {/* Mobile: vertical pipeline */}
      <div className="md:hidden">
        <MobilePipeline
          pipeline={pipeline}
          inView={inView}
          activeStage={activeStage}
          onSelect={(id) => {
            setActiveStage(id)
            setAutoplayIndex(null)
          }}
          reducedMotion={!!prefersReducedMotion}
        />
      </div>

      {/* Expanded stage panel */}
      <AnimatePresence>
        {activeStageObj && (
          <StagePanel
            stage={activeStageObj}
            onClose={() => {
              setActiveStage(null)
              setAutoplayIndex(null)
            }}
            accent={accent}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// HEADER
// ============================================================================
function PipelineHeader({
  pipeline,
  autoplayActive,
  onToggleAutoplay,
}: {
  pipeline: PipelineDefinition
  autoplayActive: boolean
  onToggleAutoplay: () => void
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
      <div>
        {pipeline.eyebrow && (
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-400/80">
            {pipeline.eyebrow}
          </div>
        )}
        <h3 className="text-2xl font-semibold text-white md:text-3xl">{pipeline.title}</h3>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400 md:text-base">{pipeline.tagline}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
          <span>{pipeline.stages.length} stages</span>
          <span aria-hidden>·</span>
          <span>{pipeline.totalDuration}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleAutoplay}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all',
          autoplayActive
            ? 'border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_24px_rgba(6,182,212,0.25)]'
            : 'border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:border-zinc-500 hover:text-white',
        )}
        aria-label={autoplayActive ? 'Pause auto-play' : 'Play the journey'}
      >
        {autoplayActive ? (
          <>
            <Pause className="h-3.5 w-3.5" /> Pause journey
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5" /> Play the journey
          </>
        )}
      </button>
    </div>
  )
}

// ============================================================================
// DESKTOP — horizontal SVG path + nodes + flowing particles
// ============================================================================
function DesktopPipeline({
  pipeline,
  inView,
  activeStage,
  hoverIndex,
  onSelect,
  onHover,
  reducedMotion,
}: {
  pipeline: PipelineDefinition
  inView: boolean
  activeStage: string | null
  hoverIndex: number | null
  onSelect: (id: string) => void
  onHover: (i: number | null) => void
  reducedMotion: boolean
}) {
  const stages = pipeline.stages
  const count = stages.length
  // Layout the path along a gentle wave for visual interest.
  const width = 1200
  const height = 280
  const padX = 60
  const innerW = width - padX * 2
  const points = stages.map((_, i) => {
    const x = padX + (innerW / (count - 1)) * i
    // sine wave Y oscillation, low amplitude so it stays elegant
    const y = height / 2 + Math.sin((i / Math.max(count - 1, 1)) * Math.PI * 1.4) * 28
    return { x, y }
  })

  const pathD = useMemo(() => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const cur = points[i]
      const midX = (prev.x + cur.x) / 2
      d += ` C ${midX} ${prev.y}, ${midX} ${cur.y}, ${cur.x} ${cur.y}`
    }
    return d
  }, [points])

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id={`pipeline-line-${pipeline.slug}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.85)" />
            <stop offset="50%" stopColor="rgba(139,92,246,0.85)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.85)" />
          </linearGradient>
          <filter id={`pipeline-glow-${pipeline.slug}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint guide line (always visible) */}
        <path
          d={pathD}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />

        {/* Animated drawn line (gradient + glow) */}
        <motion.path
          d={pathD}
          stroke={`url(#pipeline-line-${pipeline.slug})`}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          filter={`url(#pipeline-glow-${pipeline.slug})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: reducedMotion ? 0 : 2.2, ease: 'easeInOut' },
            opacity: { duration: 0.4 },
          }}
        />

        {/* Flowing particles — simple translateAlongPath approximation via offsetPath */}
        {!reducedMotion && inView && (
          <PathParticles pathId={`pipeline-line-${pipeline.slug}`} d={pathD} count={PARTICLE_COUNT} />
        )}
      </svg>

      {/* Nodes — absolutely positioned over the SVG */}
      <div className="pointer-events-none absolute inset-0">
        {points.map((p, i) => {
          const stage = stages[i]
          const isActive = activeStage === stage.id
          const isHover = hoverIndex === i
          return (
            <PipelineNode
              key={stage.id}
              stage={stage}
              x={(p.x / width) * 100}
              y={(p.y / height) * 100}
              index={i}
              total={count}
              active={isActive}
              hover={isHover}
              onSelect={() => onSelect(stage.id)}
              onHover={(h) => onHover(h ? i : null)}
              inView={inView}
              reducedMotion={reducedMotion}
            />
          )
        })}
      </div>
    </div>
  )
}

function PipelineNode({
  stage,
  x,
  y,
  index,
  total,
  active,
  hover,
  onSelect,
  onHover,
  inView,
  reducedMotion,
}: {
  stage: PipelineStage
  x: number
  y: number
  index: number
  total: number
  active: boolean
  hover: boolean
  onSelect: () => void
  onHover: (h: boolean) => void
  inView: boolean
  reducedMotion: boolean
}) {
  const tone = PIPELINE_TONES[stage.tone ?? 'cyan']
  const Icon = PIPELINE_ICON_MAP[stage.icon]
  const showAbove = index % 2 === 0
  const delay = reducedMotion ? 0 : 0.4 + (index / Math.max(total - 1, 1)) * 1.6
  return (
    <motion.div
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, delay, ease: 'backOut' }}
    >
      {/* Stage label above/below */}
      <div
        className={cn(
          'absolute left-1/2 hidden w-44 -translate-x-1/2 text-center md:block',
          showAbove ? 'bottom-[calc(100%+18px)]' : 'top-[calc(100%+18px)]',
        )}
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          {stage.duration}
        </div>
        <div className={cn('mt-1 text-sm font-semibold', tone.text)}>{stage.title}</div>
      </div>

      {/* Node circle */}
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        className={cn(
          'group relative grid h-14 w-14 place-items-center rounded-full border-2 bg-zinc-950/90 backdrop-blur transition-all',
          tone.border,
          active && 'scale-110',
          (active || hover) && tone.glow,
          stage.optional && 'border-dashed',
        )}
        aria-label={`Stage ${index + 1}: ${stage.title}`}
        aria-expanded={active}
      >
        <span
          className={cn(
            'absolute inset-0 -z-0 rounded-full opacity-0 blur-md transition-opacity',
            tone.bg,
            (active || hover) && 'opacity-100',
          )}
        />
        <Icon className={cn('h-6 w-6 transition-colors', tone.text)} />
        <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border border-zinc-700 bg-zinc-950 text-[10px] font-mono text-zinc-300">
          {index + 1}
        </span>
      </button>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hover && !active && (
          <motion.div
            initial={{ opacity: 0, y: showAbove ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: showAbove ? -4 : 4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'pointer-events-none absolute left-1/2 z-20 w-56 -translate-x-1/2 rounded-lg border border-zinc-700/70 bg-zinc-950/95 p-3 text-left shadow-xl backdrop-blur',
              showAbove ? 'top-[calc(100%+8px)]' : 'bottom-[calc(100%+8px)]',
            )}
          >
            <div className={cn('text-xs font-semibold', tone.text)}>{stage.title}</div>
            <p className="mt-1 text-xs leading-relaxed text-zinc-300">{stage.tagline}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-zinc-500">
              <span>{stage.duration}</span>
              <span className="inline-flex items-center gap-1 text-cyan-300">
                Click to expand <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Particles that flow along the SVG path. Implemented as a small set of
// circles using SMIL-free Framer animation along (x,y) of evenly spaced
// samples on the path. This is performant and works across browsers.
function PathParticles({ d, count }: { pathId: string; d: string; count: number }) {
  const samples = useMemo(() => samplePath(d, 200), [d])
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const startOffset = i / count
        return (
          <ParticleDot
            key={i}
            samples={samples}
            startOffset={startOffset}
            duration={5 + i * 0.4}
          />
        )
      })}
    </g>
  )
}

function ParticleDot({
  samples,
  startOffset,
  duration,
}: {
  samples: { x: number; y: number }[]
  startOffset: number
  duration: number
}) {
  const [t, setT] = useState(startOffset)
  useEffect(() => {
    let raf = 0
    const start = performance.now() - startOffset * duration * 1000
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000
      setT(((elapsed / duration) % 1 + 1) % 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [duration, startOffset])

  if (!samples.length) return null
  const idx = Math.floor(t * (samples.length - 1))
  const p = samples[idx]
  return (
    <circle
      cx={p.x}
      cy={p.y}
      r={2.4}
      fill="rgba(255,255,255,0.95)"
      style={{ filter: 'drop-shadow(0 0 6px rgba(6,182,212,0.85))' }}
    />
  )
}

// Cheap polyline sampling — we re-compute geometry from the d string
// using a transient SVG path in the DOM only on the client.
function samplePath(d: string, n: number): { x: number; y: number }[] {
  if (typeof document === 'undefined') return []
  const ns = 'http://www.w3.org/2000/svg'
  const path = document.createElementNS(ns, 'path')
  path.setAttribute('d', d)
  const total = path.getTotalLength?.() ?? 0
  if (!total) return []
  const out: { x: number; y: number }[] = []
  for (let i = 0; i < n; i++) {
    const p = path.getPointAtLength((i / (n - 1)) * total)
    out.push({ x: p.x, y: p.y })
  }
  return out
}

// ============================================================================
// MOBILE — vertical stacked pipeline
// ============================================================================
function MobilePipeline({
  pipeline,
  inView,
  activeStage,
  onSelect,
  reducedMotion,
}: {
  pipeline: PipelineDefinition
  inView: boolean
  activeStage: string | null
  onSelect: (id: string) => void
  reducedMotion: boolean
}) {
  return (
    <ol className="relative space-y-3 pl-6">
      {/* Vertical accent line */}
      <span
        aria-hidden
        className="absolute left-2 top-0 h-full w-px bg-gradient-to-b from-cyan-400/60 via-violet-400/40 to-cyan-400/0"
      />
      {pipeline.stages.map((stage, i) => {
        const tone = PIPELINE_TONES[stage.tone ?? 'cyan']
        const Icon = PIPELINE_ICON_MAP[stage.icon]
        const isActive = activeStage === stage.id
        return (
          <motion.li
            key={stage.id}
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.4, delay: reducedMotion ? 0 : i * 0.08 }}
            className="relative"
          >
            <span
              aria-hidden
              className={cn(
                'absolute left-[-22px] top-3 grid h-4 w-4 place-items-center rounded-full border-2 bg-zinc-950',
                tone.border,
                isActive && tone.glow,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} />
            </span>
            <button
              type="button"
              onClick={() => onSelect(stage.id)}
              className={cn(
                'w-full rounded-lg border bg-zinc-950/60 p-3 text-left transition-colors',
                isActive ? `${tone.border} ${tone.glow}` : 'border-zinc-800 hover:border-zinc-600',
              )}
              aria-expanded={isActive}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-md border',
                    tone.border,
                    tone.bg,
                  )}
                >
                  <Icon className={cn('h-4 w-4', tone.text)} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{stage.title}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider text-zinc-500">
                      {stage.duration}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">{stage.tagline}</p>
                </div>
              </div>
            </button>
          </motion.li>
        )
      })}
    </ol>
  )
}

// ============================================================================
// EXPANDED PANEL — shown when a stage is active
// ============================================================================
function StagePanel({
  stage,
  onClose,
  accent,
}: {
  stage: PipelineStage
  onClose: () => void
  accent: 'cyan' | 'violet' | 'gradient'
}) {
  const tone = PIPELINE_TONES[stage.tone ?? 'cyan']
  const Icon = PIPELINE_ICON_MAP[stage.icon]
  return (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'mt-8 overflow-hidden rounded-xl border bg-gradient-to-br from-zinc-950 to-zinc-900/80 backdrop-blur',
        tone.border,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'grid h-12 w-12 place-items-center rounded-lg border',
              tone.border,
              tone.bg,
            )}
          >
            <Icon className={cn('h-6 w-6', tone.text)} />
          </span>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {stage.duration} · accent {accent}
            </div>
            <h4 className="mt-1 text-xl font-semibold text-white">{stage.title}</h4>
            <p className="mt-1 max-w-2xl text-sm text-zinc-400">{stage.tagline}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-zinc-700 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          aria-label="Close stage"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-3 md:p-6">
        <PanelList
          title="Deliverables"
          items={stage.deliverables}
          tone="cyan"
        />
        <PanelList title="What you do" items={stage.clientDoes} tone="amber" />
        <PanelList title="What Sage does" items={stage.sageDoes} tone="violet" />
      </div>
    </motion.div>
  )
}

function PanelList({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'cyan' | 'violet' | 'amber' | 'emerald'
}) {
  const t = PIPELINE_TONES[tone]
  return (
    <div>
      <div className={cn('text-[10px] font-medium uppercase tracking-[0.18em]', t.text)}>{title}</div>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', t.dot)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
