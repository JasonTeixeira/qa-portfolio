import type { CSSProperties, ReactElement } from 'react'

import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'
import {
  ApprovalLoopMotif,
  BrowserGridMotif,
  DocTreeMotif,
  EvalLoopMotif,
  GateFunnelMotif,
  WorkflowDagMotif,
} from '@/components/agency/micro-diagrams'

interface ProofCategory {
  category: string
  accent: string
  title: string
  microcopy: string
  Motif: () => ReactElement
}

const PROOF_CATEGORIES: readonly ProofCategory[] = [
  {
    category: 'AI QUALITY',
    accent: 'var(--acc-ai)',
    title: 'RAG evaluation harnesses',
    microcopy: 'Inspect the eval output →',
    Motif: EvalLoopMotif,
  },
  {
    category: 'BROWSER QA',
    accent: 'var(--acc-browser)',
    title: 'Playwright E2E flows',
    microcopy: 'See the test report →',
    Motif: BrowserGridMotif,
  },
  {
    category: 'OPERATIONS',
    accent: 'var(--acc-pass)',
    title: 'Automation workflows',
    microcopy: 'Read the run logs →',
    Motif: WorkflowDagMotif,
  },
  {
    category: 'RELEASE SAFETY',
    accent: 'var(--acc-primary)',
    title: 'Release readiness gates',
    microcopy: 'Open the scorecard →',
    Motif: GateFunnelMotif,
  },
  {
    category: 'HUMAN-IN-THE-LOOP',
    accent: 'var(--acc-pass)',
    title: 'AI assistant workflows',
    microcopy: 'Trace the approval loop →',
    Motif: ApprovalLoopMotif,
  },
  {
    category: 'DOCUMENTATION',
    accent: 'var(--acc-log)',
    title: 'Runbooks & workflow maps',
    microcopy: 'Review the runbook →',
    Motif: DocTreeMotif,
  },
]

/** Section 02 — proof categories, each linking to an inspectable artifact. */
export function ProofGridSection() {
  return (
    <SectionShell id="proof" num="02" kicker="PROOF, NOT PERCENTAGES" ghost="02">
      <Reveal>
        <p className="ag-proof-lede">
          No invented time savings. Every category links to an inspectable artifact.
        </p>
      </Reveal>
      <Reveal delay={120}>
        <div className="ag-grid ag-proof-grid">
          {PROOF_CATEGORIES.map((item) => (
            <a
              key={item.category}
              href="#case-studies"
              className="ag-cell ag-proof-card ag-proof-card--motif"
              style={{ '--card-acc': item.accent } as CSSProperties}
            >
              <span className="ag-proof-card-motif" aria-hidden="true">
                <item.Motif />
              </span>
              <span className="ag-proof-card-cat">{item.category}</span>
              <span className="ag-proof-card-title">{item.title}</span>
              <span className="ag-proof-card-cta">{item.microcopy}</span>
            </a>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
