'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'
import {
  Section,
  Surface,
  Hairline,
  MonoLabel,
  CtaLink,
  Reveal,
  StatDisplay,
} from '@/components/el'
import { FounderPortrait } from '@/components/founder-portrait'
import { SocialBadges } from '@/components/founder/social-badges'

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  capabilities: string[]
  principles: string[]
}

// ── Data (inlined so we never cross the server/client boundary with JSX) ─────

const experience = [
  {
    index: '01',
    role: 'Founder & Principal',
    company: 'Sage Ideas LLC',
    period: '2024–Present',
    summary:
      'Founded and operate the studio. Engagements span audits, sprints, builds, and operate retainers across fintech, trades tech, edtech, and developer tooling. Every engagement runs on fixed scope, fixed price, with the deliverable artifacts named before kickoff.',
  },
  {
    index: '02',
    role: 'Fintech Engineer',
    company: 'HighStrike',
    period: '2021–2026',
    summary:
      'Built and maintained production trading infrastructure: market data ingestion, real-time pricing systems, portfolio management APIs, and billing integrations. Five years across the full stack on systems that handled production load during volatile sessions.',
  },
]

const education = [
  { degree: 'B.S. Computer Science', school: 'Full Sail University' },
  { degree: 'B.S. Finance', school: 'Kean University' },
]

const certGroups = [
  {
    index: 'A',
    provider: 'ISTQB',
    certs: [
      'Certified Tester Foundation Level (CTFL)',
      'Test Automation Engineer (TAE)',
      'Certified Tester AI Testing (CT-AI)',
    ],
  },
  {
    index: 'B',
    provider: 'Amazon Web Services',
    certs: [
      'Cloud Practitioner',
      'Solutions Architect — Associate',
      'Developer — Associate',
      'SysOps Administrator — Associate',
      'DevOps Engineer — Professional',
    ],
  },
  {
    index: 'C',
    provider: 'Cisco',
    certs: ['CCNA (Routing & Switching)'],
  },
]

const founderStats = [
  { value: '5 yr', label: 'Fintech engineering' },
  { value: '9', label: 'Active certifications' },
  { value: '2', label: 'B.S. degrees' },
  { value: '1', label: 'Person on your build' },
]

const quickFacts = [
  { label: 'Based', value: 'Orlando, Florida', sub: 'Remote-first, U.S. business hours' },
  { label: 'Languages', value: 'English · Portuguese · Spanish', sub: 'Native English; fluent in others' },
  { label: 'Experience', value: '5 yr fintech · 2 yr studio', sub: 'Production systems and operating businesses' },
  {
    label: 'Reach',
    value: 'sage@sageideas.dev',
    sub: 'Replies within 48 business hours',
    email: 'sage@sageideas.dev',
  },
]

