import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'
import { TiltCard } from '@/components/agency/islands/tilt-card'

interface WorkSample {
  title: string
  proves: string
  tooling: string
  placeholder: string
}

const WORK_SAMPLES: WorkSample[] = [
  {
    title: 'AI eval output',
    proves: 'Proves: answers are scored against a rubric, not eyeballed.',
    tooling: 'TS · eval script',
    placeholder: 'AI eval output (JSON)',
  },
  {
    title: 'Playwright browser proof',
    proves: 'Proves: critical flows run and verify themselves.',
    tooling: 'Playwright · trace files',
    placeholder: 'Playwright browser proof',
  },
  {
    title: 'Release readiness report',
    proves: 'Proves: "ready" is a generated verdict, not a feeling.',
    tooling: 'CI · readiness-report.json',
    placeholder: 'readiness-report.json',
  },
  {
    title: 'Automation job log',
    proves: 'Proves: workflows are observable — runs, retries, failures.',
    tooling: 'Node · job runner',
    placeholder: 'automation job log',
  },
  {
    title: 'Architecture diagram',
    proves: 'Proves: real data flow — model, retrieval, approval, logging.',
    tooling: 'built in code',
    placeholder: 'architecture diagram',
  },
  {
    title: 'Bug reproduction note',
    proves: 'Proves: defects reported with steps, expected vs actual, severity.',
    tooling: 'QA · triage note',
    placeholder: 'bug reproduction note',
  },
]

/** Section 06 — Work samples: six labeled tilt frames awaiting real artifacts. */
export function WorkSamplesSection() {
  return (
    <SectionShell
      id="work-samples"
      num="06"
      kicker="WORK SAMPLES"
      annotation="EACH FRAME IS A LABELED SLOT FOR A SPECIFIC ARTIFACT"
      ghost="06"
    >
      <div className="ag-ws-grid">
        {WORK_SAMPLES.map((sample, i) => (
          <Reveal key={sample.title} delay={i * 60}>
            <TiltCard className="ag-ws-card">
              <figure className="ag-ws-slot">
                <figcaption className="ag-ws-slot-caption">{sample.placeholder}</figcaption>
              </figure>
              <h3 className="ag-ws-title">{sample.title}</h3>
              <p className="ag-ws-proves">
                {sample.proves} <span className="ag-ws-tooling">{sample.tooling}</span>
              </p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  )
}
