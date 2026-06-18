'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Surface, MonoLabel, Hairline, Reveal } from '@/components/el'
import { type CaseStudy } from '@/data/work/case-studies'

const CATEGORIES = ['All', 'Fintech', 'AI/ML', 'Infrastructure', 'Product', 'DevTools'] as const
type FilterCategory = (typeof CATEGORIES)[number]

interface WorkIndexProps {
  studies: CaseStudy[]
}

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
}

/**
 * WorkIndex — the Engineered Luxury index of case studies.
 *
 * A ruled, editorial register: one full-bleed flagship spec-card over an
 * indexed ledger of every remaining build. Mono category filter, hairline
 * framing, registration ticks, real one-line metrics. Depth comes from the
 * surface ramp + hairlines, never neon bloom or glass.
 */
export function WorkIndex({ studies }: WorkIndexProps) {
  const [active, setActive] = React.useState<FilterCategory>('All')

  const filtered = active === 'All' ? studies : studies.filter((s) => s.category === active)

  // Flagship is the first matching study; the rest form the ledger.
  const flagship = filtered[0]
  const ledger = filtered.slice(1)

  return (
    <div className="flex flex-col gap-10">
      {/* ── Filter rail ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <MonoLabel tone="muted">{`// filter`}</MonoLabel>
          <Hairline className="flex-1" />
          <MonoLabel tone="faint" className="tabular-nums">
            {String(filtered.length).padStart(2, '0')} / {String(studies.length).padStart(2, '0')}
          </MonoLabel>
        </div>
        <div
          role="tablist"
          aria-label="Filter case studies by category"
          className="flex flex-wrap gap-2"
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(cat)}
                className={`min-h-[40px] rounded-[3px] border px-4 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/60 ${
                  isActive
                    ? 'border-[#3D5AFE] bg-[#3D5AFE]/10 text-[#3D5AFE]'
                    : 'border-[var(--sage-border)] text-[var(--sage-ink-faint)] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink-muted)]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Flagship spec-card ── */}
      {flagship && (
        <Reveal>
          <Link href={`/work/${flagship.slug}`} className="group block">
            <Surface level={2} ticks interactive className="overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[#3D5AFE] via-[#3D5AFE]/30 to-transparent"
              />
              <div className="grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <MonoLabel tone="accent">{`// flagship`}</MonoLabel>
                    <MonoLabel tone="faint">{flagship.category}</MonoLabel>
                  </div>

                  <h3
                    className="mt-4 text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-normal leading-[1.0] tracking-[-0.024em] text-[var(--sage-ink)] transition-colors group-hover:text-[#3D5AFE]"
                    style={DISPLAY_STYLE}
                  >
                    {flagship.posterTitle ?? flagship.title}
                  </h3>

                  <p className="mt-4 max-w-prose text-[15px] leading-[1.7] text-[var(--sage-ink-muted)]">
                    {flagship.kicker}
                  </p>

                  {/* Top metrics as a ruled mono strip */}
                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                    {flagship.metrics.slice(0, 3).map((m) => (
                      <div key={m.label} className="flex flex-col gap-1">
                        <dt className="text-[clamp(1.25rem,1rem+1vw,1.65rem)] leading-none tabular-nums text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {m.value}
                        </dt>
                        <dd className="text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {m.label}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Hairline className="mt-7" />
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {flagship.tags.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-8">
                    <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
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

                {/* Framed hero image */}
                <div className="flex items-center">
                  <div className="relative w-full overflow-hidden rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-bg)]">
                    <span
                      aria-hidden
                      className="absolute left-3 top-3 z-10 text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                    >
                      fig.01 · {flagship.slug}
                    </span>
                    {flagship.heroImage ? (
                      <Image
                        src={flagship.heroImage}
                        alt=""
                        aria-hidden
                        width={960}
                        height={540}
                        sizes="(max-width: 1024px) 100vw, 40vw"
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
      )}

      {/* ── Ledger of remaining builds ── */}
      {ledger.length > 0 && (
        <div>
          <div className="mb-5 flex items-center gap-4">
            <MonoLabel tone="muted">{`// register`}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>

          {/* Indexed ruled rows — editorial register, not a uniform card grid */}
          <ul className="m-0 list-none border-t border-[var(--sage-border)] p-0">
            {ledger.map((study, i) => (
              <li key={study.slug}>
                <Reveal delay={Math.min(i * 0.04, 0.3)}>
                  <Link
                    href={`/work/${study.slug}`}
                    className="group grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-2 border-b border-[var(--sage-border)] py-6 transition-colors hover:bg-[var(--sage-surface-1)] sm:grid-cols-[3rem_1.4fr_1fr_auto] sm:items-center sm:gap-x-8 sm:py-7"
                  >
                    {/* Index */}
                    <span className="pt-1 text-[11px] tabular-nums text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace] sm:pt-0">
                      {String(i + 2).padStart(2, '0')}
                    </span>

                    {/* Title + category */}
                    <div className="min-w-0">
                      <MonoLabel tone="accent" className="block">
                        {study.category}
                      </MonoLabel>
                      <h3
                        className="mt-1.5 text-xl font-normal leading-tight tracking-[-0.02em] text-[var(--sage-ink)] transition-colors group-hover:text-[#3D5AFE] sm:text-2xl"
                        style={DISPLAY_STYLE}
                      >
                        {study.title.split('—')[0].trim()}
                      </h3>
                    </div>

                    {/* Kicker + tags */}
                    <div className="col-start-2 min-w-0 sm:col-start-auto">
                      <p className="text-sm leading-[1.55] text-[var(--sage-ink-muted)]">
                        {study.kicker}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {study.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card metric + arrow */}
                    <div className="col-start-2 flex items-center justify-between gap-4 sm:col-start-auto sm:justify-end">
                      {study.cardMetric && (
                        <span className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {study.cardMetric}
                        </span>
                      )}
                      <span
                        aria-hidden
                        className="text-[var(--sage-ink-faint)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#3D5AFE]"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
          {'// no case studies in this category'}
        </p>
      )}
    </div>
  )
}
