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
import { ReferenceRoster } from '@/components/el/home/ReferenceRoster'
import { references, trustedBy } from '@/data/references'

// ── Data ─────────────────────────────────────────────────────────────────────

const navSections = [
  { id: 'certifications', label: 'Certifications' },
  { id: 'quality', label: 'Code Quality' },
  { id: 'testing', label: 'Testing' },
  { id: 'cicd', label: 'CI/CD' },
  { id: 'infra', label: 'Infrastructure' },
  { id: 'data-handling', label: 'Data Handling' },
  { id: 'guarantees', label: 'Guarantees' },
  { id: 'honesty', label: 'Wrong fit?' },
  { id: 'oss', label: 'Open Source' },
  { id: 'references', label: 'References' },
]

const trustReceipts = [
  { metric: 'Reply window', value: '< 48h', detail: "Well-matched inquiries get a response within two business days. No \"I'll get back to you\" ghosting." },
  { metric: 'NDA on request', value: 'Same day', detail: 'Mutual NDA available before scope discussion. Template at /legal/nda — sign electronically, no lawyer required.' },
  { metric: 'Production posture', value: 'Stripe + Supabase + AWS', detail: 'Same stack we ship for clients. Daily encrypted backups, IAM-scoped access, OIDC-only deploys.' },
  { metric: 'Code transparency', value: 'Public repo', detail: "This site’s source is open. Every commit is auditable history of how the studio actually operates." },
]

const certifications = [
  { provider: 'ISTQB', name: 'Certified Tester Foundation Level (CTFL)', tag: 'testing' },
  { provider: 'ISTQB', name: 'Test Automation Engineer (TAE)', tag: 'testing' },
  { provider: 'ISTQB', name: 'Certified Tester AI Testing (CT-AI)', tag: 'testing' },
  { provider: 'AWS', name: 'Certified Cloud Practitioner', tag: 'cloud' },
  { provider: 'AWS', name: 'Certified Solutions Architect — Associate', tag: 'cloud' },
  { provider: 'AWS', name: 'Certified Developer — Associate', tag: 'cloud' },
  { provider: 'AWS', name: 'Certified SysOps Administrator — Associate', tag: 'cloud' },
  { provider: 'AWS', name: 'Certified DevOps Engineer — Professional', tag: 'cloud' },
  { provider: 'Cisco', name: 'CCNA (Routing & Switching)', tag: 'networking' },
]

const TAG_TONE: Record<string, string> = {
  testing: 'text-[#0ED3CF]',
  cloud: 'text-[var(--sage-ink-muted)]',
  networking: 'text-[var(--sage-ink-faint)]',
}

const codeQualityStandards = [
  'TypeScript strict mode (no implicit any, no unchecked returns)',
  'ESLint + Prettier configured and enforced in CI',
  'Husky pre-commit hooks (lint, type-check, test)',
  'Minimum test coverage: 60% line coverage enforced by CI gate',
  'All external API calls have error handling and retry logic',
  'No hardcoded secrets — all credentials via environment variables or AWS Secrets Manager',
  'Dependency audits: npm audit / pip audit in CI, no known critical vulnerabilities shipped',
]

const testingFrameworks = [
  { layer: 'Unit', frameworks: 'Jest, Vitest' },
  { layer: 'Component', frameworks: 'Testing Library' },
  { layer: 'API', frameworks: 'Supertest' },
  { layer: 'Contract', frameworks: 'Pact' },
  { layer: 'E2E', frameworks: 'Playwright, Cypress' },
  { layer: 'Performance', frameworks: 'k6, Lighthouse CI' },
  { layer: 'Security', frameworks: 'OWASP ZAP' },
  { layer: 'Accessibility', frameworks: 'Axe' },
  { layer: 'Visual regression', frameworks: 'Percy / Chromatic' },
  { layer: 'BDD', frameworks: 'Cucumber' },
]

const cicdStandards = [
  'TypeScript type check — every PR',
  'ESLint (zero warnings policy)',
  'Full unit test suite',
  'Build verification',
  'E2E smoke test',
  'Security scan (OWASP ZAP on deployment pipelines)',
  'Lighthouse CI performance budget check',
  'GitHub Actions for all CI/CD',
  'Environment segregation: dev / staging / production',
  'GitHub OIDC for AWS deployments (no long-lived credentials)',
  'Rollback capability on all production deployments',
]

const infraStandards = [
  'VPC with public/private subnet architecture',
  'S3 + CloudFront for static assets (no public bucket access)',
  'Lambda + API Gateway for serverless workloads',
  'GitHub OIDC for CI/CD authentication (no IAM user keys)',
  'AWS Secrets Manager for credential management',
  'CloudTrail + Security Hub enabled by default',
  'tfsec + checkov security scanning on all Terraform PRs',
]

