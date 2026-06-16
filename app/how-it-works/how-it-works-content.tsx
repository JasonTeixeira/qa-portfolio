'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Compass, ShieldCheck, Sparkles } from 'lucide-react'
import { Pipeline } from '@/components/pipeline'
import {
  pipelinesBySlug,
  productizedPipelineSlugs,
  carePipelineSlugs,
  studioJourney,
} from '@/data/pipelines'
import { tiersBySlug, careTiersBySlug } from '@/data/services/tiers'
import { cn } from '@/lib/utils'
import { Section, Surface, Hairline, MonoLabel, CtaLink } from '@/components/el'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

type Group = 'all' | 'productized' | 'care'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

export function HowItWorksContent() {
  const [group, setGroup] = useState<Group>('all')

  const visibleSlugs = useMemo(() => {
    if (group === 'productized') return productizedPipelineSlugs
    if (group === 'care') return carePipelineSlugs
    return [...productizedPipelineSlugs, ...carePipelineSlugs]
  }, [group])

  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label="How it works"
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
              <MonoLabel tone="muted">{'// pipelines'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>
            <h1
              className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
              style={HEADING_STYLE}
            >
              Every service, end to end —{' '}
              <em className="not-italic text-[#0ED3CF]">visualized stage by stage.</em>
            </h1>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
              No more guessing what you are paying for. Each engagement is mapped
              as an interactive pipeline so you can see what happens on day one,
              what we ship at handoff, and what optional Care looks like after.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CtaLink href="/contact" variant="solid" event="cta_how_it_works_hero">
                Book a free intro chat
              </CtaLink>
              <CtaLink href="/services" variant="ghost" arrow={false}>
                See pricing
              </CtaLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Studio Journey */}
      <section
        aria-label="Studio journey"
        className="relative py-16 sm:py-20 border-b border-[var(--sage-border)]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Surface level={1} ticks className="p-6 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <MonoLabel tone="accent">{'// the sage ideas studio journey'}</MonoLabel>
            </div>
            <Pipeline pipeline={studioJourney} />
          </Surface>
        </div>
      </section>

      {/* Promises strip */}
      <section
        aria-label="Studio promises"
        className="relative py-16 sm:py-20 border-b border-[var(--sage-border)]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-px sm:grid-cols-3 rounded-[3px] overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-border)]">
          <PromiseCard
            icon={Compass}
            title="No surprises"
            body="Plain-English scope, fixed price for productized tiers, written change-control if scope shifts."
          />
          <PromiseCard
            icon={Sparkles}
            title="Built in the open"
            body="Daily-updated staging links, weekly Loom walkthroughs, async status. You always know where things stand."
          />
          <PromiseCard
            icon={ShieldCheck}
            title="Optional Care"
            body="If you want me on call after launch, a Care retainer covers it monthly. Cancel anytime."
          />
        </div>
      </section>

      {/* Filter chips */}
      <section
        aria-label="Filter pipelines"
        className="relative pt-12 pb-6"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <MonoLabel tone="faint" className="mr-2">Show:</MonoLabel>
            {(
              [
                { id: 'all', label: 'All services' },
                { id: 'productized', label: 'Productized tiers' },
                { id: 'care', label: 'Care retainers' },
              ] as const
            ).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                className={cn(
                  'rounded-[3px] border px-4 py-1.5 text-[11px] uppercase tracking-[0.12em] font-normal transition-all [font-family:var(--font-mono),ui-monospace,monospace]',
                  group === g.id
                    ? 'border-[#0ED3CF] bg-[#0ED3CF]/10 text-[#0ED3CF]'
                    : 'border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] text-[var(--sage-ink-muted)] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]',
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Per-service pipelines */}
      <section aria-label="Service pipelines" className="relative pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 space-y-8">
          {visibleSlugs.map((slug) => {
            const pipeline = pipelinesBySlug[slug]
            if (!pipeline) return null
            const isCare = (carePipelineSlugs as readonly string[]).includes(slug)
            const tier = isCare ? careTiersBySlug[slug] : tiersBySlug[slug]
            const ctaHref = `/services/${slug}`
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
              >
                <Surface level={1} className="p-6 md:p-10">
                  <Pipeline pipeline={pipeline} />
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--sage-border)] pt-6">
                    <div>
                      <MonoLabel tone="faint" as="p">
                        {isCare ? 'Care retainer' : 'Productized tier'}
                      </MonoLabel>
                      <p className="mt-1 text-base text-[var(--sage-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
                        {tier?.name ?? pipeline.title}
                        {tier && (
                          <span className="ml-2 [font-family:var(--font-mono),ui-monospace,monospace] text-sm text-[#0ED3CF]">
                            {('price' in (tier ?? {}) ? tier.price : '')}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <CtaLink href={ctaHref} variant="ghost" arrow={false}>
                        Service details
                      </CtaLink>
                      <CtaLink href="/contact" variant="solid" event="cta_pipeline_book">
                        Book a free intro
                      </CtaLink>
                    </div>
                  </div>
                </Surface>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* CTA footer */}
      <Section
        eyebrow="custom & retainers"
        heading={<>Not sure which<br /><em className="not-italic text-[#0ED3CF]">pipeline fits?</em></>}
        lede="If your project does not slot into a productized tier — bigger scope, hybrid engagement, or ongoing monthly work — we run a custom proposal off a 20-minute intro chat. No pressure, no pitch deck, just an honest fit check."
        centered
        grain
        action={
          <CtaLink href="/contact" variant="solid" event="cta_how_it_works_footer">
            Start with a free intro chat
          </CtaLink>
        }
      />
    </div>
  )
}

function PromiseCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles
  title: string
  body: string
}) {
  return (
    <div className="bg-[var(--sage-surface-1)] px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="grid h-9 w-9 place-items-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)]">
          <Icon className="h-4 w-4 text-[#0ED3CF]" aria-hidden />
        </span>
        <h3 className="text-sm font-normal text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.1em]">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-[var(--sage-ink-muted)]">{body}</p>
    </div>
  )
}
