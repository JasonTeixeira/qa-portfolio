import type { Metadata } from 'next'
import { Section, MonoLabel, Hairline, CtaLink, Reveal } from '@/components/el'
import { WorkIndex } from '@/components/el/work/WorkIndex'
import { MotionProofStrip, SurfaceSystemPanel, SystemHeroPanel } from '@/components/living/LivingPageSystem'
import { RouteConversionCta } from '@/components/living/RouteConversionCta'
import { caseStudies } from '@/data/work/case-studies'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/work' },
  title: 'Work — Production Case Studies',
  description:
    'Production case studies from Sage Ideas: fintech platforms, ML signal engines, AI-native products, infrastructure, and developer tooling. Real work, real outcomes.',
  openGraph: {
    title: 'Work — Production Case Studies',
    description:
      'Production case studies from Sage Ideas: fintech platforms, ML signal engines, AI-native products, infrastructure, and developer tooling. Real work, real outcomes.',
    url: 'https://www.sageideas.dev/work',
    images: ['/og?title=The+work+speaks.&subtitle=Production+case+studies'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work — Production Case Studies',
    description: 'Production case studies from Sage Ideas — real work, real outcomes.',
    images: ['/og?title=The+work+speaks.&subtitle=Production+case+studies'],
  },
}

const DISPLAY_STYLE = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
} as const

export default function WorkPage() {
  return (
    <main className="relative min-h-screen bg-[var(--sage-bg)]">
      {/* ── Title block — editorial, ruled, no neon hero bg ── */}
      <section
        aria-labelledby="work-heading"
        className="sage-grain sage-depth relative isolate overflow-hidden"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-4 pt-28 sm:px-8 sm:pt-32 lg:pt-36">
          <Reveal>
            <div className="mb-7 flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">
                00
              </MonoLabel>
              <MonoLabel tone="muted">{`// case_studies · the record`}</MonoLabel>
              <Hairline className="hidden flex-1 sm:block" strong />
            </div>
          </Reveal>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-end">
            <div>
              <Reveal delay={0.05}>
                <h1
                  className="max-w-4xl text-[clamp(3.4rem,_1.4rem_+_6vw,_7.4rem)] font-normal text-[var(--sage-ink)]"
                  style={DISPLAY_STYLE}
                >
                  The work speaks.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-7 max-w-[60ch] text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
                  Selected engagements across fintech, trades tech, developer tooling, and cloud
                  infrastructure. Each shipped production code, served real users, and went through a
                  complete engineering lifecycle.
                </p>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-4 max-w-[60ch] text-[15px] leading-[1.7] text-[var(--sage-ink-faint)]">
                  Not redesigns or MVPs handed to another team. These are products the studio built,
                  launched, and continues to operate: architecture decisions, test suites, CI
                  pipelines, deployment playbooks, all of it.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.18}>
              <SystemHeroPanel
                eyebrow="work graph"
                title="Case study system map"
                nodes={['Product UI', 'Architecture', 'Evidence', 'Outcome']}
                stats={[
                  { label: 'case studies', value: String(caseStudies.length).padStart(2, '0') },
                  { label: 'real products', value: '6' },
                  { label: 'public repos', value: '130+' },
                ]}
              />
            </Reveal>
          </div>

          <Reveal delay={0.22}>
            <div className="mt-12">
              <MotionProofStrip
                items={[
                  { label: 'fintech systems', value: '185 tables' },
                  { label: 'ai/ml pipelines', value: '200+ indicators' },
                  { label: 'quality gates', value: '61 suites' },
                  { label: 'studio model', value: '1 operator' },
                ]}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── The index ── */}
      <Section
        index="01"
        eyebrow="the index"
        heading={
          <>
            Every build,{' '}
            <span className="italic text-[#3D5AFE]" style={{ fontFamily: 'var(--font-display)' }}>
              on the record.
            </span>
          </>
        }
        lede="Filter by discipline. Open any entry for the full case study — problem, architecture, trade-offs, and the numbers that prove it shipped."
        ariaLabel="Case study index"
      >
        <WorkIndex studies={caseStudies} />
      </Section>

      {/* ── Archive callout ── */}
      <Section
        index="02"
        eyebrow="the archive"
        heading={
          <>
            More than the{' '}
            <span className="italic" style={{ fontFamily: 'var(--font-display)' }}>
              headline six.
            </span>
          </>
        }
        lede="The full catalog — open-source tooling, infrastructure modules, product experiments, and client work — lives in the Lab."
        action={
          <CtaLink
            href="/lab"
            variant="ghost"
            event="work_archive_lab_click"
          >
            Browse the Lab
          </CtaLink>
        }
        ariaLabel="Project archive"
      />

      <Section
        index="03"
        eyebrow="surface to system"
        heading="A case study should show the thing and the engine."
        lede="This is the new standard for the work pages: product surface, system topology, evidence, tradeoffs, and conversion path in one coherent story."
        ariaLabel="Surface to system case study model"
      >
        <SurfaceSystemPanel
          title="Surface ⇄ System"
          body="The premium layer is not decoration. It exists to prove the studio can ship both the interface people use and the architecture that keeps it alive."
          cta={{ label: 'Open the flagship case', href: '/work/nexural' }}
          steps={[
            {
              label: 'Product surface',
              detail: 'Real dashboards, flows, and screenshots replace generic cards wherever assets exist.',
            },
            {
              label: 'System map',
              detail: 'Animated architecture diagrams explain how data, AI, billing, and ops move through the product.',
            },
            {
              label: 'Evidence layer',
              detail: 'CI runs, screenshots, diagrams, build logs, and verified numbers carry the claim.',
            },
            {
              label: 'Buyer path',
              detail: 'Each case routes to the matching service, academy lesson, or project-start CTA.',
            },
          ]}
        />
      </Section>

      <RouteConversionCta
        eyebrow="work to route"
        title="Seen enough proof? Choose the build path."
        body="Use the diagnostic if you need routing, or book the studio if the work already maps to the thing you need built. The next step should be specific, not a vague contact form."
        primary={{ label: 'Find your route', href: '/tools/route-finder?source=work_final' }}
        secondary={{ label: 'Book the studio', href: '/book' }}
        variant="studio"
        proof={[
          { label: 'case studies', value: String(caseStudies.length).padStart(2, '0') },
          { label: 'source', value: 'real work' },
          { label: 'route', value: 'studio' },
        ]}
      />
    </main>
  )
}
