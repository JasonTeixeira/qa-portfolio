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

// ── Data ─────────────────────────────────────────────────────────────────────

const pillars = [
  {
    index: '01',
    title: 'We build what we operate',
    description:
      'Every service offering at Sage Ideas is something we use ourselves. The infrastructure patterns we sell are the same ones running our own products. The AI workflows we build for clients are the same ones powering our lab. We don’t pitch theory — we ship proof.',
  },
  {
    index: '02',
    title: 'AI-native by default',
    description:
      'We don’t bolt AI onto existing workflows. We design systems where AI acceleration is assumed from day one — in code generation, in testing, in content pipelines, in customer-facing features. This isn’t a trend we adopted; it’s how we’ve built since 2024.',
  },
  {
    index: '03',
    title: 'Solo studio, agency rigor',
    description:
      'One person running a production-grade process: CI/CD gates, contract testing, Lighthouse budgets, accessibility audits, security scans, idempotent webhooks, RLS policies, SOC2-aware architecture. The output is indistinguishable from a five-person agency, shipped on a solo timeline.',
  },
]

const nonServices = [
  'Enterprise sales engagements (six-month procurement cycles, vendor panels)',
  'Agencies-of-agencies (no subcontracting the work to another team)',
  'Design-only engagements (brand decks, mockups without implementation)',
  'Native mobile-first builds (iOS/Android apps as the primary deliverable)',
  'Support-only retainers (helpdesk, ticketing, on-call without a build component)',
]

// Every value here must be true + verifiable (honesty guardrail).
// Live products: see /work. Public repos: github.com/JasonTeixeira (130+ today).
// Shipping since: GitHub account opened 2020. Certs: see /founder.
const metrics = [
  { value: '6', label: 'Live products' },
  { value: '130+', label: 'Public repos' },
  { value: '2020', label: 'Shipping since' },
  { value: '9', label: 'Active certs' },
]

const stackCategories = [
  { label: 'Frontend', items: 'Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Framer Motion' },
  { label: 'Backend', items: 'FastAPI, Python, Node.js' },
  { label: 'Data', items: 'PostgreSQL, Supabase, DynamoDB, S3' },
  { label: 'Infrastructure', items: 'AWS (Lambda, ECS, SES, DynamoDB, S3, CloudFront), Terraform, GitHub OIDC' },
  { label: 'AI/ML', items: 'OpenAI API, Anthropic Claude, XGBoost, LightGBM, scikit-learn, LangChain' },
  { label: 'Testing', items: 'Playwright, Jest, Vitest, Testing Library, Supertest, Pact, k6, Lighthouse CI, OWASP ZAP, Axe' },
]

