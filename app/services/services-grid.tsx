'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock } from 'lucide-react'
import type { Tier } from '@/data/services/tiers'
import { GlowCard } from '@/components/glow-card'

const cadenceLabel: Record<Tier['cadence'], string> = {
  'one-time': 'One-time',
  monthly: '/mo',
  custom: 'Custom',
}

export function ServicesGrid({ tiers }: { tiers: readonly Tier[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tiers.map((tier, index) => (
        <motion.div
          key={tier.slug}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.07 }}
        >
          <GlowCard
            glowColor={tier.highlight ? 'gradient' : 'cyan'}
            className={`h-full flex flex-col ${tier.highlight ? 'border-[#06B6D4]/40' : ''}`}
          >
            <div className="p-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#FAFAFA]">{tier.name}</h3>
                  <p className="text-sm text-[#A1A1AA] mt-0.5">{tier.tagline}</p>
                </div>
                {tier.highlight && (
                  <span className="text-xs font-mono text-[#06B6D4] bg-[#06B6D4]/10 border border-[#06B6D4]/20 px-2 py-0.5 rounded-full shrink-0 ml-2">
                    Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[#FAFAFA]">{tier.price}</span>
                {tier.cadence === 'monthly' && (
                  <span className="text-[#71717A] text-sm">/mo</span>
                )}
              </div>

              {/* Cadence + Timeline */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">
                  {cadenceLabel[tier.cadence]}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#71717A]">
                  <Clock className="w-3 h-3" />
                  {tier.timeline}
                </span>
              </div>

              {/* Primary outcome */}
              <ul className="space-y-1.5 mb-6 flex-1">
                {tier.outcomes.slice(0, 2).map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                    <Check className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                    {outcome}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/services/${tier.slug}`}
                className="inline-flex items-center justify-center w-full rounded-lg border border-[#27272A] bg-[#18181B] hover:border-[#06B6D4]/60 hover:text-[#06B6D4] text-[#FAFAFA] text-sm font-medium py-2.5 px-4 transition-all duration-200 gap-2 group"
              >
                View {tier.shortName}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </GlowCard>
        </motion.div>
      ))}
    </div>
  )
}
