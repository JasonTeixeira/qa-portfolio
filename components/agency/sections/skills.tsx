import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

interface SkillOutcome {
  outcome: string
  tools: string
}

const SKILL_OUTCOMES: readonly SkillOutcome[] = [
  {
    outcome: 'Build AI workflows',
    tools:
      'Claude / OpenAI APIs · RAG pipelines · prompt evaluation · retrieval testing · source grounding',
  },
  {
    outcome: 'Test software systems',
    tools:
      'Playwright · unit / integration / E2E · accessibility checks · visual regression · API smoke tests',
  },
  {
    outcome: 'Automate operations',
    tools:
      'Node.js · Python · scheduled jobs · webhooks · Discord / Slack workflows · report generation',
  },
  {
    outcome: 'Validate releases',
    tools:
      'build / typecheck / lint gates · test suites · API smoke checks · readiness reports · rollback notes',
  },
  {
    outcome: 'Debug failures',
    tools:
      'reproduction steps · log review · flaky test diagnosis · root-cause notes · fix verification',
  },
  {
    outcome: 'Document handoff-ready systems',
    tools: 'runbooks · workflow maps · architecture diagrams · QA checklists · operating notes',
  },
]

/** Section 05 — skills grouped by the outcome they produce, not the tool. */
export function SkillsSection() {
  return (
    <SectionShell
      id="skills"
      num="05"
      kicker="SKILLS, ORGANIZED BY OUTCOME"
      annotation="NOT A TOOL LIST"
      ghost="05"
    >
      <Reveal>
        <div className="ag-grid ag-skills-grid">
          {SKILL_OUTCOMES.map((skill) => (
            <article key={skill.outcome} className="ag-cell ag-skills-cell">
              <h3 className="ag-skills-outcome">{skill.outcome}</h3>
              <p className="ag-skills-tools">{skill.tools}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  )
}
