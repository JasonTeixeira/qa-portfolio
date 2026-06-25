import Link from 'next/link'
import { ArrowRight, CheckCircle2, CircleDollarSign, Clock3, MousePointer2, ShieldCheck, Sparkles } from 'lucide-react'
import { Section, MonoLabel, Hairline, Reveal, CtaLink } from '@/components/el'
import { CatalogRow, FaqAccordion, type CatalogRowItem } from '@/components/el/services'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { extendedCategories, extendedTiersByCategory } from '@/data/services/extended'
import { pricingFaq } from '@/data/services/pricing-faq'

const CATALOG_CATEGORY_KEYS = extendedCategories
  .map((c) => c.key)
  .filter((k) => k !== 'ai-flagship')

const primaryPaths = [
  {
    eyebrow: '01',
    name: 'Prototype Sprint',
    price: 'from $750',
    timeline: '3-5 days',
    bestFor: 'You need a sharp working concept before you sell, pitch, or rebuild.',
    outcome: 'A buyer-facing demo, diagnosis, and build path you can show instead of explaining.',
    proof: ['Interactive concept', 'Buyer story', 'Build recommendation'],
    href: '/book?source=pricing_prototype_sprint',
  },
  {
    eyebrow: '02',
    name: 'Conversion System Build',
    price: 'from $4.5k',
    timeline: '1-3 weeks',
    bestFor: 'You have traffic, quote requests, leads, or interest, but the path to revenue is leaking.',
    outcome: 'A focused website, intake, quote, follow-up, or lead-routing system built around one clear outcome.',
    proof: ['Conversion path', 'Tracked handoff', 'Launch-ready surface'],
    href: '/book?source=pricing_conversion_build',
    featured: true,
  },
  {
    eyebrow: '03',
    name: 'Revenue OS Build',
    price: 'from $9.5k',
    timeline: '3-6 weeks',
    bestFor: 'You need the operating system: capture demand, score it, follow up, and see revenue risk.',
    outcome: 'A working command center for leads, accounts, outreach, replies, approvals, and pipeline visibility.',
    proof: ['Live dashboard', 'Approval flow', 'Operating cadence'],
    href: '/book?source=pricing_revenue_os_build',
  },
]

const decisionSteps = [
  {
    label: 'Need proof before selling?',
    route: 'Prototype Sprint',
    detail: 'Open a working concept, test the story, then decide what to build.',
  },
  {
    label: 'Already leaking leads?',
    route: 'Conversion Build',
    detail: 'Fix the highest-value path: quote requests, intake, booking, or follow-up.',
  },
  {
    label: 'Need one operating view?',
    route: 'Revenue OS',
    detail: 'Unify demand, priority, approvals, replies, and pipeline into a daily queue.',
  },
]

const reassurance = [
  { label: 'No mystery scope', value: 'Written path before build' },
  { label: 'No pitch deck first', value: 'Open proof, then talk' },
  { label: 'No fake guarantees', value: 'Evidence-backed claims only' },
]

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

function ArrowIcon() {
  return (
    <span
      aria-hidden
      className="grid size-8 place-items-center rounded-full bg-black/10 text-current transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:scale-105"
    >
      <ArrowRight size={15} strokeWidth={1.8} />
    </span>
  )
}

function PremiumButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}) {
  const base =
    'group inline-flex min-h-12 items-center justify-between gap-3 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]'
  const styles =
    variant === 'primary'
      ? 'bg-[#f4f7ff] text-[#05070d] shadow-[0_0_42px_rgba(61,90,254,0.28)] hover:bg-white'
      : 'border border-white/12 bg-white/[0.035] text-[var(--sage-ink)] hover:border-white/22 hover:bg-white/[0.06]'

  return (
    <Link href={href} className={`${base} ${styles}`}>
      <span>{children}</span>
      <ArrowIcon />
    </Link>
  )
}

