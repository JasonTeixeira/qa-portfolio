import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'
import { TiltCard } from '@/components/agency/islands/tilt-card'
import { EVIDENCE_CAPTURES } from '@/data/agency/evidence-manifest'

interface WorkSample {
  key: string
  title: string
  proves: string
  tooling: string
  placeholder: string
}

const WORK_SAMPLES: WorkSample[] = [
  {
    key: 'eval-output',
    title: 'AI eval output',
    proves: 'Proves: answers are scored against a rubric, not eyeballed.',
    tooling: 'TS · eval script',
    placeholder: 'AI eval output (JSON)',
  },
  {
    key: 'browser-proof',
    title: 'Playwright browser proof',
    proves: 'Proves: critical flows run and verify themselves.',
    tooling: 'Playwright · trace files',
    placeholder: 'Playwright browser proof',
  },
  {
    key: 'readiness-report',
    title: 'Release readiness report',
    proves: 'Proves: "ready" is a generated verdict, not a feeling.',
    tooling: 'CI · readiness-report.json',
    placeholder: 'readiness-report.json',
  },
  {
    key: 'job-log',
    title: 'Automation job log',
    proves: 'Proves: workflows are observable — runs, retries, failures.',
    tooling: 'Node · job runner',
    placeholder: 'automation job log',
  },
  {
    key: 'architecture',
    title: 'Architecture diagram',
    proves: 'Proves: real data flow — model, retrieval, approval, logging.',
    tooling: 'built in code',
    placeholder: 'architecture diagram',
  },
  {
    key: 'bug-note',
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
              {(() => {
                const capture = EVIDENCE_CAPTURES.find((c) => c.slot === sample.key)
                return capture ? (
                  <figure className="ag-ws-slot ag-ws-slot--filled">
                    <img
                      src={capture.file}
                      alt={capture.title}
                      width={1200}
                      height={750}
                      loading="lazy"
                    />
                    <figcaption className="ag-ws-slot-caption">{capture.title}</figcaption>
                  </figure>
                ) : (
                  <figure className="ag-ws-slot">
                    <figcaption className="ag-ws-slot-caption">{sample.placeholder}</figcaption>
                  </figure>
                )
              })()}
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
