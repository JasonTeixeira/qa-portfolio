// Free templates surfaced under /lab/templates
// Each template renders as a page with copy/download actions and inline preview.

export type Template = {
  slug: string
  name: string
  tagline: string
  description: string
  filename: string
  format: 'markdown' | 'json' | 'yaml'
  category: 'prompts' | 'evals' | 'specs' | 'tools' | 'procurement'
  audience: string
  body: string
}

const promptLibraryBody = `# Sage Ideas Prompt Library Starter

A versioned prompt library with metadata, evals, and rollback. Drop this into any repo as the starting point for production prompt management.

## File layout

\`\`\`
prompts/
  README.md                     # this file
  registry.json                 # source of truth: id → current version
  versions/
    customer-classify-v1.md     # frozen
    customer-classify-v2.md     # active
    customer-classify-v3.md     # candidate
  evals/
    customer-classify.jsonl     # 50+ labeled examples
    runs/                       # output of past eval runs
\`\`\`

## Per-prompt frontmatter

Every prompt file starts with this header:

\`\`\`yaml
---
id: customer-classify
version: 2
status: active             # candidate | active | retired
owner: sage@sageideas.dev
model: gpt-4.1-mini
temperature: 0.2
max_tokens: 256
last_eval_score: 0.94
created: 2026-04-12
---
\`\`\`

## Promotion rules

A new version cannot become \`active\` unless:

1. It scores ≥ current active version on the eval set
2. Latency p95 is within 1.2× of the active version
3. Cost per call is within 1.5× of the active version
4. A human reviewed at least 5 random outputs

## Registry format

\`\`\`json
{
  "prompts": {
    "customer-classify": {
      "active": 2,
      "candidate": 3
    },
    "lead-qualification": {
      "active": 1
    }
  },
  "updated": "2026-05-04T17:00:00Z"
}
\`\`\`

## Why this works

Most teams treat prompts as code in name only. This structure forces three things:
versioning, evaluation, and promotion criteria. Steal it.
`

const evalHarnessBody = `# Eval Harness Starter (TypeScript)

Minimal eval harness for any LLM workflow. No frameworks. Run with \`npx tsx evals/run.ts <suite>\`.

## File layout

\`\`\`
evals/
  run.ts                  # entrypoint
  cases/
    customer-classify.jsonl
    lead-quality.jsonl
  metrics.ts              # custom metric functions
  reports/                # auto-written
\`\`\`

## A case file (\`cases/customer-classify.jsonl\`)

One JSON object per line:

\`\`\`json
{"id": "001", "input": "I want to cancel my subscription", "expected": "churn-risk", "tags": ["explicit"]}
{"id": "002", "input": "Can you help me upgrade?", "expected": "expansion", "tags": ["positive"]}
\`\`\`

## The runner (\`run.ts\`)

\`\`\`typescript
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

type Case = { id: string; input: string; expected: string; tags?: string[] }

async function loadCases(suite: string): Promise<Case[]> {
  const text = await readFile(join('evals/cases', \`\${suite}.jsonl\`), 'utf8')
  return text.trim().split('\\n').map((line) => JSON.parse(line))
}

async function runOne(input: string): Promise<{ output: string; latencyMs: number; costUsd: number }> {
  const start = Date.now()
  // TODO: call your prompt here
  const output = await yourLLMCall(input)
  return { output, latencyMs: Date.now() - start, costUsd: estimateCost(input, output) }
}

async function main() {
  const suite = process.argv[2]
  if (!suite) throw new Error('Usage: tsx evals/run.ts <suite>')

  const cases = await loadCases(suite)
  const results = []

  for (const c of cases) {
    const r = await runOne(c.input)
    const correct = r.output.trim() === c.expected
    results.push({ ...c, ...r, correct })
    console.log(\`\${correct ? '✓' : '✗'} \${c.id} — \${r.latencyMs}ms\`)
  }

  const score = results.filter((r) => r.correct).length / results.length
  const p95 = pct(results.map((r) => r.latencyMs), 95)
  const totalCost = results.reduce((s, r) => s + r.costUsd, 0)

  await mkdir('evals/reports', { recursive: true })
  const report = {
    suite,
    timestamp: new Date().toISOString(),
    score,
    p95LatencyMs: p95,
    totalCostUsd: totalCost,
    n: results.length,
    failures: results.filter((r) => !r.correct).map((r) => ({ id: r.id, expected: r.expected, output: r.output })),
  }
  await writeFile(join('evals/reports', \`\${suite}-\${Date.now()}.json\`), JSON.stringify(report, null, 2))

  console.log(\`\\nScore: \${(score * 100).toFixed(1)}%  ·  p95: \${p95}ms  ·  cost: $\${totalCost.toFixed(3)}\`)
}

function pct(arr: number[], p: number) {
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.floor((sorted.length - 1) * (p / 100))]
}

main().catch((e) => { console.error(e); process.exit(1) })
\`\`\`

## Why this works

Most teams skip evals because the harness feels like a project. This is 80 lines of boilerplate
you can drop in today and improve later. Score, latency, cost — three numbers that catch most
regressions.
`