function PathCard({ path, index }: { path: (typeof primaryPaths)[number]; index: number }) {
  return (
    <Reveal delay={index * 0.06} className="h-full">
      <article
        className={`relative h-full rounded-[2rem] border p-1.5 ${
          path.featured
            ? 'border-[#8da5ff]/35 bg-[#3D5AFE]/10 shadow-[0_0_80px_rgba(61,90,254,0.16)]'
            : 'border-white/10 bg-white/[0.035]'
        }`}
      >
        <div className="flex h-full flex-col rounded-[calc(2rem-0.375rem)] border border-white/[0.06] bg-[#08090e]/92 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#bcd2ff]">{path.eyebrow}</span>
            {path.featured ? (
              <span className="rounded-full border border-[#8da5ff]/30 bg-[#3D5AFE]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#dce6ff]">
                best first build
              </span>
            ) : null}
          </div>
          <h2 className="mt-8 max-w-[11ch] text-4xl font-normal leading-[0.95] tracking-[-0.04em] text-[var(--sage-ink)] sm:text-5xl">
            {path.name}
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.055] px-3 py-2 text-sm text-[var(--sage-ink)]">
              <CircleDollarSign size={15} strokeWidth={1.7} /> {path.price}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.055] px-3 py-2 text-sm text-[var(--sage-ink)]">
              <Clock3 size={15} strokeWidth={1.7} /> {path.timeline}
            </span>
          </div>
          <p className="mt-7 text-base leading-7 text-[var(--sage-ink-muted)]">{path.bestFor}</p>
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#bcd2ff]">What you get</p>
            <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{path.outcome}</p>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-[var(--sage-ink-muted)]">
            {path.proof.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#8df0c5]" strokeWidth={1.8} />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <PremiumButton href={path.href} variant={path.featured ? 'primary' : 'secondary'}>
              Book this path
            </PremiumButton>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function PricingEl() {
  return (
    <div className="overflow-hidden bg-[var(--sage-bg)]">
      <section
        aria-label="Pricing"
        className="sage-grain relative isolate overflow-hidden pt-28 pb-20 sm:pt-32 lg:pb-28"
      >
        <div aria-hidden className="sage-depth pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-center gap-4">
            <MonoLabel tone="accent">Pricing</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.72fr)] lg:items-end">
            <div>
              <p className="max-w-xl font-mono text-sm leading-8 tracking-[0.08em] text-[var(--sage-ink-faint)]">
                Know the route before you pay. Open proof first, pick the smallest useful build, and only expand when
                the business case is obvious.
              </p>
              <h1
                className="mt-10 max-w-4xl text-[var(--sage-ink)] font-normal text-[clamp(3.8rem,_1.35rem_+_6vw,_7.4rem)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.045em',
                  lineHeight: 0.9,
                }}
              >
                Pick the build path that makes the next buyer say yes.
              </h1>
              <p className="mt-7 max-w-[58ch] text-lg leading-[1.75] text-[var(--sage-ink-muted)]">
                No bloated menu. No mystery scope. Choose a working concept, a focused conversion build, or the full
                Revenue OS when you need every lead, reply, and follow-up visible.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <PremiumButton href="#paths">Compare paths</PremiumButton>
                <PremiumButton href="/showcase?source=pricing_hero" variant="secondary">Open demos first</PremiumButton>
              </div>
            </div>

            <div
              aria-label="Pricing decision map"
              className="rounded-[2.25rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_0_90px_rgba(61,90,254,0.12)]"
              role="region"
            >
              <div className="rounded-[calc(2.25rem-0.375rem)] border border-white/[0.08] bg-[#08090e]/90 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#8da5ff]/20 bg-[#3D5AFE]/10 px-4 py-3">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#bcd2ff]">Decision map</span>
                  <span className="text-sm font-semibold text-[var(--sage-ink)]">3 paths, one next step</span>
                </div>
                <div className="mt-5 space-y-3">
                  {decisionSteps.map((step, index) => (
                    <div key={step.label} className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:grid-cols-[2rem_1fr]">
                      <span className="grid size-8 place-items-center rounded-full bg-[#3D5AFE]/20 font-mono text-xs text-[#dce6ff]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <strong className="block text-[var(--sage-ink)]">{step.label}</strong>
                        <p className="mt-1 text-sm leading-6 text-[var(--sage-ink-muted)]">{step.detail}</p>
                        <span className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-[#bcd2ff]">
                          {step.route}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        id="paths"
        eyebrow="Choose the path"
        ariaLabel="Primary pricing paths"
        heading="Three ways to start. Pick the one that matches the business risk."
        lede="Most buyers do not need a giant scope first. They need the smallest useful proof, then a clear path to the build."
        width="max-w-7xl"
        className="scroll-mt-20"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {primaryPaths.map((path, index) => (
            <PathCard key={path.name} path={path} index={index} />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="What changes"
        ariaLabel="Pricing reassurance"
        heading="You are not buying hours. You are buying a clearer route to revenue."
        lede="The call should answer what to build, why it matters, what proof exists, what it costs, and what happens after the first version ships."
        width="max-w-6xl"
        grain
      >
        <div className="grid gap-4 md:grid-cols-3">
          {reassurance.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.06}>
              <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-1.5">
                <div className="min-h-48 rounded-[calc(1.75rem-0.375rem)] border border-white/[0.06] bg-[#08090e]/92 p-5">
                  <ShieldCheck size={22} className="text-[#8df0c5]" strokeWidth={1.7} />
                  <strong className="mt-8 block text-2xl font-normal tracking-[-0.03em] text-[var(--sage-ink)]">
                    {item.label}
                  </strong>
                  <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">{item.value}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        id="catalog"
        eyebrow="Specific systems"
        ariaLabel="AI and automation catalog"
        heading="Need a narrower build? The catalog is here after the main decision."
        lede="If you already know the exact system you need, browse the scoped AI, automation, reliability, and growth offers. Otherwise, start with one of the three paths above."
        width="max-w-6xl"
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
        <Reveal className="mt-10 flex flex-wrap gap-3">
          <CtaLink variant="ghost" href="/services">browse all services</CtaLink>
          <CtaLink variant="text" href="/tools/route-finder?source=pricing_catalog">run the route finder</CtaLink>
        </Reveal>
      </Section>

      <Section
        id="faq"
        eyebrow="Questions"
        ariaLabel="Pricing FAQ"
        heading="Pricing, without the sales fog."
        lede="The answer should be clear before you commit: what is included, what is not, and what happens after the first call."
        width="max-w-4xl"
        className="scroll-mt-20"
      >
        <FaqAccordion items={pricingFaq} />
      </Section>

      <RouteConversionCta
        eyebrow="price to route"
        title="Still unsure? Bring the leak. We will map the build."
        body="The first call is not a pitch deck. We open the closest proof, identify the business leak, and decide whether the right next step is a prototype, a conversion build, or the full operating system."
        primary={{ label: 'Book the build call', href: '/book?source=pricing_final' }}
        secondary={{ label: 'Open the prototype warehouse', href: '/showcase?source=pricing_final' }}
        variant="growth"
        proof={[
          { label: 'call length', value: '30m' },
          { label: 'next step', value: 'written' },
          { label: 'scope', value: 'clear' },
        ]}
      />

      <Section
        eyebrow="Before you book"
        ariaLabel="Final pricing call to action"
        centered
        heading="Open the proof first. Book when the value is clear."
        lede="See the systems, pick the closest path, then book the build conversation when you can picture the version for your business."
        width="max-w-3xl"
      >
        <Reveal className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <PremiumButton href="/showcase?source=pricing_final_showcase" variant="secondary">
            <MousePointer2 size={16} strokeWidth={1.7} /> See live systems
          </PremiumButton>
          <PremiumButton href="/book?source=pricing_final">
            <Sparkles size={16} strokeWidth={1.7} /> Book the build call
          </PremiumButton>
        </Reveal>
      </Section>
    </div>
  )
}
