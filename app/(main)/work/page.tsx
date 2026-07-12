import type { Metadata } from 'next'
import Link from 'next/link'
import { Section, MonoLabel, Hairline, CtaLink, Reveal } from '@/components/el'
import { WorkIndex } from '@/components/el/work/WorkIndex'
import { SurfaceSystemPanel } from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { caseStudies } from '@/data/work/case-studies'
import { JsonLd } from '@/components/json-ld'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/work' },
  title: 'Work — Interactive Systems and Business Proof',
  description:
    'Open working Sage Ideas examples: interactive business systems, revenue dashboards, quote engines, and proof-led builds that show the outcome before the call.',
  openGraph: {
    title: 'Work — Interactive Systems and Business Proof',
    description:
      'Working Sage Ideas examples that turn business problems into visible systems, clickable demos, and scoped build paths.',
    url: 'https://www.sageideas.dev/work',
    images: ['/og?title=Open+the+systems+behind+the+work&subtitle=Clickable+proof+before+the+call'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work — Interactive Systems and Business Proof',
    description: 'Open working Sage Ideas examples before you book the build call.',
    images: ['/og?title=Open+the+systems+behind+the+work&subtitle=Clickable+proof+before+the+call'],
  },
}

const DISPLAY_STYLE = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.052em',
  lineHeight: 0.9,
} as const

const proofRoutes = [
  {
    label: 'Client acquisition',
    route: '/showcase/revenue-os',
    proof: 'Open Revenue OS',
  },
  {
    label: 'Quote qualification',
    route: '/showcase/contractor-quote-engine',
    proof: 'Open Quote Engine',
  },
  {
    label: 'Build conversation',
    route: '/book?source=work_hero',
    proof: 'Book the build call',
  },
]

