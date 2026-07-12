import type { Metadata } from 'next'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import { SystemDiagram } from '@/components/agency/diagrams/system-diagram'
import { TestPyramid } from '@/components/agency/islands/test-pyramid'
import { GroundingDemo } from '@/components/agency/islands/grounding-demo'
import { BeforeAfterToggle } from '@/components/agency/islands/before-after'
import { CountUp } from '@/components/agency/islands/count-up'
import {
  ArtifactInspectorProvider,
  InspectableArtifact,
} from '@/components/agency/islands/artifact-inspector'
import { CASE_STUDIES, type CaseStudy } from '@/data/agency/case-studies'
import { EVIDENCE_CAPTURES } from '@/data/agency/evidence-manifest'
import './work.css'

/**
 * /work/[slug] — one FULL case study per page. The homepage section
 * (components/agency/sections/case-studies.tsx) shows only compact scene
 * cards; every number, hazard, demo, and evidence frame lives here.
 * All content comes from data/agency/case-studies.ts — no invented metrics.
 */

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  return CASE_STUDIES.map((study) => ({ slug: study.id }))
}

function getStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((study) => study.id === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const study = getStudy(slug)
  if (!study) return {}
  return {
    title: `${study.title} — Case Study`,
    description: study.subtitle,
    alternates: { canonical: `https://agency.sageideas.dev/work/${study.id}` },
  }
}

/** Interactive island per study — same mapping the homepage used to inline. */
function StudyDemo({ id }: { id: string }): ReactElement | null {
  switch (id) {
    case 'voza-verification':
      return <TestPyramid />
    case 'sage-kernel-course-auditor':
      return <GroundingDemo />
    case 'giggl-release-lane':
      return <BeforeAfterToggle />
    default:
      return null
  }
}

/** Real artifact captures first (from disk, styled frames), honest placeholders after. */
function EvidenceStrip({ study }: { study: CaseStudy }) {
  const captures = EVIDENCE_CAPTURES.filter((c) => c.slot.startsWith(`${study.id}-`))
  const placeholders = study.evidenceSlots.slice(captures.length)
  return (
    <div className="ag-cs-evidence">
      <h4 className="ag-cs-evidence-h">
        {captures.length > 0 ? 'EVIDENCE — REAL ARTIFACTS, CAPTURED FROM DISK' : 'EVIDENCE — REAL ARTIFACT PENDING DROP-IN'}
      </h4>
      <ArtifactInspectorProvider captures={captures}>
        <div className="ag-cs-slots">
          {captures.map((capture) => (
            <InspectableArtifact
              key={capture.file}
              capture={capture}
              className="ag-cs-slot ag-cs-slot--filled"
            >
              <span className="ag-inspect-media">
                <img
                  src={capture.file}
                  alt={capture.title}
                  width={1200}
                  height={750}
                  loading="lazy"
                />
              </span>
              <span className="ag-cs-slot-caption">{capture.title}</span>
              <span className={`ag-cs-tier ag-cs-tier--${capture.tier.toLowerCase()}`}>
                {capture.tier}
              </span>
            </InspectableArtifact>
          ))}
          {placeholders.map((slot) => (
            <figure key={slot.caption} className="ag-cs-slot">
              <figcaption className="ag-cs-slot-caption">{slot.caption} · PENDING</figcaption>
              <span className={`ag-cs-tier ag-cs-tier--${slot.tier.toLowerCase()}`}>{slot.tier}</span>
            </figure>
          ))}
        </div>
      </ArtifactInspectorProvider>
    </div>
  )
}

