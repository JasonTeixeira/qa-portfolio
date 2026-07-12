"use client"

import { motion } from 'framer-motion'
import { Section, Surface, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
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
    title: 'Diagnose',
    tagline: 'Find the business leak',
    body: 'Find where demand, quote intent, intake, support, or follow-up is leaking. You get the problem, route, and success criteria in plain language.',
    accentColor: '#3D5AFE',
    deliverables: [
      'Buyer problem and revenue leak',
      'Current path versus desired path',
      'Success criteria and constraints',
      'Risk and evidence checklist',
      'Written scope before build',
    ],
  },
  {
    number: '02',
    title: 'Prototype',
    tagline: 'Show the workflow first',
    body: 'Turn the leak into a visual flow a business owner can understand: what comes in, how it is ranked, what action happens next, and what proof is visible.',
    accentColor: '#E85D3A',
    deliverables: [
      'Clickable concept or visual route',
      'Outcome diagram and screen map',
      'CTA and buyer path',
      'Data and integration map',
      'Approval-ready build plan',
    ],
  },
  {
    number: '03',
    title: 'Build',
    tagline: 'Make it real',
    body: 'Build the product layer, data model, integrations, approval controls, dashboards, and tracking needed for the system to operate.',
    accentColor: '#A8C633',
    deliverables: [
      'Production app or page flow',
      'Data capture and routing logic',
      'Approval and handoff states',
      'Analytics and source tracking',
      'Deployment-ready codebase',
    ],
  },
  {
    number: '04',
    title: 'Prove',
    tagline: 'Verify before launch',
    body: 'Capture screenshots, route checks, accessibility results, link checks, and handoff docs so the claim is backed by evidence.',
    accentColor: '#C7236E',
    deliverables: [
      'Desktop and mobile screenshots',
      'CTA and link verification',
      'Accessibility and route smoke checks',
      'Launch notes and handoff docs',
      'Optional ongoing improvement loop',
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
            className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end"
          >
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-4">
                <MonoLabel tone="accent">01</MonoLabel>
                <Hairline className="flex-1" />
                <MonoLabel tone="muted">{'// process'}</MonoLabel>
                <Hairline className="flex-1" strong />
              </div>
              <h1
                className="text-[var(--sage-ink)] font-normal text-[clamp(3rem,1.2rem+5vw,6.2rem)]"
                style={HEADING_STYLE}
              >
                From business leak to{' '}
                <em className="not-italic text-[#3D5AFE]">working system.</em>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
                The process is built for business owners: diagnose what is leaking, show the system visually, build the working route, then prove it before launch.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <CtaLink href="/book?source=process" variant="solid" event="cta_process_hero">
                  Book the build call
                </CtaLink>
                <CtaLink href="/showcase" variant="ghost" arrow={false}>
                  Open live demos
                </CtaLink>
              </div>
            </div>
            <SystemHeroPanel
              eyebrow="process graph"
              title="Build system"
              nodes={STAGES.map((stage) => stage.title)}
              stats={[
                { label: 'stages', value: String(STAGES.length).padStart(2, '0') },
                { label: 'proposal', value: '48h' },
                { label: 'ghost mode', value: '0' },
              ]}
            />
            <div className="lg:col-span-2">
              <MotionProofStrip
                items={[
                  { label: 'diagnose', value: 'leak' },
                  { label: 'prototype', value: 'show' },
                  { label: 'build', value: 'ship' },
                  { label: 'prove', value: 'evidence' },
                ]}
              />
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
          heading={<>Let&apos;s map the<br /><em className="not-italic text-[#3D5AFE]">working version.</em></>}
          lede="The first step is a 30-minute build call. Bring the leak, the workflow, or the business outcome. We map what should be shown and what should be built."
          centered
          grain
          action={
            <CtaLink href="/book?source=process-footer" variant="solid" event="cta_process_footer">
              Book the build call
            </CtaLink>
          }
        />
      </div>
    </div>
  )
}
