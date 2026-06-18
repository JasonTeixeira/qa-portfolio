'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Banknote,
  Cloud,
  ShoppingBag,
  HeartPulse,
  Sparkles,
} from 'lucide-react'
import type { Vertical } from '@/data/industries/verticals'
import { Section, Surface, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const verticalIcons: Record<string, typeof Banknote> = {
  fintech: Banknote,
  saas: Cloud,
  ecommerce: ShoppingBag,
  healthcare: HeartPulse,
  'ai-startups': Sparkles,
}

export function IndustriesIndexContent({
  verticals,
}: {
  verticals: readonly Vertical[]
}) {
  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label="Industries overview"
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
              <MonoLabel tone="muted">{'// industries'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>
            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
              style={HEADING_STYLE}
            >
              Five verticals.{' '}
              <em className="not-italic text-[#3D5AFE]">Operator-grade execution.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
              Sage Ideas works deepest where we have shipped real software — fintech, SaaS,
              ecommerce, healthcare, and AI-native startups. Each industry page maps our
              productized tiers to the operational realities of the vertical: compliance,
              integration depth, regulatory edges, and the specific failure modes we have
              already debugged.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vertical grid */}
      <Section
        eyebrow="where we go deep"
        heading="Pick your industry"
        ariaLabel="Industry verticals"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verticals.map((v, i) => {
            const Icon = verticalIcons[v.slug] ?? Sparkles
            return (
              <Reveal key={v.slug} delay={i * 0.07}>
                <Link
                  href={`/industries/${v.slug}`}
                  className="group block h-full"
                >
                  <Surface level={2} interactive ticks className="p-6 h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-11 h-11 rounded-[3px] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-[#3D5AFE]" aria-hidden />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base text-[var(--sage-ink)] group-hover:text-[#3D5AFE] transition-colors leading-tight">
                          {v.name}
                        </h3>
                        <MonoLabel tone="accent" as="p" className="mt-0.5">{v.tagline}</MonoLabel>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed mb-4 flex-1">
                      {v.intro.length > 220
                        ? v.intro.slice(0, 220).trimEnd() + '…'
                        : v.intro}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace] mt-auto">
                      Explore {v.shortName} →
                    </span>
                  </Surface>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </Section>

      {/* CTA */}
      <Section
        eyebrow="fit check"
        heading={<>Industry not listed?<br /><em className="not-italic text-[#3D5AFE]">We still might fit.</em></>}
        lede="Sage Ideas works with most B2B verticals. Book a 30-minute call and we will tell you directly whether we're the right fit — or who is."
        centered
        grain
        action={
          <CtaLink href="/book" variant="solid" event="cta_industries_index_footer">
            Book a Discovery Call
          </CtaLink>
        }
      />
    </div>
  )
}