const selectedWork = [
  { href: '/work/nexural-ecosystem', label: 'Nexural', sub: 'Fintech platform · 185 tables · 69 APIs' },
  { href: '/work/alphastream', label: 'AlphaStream', sub: 'ML trading signals · 28 models · 7 symbols' },
  { href: '/work', label: 'View all work', sub: '9 case studies across AI, fintech & cloud' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function FounderAnimations({ capabilities, principles }: Props) {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Founder"
        className="relative border-b border-[var(--sage-border)] py-20 sm:py-28 lg:py-36"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Eyebrow row */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT }}
            className="mb-8 flex items-center gap-4"
          >
            <MonoLabel tone="accent" className="tabular-nums">01</MonoLabel>
            <Hairline className="w-16" />
            <MonoLabel tone="muted">// principal</MonoLabel>
            <Hairline className="flex-1" strong />
          </motion.div>

          {/* Two-column layout: copy left, portrait right */}
          <div className="grid gap-16 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-24">
            {/* Left: headline + bio */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay: 0.05 }}
                className="font-normal text-[var(--sage-ink)] leading-[1.02]"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                  letterSpacing: '-0.024em',
                  fontSize: 'clamp(3rem, 2rem + 4vw, 5.5rem)',
                }}
              >
                Jason Teixeira.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.15 }}
                className="mt-6 text-lg leading-[1.75] text-[var(--sage-ink-muted)] sm:text-xl"
              >
                Fintech engineer. Studio founder. The person on every Sage Ideas
                engagement — first call, last commit, signed handoff.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.22 }}
                className="mt-8 space-y-5 text-base leading-[1.75] text-[var(--sage-ink-muted)]"
              >
                <p>
                  Five years inside fintech engineering taught me one thing well: the gap between
                  a product that works in a demo and a product that survives a Stripe webhook
                  retry storm at 2 a.m. is the entire job. Most agencies sell you the demo. The
                  studio that grew out of that experience sells you the part nobody likes
                  building — the idempotency keys, the row-level security, the migrations that
                  don&apos;t lose data, the CI gates that catch the bug before the customer does.
                </p>
                <p>
                  Sage Ideas is one operator by design, not by accident. The person who scopes
                  the work is the person who builds it. There is no offshore bench, no account
                  manager, no &ldquo;lead consultant&rdquo; who disappears after the kickoff.
                  You buy the keyboard. That is the whole proposition.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.30 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <CtaLink href="/book" variant="solid" event="founder_book_cta">
                  Book a call
                </CtaLink>
                <CtaLink href="/contact?source=founder" variant="ghost" event="founder_contact_cta">
                  Send a message
                </CtaLink>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT_QUINT, delay: 0.42 }}
                className="mt-10"
              >
                <SocialBadges />
              </motion.div>
            </div>

            {/* Right: portrait */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay: 0.12 }}
              className="relative lg:sticky lg:top-8"
            >
              <FounderPortrait size="xl" priority />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Quick facts grid ─────────────────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="quick facts"
        heading="The numbers behind the studio."
        ariaLabel="Quick facts"
        grain
      >
        <div className="space-y-12">
          {/* Stats instrument panel */}
          <Reveal>
            <StatDisplay stats={founderStats} columns={4} />
          </Reveal>

          {/* Quick fact cards */}
          <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-4">
            {quickFacts.map((f) => (
              <div key={f.label} className="flex flex-col gap-2 bg-[var(--sage-surface-1)] px-5 py-6">
                <MonoLabel tone="faint" as="p">{f.label}</MonoLabel>
                {f.email ? (
                  <a
                    href={`mailto:${f.email}`}
                    className="text-sm font-medium text-[#0ED3CF] hover:text-[#33EBE8] transition-colors"
                  >
                    {f.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-[var(--sage-ink)]">{f.value}</p>
                )}
                <p className="text-xs text-[var(--sage-ink-faint)]">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── The studio approach ───────────────────────────────────────────────── */}
      <Section
        index="03"
        eyebrow="studio approach"
        heading={
          <>
            Why a one-person studio is the{' '}
            <em style={{ fontStyle: 'italic' }}>offer</em>, not the limitation.
          </>
        }
        lede="Most agencies sell you a lead practitioner on the call and hand the work off the moment the contract signs. Sage Ideas does the opposite."
        ariaLabel="Studio approach"
      >
        <div className="space-y-3 max-w-3xl">
          {principles.map((p, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex items-start gap-5 border-b border-[var(--sage-border)] py-5 last:border-b-0">
                <MonoLabel tone="accent" className="mt-0.5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </MonoLabel>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)] sm:text-base">
                  {p}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── How engagements work ─────────────────────────────────────────────── */}
      <Section
        index="04"
        eyebrow="engagement tracks"
        heading="Two ways to start."
        lede="Nine fixed-price productized tiers for discrete scopes. Custom engagements, retainers, and ongoing care for everything else."
        ariaLabel="Engagement tracks"
        grain
      >
        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
          <Reveal>
            <Surface level={2} ticks interactive className="h-full p-8">
              <MonoLabel tone="accent" as="p" className="mb-5">Track A — Productized</MonoLabel>
              <h3
                className="text-xl font-normal text-[var(--sage-ink)] mb-4"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.015em' }}
              >
                Audit, Sprint, Build, Operate
              </h3>
              <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)] mb-6">
                Nine fixed-price tiers from $750 audits to multi-month builds. Scope is
                named, deliverables are itemized, timelines are written in. Pick a tier,
                sign the SOW, ship.
              </p>
              <CtaLink href="/services" variant="text">See all tiers</CtaLink>
            </Surface>
          </Reveal>
          <Reveal delay={0.08}>
            <Surface level={2} ticks interactive className="h-full p-8">
              <MonoLabel tone="muted" as="p" className="mb-5">Track B — Custom & Care</MonoLabel>
              <h3
                className="text-xl font-normal text-[var(--sage-ink)] mb-4"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.015em' }}
              >
                Retainers, custom packages, ongoing care
              </h3>
              <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)] mb-6">
                When the productized tiers don&apos;t fit, we build a custom engagement. Site
                Care, Brand Care, and Content Care retainers keep work moving month over
                month. Open to bespoke scopes — just ask.
              </p>
              <CtaLink href="/contact" variant="text">Start a conversation</CtaLink>
            </Surface>
          </Reveal>
        </div>
      </Section>

      {/* ── Background / Experience ───────────────────────────────────────────── */}
      <Section
        index="05"
        eyebrow="background"
        heading="The experience register."
        ariaLabel="Professional background"
      >
        <div className="space-y-4 max-w-3xl">
          {experience.map((exp) => (
            <Reveal key={exp.company}>
              <Surface level={2} className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <MonoLabel tone="accent" className="tabular-nums shrink-0">{exp.index}</MonoLabel>
                      <h3
                        className="text-lg font-normal text-[var(--sage-ink)] truncate"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                      >
                        {exp.role}
                      </h3>
                    </div>
                    <MonoLabel tone="muted" as="p">{exp.company}</MonoLabel>
                  </div>
                  <MonoLabel tone="faint" className="shrink-0 tabular-nums">{exp.period}</MonoLabel>
                </div>
                <Hairline className="my-5" />
                <p className="text-sm leading-[1.75] text-[var(--sage-ink-muted)]">{exp.summary}</p>
              </Surface>
            </Reveal>
          ))}
        </div>

        {/* Education */}
        <Reveal delay={0.1} className="mt-10 max-w-3xl">
          <div className="flex items-center gap-4 mb-5">
            <MonoLabel tone="muted">// education</MonoLabel>
            <Hairline className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-3">
            {education.map((edu) => (
              <Surface key={edu.degree} level={2} className="px-5 py-4">
                <p className="text-sm font-medium text-[var(--sage-ink)]">{edu.degree}</p>
                <MonoLabel tone="faint" as="p" className="mt-1">{edu.school}</MonoLabel>
              </Surface>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ── Certifications ────────────────────────────────────────────────────── */}
      <Section
        index="06"
        eyebrow="certifications"
        heading={<>9 active certifications.</>}
        lede="Each one reflects a domain where the studio works. All active and maintained."
        ariaLabel="Certifications"
        grain
      >
        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl">
          {certGroups.map((group) => (
            <Reveal key={group.provider}>
              <Surface level={2} className="p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <MonoLabel tone="accent" className="tabular-nums">{group.index}</MonoLabel>
                  <Hairline className="flex-1" />
                  <MonoLabel tone="muted">{group.provider}</MonoLabel>
                </div>
                <ul className="space-y-3">
                  {group.certs.map((cert) => (
                    <li key={cert} className="flex items-start gap-2.5">
                      <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0ED3CF]" />
                      <span className="text-sm leading-[1.6] text-[var(--sage-ink-muted)]">{cert}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Capabilities ──────────────────────────────────────────────────────── */}
      <Section
        index="07"
        eyebrow="capabilities"
        heading="What lands on every engagement."
        lede="The studio is intentionally narrow on offer surface and broad on capability. Whatever the engagement — audit, sprint, build, or operate — these disciplines are on the table."
        ariaLabel="Capabilities"
      >
        <div className="max-w-3xl">
          {capabilities.map((cap, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex items-start gap-5 border-b border-[var(--sage-border)] py-4 last:border-b-0">
                <MonoLabel tone="faint" className="mt-0.5 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </MonoLabel>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{cap}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Selected work ────────────────────────────────────────────────────── */}
      <Section
        index="08"
        eyebrow="selected work"
        heading="Shipped projects."
        ariaLabel="Selected work"
        grain
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-3 max-w-4xl">
          {selectedWork.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col gap-2 bg-[var(--sage-surface-1)] px-6 py-7 transition-colors hover:bg-[var(--sage-surface-2)]"
            >
              <span
                className="text-base font-normal text-[var(--sage-ink)] group-hover:text-[#0ED3CF] transition-colors"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
              >
                {item.label}
              </span>
              <MonoLabel tone="faint" as="p">{item.sub}</MonoLabel>
              <span
                aria-hidden
                className="mt-2 text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0ED3CF]"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Footer CTA ────────────────────────────────────────────────────────── */}
      <section
        aria-label="Start a conversation"
        className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className="text-2xl font-normal text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
                >
                  Ready to start?
                </h2>
                <p className="mt-2 text-sm text-[var(--sage-ink-muted)]">
                  Send a note or book a 30-minute intro call. Both work.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <CtaLink href="/contact?source=founder-footer" variant="solid" event="founder_footer_contact">
                  Send an inquiry
                </CtaLink>
                <CtaLink href="/book" variant="ghost" event="founder_footer_book">
                  Book a call
                </CtaLink>
                <CtaLink
                  href="https://github.com/JasonTeixeira"
                  variant="text"
                  event="founder_github"
                >
                  GitHub
                </CtaLink>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
