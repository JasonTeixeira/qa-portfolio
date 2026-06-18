import Link from 'next/link'
import { Section, Hairline, MonoLabel, Reveal, CtaLink } from '@/components/el'
import {
  TierGrid,
  CareCard,
  ComparisonTable,
  FaqAccordion,
  CatalogRow,
  type CatalogRowItem,
} from '@/components/el/services'
import { QuoteCalculator } from '@/components/pricing/quote-calculator'
import { ConversionMap, MotionProofStrip, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { tiersOrdered, careTiers } from '@/data/services/tiers'
import {
  extendedCategories,
  extendedTiersByCategory,
} from '@/data/services/extended'
import { pricingFaq } from '@/data/services/pricing-faq'

// Recommended on-ramp: the cheapest self-serve productized tier (Audit).
// It earns the single accent — the entry point, not every card.
const RECOMMENDED_SLUG = 'audit'

// Extended catalog categories that are inquiry-first; prices flow from the
// tier data. We skip the flagship category here (it has its own surfaces).
const CATALOG_CATEGORY_KEYS = extendedCategories
  .map((c) => c.key)
  .filter((k) => k !== 'ai-flagship')

function toRowItems(slugKey: string): CatalogRowItem[] {
  const tiers = extendedTiersByCategory[slugKey as keyof typeof extendedTiersByCategory] ?? []
  return tiers.map((t) => ({
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    price: t.price,
    timeline: t.timeline,
    href: `/services/${t.slug}`,
  }))
}

export function PricingEl() {
  return (
    <div className="overflow-hidden bg-[var(--sage-bg)]">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        aria-label="Pricing"
        className="sage-grain relative isolate overflow-hidden pt-28 pb-14 sm:pt-32 lg:pb-20"
      >
        <div aria-hidden className="sage-depth pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">{'// pricing'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <h1
                className="max-w-4xl text-[var(--sage-ink)] font-normal text-[clamp(3.2rem,_1.3rem_+_5.2vw,_6.4rem)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.026em',
                  lineHeight: 1.0,
                }}
              >
                One price per engagement.{' '}
                <span className="italic text-[#3D5AFE]">Written before we start.</span>
              </h1>
              <p className="mt-6 max-w-[62ch] text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
                No “starting from”, no discovery-call price reveal. Every productized tier below has a
                fixed scope and a fixed number. The self-serve ones take a card on this page; the larger
                builds get scoped on a call. The number you see is the number in the contract.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                <CtaLink variant="text" href="#compare">compare every tier</CtaLink>
                <CtaLink variant="text" href="#care">care plans</CtaLink>
                <CtaLink variant="text" href="#catalog">ai &amp; automation</CtaLink>
                <CtaLink variant="text" href="#faq">faq</CtaLink>
              </div>
            </div>
            <SystemHeroPanel
              eyebrow="price engine"
              title="Pricing system map"
              nodes={['Scope', 'Price', 'Checkout', 'Handoff']}
              stats={[
                { label: 'self serve', value: 'yes' },
                { label: 'surprise fees', value: '0' },
                { label: 'refund rule', value: 'clear' },
              ]}
            />
          </div>
          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'fixed scope', value: 'written' },
                { label: 'audit', value: '$750' },
                { label: 'platform build', value: '$9.5k' },
                { label: 'care plans', value: 'monthly' },
              ]}
            />
          </div>
        </div>
      </section>

      <Section
        index="00"
        eyebrow="pricing logic"
        ariaLabel="Pricing logic"
        heading="The page should make the buying decision obvious."
        lede="A premium pricing page earns trust by showing the route, the constraints, and the next action. No pressure tricks; just clear commercial architecture."
      >
        <ConversionMap
          steps={[
            { label: 'Audit', detail: 'Best when you need clarity before committing to a larger build.' },
            { label: 'Ship', detail: 'Best when the surface, launch, or conversion system is the bottleneck.' },
            { label: 'Automate', detail: 'Best when AI, ops, or workflow leverage creates measurable lift.' },
            { label: 'Build / Operate', detail: 'Best when the product needs a principal builder and an operating cadence.' },
          ]}
        />
      </Section>

      {/* ── Productized tiers ──────────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="productized engagements"
        ariaLabel="Productized engagement tiers"
        heading={
          <>
            Fixed scope. Fixed price.{' '}
            <span className="italic text-[#3D5AFE]">Click to start.</span>
          </>
        }
        lede="The original Sage Ideas catalog — strategy audits, marketing-site sprints, automation, brand work, and platform builds. Audit is the self-serve on-ramp; most of it credits toward a larger engagement."
      >
        <TierGrid tiers={tiersOrdered} recommendedSlug={RECOMMENDED_SLUG} />
      </Section>

      {/* ── Quote calculator ───────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="scope estimator"
        ariaLabel="Scope estimator"
        heading={
          <>
            Skip the spreadsheet.{' '}
            <span className="italic text-[#3D5AFE]">Build your quote here.</span>
          </>
        }
        lede="Click your way to a real estimate. The number you see is the number we’ll write into the contract — and if scope changes mid-flight, the kill switch refunds the unspent half."
        width="max-w-6xl"
        grain
      >
        <QuoteCalculator />
      </Section>

      {/* ── Care plans ─────────────────────────────────────────────── */}
      <Section
        id="care"
        index="03"
        eyebrow="monthly care"
        ariaLabel="Care plan retainers"
        heading={
          <>
            Kept alive every month.{' '}
            <span className="italic text-[#3D5AFE]">Cancel anytime.</span>
          </>
        }
        lede="Lightweight retainers for teams who already shipped. Real subscriptions through Stripe — no clawback, no minimum term, no drama."
        width="max-w-6xl"
        className="scroll-mt-20"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {careTiers.map((care, i) => (
            <Reveal key={care.slug} delay={i * 0.06} className="h-full">
              <CareCard care={care} index={String(i + 1).padStart(2, '0')} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Comparison table ───────────────────────────────────────── */}
      <Section
        id="compare"
        index="04"
        eyebrow="honest comparison"
        ariaLabel="Tier comparison"
        heading="Every tier, side by side."
        lede="Prices, timelines, and how each one starts — straight from the source. The only accent marks the recommended on-ramp, not a discount you’ll never see."
        width="max-w-6xl"
        className="scroll-mt-20"
      >
        <ComparisonTable tiers={tiersOrdered} recommendedSlug={RECOMMENDED_SLUG} />
      </Section>

      {/* ── Extended catalog ───────────────────────────────────────── */}
      <Section
        id="catalog"
        index="05"
        eyebrow="ai & automation"
        ariaLabel="AI and automation catalog"
        heading={
          <>
            More ways we can help —{' '}
            <span className="italic text-[#3D5AFE]">scoped before you commit.</span>
          </>
        }
        lede="AI reliability, automation pipelines, customer-facing AI, retainers, diagnostics, and full bundles. Inquiry-first: every engagement is scoped and priced in writing before any commitment."
        width="max-w-6xl"
        grain
        className="scroll-mt-20"
      >
        <div className="space-y-10">
          {CATALOG_CATEGORY_KEYS.map((key) => {
            const meta = extendedCategories.find((c) => c.key === key)
            const items = toRowItems(key)
            if (!meta || items.length === 0) return null
            return <CatalogRow key={key} label={meta.label} items={items} />
          })}
        </div>
        <Reveal className="mt-10">
          <CtaLink variant="ghost" href="/services">browse the full catalog</CtaLink>
        </Reveal>
      </Section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <Section
        id="faq"
        index="06"
        eyebrow="questions"
        ariaLabel="Pricing FAQ"
        heading="Pricing, in plain English."
        width="max-w-4xl"
        className="scroll-mt-20"
      >
        <FaqAccordion items={pricingFaq} />
      </Section>

      <RouteConversionCta
        eyebrow="price to route"
        title="Still comparing? Get routed."
        body="If the matrix is close but not obvious, answer four questions. The diagnostic points you toward audit, studio build, automation, or academy instead of forcing a generic sales call."
        primary={{ label: 'Run the route finder', href: '/tools/route-finder?source=pricing_final' }}
        secondary={{ label: 'Book a call', href: '/book' }}
        variant="growth"
        proof={[
          { label: 'self-serve on-ramp', value: 'Audit' },
          { label: 'pricing model', value: 'fixed' },
          { label: 'route options', value: '04' },
        ]}
      />

      {/* ── Close ──────────────────────────────────────────────────── */}
      <Section
        eyebrow="not sure which fits?"
        ariaLabel="Book a discovery call"
        centered
        heading={
          <>
            Start with{' '}
            <span className="italic text-[#3D5AFE]">a conversation.</span>
          </>
        }
        lede="A free 30-minute discovery call. We talk through what you’re building, what you’ve tried, and which engagement — if any — is the right fit."
        width="max-w-3xl"
      >
        <Reveal className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <CtaLink variant="solid" href="/book" event="cta_click" eventProps={{ location: 'pricing_final_cta', label: 'book_discovery' }}>
            ./book
          </CtaLink>
          <Link
            href="/contact?engagement=custom"
            className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
          >
            <span>scope something custom</span>
            <span aria-hidden className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </Reveal>
      </Section>
    </div>
  )
}
