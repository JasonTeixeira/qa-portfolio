'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Surface, MonoLabel, Hairline, Reveal, CtaLink, RegistrationTicks } from '@/components/el'
import { MetricRegister } from '@/components/el/work/MetricRegister'
import { EvidenceGallery } from '@/components/el/work/EvidenceGallery'
import { ScreenViewer } from '@/components/el/work/ScreenViewer'
import { BuildLog } from '@/components/el/work/BuildLog'
import { TestimonialCard } from '@/components/testimonial-card'
import { MotionProofStrip, SurfaceSystemPanel } from '@/components/living/LivingPageSystem'
import { DeepSystemDiagram } from '@/components/living/DeepSystemDiagram'
import { CaseProofBoard } from '@/components/work/CaseProofBoard'
import { CaseMotionStoryboard } from '@/components/work/CaseMotionStoryboard'
import { CaseStudyToc } from '@/components/work/CaseStudyToc'
import { SurfaceSystemXray } from '@/components/work/SurfaceSystemXray'
import { referencesForCaseStudy } from '@/data/references'
import { type CaseStudy } from '@/data/work/case-studies'
import { type CaseExtras } from '@/data/work/case-extras'
import { CaseStudyArchitecture } from '@/components/diagrams'

interface Props {
  study: CaseStudy
  extras?: CaseExtras
}

const DISPLAY_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
  letterSpacing: '-0.024em',
  lineHeight: 1.02,
}

const H2_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.018em',
}

/** A ruled section header: index · mono eyebrow · Fraunces heading. */
function SubHead({
  index,
  eyebrow,
  heading,
  lede,
}: {
  index: string
  eyebrow: string
  heading: string
  lede?: string
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <MonoLabel tone="accent" className="tabular-nums">
          {index}
        </MonoLabel>
        <MonoLabel tone="muted">{`// ${eyebrow}`}</MonoLabel>
        <Hairline className="flex-1" />
      </div>
      <h2
        className="text-[clamp(1.6rem,_1.2rem_+_1.4vw,_2.25rem)] font-normal text-[var(--sage-ink)]"
        style={H2_STYLE}
      >
        {heading}
      </h2>
      {lede && (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sage-ink-faint)]">{lede}</p>
      )}
    </div>
  )
}

