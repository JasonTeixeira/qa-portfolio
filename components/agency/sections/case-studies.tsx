import type { ReactNode } from 'react'
import { CASE_STUDIES, type CaseStudy } from '@/data/agency/case-studies'
import { Reveal } from '@/components/agency/core'
import { PipelineDiagram } from '@/components/agency/pipeline-diagram'
import { SectionShell } from '@/components/agency/section-shell'

/**
 * Section 03 — Featured case studies. Server component.
 * Content lives in data/agency/case-studies.ts (sourced from the proof inventory).
 */

function CaseStudyColumn({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="ag-cs-col">
      <h4 className="ag-cs-col-h">{heading}</h4>
      <p className="ag-cs-col-p">{body}</p>
    </div>
  )
}

function CaseStudyCard({
  study,
  index,
  demo,
}: {
  study: CaseStudy
  index: number
  demo?: ReactNode
}) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <Reveal as="div">
      <article id={study.id} className="ag-cs" aria-labelledby={`${study.id}-title`}>
        <header className="ag-cs-visual">
          <PipelineDiagram stages={study.pipeline} />
          <p className="ag-cs-pipetext">
            {study.pipeline.map((stage) => stage.label).join(' → ')}
          </p>
        </header>

        <div className="ag-cs-body">
          <div className="ag-cs-titlerow">
            <span className="ag-cs-num">{num}</span>
            <h3 id={`${study.id}-title`} className="ag-cs-title">
              {study.title}
            </h3>
            <span className={`ag-badge ag-badge--${study.badge.variant} ag-cs-badge`}>
              {study.badge.label}
            </span>
          </div>
          <p className="ag-cs-subtitle">{study.subtitle}</p>

          <div className="ag-cs-grid">
            <CaseStudyColumn heading="PROBLEM" body={study.problem} />
            <CaseStudyColumn heading="WHAT I BUILT" body={study.built} />
            <CaseStudyColumn heading="VALIDATION" body={study.validation} />
            <CaseStudyColumn heading="FAILURE MODES CONSIDERED" body={study.failureModes} />
          </div>

          {demo ? <div className="ag-cs-demo">{demo}</div> : null}

          <div className="ag-cs-evidence">
            <h4 className="ag-cs-evidence-h">EVIDENCE — REAL ARTIFACT PENDING DROP-IN</h4>
            <div className="ag-cs-slots">
              {study.evidenceSlots.map((slot) => (
                <figure key={slot.caption} className="ag-cs-slot">
                  <figcaption className="ag-cs-slot-caption">{slot.caption}</figcaption>
                  <span className={`ag-cs-tier ag-cs-tier--${slot.tier.toLowerCase()}`}>
                    {slot.tier}
                  </span>
                </figure>
              ))}
            </div>
          </div>

          <footer className="ag-cs-footer">
            <div className="ag-cs-stack">
              {study.stack.map((item) => (
                <span key={item} className="ag-chip">
                  {item}
                </span>
              ))}
            </div>
            <p className="ag-cs-improve">
              <strong>IMPROVE NEXT:</strong> {study.improveNext}
            </p>
          </footer>
        </div>
      </article>
    </Reveal>
  )
}

export function CaseStudiesSection({ demos = {} }: { demos?: Record<string, ReactNode> }) {
  return (
    <SectionShell
      id="case-studies"
      num="03"
      kicker="FEATURED CASE STUDIES"
      annotation="BUILT, TESTED, INSTRUMENTED — AND HONEST ABOUT STATUS"
      ghost="03"
    >
      <div className="ag-cs-list">
        {CASE_STUDIES.map((study, index) => (
          <CaseStudyCard key={study.id} study={study} index={index} demo={demos[study.id]} />
        ))}
      </div>
    </SectionShell>
  )
}