const dataHandling = [
  {
    label: 'Where data lives',
    body: 'Customer data lives in Supabase (Postgres, US-East-2) and Stripe. No analytics platform stores PII beyond hashed identifiers — Vercel Analytics is privacy-first by design.',
  },
  {
    label: 'Retention',
    body: 'Inquiry records: kept for two years from last contact, then auto-purged. Engagement artifacts: kept for the duration of the engagement plus 12 months unless an MSA specifies longer.',
  },
  {
    label: 'Access',
    body: 'Service-role keys are server-side only. Row-level security on every customer-facing table. No third-party support seat has read access to customer data — the studio is one operator.',
  },
  {
    label: 'Sub-processors',
    body: 'Vercel (hosting/CDN), Supabase (database & auth), Stripe (payments), Resend (transactional email), AWS (infrastructure for client work). Full list maintained on /legal/privacy.',
  },
  {
    label: 'Incident response',
    body: 'Security incidents are disclosed to affected clients within 72 hours. Post-incident report includes root cause, blast radius, and remediation steps — no PR-spin.',
  },
  {
    label: 'Right to delete',
    body: 'Email sage@sageideas.dev with a deletion request and your records are purged within five business days, including downstream caches and backups in the next rotation.',
  },
]

const guarantees = [
  {
    title: 'Fixed price means fixed price',
    body: 'Quoted scope is what you pay. Scope changes require a written amendment and explicit approval before any additional work begins. No surprise invoices, ever.',
  },
  {
    title: 'Refund before work begins',
    body: "If we haven't started, we issue a full refund. No questions, no friction. Once work begins, one-time engagements are non-refundable but always negotiable on outcome.",
  },
  {
    title: 'Cancel monthly anytime',
    body: 'Site Care, Brand Care, Content Care, Scale, Operate, Content Engine — all cancel through Stripe in two clicks. Billed through end-of-cycle. No 12-month lock-ins.',
  },
  {
    title: 'Handoff that survives',
    body: "Every engagement ships with documentation, runbooks, and a knowledge-transfer call. The system survives without me on the next call — that's the bar.",
  },
  {
    title: 'No bait-and-switch staffing',
    body: "The person who scopes the work is the person who builds it. There's no \"we'll assign a team\" — it's one operator on every line of code.",
  },
]

const honestyItems = [
  {
    scenario: 'You need a 10-person delivery team this quarter',
    truth: 'Sage Ideas is one operator. We can do extraordinary depth on one or two parallel workstreams — not breadth across ten. If you need a staffing agency, we are the wrong fit and we will say so on the first call.',
  },
  {
    scenario: 'You want a full-time, on-call, replace-your-CTO arrangement',
    truth: "Studio Engagement is up to 30 hours per week with defined response windows. It is not 24/7 on-call. If you need a fulltime engineering lead embedded in your team, hire one — we'll help you scope the role.",
  },
  {
    scenario: "You're shopping on price alone",
    truth: "Productized engagements start at $1,500 because that's the floor at which the work is actually high-quality. There is no $500 audit. Cheap consulting is expensive when it's wrong.",
  },
  {
    scenario: 'You expect equity-only or revenue-share',
    truth: "For pre-revenue startups in specific circumstances, we'll consider partial equity (cash + equity, not equity-only). Pure speculation arrangements are declined politely.",
  },
  {
    scenario: 'You need someone to ship code fast and ask questions later',
    truth: 'We scope before we build. Discovery and architecture come first — always. If you want a contractor who builds whatever you ask without pushback, we are the wrong choice.',
  },
]

const openSourceStats = [
  { value: '106', label: 'Public repositories' },
  { value: '1,438', label: 'Commits (last 12 months)' },
  { value: '57', label: 'Pull requests (last 12 months)' },
  { value: '27', label: 'GitHub followers' },
]

// ── Reusable ruled checklist ──────────────────────────────────────────────────

