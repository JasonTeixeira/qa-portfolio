'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, Sparkles, TrendingUp, Terminal } from 'lucide-react'
import { GlowCard } from '@/components/glow-card'
import { MetricCounter } from '@/components/metric-counter'
import { GitHubActivity } from '@/components/github-activity'
import { Stagger, StaggerItem, HoverGlow } from '@/components/motion'
import { TrackedLink } from '@/components/analytics/tracked-link'
import { MagneticButton } from '@/components/magnetic-button'
import HeroSection from '@/components/sage-hero-terminal'
import { LogoStrip } from '@/components/logo-strip'
import { TestimonialCard } from '@/components/testimonial-card'
import { references, trustedBy } from '@/data/references'
import { AsciiRule, Sigil } from '@/components/sage'

// ────────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────────

const capabilities = [
  {
    icon: Code2,
    title: 'Ship production software',
    subtitle: 'web · platforms · internal tools',
    description:
      'Typed APIs, idempotent webhooks, CI gates that actually block. The boring part, done right, so the rest stops breaking.',
    href: '/services',
    accent: 'cyan' as const,
  },
  {
    icon: Sparkles,
    title: 'Wire AI into the stack',
    subtitle: 'agents · voice · automation',
    description:
      'LLM pipelines, voice agents, RAG tools. We fix the data layer first — otherwise the model is theater.',
    href: '/services/ai-development',
    accent: 'magenta' as const,
  },
  {
    icon: TrendingUp,
    title: 'Compound organic search',
    subtitle: 'SEO · content engines · structured data',
    description:
      'Programmatic templates, schema that validates, audits that move the needle. Built to ship monthly, not quarterly.',
    href: '/services/content-care',
    accent: 'coral' as const,
  },
  {
    icon: Terminal,
    title: 'Sit in the CTO seat',
    subtitle: 'retainers · architecture · review',
    description:
      'Fractional engineering leadership. Architecture calls, PR reviews, the roadmap, the on-call rotation. Senior, not senior-adjacent.',
    href: '/services/technical-consulting',
    accent: 'lime' as const,
  },
]

const ACCENT_TO_HEX = {
  cyan: '#0ED3CF',
  coral: '#E85D3A',
  lime: '#A8C633',
  magenta: '#C7236E',
} as const

const featuredWork = [
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
] as const

