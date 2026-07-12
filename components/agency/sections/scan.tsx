import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

const AUTOMATION_I_SHIP = [
  'CI/CD release gates & readiness reports',
  'Browser + E2E test fleets',
  'AI workflow evals & guardrails',
  'Ops automation — webhooks, queues, integrations',
  'Agent/MCP systems & internal tools',
  'Data pipelines with integrity checks',
] as const

const HOW_ENGAGEMENTS_WORK = [
  'Fixed-scope builds with proof included',
  'Audit → build → verify → handoff',
  'Every claim ships with its artifact',
  'Runbooks + docs so your team owns it',
  'Remote, async-first, evidence over meetings',
  'No invented metrics — here or in your build',
] as const

interface ToolGroup {
  label: string
  tools: readonly string[]
}

/* Every tool here is in active use across the linked repos — no résumé padding. */
const TOOL_GROUPS: readonly ToolGroup[] = [
  {
    label: 'TESTING & QA',
    tools: ['Playwright', 'Maestro (mobile E2E)', 'Vitest / Jest', 'axe-core', 'Lighthouse CI', 'visual regression'],
  },
  {
    label: 'AI SYSTEMS',
    tools: ['Claude / OpenAI / DeepSeek APIs', 'RAG + embeddings', 'eval harnesses', 'LLM-as-judge', 'MCP servers'],
  },
  {
    label: 'LANGUAGES',
    tools: ['TypeScript', 'Node.js', 'Python', 'SQL', 'Bash'],
  },
  {
    label: 'PIPELINES & DELIVERY',
    tools: ['GitHub Actions', 'CI release gates', 'Docker', 'Vercel', 'EAS / TestFlight', 'webhooks · queues · cron'],
  },
  {
    label: 'DATA & OBSERVABILITY',
    tools: ['Postgres / Supabase', 'DuckDB', 'Redis', 'Stripe API', 'Sentry', 'PostHog'],
  },
] as const

interface OpenSourceRepo {
  name: string
  proves: string
}

/** Exported so the sitemap footer renders the same repo list — single source of truth. */
export const OPEN_SOURCE_REPOS: readonly OpenSourceRepo[] = [
  { name: 'playwright-sdet-regression-suite', proves: 'Release-style QA evidence, SDET-grade' },
  { name: 'sage-kernel', proves: 'Proof-first engineering OS, 140 MCP tools' },
  { name: 'Nexural_Automation', proves: 'Local-first automation lab, MCP server' },
  { name: 'nexural-automation-starter', proves: 'Paper-money-safe webhook automation starter' },
  { name: 'graphify', proves: 'Any input → knowledge graph' },
] as const

/** Section 01 — the 30-second scan: what I build, how engagements run, where the proof lives. */
export function ScanSection() {
  return (
    <SectionShell
      id="scan"
      num="01"
      kicker="THE 30-SECOND SCAN"
      annotation="WHAT I BUILD, WHAT IT RUNS ON, WHERE THE PROOF IS"
      ghost="01"
    >
      <Reveal>
        <div className="ag-grid ag-scan-grid">
          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">AUTOMATION I SHIP</h3>
            <ul className="ag-scan-list">
              {AUTOMATION_I_SHIP.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">HOW ENGAGEMENTS WORK</h3>
            <ul className="ag-scan-list">
              {HOW_ENGAGEMENTS_WORK.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="ag-cell ag-scan-cell">
            <h3 className="ag-scan-label">OPEN SOURCE — INSPECT THE CODE</h3>
            <ul className="ag-scan-list">
              {OPEN_SOURCE_REPOS.map((repo) => (
                <li key={repo.name}>
                  <a
                    href={`https://github.com/JasonTeixeira/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ag-scan-proof-link ag-scan-repo-link"
                  >
                    <span className="ag-scan-repo-name">{repo.name}</span>
                    <span className="ag-scan-repo-proves">{repo.proves} →</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="ag-scan-dual-note">
              Contract-first. Also open to senior full-time roles — resume above.
            </p>
            <div className="ag-scan-quicklinks">
              {/* TODO(assembly): point at the real resume PDF once it lands in /public */}
              <a href="/resume.pdf" target="_blank" rel="noopener">↓ RESUME.PDF</a>
              <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
                ↗ GITHUB
              </a>
              <a href="mailto:sage@sageideas.dev">✉ EMAIL</a>
            </div>
          </article>
        </div>
      </Reveal>

      {/* Full-width toolbox band — five taxonomies as a spec sheet, no dead columns */}
      <Reveal delay={120}>
        <div className="ag-scan-toolband-wrap">
          <p className="ag-scan-label ag-scan-toolband-label">THE TOOLBOX — ALL IN ACTIVE USE</p>
          <div className="ag-grid ag-scan-toolband">
            {TOOL_GROUPS.map((group) => (
              <div key={group.label} className="ag-cell ag-scan-toolgroup">
                <p className="ag-scan-toolgroup-label">{group.label}</p>
                <div className="ag-scan-chips">
                  {group.tools.map((tool) => (
                    <span key={tool} className="ag-chip ag-chip--sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  )
}
