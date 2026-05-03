'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, Cpu, Users, XCircle } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { MetricCounter } from '@/components/metric-counter'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

interface Pillar {
  icon: React.ElementType
  title: string
  description: string
  accent: 'cyan' | 'violet'
}

interface Metric {
  value: string
  label: string
}

interface Props {
  pillars: Pillar[]
  nonServices: string[]
  metrics: Metric[]
}

const stackCategories = [
  { label: 'Frontend', items: 'Next.js 16, React 19, TypeScript, Tailwind CSS, Radix UI, Framer Motion' },
  { label: 'Backend', items: 'FastAPI, Python, Node.js' },
  { label: 'Data', items: 'PostgreSQL, Supabase, DynamoDB, S3' },
  { label: 'Infrastructure', items: 'AWS (Lambda, ECS, SES, DynamoDB, S3, CloudFront), Terraform, GitHub OIDC' },
  { label: 'AI/ML', items: 'OpenAI API, Anthropic Claude, XGBoost, LightGBM, scikit-learn, LangChain' },
  { label: 'Testing', items: 'Playwright, Jest, Vitest, Testing Library, Supertest, Pact, k6, Lighthouse CI, OWASP ZAP, Axe' },
]

export function StudioAnimations({ pillars, nonServices, metrics }: Props) {
  return (
    <div>
      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp} className="max-w-3xl">
          <SectionLabel>About</SectionLabel>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight">
            The studio.
          </h1>
          <h2 className="mt-6 text-2xl font-semibold text-[#A1A1AA]">
            One engineer. One LLC. Six years of compounded decisions.
          </h2>
          <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed">
            Sage Ideas LLC was founded in 2024 with a specific thesis: that the right process, the right infrastructure,
            and AI-native development practices allow a single practitioner to build and ship software at a quality level
            that matches a small agency — with the added benefit of direct accountability.
          </p>
          <p className="mt-4 text-lg text-[#A1A1AA] leading-relaxed">
            Before the studio, Jason Teixeira spent five years as a fintech engineer at HighStrike (2021–2026) — building
            trading infrastructure, market data systems, and real-time financial applications that handled production load.
            That&apos;s where the engineering discipline came from: systems that don&apos;t fail on a volatile trading day demand
            a level of rigor that carries over into everything since.
          </p>
          <p className="mt-4 text-[#71717A]">The studio operates out of Orlando, FL. Remote-first by default.</p>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <SectionLabel>Pillars</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">How we think about the work</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlowCard className="h-full">
                  <div className="p-8">
                    <div className="p-3 bg-[#06B6D4]/10 rounded-xl w-fit mb-6">
                      <pillar.icon className="h-6 w-6 text-[#06B6D4]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3">{pillar.title}</h3>
                    <p className="text-[#A1A1AA] text-sm leading-relaxed">{pillar.description}</p>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How the studio works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp} className="max-w-3xl">
          <SectionLabel>Engagement Model</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-8">How the studio works</h2>
          <div className="space-y-6 text-[#A1A1AA] text-lg leading-relaxed">
            <p>
              Clients work with Jason directly — not an account manager, not a project coordinator, not a handoff to a
              junior team after the sales call. The same person who scoped the project is the person building it. That
              accountability is structural, not a feature we sell.
            </p>
            <p>
              Every engagement follows the same methodology: Discover → Architect → Build → Operate. The scope is defined
              in writing before work begins. The price in the proposal is the price you pay — no &quot;starting from,&quot;
              no surprise overages.
            </p>
            <p>
              Engagements are productized by tier: Audit ($1,500), Ship (from $5,000), Automate (from $8,000), Build
              (from $25,000), Scale, and Operate. Each tier has a defined scope and defined deliverables. You know what
              you&apos;re getting before you sign anything.
            </p>
            <p>
              Larger agencies have their place — complex team coordination, ongoing managed services at scale, 24/7
              support organizations. For discrete software products, AI workflows, and infrastructure architecture, a
              studio of one with the right process is faster, more accountable, and more consistent.
            </p>
          </div>
        </motion.div>
      </section>

      {/* What we don't do */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp} className="max-w-3xl">
            <SectionLabel>Scope</SectionLabel>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">What we don&apos;t do</h2>
            <p className="text-[#A1A1AA] mb-8 text-lg">
              Self-qualification matters. These are honest limits — not failures, just not the right fit for this studio.
            </p>
            <div className="space-y-4">
              {nonServices.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-start gap-3 p-4 bg-[#09090B] border border-[#27272A] rounded-xl"
                >
                  <XCircle className="h-5 w-5 text-[#71717A] mt-0.5 flex-shrink-0" />
                  <span className="text-[#A1A1AA]">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* The values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <SectionLabel>Values</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-12">The values, plainly stated.</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
          {[
            {
              title: 'Ship over present.',
              body: 'We prefer working software over polished decks. Every engagement ends with deployed, tested code — not a recommendations document.',
            },
            {
              title: 'Evidence over assertion.',
              body: "We don't claim quality. We document it. Test suites, Lighthouse scores, CI gates, cert verifications — the evidence is always available.",
            },
            {
              title: 'Fixed scope, honest price.',
              body: "We've seen what scope ambiguity does to client relationships. Every engagement has a scope document. The price in the proposal is the price you pay.",
            },
            {
              title: 'Build to last.',
              body: "We build systems we'd be comfortable maintaining in two years. TypeScript strict mode, documented architecture decisions, runbooks for failure modes.",
            },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard className="h-full">
                <div className="p-6">
                  <h3 className="font-semibold text-[#FAFAFA] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{v.body}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-10"
          >
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <MetricCounter value={m.value} label={m.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <SectionLabel>Stack</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">The stack.</h2>
          <p className="text-[#A1A1AA] mb-10 max-w-2xl">Full stack from UI to infrastructure. Every layer chosen for production reliability, not demo convenience.</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {stackCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-5 bg-[#0F0F12] border border-[#27272A] rounded-xl"
            >
              <p className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] mb-2">{cat.label}</p>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{cat.items}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <Link
            href="/stack"
            className="inline-flex items-center text-[#06B6D4] hover:text-[#22D3EE] text-sm font-medium transition-colors group"
          >
            See the full stack reference
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>

      {/* CTAs */}
      <section className="bg-[#0F0F12] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              asChild
              className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold px-8"
            >
              <Link href="/founder">
                Read the founder story
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent px-8"
            >
              <Link href="/work">
                See the work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
