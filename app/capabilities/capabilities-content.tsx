'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Brain,
  Globe,
  Workflow,
  Search,
  PenLine,
  Palette,
  Boxes,
  Server,
  Eye,
  Rocket,
  Hammer,
  Settings,
  CheckCircle2,
} from 'lucide-react'
import { capabilities, tiersBySlug, tiersOrdered, type Tier, type CapabilityKey } from '@/data/services/tiers'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'

type Mode = Tier['mode']

const modes: { key: Mode; label: string; tagline: string; Icon: typeof Eye }[] = [
  {
    key: 'audit',
    label: 'Audit',
    tagline: 'Senior eyes on what to fix.',
    Icon: Eye,
  },
  {
    key: 'sprint',
    label: 'Sprint',
    tagline: 'Fixed-scope, fixed-price ship.',
    Icon: Rocket,
  },
  {
    key: 'build',
    label: 'Build',
    tagline: 'Custom, multi-month engagement.',
    Icon: Hammer,
  },
  {
    key: 'operate',
    label: 'Operate',
    tagline: 'Senior engineering, on retainer.',
    Icon: Settings,
  },
]

const capabilityIcons: Record<CapabilityKey, typeof Brain> = {
  strategy: Brain,
  web: Globe,
  automation: Workflow,
  seo: Search,
  content: PenLine,
  brand: Palette,
  product: Boxes,
  platform: Server,
}

const capabilityOrder: CapabilityKey[] = [
  'strategy',
  'web',
  'automation',
  'seo',
  'content',
  'brand',
  'product',
  'platform',
]