const agentSpecBody = `# Agent Spec — Template

Use this template for every agent before you write a single line of code. If you cannot fill
out the "Failure modes" section, you are not ready to build it.

---

## 1. Name & purpose

**Agent name:** [e.g. customer-onboarding-bot]

**One-sentence purpose:** [What is this agent's job? If you cannot finish this sentence in 15
words, the scope is wrong.]

## 2. Trigger

How does this agent run?

- [ ] User-initiated (chat, button click)
- [ ] Event-driven (webhook, queue message)
- [ ] Schedule (cron)
- [ ] Other: ___

## 3. Inputs

| Field | Source | Format | Required |
|-------|--------|--------|----------|
| ... | ... | ... | ... |

## 4. Outputs

| Field | Destination | Format | Notes |
|-------|-------------|--------|-------|
| ... | ... | ... | ... |

## 5. Tools available

| Tool | Purpose | Side effect? |
|------|---------|--------------|
| ... | ... | ... |

## 6. Decision authority

What can this agent do **without** human approval?

- [ ] Read internal data
- [ ] Read external data
- [ ] Send messages to internal users (Slack, email)
- [ ] Send messages to customers
- [ ] Modify internal records
- [ ] Modify external records (CRM, billing, etc.)
- [ ] Spend money (API calls that cost > $X, payments)

What requires human approval?

- ...

## 7. Success metric

A single number you will watch on a dashboard. If you cannot pick one, you are not ready.

## 8. Failure modes

List at least 5 ways this agent will fail in production. For each, name what catches it.

| Failure | Detection | Mitigation |
|---------|-----------|------------|
| Hallucinated tool args | Schema validation | Reject and retry once |
| Looped tool calls | Max-step limit | Abort, log, page on-call |
| Cost spike | Per-call budget cap | Auto-pause and alert |
| ... | ... | ... |
| ... | ... | ... |

## 9. Eval set

- Number of test cases: ___
- Where are they stored: ___
- Pass criteria: ___

## 10. Rollout plan

- Internal-only window: ___ days
- Initial customer rollout: ___ % traffic
- Promotion criteria: ___
- Kill switch: ___

## 11. Owner & on-call

Who pages when this breaks at 3am? **Name a person.**
`

const roiTemplateBody = `# ROI Calculator Template

A drop-in spreadsheet model for estimating ROI on any AI / automation initiative.
Adapt the inputs, keep the framing.

## Sheet 1 — Inputs

| Cell | Label | Example | Notes |
|------|-------|---------|-------|
| B2 | Process volume / month | 1000 | Tickets, leads, calls, etc. |
| B3 | Avg time per unit (min) | 12 | Manual handle time |
| B4 | Loaded labor cost / hr | 45 | Fully loaded, not just salary |
| B5 | Automation rate (target) | 60% | What % the agent fully handles |
| B6 | Per-unit AI cost | 0.40 | Estimate inference + infra |
| B7 | Build cost (one-time) | 12000 | Including evals + rollout |
| B8 | Monthly retainer | 1500 | Maintenance + monitoring |

## Sheet 2 — Calculations

| Cell | Formula |
|------|---------|
| C2 | =B2*B3/60*B4    | Baseline monthly cost |
| C3 | =B2*B5          | Automated units |
| C4 | =(B2-C3)*B3/60*B4 | Remaining labor cost |
| C5 | =C3*B6          | AI cost |
| C6 | =C4+C5+B8       | Post-AI total monthly cost |
| C7 | =C2-C6          | Monthly savings |
| C8 | =C7*12          | Annual savings |
| C9 | =B7/C7          | Payback period (months) |

## Sheet 3 — Sensitivity

Build a table that varies automation rate from 30% to 80% and shows resulting payback.
This is the conversation people actually want to have.

## Why this matters

Most ROI decks lie by omission — they show the optimistic case. This template forces three
honest numbers: build cost, ongoing cost, and payback period. If payback is more than 12
months, you are buying capability, not savings. Say so out loud.
`