function MiniProofMap() {
  return (
    <div aria-label="work proof map" className="rounded-[2.25rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_0_90px_rgba(61,90,254,0.12)]">
      <div className="rounded-[calc(2.25rem-0.375rem)] border border-white/[0.07] bg-[#07080d]/95 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#8da5ff]/20 bg-[#3D5AFE]/10 px-4 py-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#bcd2ff]">Proof path</span>
          <span className="text-sm font-semibold text-[var(--sage-ink)]">case → demo → call</span>
        </div>
        <div className="mt-6 space-y-3">
          {[
            ['01', 'See the finished system', 'Screens, diagrams, metrics, build log'],
            ['02', 'Open a related demo', 'Click the workflow before a call'],
            ['03', 'Map your version', 'Book only after the path is clear'],
          ].map(([number, title, body]) => (
            <div key={number} className="grid gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 sm:grid-cols-[2.25rem_1fr]">
              <span className="grid size-9 place-items-center rounded-full bg-[#3D5AFE]/20 font-mono text-xs text-[#dce6ff]">
                {number}
              </span>
              <div>
                <p className="font-semibold text-[var(--sage-ink)]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--sage-ink-muted)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-3">
          {proofRoutes.map((item) => (
            <Link
              key={item.route}
              href={item.route}
              className="group flex min-h-12 items-center justify-between rounded-full border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-[var(--sage-ink)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#8da5ff]/30 hover:bg-white/[0.06]"
            >
              <span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#bcd2ff]">{item.label}</span>
                <span className="ml-3">{item.proof}</span>
              </span>
              <span aria-hidden className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function WorkPage() {
  return (
    <div className="relative min-h-screen bg-[var(--sage-bg)]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Sage Ideas work and interactive systems',
          description: metadata.description,
          url: `${SITE}/work`,
          hasPart: [
            `${SITE}/showcase/revenue-os`,
            `${SITE}/showcase/contractor-quote-engine`,
            `${SITE}/showcase/med-spa-consultation-funnel`,
            `${SITE}/showcase/law-firm-intake-system`,
            `${SITE}/showcase/ai-support-agent-dashboard`,
          ],
        }}
      />
      <section
        aria-labelledby="work-heading"
        className="sage-grain sage-depth relative isolate overflow-hidden"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32 lg:pb-24 lg:pt-36">
          <Reveal>
            <div className="mb-7 flex items-center gap-4">
              <MonoLabel tone="accent">Work</MonoLabel>
              <MonoLabel tone="muted">proof before the call</MonoLabel>
              <Hairline className="hidden flex-1 sm:block" strong />
            </div>
          </Reveal>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.72fr)] lg:items-end">
            <div>
              <Reveal delay={0.05}>
                <h1
                  id="work-heading"
                  className="max-w-5xl text-[clamp(4rem,_1.35rem_+_7vw,_8rem)] font-normal text-[var(--sage-ink)]"
                  style={DISPLAY_STYLE}
                >
                  See the proof before the pitch.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-8 max-w-[58ch] text-lg leading-[1.75] text-[var(--sage-ink-muted)]">
                  Open the systems behind the work: real product surfaces, architecture maps,
                  evidence boards, and the working demos that show what Sage Ideas can build around
                  your market.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="#case-studies"
                    className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-[#f4f7ff] px-5 py-2.5 text-sm font-semibold text-[#05070d] shadow-[0_0_42px_rgba(61,90,254,0.24)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98]"
                  >
                    <span>Open case studies</span>
                    <span className="grid size-8 place-items-center rounded-full bg-black/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5">→</span>
                  </Link>
                  <Link
                    href="/book?source=work_hero"
                    className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-full border border-white/12 bg-white/[0.035] px-5 py-2.5 text-sm font-semibold text-[var(--sage-ink)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/22 hover:bg-white/[0.06] active:scale-[0.98]"
                  >
                    <span>Book the build call</span>
                    <span aria-hidden className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.18}>
              <MiniProofMap />
            </Reveal>
          </div>
        </div>
      </section>

      <Section
        index="01"
        eyebrow="proof library"
        heading={
          <>
            Pick the example closest to the business you want to build.
          </>
        }
        lede="The page is intentionally organized for buyers: proof first, then engineering detail. Open a case, inspect the system, and book only when the build path is clear."
        ariaLabel="Case study index"
      >
        <div id="case-studies">
          <WorkIndex studies={caseStudies} />
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="proof model"
        heading={
          <>
            Every case should make the next call easier to say yes to.
          </>
        }
        lede="This is the standard we will reuse for every premium showcase: the leak, the system, the result, the proof assets, and the clear route into a build conversation."
        ariaLabel="Surface to system case study model"
        action={<CtaLink href="/showcase" variant="ghost">Open the prototype warehouse</CtaLink>}
      >
        <SurfaceSystemPanel
          title="Proof buyers can use"
          body="A strong case study does not ask the buyer to trust adjectives. It shows the broken workflow, the system that replaced it, the evidence that exists, and the next version we can build for their market."
          cta={{ label: 'Open the proof warehouse', href: '/showcase' }}
          steps={[
            {
              label: 'Before',
              detail: 'What was scattered, delayed, hidden, or hard to trust.',
            },
            {
              label: 'System',
              detail: 'The dashboard, workflow, product, or infrastructure built around the problem.',
            },
            {
              label: 'Evidence',
              detail: 'Screenshots, metrics, diagrams, route checks, build logs, and artifacts.',
            },
            {
              label: 'Buyer route',
              detail: 'The next step if the visitor wants a version for their business.',
            },
          ]}
        />
      </Section>

      <RouteConversionCta
        eyebrow="work to route"
        title="Want the next proof page to be about your business?"
        body="Bring the broken workflow, leaky website, manual process, or fuzzy idea. We map what can be shown first, then scope the build around the business result."
        primary={{ label: 'Open the proof warehouse', href: '/showcase' }}
        secondary={{ label: 'Book the build call', href: '/book?source=work' }}
        variant="studio"
        proof={[
          { label: 'case studies', value: String(caseStudies.length).padStart(2, '0') },
          { label: 'source', value: 'real work' },
          { label: 'route', value: 'studio' },
        ]}
      />
    </div>
  )
}