/** ← previous / next → among CASE_STUDIES by array order. */
function StudyPager({ study }: { study: CaseStudy }): ReactElement | null {
  const index = CASE_STUDIES.findIndex((s) => s.id === study.id)
  if (index === -1) return null
  const previous = index > 0 ? CASE_STUDIES[index - 1] : undefined
  const next = index < CASE_STUDIES.length - 1 ? CASE_STUDIES[index + 1] : undefined
  if (!previous && !next) return null

  return (
    <nav className="ag-work-pager" aria-label="More case studies">
      <p className="ag-work-pager-kicker">MORE CASE STUDIES</p>
      <div className="ag-work-pager-row">
        <div className="ag-work-pager-cell">
          {previous ? (
            <>
              <p className="ag-work-pager-dir">← PREVIOUS</p>
              <Link href={`/work/${previous.id}`} className="ag-work-pager-link">
                {previous.title}
              </Link>
            </>
          ) : null}
        </div>
        <div className="ag-work-pager-cell ag-work-pager-cell--next">
          {next ? (
            <>
              <p className="ag-work-pager-dir">NEXT →</p>
              <Link href={`/work/${next.id}`} className="ag-work-pager-link">
                {next.title}
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  )
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params
  const study = getStudy(slug)
  if (!study) notFound()

  const demo = <StudyDemo id={study.id} />

  return (
    <>
      <AgencyNav />
      <main id="main-content" tabIndex={-1}>
        <article aria-labelledby="work-title">
          {/* Hero band */}
          <header className="ag-section ag-work-hero">
            <div className="ag-work-topline">
              <p className="ag-kicker">CASE STUDY</p>
              <span className={`ag-badge ag-badge--${study.badge.variant}`}>
                {study.badge.label}
              </span>
            </div>
            <h1 id="work-title" className="ag-work-h1">
              {study.title}
            </h1>
            <p className="ag-work-sub">{study.subtitle}</p>
          </header>

          <div className="ag-section" style={{ paddingTop: 0 }}>
            <div className="ag-cs">
              {/* System topology — the 5-second read */}
              <div className="ag-cs-diagram">
                <SystemDiagram uid={`work-${study.id}`} spec={study.diagram} />
              </div>

              <div className="ag-cs-body ag-work-body">
                {/* Problem / built band */}
                <div className="ag-cs-band">
                  <div className="ag-cs-band-col">
                    <h2 className="ag-cs-band-h">PROBLEM</h2>
                    <p className="ag-cs-band-p">{study.problem}</p>
                  </div>
                  <div className="ag-cs-band-col">
                    <h2 className="ag-cs-band-h">BUILT</h2>
                    <p className="ag-cs-band-p">{study.built}</p>
                  </div>
                </div>

                {/* Instrument stat tiles */}
                <dl className="ag-cs-stats">
                  {study.stats.map((stat) => (
                    <div key={stat.label} className="ag-cs-stat">
                      <dt className="ag-cs-stat-label">{stat.label}</dt>
                      <dd className="ag-cs-stat-value">
                        <CountUp value={stat.value} />
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Failure modes as pinned hazard chips */}
                <div className="ag-cs-hazards">
                  <span className="ag-cs-hazards-h">FAILURE MODES</span>
                  <ul className="ag-cs-hazard-list">
                    {study.hazards.map((hazard) => (
                      <li key={hazard} className="ag-cs-hazard">
                        {hazard}
                      </li>
                    ))}
                  </ul>
                </div>

                {demo ? <div className="ag-cs-demo">{demo}</div> : null}

                <EvidenceStrip study={study} />

                <footer className="ag-cs-footer">
                  <div className="ag-cs-stack">
                    {study.stack.map((item) => (
                      <span key={item} className="ag-chip">
                        {item}
                      </span>
                    ))}
                    {study.repoUrl ? (
                      <a
                        href={study.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ag-chip ag-cs-repo-chip"
                      >
                        INSPECT THE REPO ↗
                      </a>
                    ) : null}
                  </div>
                  <p className="ag-cs-improve">
                    <strong>IMPROVE NEXT:</strong> {study.improveNext}
                  </p>
                </footer>
              </div>
            </div>

            {/* CTA row */}
            <div className="ag-work-cta">
              <Link href="/#contact" className="ag-btn ag-btn--solid">
                HIRE ME FOR THIS →
              </Link>
              <Link href="/#case-studies" className="ag-btn">
                ← ALL WORK
              </Link>
            </div>

            <StudyPager study={study} />
          </div>
        </article>
      </main>
      <AgencyFooter />
    </>
  )
}
