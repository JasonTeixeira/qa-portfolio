import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

const TARGET_ROLES = [
  'AI Automation Engineer',
  'QA Automation Engineer / SDET',
  'AI Evaluation Engineer',
  'Test Infrastructure Engineer',
  'Workflow Automation Engineer',
] as const

const BEST_FIT_WORK = [
  'AI workflows with evals + source checks',
  'Playwright & API test coverage',
  'Manual ops → repeatable systems',
  'Release readiness & QA reporting loops',
  'Debugging brittle workflows',
] as const

const STRONGEST_TOOLS = [
  'Playwright',
  'TypeScript',
  'Node.js',
  'Python',
  'Claude / OpenAI APIs',
  'RAG pipelines',
  'CI gates',
  'Webhooks',
  'Supabase',
] as const

const STRONGEST_PROOF = [
  { href: '#case-studies', label: 'RAG eval harnesses →' },
  { href: '#case-studies', label: 'Browser automation proof →' },
  { href: '#case-studies', label: 'Readiness reports →' },
  { href: '#case-studies', label: 'Workflow run logs →' },
  { href: '#ledger', label: 'Evidence ledger →' },
] as const

/** Section 01 — the hiring-manager fast scan. */
export function ScanSection() {
  return (
    <SectionShell
      id="scan"
      num="01"
      kicker="THE 30-SECOND SCAN"
      annotation="FOR HIRING MANAGERS & TECHNICAL LEADS"
      ghost="01"
    >
      <Reveal>
        <div className="ag-grid ag-scan-grid">
          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">TARGET ROLES</h3>
            <ul className="ag-scan-list">
              {TARGET_ROLES.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </article>

          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">BEST-FIT WORK</h3>
            <ul className="ag-scan-list">
              {BEST_FIT_WORK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">STRONGEST TOOLS</h3>
            <div className="ag-scan-chips">
              {STRONGEST_TOOLS.map((tool) => (
                <span key={tool} className="ag-chip">
                  {tool}
                </span>
              ))}
            </div>
          </article>

          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">STRONGEST PROOF</h3>
            <ul className="ag-scan-list">
              {STRONGEST_PROOF.map((proof) => (
                <li key={proof.label}>
                  <a href={proof.href} className="ag-scan-proof-link">
                    {proof.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="ag-scan-quicklinks">
              {/* TODO(assembly): point at the real resume PDF once it lands in /public */}
              <a href="#">↓ RESUME.PDF</a>
              <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
                ↗ GITHUB
              </a>
              <a href="mailto:sage@sageideas.dev">✉ EMAIL</a>
            </div>
          </article>
        </div>
      </Reveal>
    </SectionShell>
  )
}
