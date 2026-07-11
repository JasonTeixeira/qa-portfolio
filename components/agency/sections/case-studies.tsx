import type { ReactNode } from 'react'
import { CASE_STUDIES, type CaseStudy } from '@/data/agency/case-studies'
import { EVIDENCE_CAPTURES } from '@/data/agency/evidence-manifest'
import { Reveal } from '@/components/agency/core'
import { SystemDiagram } from '@/components/agency/diagrams/system-diagram'
import { SectionShell } from '@/components/agency/section-shell'

const OPEN_REPO_NAMES: readonly string[] = [
  'playwright-sdet-regression-suite',
  'Nexural_Automation',
  'nexural-automation-starter',
  'graphify',
]

/**
 * Section 03 — Featured case studies. Server component. Diagram-first:
 * each study leads with a full SystemDiagram topology, the title row overlaps
 * the diagram's bottom edge, and prose is compressed to one problem sentence,
 * one built sentence, instrument stats, and hazard chips.
 * Content lives in data/agency/case-studies.ts (sourced from the proof inventory).
 */

/** Real artifact captures first (from disk, styled frames), honest placeholders after. */
function EvidenceStrip({ study }: { study: CaseStudy }) {
  const captures = EVIDENCE_CAPTURES.filter((c) => c.slot.startsWith(`${study.id}-`))
  const placeholders = study.evidenceSlots.slice(captures.length)
  return (
    <div className="ag-cs-evidence">
      <h4 className="ag-cs-evidence-h">
        {captures.length > 0 ? 'EVIDENCE — REAL ARTIFACTS, CAPTURED FROM DISK' : 'EVIDENCE — REAL ARTIFACT PENDING DROP-IN'}
      </h4>
      <div className="ag-cs-slots">
        {captures.map((capture) => (
          <figure key={capture.file} className="ag-cs-slot ag-cs-slot--filled">
            <img
              src={capture.file}
              alt={capture.title}
              width={1200}
              height={750}
              loading="lazy"
            />
            <figcaption className="ag-cs-slot-caption">{capture.title}</figcaption>
            <span className={`ag-cs-tier ag-cs-tier--${capture.tier.toLowerCase()}`}>
              {capture.tier}
            </span>
          </figure>
        ))}
        {placeholders.map((slot) => (
          <figure key={slot.caption} className="ag-cs-slot">
            <figcaption className="ag-cs-slot-caption">{slot.caption} · PENDING</figcaption>
            <span className={`ag-cs-tier ag-cs-tier--${slot.tier.toLowerCase()}`}>{slot.tier}</span>
          </figure>
        ))}
      </div>
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
        {/* System topology — the 5-second read */}
        <div className="ag-cs-diagram">
          <SystemDiagram uid={study.id} spec={study.diagram} />
        </div>

        {/* Title row overlapping the diagram's bottom edge */}
        <div className="ag-cs-titlerow ag-cs-titlerow--overlap">
          <span className="ag-cs-num">{num}</span>
          <h3 id={`${study.id}-title`} className="ag-cs-title">
            {study.title}
          </h3>
          <span className={`ag-badge ag-badge--${study.badge.variant} ag-cs-badge`}>
            {study.badge.label}
          </span>
        </div>

        <div className="ag-cs-body">
          <p className="ag-cs-subtitle">{study.subtitle}</p>

          {/* Compact problem / built band */}
          <div className="ag-cs-band">
            <div className="ag-cs-band-col">
              <h4 className="ag-cs-band-h">PROBLEM</h4>
              <p className="ag-cs-band-p">{study.problem}</p>
            </div>
            <div className="ag-cs-band-col">
              <h4 className="ag-cs-band-h">BUILT</h4>
              <p className="ag-cs-band-p">{study.built}</p>
            </div>
          </div>

          {/* Instrument stat tiles */}
          <dl className="ag-cs-stats">
            {study.stats.map((stat) => (
              <div key={stat.label} className="ag-cs-stat">
                <dt className="ag-cs-stat-label">{stat.label}</dt>
                <dd className="ag-cs-stat-value">{stat.value}</dd>
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

      <Reveal>
        <aside className="ag-cs-openband" aria-label="More open-source repositories">
          <a
            href="https://github.com/JasonTeixeira?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="ag-cs-openband-lead"
          >
            More code in the open — github.com/JasonTeixeira
          </a>
          <div className="ag-cs-openband-chips">
            {OPEN_REPO_NAMES.map((name) => (
              <a
                key={name}
                href={`https://github.com/JasonTeixeira/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ag-chip ag-cs-openband-chip"
              >
                {name}
              </a>
            ))}
          </div>
        </aside>
      </Reveal>
    </SectionShell>
  )
}
