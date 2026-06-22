'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
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
  Sparkles,
  RefreshCw,
  Smartphone,
} from 'lucide-react'
import {
  capabilities,
  capabilityMatrix,
  capabilityOrder,
  modeMeta,
  tiersBySlug,
  type CapabilityKey,
  type Mode,
  type MatrixCell,
} from '@/data/services/tiers'
import { Section, Surface, Hairline, MonoLabel, CtaLink, Reveal } from '@/components/el'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

const HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const modeIcons: Record<Mode, typeof Eye> = {
  audit: Eye,
  sprint: Rocket,
  build: Hammer,
  operate: Settings,
}

const capabilityIcons: Record<CapabilityKey, typeof Brain> = {
  strategy: Brain,
  web: Globe,
  automation: Workflow,
  seo: Search,
  content: PenLine,
  brand: Palette,
  product: Boxes,
  platform: Server,
  app: Smartphone,
}

type CellTone = 'productized' | 'care' | 'custom'

const toneFor = (cell: MatrixCell): CellTone => {
  if (cell.kind === 'tier') return 'productized'
  if (cell.kind === 'care') return 'care'
  return 'custom'
}

const toneClasses: Record<
  CellTone,
  {
    border: string
    bg: string
    label: string
    iconBg: string
    Icon: typeof CheckCircle2
    badge: string
  }
> = {
  productized: {
    border: 'border-[#3D5AFE]/25 hover:border-[#3D5AFE]/60',
    bg: 'bg-[#3D5AFE]/[0.04] hover:bg-[#3D5AFE]/[0.08]',
    label: 'text-[#3D5AFE]',
    iconBg: 'bg-[#3D5AFE]/10 border-[#3D5AFE]/20',
    Icon: CheckCircle2,
    badge: 'Productized',
  },
  care: {
    border: 'border-[#E85D3A]/25 hover:border-[#E85D3A]/60',
    bg: 'bg-[#E85D3A]/[0.04] hover:bg-[#E85D3A]/[0.08]',
    label: 'text-[#E85D3A]',
    iconBg: 'bg-[#E85D3A]/10 border-[#E85D3A]/20',
    Icon: RefreshCw,
    badge: 'Retainer',
  },
  custom: {
    border: 'border-dashed border-[var(--sage-border-strong)] hover:border-[var(--sage-border-hover)]',
    bg: 'bg-transparent hover:bg-[var(--sage-surface-3)]',
    label: 'text-[var(--sage-ink-muted)]',
    iconBg: 'bg-[var(--sage-surface-2)] border-[var(--sage-border-strong)]',
    Icon: Sparkles,
    badge: 'Custom',
  },
}

