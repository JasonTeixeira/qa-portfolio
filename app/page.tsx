'use client'

import dynamic from 'next/dynamic'
import { Code2, Sparkles, TrendingUp, Terminal } from 'lucide-react'
import HeroSection from '@/components/sage-hero-terminal'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { Section, StatDisplay, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { WorkPreview, type WorkItem } from '@/components/el/home/WorkPreview'
import { CapabilityLanes, type Capability } from '@/components/el/home/CapabilityLanes'
import { ReferenceRoster } from '@/components/el/home/ReferenceRoster'
import { ProofLedger } from '@/components/el/home/ProofLedger'
import { EngagementTiles, type EngagementTile } from '@/components/el/home/EngagementTiles'
import { references, trustedBy } from '@/data/references'

// ── Deferred heavy component — GitHubActivity fetches the GitHub API and is
// below the fold, so it stays out of the initial bundle. ─────────────────────
const GitHubActivity = dynamic(
  () => import('@/components/github-activity').then((m) => ({ default: m.GitHubActivity })),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 animate-pulse rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]" />
    ),
  },
)

// ────────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────────

const capabilities: Capability[] = [
  {
    icon: Code2,
    title: 'Ship production software',
    subtitle: 'web · platforms · internal tools',
    description:
      'Typed APIs, idempotent webhooks, CI gates that actually block. The boring part, done right, so the rest stops breaking.',
    href: '/services',
  },
  {
    icon: Sparkles,
    title: 'Wire AI into the stack',
    subtitle: 'agents · voice · automation',
    description:
      'LLM pipelines, voice agents, RAG tools. We fix the data layer first — otherwise the model is theater.',
    href: '/services/ai-development',
  },
  {
    icon: TrendingUp,
    title: 'Compound organic search',
    subtitle: 'SEO · content engines · structured data',
    description:
      'Programmatic templates, schema that validates, audits that move the needle. Built to ship monthly, not quarterly.',
    href: '/services/content-care',
  },
  {
    icon: Terminal,
    title: 'Sit in the CTO seat',
    subtitle: 'retainers · architecture · review',
    description:
      'Fractional engineering leadership. Architecture calls, PR reviews, the roadmap, the on-call rotation. Principal-calibre, not a handoff shop.',
    href: '/services/technical-consulting',
  },
]

const featuredWork: readonly WorkItem[] = [
  {
    slug: 'nexural',
    name: 'Nexural',
    category: 'Fintech Platform',
    tags: ['Full-stack', 'AI', 'Stripe'],
    kicker: '185 DB tables · 69 API endpoints · Real-time trading',
    flagship: true,
  },
  {
    slug: 'alphastream',
    name: 'AlphaStream',
    category: 'ML Trading Signals',
    tags: ['Machine Learning', 'Python'],
    kicker: '200+ indicators · 5 ML models · 5★ on GitHub',
  },
  {
    slug: 'jobpoise',
    name: 'Jobpoise',
    category: 'AI Job Copilot',
    tags: ['AI', 'Next.js', 'Chrome Extension'],
    kicker: 'Stripe paywall · Gmail tracking · 3 pricing tiers',
  },
  {
    slug: 'trayd',
    name: 'Trayd',
    category: 'Trades AI Companion',
    tags: ['Bilingual', 'AI', 'Mobile'],
    kicker: 'EN/ES · HVAC-first · Bootstrapped pre-seed',
  },
  {
    slug: 'aws-landing-zone',
    name: 'AWS Landing Zone',
    category: 'Infrastructure',
    tags: ['Terraform', 'AWS', 'IaC'],
    kicker: 'VPC · OIDC · Security-scanned · CI-tested',
  },
  {
    slug: 'quality-telemetry',
    name: 'Quality Telemetry',
    category: 'Engineering Excellence',
    tags: ['Testing', 'CI/CD', 'Observability'],
    kicker: '13 frameworks · Playwright · Lighthouse CI',
  },
]

const homepageStats = [
  { value: '6', label: 'Shipped Products' },
  { value: '185', label: 'DB Tables (Nexural)' },
  { value: '200+', label: 'Indicators (AlphaStream)' },
  { value: '13', label: 'Test Frameworks' },
]

const manifestoRules = [
  { index: '01', text: 'Every change is reversible in 30 seconds — or it doesn’t ship.' },
  { index: '02', text: 'The person pitching the work is the person typing the code.' },
  { index: '03', text: 'References are callable. Names are real. Numbers are audited.' },
]