const rfpBody = `# AI Vendor RFP — Template

Use this when you are evaluating an AI vendor (platform, agent, model API, or consultancy).
Send this to 3-5 vendors. Compare answers side by side.

---

## Section 1 — Use case

We are evaluating vendors to help us with **[describe in one sentence]**.

Specifically, we want to:

1. ...
2. ...
3. ...

Our success metric for this initiative is: **[single number]**.

Our timeline: **[specific date]**.

## Section 2 — Capability questions

For each, please answer with concrete examples or "not applicable."

1. **Architecture.** Describe how your system handles our use case end to end.
2. **Data handling.** Where does our data live, who sees it, when is it deleted?
3. **Customization.** Can we bring our own prompts / models / tools? How?
4. **Evals.** How do you evaluate output quality? Show us a real eval report.
5. **Observability.** What can we monitor in real time? Show us a dashboard.
6. **Rollback.** What happens when a deployment goes bad? How fast?

## Section 3 — Cost & contract

1. Pricing model — list price, volume tiers, what triggers each tier
2. Contract length — minimum commitment, termination notice
3. Hidden costs — onboarding, premium support, additional environments
4. Price escalation — what happens at renewal, cap on increases
5. Free trial / pilot terms

## Section 4 — Security & compliance

1. SOC 2 Type 2 report (current)
2. Data processing agreement
3. Subprocessors and where data is stored
4. Penetration test results (most recent)
5. Incident response time SLA

## Section 5 — Reference customers

Provide 3 customers we can talk to who have your product running in production for at least 6 months. We will reach out to all of them.

## Section 6 — Timeline

| Date | Milestone |
|------|-----------|
| [date] | RFP responses due |
| [date] | Demo with shortlisted vendors |
| [date] | Pilot starts with finalist |
| [date] | Decision |

---

## How we score

| Criterion | Weight |
|-----------|--------|
| Capability fit | 30% |
| Total cost over 24 months | 20% |
| Security posture | 20% |
| Reference quality | 15% |
| Speed to value | 15% |

## Why this matters

Most AI vendor evaluations get hijacked by the loudest demo. This RFP forces apples-to-apples
on the things that actually matter: data, cost, security, and proof. If a vendor will not
answer these questions, that is your answer.
`

export const templates: Template[] = [
  {
    slug: 'prompt-library-starter',
    name: 'Prompt Library Starter',
    tagline: 'A versioned prompt library with evals and rollback rules.',
    description:
      'Drop-in repo structure for managing prompts as real code: registry, versions, frontmatter, promotion criteria. Stops the "which prompt is in production?" question.',
    filename: 'prompt-library/README.md',
    format: 'markdown',
    category: 'prompts',
    audience: 'Engineering teams running 5+ prompts in production',
    body: promptLibraryBody,
  },
  {
    slug: 'eval-harness-starter',
    name: 'Eval Harness Starter (TypeScript)',
    tagline: 'Minimal eval runner. 80 lines. No frameworks.',
    description:
      'TypeScript eval harness you can drop into any project today. Reads JSONL test cases, runs them, writes a JSON report with score, p95 latency, and cost.',
    filename: 'evals/run.ts',
    format: 'markdown',
    category: 'evals',
    audience: 'Any team shipping LLM workflows',
    body: evalHarnessBody,
  },
  {
    slug: 'agent-spec-template',
    name: 'Agent Spec — Template',
    tagline: 'If you cannot fill in failure modes, you are not ready to build it.',
    description:
      'A specification template every agent should pass through before code. Covers triggers, decision authority, failure modes, eval sets, rollout, and on-call ownership.',
    filename: 'agent-spec.md',
    format: 'markdown',
    category: 'specs',
    audience: 'PMs and tech leads scoping new agents',
    body: agentSpecBody,
  },
  {
    slug: 'roi-calculator-template',
    name: 'ROI Calculator Template',
    tagline: 'Forces three honest numbers: build cost, ongoing cost, payback.',
    description:
      'Spreadsheet model for any AI initiative. Inputs, calculations, sensitivity table. Built to expose the optimistic-case lie that kills most AI ROI decks.',
    filename: 'roi-calculator.md',
    format: 'markdown',
    category: 'tools',
    audience: 'Finance and PMs preparing AI investment cases',
    body: roiTemplateBody,
  },
  {
    slug: 'ai-vendor-rfp',
    name: 'AI Vendor RFP — Template',
    tagline: 'Apples-to-apples comparison across vendors. No more demo hypnosis.',
    description:
      'Send this to 3-5 vendors. Forces concrete answers on architecture, data handling, evals, observability, security, and references. Includes a scoring rubric.',
    filename: 'ai-vendor-rfp.md',
    format: 'markdown',
    category: 'procurement',
    audience: 'Procurement, IT, and platform leaders',
    body: rfpBody,
  },
]

export const categoryLabels: Record<Template['category'], string> = {
  prompts: 'Prompts',
  evals: 'Evals',
  specs: 'Specs',
  tools: 'Tools',
  procurement: 'Procurement',
}
