'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Code2,
  Sparkles,
  TrendingUp,
  Terminal,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { MetricCounter } from '@/components/metric-counter'
import { TypingTerminal } from '@/components/typing-terminal'
import { FloatingOrbs } from '@/components/floating-orbs'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
}

const stackLogos = [
  'Next.js',
  'React',
  'TypeScript',
  'Python',
  'AWS',
  'Supabase',
  'Stripe',
  'Tailwind',
  'Framer Motion',
  'FastAPI',
  'Terraform',
  'Playwright',
]

const capabilities = [
  {
    icon: Code2,
    title: 'Ship production software',
    description:
      'Full-stack products — marketing sites, SaaS platforms, internal tools. Production-grade from day one: CI/CD gates, typed APIs, test suites, idempotent webhooks.',
    href: '/services/ship',
    accent: 'cyan',
  },
  {
    icon: Sparkles,
    title: 'Build AI-native systems',
    description:
      'Automations, agents, and features that use AI as infrastructure — not a plugin. LLM pipelines, ML signal engines, classification layers, RAG-powered tools.',
    href: '/services/automate',
    accent: 'cyan',
  },
  {
    icon: TrendingUp,
    title: 'Scale organic search',
    description:
      'SEO-first content engines, programmatic page templates, structured data, and technical audits. Built to compound monthly, not deliver one-time traffic spikes.',
    href: '/services/scale',
    accent: 'violet',
  },
  {
    icon: Terminal,
    title: 'Operate as fractional CTO',
    description:
      'Monthly retainer for engineering leadership — architecture decisions, code review, technical roadmap. Operator-grade judgment on call without the full-time commitment.',
    href: '/services/operate',
    accent: 'violet',
  },
] as const

