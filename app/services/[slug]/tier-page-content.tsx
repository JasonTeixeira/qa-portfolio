'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X, Clock, Zap } from 'lucide-react'
import type { Tier } from '@/data/services/tiers'
import { SectionLabel } from '@/components/section-label'
import { Button } from '@/components/ui/button'
import { GlowCard } from '@/components/glow-card'
import { CheckoutButton } from '@/components/studio/checkout-button'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55 },
}

const cadenceLabel: Record<Tier['cadence'], string> = {
  'one-time': 'One-time payment',
  monthly: 'Monthly subscription',
  custom: 'Custom — starts after discovery',
}

export function TierPageContent({ tier }: { tier: Tier }) {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUp.transition}
            className="max-w-3xl"
          >
            <SectionLabel>Service</SectionLabel>
            <h1 className="mt-4 text-5xl sm:text-6xl font-bold text-[#FAFAFA] leading-tight">
              {tier.name}
            </h1>
            <p className="mt-3 text-xl text-[#06B6D4] font-medium">{tier.tagline}</p>
            <p className="mt-4 text-lg text-[#A1A1AA] leading-relaxed max-w-2xl">
              {tier.description}
            </p>

            {/* Price + cadence chip */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#FAFAFA]">{tier.price}</span>
                {tier.cadence === 'monthly' && (
                  <span className="text-[#71717A] text-base">/mo</span>
                )}
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-mono text-[#A1A1AA] bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                {tier.timeline}
              </span>
              <span className="text-xs font-mono text-[#71717A] bg-[#27272A] px-3 py-1 rounded-full">
                {cadenceLabel[tier.cadence]}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <CheckoutButton tier={tier} />
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
              >
                <Link href={`/book?tier=${tier.slug}`}>
                  Book a discovery call
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-20">
        {/* What you get */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Outcomes</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">What you get</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tier.outcomes.map((outcome, i) => (
              <motion.div
                key={outcome}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#0F0F12] border border-[#27272A]"
              >
                <div className="w-6 h-6 rounded-full bg-[#06B6D4]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-[#06B6D4]" />
                </div>
                <span className="text-[#A1A1AA] leading-snug">{outcome}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Deliverables */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <SectionLabel>Deliverables</SectionLabel>
          <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">What&apos;s included</h2>
          <GlowCard>
            <div className="p-6 sm:p-8">
              <ul className="space-y-3">
                {tier.deliverables.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="flex items-start gap-3 text-[#A1A1AA]"
                  >
                    <Zap className="w-4 h-4 text-[#06B6D4] shrink-0 mt-1" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>
          </GlowCard>
        </motion.section>

        {/* Not included */}
        {tier.notIncluded.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Scope</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">Not included</h2>
            <div className="rounded-xl border border-[#27272A]/60 bg-[#0F0F12]/50 p-6">
              <ul className="space-y-2.5">
                {tier.notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[#71717A] text-sm">
                    <X className="w-4 h-4 text-[#3F3F46] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* FAQ */}
        {tier.faq.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">Frequently asked</h2>
            <div className="space-y-4">
              {tier.faq.map((item, i) => (
                <motion.div
                  key={item.q}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-6"
                >
                  <h3 className="text-[#FAFAFA] font-semibold mb-2">{item.q}</h3>
                  <p className="text-[#A1A1AA] leading-relaxed text-sm">{item.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Final CTA strip */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl bg-gradient-to-br from-[#06B6D4]/10 via-[#0F0F12] to-[#8B5CF6]/10 border border-[#06B6D4]/20 p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-3">
            Ready to get started?
          </h2>
          <p className="text-[#A1A1AA] mb-8 max-w-lg mx-auto">
            {tier.price} · {tier.timeline}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <CheckoutButton tier={tier} />
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
            >
              <Link href={`/book?tier=${tier.slug}`}>
                Book a discovery call
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