const homepageStats = [
  { value: '20+', label: 'Production Builds' },
  { value: '6', label: 'Live Products' },
  { value: '12', label: 'Active Retainers' },
  { value: '99.97%', label: 'Uptime Delivered' },
]

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const flagship = featuredWork.find((w) => w.flagship) ?? featuredWork[0]
  const rest = featuredWork.filter((w) => w.slug !== flagship.slug)

  return (
    <div className="overflow-hidden">
      {/* ══════════════════════════════════════════════════════════════
         ACT I — IDENTITY (terminal boot hero)
         ══════════════════════════════════════════════════════════════ */}
      <HeroSection
        logoMark={<img src="/brand/sage-logo.png" alt="" className="h-8 w-auto" aria-hidden />}
        projects={[
          { name: 'Nexural', url: 'nexural.dev', screenshot: '/work/screens/nexural-1.png', accent: '#0ED3CF' },
          { name: 'AlphaStream', url: 'alphastream.io', screenshot: '/work/screens/alphastream-1.png', accent: '#E85D3A' },
          { name: 'Jobpoise', url: 'jobpoise.app', screenshot: '/work/screens/jobpoise-1.png', accent: '#A8C633' },
          { name: 'Quality Telemetry', url: 'telemetry.sageideas.dev', screenshot: '/work/screens/quality-telemetry-1.png', accent: '#C7236E' },
        ]}
      />

      {/* ══════════════════════════════════════════════════════════════
         ACT II — RECEIPTS (flagship + supporting case studies)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 lg:py-32 border-t border-[#2A2826]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <AsciiRule label="// act 02 · receipts" tone="cyan" className="mb-6" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-normal tracking-tight text-[#F4F2EF]" style={{ fontFamily: 'var(--font-display)' }}>
                  Don&apos;t take our word. <span className="italic text-[#0ED3CF]">Audit the work.</span>
                </h2>
                <p className="text-[#B8B0AB] mt-4 text-lg">
                  Every project below ships, serves real users, and has a build log you can read.
                  Open any one to see the architecture, the trade-offs, and what almost went wrong.
                </p>
              </div>
              <Link
                href="/work"
                className="text-sm text-[#0ED3CF] hover:text-[#33EBE8] inline-flex items-center gap-1.5 group whitespace-nowrap [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide"
              >
                ls work/ → all case studies
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Flagship card — full width, taller */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-6"
          >
            <Link href={`/work/${flagship.slug}`} className="group block">
              <GlowCard className="relative overflow-hidden p-8 lg:p-10">
                <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-[#0ED3CF] via-[#E85D3A] to-transparent" aria-hidden />
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0ED3CF]">
                        {'// flagship · '}{flagship.category}
                      </span>
                      <Sigil status="online" label="SHIPPED" hideLabel={false} />
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-normal tracking-tight text-[#F4F2EF] group-hover:text-[#0ED3CF] transition-colors" style={{ fontFamily: 'var(--font-display)' }}>
                      {flagship.name}
                    </h3>
                    <p className="text-[#B8B0AB] mt-4 text-base lg:text-lg leading-relaxed max-w-prose">
                      {flagship.kicker}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-6">
                      {flagship.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] bg-[#0B0A09] border border-[#2A2826] rounded px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8 inline-flex items-center gap-2 text-sm text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]">
                      <span>open case_studies/{flagship.slug}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-[#2A2826] bg-[#0B0A09] sage-bloom-cyan">
                      <img
                        src="/work/screens/nexural-1.png"
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        aria-hidden
                      />
                      <div className="absolute inset-0 sage-scanlines pointer-events-none" aria-hidden />
                    </div>
                  </div>
                </div>
              </GlowCard>
            </Link>
          </motion.div>

          {/* Supporting grid */}
          <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" gap={0.05}>
            {rest.map((work) => (
              <StaggerItem key={work.slug}>
                <HoverGlow className="h-full rounded-2xl">
                  <Link href={`/work/${work.slug}`} className="group block h-full">
                    <GlowCard className="h-full p-6">
                      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#0ED3CF]">
                        {work.category}
                      </div>
                      <h3 className="text-xl font-semibold text-[#F4F2EF] mt-2 group-hover:text-[#0ED3CF] transition-colors">
                        {work.name}
                      </h3>
                      <p className="text-sm text-[#B8B0AB] mt-3 leading-relaxed">
                        {work.kicker}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-5">
                        {work.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono uppercase tracking-wider text-[#A8A29E] bg-[#0B0A09] border border-[#2A2826] rounded px-2 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlowCard>
                  </Link>
                </HoverGlow>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Inline stats row — receipts continued */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {homepageStats.map((stat) => (
              <MetricCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         ACT III — RANGE (horizontal scroll-snap rail of capabilities)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 lg:py-32 border-t border-[#2A2826] bg-gradient-to-b from-[#0B0A09] to-[#09090B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <AsciiRule label="// act 03 · range" tone="coral" className="mb-6" />
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-normal tracking-tight text-[#F4F2EF]" style={{ fontFamily: 'var(--font-display)' }}>
                Four lanes. <span className="italic text-[#E85D3A]">Done at depth.</span>
              </h2>
              <p className="text-[#B8B0AB] mt-4 text-lg">
                Generalists pitch ten services and ship none of them well. We picked four. Each one has
                a retainer, a fixed-scope offer, and a portfolio of work we&apos;d show our mothers.
              </p>
            </div>
          </motion.div>

          {/* Horizontal scroll rail */}
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto pb-4 [scrollbar-width:thin] [scrollbar-color:#3D3A37_transparent]">
            <div className="flex gap-5 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
              {capabilities.map((cap, i) => {
                const hex = ACCENT_TO_HEX[cap.accent]
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    className="snap-start shrink-0 w-[320px] sm:w-[360px] lg:w-[400px]"
                  >
                    <Link href={cap.href} className="block h-full group">
                      <div
                        className="h-full p-7 rounded-2xl border bg-[#0F0E11] transition-all"
                        style={{
                          borderColor: '#2A2826',
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-all"
                          style={{
                            borderColor: `${hex}55`,
                            backgroundColor: `${hex}11`,
                            color: hex,
                          }}
                        >
                          <cap.icon className="w-5 h-5" />
                        </div>
                        <div
                          className="text-[10px] font-mono uppercase tracking-[0.22em] mb-2"
                          style={{ color: hex }}
                        >
                          {cap.subtitle}
                        </div>
                        <h3 className="text-xl font-semibold text-[#F4F2EF] group-hover:text-[#F4F2EF] transition-colors">
                          {cap.title}
                        </h3>
                        <p className="text-[#B8B0AB] mt-3 leading-relaxed text-sm">{cap.description}</p>
                        <div
                          className="flex items-center gap-2 mt-6 text-sm [font-family:var(--font-mono),ui-monospace,monospace] opacity-60 group-hover:opacity-100 transition-opacity"
                          style={{ color: hex }}
                        >
                          engage <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
              {/* Trailing pad so last card can fully snap */}
              <div className="shrink-0 w-2" aria-hidden />
            </div>
          </div>

          {/* GitHub strip beneath the rail */}
          <div className="mt-12">
            <GitHubActivity />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         ACT IV — MANIFESTO (editorial, full-width Instrument Serif Italic)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-40 border-t border-[#2A2826] overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-[0.12] blur-[140px]"
            style={{ background: 'radial-gradient(circle, rgba(14,211,207,0.7) 0%, transparent 60%)' }}
          />
          <div className="sage-grid-noise absolute inset-0 opacity-40" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <AsciiRule label="// act 04 · manifesto" tone="lime" align="center" className="mb-10" />
            <blockquote
              className="text-[24px] sm:text-[36px] lg:text-[56px] leading-[1.1] tracking-[-0.015em] text-[#F4F2EF] text-center"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>The agencies sold </span>
              <span className="italic text-[#A8C633]">promises</span>
              <span>.</span>
              <br />
              <span>We ship </span>
              <span className="italic text-[#0ED3CF]">production systems</span>
              <span> — and we keep the </span>
              <span className="italic text-[#E85D3A]">receipts</span>
              <span>.</span>
            </blockquote>

            <div className="mt-12 grid sm:grid-cols-3 gap-6 lg:gap-10 max-w-3xl mx-auto">
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0ED3CF] mb-2">
                  {'// rule 01'}
                </div>
                <p className="text-sm text-[#B8B0AB] leading-relaxed">
                  Every change is reversible in 30 seconds — or it doesn&apos;t ship.
                </p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#E85D3A] mb-2">
                  {'// rule 02'}
                </div>
                <p className="text-sm text-[#B8B0AB] leading-relaxed">
                  The person pitching the work is the person typing the code.
                </p>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#A8C633] mb-2">
                  {'// rule 03'}
                </div>
                <p className="text-sm text-[#B8B0AB] leading-relaxed">
                  References are callable. Names are real. Numbers are audited.
                </p>
              </div>
            </div>

            <div className="mt-14 flex justify-center">
              <Link
                href="/pov"
                className="inline-flex items-center gap-2 text-sm text-[#A8A29E] hover:text-[#F4F2EF] transition-colors [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide"
              >
                cat manifesto.md
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         ACT V — CALLABLE ROLODEX (references promoted)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 lg:py-32 border-t border-[#2A2826] bg-[#0B0A09]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <AsciiRule label="// act 05 · callable rolodex" tone="magenta" className="mb-6" />
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-normal tracking-tight text-[#F4F2EF]" style={{ fontFamily: 'var(--font-display)' }}>
                  Call the people <span className="italic text-[#C7236E]">who&apos;ve worked with us.</span>
                </h2>
                <p className="text-[#B8B0AB] mt-4 text-lg">
                  Before you sign, we hand you a list of past collaborators — engineers, founders, ops leads —
                  and you call them. No stock photos. No invented quotes. Their words, their phones.
                </p>
              </div>
              <Link
                href="/trust#references"
                className="text-sm text-[#C7236E] hover:text-[#E0518E] inline-flex items-center gap-1.5 group whitespace-nowrap [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide"
              >
                cat references/ → roster
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Reference cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {references.slice(0, 3).map((r, i) => (
              <TestimonialCard key={r.id} reference={r} index={i} />
            ))}
          </div>

          {/* Trusted-by logo strip, demoted to a quieter band beneath references */}
          <LogoStrip
            entries={trustedBy}
            label="Industries shipped into"
            blurb="Most engagements run under NDA. Names withheld until written permission lands — no fake logos, no implied endorsements."
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
         ACT VI — ENGAGEMENT (final CTA with 3 offer tiles)
         ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 lg:py-32 border-t border-[#2A2826] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(14,211,207,0.10),transparent_70%)]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <AsciiRule label="// act 06 · engagement" tone="cyan" align="center" className="mb-8" />
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-normal tracking-tight text-[#F4F2EF] leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Three lanes. <span className="italic text-[#0ED3CF]">Three slots</span> this quarter.
            </h2>
            <p className="text-[#B8B0AB] text-lg lg:text-xl mt-6 leading-relaxed">
              Productized work, Stripe checkout, fixed scope. Monthly care on retainer. Or a full
              quarter inside the studio — by application, three slots, no exceptions.
            </p>
          </motion.div>

          {/* Three offer tiles */}
          <div className="mt-14 grid md:grid-cols-3 gap-4 lg:gap-5">
            <Link
              href="/services"
              className="group rounded-2xl border border-[#0ED3CF]/25 bg-gradient-to-b from-[#0ED3CF]/[0.05] to-transparent hover:border-[#0ED3CF]/60 hover:bg-[#0ED3CF]/[0.08] p-7 transition-all"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0ED3CF] mb-2">
                {'// productized'}
              </div>
              <div className="text-xl font-semibold text-[#F4F2EF] mb-2">
                9 fixed-price engagements
              </div>
              <div className="text-sm text-[#B8B0AB] leading-relaxed">
                $750 audits to $9,500 builds. You see the scope, you click checkout, we ship.
              </div>
              <div className="mt-5 text-xs text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace] opacity-60 group-hover:opacity-100 transition-opacity">
                ls services/ →
              </div>
            </Link>

            <Link
              href="/pricing#care"
              className="group rounded-2xl border border-[#E85D3A]/25 bg-gradient-to-b from-[#E85D3A]/[0.05] to-transparent hover:border-[#E85D3A]/60 hover:bg-[#E85D3A]/[0.08] p-7 transition-all"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#E85D3A] mb-2">
                {'// retainer'}
              </div>
              <div className="text-xl font-semibold text-[#F4F2EF] mb-2">
                Care plans from $300/mo
              </div>
              <div className="text-sm text-[#B8B0AB] leading-relaxed">
                Site, brand, content — kept alive every month. Cancel any time, no clawback, no drama.
              </div>
              <div className="mt-5 text-xs text-[#E85D3A] [font-family:var(--font-mono),ui-monospace,monospace] opacity-60 group-hover:opacity-100 transition-opacity">
                cat care.md →
              </div>
            </Link>

            <Link
              href="/contact?engagement=custom"
              className="group rounded-2xl border border-[#A8C633]/25 bg-gradient-to-b from-[#A8C633]/[0.05] to-transparent hover:border-[#A8C633]/60 hover:bg-[#A8C633]/[0.08] p-7 transition-all"
            >
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#A8C633] mb-2">
                {'// custom'}
              </div>
              <div className="text-xl font-semibold text-[#F4F2EF] mb-2">
                Studio Engagement
              </div>
              <div className="text-sm text-[#B8B0AB] leading-relaxed">
                One quarter, one team, one product owner. Application only. Three slots a year.
              </div>
              <div className="mt-5 text-xs text-[#A8C633] [font-family:var(--font-mono),ui-monospace,monospace] opacity-60 group-hover:opacity-100 transition-opacity">
                apply →
              </div>
            </Link>
          </div>

          {/* Final CTAs */}
          <div className="mt-14 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <MagneticButton strength={0.35} maxOffset={10}>
              <TrackedLink
                href="/book"
                event="cta_click"
                eventProps={{ location: 'home_final_cta', label: 'book_discovery' }}
                className="sage-neon-cta sage-bloom-cyan group inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md font-medium uppercase tracking-wide bg-[#0ED3CF] border border-[#0ED3CF] text-[#0A0A0A] [font-family:var(--font-mono),ui-monospace,monospace] text-base transition-all hover:bg-[#0AA8A5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ED3CF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
              >
                <span>./book</span>
                <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
              </TrackedLink>
            </MagneticButton>
            <TrackedLink
              href="/pricing"
              event="cta_click"
              eventProps={{ location: 'home_final_cta', label: 'see_pricing' }}
              className="group inline-flex items-center gap-2 h-12 px-6 rounded-md border border-[#2A2826] text-[#A8A29E] hover:text-[#F4F2EF] hover:border-[#3D3A37] transition-colors text-sm [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide"
            >
              <span>cat pricing.md</span>
              <ArrowRight className="w-4 h-4" />
            </TrackedLink>
          </div>
        </div>
      </section>
    </div>
  )
}
