import type { ReactNode } from 'react'
import Link from 'next/link'
import { CASE_STUDIES, type CaseStudy } from '@/data/agency/case-studies'
import { Reveal } from '@/components/agency/core'
import { SystemDiagram } from '@/components/agency/diagrams/system-diagram'
import { SectionShell } from '@/components/agency/section-shell'

const OPEN_REPO_NAMES: readonly string[] = [
  'playwright-sdet-regression-suite',
  'Nexural_Automation',
  'nexural-automation-starter',
]

/**
 * Section 03 — Featured case studies. Server component. De-densified:
 * each study renders as a compact SCENE CARD — full SystemDiagram topology,
 * title row, one subtitle line, a 3-stat mini strip, and a link to the full
 * study at /work/<id>. All depth (problem/built, hazards, demos, evidence,
 * stack) lives on the detail pages under app/agency/work/[slug]/.
 * Content lives in data/agency/case-studies.ts (sourced from the proof inventory).
 */

/** Stats shown on the scene card — the rest render on /work/<id>. */
const MINI_STAT_COUNT = 3

/** First clause of the subtitle — the card carries ONE line; depth lives at /work/<id>. */
function sceneLine(study: CaseStudy): string {
  const lead = study.subtitle.split(' — ')[0]
  return lead.endsWith('.') ? lead : `${lead}.`
}

function SceneCard({ study, index }: { study: CaseStudy; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <Reveal as="div">
      <article id={study.id} className="ag-cs" aria-labelledby={`${study.id}-title`}>
        {/* System topology — the hero of the card */}
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
          <p className="ag-cs-subtitle">{sceneLine(study)}</p>

          {/* 3-stat mini strip — big mono values */}
          <dl className="ag-cs-stats ag-cs-stats--mini">
            {study.stats.slice(0, MINI_STAT_COUNT).map((stat) => (
              <div key={stat.label} className="ag-cs-stat">
                <dt className="ag-cs-stat-label">{stat.label}</dt>
                <dd className="ag-cs-stat-value">{stat.value}</dd>
              </div>
            ))}
          </dl>

          <Link href={`/work/${study.id}`} className="ag-cs-readlink">
            READ THE FULL STUDY →
          </Link>
        </div>
      </article>
    </Reveal>
  )
}

/**
 * The `demos` prop is intentionally accepted-and-ignored: interactive demos
 * moved to the /work/<slug> detail pages, but the signature is kept so
 * app/agency/page.tsx compiles unchanged.
 */
export function CaseStudiesSection(_props: { demos?: Record<string, ReactNode> } = {}) {
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
          <SceneCard key={study.id} study={study} index={index} />
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
