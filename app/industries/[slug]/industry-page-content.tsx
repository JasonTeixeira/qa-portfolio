'use client'

import Link from 'next/link'
import { Check, AlertTriangle, Briefcase, Tag } from 'lucide-react'
import type { Vertical } from '@/data/industries/verticals'
import { tiersBySlug } from '@/data/services/tiers'
import { caseStudies } from '@/data/work/case-studies'
import { Section, Surface, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'
import { motion } from 'framer-motion'
import { DynamicRouteDeepening } from '@/components/living/DynamicRouteDeepening'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const STACK_PHRASE: Record<string, string> = {
  fintech: 'fintech',
  saas: 'SaaS',
  ecommerce: 'e-commerce',
  healthcare: 'healthcare',
  'ai-startups': 'AI',
}

export function IndustryPageContent({ vertical: v }: { vertical: Vertical }) {
  const tiers = v.recommendedTiers
    .map((slug) => tiersBySlug[slug])
    .filter(Boolean)

  const studies = caseStudies.filter((cs) =>
    v.relevantCaseStudySlugs.includes(cs.slug)
  )

  const stackPhrase = STACK_PHRASE[v.slug] ?? v.shortName

  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label={`${v.name} industry`}
        className="relative pt-28 pb-16 sm:pt-32 lg:pt-36 border-b border-[var(--sage-border)]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
            className="max-w-3xl"
          >
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2">
              <Link
                href="/industries"
                className="text-[11px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] hover:text-[#0ED3CF] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                Industries
              </Link>
              <span className="text-[var(--sage-ink-faint)]">·</span>
              <MonoLabel tone="accent">{v.shortName}</MonoLabel>
            </div>

            <div className="mb-7 flex items-center gap-4">
              <MonoLabel tone="accent">01</MonoLabel>
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// industry'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>

            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
              style={HEADING_STYLE}
            >
              {v.heroH1}
            </h1>
            <p className="mt-3 text-base text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.08em]">{v.tagline}</p>
            <p className="mt-5 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
              {v.intro}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href={`/book?industry=${v.slug}`} variant="solid" event={`cta_industry_${v.slug}_hero`}>
                Book a Discovery Call
              </CtaLink>
              <CtaLink href="/services" variant="ghost" arrow={false}>
                Browse all services
              </CtaLink>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-24 space-y-0">
        {/* Why us */}
        <Section
          eyebrow="why us"
          heading={`Why Sage Ideas for ${v.shortName}`}
          ariaLabel="Why choose us"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {v.whyUs.map((bullet, i) => (
              <Reveal key={bullet} delay={i * 0.06}>
                <Surface level={2} className="flex items-start gap-3 p-5">
                  <div className="w-6 h-6 rounded-full bg-[#0ED3CF]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#0ED3CF]" aria-hidden />
                  </div>
                  <span className="text-sm text-[var(--sage-ink-muted)] leading-relaxed">
                    {bullet}
                  </span>
                </Surface>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Challenges */}
        {v.challenges.length > 0 && (
          <Section
            eyebrow="challenges"
            heading="What we solve"
            lede={`The specific operational challenges we've already debugged in the ${stackPhrase} stack.`}
            ariaLabel="Challenges we solve"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {v.challenges.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.07}>
                  <Surface level={2} className="p-5 group hover:border-[#E85D3A]/30 transition-colors">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-9 h-9 rounded-[3px] bg-[#E85D3A]/10 border border-[#E85D3A]/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-[#E85D3A]" aria-hidden />
                      </div>
                      <h3 className="text-sm text-[var(--sage-ink)] leading-tight pt-2">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed">
                      {c.description}
                    </p>
                  </Surface>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* Recommended tiers */}
        {tiers.length > 0 && (
          <Section
            eyebrow="engagements"
            heading="Recommended tiers"
            lede={`Productized engagements ordered by relevance to ${v.shortName.toLowerCase()} workloads.`}
            ariaLabel="Recommended service tiers"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiers.map((tier, i) => (
                <Reveal key={tier.slug} delay={i * 0.06}>
                  <Link
                    href={`/services/${tier.slug}`}
                    className="group block h-full"
                  >
                    <Surface level={2} interactive ticks className="p-5 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="text-sm text-[var(--sage-ink)] group-hover:text-[#0ED3CF] transition-colors">
                          {tier.name}
                        </h3>
                        {tier.highlight && (
                          <MonoLabel tone="accent" className="shrink-0 px-1.5 py-0.5 border border-[#0ED3CF]/30 bg-[#0ED3CF]/10 rounded-[3px]">
                            POPULAR
                          </MonoLabel>
                        )}
                      </div>
                      <p className="text-sm text-[var(--sage-ink-muted)] leading-snug mb-4 flex-1">
                        {tier.tagline}
                      </p>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-2xl text-[var(--sage-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                          {tier.price}
                        </span>
                        {tier.cadence === 'monthly' && (
                          <MonoLabel tone="faint">/mo</MonoLabel>
                        )}
                      </div>
                      <MonoLabel tone="faint" as="p" className="mb-3">
                        {tier.timeline}
                      </MonoLabel>
                      <span className="inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.12em] text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace] mt-auto">
                        View tier →
                      </span>
                    </Surface>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* Related case studies */}
        {studies.length > 0 && (
          <Section
            eyebrow="proof"
            heading="Relevant work"
            ariaLabel="Related case studies"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {studies.map((cs, i) => (
                <Reveal key={cs.slug} delay={i * 0.07}>
                  <Link
                    href={`/work/${cs.slug}`}
                    className="group block h-full"
                  >
                    <Surface level={2} interactive className="p-6 h-full">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[3px] bg-[#0ED3CF]/10 border border-[#0ED3CF]/20 flex items-center justify-center shrink-0">
                          <Briefcase className="w-4 h-4 text-[#0ED3CF]" aria-hidden />
                        </div>
                        <div className="flex-1">
                          <MonoLabel tone="faint" as="p">{cs.category}</MonoLabel>
                          <h3 className="text-sm text-[var(--sage-ink)] group-hover:text-[#0ED3CF] transition-colors mt-0.5 leading-tight">
                            {cs.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed mb-3">
                        {cs.tagline}
                      </p>
                      {/* span — not a link; the wrapping <Link> already covers navigation */}
                      <span className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-[var(--sage-ink-muted)] group-hover:text-[#0ED3CF] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]">
                        <span>Read case study</span>
                        <span aria-hidden>→</span>
                      </span>
                    </Surface>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* FAQ */}
        {v.faq.length > 0 && (
          <Section
            eyebrow="faq"
            heading={`${v.shortName} questions`}
            ariaLabel="Frequently asked questions"
          >
            <div className="space-y-4">
              {v.faq.map((item, i) => (
                <Reveal key={item.q} delay={i * 0.06}>
                  <Surface level={2} className="p-6">
                    <h3 className="text-sm text-[var(--sage-ink)] mb-2">{item.q}</h3>
                    <p className="text-sm text-[var(--sage-ink-muted)] leading-relaxed">
                      {item.a}
                    </p>
                  </Surface>
                </Reveal>
              ))}
            </div>
          </Section>
        )}

        {/* Keywords */}
        {v.keywords.length > 0 && (
          <Reveal>
            <section
              aria-label="Topics"
              className="py-8 border-t border-[var(--sage-border)] flex flex-wrap items-center gap-2"
            >
              <Tag className="w-3.5 h-3.5 text-[var(--sage-ink-faint)]" aria-hidden />
              <MonoLabel tone="faint" className="mr-2">Topics</MonoLabel>
              {v.keywords.map((kw) => (
                <span
                  key={kw}
                  className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[var(--sage-ink-muted)] bg-[var(--sage-surface-2)] border border-[var(--sage-border)] px-2 py-0.5 rounded-[3px]"
                >
                  {kw}
                </span>
              ))}
            </section>
          </Reveal>
        )}

        <DynamicRouteDeepening
          eyebrow={`${v.shortName} growth system`}
          title="Market pain into shipped leverage."
          body={`This ${v.shortName.toLowerCase()} page now shows the actual system behind the offer: the pain pattern, recommended engagement, proof path, and conversion route for teams comparing options.`}
          nodes={[
            v.shortName,
            tiers[0]?.shortName ?? 'Service',
            studies[0]?.title ?? 'Proof',
            'Discovery',
          ]}
          stats={[
            { label: 'challenges', value: String(v.challenges.length).padStart(2, '0') },
            { label: 'services', value: String(tiers.length).padStart(2, '0') },
            { label: 'proof links', value: String(studies.length).padStart(2, '0') },
          ]}
          architectureTitle="Vertical ⇄ System"
          architectureBody={`The page connects ${v.shortName.toLowerCase()} pain to the service architecture, not just generic agency claims.`}
          architectureSteps={[
            {
              label: 'Read the market constraint',
              detail: v.challenges[0]?.description ?? v.intro,
            },
            {
              label: 'Map the stack',
              detail: `Use the recommended ${stackPhrase} engagements to connect the business problem to a buildable product, automation, or growth system.`,
            },
            {
              label: 'Show adjacent proof',
              detail:
                studies.length > 0
                  ? `Route the visitor into ${studies.map((study) => study.title).join(', ')} for shipped context.`
                  : 'Hold this slot for real screenshots, permitted logos, and case visuals as they become available.',
            },
            {
              label: 'Qualify the next step',
              detail: `Send serious buyers to a ${v.shortName.toLowerCase()} discovery call with the page context preserved.`,
            },
          ]}
          conversionSteps={[
            { label: 'Industry signal', detail: v.tagline },
            {
              label: 'Pain fit',
              detail: v.challenges[0]?.title ?? 'Confirm the operational problem before selling an engagement.',
            },
            {
              label: 'Engagement route',
              detail: tiers[0]
                ? `${tiers[0].name} is the first recommended path for this vertical.`
                : 'Route the buyer to the most relevant studio engagement.',
            },
            { label: 'Discovery', detail: v.ctaLine },
          ]}
          assets={[
            {
              label: `${v.shortName} screenshot`,
              detail: 'Add a real industry-relevant product screenshot or workflow visual when approved.',
            },
            {
              label: 'Case study visual',
              detail: studies[0]
                ? `Connect this slot to real visuals from ${studies[0].title}.`
                : 'Hold for a verified case-study image.',
            },
            {
              label: 'Permissioned proof',
              detail: 'Only show client logos, quotes, or outcomes after explicit permission.',
            },
          ]}
          cta={{ label: `Book ${v.shortName} discovery`, href: `/book?industry=${v.slug}` }}
        />

        {/* CTA */}
        <Section
          eyebrow="discovery"
          heading={<>{v.ctaLine}</>}
          lede={`Book a 30-minute discovery call. We'll talk through your ${stackPhrase} stack and tell you directly which engagement — if any — is the right fit.`}
          centered
          grain
          action={
            <CtaLink href={`/book?industry=${v.slug}`} variant="solid" event={`cta_industry_${v.slug}_footer`}>
              Book a Discovery Call
            </CtaLink>
          }
        />
      </div>
    </div>
  )
}