export function CaseStudyView({ study, extras: _extras }: Props) {
  // `extras` is consumed by the parent server component (case-study-extras.tsx).
  void _extras
  const refs = referencesForCaseStudy(study.slug, 2)
  const Diagram = CaseStudyArchitecture[study.slug]
  // The first diagram in the gallery is the system map for the Surface→System x-ray.
  const systemDiagram = study.gallery?.find((asset) => asset.kind === 'diagram')

  // Metadata register printed in the title block.
  const status = study.metrics.find((m) => m.label.toLowerCase() === 'status')?.value
  const meta: { label: string; value: string }[] = [
    { label: 'Role', value: 'Design + build + operate' },
    { label: 'Client', value: study.client },
    { label: 'Category', value: study.category },
    { label: 'Status', value: status ?? 'Operational' },
  ]

  return (
    <article className="relative min-h-screen bg-[var(--sage-bg)]">
      {/* ════════════ TITLE BLOCK ════════════ */}
      <header className="sage-grain sage-depth relative isolate overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-28 sm:px-8 sm:pt-32 lg:pt-36">
          {/* Back link */}
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-faint)] transition-colors hover:text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            all case studies
          </Link>

          <Reveal className="mt-10">
            <div className="flex items-center gap-4">
              <MonoLabel tone="accent" className="tabular-nums">
                {study.category.toUpperCase()}
              </MonoLabel>
              <MonoLabel tone="muted">{`// case study`}</MonoLabel>
              <Hairline className="hidden flex-1 sm:block" strong />
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="mt-7 text-[12px] uppercase tracking-[0.18em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {study.title}
            </p>
            <h1
              className="mt-3 max-w-4xl text-[clamp(2.25rem,_1.3rem_+_4.5vw,_4.75rem)] font-normal text-[var(--sage-ink)]"
              style={DISPLAY_STYLE}
            >
              {study.posterTitle ?? study.title}
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-7 max-w-[62ch] text-base leading-[1.75] text-[var(--sage-ink-muted)] sm:text-lg">
              {study.tagline}
            </p>
          </Reveal>

          {/* Metadata register — role / stack / status / dates */}
          <Reveal delay={0.14}>
            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-4">
              {meta.map((m) => (
                <div key={m.label} className="bg-[var(--sage-surface-1)] px-5 py-4">
                  <dt className="text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
                    {m.label}
                  </dt>
                  <dd className="mt-1.5 text-sm leading-snug text-[var(--sage-ink)] [font-family:var(--font-mono),ui-monospace,monospace]">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Hero image — hairline-framed, registration ticks */}
          {study.heroImage && (
            <Reveal delay={0.18}>
              <div className="relative mt-10 overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-bg)]">
                <RegistrationTicks />
                <span
                  aria-hidden
                  className="absolute left-3 top-3 z-10 text-[9px] uppercase tracking-[0.2em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                >
                  fig.00 · {study.slug}
                </span>
                <Image
                  src={study.heroImage}
                  alt={`${study.title} hero`}
                  width={1440}
                  height={810}
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="aspect-video w-full object-cover"
                />
              </div>
            </Reveal>
          )}

          <Reveal delay={0.22}>
            <div className="mt-10">
              <MotionProofStrip
                items={study.metrics.slice(0, 4).map((metric) => ({
                  label: metric.label,
                  value: metric.value,
                }))}
              />
            </div>
          </Reveal>
        </div>
      </header>

      <section className="border-t border-[var(--sage-border)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <Reveal>
            <SurfaceSystemPanel
              title="Surface ⇄ System"
              body={`${study.title.split('—')[0].trim()} is presented as both the product people touch and the operating system underneath it: UI, data model, integration path, evidence, and outcome.`}
              cta={study.ctaSecondary ?? { label: 'Build something like this', href: '/services/build' }}
              steps={[
                {
                  label: 'Visible product',
                  detail: study.screens?.length
                    ? 'Screenshots and product frames show the user-facing surface without pretending concept art is production proof.'
                    : 'The product surface is explained through shipped flows, artifacts, and real constraints.',
                },
                {
                  label: 'Operating architecture',
                  detail: Diagram
                    ? 'The case includes a system map so the architecture is visible, not buried in prose.'
                    : 'The case names the backend, data, deployment, and operational decisions that made the build work.',
                },
                {
                  label: 'Evidence register',
                  detail: 'Metrics, build logs, diagrams, CI artifacts, and links separate actual work from agency theater.',
                },
                {
                  label: 'Commercial path',
                  detail: 'The page routes qualified buyers toward a matching build, automation, or lab entry.',
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {study.heroImage && systemDiagram ? (
        <section className="border-t border-[var(--sage-border)]">
          <div className="mx-auto max-w-6xl px-5 pt-12 sm:px-8 lg:pt-16">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--sage-accent-readable)]">
              {`// scroll to x-ray the build`}
            </p>
          </div>
          <SurfaceSystemXray
            surfaceSrc={study.heroImage}
            systemSrc={systemDiagram.src}
            surfaceAlt={`${study.title.split('—')[0].trim()} product surface`}
            systemAlt={systemDiagram.label ?? 'System architecture map'}
            caption={systemDiagram.caption}
          />
        </section>
      ) : null}

      <section className="border-t border-[var(--sage-border)]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
          <Reveal>
            <DeepSystemDiagram
              eyebrow="case flow"
              title={`${study.title.split('—')[0].trim()} operating map`}
              description="A case study should prove both layers: the surface people see, and the system that keeps the product alive after launch."
              nodes={[
                { label: 'Problem', detail: study.category },
                { label: 'Surface', detail: study.screens?.length ? `${study.screens.length} screens` : 'flows' },
                { label: 'System', detail: Diagram ? 'mapped' : 'named' },
                { label: 'Proof', detail: `${study.metrics.length} metrics` },
                { label: 'Route', detail: study.ctaSecondary ? 'service' : 'lab' },
              ]}
              stats={[
                { label: 'client', value: study.client },
                { label: 'category', value: study.category },
                { label: 'evidence', value: study.gallery?.length ? `${study.gallery.length} assets` : 'metrics' },
              ]}
            />
          </Reveal>
        </div>
      </section>

      <CaseProofBoard study={study} />
      <CaseMotionStoryboard study={study} />

      {/* ════════════ BODY — two-column with sticky sidebar ════════════ */}
      <div className="border-t border-[var(--sage-border)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-16">
            {/* ── Sticky sidebar ── */}
            <aside className="mb-12 hidden lg:sticky lg:top-24 lg:mb-0 lg:block lg:self-start">
              <div className="space-y-4">
                <CaseStudyToc />
                <Surface level={1} className="p-5">
                  <MonoLabel tone="faint" className="block">
                    client
                  </MonoLabel>
                  <p className="mt-2 text-sm leading-snug text-[var(--sage-ink)]">{study.client}</p>
                </Surface>

                <Surface level={1} className="p-5">
                  <MonoLabel tone="faint" className="block">
                    stack
                  </MonoLabel>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[2px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Surface>

                <Surface level={1} className="p-5">
                  <MonoLabel tone="faint" className="block">
                    key metrics
                  </MonoLabel>
                  <dl className="mt-3 space-y-2.5">
                    {study.metrics.map((m) => (
                      <div key={m.label} className="flex items-baseline justify-between gap-3">
                        <dt className="text-xs text-[var(--sage-ink-faint)]">{m.label}</dt>
                        <dd className="text-sm tabular-nums text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Surface>

                {study.relatedLab && (
                  <Surface level={1} interactive className="p-5">
                    <Link href={`/lab/${study.relatedLab}`} className="block focus-visible:outline-none">
                      <MonoLabel tone="faint" className="block">
                        lab entry
                      </MonoLabel>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                        view tearsheet <span aria-hidden>→</span>
                      </span>
                    </Link>
                  </Surface>
                )}
              </div>
            </aside>

            {/* ── Main column ── */}
            <main data-cs-main className="space-y-16 lg:space-y-20">
              {/* Problem */}
              <Reveal>
                <section className="space-y-5">
                  <SubHead index="01" eyebrow="the problem" heading="What was broken." />
                  <div className="space-y-4">
                    {study.problem.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)]">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>

              {/* Approach */}
              <Reveal>
                <section className="space-y-5">
                  <SubHead index="02" eyebrow="the approach" heading="How it was built." />
                  <div className="space-y-4">
                    {study.approach.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)]">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>

              {/* Architecture diagram */}
              {Diagram && (
                <Reveal>
                  <section className="space-y-5">
                    <SubHead
                      index="03"
                      eyebrow="architecture"
                      heading="The system map."
                      lede="How the pieces talk to each other."
                    />
                    <div className="overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-4 sm:p-6">
                      <Diagram />
                    </div>
                  </section>
                </Reveal>
              )}

              {/* Metrics — institutional ruled data viz */}
              <Reveal>
                <section className="space-y-5">
                  <SubHead
                    index="04"
                    eyebrow="the numbers"
                    heading="Measured, not asserted."
                    lede="The real figures from the engagement, printed verbatim. Bars are scaled against the largest comparable magnitude in the set — a secondary cue, never the source of truth."
                  />
                  <MetricRegister metrics={study.metrics} />
                </section>
              </Reveal>

              {/* Selected screens */}
              {study.screens && study.screens.length > 0 && (
                <Reveal>
                  <section className="space-y-5">
                    <SubHead
                      index="05"
                      eyebrow="built ui"
                      heading="Selected screens."
                      lede="Real product surfaces from the engagement — not stock illustrations."
                    />
                    <ScreenViewer screens={study.screens} />
                  </section>
                </Reveal>
              )}

              {/* Evidence gallery */}
              {study.gallery && study.gallery.length > 0 && (
                <Reveal>
                  <section className="space-y-5">
                    <SubHead
                      index="06"
                      eyebrow="evidence"
                      heading="What it actually looks like."
                      lede="Architecture diagrams, CI runs, and dashboards from the engagement."
                    />
                    <EvidenceGallery
                      items={study.gallery}
                      columns={study.gallery.length === 1 ? 1 : 2}
                    />
                  </section>
                </Reveal>
              )}

              {/* Build log */}
              <Reveal>
                <section className="space-y-6">
                  <SubHead
                    index="07"
                    eyebrow="the build log"
                    heading="What shipped."
                    lede="The verbatim ship record, given timeline structure."
                  />
                  <BuildLog entries={study.build} />
                </section>
              </Reveal>

              {/* Outcome */}
              <Reveal>
                <section className="space-y-5">
                  <SubHead index="08" eyebrow="the outcome" heading="What it proved." />
                  <div className="space-y-4">
                    {study.outcome.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[1.75] text-[var(--sage-ink-muted)]">
                        {p}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>

              {/* Artifacts */}
              {study.artifacts && study.artifacts.length > 0 && (
                <Reveal>
                  <section className="space-y-5">
                    <SubHead index="09" eyebrow="artifacts" heading="Available on request." />
                    <ul className="m-0 list-none space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] p-0">
                      {study.artifacts.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 bg-[var(--sage-surface-1)] px-5 py-3.5 text-sm text-[var(--sage-ink-muted)]"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#3D5AFE]"
                          />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              )}
            </main>
          </div>

          {/* References */}
          {refs.length > 0 && (
            <Reveal>
              <section className="mt-20 border-t border-[var(--sage-border)] pt-14">
                <div className="mb-3 flex items-center gap-4">
                  <MonoLabel tone="accent">{`// references`}</MonoLabel>
                  <Hairline className="flex-1" />
                </div>
                <h2
                  className="text-[clamp(1.6rem,_1.2rem_+_1.4vw,_2.25rem)] font-normal text-[var(--sage-ink)]"
                  style={H2_STYLE}
                >
                  Talk to people on this work.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--sage-ink-muted)]">
                  No fabricated quotes. Reference contacts are shared during discovery, with both
                  parties&apos; consent.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {refs.map((r, i) => (
                    <TestimonialCard key={r.id} reference={r} index={i} />
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* CTA strip */}
          <Reveal>
            <section className="mt-16 border-t border-[var(--sage-border)] pt-14">
              <div className="grid gap-4 sm:grid-cols-2">
                <CtaLink
                  href={study.ctaSecondary?.href ?? '/services/build'}
                  variant="solid"
                  event="case_study_cta_primary"
                  eventProps={{ slug: study.slug }}
                  className="w-full justify-between"
                >
                  {study.ctaSecondary?.label ?? 'Build something like this'}
                </CtaLink>

                {study.ctaPrimary && (
                  <CtaLink
                    href={study.ctaPrimary.href}
                    variant="ghost"
                    event="case_study_cta_secondary"
                    eventProps={{ slug: study.slug }}
                    className="w-full justify-between"
                  >
                    {study.ctaPrimary.label}
                  </CtaLink>
                )}
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </article>
  )
}

// Back-compat alias — the page imports `CaseStudyContent`.
export const CaseStudyContent = CaseStudyView
