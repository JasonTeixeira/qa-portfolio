'use client'

import * as React from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'

export interface WorkItem {
  slug: string
  name: string
  category: string
  tags: readonly string[]
  kicker: string
  status?: string
  flagship?: boolean
}

interface WorkPreviewProps {
  flagship: WorkItem
  rest: readonly WorkItem[]
  flagshipImage?: string
}

/**
 * WorkPreview — Engineered Luxury replacement for the v0/neon case-study grid.
 *
 * One full-width flagship spec-card (editorial split, ruled metadata, real
 * screenshot framed by hairlines + corner ticks) over an indexed grid of
 * supporting builds. No neon bloom, no scanlines — depth comes from the
 * surface ramp, hairlines, and registration ticks.
 */
export function WorkPreview({ flagship, rest, flagshipImage }: WorkPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* ── Flagship ── */}
      <Reveal>
        <Link href={`/work/${flagship.slug}`} className="group block">
          <Surface level={2} ticks interactive className="overflow-hidden">
            {/* Top accent hairline — single teal signal */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#0ED3CF] via-[#0ED3CF]/30 to-transparent"
            />
            <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <MonoLabel tone="accent">{`// flagship`}</MonoLabel>
                  <MonoLabel tone="faint">{flagship.category}</MonoLabel>
                </div>

                <h3
                  className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-normal leading-[1.0] tracking-[-0.024em] text-[var(--sage-ink)] transition-colors group-hover:text-[#0ED3CF]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                  }}
                >
                  {flagship.name}
                </h3>

                <p className="mt-4 max-w-prose text-[15px] leading-[1.7] text-[var(--sage-ink-muted)]">
                  {flagship.kicker}
                </p>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {flagship.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
                    open case_studies/{flagship.slug}
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>

              {/* Framed screenshot */}
              <div className="flex items-center">
                <div className="relative w-full overflow-hidden rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-bg)]">
                  <span
                    aria-hidden
                    className="absolute left-3 top-3 z-10 text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                  >
                    fig.01 · interface
                  </span>
                  {flagshipImage ? (

                    <img
                      src={flagshipImage}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      className="aspect-video w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="aspect-video w-full bg-[var(--sage-surface-1)]" />
                  )}
                </div>
              </div>
            </div>
          </Surface>
        </Link>
      </Reveal>

      {/* ── Supporting grid ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((work, i) => (
          <Reveal key={work.slug} delay={i * 0.05}>
            <Link href={`/work/${work.slug}`} className="group block h-full">
              <Surface level={2} interactive className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <MonoLabel tone="accent">{work.category}</MonoLabel>
                  <MonoLabel tone="faint" className="tabular-nums">
                    {String(i + 2).padStart(2, '0')}
                  </MonoLabel>
                </div>

                <h3
                  className="mt-3 text-xl font-normal tracking-[-0.02em] text-[var(--sage-ink)] transition-colors group-hover:text-[#0ED3CF]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {work.name}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
                  {work.kicker}
                </p>

                <Hairline className="mt-5" />
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Surface>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