const featuredWork = [
  {
    slug: 'nexural',
    name: 'Nexural',
    category: 'Fintech Platform',
    tags: ['Full-stack', 'AI', 'Stripe'],
    kicker: '185 DB tables · 69 API endpoints · Real-time trading',
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

const labProducts = [
  { slug: 'nexural', name: 'Nexural' },
  { slug: 'jobpoise', name: 'Jobpoise' },
  { slug: 'trayd', name: 'Trayd' },
  { slug: 'voza', name: 'VOZA' },
  { slug: 'owly', name: 'Owly' },
  { slug: 'alphastream', name: 'AlphaStream' },
]

const processSteps = [
  {
    n: '01',
    title: 'Discover',
    body:
      'We map the problem, define scope, and agree on outcomes before a single line of code. You get a scope document — not a sales pitch.',
  },
  {
    n: '02',
    title: 'Architect',
    body:
      'System design, stack confirmation, data models, API contracts. We show you what we’re building before we build it.',
  },
  {
    n: '03',
    title: 'Build',
    body:
      'Production-grade implementation with CI gates, typed code, test coverage, and weekly progress updates. No ghost-mode development.',
  },
  {
    n: '04',
    title: 'Operate',
    body:
      'Deployment, monitoring, documentation, and handoff — or ongoing fractional support. We don’t ship and disappear.',
  },
]

const trustChips = [
  '9 active certifications',
  'Fixed-scope engagements',
  'Full CI/CD on every project',
  '13 testing frameworks',
  'Terraform-managed infra',
  'GDPR-aware data design',
  '5 years fintech engineering',
]

const homepageStats = [
  { value: '20+', label: 'Production Builds' },
  { value: '6', label: 'Live Products' },
  { value: '1,438', label: 'Commits / Year' },
  { value: '106', label: 'Public Repos' },
]

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <FloatingOrbs />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div className="lg:col-span-7 space-y-8" {...fadeInUp}>
              <div className="space-y-4">
                <SectionLabel>Sage Ideas · Studio</SectionLabel>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#FAFAFA] leading-[1.05]">
                  The studio that builds
                  <br />
                  <span className="text-[#06B6D4]">the businesses</span>
                  <br />
                  we’d want to run.
                </h1>
                <p className="text-lg lg:text-xl text-[#A1A1AA] leading-relaxed max-w-2xl">
                  Sage Ideas is an AI-native software studio. We design, build, and operate
                  production-grade products and automations for founders and companies who
                  need it done right the first time.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium"
                >
                  <Link href="/work">
                    See Our Work
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-[#FAFAFA] hover:bg-[#18181B] border border-[#27272A]"
                >
                  <Link href="/services">View Services</Link>
                </Button>
                <Link
                  href="/book"
                  className="text-sm text-[#A1A1AA] hover:text-[#06B6D4] transition-colors ml-1 underline-offset-4 hover:underline"
                >
                  or book a discovery call →
                </Link>
              </div>

              {/* Trust micro-strip */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-[#71717A] pt-4 border-t border-[#27272A]">
                <span>9 certifications</span>
                <span aria-hidden>·</span>
                <span>106 public repos</span>
                <span aria-hidden>·</span>
                <span>1,438 commits last year</span>
                <span aria-hidden>·</span>
                <span>6 live products</span>
              </div>
            </motion.div>

            {/* Right: Terminal */}
            <motion.div
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <TypingTerminal />
            </motion.div>
          </div>

          {/* Dual-track CTA strip */}
          <motion.div
            className="mt-20 grid sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/founder"
              className="group flex items-center justify-between bg-[#0F0F12] border border-[#27272A] hover:border-[#06B6D4]/50 rounded-2xl px-6 py-5 transition-all"
            >
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717A] mb-1">
                  Recruiting?
                </div>
                <div className="text-sm text-[#FAFAFA]">
                  Open to staff-level roles where the fit is right.
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#71717A] group-hover:text-[#06B6D4] group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/pricing"
              className="group flex items-center justify-between bg-[#0F0F12] border border-[#27272A] hover:border-[#06B6D4]/50 rounded-2xl px-6 py-5 transition-all"
            >
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717A] mb-1">
                  Got a project?
                </div>
                <div className="text-sm text-[#FAFAFA]">
                  Productized engagements from $1,500 to $25k+.
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#71717A] group-hover:text-[#06B6D4] group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* LOGO BAR */}
      <section className="border-y border-[#27272A] bg-[#0A0A0C]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-[#71717A] shrink-0">
              Built on
            </span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {stackLogos.map((logo) => (
                <span
                  key={logo}
                  className="text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-16"
          >
            <SectionLabel>What we do</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] mt-4">
              Four things, done at depth.
            </h2>
            <p className="text-[#A1A1AA] mt-4 text-lg">
              We don’t do everything. We do four things — and we do them with the
              architecture discipline of a tight team and the speed of a single operator.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link href={cap.href} className="block group h-full">
                  <GlowCard glowColor={cap.accent === 'violet' ? 'violet' : 'cyan'} className="h-full p-8">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl border ${
                          cap.accent === 'violet'
                            ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6]'
                            : 'border-[#06B6D4]/30 bg-[#06B6D4]/10 text-[#06B6D4]'
                        } flex items-center justify-center shrink-0`}
                      >
                        <cap.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors">
                          {cap.title}
                        </h3>
                        <p className="text-[#A1A1AA] mt-3 leading-relaxed">{cap.description}</p>
                        <div className="flex items-center gap-2 mt-5 text-sm text-[#06B6D4] opacity-0 group-hover:opacity-100 transition-opacity">
                          Learn more <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Engagement options strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 grid md:grid-cols-3 gap-3"
          >
            <Link
              href="/services"
              className="rounded-xl border border-[#06B6D4]/20 bg-[#06B6D4]/[0.04] hover:border-[#06B6D4]/50 p-5 transition-colors group"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4] mb-1">
                Productized tiers
              </div>
              <div className="text-base font-semibold text-[#FAFAFA] mb-1">
                9 fixed-price engagements
              </div>
              <div className="text-xs text-[#A1A1AA]">
                From $750 audits to $9,500+ builds. Stripe checkout.
              </div>
            </Link>
            <Link
              href="/pricing#care"
              className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.04] hover:border-[#8B5CF6]/50 p-5 transition-colors group"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8B5CF6] mb-1">
                Monthly retainers
              </div>
              <div className="text-base font-semibold text-[#FAFAFA] mb-1">
                Care plans from $300/mo
              </div>
              <div className="text-xs text-[#A1A1AA]">
                Site Care, Brand Care, Content Care. Cancel anytime.
              </div>
            </Link>
            <Link
              href="/contact?engagement=custom"
              className="rounded-xl border border-[#27272A] bg-[#0F0F12] hover:border-[#A1A1AA]/40 p-5 transition-colors group"
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] mb-1">
                Custom packages
              </div>
              <div className="text-base font-semibold text-[#FAFAFA] mb-1">
                Or build your own scope
              </div>
              <div className="text-xs text-[#A1A1AA]">
                Hybrid sprints, multi-month builds, custom retainers.
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FEATURED WORK */}
      <section className="py-24 lg:py-32 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
          >
            <div className="max-w-2xl">
              <SectionLabel>Recent work</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] mt-4">
                Six projects. Six problem spaces. All live.
              </h2>
              <p className="text-[#A1A1AA] mt-4 text-lg">
                These aren’t concept pieces. Every project shipped production code, served
                real users, and went through the full engineering process.
              </p>
            </div>
            <Link
              href="/work"
              className="text-sm text-[#06B6D4] hover:text-[#0EA5E9] flex items-center gap-1 group whitespace-nowrap"
            >
              All case studies
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredWork.map((work, i) => (
              <motion.div
                key={work.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link href={`/work/${work.slug}`} className="group block h-full">
                  <GlowCard className="h-full p-6">
                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#06B6D4]">
                      {work.category}
                    </div>
                    <h3 className="text-xl font-semibold text-[#FAFAFA] mt-2 group-hover:text-[#06B6D4] transition-colors">
                      {work.name}
                    </h3>
                    <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">
                      {work.kicker}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {work.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] bg-[#0A0A0C] border border-[#27272A] rounded px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </GlowCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE LAB */}
      <section className="py-24 lg:py-32 border-t border-[#27272A] bg-gradient-to-b from-[#0A0A0C] to-[#09090B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          >
            <div>
              <SectionLabel color="violet">The Lab</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] mt-4">
                Products we build and operate ourselves.
              </h2>
              <p className="text-[#A1A1AA] mt-4 text-lg leading-relaxed">
                The Lab is where we validate everything we offer clients. Every framework,
                every AI integration, every infrastructure pattern — it runs here first. Six
                active products, all shipping code.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  className="bg-[#0F0F12] hover:bg-[#18181B] text-[#FAFAFA] border border-[#27272A] hover:border-[#8B5CF6]/50"
                >
                  <Link href="/lab">
                    Explore the Lab <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {labProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/lab/${p.slug}`}
                  className="group bg-[#0F0F12] border border-[#27272A] hover:border-[#8B5CF6]/40 rounded-xl px-5 py-4 transition-all flex items-center justify-between"
                >
                  <span className="text-sm text-[#FAFAFA]">{p.name}</span>
                  <ArrowRight className="w-4 h-4 text-[#71717A] group-hover:text-[#8B5CF6] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 lg:py-32 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mb-12"
          >
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] mt-4">
              Four steps. No surprises.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-[#0F0F12] border border-[#27272A] rounded-2xl p-6 hover:border-[#06B6D4]/30 transition-colors"
              >
                <div className="text-xs font-mono text-[#06B6D4]">{step.n}</div>
                <h3 className="text-lg font-semibold text-[#FAFAFA] mt-2">{step.title}</h3>
                <p className="text-sm text-[#A1A1AA] mt-3 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/process"
              className="text-sm text-[#06B6D4] hover:text-[#0EA5E9] flex items-center gap-1 group"
            >
              See the full process
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="py-16 border-t border-[#27272A] bg-[#0A0A0C]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="shrink-0">
                <SectionLabel>Why teams trust us</SectionLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {trustChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] bg-[#0F0F12] border border-[#27272A] rounded-full px-3 py-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#06B6D4]" />
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {homepageStats.map((stat) => (
              <MetricCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER SPOTLIGHT */}
      <section className="py-24 lg:py-32 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7 space-y-6"
            >
              <SectionLabel>Founder</SectionLabel>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] leading-tight">
                Built by one person. On purpose.
              </h2>
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                Jason Teixeira has been writing production software since before it was
                fashionable to call it “building in public.” Five years in fintech. Two years
                running a product studio. Nine certifications, six live products, 106 public
                repositories.
              </p>
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                The studio is small by design — not because we’re growing into something
                larger, but because one focused practitioner with a tight process beats a
                six-person agency with a project manager. Every client engages directly with
                the person building their product.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#71717A] pt-2">
                <span>5 years experience</span>
                <span aria-hidden>·</span>
                <span>9 certs</span>
                <span aria-hidden>·</span>
                <span>6 live products</span>
                <span aria-hidden>·</span>
                <span>106 GitHub repos</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium"
                >
                  <Link href="/studio">Meet the studio</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="text-[#FAFAFA] hover:bg-[#18181B] border border-[#27272A]"
                >
                  <Link href="/founder">
                    Hiring? Start here <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-[#06B6D4]/15 via-[#0F0F12] to-[#8B5CF6]/15 border border-[#27272A] p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.12),transparent_50%)]" />
                <div className="relative h-full w-full rounded-[22px] bg-[#0A0A0C]/40 backdrop-blur-sm flex items-end p-8">
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase tracking-[0.18em] text-[#06B6D4]">
                      Sage Ideas LLC
                    </div>
                    <div className="text-2xl font-bold text-[#FAFAFA]">Jason Teixeira</div>
                    <div className="text-sm text-[#A1A1AA]">Founder & Principal Engineer</div>
                    <div className="text-xs text-[#71717A] mt-2">
                      Orlando, FL · Available remote
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 lg:py-32 border-t border-[#27272A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_70%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <SectionLabel>Ready to ship?</SectionLabel>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-[#FAFAFA] mt-4 leading-tight">
              Three slots open this quarter.
            </h2>
            <p className="text-[#A1A1AA] text-lg lg:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
              Fixed scope, fixed price, no retainer ambiguity. Start with an audit or jump
              straight to a full build.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
              <Button
                asChild
                size="lg"
                className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-medium"
              >
                <Link href="/book">
                  Book a Discovery Call
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-[#FAFAFA] hover:bg-[#18181B] border border-[#27272A]"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