export function CapabilitiesContent() {
  return (
    <div className="min-h-screen bg-[var(--sage-bg)]">
      {/* Hero */}
      <section
        aria-label="Capabilities overview"
        className="relative pt-28 pb-16 sm:pt-32 lg:pt-36 border-b border-[var(--sage-border)]"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_QUINT }}
            className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end"
          >
            <div className="max-w-3xl">
              <div className="mb-7 flex items-center gap-4">
                <MonoLabel tone="accent">01</MonoLabel>
                <Hairline className="flex-1" />
                <MonoLabel tone="muted">{'// capabilities'}</MonoLabel>
                <Hairline className="flex-1" strong />
              </div>
              <h1
                className="text-[var(--sage-ink)] font-normal text-[clamp(3rem,1.2rem+5vw,6.2rem)]"
                style={HEADING_STYLE}
              >
                Eight capabilities.{' '}
                <em className="not-italic text-[#3D5AFE]">Four modes.</em>{' '}
                <em className="not-italic text-[#E85D3A]">Every cell filled.</em>
              </h1>
              <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
                {
                  "Each capability has a productized engagement, a custom option, and an ongoing retainer. Pick what fits — fixed-price tiers checkout instantly, custom engagements get a same-day quote, retainers cancel anytime. Don't see your shape? Every engagement can be custom-scoped."
                }
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 bg-[#3D5AFE]/10 border border-[#3D5AFE]/30 text-[#3D5AFE] text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-mono),ui-monospace,monospace]">
                  <CheckCircle2 className="w-3 h-3" aria-hidden /> Productized · instant checkout
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 bg-[#E85D3A]/10 border border-[#E85D3A]/30 text-[#E85D3A] text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-mono),ui-monospace,monospace]">
                  <RefreshCw className="w-3 h-3" aria-hidden /> Retainer · monthly
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 bg-[var(--sage-surface-2)] border border-[var(--sage-border-strong)] text-[var(--sage-ink-muted)] text-[11px] uppercase tracking-[0.12em] [font-family:var(--font-mono),ui-monospace,monospace]">
                  <Sparkles className="w-3 h-3" aria-hidden /> Custom · talk to Sage
                </span>
              </div>
            </div>
            <SystemHeroPanel
              eyebrow="capability graph"
              title="Capability matrix"
              nodes={['Strategy', 'AI', 'Product', 'Growth']}
              stats={[
                { label: 'capabilities', value: String(capabilityOrder.length).padStart(2, '0') },
                { label: 'modes', value: String(modeMeta.length).padStart(2, '0') },
                { label: 'cells', value: 'filled' },
              ]}
            />
            <div className="lg:col-span-2">
              <MotionProofStrip
                items={[
                  { label: 'capability rows', value: String(capabilityOrder.length) },
                  { label: 'engagement modes', value: String(modeMeta.length) },
                  { label: 'checkout routes', value: 'live' },
                  { label: 'custom path', value: 'open' },
                ]}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-24 space-y-20">
        <Section
          eyebrow="how to read it"
          heading="Pick the capability. Then pick the mode."
          topRule={false}
          className="pt-16 sm:pt-20"
        >
          <ConversionMap
            steps={[
              { label: 'Audit', detail: 'Use when you need clarity, risk finding, SEO/AI/product teardown, or a roadmap.' },
              { label: 'Sprint', detail: 'Use when the surface or system needs a focused launch in weeks.' },
              { label: 'Build', detail: 'Use when the product, app, automation, or platform needs real engineering.' },
              { label: 'Operate', detail: 'Use when the system needs ongoing stewardship after launch.' },
            ]}
          />
        </Section>

        {/* Mode legend */}
        <Section
          eyebrow="modes"
          heading="How engagements run"
          topRule={false}
          className="pt-16 sm:pt-20"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-[3px] overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-border)]">
            {modeMeta.map((m, i) => {
              const Icon = modeIcons[m.key]
              return (
                <Reveal key={m.key} delay={i * 0.06}>
                  <div className="bg-[var(--sage-surface-1)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-[3px] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#3D5AFE]" aria-hidden />
                      </div>
                      <MonoLabel tone="ink">{m.label}</MonoLabel>
                    </div>
                    <p className="text-sm text-[var(--sage-ink-muted)]">{m.tagline}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </Section>

        {/* Matrix */}
        <Section
          eyebrow="matrix"
          heading={<>Capability × Mode —<br /><em className="not-italic text-[#3D5AFE]">every cell filled</em></>}
          lede="Find your row (capability) and column (mode). Every intersection has a real offering — productized tiers checkout instantly, custom engagements get a same-day quote, retainers cancel anytime."
        >
          {/* Desktop matrix */}
          <div className="hidden lg:block overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)]">
            {/* Header row */}
            <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] border-b border-[var(--sage-border)] bg-[var(--sage-bg)]">
              <div className="px-4 py-3">
                <MonoLabel tone="faint">Capability</MonoLabel>
              </div>
              {modeMeta.map((m) => (
                <div
                  key={m.key}
                  className="px-4 py-3 border-l border-[var(--sage-border)]"
                >
                  <MonoLabel tone="faint">{m.label}</MonoLabel>
                </div>
              ))}
            </div>

            {capabilityOrder.map((capKey, idx) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              return (
                <div
                  key={capKey}
                  className={`grid grid-cols-[1.4fr_repeat(4,1fr)] ${
                    idx < capabilityOrder.length - 1
                      ? 'border-b border-[var(--sage-border)]'
                      : ''
                  }`}
                >
                  <div className="px-4 py-5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[3px] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#3D5AFE]" aria-hidden />
                    </div>
                    <div>
                      <div className="text-sm font-normal text-[var(--sage-ink)] leading-tight">{cap.label}</div>
                      <div className="text-xs text-[var(--sage-ink-faint)] mt-1 leading-snug">{cap.tagline}</div>
                    </div>
                  </div>

                  {modeMeta.map((m) => {
                    const cell = capabilityMatrix[capKey][m.key]
                    const tone = toneFor(cell)
                    const styles = toneClasses[tone]
                    const ToneIcon = styles.Icon
                    return (
                      <div
                        key={m.key}
                        className="border-l border-[var(--sage-border)] p-3"
                      >
                        <Link
                          href={cell.href}
                          className={`block h-full rounded-[3px] border ${styles.border} ${styles.bg} p-3 transition-all group min-h-[100px]`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <ToneIcon className={`w-3.5 h-3.5 ${styles.label}`} aria-hidden />
                            <MonoLabel tone="faint" className={styles.label}>{styles.badge}</MonoLabel>
                          </div>
                          <div className="text-sm text-[var(--sage-ink)] leading-tight mb-1">{cell.label}</div>
                          <div className="text-[13px] text-[var(--sage-ink)] font-normal [font-family:var(--font-mono),ui-monospace,monospace]">{cell.price}</div>
                          <div className="text-xs text-[var(--sage-ink-faint)] mt-0.5">{cell.timeline}</div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Mobile: capability cards */}
          <div className="lg:hidden space-y-4">
            {capabilityOrder.map((capKey, i) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              return (
                <Reveal key={capKey} delay={i * 0.05}>
                  <Surface level={2} className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[3px] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-[#3D5AFE]" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm text-[var(--sage-ink)]">{cap.label}</h3>
                        <p className="text-xs text-[var(--sage-ink-faint)] mt-0.5 leading-snug">{cap.tagline}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {modeMeta.map((m) => {
                        const cell = capabilityMatrix[capKey][m.key]
                        const tone = toneFor(cell)
                        const styles = toneClasses[tone]
                        return (
                          <Link
                            key={m.key}
                            href={cell.href}
                            className={`rounded-[3px] border ${styles.border} ${styles.bg} p-2.5 transition-colors`}
                          >
                            <MonoLabel tone="faint" className={`${styles.label} mb-0.5 block`}>
                              {m.label} · {styles.badge}
                            </MonoLabel>
                            <div className="text-sm text-[var(--sage-ink)] leading-tight">{cell.label}</div>
                            <div className="text-xs text-[var(--sage-ink-muted)] mt-0.5 [font-family:var(--font-mono),ui-monospace,monospace]">{cell.price}</div>
                          </Link>
                        )
                      })}
                    </div>
                  </Surface>
                </Reveal>
              )
            })}
          </div>
        </Section>

        {/* Custom + retainer messaging */}
        <Reveal>
          <div className="grid md:grid-cols-2 gap-px rounded-[3px] overflow-hidden border border-[var(--sage-border)] bg-[var(--sage-border)]">
            <div className="bg-[var(--sage-surface-1)] p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[var(--sage-ink-muted)]" aria-hidden />
                <MonoLabel tone="muted">Custom packages</MonoLabel>
              </div>
              <h3 className="text-xl font-normal text-[var(--sage-ink)] mb-2" style={HEADING_STYLE}>
                Don&apos;t see what you need?
              </h3>
              <p className="text-sm text-[var(--sage-ink-muted)] mb-4 leading-relaxed">
                Every engagement can be custom-scoped — combine capabilities, adjust the
                timeline, set your own deliverables. Every quote is transparent and
                fixed-price.
              </p>
              <CtaLink href="/contact?engagement=custom" variant="text">
                Talk to Sage
              </CtaLink>
            </div>
            <div className="bg-[var(--sage-surface-1)] p-6 border-l border-[var(--sage-border)]">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-[#E85D3A]" aria-hidden />
                <MonoLabel tone="muted" className="text-[#E85D3A]">Monthly retainers</MonoLabel>
              </div>
              <h3 className="text-xl font-normal text-[var(--sage-ink)] mb-2" style={HEADING_STYLE}>
                Already shipped? Keep it healthy.
              </h3>
              <p className="text-sm text-[var(--sage-ink-muted)] mb-4 leading-relaxed">
                Site Care, Brand Care, and Content Care are lightweight monthly retainers
                for teams who already have something in market. Cancel anytime.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/services/site-care"
                  className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[#E85D3A] bg-[#E85D3A]/10 border border-[#E85D3A]/20 px-2.5 py-1 rounded-[3px] hover:bg-[#E85D3A]/20 transition-colors uppercase tracking-[0.1em]"
                >
                  Site Care · $300/mo
                </Link>
                <Link
                  href="/services/brand-care"
                  className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[#E85D3A] bg-[#E85D3A]/10 border border-[#E85D3A]/20 px-2.5 py-1 rounded-[3px] hover:bg-[#E85D3A]/20 transition-colors uppercase tracking-[0.1em]"
                >
                  Brand Care · $400/mo
                </Link>
                <Link
                  href="/services/content-care"
                  className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[#E85D3A] bg-[#E85D3A]/10 border border-[#E85D3A]/20 px-2.5 py-1 rounded-[3px] hover:bg-[#E85D3A]/20 transition-colors uppercase tracking-[0.1em]"
                >
                  Content Care · $800/mo
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Capability deep links */}
        <Section
          eyebrow="by capability"
          heading="Explore by service line"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilityOrder.map((capKey, i) => {
              const cap = capabilities[capKey]
              const Icon = capabilityIcons[capKey]
              const tierCount = cap.tierSlugs.length
              const firstSlug = cap.tierSlugs[0]
              return (
                <Reveal key={capKey} delay={i * 0.05}>
                  <Surface level={2} interactive className="p-5 h-full flex flex-col">
                    <div className="w-10 h-10 rounded-[3px] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-[#3D5AFE]" aria-hidden />
                    </div>
                    <h3 className="text-sm text-[var(--sage-ink)] mb-1">{cap.label}</h3>
                    <p className="text-sm text-[var(--sage-ink-muted)] leading-snug mb-4 flex-1">{cap.tagline}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {cap.tierSlugs.map((slug) => {
                        const t = tiersBySlug[slug]
                        const label = t ? t.shortName : slug.replace(/-/g, ' ')
                        return (
                          <Link
                            key={slug}
                            href={`/services/${slug}`}
                            className="text-[11px] [font-family:var(--font-mono),ui-monospace,monospace] text-[#3D5AFE] bg-[#3D5AFE]/10 border border-[#3D5AFE]/20 px-2 py-0.5 rounded-[3px] hover:bg-[#3D5AFE]/20 transition-colors capitalize"
                          >
                            {label}
                          </Link>
                        )
                      })}
                    </div>
                    <CtaLink href={`/services/${firstSlug}`} variant="text">
                      {tierCount} {tierCount === 1 ? 'option' : 'options'} · explore
                    </CtaLink>
                  </Surface>
                </Reveal>
              )
            })}
          </div>
        </Section>

        {/* CTA */}
        <Section
          eyebrow="discovery"
          heading={<>Not sure which<br /><em className="not-italic text-[#3D5AFE]">capability you need?</em></>}
          lede="Book a 30-minute discovery call. We'll talk through what you're building and which row + column fits — or scope something custom together."
          centered
          grain
          action={
            <CtaLink href="/book" variant="solid" event="cta_capabilities_footer">
              Book a Discovery Call
            </CtaLink>
          }
        />
      </div>
    </div>
  )
}