function RuledList({ items }: { items: string[] }) {
  return (
    <div className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)]">
      {items.map((item, i) => (
        <Reveal key={i} delay={i * 0.04}>
          <div className="flex items-start gap-5 bg-[var(--sage-surface-1)] px-6 py-4">
            <MonoLabel tone="accent" className="mt-0.5 shrink-0 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </MonoLabel>
            <span className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{item}</span>
          </div>
        </Reveal>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TrustContent() {
  return (
    <div className="relative min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section
        aria-label="Trust evidence"
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
            <MonoLabel tone="muted">{'// evidence'}</MonoLabel>
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
            Why teams trust<br />the studio.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_OUT_QUINT, delay: 0.12 }}
            className="mt-8 max-w-3xl space-y-4 text-base leading-[1.75] text-[var(--sage-ink-muted)]"
          >
            <p className="text-lg font-normal text-[var(--sage-ink-muted)]">
              We don&apos;t ask you to take our word for it. Here&apos;s the evidence.
            </p>
            <p>
              Trust in a software engagement comes from verifiable evidence, not assertions.
              Every claim on this page is backed by something you can check: a public GitHub
              repo, a certification verification link, a methodology document, a test suite count.
            </p>
          </motion.div>

          {/* Quick nav — hairline chip rail */}
          <motion.nav
            aria-label="Trust page sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT_QUINT, delay: 0.22 }}
            className="mt-10 flex flex-wrap gap-2"
          >
            {navSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-3.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--sage-ink-muted)] transition-colors hover:border-[#0ED3CF] hover:text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                {s.label}
              </a>
            ))}
          </motion.nav>
        </div>
      </section>

      {/* ── Live receipts ─────────────────────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="live receipts"
        heading="What we promise, in numbers."
        lede="Operational facts that should be true before you send a deposit. Each one is something you can verify today."
        ariaLabel="Live receipts"
        grain
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-4">
          {trustReceipts.map((r, i) => (
            <Reveal key={r.metric} delay={i * 0.06}>
              <div className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-6 py-7">
                <MonoLabel tone="faint" as="p">{r.metric}</MonoLabel>
                <p
                  className="text-xl font-normal text-[var(--sage-ink)]"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                >
                  {r.value}
                </p>
                <p className="text-xs leading-[1.6] text-[var(--sage-ink-faint)]">{r.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Certifications ────────────────────────────────────────────────────── */}
      <Section
        id="certifications"
        index="03"
        eyebrow="certifications"
        heading="9 active certifications."
        lede="All certifications are active. Verification links available on request — just ask during a discovery call."
        ariaLabel="Certifications"
      >
        <div className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] max-w-3xl">
          {certifications.map((cert, i) => (
            <Reveal key={cert.name} delay={i * 0.04}>
              <div className="flex items-start gap-5 bg-[var(--sage-surface-1)] px-6 py-5">
                <MonoLabel tone="faint" className={`shrink-0 mt-0.5 ${TAG_TONE[cert.tag]}`}>
                  {cert.provider}
                </MonoLabel>
                <div className="min-w-0">
                  <p className="text-sm text-[var(--sage-ink)] leading-[1.6]">{cert.name}</p>
                  <MonoLabel tone="faint" as="p" className="mt-1">Active</MonoLabel>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Code quality ──────────────────────────────────────────────────────── */}
      <Section
        id="quality"
        index="04"
        eyebrow="code quality"
        heading="Every project ships with these standards enforced."
        ariaLabel="Code quality standards"
        grain
      >
        <div className="max-w-3xl">
          <RuledList items={codeQualityStandards} />
        </div>
      </Section>

      {/* ── Testing infrastructure ────────────────────────────────────────────── */}
      <Section
        id="testing"
        index="05"
        eyebrow="testing infrastructure"
        heading="13 testing frameworks. Every layer covered."
        ariaLabel="Testing infrastructure"
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-3 max-w-4xl">
          {testingFrameworks.map((fw, i) => (
            <Reveal key={fw.layer} delay={i * 0.05}>
              <div className="flex flex-col gap-2 bg-[var(--sage-surface-1)] px-6 py-6">
                <MonoLabel tone="accent" as="p">{fw.layer}</MonoLabel>
                <p className="text-sm text-[var(--sage-ink-muted)] leading-[1.6]">{fw.frameworks}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2} className="mt-6">
          <CtaLink href="/work/quality-telemetry" variant="text">
            See the Quality Telemetry case study
          </CtaLink>
        </Reveal>
      </Section>

      {/* ── CI/CD ─────────────────────────────────────────────────────────────── */}
      <Section
        id="cicd"
        index="06"
        eyebrow="ci/cd standards"
        heading="No code ships without passing CI gates."
        ariaLabel="CI/CD standards"
        grain
      >
        <div className="grid gap-x-4 gap-px sm:grid-cols-2 overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] max-w-3xl">
          {cicdStandards.map((std, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div className="flex items-start gap-4 bg-[var(--sage-surface-1)] px-5 py-4">
                <MonoLabel tone="accent" className="tabular-nums shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </MonoLabel>
                <span className="text-sm leading-[1.6] text-[var(--sage-ink-muted)]">{std}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Infrastructure ────────────────────────────────────────────────────── */}
      <Section
        id="infra"
        index="07"
        eyebrow="infrastructure"
        heading="Terraform-managed. Security-scanned. Auditable."
        lede="All infrastructure provisioned via Terraform."
        ariaLabel="Infrastructure standards"
      >
        <div className="max-w-3xl">
          <RuledList items={infraStandards} />
        </div>
      </Section>

      {/* ── Open source record ────────────────────────────────────────────────── */}
      <Section
        id="oss"
        index="08"
        eyebrow="open-source record"
        heading="106 public repositories."
        lede="All open-source projects are publicly available and maintained. The commit history is not curated for appearances — it's the actual development record."
        ariaLabel="Open-source record"
        grain
      >
        <Reveal>
          <StatDisplay stats={openSourceStats} columns={4} className="max-w-3xl" />
        </Reveal>
        <Reveal delay={0.12} className="mt-8">
          <CtaLink
            href="https://github.com/JasonTeixeira"
            variant="ghost"
            event="trust_github"
          >
            View GitHub profile
          </CtaLink>
        </Reveal>
      </Section>

      {/* ── Data handling ─────────────────────────────────────────────────────── */}
      <Section
        id="data-handling"
        index="09"
        eyebrow="data handling"
        heading="Where your data lives, who can read it, and how long."
        lede="The facts. No SOC-2 certificate yet — the studio is too young to have one. Here's the operational equivalent: a plain-English description of how the studio handles client data, sub-processors, and incidents."
        ariaLabel="Data handling"
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] md:grid-cols-2 max-w-4xl">
          {dataHandling.map((d, i) => (
            <Reveal key={d.label} delay={i * 0.05}>
              <div className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-6 py-7">
                <MonoLabel tone="accent" as="p">{d.label}</MonoLabel>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Guarantees ────────────────────────────────────────────────────────── */}
      <Section
        id="guarantees"
        index="10"
        eyebrow="engagement guarantees"
        heading="What we put in writing."
        lede="Every engagement signs an MSA + SOW. These five guarantees show up in every one of them — not as marketing copy, as contractual terms."
        ariaLabel="Engagement guarantees"
        grain
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
          {guarantees.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.07}>
              <Surface level={2} className="h-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#0ED3CF]" />
                  <h3
                    className="text-base font-normal text-[var(--sage-ink)]"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
                  >
                    {g.title}
                  </h3>
                </div>
                <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{g.body}</p>
              </Surface>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Honesty / wrong fit ───────────────────────────────────────────────── */}
      <Section
        id="honesty"
        index="11"
        eyebrow="honest limits"
        heading={<>Here&apos;s when we are the wrong fit.</>}
        lede="The fastest way to lose your time and ours is pretending we're right for every situation. We aren't. These are the most common mismatches."
        ariaLabel="Honest limits"
      >
        <div className="space-y-4 max-w-4xl">
          {honestyItems.map((h, i) => (
            <Reveal key={h.scenario} delay={i * 0.06}>
              <Surface level={2} className="p-6">
                <div className="flex items-start gap-5">
                  <MonoLabel tone="faint" className="mt-0.5 shrink-0 tabular-nums">
                    If —
                  </MonoLabel>
                  <div>
                    <p className="text-sm font-medium text-[var(--sage-ink)] mb-3">{h.scenario}</p>
                    <Hairline className="mb-3" />
                    <p className="text-sm leading-[1.7] text-[var(--sage-ink-muted)]">{h.truth}</p>
                  </div>
                </div>
              </Surface>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── References ────────────────────────────────────────────────────────── */}
      <Section
        id="references"
        index="12"
        eyebrow="references"
        heading="Talk to past collaborators directly."
        lede="Sage Ideas is a young studio. Rather than ship cherry-picked testimonials, every prospective client gets the option to talk directly to people I've built things with — fintech engineers, founders, ops leads. Real phone numbers, real conversations, no scripts."
        ariaLabel="References"
        grain
      >
        <ReferenceRoster references={references} trustedBy={trustedBy} />

        <Reveal delay={0.2}>
          <p className="mt-10 max-w-3xl text-sm text-[var(--sage-ink-faint)] leading-[1.75]">
            Reference contact details are shared with prospective clients during discovery, with
            both parties&apos; consent. As the client roster grows, quoted testimonials will
            replace this honest stub — not before.
          </p>
        </Reveal>
      </Section>

      {/* ── Footer CTA ────────────────────────────────────────────────────────── */}
      <section
        aria-label="Trust page footer CTA"
        className="border-t border-[var(--sage-border)] bg-[var(--sage-surface-1)] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap gap-4 items-center">
              <CtaLink href="/book" variant="solid" event="trust_book_cta">
                Book a call
              </CtaLink>
              <CtaLink href="/process" variant="ghost" event="trust_process_cta">
                See our process
              </CtaLink>
              <CtaLink href="/work" variant="text" event="trust_work_cta">
                See the work
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
