'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import type { Tier } from '@/data/services/tiers'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { CheckoutButton } from '@/components/studio/checkout-button'

const pricingFaq = [
  {
    q: "Why are the prices fixed and not 'starting from'?",
    a: "\"Starting from\" means you won't know the real price until after you've invested time in a sales conversation. Fixed prices respect your time and ours. Scope is defined before work begins, and both parties agree in writing.",
  },
  {
    q: "Can I change tiers mid-engagement?",
    a: "For active one-time engagements (Audit, Ship, Automate), scope changes are handled via a written amendment — any addition is estimated and approved before work begins. Monthly tiers (Scale, Operate) can be upgraded or paused at the next renewal with 30 days notice.",
  },
  {
    q: "Do you take equity?",
    a: "For pre-revenue startups in specific circumstances: yes, but only as a partial arrangement (cash + equity, not equity-only). Contact us directly for Build engagements where equity is part of the discussion.",
  },
  {
    q: "What if my project doesn't fit any of these tiers?",
    a: "The Build tier (from $25,000) is specifically designed for projects that need custom scoping. Book a discovery call and we'll define scope and price together.",
  },
  {
    q: "What's the cancellation policy?",
    a: "One-time engagements (Audit, Ship, Automate) are non-refundable once work begins. Scale and Operate subscriptions can cancel after the minimum 3-month commitment with 30 days written notice. If we haven't started work, we issue a full refund.",
  },
  {
    q: "International clients and taxes/VAT?",
    a: "We work with international clients. Stripe handles currency conversion. Clients outside the US are responsible for any applicable VAT or GST in their jurisdiction. We do not add VAT on top of listed prices.",
  },
]

const tableColumns = [
  { label: 'Tier', key: 'name' },
  { label: 'Price', key: 'price' },
  { label: 'Timeline', key: 'timeline' },
  { label: 'Best for', key: 'bestFor' },
]

const bestForMap: Record<string, string> = {
  audit: "Teams who suspect they're leaving velocity on the table",
  ship: 'Founders who need a production marketing site fast',
  automate: 'Ops teams drowning in a manual workflow',
  scale: 'Growing businesses investing in long-term organic traffic',
  build: 'Founders building a full-stack product from scratch',
  operate: 'Post-launch teams that need senior engineering leadership',
}

export function PricingContent({ tiers }: { tiers: readonly Tier[] }) {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <SectionLabel>Pricing</SectionLabel>
            <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#FAFAFA] leading-tight">
              Pricing — clear,{' '}
              <span className="text-[#06B6D4]">productized.</span>
            </h1>
            <p className="mt-6 text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              Every tier has a defined scope and a defined price. You know what you&apos;re
              getting before anything starts. No retainer ambiguity, no scope creep, no
              &ldquo;it depends.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-24">
        {/* Comparison Table */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Comparison</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-6">All tiers at a glance</h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-[#27272A] bg-[#0F0F12]">
            {/* Header row */}
            <div className="grid grid-cols-4 border-b border-[#27272A]">
              {tableColumns.map((col) => (
                <div
                  key={col.key}
                  className="px-5 py-3 text-xs font-mono uppercase tracking-widest text-[#71717A]"
                >
                  {col.label}
                </div>
              ))}
            </div>
            {/* Data rows */}
            {tiers.map((tier, i) => (
              <Link
                key={tier.slug}
                href={`/services/${tier.slug}`}
                className={`grid grid-cols-4 items-center hover:bg-[#18181B] transition-colors group ${
                  i < tiers.length - 1 ? 'border-b border-[#27272A]/60' : ''
                }`}
              >
                <div className="px-5 py-4 flex items-center gap-2">
                  <span className="font-semibold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors">
                    {tier.name}
                  </span>
                  {tier.highlight && (
                    <span className="text-xs text-[#06B6D4] font-mono bg-[#06B6D4]/10 px-1.5 py-0.5 rounded">
                      Popular
                    </span>
                  )}
                </div>
                <div className="px-5 py-4 font-mono font-semibold text-[#FAFAFA]">
                  {tier.price}
                  {tier.cadence === 'monthly' && (
                    <span className="text-[#71717A] text-xs">/mo</span>
                  )}
                </div>
                <div className="px-5 py-4 text-[#A1A1AA] text-sm">{tier.timeline}</div>
                <div className="px-5 py-4 text-[#71717A] text-sm flex items-center gap-1.5">
                  <span className="flex-1">{bestForMap[tier.slug]}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#06B6D4]" />
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/services/${tier.slug}`}
                  className="block rounded-xl border border-[#27272A] bg-[#0F0F12] p-4 hover:border-[#06B6D4]/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-[#FAFAFA]">{tier.name}</span>
                    <span className="font-mono font-bold text-[#FAFAFA] text-sm">
                      {tier.price}
                      {tier.cadence === 'monthly' && (
                        <span className="text-[#71717A] text-xs">/mo</span>
                      )}
                    </span>
                  </div>
                  <p className="text-[#71717A] text-sm">{bestForMap[tier.slug]}</p>
                  <p className="text-[#71717A] text-xs mt-1 font-mono">{tier.timeline}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Tier cards with CTAs */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Tiers</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-8">
            Choose your engagement
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <GlowCard
                  glowColor={tier.highlight ? 'gradient' : 'cyan'}
                  className={`h-full flex flex-col ${tier.highlight ? 'border-[#06B6D4]/40' : ''}`}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-bold text-[#FAFAFA]">{tier.name}</h3>
                      {tier.highlight && (
                        <span className="text-xs font-mono text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#A1A1AA] mb-4">{tier.tagline}</p>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-[#FAFAFA]">{tier.price}</span>
                      {tier.cadence === 'monthly' && (
                        <span className="text-[#71717A] text-sm">/mo</span>
                      )}
                    </div>
                    <ul className="space-y-1.5 mb-6 flex-1">
                      {tier.outcomes.slice(0, 2).map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                          <Check className="w-3.5 h-3.5 text-[#06B6D4] shrink-0 mt-0.5" />
                          {o}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2 mt-auto">
                      <CheckoutButton tier={tier} />
                      <Link
                        href={`/services/${tier.slug}`}
                        className="text-center text-sm text-[#71717A] hover:text-[#06B6D4] transition-colors"
                      >
                        View full details →
                      </Link>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pricing FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-3 text-2xl font-bold text-[#FAFAFA] mb-8">Pricing questions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pricingFaq.map((item, i) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-6"
              >
                <h3 className="font-semibold text-[#FAFAFA] mb-2 text-sm">{item.q}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-[#27272A] bg-[#0F0F12] p-8 sm:p-12 text-center"
        >
          <p className="text-[#71717A] text-sm font-mono uppercase tracking-widest mb-3">
            Still not sure?
          </p>
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-4">
            Book a free 30-minute call.
          </h2>
          <p className="text-[#A1A1AA] max-w-md mx-auto mb-6 text-sm">
            No pitch deck, no obligation. We&apos;ll talk through your project and tell you
            directly which engagement — if any — is the right fit.
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
