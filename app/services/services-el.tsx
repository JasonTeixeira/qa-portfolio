import Link from 'next/link'
import { Section, Hairline, MonoLabel, Surface, Reveal, CtaLink } from '@/components/el'
import { ProofLedger } from '@/components/el/home/ProofLedger'
import { MotionProofStrip, SurfaceSystemPanel, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'
import {
  TierGrid,
  CareCard,
  CatalogRow,
  type CatalogRowItem,
} from '@/components/el/services'
import { tiersOrdered, careTiers } from '@/data/services/tiers'
import {
  extendedCategories,
  extendedTiersByCategory,
} from '@/data/services/extended'

// Recommended on-ramp — the primary accent across the productized grid.
const RECOMMENDED_SLUG = 'audit'

const serviceMatrix = [
  {
    code: '01',
    signal: 'I know something is leaking, but not exactly what.',
    route: 'Sage Audit',
    price: '$750',
    timeline: '1 week',
    mode: 'diagnose',
    href: '/services/audit',
    cta: 'Start with audit',
    detail: 'A focused findings report, priority map, and credit toward a larger build.',
  },
  {
    code: '02',
    signal: 'I need a premium site, offer, or launch surface.',
    route: 'Site / Brand sprint',
    price: '$3.5k+',
    timeline: 'days-weeks',
    mode: 'launch',
    href: '/services/site-starter',
    cta: 'Shape the launch',
    detail: 'Positioning, site architecture, conversion flow, and a production-ready surface.',
  },
  {
    code: '03',
    signal: 'I need AI inside the business, not a toy demo.',
    route: 'AI automation build',
    price: '$2.6k+',
    timeline: '3-4 weeks',
    mode: 'automate',
    href: '/services/ai-agent-development',
    cta: 'Build the workflow',
    detail: 'Agents, retrieval, workflow automation, internal tools, and measurable operating lift.',
  },
  {
    code: '04',
    signal: 'I need a real app, SaaS, or product system built.',
    route: 'Product build',
    price: 'scoped',
    timeline: '4-12 weeks',
    mode: 'build',
    href: '/services/studio-engagement',
    cta: 'Scope the product',
    detail: 'Database, auth, billing, product UI, observability, launch, and iteration loop.',
  },
  {
    code: '05',
    signal: 'I already shipped and need care, content, or operations.',
    route: 'Care plan',
    price: '$600/mo+',
    timeline: 'monthly',
    mode: 'operate',
    href: '/services/site-care',
    cta: 'Keep it running',
    detail: 'Maintenance, measurement, fixes, content support, and steady improvement.',
  },
  {
    code: '06',
    signal: 'I want to learn the system before hiring or building.',
    route: 'Academy path',
    price: 'forming',
    timeline: 'self-paced',
    mode: 'learn',
    href: '/academy',
    cta: 'Enter academy',
    detail: 'Courses, build notes, templates, and practical lessons from the same studio system.',
  },
] as const

// Real evidence from shipped Lab products / Work case studies. No fabricated
// metrics — kept verbatim from the prior services page.
const evidenceItems = [
  {
    category: 'AI services',
    title: 'Nexural — GPT-4 Discord assistant in production',
    body: 'Real-time fintech platform with an LLM-backed Discord bot answering portfolio queries. 200+ AI queries per week, 0 billing incidents, 61 test suites covering the AI surface.',
    tags: ['GPT-4', 'Discord API', 'Stripe', '185 DB tables'],
    href: '/lab/nexural',
  },
  {
    category: 'Customer-facing AI',
    title: 'Jobpoise — citation-grounded generation, no hallucinations',
    body: 'AI cover letters where every output traces to a source (resume bullet, JD requirement) via a structured citation layer. Three-tier Stripe billing, Chrome extension, Gmail integration.',
    tags: ['OpenAI', 'Citations', 'Chrome MV2', 'Gmail OAuth'],
    href: '/lab/jobpoise',
  },
  {
    category: 'Automation pipelines',
    title: 'AlphaStream — 200+ indicators, 5 ML models, automated signal pipeline',
    body: 'End-to-end ML signal engine: data ingestion, feature engineering, training, evaluation, and signal output — all automated. The pattern behind our automation-pipeline offers.',
    tags: ['Python', 'ML', 'CI/CD', 'Pipelines'],
    href: '/lab/alphastream',
  },
] as const

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

export function ServicesEl() {
  return (
    <div className="overflow-hidden bg-[var(--sage-bg)]">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        aria-label="Services"
        className="sage-grain relative isolate overflow-hidden pt-28 pb-14 sm:pt-32 lg:pb-20"
      >
        <div aria-hidden className="sage-depth pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-7 flex items-center gap-4">
            <MonoLabel tone="accent">{'// engagements'}</MonoLabel>
            <Hairline className="flex-1" strong />
          </div>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <h1
                className="max-w-4xl text-[var(--sage-ink)] font-normal text-[clamp(3.2rem,1.3rem+5.4vw,6.6rem)]"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '-0.026em',
                  lineHeight: 1.0,
                }}
              >
                Engineering. AI. Automation.{' '}
                <span className="italic text-[var(--sage-accent)]">Clear route.</span>
              </h1>
              <p className="mt-6 max-w-[62ch] text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
                Productized engagements with fixed scope — AI reliability audits, RAG and agent ops,
                automation pipelines, customer-facing AI products, retainers, diagnostic on-ramps, and
                full done-for-you bundles. Or scope something custom: free 30-minute call, 48-hour
                proposal, no asterisks.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                <CtaLink variant="text" href="/artifacts/sample-audit">see a real sample deliverable</CtaLink>
                <CtaLink variant="text" href="/pricing">compare every tier</CtaLink>
                <CtaLink variant="text" href="/capabilities">capability matrix</CtaLink>
                <CtaLink variant="text" href="/industries">browse by industry</CtaLink>
              </div>
            </div>
            <SystemHeroPanel
              eyebrow="offer router"
              title="Services system map"
              nodes={['Diagnose', 'Build', 'Automate', 'Operate']}
              stats={[
                { label: 'on-ramp', value: '$750' },
                { label: 'proposal', value: '48h' },
                { label: 'model', value: 'fixed' },
              ]}
            />
          </div>
          <div className="mt-12">
            <MotionProofStrip
              items={[
                { label: 'audit entry', value: '$750' },
                { label: 'self serve', value: 'Stripe' },
                { label: 'proposal window', value: '48h' },
                { label: 'operator model', value: '1:1' },
              ]}
            />
          </div>
        </div>
      </section>

      <Section
        index="00"
        eyebrow="service router"
        ariaLabel="Service decision matrix"
        heading="Choose by situation, not by guessing."
        lede="The services page should answer the buyer's real question fast: what do I need, what does it cost, how long does it take, and what should I click next?"
      >
        <div className="grid gap-px overflow-hidden rounded-[6px] border border-[var(--sage-border)] bg-[var(--sage-border)] lg:grid-cols-2">
          {serviceMatrix.map((item) => (
            <Link
              key={item.code}
              href={item.href}
              className="group relative min-h-[310px] overflow-hidden bg-[var(--sage-surface-1)] p-5 transition-colors hover:bg-[var(--sage-surface-2)] sm:p-6"
            >
              <SystemFlowOverlay
                variant={item.mode === 'learn' ? 'academy' : item.mode === 'diagnose' ? 'growth' : 'systems'}
                intensity={item.mode === 'diagnose' ? 'normal' : 'quiet'}
              />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
                      {item.code} · {item.mode}
                    </p>
                    <h3
                      className="mt-4 max-w-[18ch] text-3xl font-extrabold leading-none tracking-[-0.03em] text-[var(--sage-ink)] sm:text-4xl"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {item.route}
                    </h3>
                  </div>
                  <span className="rounded-full border border-[rgba(61,90,254,0.36)] bg-[rgba(61,90,254,0.1)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                    {item.timeline}
                  </span>
                </div>

                <p className="mt-5 max-w-[50ch] text-sm leading-6 text-[var(--sage-ink-muted)]">
                  <span className="text-[var(--sage-ink)]">{item.signal}</span>
                  <br />
                  {item.detail}
                </p>

                <div className="mt-auto grid gap-px bg-[var(--sage-border)] sm:grid-cols-[0.8fr_1fr_auto]">
                  <div className="bg-[rgba(11,11,14,0.74)] p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                      starts
                    </p>
                    <p className="mt-2 font-mono text-sm text-[var(--sage-ink)]">{item.price}</p>
                  </div>
                  <div className="bg-[rgba(11,11,14,0.74)] p-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)]">
                      best when
                    </p>
                    <p className="mt-2 text-sm text-[var(--sage-ink-muted)]">{item.signal}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-[rgba(11,11,14,0.74)] p-3 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-accent-readable)] sm:justify-center">
                    <span>{item.cta}</span>
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Productized engagements ────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="productized · engineering & qa"
        ariaLabel="Productized engagements"
        heading={
          <>
            Fixed scope, fixed price,{' '}
            <span className="italic text-[var(--sage-accent)]">Stripe checkout.</span>
          </>
        }
        lede="The original Sage Ideas catalog — strategy audits, marketing-site sprints, brand work, and platform builds. Audit is the self-serve on-ramp and credits toward a larger engagement."
      >
        <TierGrid tiers={tiersOrdered} recommendedSlug={RECOMMENDED_SLUG} />
      </Section>

      {/* ── AI & Automation catalog ────────────────────────────────── */}
      <Section
        id="ai-and-automation"
        index="02"
        eyebrow="ai & automation"
        ariaLabel="AI and automation catalog"
        heading={
          <>
            Twenty-plus more ways{' '}
            <span className="italic text-[var(--sage-accent)]">we can help.</span>
          </>
        }
        lede="AI reliability, automation pipelines, customer-facing AI products, productized retainers, diagnostics, and full bundles. Inquiry-first — every engagement is scoped and priced in writing before you commit."
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
      </Section>

      {/* ── Proof from the Lab ─────────────────────────────────────── */}
      <Section
        index="03"
        eyebrow="proof from the lab"
        ariaLabel="Evidence"
        heading={
          <>
            We ship these patterns{' '}
            <span className="italic text-[var(--sage-accent)]">ourselves first.</span>
          </>
        }
        lede="Every offer above is built on a pattern already running in production — in our Lab or in shipped client work. Three concrete examples:"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {evidenceItems.map((item, i) => (
            <Reveal key={item.href} delay={i * 0.06} className="h-full">
              <Link href={item.href} className="group block h-full">
                <Surface level={2} interactive className="flex h-full flex-col p-7">
                  <MonoLabel tone="accent">{`// ${item.category}`}</MonoLabel>
                  <h3
                    className="mt-4 text-lg font-normal leading-snug text-[var(--sage-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 flex-1 text-[13px] leading-[1.6] text-[var(--sage-ink-muted)]">
                    {item.body}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Hairline className="mt-5" />
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors group-hover:text-[var(--sage-accent-readable)] [font-family:var(--font-mono),ui-monospace,monospace]">
                    see it in the lab
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </span>
                </Surface>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <CtaLink variant="text" href="/lab">browse the full lab</CtaLink>
          <CtaLink variant="text" href="/work">read client case studies</CtaLink>
        </Reveal>
      </Section>

      {/* ── Care plans ─────────────────────────────────────────────── */}
      <Section
        index="04"
        eyebrow="monthly retainers"
        ariaLabel="Care plans"
        heading={
          <>
            Care plans for teams{' '}
            <span className="italic text-[var(--sage-accent)]">who already shipped.</span>
          </>
        }
        lede="Lightweight monthly retainers — upkeep on something you already launched. Real Stripe subscriptions, cancel anytime."
        grain
      >
        <div className="grid gap-4 md:grid-cols-3">
          {careTiers.map((care, i) => (
            <Reveal key={care.slug} delay={i * 0.06} className="h-full">
              <CareCard care={care} index={String(i + 1).padStart(2, '0')} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Verifiable record ──────────────────────────────────────── */}
      <Section
        eyebrow="verifiable record"
        ariaLabel="Proof"
        heading="Proof, not promises."
        width="max-w-5xl"
      >
        <ProofLedger />
      </Section>

      <Section
        index="04B"
        eyebrow="service architecture"
        ariaLabel="Service architecture"
        heading="The offer is a pipeline, not a menu."
        lede="Premium services pages should reveal the operating model behind the work. This section sets the pattern for every individual service page we upgrade next."
      >
        <SurfaceSystemPanel
          title="Scope → Ship → Operate"
          body="Every serious engagement moves through the same production path: diagnosis, architecture, build, validation, handoff, and operating loop."
          cta={{ label: 'Book the right path', href: '/book' }}
          steps={[
            { label: 'Scope', detail: 'Written deliverables, constraints, acceptance criteria, and price before work begins.' },
            { label: 'Build', detail: 'Production code, real integrations, analytics, SEO, checkout, or AI workflows depending on the route.' },
            { label: 'Verify', detail: 'Lint, typecheck, tests, build, visual QA, browser smoke, and launch gates.' },
            { label: 'Operate', detail: 'Documentation, handoff, care plan, or continued studio engagement when the system needs stewardship.' },
          ]}
        />
      </Section>

      {/* ── Custom / close ─────────────────────────────────────────── */}
      <Section
        index="05"
        eyebrow="custom packages"
        ariaLabel="Scope something custom"
        heading={
          <>
            Or scope{' '}
            <span className="italic text-[var(--sage-accent)]">something custom.</span>
          </>
        }
        lede="A hybrid engagement, a multi-month build, a retainer with a specific deliverable list — every engagement can be custom-scoped. Transparent quote, fixed price, no asterisks."
        width="max-w-3xl"
        centered
      >
        <Reveal className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <CtaLink variant="solid" href="/book" event="cta_click" eventProps={{ location: 'services_final_cta', label: 'book_discovery' }}>
            ./book
          </CtaLink>
          <Link
            href="/contact?engagement=custom"
            className="group inline-flex h-12 items-center gap-2.5 rounded-[3px] border border-[var(--sage-border-strong)] px-6 text-[13px] uppercase tracking-[0.08em] text-[var(--sage-ink-muted)] transition-colors duration-200 [font-family:var(--font-mono),ui-monospace,monospace] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]"
          >
            <span>talk to sage</span>
            <span aria-hidden className="text-[var(--sage-ink-faint)] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </Reveal>
      </Section>
    </div>
  )
}
