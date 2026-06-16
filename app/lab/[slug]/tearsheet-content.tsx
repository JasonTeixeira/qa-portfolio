'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Github, ExternalLink, Briefcase } from 'lucide-react'
import { Surface, Hairline, MonoLabel, CtaLink, StatDisplay, Reveal } from '@/components/el'
import { type LabProduct } from '@/data/lab/products'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'
import { DynamicRouteDeepening } from '@/components/living/DynamicRouteDeepening'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const statusStyles: Record<string, string> = {
  Production: 'text-[#A8C633] bg-[#A8C633]/10 border-[#A8C633]/30',
  Beta: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  Alpha: 'text-[var(--sage-ink-muted)] bg-[var(--sage-surface-3)] border-[var(--sage-border-strong)]',
  'Pre-launch': 'text-[#0ED3CF] bg-[#0ED3CF]/10 border-[#0ED3CF]/30',
}

const statusDot: Record<string, string> = {
  Production: 'bg-[#A8C633]',
  Beta: 'bg-[#F59E0B]',
  Alpha: 'bg-[var(--sage-ink-faint)]',
  'Pre-launch': 'bg-[#0ED3CF]',
}

const PRODUCT_SCREENSHOTS: Record<string, string> = {
  nexural: '/work/screens/nexural-1.png',
  jobpoise: '/work/screens/jobpoise-1.png',
  trayd: '/work/screens/trayd-1.png',
  alphastream: '/work/screens/alphastream-1.png',
}

interface Props {
  product: LabProduct
}