const values = [
  {
    index: '01',
    title: 'Ship over present.',
    body: 'We prefer working software over polished decks. Every engagement ends with deployed, tested code — not a recommendations document.',
  },
  {
    index: '02',
    title: 'Evidence over assertion.',
    body: "We don't claim quality. We document it. Test suites, Lighthouse scores, CI gates, cert verifications — the evidence is always available.",
  },
  {
    index: '03',
    title: 'Fixed scope, honest price.',
    body: "We've seen what scope ambiguity does to client relationships. Every engagement has a scope document. The price in the proposal is the price you pay.",
  },
  {
    index: '04',
    title: 'Build to last.',
    body: "We build systems we'd be comfortable maintaining in two years. TypeScript strict mode, documented architecture decisions, runbooks for failure modes.",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function StudioAnimations() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        aria-label="The Studio"
        className="relative border-b border-[var(--sage-border)] py-20 sm:py-28 lg:py-36"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT }}
            className="mb-8 flex items-center gap-4"
          >
            <MonoLabel tone="accent" className="tabular-nums">01</MonoLabel>
            <Hairline className="w-16" />
            <MonoLabel tone="muted">{'// about the studio'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay: 0.05 }}
            className="font-normal text-[var(--sage-ink)] leading-[1.02] max-w-3xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
              letterSpacing: '-0.024em',
              fontSize: 'clamp(2.5rem, 1.5rem + 4vw, 5rem)',
            }}
          >
            The studio.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.12 }}
            className="mt-8 max-w-3xl space-y-5 text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg"
          >
            <p className="text-xl text-[var(--sage-ink-muted)] font-normal">
              One engineer. One LLC. Years of compounded decisions and shipped systems.
            </p>
            <p>
              Sage Ideas LLC was founded in 2024 with a specific thesis: that the right process,
              the right infrastructure, and AI-native development practices allow a single
              practitioner to build and ship software at a quality level that matches a small
              agency — with the added benefit of direct accountability.
            </p>
            <p>
              Before the studio, Jason Teixeira spent five years as a fintech engineer at
              HighStrike (2021–2026) — building trading infrastructure, market data systems, and
              real-time financial applications that handled production load. That&apos;s where
              the engineering discipline came from: systems that don&apos;t fail on a volatile
              trading day demand a level of rigor that carries over into everything since.
            </p>
            <p className="text-[var(--sage-ink-faint)]">
              The studio operates out of Orlando, FL. Remote-first by default.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Metrics panel ─────────────────────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="receipts"
        heading="Numbers don't lie."
        ariaLabel="Studio metrics"
        grain
      >
        <Reveal>
          <StatDisplay stats={metrics} columns={4} />
        </Reveal>
      </Section>

      {/* ── Pillars ────────────────────────────────────────────────────────────── */}
      <Section
        index="03"
        eyebrow="pillars"
        heading="How we think about the work."
        ariaLabel="Studio pillars"
      >
        <div className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
          {pillars.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08}>
              <Surface level={i % 2 === 0 ? 1 : 2} bordered={false} className="px-7 py-8">
                <div className="grid gap-6 lg:grid-cols-[80px_1fr]">
                  <div className="flex lg:flex-col gap-3 items-start">
                    <MonoLabel tone="accent" className="tabular-nums text-lg">{pillar.index}</MonoLabel>
                    <Hairline className="hidden lg:block w-8 mt-2" />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-normal text-[var(--sage-ink)] mb-4"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.015em' }}
                    >
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-[1.75] text-[var(--sage-ink-muted)] max-w-2xl">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </Surface>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── How the studio works ─────────────────────────────────────────────── */}
      <Section
        index="04"
        eyebrow="engagement model"
        heading="How the studio works."
        ariaLabel="Engagement model"
        grain
      >
        <div className="max-w-3xl space-y-6 text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
          <Reveal>
            <p>
              Clients work with Jason directly — not an account manager, not a project
              coordinator, not a handoff to a handoff team after the sales call. The same person
              who scoped the project is the person building it. That accountability is structural,
              not a feature we sell.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p>
              Every engagement follows the same methodology: Discover → Architect → Build →
              Operate. The scope is defined in writing before work begins. The price in the
              proposal is the price you pay — no &quot;starting from,&quot; no surprise overages.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p>
              Engagements are productized by tier: Audit ($1,500), Ship (from $5,000), Automate
              (from $8,000), Build (from $25,000), Scale, and Operate. Each tier has a defined
              scope and defined deliverables. You know what you&apos;re getting before you sign
              anything.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <p>
              Larger agencies have their place — complex team coordination, ongoing managed
              services at scale, 24/7 support organizations. For discrete software products, AI
              workflows, and infrastructure architecture, a studio of one with the right process
              is faster, more accountable, and more consistent.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ── Values ────────────────────────────────────────────────────────────── */}
      <Section
        index="05"
        eyebrow="values"
        heading="The values, plainly stated."
        ariaLabel="Studio values"
      >
        <div className="grid gap-4 sm:grid-cols-2 max-w-4xl">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.07}>
              <Surface level={2} className="h-full p-7">
                <div className="flex items-center gap-3 mb-5">
                  <MonoLabel tone="accent" className="tabular-nums">{v.index}</MonoLabel>
                  <Hairline className="flex-1" />
                </div>
                <h3
                  className="text-lg font-normal text-[var(--sage-ink)] mb-3"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                >
                  {v.title}
                </h3>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{v.body}</p>
              </Surface>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── What we don't do ──────────────────────────────────────────────────── */}
      <Section
        index="06"
        eyebrow="scope limits"
        heading={
          <>
            What we don&apos;t do.
          </>
        }
        lede="Self-qualification matters. These are honest limits — not failures, just not the right fit for this studio."
        ariaLabel="Scope limits"
        grain
      >
        <div className="max-w-3xl space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
          {nonServices.map((item, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="flex items-start gap-5 bg-[var(--sage-surface-1)] px-6 py-5">
                <span aria-hidden className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sage-border-strong)]" />
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── The stack ─────────────────────────────────────────────────────────── */}
      <Section
        index="07"
        eyebrow="stack"
        heading="The stack."
        lede="Full stack from UI to infrastructure. Every layer chosen for production reliability, not demo convenience."
        ariaLabel="Tech stack"
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {stackCategories.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 0.05}>
              <div className="bg-[var(--sage-surface-1)] px-6 py-7 h-full">
                <MonoLabel tone="accent" as="p" className="mb-3">{cat.label}</MonoLabel>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{cat.items}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-6">
          <CtaLink href="/stack" variant="text">See the full stack reference</CtaLink>
        </Reveal>
      </Section>

      {/* ── Footer CTA ────────────────────────────────────────────────────────── */}
      <section
        aria-label="Studio footer CTA"
        className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap gap-4 items-center">
              <CtaLink href="/founder" variant="solid" event="studio_founder_cta">
                Read the founder story
              </CtaLink>
              <CtaLink href="/work" variant="ghost" event="studio_work_cta">
                See the work
              </CtaLink>
              <CtaLink href="/services" variant="text" event="studio_services_cta">
                View all tiers
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
