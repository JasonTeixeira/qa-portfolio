"use client"

import { motion } from 'framer-motion'
import { Section, Surface, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

interface Stage {
  number: string
  title: string
  tagline: string
  body: string
  accentColor: string
  deliverables: string[]
}

const STAGES: Stage[] = [
  {
    number: '01',
    title: 'Discover',
    tagline: 'Map the problem space',
    body: 'Map the problem, define scope, agree on outcomes before code. You get a scope document, not a sales pitch.',
    accentColor: '#0ED3CF',
    deliverables: [
      'Problem statement & success criteria',
      'Stakeholder alignment doc',
      'Scoped feature set (in / out of bounds)',
      'Technical risk register',
      'Signed scope document',
    ],
  },
  {
    number: '02',
    title: 'Architect',
    tagline: 'Design before you build',
    body: 'System design, stack confirmation, data models, API contracts. We show you what we build before we build it.',
    accentColor: '#E85D3A',
    deliverables: [
      'Architecture decision records (ADRs)',
      'Entity-relationship diagram',
      'API contract (OpenAPI / tRPC)',
      'Infrastructure topology diagram',
      'Component & data-flow diagrams',
    ],
  },
  {
    number: '03',
    title: 'Build',
    tagline: 'Production-grade from day one',
    body: 'Production-grade implementation with CI gates, typed code, test coverage, and weekly progress updates. No ghost-mode.',
    accentColor: '#A8C633',
    deliverables: [
      'TypeScript codebase with strict config',
      'CI/CD pipeline (lint → test → deploy)',
      '≥80% test coverage on critical paths',
      'Weekly Loom progress updates',
      'Private repo with commit history',
    ],
  },
  {
    number: '04',
    title: 'Operate',
    tagline: 'Ship and stay accountable',
    body: "Deployment, monitoring, documentation, handoff — or ongoing fractional support. We don't ship and disappear.",
    accentColor: '#C7236E',
    deliverables: [
      'Production deployment & DNS config',
      'Observability stack (logs, metrics, alerts)',
      'Runbook & ops documentation',
      '60-day bug warranty post-launch',
      'Optional: fractional on-call retainer',
    ],
  },
]

export function ProcessContent() {
  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label="Process overview"
        className="relative pt-28 pb-16 sm:pt-32 lg:pt-36 border-b border-[var(--sage-border)]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
            className="max-w-3xl"
          >
            <div className="mb-7 flex items-center gap-4">
              <MonoLabel tone="accent">01</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// process'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>
            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
              style={HEADING_STYLE}
            >
              Four stages.{' '}
              <em className="not-italic text-[#0ED3CF]">No ghost-mode.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
              Every Sage Ideas engagement runs the same four-stage process regardless of scope. You always know where we are, what was decided, and what ships next.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href="/contact" variant="solid" event="cta_process_hero">
                Book a free intro chat
              </CtaLink>
              <CtaLink href="/how-it-works" variant="ghost" arrow={false}>
                See service pipelines
              </CtaLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stages */}
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pb-24">
        <div className="relative py-16 sm:py-20">
          {/* Vertical spine */}
          <div
            aria-hidden
            className="absolute left-[calc(2.5rem)] top-0 bottom-0 w-px bg-[var(--sage-border)] hidden sm:block"
          />

          <div className="space-y-0">
            {STAGES.map((stage, i) => (
              <Reveal key={stage.number} delay={i * 0.08}>
                <article
                  className="relative grid sm:grid-cols-[5rem_1fr] gap-6 py-10 border-b border-[var(--sage-border)] last:border-0"
                  aria-label={`Stage ${stage.number}: ${stage.title}`}
                >
                  {/* Stage number + dot */}
                  <div className="hidden sm:flex flex-col items-center gap-2 pt-1">
                    <div
                      className="relative z-10 w-5 h-5 rounded-full border-2 bg-[var(--sage-bg)]"
                      style={{ borderColor: stage.accentColor }}
                    />
                    <MonoLabel
                      tone="faint"
                      className="tabular-nums"
                      style={{ color: stage.accentColor }}
                    >
                      {stage.number}
                    </MonoLabel>
                  </div>

                  {/* Content */}
                  <div>
                    {/* Mobile stage number */}
                    <div className="flex items-center gap-3 mb-4 sm:hidden">
                      <div
                        className="w-5 h-5 rounded-full border-2 bg-[var(--sage-bg)] shrink-0"
                        style={{ borderColor: stage.accentColor }}
                        aria-hidden
                      />
                      <MonoLabel tone="faint" style={{ color: stage.accentColor }}>
                        {stage.number}
                      </MonoLabel>
                    </div>

                    <MonoLabel tone="muted" as="p" className="mb-2">
                      {stage.tagline}
                    </MonoLabel>
                    <h2
                      className="text-[clamp(1.6rem,1rem+2vw,2.5rem)] font-normal text-[var(--sage-ink)] mb-4"
                      style={{ ...HEADING_STYLE, color: stage.accentColor }}
                    >
                      {stage.title}
                    </h2>
                    <p className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] mb-6 max-w-xl">
                      {stage.body}
                    </p>

                    {/* Deliverables */}
                    <Surface level={2} className="p-5">
                      <MonoLabel tone="faint" as="p" className="mb-3">
                        {'// deliverables'}
                      </MonoLabel>
                      <ul className="space-y-2">
                        {stage.deliverables.map((d) => (
                          <li key={d} className="flex items-start gap-2.5 text-sm text-[var(--sage-ink-muted)]">
                            <span
                              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: stage.accentColor }}
                              aria-hidden
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </Surface>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Section
          eyebrow="ready to start"
          heading={<>Let&apos;s map your<br /><em className="not-italic text-[#0ED3CF]">scope together.</em></>}
          lede="The first step is a free 20-minute intro chat. No pitch, no obligation — just an honest scope and fit check."
          centered
          grain
          action={
            <CtaLink href="/contact" variant="solid" event="cta_process_footer">
              Book a free intro chat
            </CtaLink>
          }
        />
      </div>
    </div>
  )
}
