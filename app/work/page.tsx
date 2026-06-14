import type { Metadata } from 'next'
import { Section, MonoLabel, Hairline, CtaLink, Reveal } from '@/components/el'
import { WorkIndex } from '@/components/el/work/WorkIndex'
import { caseStudies } from '@/data/work/case-studies'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev/work' },
  title: 'Work',
  description:
    'Production case studies from Sage Ideas: fintech platforms, ML signal engines, AI-native products, infrastructure, and developer tooling. Real work, real outcomes.',
  openGraph: {
    title: 'Work',
    description:
      'Production case studies from Sage Ideas: fintech platforms, ML signal engines, AI-native products, infrastructure, and developer tooling. Real work, real outcomes.',
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

          <Reveal delay={0.05}>
            <h1
              className="max-w-4xl text-[clamp(2.5rem,1.4rem+5vw,5.5rem)] font-normal text-[var(--sage-ink)]"
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
              launched, and continues to operate — architecture decisions, test suites, CI
              pipelines, deployment playbooks, all of it.
            </p>
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
            <span className="italic text-[#0ED3CF]" style={{ fontFamily: 'var(--font-display)' }}>
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
    </main>
  )
}