export function TearsheetContent({ product }: Props) {
  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24">
        {/* Back */}
        <div className="mb-10">
          <Link
            href="/lab"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] hover:text-[var(--sage-ink-muted)] transition-colors [font-family:var(--font-mono),ui-monospace,monospace]"
          >
            <ArrowLeft className="w-3 h-3" aria-hidden /> The Lab
          </Link>
        </div>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
          className="mb-16 border-b border-[var(--sage-border)] pb-16"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.18em] border ${
                statusStyles[product.status] ?? statusStyles['Pre-launch']
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[product.status] ?? statusDot['Pre-launch']}`} aria-hidden />
              {product.status_note ?? product.status}
            </span>
            <MonoLabel tone="faint">{product.category}</MonoLabel>
          </div>

          <div className="mb-7 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// tearsheet'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>

          <h1
            className="text-[var(--sage-ink)] font-normal text-[clamp(2.4rem,1.2rem+4vw,5rem)]"
            style={HEADING_STYLE}
          >
            {product.name}
          </h1>
          <p className="mt-4 text-base text-[var(--sage-ink-muted)] max-w-2xl">{product.tagline}</p>
          <p className="mt-4 text-sm text-[var(--sage-ink-faint)] max-w-2xl leading-relaxed">{product.description}</p>

          {/* Links */}
          {product.links && (
            <div className="mt-6 flex flex-wrap gap-3">
              {product.links.github && (
                <a
                  href={product.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-[3px] border border-[var(--sage-border-strong)] text-[var(--sage-ink-muted)] text-[13px] uppercase tracking-[0.08em] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)] transition-all duration-200 [font-family:var(--font-mono),ui-monospace,monospace]"
                >
                  <Github className="w-4 h-4" aria-hidden /> GitHub
                </a>
              )}
              {product.links.site && (
                <a
                  href={product.links.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-[3px] border border-[var(--sage-border-strong)] text-[var(--sage-ink-muted)] text-[13px] uppercase tracking-[0.08em] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)] transition-all duration-200 [font-family:var(--font-mono),ui-monospace,monospace]"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden /> Live site
                </a>
              )}
            </div>
          )}
        </motion.section>

        {/* Metrics grid */}
        {product.metrics && product.metrics.length > 0 && (
          <Reveal className="mb-16">
            <div className="mb-6 flex items-center gap-4">
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// metrics'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>
            <StatDisplay
              stats={product.metrics.slice(0, 4).map((m) => ({ value: m.value, label: m.label }))}
              columns={Math.min(product.metrics.length, 4) as 2 | 3 | 4}
            />
          </Reveal>
        )}

        {/* Thesis */}
        <Reveal className="mb-14">
          <div className="mb-5 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// why we built it'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <p className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] max-w-3xl">{product.thesis}</p>
        </Reveal>

        {/* What it does */}
        <Reveal className="mb-14">
          <div className="mb-5 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// what it does'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <ul className="space-y-3" role="list">
            {product.whatItDoes.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0ED3CF] shrink-0" aria-hidden />
                <span className="text-sm text-[var(--sage-ink-muted)] leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Stack */}
        <Reveal className="mb-14">
          <div className="mb-5 flex items-center gap-4">
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">{'// stack'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <div className="flex flex-wrap gap-2">
            {product.stack.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-[3px] text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-[0.1em] bg-[var(--sage-surface-2)] border border-[var(--sage-border)] text-[var(--sage-ink-muted)]"
              >
                {s}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Related case study */}
        {product.relatedWork && (
          <Reveal className="mb-14">
            <div className="mb-5 flex items-center gap-4">
              <Hairline className="flex-1" />
              <MonoLabel tone="muted">{'// related work'}</MonoLabel>
              <Hairline className="flex-1" strong />
            </div>
            <Link
              href={`/work/${product.relatedWork}`}
              className="group inline-flex items-center gap-3 w-full"
            >
              <Surface level={2} interactive className="p-5 w-full flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#0ED3CF] shrink-0" aria-hidden />
                <div className="flex-1">
                  <MonoLabel tone="faint" as="p">Case study</MonoLabel>
                  <div className="text-sm text-[var(--sage-ink)] mt-0.5">Read the full case study</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#0ED3CF] shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Surface>
            </Link>
          </Reveal>
        )}

        <DynamicRouteDeepening
          eyebrow={`${product.category} system`}
          title="Surface proof, system proof."
          body={`${product.name} is a studio proof object: not just a concept page, but a real product with a problem, stack, operating thesis, and route into deeper case-study proof when available.`}
          nodes={[
            product.name,
            product.stack[0] ?? 'App',
            product.stack[1] ?? 'Data',
            product.status,
          ]}
          stats={[
            { label: 'status', value: product.status },
            { label: 'stack', value: String(product.stack.length).padStart(2, '0') },
            { label: 'metrics', value: String(product.metrics.length).padStart(2, '0') },
          ]}
          architectureTitle="Product ⇄ Engine"
          architectureBody={product.problem}
          architectureSteps={[
            { label: 'Problem', detail: product.problem },
            {
              label: 'Product surface',
              detail: product.whatItDoes[0] ?? product.description,
            },
            {
              label: 'System architecture',
              detail: `Built across ${product.stack.slice(0, 5).join(', ')}${product.stack.length > 5 ? ', and more' : ''}.`,
            },
            {
              label: 'Studio learning',
              detail: product.thesis,
            },
          ]}
          conversionSteps={[
            { label: 'Inspect the product', detail: product.description },
            {
              label: 'Read the mechanics',
              detail: product.whatItDoes.slice(0, 2).join(' '),
            },
            {
              label: 'See related proof',
              detail: product.relatedWork
                ? `Route into the ${product.name} case study for the fuller architecture story.`
                : 'Hold this path until a related case study is published.',
            },
            {
              label: 'Start a similar build',
              detail: 'Use the product as evidence for a focused app, AI system, or SaaS engagement.',
            },
          ]}
          assets={[
            {
              label: `${product.name} screenshot`,
              detail: PRODUCT_SCREENSHOTS[product.slug]
                ? `Verified product/case-study screenshot for ${product.name}.`
                : 'Replace this slot with a real verified product screenshot. Do not present mockups as production screenshots.',
              status: PRODUCT_SCREENSHOTS[product.slug] ? 'ready' : 'needed',
              image: PRODUCT_SCREENSHOTS[product.slug],
              imageAlt: `${product.name} product screenshot`,
            },
            {
              label: 'Architecture visual',
              detail: `Use this slot for a richer custom ${product.name} system diagram or case-study architecture frame.`,
            },
            {
              label: 'Live proof link',
              detail: product.links?.site
                ? `Verified live product URL is available for ${product.name}.`
                : product.links?.github
                  ? `Verified GitHub repository is available for ${product.name}.`
                  : 'Hold for a verified URL, repository, or permissioned proof asset.',
              status: product.links?.site || product.links?.github ? 'ready' : 'needed',
              href: product.links?.site ?? product.links?.github,
            },
          ]}
          cta={{ label: `Build like ${product.name}`, href: '/contact?type=project&source=lab' }}
        />

        {/* Bottom CTA */}
        <Reveal>
          <section
            aria-label="Build with us"
            className="pt-12 border-t border-[var(--sage-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <MonoLabel tone="muted" as="p">Build with us</MonoLabel>
              <p className="mt-2 text-sm text-[var(--sage-ink-muted)] max-w-md">
                Interested in building something like this? Tell us about your project.
              </p>
            </div>
            <CtaLink
              href="/contact?type=project&source=lab"
              variant="solid"
              event={`cta_lab_tearsheet_${product.slug}`}
              className="shrink-0"
            >
              Start a project
            </CtaLink>
          </section>
        </Reveal>
      </div>
    </div>
  )
}
