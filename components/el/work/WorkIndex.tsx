'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MonoLabel, Reveal } from '@/components/el'
import { type CaseStudy } from '@/data/work/case-studies'

const CATEGORIES = ['All', 'Fintech', 'AI/ML', 'Infrastructure', 'Product', 'DevTools'] as const
type FilterCategory = (typeof CATEGORIES)[number]

interface WorkIndexProps {
  studies: CaseStudy[]
}

type CaseNarrative = {
  leak: string
  system: string
  result: string
  buyer: string
}

const CASE_NARRATIVES: Record<string, CaseNarrative> = {
  nexural: {
    leak: 'A serious trading product needed real data, billing, AI support, and operational controls without a giant team.',
    system: 'A fintech operating platform with database architecture, APIs, realtime surfaces, Discord AI, Stripe, and test gates.',
    result: 'The proof is architectural depth: 185 tables, 69 endpoints, 61 test suites, and billing controls that hold.',
    buyer: 'Best proof for founders who need complex product infrastructure built with discipline.',
  },
  alphastream: {
    leak: 'Most trading signals hide the reasoning, making them hard to trust, audit, or improve.',
    system: 'An explainable ML signal engine with 200+ indicators, ensemble models, backtests, and open-source proof.',
    result: 'The buyer sees a transparent data-to-signal workflow instead of a black-box prediction layer.',
    buyer: 'Best proof for analytics, AI, and data-heavy products where trust depends on visibility.',
  },
  jobpoise: {
    leak: 'Job seekers needed tailored applications without fabricated claims, generic letters, or lost follow-ups.',
    system: 'A job application copilot with citation-grounded generation, Chrome extension workflow, Gmail tracking, and billing.',
    result: 'A full product surface shows how AI can support a real workflow without pretending it knows more than the user gave it.',
    buyer: 'Best proof for AI products that need guardrails, workflow integration, and payment-ready packaging.',
  },
  trayd: {
    leak: 'Trades businesses lose jobs when quote intent, urgency, language, and scheduling handoffs are scattered.',
    system: 'A bilingual trades workflow that captures intent, qualifies the job, routes urgency, and hands off to the operator.',
    result: 'The business can see which quote requests deserve attention first and what action comes next.',
    buyer: 'Best proof for local service businesses that need lead qualification and follow-up systems.',
  },
  'aws-landing-zone': {
    leak: 'Cloud growth gets risky when accounts, permissions, networks, and environments are created without a repeatable foundation.',
    system: 'A landing-zone pattern that makes environments, identity, network boundaries, and deployment rules visible.',
    result: 'The proof is not decoration. It is an operating foundation that reduces surprise and makes scaling safer.',
    buyer: 'Best proof for teams that need infrastructure discipline before growth makes the mess expensive.',
  },
  'quality-telemetry': {
    leak: 'Teams ship blind when tests, performance, accessibility, and release quality live in separate tools.',
    system: 'A quality telemetry layer that turns test runs, Lighthouse, defects, and release signals into one evidence board.',
    result: 'The buyer sees where quality is slipping before customers or stakeholders discover it.',
    buyer: 'Best proof for software teams that need release confidence and visible quality gates.',
  },
  'brand-sprint-rebuild': {
    leak: 'A brand can look polished and still fail because the offer, proof, and buyer path are not obvious.',
    system: 'A rebuild sprint that connects positioning, page structure, proof assets, and conversion CTAs.',
    result: 'The site stops asking buyers to guess and starts showing what changes for them.',
    buyer: 'Best proof for businesses that need a better website to sell a sharper offer.',
  },
  'site-care-retainer': {
    leak: 'Websites decay when updates, checks, content, and conversion issues wait until something breaks.',
    system: 'A care operating rhythm for updates, fixes, content, measurement, and issue routing.',
    result: 'The buyer gets a living site with visible maintenance, not an abandoned launch artifact.',
    buyer: 'Best proof for businesses that need their site to keep improving after launch.',
  },
}

function narrativeFor(study: CaseStudy): CaseNarrative {
  return (
    CASE_NARRATIVES[study.slug] ?? {
      leak: study.problem[0] ?? study.tagline,
      system: study.approach[0] ?? study.tagline,
      result: study.outcome[0] ?? study.kicker,
      buyer: study.tagline,
    }
  )
}

function cleanTitle(study: CaseStudy) {
  return study.title.split('—')[0].trim()
}

function PremiumArrow() {
  return (
    <span
      aria-hidden
      className="grid size-8 place-items-center rounded-full bg-white/[0.07] text-current transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:bg-white/[0.13]"
    >
      →
    </span>
  )
}

function CaseFlow({ narrative }: { narrative: CaseNarrative }) {
  return (
    <div aria-label="before system result proof flow" className="grid gap-2 sm:grid-cols-3">
      {[
        ['Leak', narrative.leak],
        ['System', narrative.system],
        ['Result', narrative.result],
      ].map(([label, body]) => (
        <div key={label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bcd2ff]">{label}</p>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-[var(--sage-ink-muted)]">{body}</p>
        </div>
      ))}
    </div>
  )
}