const engagementTiles: EngagementTile[] = [
  {
    kind: 'productized',
    title: '9 fixed-price engagements',
    description:
      '$750 audits to $9,500 builds. You see the scope, you click checkout, we ship.',
    href: '/services',
    cta: 'ls services/',
  },
  {
    kind: 'retainer',
    title: 'Care plans from $300/mo',
    description:
      'Site, brand, content — kept alive every month. Cancel any time, no clawback, no drama.',
    href: '/pricing#care',
    cta: 'cat care.md',
  },
  {
    kind: 'custom',
    title: 'Studio Engagement',
    description:
      'One quarter, one team, one product owner. Application only. Three slots a year.',
    href: '/contact?engagement=custom',
    cta: 'apply',
  },
]

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const flagship = featuredWork.find((w) => w.slug === 'nexural') ?? featuredWork[0]
  const rest = featuredWork.filter((w) => w.slug !== flagship.slug)

  return (
    <div className="overflow-hidden bg-[var(--sage-bg)]">
      {/* ══════════════════════════════════════════════════════════════
         ACT I — IDENTITY (Engineered Luxury hero)
         ══════════════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ══════════════════════════════════════════════════════════════
         ACT II — RECEIPTS (flagship + supporting builds + stats)
         ══════════════════════════════════════════════════════════════ */}
      <Section
        index="02"
        eyebrow="receipts"
        ariaLabel="Selected work"
        heading={
          <>
            Don’t take our word.{' '}
            <span className="italic text-[#0ED3CF]">Audit the work.</span>
          </>
        }
        lede="Every project below ships, serves real users, and has a build log you can read. Open any one to see the architecture, the trade-offs, and what almost went wrong."
        action={
          <CtaLink variant="text" href="/work" event="cta_click" eventProps={{ location: 'home_receipts', label: 'ls_work', href: '/work' }}>
            ls work/
          </CtaLink>
        }
      >
        <WorkPreview
          flagship={flagship}
          rest={rest}
          flagshipImage="/work/screens/nexural-1.png"
        />

        <Reveal className="mt-12 lg:mt-16">
          <StatDisplay stats={homepageStats} columns={4} />
        </Reveal>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         ACT III — RANGE (four capability lanes + GitHub strip)
         ══════════════════════════════════════════════════════════════ */}
      <Section
        index="03"
        eyebrow="range"
        ariaLabel="Capabilities"
        heading={
          <>
            Four lanes.{' '}
            <span className="italic text-[#0ED3CF]">Done at depth.</span>
          </>
        }
        lede="Generalists pitch ten services and ship none of them well. We picked four. Each one has a retainer, a fixed-scope offer, and a portfolio of work we’d show our mothers."
        grain
      >
        <CapabilityLanes capabilities={capabilities} />

        <Reveal className="mt-12">
          <div className="mb-4 flex items-center gap-4">
            <MonoLabel tone="faint">{'// build activity'}</MonoLabel>
            <Hairline className="flex-1" />
          </div>
          <GitHubActivity />
        </Reveal>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         ACT IV — MANIFESTO (editorial Fraunces statement)
         ══════════════════════════════════════════════════════════════ */}
      <section
        aria-label="Studio principles"
        className="sage-grain relative isolate overflow-hidden border-t border-[var(--sage-border)] py-24 lg:py-36"
      >
        <div aria-hidden className="sage-depth pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <Reveal>
            <div className="mb-12 flex items-center justify-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">04</MonoLabel>
              <MonoLabel tone="muted">{'// manifesto'}</MonoLabel>
            </div>

            <blockquote
              className="text-center text-[var(--sage-ink)] text-[clamp(1.65rem,1rem+3.3vw,3.5rem)] leading-[1.12] tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>The agencies sold </span>
              <span className="italic text-[var(--sage-ink-muted)]">promises</span>
              <span>. We ship </span>
              <span className="italic text-[#0ED3CF]">production systems</span>
              <span> — and we keep the </span>
              <span className="italic text-[#0ED3CF]">receipts</span>
              <span>.</span>
            </blockquote>

            <Hairline accentLead className="mx-auto mt-12 max-w-3xl" />

            <dl className="mx-auto mt-12 grid max-w-3xl gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-3 [font-family:var(--font-mono),ui-monospace,monospace]">
              {manifestoRules.map((rule) => (
                <div
                  key={rule.index}
                  className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-5 py-6"
                >
                  <MonoLabel tone="accent" as="dt">{`// rule ${rule.index}`}</MonoLabel>
                  <dd className="text-sm leading-relaxed text-[var(--sage-ink-muted)]">
                    {rule.text}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-12 flex justify-center">
              <CtaLink variant="text" href="/pov">
                cat manifesto.md
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         ACT V — CALLABLE ROLODEX (references + trusted-by)
         ══════════════════════════════════════════════════════════════ */}
      <Section
        index="05"
        eyebrow="callable rolodex"
        ariaLabel="References"
        heading={
          <>
            Call the people{' '}
            <span className="italic text-[#0ED3CF]">who’ve worked with us.</span>
          </>
        }
        lede="Before you sign, we hand you a list of past collaborators — engineers, founders, ops leads — and you call them. No stock photos. No invented quotes. Their words, their phones."
        action={
          <CtaLink variant="text" href="/trust#references">
            cat references/
          </CtaLink>
        }
      >
        <ReferenceRoster references={references.slice(0, 3)} trustedBy={trustedBy} />
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SOCIAL PROOF — verifiable ledger (no invented quotes)
         ══════════════════════════════════════════════════════════════ */}
      <Section
        eyebrow="verifiable record"
        ariaLabel="The receipts"
        heading="The receipts"
        width="max-w-5xl"
      >
        <ProofLedger />
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         ACT VI — ENGAGEMENT (offer tiles + final CTA)
         ══════════════════════════════════════════════════════════════ */}
      <Section
        index="06"
        eyebrow="engagement"
        ariaLabel="Engage the studio"
        centered
        heading={
          <>
            Three lanes.{' '}
            <span className="italic text-[#0ED3CF]">Three slots</span> this quarter.
          </>
        }
        lede="Productized work, Stripe checkout, fixed scope. Monthly care on retainer. Or a full quarter inside the studio — by application, three slots, no exceptions."
        width="max-w-6xl"
      >
        <EngagementTiles tiles={engagementTiles} />

        <Reveal className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink
            variant="solid"
            href="/book"
            event="cta_click"
            eventProps={{ location: 'home_final_cta', label: 'book_discovery' }}
          >
            ./book
          </CtaLink>
          <TrackedLink
            href="/pricing"
            event="cta_click"
            eventProps={{ location: 'home_final_cta', label: 'see_pricing' }}
            className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
          >
            <span>cat pricing.md</span>
            <span aria-hidden className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </TrackedLink>
        </Reveal>
      </Section>
    </div>
  )
}
