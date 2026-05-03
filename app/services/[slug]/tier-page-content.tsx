'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  X,
  Clock,
  Zap,
  Calendar,
  TrendingUp,
  Plus,
  FileText,
  Download,
  Briefcase,
} from 'lucide-react'
import type { Tier } from '@/data/services/tiers'
import { caseStudies } from '@/data/work/case-studies'
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

const modeLabel: Record<Tier['mode'], string> = {
  audit: 'Audit',
  sprint: 'Sprint',
  build: 'Build',
  operate: 'Operate',
}

export function TierPageContent({ tier }: { tier: Tier }) {
  const relatedStudies = caseStudies.filter((cs) =>
    tier.caseStudySlugs.includes(cs.slug)
  )

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
            {/* Capability + Mode breadcrumb */}
            <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-[#71717A]">
              <Link
                href="/capabilities"
                className="hover:text-[#06B6D4] transition-colors"
              >
                Capabilities
              </Link>
              <span>·</span>
              <span className="text-[#A1A1AA] capitalize">{tier.capability}</span>
              <span>·</span>
              <span className="text-[#06B6D4]">{modeLabel[tier.mode]}</span>
            </div>

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
        {/* Result metrics — quick proof strip */}
        {tier.resultMetrics.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>By the numbers</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">
              Typical results
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tier.resultMetrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-6 hover:border-[#06B6D4]/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                      {m.context ?? 'Result'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-[#FAFAFA] tabular-nums">
                    {m.value}
                  </div>
                  <div className="text-sm text-[#A1A1AA] mt-1">{m.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

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

        {/* Methodology / Phases — Timeline strip */}
        {tier.phases.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Methodology</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-2">
              How we run this
            </h2>
            <p className="text-[#A1A1AA] mb-8 max-w-2xl">
              Phase-by-phase breakdown of the engagement. Every milestone produces a
              concrete artifact you can see, share, or hand off.
            </p>

            {/* Timeline gantt-style strip */}
            <div className="space-y-6">
              {tier.phases.map((phase, i) => (
                <motion.div
                  key={phase.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < tier.phases.length - 1 && (
                    <div className="absolute left-[27px] top-14 bottom-[-24px] w-px bg-gradient-to-b from-[#06B6D4]/40 to-[#27272A]" />
                  )}

                  <div className="flex gap-4 sm:gap-6">
                    {/* Index badge */}
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-[#0F0F12] border border-[#06B6D4]/30 flex flex-col items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#06B6D4] mb-0.5" />
                      <span className="text-[9px] font-mono text-[#71717A] uppercase tracking-tight">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 rounded-xl bg-[#0F0F12] border border-[#27272A] p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded">
                          {phase.label}
                        </span>
                        <h3 className="text-lg font-semibold text-[#FAFAFA]">
                          {phase.title}
                        </h3>
                      </div>
                      <p className="text-[#A1A1AA] text-sm leading-relaxed mb-3">
                        {phase.description}
                      </p>
                      {phase.artifacts && phase.artifacts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#27272A]">
                          {phase.artifacts.map((a) => (
                            <span
                              key={a}
                              className="inline-flex items-center gap-1 text-xs font-mono text-[#71717A] bg-[#18181B] border border-[#27272A] px-2 py-0.5 rounded"
                            >
                              <FileText className="w-3 h-3" />
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

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

        {/* Sample artifact */}
        {tier.sampleArtifact && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Sample</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">
              See what you&apos;ll get
            </h2>
            <div className="rounded-2xl bg-gradient-to-br from-[#0F0F12] via-[#0F0F12] to-[#06B6D4]/5 border border-[#27272A] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="shrink-0 w-16 h-20 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-[#06B6D4]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#FAFAFA] mb-2">
                    {tier.sampleArtifact.title}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed mb-4">
                    {tier.sampleArtifact.description}
                  </p>
                  {tier.sampleArtifact.comingSoon ? (
                    <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#71717A] bg-[#18181B] border border-[#27272A] px-3 py-1.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      Sample available on request
                    </span>
                  ) : tier.sampleArtifact.href ? (
                    <Link
                      href={tier.sampleArtifact.href}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#06B6D4] hover:text-[#0EA5E9] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download sample (PDF)
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Add-ons */}
        {tier.addOns.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Add-ons</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-2">
              Extend the engagement
            </h2>
            <p className="text-[#A1A1AA] mb-8 max-w-2xl">
              Optional add-ons priced separately. Bundle at checkout or scope into a
              follow-on engagement.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {tier.addOns.map((addOn, i) => (
                <motion.div
                  key={addOn.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl bg-[#0F0F12] border border-[#27272A] p-5 hover:border-[#8B5CF6]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#8B5CF6]" />
                      <h3 className="font-semibold text-[#FAFAFA]">{addOn.name}</h3>
                    </div>
                    <span className="text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2 py-0.5 rounded shrink-0">
                      {addOn.price}
                    </span>
                  </div>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {addOn.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

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
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[#71717A] text-sm"
                  >
                    <X className="w-4 h-4 text-[#3F3F46] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* Related case studies */}
        {relatedStudies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <SectionLabel>Proof</SectionLabel>
            <h2 className="mt-3 text-3xl font-bold text-[#FAFAFA] mb-8">
              Related case studies
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {relatedStudies.map((cs, i) => (
                <motion.div
                  key={cs.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link
                    href={`/work/${cs.slug}`}
                    className="block h-full rounded-xl bg-[#0F0F12] border border-[#27272A] p-6 hover:border-[#06B6D4]/40 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-[#06B6D4]" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                          {cs.category}
                        </span>
                        <h3 className="font-semibold text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors mt-0.5 leading-tight">
                          {cs.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                      {cs.tagline}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-[#06B6D4]">
                      Read case study
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
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