function CaseCard({ study, index, featured = false }: { study: CaseStudy; index: number; featured?: boolean }) {
  const narrative = narrativeFor(study)
  const metrics = study.metrics.slice(0, featured ? 4 : 3)

  return (
    <Reveal delay={Math.min(index * 0.04, 0.28)} className="h-full">
      <article
        className={`group relative h-full overflow-hidden rounded-[2rem] border p-1.5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          featured
            ? 'border-[#8da5ff]/35 bg-[#3D5AFE]/10 shadow-[0_0_80px_rgba(61,90,254,0.16)]'
            : 'border-white/10 bg-white/[0.035] hover:border-[#8da5ff]/24'
        }`}
      >
        <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] border border-white/[0.07] bg-[#07080d]/95 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#bcd2ff]">
                {String(index + 1).padStart(2, '0')} / {study.category}
              </p>
              <h3
                className={`mt-4 max-w-[12ch] font-normal leading-[0.92] tracking-[-0.045em] text-[var(--sage-ink)] ${
                  featured ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {cleanTitle(study)}
              </h3>
            </div>
            {study.cardMetric ? (
              <span className="rounded-full border border-[#8da5ff]/25 bg-[#3D5AFE]/12 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#dce6ff]">
                {study.cardMetric}
              </span>
            ) : null}
          </div>

          {study.heroImage ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-black/30">
              <Image
                src={study.heroImage}
                alt={`${cleanTitle(study)} product proof screenshot`}
                width={1200}
                height={675}
                sizes={featured ? '(max-width: 1024px) 100vw, 52vw' : '(max-width: 1024px) 100vw, 33vw'}
                className="aspect-video w-full object-cover opacity-88 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.025] group-hover:opacity-100"
              />
            </div>
          ) : null}

          <p className="mt-6 text-base leading-7 text-[var(--sage-ink-muted)]">{narrative.buyer}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
                <p className="text-2xl font-semibold tracking-[-0.03em] text-[#5f96ff]">{metric.value}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--sage-ink-faint)]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>

          {featured ? (
            <div className="mt-6">
              <CaseFlow narrative={narrative} />
            </div>
          ) : null}

          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <Link
              href={`/work/${study.slug}`}
              className="group/btn inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-[#f4f7ff] px-5 py-2.5 text-sm font-semibold text-[#05070d] shadow-[0_0_42px_rgba(61,90,254,0.24)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98]"
            >
              <span>Open proof</span>
              <span className="grid size-8 place-items-center rounded-full bg-black/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5">
                →
              </span>
            </Link>
            <Link
              href={`/book?source=work_${study.slug}`}
              className="group/btn inline-flex min-h-12 items-center justify-between gap-3 rounded-full border border-white/12 bg-white/[0.035] px-5 py-2.5 text-sm font-semibold text-[var(--sage-ink)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/22 hover:bg-white/[0.06] active:scale-[0.98]"
            >
              <span>Build around this</span>
              <PremiumArrow />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function WorkIndex({ studies }: WorkIndexProps) {
  const [active, setActive] = React.useState<FilterCategory>('All')
  const filtered = active === 'All' ? studies : studies.filter((s) => s.category === active)
  const flagship = filtered[0]
  const remaining = filtered.slice(1)

  return (
    <div className="space-y-10">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-1.5">
        <div className="rounded-[calc(2rem-0.375rem)] border border-white/[0.07] bg-[#07080d]/92 p-5 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <MonoLabel tone="accent">Proof library</MonoLabel>
              <h2
                className="mt-4 max-w-[10ch] text-5xl font-normal leading-[0.92] tracking-[-0.045em] text-[var(--sage-ink)] sm:text-6xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Choose the proof closest to your business.
              </h2>
            </div>
            <div>
              <p className="max-w-2xl text-base leading-7 text-[var(--sage-ink-muted)]">
                Each case is organized around what a buyer needs to know: what was leaking, what system was built, what
                proof exists, and what kind of build it points to next.
              </p>
              <div
                role="tablist"
                aria-label="Filter case studies by category"
                className="mt-6 flex flex-wrap gap-2"
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
                      className={`min-h-11 rounded-full border px-4 text-[11px] uppercase tracking-[0.16em] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] [font-family:var(--font-mono),ui-monospace,monospace] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/60 ${
                        isActive
                          ? 'border-[#8da5ff]/40 bg-[#3D5AFE]/18 text-[#dce6ff]'
                          : 'border-white/10 text-[var(--sage-ink-faint)] hover:border-white/20 hover:text-[var(--sage-ink-muted)]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {flagship ? <CaseCard study={flagship} index={0} featured /> : null}

      {remaining.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {remaining.map((study, index) => (
            <CaseCard key={study.slug} study={study} index={index + 1} />
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center text-sm text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
          {'// no case studies in this category'}
        </p>
      ) : null}
    </div>
  )
}