export function CapabilitiesContent() {
  // Build the matrix: capability x mode → tier slug (or null)
  const matrix: Record<CapabilityKey, Partial<Record<Mode, string>>> = {} as never
  for (const key of capabilityOrder) {
    matrix[key] = {}
  }
  for (const tier of tiersOrdered) {
    matrix[tier.capability][tier.mode] = tier.slug
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <SectionLabel>Capabilities</SectionLabel>
            <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#FAFAFA] leading-tight">
              Eight capabilities.{' '}
              <span className="text-[#06B6D4]">Four modes.</span>{' '}
              <span className="text-[#8B5CF6]">Nine tiers.</span>
            </h1>
            <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              {
                'Each capability area has a productized engagement. Pick the service line you need, then pick the mode — audit, sprint, build, or operate. Every tier has a fixed scope, a fixed price, and a Stripe checkout.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
        {/* Mode legend */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Modes</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-6">
            How engagements run
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map((m, i) => (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
                    <m.Icon className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                  <span className="font-semibold text-[#FAFAFA]">{m.label}</span>
                </div>
                <p className="text-sm text-[#A1A1AA]">{m.tagline}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Matrix — desktop */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Matrix</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-2">
            Capability × Mode
          </h2>
          <p className="text-[#A1A1AA] mb-8 max-w-2xl">
            Find your row (capability) and column (mode). The intersection is the
            engagement. Empty cells are deliberate — we focus where we can deliver
            senior, accountable work.
          </p>

          <div className="hidden lg:block overflow-hidden rounded-2xl border border-[#27272A] bg-[#0F0F12]">
            {/* Header row */}
            <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] border-b border-[#27272A] bg-[#0a0a0d]">
              <div className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-[#71717A]">
                Capability
              </div>
              {modes.map((m) => (
                <div
                  key={m.key}
                  className="px-4 py-3 text-xs font-mono uppercase tracking-widest text-[#71717A] border-l border-[#27272A]"
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Capability rows */}
            {capabilityOrder.map((capKey, idx) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              return (
                <div
                  key={capKey}
                  className={`grid grid-cols-[1.4fr_repeat(4,1fr)] ${
                    idx < capabilityOrder.length - 1
                      ? 'border-b border-[#27272A]/60'
                      : ''
                  }`}
                >
                  {/* Capability cell */}
                  <div className="px-4 py-5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#06B6D4]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#FAFAFA] leading-tight">
                        {cap.label}
                      </div>
                      <div className="text-xs text-[#71717A] mt-1 leading-snug">
                        {cap.tagline}
                      </div>
                    </div>
                  </div>

                  {/* Mode cells */}
                  {modes.map((m) => {
                    const slug = matrix[capKey][m.key]
                    const tier = slug ? tiersBySlug[slug] : null
                    return (
                      <div
                        key={m.key}
                        className="border-l border-[#27272A]/60 p-3"
                      >
                        {tier ? (
                          <Link
                            href={`/services/${tier.slug}`}
                            className="block h-full rounded-lg bg-[#06B6D4]/[0.04] border border-[#06B6D4]/20 hover:border-[#06B6D4]/60 hover:bg-[#06B6D4]/[0.08] p-3 transition-all group"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                              <span className="text-[11px] font-mono uppercase tracking-widest text-[#06B6D4]">
                                {tier.shortName}
                              </span>
                            </div>
                            <div className="text-sm font-semibold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors leading-tight">
                              {tier.price}
                              {tier.cadence === 'monthly' && (
                                <span className="text-[#71717A] text-xs font-normal">
                                  /mo
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#71717A] mt-0.5">
                              {tier.timeline}
                            </div>
                          </Link>
                        ) : (
                          <div className="h-full rounded-lg border border-dashed border-[#27272A] p-3 flex items-center justify-center min-h-[78px]">
                            <span className="text-xs font-mono text-[#3F3F46]">
                              —
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Mobile: capability cards with stacked mode pills */}
          <div className="lg:hidden space-y-4">
            {capabilityOrder.map((capKey, i) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              return (
                <motion.div
                  key={capKey}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#06B6D4]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#FAFAFA]">{cap.label}</h3>
                      <p className="text-xs text-[#71717A] mt-0.5 leading-snug">
                        {cap.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {modes.map((m) => {
                      const slug = matrix[capKey][m.key]
                      const tier = slug ? tiersBySlug[slug] : null
                      return tier ? (
                        <Link
                          key={m.key}
                          href={`/services/${tier.slug}`}
                          className="rounded-lg bg-[#06B6D4]/[0.04] border border-[#06B6D4]/20 p-2.5 hover:border-[#06B6D4]/60 transition-colors"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4] mb-0.5">
                            {m.label}
                          </div>
                          <div className="text-sm font-semibold text-[#FAFAFA] leading-tight">
                            {tier.shortName}
                          </div>
                          <div className="text-xs text-[#71717A] mt-0.5">
                            {tier.price}
                          </div>
                        </Link>
                      ) : (
                        <div
                          key={m.key}
                          className="rounded-lg border border-dashed border-[#27272A] p-2.5"
                        >
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[#3F3F46]">
                            {m.label}
                          </div>
                          <div className="text-xs font-mono text-[#3F3F46] mt-1">—</div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Capability deep links */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>By capability</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-8">
            Explore by service line
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilityOrder.map((capKey, i) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              const tierCount = cap.tierSlugs.length
              const firstTier = tiersBySlug[cap.tierSlugs[0]]
              return (
                <motion.div
                  key={capKey}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                >
                  <GlowCard glowColor="cyan" className="h-full">
                    <div className="p-5 h-full flex flex-col">
                      <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center mb-3">
                        <Icon className="w-4 h-4 text-[#06B6D4]" />
                      </div>
                      <h3 className="font-semibold text-[#FAFAFA] mb-1">
                        {cap.label}
                      </h3>
                      <p className="text-sm text-[#A1A1AA] leading-snug mb-4 flex-1">
                        {cap.tagline}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cap.tierSlugs.map((slug) => {
                          const t = tiersBySlug[slug]
                          if (!t) return null
                          return (
                            <Link
                              key={slug}
                              href={`/services/${slug}`}
                              className="text-xs font-mono text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded hover:bg-[#06B6D4]/20 transition-colors"
                            >
                              {t.shortName}
                            </Link>
                          )
                        })}
                      </div>
                      {firstTier && (
                        <Link
                          href={`/services/${firstTier.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#71717A] hover:text-[#06B6D4] transition-colors"
                        >
                          {tierCount} {tierCount === 1 ? 'tier' : 'tiers'} · explore
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </GlowCard>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl bg-gradient-to-br from-[#06B6D4]/10 via-[#0F0F12] to-[#8B5CF6]/10 border border-[#06B6D4]/20 p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-3">
            Not sure which capability you need?
          </h2>
          <p className="text-[#A1A1AA] mb-8 max-w-lg mx-auto">
            Book a 30-minute discovery call. We&apos;ll talk through what you&apos;re
            building and which row + column fits.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-[#09090B] font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Book a Discovery Call
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
