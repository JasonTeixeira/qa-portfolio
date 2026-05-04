// Sage Ideas Studio — Extended Catalog (Phase 9)
//
// AI-native services, automation pipelines, customer-facing AI products,
// productized retainers, diagnostic on-ramps, and the "Done For You" bundle.
//
// All entries are inquiry-first: CTA routes to /contact?engagement=<slug>.
// Stripe checkout is added per-service once pricing is validated against
// 2-3 real engagements. Until then, prices are honest "from $X" floors.
//
// Shape matches the existing `Tier` type so /services/[slug] renders these
// for free with the same component used by Audit, Ship, etc.

import type { Tier } from './tiers'
import { phase13Offers } from './phase13-offers'

export type ExtendedCategory =
  | 'ai-flagship'
  | 'ai-services'
  | 'automation-pipelines'
  | 'ai-products'
  | 'retainers'
  | 'diagnostics'
  | 'bundle'
  | 'compliance'
  | 'growth'
  | 'fractional'

export type ExtendedTier = Tier & {
  category: ExtendedCategory
  /** Tools / stack signals shown as chips on detail pages. */
  stackChips?: string[]
}

const inquiryHref = (slug: string) => `/contact?engagement=${slug}`

// ─────────────────────────────────────────────────────────────────────────
// AI-NATIVE SERVICES
// ─────────────────────────────────────────────────────────────────────────

const aiReliabilityAudit: ExtendedTier = {
  slug: 'ai-reliability-audit',
  name: 'AI Reliability Audit',
  shortName: 'AI Reliability Audit',
  category: 'ai-services',
  tagline: 'Find out if your AI feature actually works — in two weeks.',
  description:
    'You shipped an AI feature and now you have no idea if it works in production. Two weeks: build evals, measure hallucination rate, latency, cost-per-request, and ship a regression suite that fails CI when quality drops. You leave knowing exactly where the model is wrong, how often, and how much it costs you.',
  price: 'from $4,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-reliability-audit'),
  capability: 'automation',
  mode: 'audit',
  stackChips: ['LLM evals', 'OpenAI', 'Anthropic', 'LangSmith', 'Braintrust', 'CI gates'],
  outcomes: [
    'Hallucination rate measured on a real dataset',
    'Latency + cost-per-request profile across providers',
    'Regression test suite that runs in CI',
    'Prioritized fix list ranked by impact and effort',
    'Dashboards your team can read every Monday',
  ],
  deliverables: [
    'Eval dataset (50–200 cases) sourced from your production logs or hand-curated golden set',
    'Eval runner wired into CI — fails PRs that drop quality below threshold',
    'Hallucination + accuracy + latency + cost dashboards',
    'Top 10 prompt / retrieval / model fixes with measured before/after impact',
    'Loom walkthrough + 60-minute review call',
    '14 days of post-engagement Slack support',
  ],
  notIncluded: [
    'Model fine-tuning (separate engagement)',
    'Building net-new AI features (use Internal AI Copilot or RAG Engineering)',
    'Annotation labor at scale (we set up the loop; ongoing labeling is on you)',
  ],
  faq: [
    {
      q: 'What if we have no eval dataset?',
      a: 'We build one with you. Two days of source-mining production logs and curating a golden set is the first phase of every audit.',
    },
    {
      q: 'Which models do you cover?',
      a: 'OpenAI, Anthropic, Google, open-weights via vLLM/Together/Replicate. We test cost-vs-quality across at least 3 providers as part of the audit.',
    },
    {
      q: 'Will you fix the issues you find?',
      a: 'The audit ends with a ranked fix list. You can hire us to ship the fixes (RAG Engineering, Prompt & Eval Library Setup, or AI Quality Retainer) or take it in-house — your call.',
    },
    {
      q: 'How is this different from a regular code audit?',
      a: 'A code audit finds bugs in deterministic systems. This finds quality drift in non-deterministic systems. Different methodology, different deliverable.',
    },
  ],
  phases: [
    {
      label: 'Day 1–3',
      title: 'Eval design',
      description:
        'Mine production logs (or build a golden set), define quality dimensions, agree on thresholds. We finalize the eval rubric before any code.',
      artifacts: ['Eval rubric', 'Golden dataset (50–200 cases)', 'Threshold spec'],
    },
    {
      label: 'Day 4–7',
      title: 'Measurement',
      description:
        'Run evals across your current setup + 2–3 alternative model/prompt configurations. Profile latency, cost, accuracy, hallucination rate.',
      artifacts: ['Eval results spreadsheet', 'Cost/latency profile', 'Provider comparison'],
    },
    {
      label: 'Day 8–11',
      title: 'CI integration + dashboards',
      description:
        'Wire the eval runner into GitHub Actions / your CI. Stand up dashboards (Grafana / Braintrust / custom) so the team sees regressions as they happen.',
      artifacts: ['CI workflow', 'Dashboards', 'Runbook for triaging eval failures'],
    },
    {
      label: 'Day 12–14',
      title: 'Findings + handoff',
      description:
        'Final report, Loom walkthrough, 60-minute review call, ranked fix list with effort estimates. 14 days of Slack support follow.',
      artifacts: ['Findings report', 'Loom walkthrough', 'Ranked fix list', 'Slack channel'],
    },
  ],
  resultMetrics: [
    { value: '2 weeks', label: 'Median delivery', context: 'every audit' },
    { value: '50–200', label: 'Eval cases shipped', context: 'production-grounded' },
    { value: '3+', label: 'Providers compared', context: 'on cost vs quality' },
  ],
  addOns: [
    {
      name: 'Multilingual eval',
      description: 'Add 2–3 additional languages to the eval suite with native-speaker review.',
      price: '+$1,500',
    },
    {
      name: 'Adversarial testing',
      description: 'Red-team prompts + jailbreak resistance + prompt-injection coverage.',
      price: '+$1,200',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Eval-driven audit of an AI feature in production: hallucination rate, latency, cost, regression suite, and CI gate.',
}

const ragSystemsEngineering: ExtendedTier = {
  slug: 'rag-engineering',
  name: 'RAG Systems Engineering',
  shortName: 'RAG Engineering',
  category: 'ai-services',
  tagline: 'Productionize the prototype your team has been demoing for six months.',
  description:
    'Most RAG systems are demos pretending to be products. This engagement makes them real: chunking strategy that respects the corpus, retrieval evals you can actually trust, citation accuracy you can defend, and observability so you know when it breaks. Fixed scope, fixed price, deployable.',
  price: 'from $9,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4–6 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('rag-engineering'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Pinecone', 'pgvector', 'OpenAI', 'Anthropic', 'LangChain', 'LlamaIndex', 'Cohere'],
  outcomes: [
    'Chunking + embedding pipeline tuned to your corpus',
    'Retrieval evals running on every change',
    'Citation accuracy measured and reported',
    'Cost ceilings, rate limits, and fallback paths',
    'Deployed to production with monitoring',
  ],
  deliverables: [
    'Ingestion pipeline (with re-indexing strategy)',
    'Retrieval eval harness — recall@k, MRR, faithfulness, citation accuracy',
    'Reranker + hybrid search where it earns its cost',
    'Observability: query logs, eval drift, cost per query, p95 latency',
    'Production deployment to your cloud (or ours)',
    '4 weeks of post-launch tuning included',
  ],
  notIncluded: [
    'Building the front-end UI (separate scope)',
    'Hosting your corpus indefinitely (we deploy to your infra)',
    'Custom model training',
  ],
  faq: [
    {
      q: 'How big a corpus can you handle?',
      a: 'We have shipped systems from 10k to 10M chunks. Above that, we scope a longer engagement with sharding strategy.',
    },
    {
      q: 'Which vector DB do you use?',
      a: 'We start neutral. After looking at your corpus + query patterns + cost ceiling, we recommend Pinecone, pgvector, Weaviate, or Turbopuffer with a written rationale.',
    },
    {
      q: 'Do you handle sources beyond text?',
      a: 'Text + structured data + tables yes. Images and audio require a longer engagement and are scoped separately.',
    },
    {
      q: 'What does success look like?',
      a: 'A measurable retrieval quality target (e.g., recall@10 ≥ 0.85), agreed before kickoff, and a CI gate that prevents regressions.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Corpus + query analysis',
      description:
        'Sample your corpus, profile query patterns, agree on success metrics. Pick vector DB + embedding model + reranker stack.',
      artifacts: ['Corpus profile', 'Query taxonomy', 'Stack recommendation memo'],
    },
    {
      label: 'Week 2–3',
      title: 'Pipeline + evals',
      description:
        'Build ingestion pipeline, chunking strategy, embedding store. Stand up retrieval eval harness against a golden set.',
      artifacts: ['Ingestion pipeline', 'Eval harness', 'Initial benchmarks'],
    },
    {
      label: 'Week 4',
      title: 'Reranking + hybrid + cost',
      description:
        'Add a reranker only where it pays for itself. Tune hybrid (BM25 + vector). Profile cost per query and add ceilings.',
      artifacts: ['Reranker integration', 'Cost profile', 'Rate-limit + fallback config'],
    },
    {
      label: 'Week 5–6',
      title: 'Production + observability',
      description:
        'Deploy to your infra, wire observability, document failure modes. Hand off with runbook and 4 weeks of tuning.',
      artifacts: ['Production deployment', 'Observability stack', 'Runbook', 'Tuning sprint plan'],
    },
  ],
  resultMetrics: [
    { value: '4–6 wk', label: 'Production timeline' },
    { value: '≥ 0.85', label: 'Typical recall@10', context: 'on tuned corpora' },
    { value: '< $0.01', label: 'Median cost / query', context: 'after optimization' },
  ],
  addOns: [
    {
      name: 'Multi-tenant indexing',
      description: 'Per-customer index isolation with row-level security and quota enforcement.',
      price: '+$3,500',
    },
    {
      name: 'Self-hosted embeddings',
      description: 'Move embeddings off OpenAI to a self-hosted model for cost or compliance.',
      price: '+$2,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'End-to-end RAG system engineering: ingestion, retrieval evals, reranking, observability, deployment.',
}

const agentOps: ExtendedTier = {
  slug: 'agent-ops',
  name: 'Agent Ops',
  shortName: 'Agent Ops',
  category: 'ai-services',
  tagline: 'Keep your agent from burning $400 in a loop overnight.',
  description:
    'For teams running multi-step agents in production. We build the trace inspector, failure replay, guardrails, budget caps, and human-in-loop escalation that keep agents from going off the rails. Two weeks to instrumented; four weeks to defensible.',
  price: 'from $7,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3–4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('agent-ops'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['LangSmith', 'Braintrust', 'OpenTelemetry', 'Temporal', 'Inngest'],
  outcomes: [
    'Every agent run traced, replayable, and searchable',
    'Per-run + per-day budget caps that actually fire',
    'Guardrails for tool use, output format, recursion depth',
    'Human-in-loop escalation with a real UI',
    'On-call alerting when agents misbehave',
  ],
  deliverables: [
    'Tracing layer (OpenTelemetry-based, vendor-portable)',
    'Replay tool — re-run any historical agent step with new code',
    'Budget caps: per-run, per-user, per-day',
    'Guardrails: max steps, allowed tools, output schema enforcement',
    'Escalation UI + Slack/PagerDuty hooks',
    'Runbook for the 5 most likely failure modes',
  ],
  notIncluded: [
    'Building net-new agents (we instrument what exists)',
    'LLM provider migration',
  ],
  faq: [
    {
      q: 'We run agents on LangGraph / CrewAI / our own framework — does this work?',
      a: 'Yes. The instrumentation is OpenTelemetry-based, so it sits underneath whatever orchestration framework you use.',
    },
    {
      q: 'What does "human-in-loop escalation" mean concretely?',
      a: 'A queue UI where flagged agent runs land for review, an approve/reject/edit interface, and a feedback loop that updates the eval set.',
    },
    {
      q: 'What about prompt injection?',
      a: 'Output schema enforcement + tool allowlists + escape-hatch prompts cover the common cases. Adversarial coverage is an add-on.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Trace + replay',
      description:
        'OpenTelemetry instrumentation, trace storage, replay tool. Every step searchable by user, time, tool, error.',
      artifacts: ['Tracing layer', 'Replay UI', 'Search index'],
    },
    {
      label: 'Week 2',
      title: 'Guardrails + budgets',
      description:
        'Per-run / per-day budget caps. Tool allowlists. Output schema enforcement. Recursion / step limits.',
      artifacts: ['Budget service', 'Guardrail middleware', 'Schema validators'],
    },
    {
      label: 'Week 3',
      title: 'Escalation + alerting',
      description:
        'Human-in-loop queue UI, Slack/PagerDuty integration, on-call rotation hooks, runbooks for common failure modes.',
      artifacts: ['Escalation UI', 'Alerting config', 'Runbooks'],
    },
    {
      label: 'Week 4',
      title: 'Hardening + handoff',
      description:
        'Load testing, failure injection, adversarial replay. Final handoff with on-call training session.',
      artifacts: ['Load test report', 'Chaos drill report', 'On-call handoff'],
    },
  ],
  resultMetrics: [
    { value: '100%', label: 'Run trace coverage' },
    { value: '< 1 min', label: 'Time to replay any run' },
    { value: '0', label: 'Runaway $$ incidents post-install', context: 'across deployments' },
  ],
  addOns: [
    {
      name: 'Adversarial coverage',
      description: 'Prompt-injection + jailbreak resistance test suite + monitoring.',
      price: '+$2,500',
    },
    {
      name: 'Multi-tenant isolation',
      description: 'Per-customer trace scoping + quota enforcement + redaction.',
      price: '+$3,000',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Production observability, guardrails, and budget controls for multi-step LLM agents.',
}

const internalAiCopilot: ExtendedTier = {
  slug: 'internal-ai-copilot',
  name: 'Internal AI Copilot',
  shortName: 'AI Copilot',
  category: 'ai-services',
  tagline: 'A Slack/Teams bot trained on your docs that actually answers questions.',
  description:
    'Done-for-you internal AI assistant. Lives in Slack or Teams, trained on your Notion/Google Drive/Confluence/codebase, cites sources, and gets better every week from feedback. Four weeks to ship, 30 days of tuning included.',
  price: 'from $9,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('internal-ai-copilot'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Slack', 'Microsoft Teams', 'Notion', 'Google Drive', 'Confluence', 'GitHub'],
  outcomes: [
    'A working bot in your team chat by week 2',
    'Citations on every answer (no opaque hallucinations)',
    'Feedback buttons that improve answers over time',
    'Admin dashboard: top questions, gaps, accuracy trends',
    'Replaces the "where is X documented?" Slack noise',
  ],
  deliverables: [
    'Slack or Teams app (your choice)',
    'Connectors to your knowledge sources (Notion + Google Drive + Confluence + GitHub)',
    'Citation-first answer format (every claim links to source)',
    'Thumbs-up/down feedback loop wired to evals',
    'Admin dashboard: usage, top queries, gap report',
    'Auth + per-user permissions (only see what you can read)',
    '30 days of post-launch tuning',
  ],
  notIncluded: [
    'Customer-facing chat (see Support Deflection Layer)',
    'Building knowledge from scratch (we connect what exists)',
  ],
  faq: [
    {
      q: 'How does it respect document permissions?',
      a: 'On every query we re-fetch the user\'s read scope from the source system. If you can\'t open the doc in Notion, the bot won\'t cite it to you.',
    },
    {
      q: 'Where does the data live?',
      a: 'Your cloud — typically your existing AWS/GCP account. We deploy via Terraform and hand off the keys.',
    },
    {
      q: 'Which LLM provider?',
      a: 'You pick: OpenAI, Anthropic, or self-hosted. We benchmark all three on your corpus before recommending.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Connect + ingest',
      description:
        'Hook up Notion/Drive/Confluence/GitHub. Build ingestion + permission-aware indexing. First eval pass.',
      artifacts: ['Connectors', 'Permission scoping', 'Initial index'],
    },
    {
      label: 'Week 2',
      title: 'Bot + citations',
      description:
        'Slack/Teams app, citation-first answer format, feedback buttons. Internal beta with your team.',
      artifacts: ['Bot deployed', 'Beta access for ~10 users'],
    },
    {
      label: 'Week 3',
      title: 'Admin + analytics',
      description:
        'Admin dashboard, gap report, top-query analytics. Tune retrieval based on real beta queries.',
      artifacts: ['Dashboard', 'Tuning round 1'],
    },
    {
      label: 'Week 4',
      title: 'Launch + tuning',
      description:
        'Full team rollout, training session, 30 days of tuning + content gap fills.',
      artifacts: ['Production launch', 'Training Loom', '30-day tuning plan'],
    },
  ],
  resultMetrics: [
    { value: '4 weeks', label: 'Time to live in Slack' },
    { value: '60%+', label: 'Typical "answered" rate', context: 'on internal queries' },
    { value: '< 3s', label: 'Median response latency' },
  ],
  addOns: [
    {
      name: 'Voice mode',
      description: 'Add voice queries via Slack huddles / Teams meetings.',
      price: '+$2,500',
    },
    {
      name: 'Custom integrations',
      description: 'Each beyond the standard 4 connectors (Linear, Jira, Salesforce, Zendesk, etc).',
      price: '+$1,500 ea',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Internal Slack/Teams AI assistant trained on your team\'s knowledge sources, with citations.',
}

const promptEvalLibrary: ExtendedTier = {
  slug: 'prompt-eval-library',
  name: 'Prompt & Eval Library Setup',
  shortName: 'Prompt Library',
  category: 'ai-services',
  tagline: 'Stop versioning prompts in Notion. Treat them like code.',
  description:
    'A one-time install: your prompts versioned in git, evals running in CI, and an A/B harness so prompt changes ship like any other deploy. Two weeks. Hand-off to your team after.',
  price: 'from $3,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('prompt-eval-library'),
  capability: 'automation',
  mode: 'sprint',
  stackChips: ['Promptfoo', 'Braintrust', 'LangSmith', 'GitHub Actions'],
  outcomes: [
    'Prompts in git with diff history, not in a Notion doc',
    'CI evals on every prompt PR',
    'A/B harness for safe prompt rollouts',
    'Documentation pattern your team will actually use',
  ],
  deliverables: [
    'Prompt repo structure + naming conventions',
    'Eval suite — at least 3 quality dimensions per prompt',
    'GitHub Actions workflow that runs evals on PR',
    'A/B rollout helper (e.g., Statsig / LaunchDarkly / hand-rolled)',
    'Migration of up to 20 existing prompts',
    'Team training session (60 min Loom + live Q&A)',
  ],
  notIncluded: [
    'Authoring brand-new prompts (we move what you have)',
    'Long-running eval maintenance (see AI Quality Retainer)',
  ],
  faq: [
    {
      q: 'We use LangChain prompts — does that work?',
      a: 'Yes. We support raw text, LangChain ChatPromptTemplate, and Anthropic message format out of the box.',
    },
    {
      q: 'What if a prompt change breaks evals?',
      a: 'CI fails the PR. The author sees a diff of which eval cases regressed and by how much.',
    },
  ],
  phases: [
    {
      label: 'Day 1–4',
      title: 'Repo + conventions',
      description:
        'Set up the prompt repo, naming conventions, frontmatter schema, version pinning approach.',
      artifacts: ['Prompt repo', 'CONTRIBUTING.md', 'Naming spec'],
    },
    {
      label: 'Day 5–8',
      title: 'Evals + CI',
      description:
        'Author baseline evals, wire into GitHub Actions, fail-on-regression thresholds.',
      artifacts: ['Eval suite', 'CI workflow', 'Threshold config'],
    },
    {
      label: 'Day 9–12',
      title: 'A/B + migration',
      description:
        'Stand up the A/B helper, migrate up to 20 existing prompts, run them through evals to get a baseline.',
      artifacts: ['A/B helper', 'Migrated prompts', 'Baseline eval report'],
    },
    {
      label: 'Day 13–14',
      title: 'Training + handoff',
      description:
        '60-minute training session, recorded Loom, written runbook for adding prompts/evals/tests.',
      artifacts: ['Training Loom', 'Runbook'],
    },
  ],
  resultMetrics: [
    { value: '2 weeks', label: 'Setup to handoff' },
    { value: '20', label: 'Prompts migrated', context: 'baseline' },
    { value: '3+', label: 'Eval dimensions per prompt' },
  ],
  addOns: [
    {
      name: 'Multi-language prompts',
      description: 'Versioned prompts with locale variants + per-locale eval suites.',
      price: '+$1,200',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Versioned prompts in git, eval suite in CI, A/B rollout harness, team training.',
}

// ─────────────────────────────────────────────────────────────────────────
// AUTOMATION PIPELINES
// ─────────────────────────────────────────────────────────────────────────

const opsAutomationSprint: ExtendedTier = {
  slug: 'ops-automation-sprint',
  name: 'Ops Automation Sprint',
  shortName: 'Ops Sprint',
  category: 'automation-pipelines',
  tagline: 'Five workflows shipped in one week. Boring, reliable, no no-code toys.',
  description:
    'A 1-week sprint that ships 5 production workflows. We audit your stack (Linear, Slack, Notion, GitHub, Stripe, HubSpot, Intercom — whatever you use), pick the 5 highest-friction handoffs, and build them with tools that won\'t break in 6 months.',
  price: '$4,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '1 week',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ops-automation-sprint'),
  capability: 'automation',
  mode: 'sprint',
  stackChips: ['n8n', 'Temporal', 'Inngest', 'Pipedream', 'GitHub Actions', 'AWS Lambda'],
  outcomes: [
    'Five concrete workflows ringing through your tools',
    'Failure alerting (you find out, not the customer)',
    'Idempotency + retries (so re-running is safe)',
    'Documentation a non-engineer can read',
  ],
  deliverables: [
    'Workflow audit (your full tool stack)',
    'Top 5 handoffs picked, scoped, prioritized',
    'Five workflows built and deployed',
    'Monitoring + alerting + retry policies',
    'Per-workflow runbook (1 page each)',
    'Loom walkthrough + 30-min handoff call',
  ],
  notIncluded: [
    'Maintenance (see Automation Retainer)',
    'Custom integrations to homegrown systems (case-by-case)',
  ],
  faq: [
    {
      q: 'Why not Zapier?',
      a: 'You can. We use n8n / Temporal / Inngest because they version-control, run reliably at volume, and don\'t silently swallow errors. If Zapier is right for a specific workflow we\'ll say so.',
    },
    {
      q: 'What if we don\'t know our top 5?',
      a: 'Day 1 is the audit. We\'ll show you what we found and you pick.',
    },
  ],
  phases: [
    {
      label: 'Day 1',
      title: 'Audit + pick',
      description:
        'Tool stack inventory, handoff mapping, friction interviews. We propose the top 5 candidates; you confirm.',
      artifacts: ['Stack inventory', 'Friction map', 'Top-5 spec'],
    },
    {
      label: 'Day 2–4',
      title: 'Build',
      description:
        'Build all 5 in parallel — tested, monitored, deployable. Daily preview environments.',
      artifacts: ['5 workflows in staging', 'Preview links'],
    },
    {
      label: 'Day 5',
      title: 'Ship + handoff',
      description:
        'Production deploy, monitoring + alerts wired, runbooks written, walkthrough recorded.',
      artifacts: ['5 production workflows', 'Runbooks', 'Loom walkthrough'],
    },
  ],
  resultMetrics: [
    { value: '5', label: 'Workflows shipped', context: 'in 1 week' },
    { value: '> 99%', label: 'Median success rate', context: 'across deployed workflows' },
    { value: '$0', label: 'Vendor lock-in cost', context: 'all open-source where possible' },
  ],
  addOns: [
    {
      name: 'Sixth workflow',
      description: 'Each additional workflow.',
      price: '+$1,000',
    },
    {
      name: 'Self-hosted infra setup',
      description: 'Stand up n8n / Temporal on your AWS account with backup + monitoring.',
      price: '+$1,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'A 1-week sprint that ships 5 production-grade ops automations across your tool stack.',
}

const incidentPostmortem: ExtendedTier = {
  slug: 'incident-postmortem-pipeline',
  name: 'Incident → Postmortem Pipeline',
  shortName: 'Incident Pipeline',
  category: 'automation-pipelines',
  tagline: 'Sentry alert → Slack thread → Notion postmortem → Linear actions. All automatic.',
  description:
    'Every eng team needs this and almost nobody builds it. We wire up the full chain: alert ingestion, on-call paging, Slack thread + war-room timer, postmortem template auto-populated with the timeline, and follow-up actions filed in Linear. Two weeks.',
  price: 'from $5,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('incident-postmortem-pipeline'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Sentry', 'Datadog', 'PagerDuty', 'Slack', 'Notion', 'Linear', 'GitHub'],
  outcomes: [
    'Alerts route correctly the first time',
    'Slack war-room auto-spun-up with the right people',
    'Postmortem doc pre-filled with timeline + suspects',
    'Action items land in Linear, not in someone\'s notes',
    'You start owning incidents like a real eng org',
  ],
  deliverables: [
    'Alert → on-call routing (PagerDuty / OpsGenie / Slack)',
    'Auto-created incident channel with topic + responders',
    'Timeline collector (every alert, deploy, comment timestamped)',
    'Postmortem template + auto-population script',
    'Action item sync — postmortem mentions become Linear tickets',
    'Weekly digest of open postmortem actions to leadership',
  ],
  notIncluded: [
    'On-call rotation hiring (you own the people; we own the pipes)',
  ],
  faq: [
    {
      q: 'We use OpsGenie / PagerDuty / Better Stack — does this work?',
      a: 'All three plus a few more. We\'ll integrate with whichever you have.',
    },
    {
      q: 'How blameless is the postmortem template?',
      a: 'The default template is blameless and weighted toward systemic fixes. We can tune the language to your team\'s culture.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Ingestion + war room',
      description:
        'Wire alerts → routing → war-room creation. Test against past incidents.',
      artifacts: ['Routing config', 'War-room bot', 'Replay against past incidents'],
    },
    {
      label: 'Week 2',
      title: 'Postmortem + actions',
      description:
        'Template, auto-population, Linear sync, leadership digest. Train the on-call rotation.',
      artifacts: ['Postmortem template', 'Sync service', 'Digest report', 'Training session'],
    },
  ],
  resultMetrics: [
    { value: '< 2 min', label: 'Alert → war-room', context: 'median' },
    { value: '100%', label: 'Postmortems with timeline', context: 'previously: ~30%' },
  ],
  addOns: [
    {
      name: 'Status page integration',
      description: 'Auto-post to your public status page with templated copy.',
      price: '+$1,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Automated pipeline from monitoring alerts through war-room, timeline collection, and postmortem actions.',
}

const releaseNotes: ExtendedTier = {
  slug: 'release-notes-automation',
  name: 'Release Notes Automation',
  shortName: 'Release Notes',
  category: 'automation-pipelines',
  tagline: 'PRs → categorized changelog → customer email — automatically.',
  description:
    'Stop writing release notes by hand. We build the pipeline: PR labels become categorized notes, the changelog publishes to your site, the digest goes out to customers via email. One week to ship.',
  price: '$3,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '1 week',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('release-notes-automation'),
  capability: 'automation',
  mode: 'sprint',
  stackChips: ['GitHub', 'Linear', 'Resend', 'Notion', 'Markdown'],
  outcomes: [
    'Customer-facing changelog page',
    'Email digest going to opted-in users',
    'Internal changelog for sales/CS',
    'PR labels turn into release-note entries with no extra work',
  ],
  deliverables: [
    'Label taxonomy ("feat", "fix", "perf", "infra", etc) + GitHub Action',
    'Changelog page on your site (or extends an existing /changelog)',
    'Customer email digest (Resend / Postmark / SendGrid)',
    'Internal Slack post for every release',
    'Edit-before-send approval step (so a human still owns tone)',
  ],
  notIncluded: [
    'Writing your release notes for you (we wire it up — your team writes)',
  ],
  faq: [
    {
      q: 'Can a human still edit before it goes out?',
      a: 'Yes — the default config has an approval step. Auto-publish for non-customer-facing changes; human-approved for customer-facing.',
    },
  ],
  phases: [
    {
      label: 'Day 1–2',
      title: 'Taxonomy + GitHub',
      description:
        'Label taxonomy, GitHub Action, draft preview to a private channel.',
      artifacts: ['Action workflow', 'Label spec'],
    },
    {
      label: 'Day 3–4',
      title: 'Changelog + email',
      description:
        'Changelog page, email digest with template, Slack post. Test on a recent release.',
      artifacts: ['Changelog page', 'Email template', 'Slack integration'],
    },
    {
      label: 'Day 5',
      title: 'Approval + handoff',
      description:
        'Approval flow, runbook, training session.',
      artifacts: ['Approval flow', 'Runbook'],
    },
  ],
  resultMetrics: [
    { value: '1 week', label: 'Setup to live' },
    { value: '~0 min', label: 'Manual time per release', context: 'after approval step' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: 'Automated pipeline from PR labels to customer-facing changelog and email digest.',
}

const feedbackRouter: ExtendedTier = {
  slug: 'customer-feedback-router',
  name: 'Customer Feedback Router',
  shortName: 'Feedback Router',
  category: 'automation-pipelines',
  tagline: 'Intercom + Zendesk + email → deduped, categorized Linear tickets with frequency counts.',
  description:
    'Replaces a part-time role. Customer feedback from every channel gets pulled in, deduped, categorized by an LLM, and turned into Linear tickets with frequency counts. PMs get a weekly digest. Three weeks to ship.',
  price: 'from $6,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('customer-feedback-router'),
  capability: 'automation',
  mode: 'build',
  stackChips: ['Intercom', 'Zendesk', 'Linear', 'OpenAI', 'pgvector', 'Notion'],
  outcomes: [
    'One pane of glass for customer feedback',
    'Dedup + clustering so the same complaint isn\'t 8 tickets',
    'Frequency-weighted ticket priority (not gut feel)',
    'PMs spend zero time grooming this manually',
  ],
  deliverables: [
    'Connectors to Intercom + Zendesk + email + Slack #feedback channels',
    'LLM categorization + dedup pipeline',
    'Linear sync — tickets with frequency, sample quotes, customer tier',
    'Weekly PM digest (Notion / email / Slack)',
    'Admin UI to merge/split clusters and re-train',
  ],
  notIncluded: [
    'Building your taxonomy from scratch (we co-design with you)',
  ],
  faq: [
    {
      q: 'How does dedup work?',
      a: 'Embeddings + a clustering threshold + a human-tunable merge UI. False merges are a feature, not a bug — you can split.',
    },
    {
      q: 'Doesn\'t the LLM hallucinate categories?',
      a: 'Categorization is constrained to your taxonomy (a closed set). New categories get flagged for human review before adoption.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Connect + ingest',
      description:
        'Wire connectors, set up storage, build initial taxonomy with you.',
      artifacts: ['Connectors', 'Taxonomy spec', 'Initial ingest'],
    },
    {
      label: 'Week 2',
      title: 'Categorize + dedup',
      description:
        'LLM categorization pipeline, embedding-based dedup, cluster review UI. Backfill 90 days of feedback.',
      artifacts: ['Categorization pipeline', 'Dedup service', 'Review UI'],
    },
    {
      label: 'Week 3',
      title: 'Linear + digest',
      description:
        'Linear sync, weekly digest, PM training. Two weeks of post-launch tuning included.',
      artifacts: ['Linear sync', 'Digest', 'Training Loom'],
    },
  ],
  resultMetrics: [
    { value: '3 weeks', label: 'Time to live' },
    { value: '60–80%', label: 'Typical dedup ratio', context: 'after first month' },
  ],
  addOns: [
    {
      name: 'Salesforce + HubSpot connectors',
      description: 'Pull feedback from CRM notes + call transcripts.',
      price: '+$2,000',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Customer feedback aggregation, dedup, categorization, and PM digest pipeline.',
}

const dataHygieneBot: ExtendedTier = {
  slug: 'data-hygiene-bot',
  name: 'Data Hygiene Bot',
  shortName: 'Data Hygiene',
  category: 'automation-pipelines',
  tagline: 'Find the broken data in Stripe, HubSpot, and Salesforce before your CFO does.',
  description:
    'A recurring set of audits that crawl your CRM, billing, and ops systems and ship a weekly "things that are wrong" report. Stale records, broken statuses, missing fields, mismatched IDs across systems. Two weeks to deploy.',
  price: 'from $4,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('data-hygiene-bot'),
  capability: 'automation',
  mode: 'sprint',
  stackChips: ['Stripe', 'HubSpot', 'Salesforce', 'Postgres', 'GitHub Actions'],
  outcomes: [
    'Weekly "things that are wrong" report in Slack',
    'Cross-system ID drift caught early (Stripe ↔ HubSpot ↔ Salesforce)',
    'Stale lead / dead deal / orphaned subscription cleanup',
    'Zero ongoing engineering cost to maintain',
  ],
  deliverables: [
    'At least 12 audits across your tool stack (we add to your priorities)',
    'Weekly Slack digest with click-through to fix UIs',
    'CSV exports for ops cleanup batches',
    'GitHub Actions schedule (no infra to host)',
    'Runbook for adding new audits',
  ],
  notIncluded: [
    'Doing the cleanup for you (we surface; your ops team fixes)',
  ],
  faq: [
    {
      q: 'Will it write to Stripe / HubSpot / Salesforce?',
      a: 'Read-only by default. Write actions are opt-in per audit and require approval.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Audit catalog',
      description:
        'Map your data flow, agree on the 12 audits, build them.',
      artifacts: ['Audit catalog', '12 audits in CI'],
    },
    {
      label: 'Week 2',
      title: 'Digest + handoff',
      description:
        'Weekly digest, CSV exports, runbook. Live training.',
      artifacts: ['Digest', 'CSV exports', 'Runbook'],
    },
  ],
  resultMetrics: [
    { value: '12+', label: 'Audits shipped' },
    { value: '$0/mo', label: 'Hosting cost', context: 'GitHub Actions' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: 'Recurring data-quality audits across CRM, billing, and ops systems with a weekly digest.',
}

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMER-FACING AI PRODUCTS
// ─────────────────────────────────────────────────────────────────────────

const docsAsProduct: ExtendedTier = {
  slug: 'docs-as-product',
  name: 'Docs-as-a-Product',
  shortName: 'Docs-as-Product',
  category: 'ai-products',
  tagline: 'Your docs as an AI search experience that knows what your users keep asking.',
  description:
    'AI search on your existing docs, an "ask anything" widget with citations, analytics on what users actually ask, and a gap report so the docs team knows what to write next. Three weeks. Drop-in to whatever site you have.',
  price: 'from $7,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('docs-as-product'),
  capability: 'product',
  mode: 'build',
  stackChips: ['Algolia', 'Inkeep', 'OpenAI', 'pgvector', 'Mintlify', 'Docusaurus'],
  outcomes: [
    'Search that answers, not just links',
    'Citations the user can verify',
    'Gap report: questions with no good answer',
    'Analytics: top queries, fail rate, deflection rate',
  ],
  deliverables: [
    'Ingest pipeline (Mintlify / Docusaurus / Notion / Markdown / your CMS)',
    'AI search component (drop-in JS or React)',
    '"Ask anything" widget with citations',
    'Analytics dashboard',
    'Weekly gap report',
  ],
  notIncluded: [
    'Writing the docs (we make existing docs findable)',
  ],
  faq: [
    {
      q: 'What if our docs are bad?',
      a: 'You\'ll know immediately — the gap report and fail rate make it visible. We\'ll flag the worst pages and recommend rewrites.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Ingest + search',
      description: 'Connect docs source, ingest, basic search live.',
      artifacts: ['Ingest pipeline', 'Search index'],
    },
    {
      label: 'Week 2',
      title: 'Ask widget + citations',
      description: 'Citation-first ask widget, embed code, design pass.',
      artifacts: ['Widget', 'Embed snippet'],
    },
    {
      label: 'Week 3',
      title: 'Analytics + gap report',
      description: 'Analytics, gap report, weekly digest, training.',
      artifacts: ['Dashboard', 'Gap report', 'Runbook'],
    },
  ],
  resultMetrics: [
    { value: '3 weeks', label: 'Time to live' },
    { value: '40–60%', label: 'Typical "answered" rate', context: 'after tuning' },
  ],
  addOns: [
    {
      name: 'Multi-language docs',
      description: 'Add 2–3 languages with translation pipeline + per-locale search.',
      price: '+$2,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'AI search and ask widget for product docs, with citations, analytics, and gap reporting.',
}

const aiOnboarding: ExtendedTier = {
  slug: 'ai-onboarding-concierge',
  name: 'AI Onboarding Concierge',
  shortName: 'AI Onboarding',
  category: 'ai-products',
  tagline: 'In-app guided activation that adapts to what each new user is trying to do.',
  description:
    'Embed an AI concierge in your product that walks new users through setup using your actual UI. Adaptive — it asks what they want to accomplish and routes them to the shortest path. Four weeks. Sells hard to founders watching activation rates flat-line.',
  price: 'from $9,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-onboarding-concierge'),
  capability: 'product',
  mode: 'build',
  stackChips: ['React', 'OpenAI', 'Anthropic', 'PostHog', 'Mixpanel'],
  outcomes: [
    'New users hit "aha" faster, measurably',
    'Activation rate analytics built in',
    'Adaptive flow — not a fixed-step wizard',
    'Falls back gracefully when the model is unsure',
  ],
  deliverables: [
    'Embeddable React component',
    'Conversation runtime (server + client)',
    'Tool-use bridge into your product (clicks, form fills, navigation)',
    'Activation funnel analytics (PostHog / Mixpanel / hand-rolled)',
    'A/B harness vs. your existing onboarding',
    '30 days of post-launch tuning',
  ],
  notIncluded: [
    'Redesigning your product (we work with what\'s there)',
  ],
  faq: [
    {
      q: 'What if the AI gets it wrong?',
      a: 'Every action has a confirm step before mutating state. Confidence below threshold falls back to a deterministic flow.',
    },
    {
      q: 'Will this replace our onboarding?',
      a: 'The A/B harness lets you find out. Most teams keep both and route by signal.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Funnel + scope',
      description:
        'Profile current activation, pick the 3 most impactful flows, build event spec.',
      artifacts: ['Funnel analysis', 'Event spec'],
    },
    {
      label: 'Week 2',
      title: 'Concierge runtime',
      description:
        'Conversation server, tool-use bridge, embed component, dev-mode UI.',
      artifacts: ['Concierge component', 'Server', 'Tool registry'],
    },
    {
      label: 'Week 3',
      title: 'A/B + analytics',
      description:
        'Activation funnel analytics, A/B harness, soft launch.',
      artifacts: ['Analytics', 'A/B config'],
    },
    {
      label: 'Week 4',
      title: 'Tune + handoff',
      description:
        'Tune against real funnel data, handoff with runbook + 30-day support.',
      artifacts: ['Runbook', 'Handoff'],
    },
  ],
  resultMetrics: [
    { value: '4 weeks', label: 'Time to live' },
    { value: '15–35%', label: 'Typical activation lift', context: 'against control' },
  ],
  addOns: [
    {
      name: 'Voice mode',
      description: 'Voice-driven onboarding for mobile / desktop.',
      price: '+$3,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'In-app AI concierge that drives new-user activation through adaptive guided flows.',
}

const supportDeflection: ExtendedTier = {
  slug: 'support-deflection',
  name: 'Support Deflection Layer',
  shortName: 'Support Deflection',
  category: 'ai-products',
  tagline: 'Tier-1 answers with citations. Clean handoff. Eval loop you trust.',
  description:
    'Sits in front of human support. Answers tier-1 questions with citations to your docs/knowledge base. Escalates cleanly with full context when it can\'t. We own the eval loop so it doesn\'t lie. Four weeks.',
  price: 'from $9,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('support-deflection'),
  capability: 'product',
  mode: 'build',
  stackChips: ['Intercom', 'Zendesk', 'Crisp', 'OpenAI', 'Anthropic', 'pgvector'],
  outcomes: [
    'Measurable deflection on tier-1 tickets',
    'Citations on every answer (auditable)',
    'Clean handoff to humans with full context',
    'Eval suite that catches drift before customers do',
  ],
  deliverables: [
    'Embed widget OR Intercom/Zendesk integration',
    'Knowledge ingestion + retrieval pipeline',
    'Citation-first answers',
    'Confidence-based escalation to humans',
    'Eval suite (run on every prompt change)',
    'Admin dashboard: deflection rate, accuracy, escalation reasons',
    '30 days of post-launch tuning',
  ],
  notIncluded: [
    'Writing your knowledge base (we use what you have)',
  ],
  faq: [
    {
      q: 'What\'s the deflection guarantee?',
      a: 'No guarantee — anyone promising one is lying. We measure baseline and target a realistic lift (typically 25–45% in the first 90 days).',
    },
    {
      q: 'How do you prevent it from lying?',
      a: 'Citations are mandatory. Below confidence threshold = escalate. Eval suite runs on every change.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Baseline + ingest',
      description:
        'Profile your current tier-1 volume, ingest knowledge sources, agree on success metric.',
      artifacts: ['Baseline report', 'Ingest pipeline'],
    },
    {
      label: 'Week 2',
      title: 'Answer + escalate',
      description:
        'Citation-first answer flow, confidence routing, clean handoff to human queue.',
      artifacts: ['Answer service', 'Escalation flow'],
    },
    {
      label: 'Week 3',
      title: 'Evals + dashboard',
      description:
        'Eval suite, admin dashboard, A/B harness against current tier-1.',
      artifacts: ['Eval suite', 'Dashboard'],
    },
    {
      label: 'Week 4',
      title: 'Soft launch + tune',
      description:
        'Limited rollout, 30 days of tuning, runbook + on-call training.',
      artifacts: ['Soft launch', 'Tuning report', 'Runbook'],
    },
  ],
  resultMetrics: [
    { value: '4 weeks', label: 'Time to live' },
    { value: '25–45%', label: 'Typical 90-day deflection lift' },
  ],
  addOns: [
    {
      name: 'Multilingual support',
      description: 'Add 2+ languages with native-speaker eval review.',
      price: '+$2,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'AI tier-1 support deflection layer with citations, escalation, and a measurable eval loop.',
}

// ─────────────────────────────────────────────────────────────────────────
// PRODUCTIZED RETAINERS
// ─────────────────────────────────────────────────────────────────────────

const aiQualityRetainer: ExtendedTier = {
  slug: 'ai-quality-retainer',
  name: 'AI Quality Retainer',
  shortName: 'AI Quality',
  category: 'retainers',
  tagline: 'Monthly evals, regression report, one upgrade, one fix. Your AI ages well.',
  description:
    'For teams already running AI in production. Each month: eval suite runs, regression report ships, we land one model/prompt upgrade and one reliability fix. Cancel anytime.',
  price: '$2,500/mo',
  priceCents: 0,
  cadence: 'monthly',
  timeline: 'Quarterly minimum',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-quality-retainer'),
  capability: 'automation',
  mode: 'operate',
  stackChips: ['Eval suites', 'OpenAI', 'Anthropic', 'LangSmith', 'Braintrust'],
  outcomes: [
    'Monthly regression report',
    'One model/prompt upgrade per month',
    'One reliability fix per month',
    'Eval suite stays current with your product',
  ],
  deliverables: [
    'Monthly eval run + dashboard refresh',
    'Regression report (what changed, what regressed, what got better)',
    'One scoped upgrade (model swap, prompt rewrite, retrieval tune)',
    'One scoped fix (bug, latency, cost)',
    'Slack channel for async questions',
    'Quarterly review call',
  ],
  notIncluded: [
    'Major net-new feature builds (separate engagement)',
    'Unlimited fixes (one per month included; more by add-on)',
  ],
  faq: [
    {
      q: 'What if there\'s nothing to fix this month?',
      a: 'We bank the credit, propose a tuning project, or pause the month with a credit applied to next.',
    },
  ],
  phases: [],
  resultMetrics: [
    { value: '< 1 mo', label: 'Time to first regression caught', context: 'on average' },
  ],
  addOns: [
    {
      name: 'Extra fix per month',
      description: 'Each additional in-month fix.',
      price: '+$1,000',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Monthly retainer: eval runs, regression reporting, scoped upgrades and fixes for AI in production.',
}

const automationRetainer: ExtendedTier = {
  slug: 'automation-retainer',
  name: 'Automation Retainer',
  shortName: 'Automation Retainer',
  category: 'retainers',
  tagline: 'Two new pipelines per month plus maintenance of everything we ship.',
  description:
    'Monthly retainer for teams who want to keep shipping automations without standing up an internal capability. Two new pipelines/mo, maintenance on existing ones, on-call for breakage. Cancel anytime.',
  price: '$2,000/mo',
  priceCents: 0,
  cadence: 'monthly',
  timeline: 'Quarterly minimum',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('automation-retainer'),
  capability: 'automation',
  mode: 'operate',
  stackChips: ['n8n', 'Temporal', 'Inngest', 'GitHub Actions'],
  outcomes: [
    'Two new automations per month',
    'Maintenance + on-call for everything we shipped',
    'Monthly health report',
    'Slack channel for new ideas + bug reports',
  ],
  deliverables: [
    '2 new pipelines / month (scope: small to medium)',
    'Maintenance: deps, deprecations, monitoring, alerting',
    'On-call coverage during business hours',
    'Monthly health report',
    'Quarterly review call',
  ],
  notIncluded: [
    'Major rebuilds (scope as a separate sprint)',
  ],
  faq: [],
  phases: [],
  resultMetrics: [
    { value: '24+', label: 'Pipelines/year', context: 'on a 12-month retainer' },
  ],
  addOns: [
    {
      name: 'Extra pipeline',
      description: 'Each additional in-month pipeline.',
      price: '+$900',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'Monthly automation retainer: two new pipelines per month plus maintenance and on-call.',
}

const reliabilityRetainer: ExtendedTier = {
  slug: 'reliability-retainer',
  name: 'Reliability Retainer',
  shortName: 'Reliability',
  category: 'retainers',
  tagline: 'Own your alerting hygiene, run a quarterly chaos drill, ship a monthly scorecard.',
  description:
    'Monthly retainer for teams who shipped fast and now feel the cracks. We own alerting hygiene, run one chaos drill per quarter, and produce a monthly reliability scorecard with trend lines and action items.',
  price: '$3,000/mo',
  priceCents: 0,
  cadence: 'monthly',
  timeline: 'Quarterly minimum',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('reliability-retainer'),
  capability: 'platform',
  mode: 'operate',
  stackChips: ['Datadog', 'Sentry', 'Grafana', 'PagerDuty', 'AWS', 'Vercel'],
  outcomes: [
    'Alerting that\'s actionable, not noisy',
    'Quarterly chaos drills (you stay practiced)',
    'Monthly reliability scorecard',
    'Trend on MTTR, error budget, alert fatigue',
  ],
  deliverables: [
    'Monthly alerting hygiene pass (kill noisy, sharpen actionable)',
    'Quarterly chaos drill (game day, scenarios, retrospective)',
    'Monthly scorecard: MTTR, MTTD, error budget burn, alert volume',
    'On-call rotation review every quarter',
    'Slack channel for incident questions',
  ],
  notIncluded: [
    '24/7 on-call coverage (you own the rotation; we own the practice)',
  ],
  faq: [
    {
      q: 'What\'s a chaos drill look like?',
      a: 'We pick a realistic failure scenario (DB primary failure, region outage, vendor down), run it in staging, watch your team respond. Output: a retro and 3 action items.',
    },
  ],
  phases: [],
  resultMetrics: [
    { value: '4', label: 'Chaos drills/year' },
    { value: '12', label: 'Scorecards/year' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: 'Monthly reliability retainer: alerting hygiene, quarterly chaos drills, monthly reliability scorecards.',
}

const foundersTechPartner: ExtendedTier = {
  slug: 'founders-tech-partner',
  name: 'Founder\'s Tech Partner',
  shortName: 'Tech Partner',
  category: 'retainers',
  tagline: 'Weekly strategy + async Slack + one ship per month. Half the price of fractional.',
  description:
    'For solo founders or small teams without engineering leadership. Weekly 30-min strategy call, async Slack for the in-between, and one shipped piece of work each month. Two-month commitment.',
  price: '$3,500/mo',
  priceCents: 0,
  cadence: 'monthly',
  timeline: 'Two-month minimum',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('founders-tech-partner'),
  capability: 'strategy',
  mode: 'operate',
  stackChips: ['Strategy', 'Architecture', 'Hiring', 'Vendor selection'],
  outcomes: [
    'A real engineering brain on call every week',
    'One shipped artifact per month — not just talk',
    'Honest pushback when something\'s a bad bet',
  ],
  deliverables: [
    'Weekly 30-min strategy call',
    'Async Slack for in-between questions (24-hour response SLA)',
    'One shipped piece of work / month (build, audit, hire-rubric, vendor pick, etc.)',
    'Quarterly written check-in',
  ],
  notIncluded: [
    'Full-time presence (we are not your CTO)',
    'Building entire products (scope a Build engagement)',
  ],
  faq: [
    {
      q: 'What kinds of "shipped work" count?',
      a: 'Anything outcome-shaped: audit + plan, vendor evaluation, hire rubric + interview kit, architecture doc, prototype, ops automation, single-feature ship.',
    },
  ],
  phases: [],
  resultMetrics: [
    { value: '12', label: 'Shipped artifacts/year' },
    { value: '< 24h', label: 'Slack response SLA' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: 'Monthly fractional engineering partner for founders: weekly call + async + one shipped artifact per month.',
}

// ─────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC ON-RAMPS
// ─────────────────────────────────────────────────────────────────────────

const aiReadinessAssessment: ExtendedTier = {
  slug: 'ai-readiness-assessment',
  name: '48-Hour AI Readiness Assessment',
  shortName: 'AI Readiness',
  category: 'diagnostics',
  tagline: 'A one-page scorecard that tells you where AI helps and where it doesn\'t.',
  description:
    'Forty-eight hours. We look at your product, team, data, and goals, and we deliver a one-page scorecard: where AI moves the needle, where it doesn\'t, the top 3 wedges, and rough cost. Use it to skip the consultancy circus.',
  price: '$1,500',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '48 hours',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('ai-readiness-assessment'),
  capability: 'strategy',
  mode: 'audit',
  stackChips: ['Strategy', 'Scorecard', 'Cost modeling'],
  outcomes: [
    'A defensible answer to "where does AI fit here?"',
    'Top 3 wedges with rough cost + timeline',
    'Anti-pattern flags (where NOT to use AI)',
    'A 30-min review call so you can pressure-test',
  ],
  deliverables: [
    '1-page scorecard (PDF + editable doc)',
    'Top 3 wedge briefs (1 paragraph each)',
    'Cost & timeline range for each',
    'Anti-pattern flags',
    '30-min review call',
  ],
  notIncluded: [
    'Implementation (rolls into a build engagement; assessment fee credited)',
  ],
  faq: [
    {
      q: 'What if the answer is "you don\'t need AI"?',
      a: 'That happens. You still get the scorecard and we tell you why. You\'ve saved 3 months and a six-figure spend.',
    },
  ],
  phases: [],
  resultMetrics: [
    { value: '48 hours', label: 'Turnaround' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: '48-hour scorecard assessing where AI fits, top wedges, costs, and anti-patterns.',
}

const stackXray: ExtendedTier = {
  slug: 'stack-xray',
  name: 'Stack X-Ray',
  shortName: 'Stack X-Ray',
  category: 'diagnostics',
  tagline: 'Tooling spend + integration debt audit. Find $X/month and 5 automation wins.',
  description:
    'A 5-day diagnostic of your full tool stack. Spend, overlap, integration debt, automation gaps, vendor risk. Output: a 1-page savings + automation report you can act on this quarter.',
  price: '$1,200',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '5 business days',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('stack-xray'),
  capability: 'strategy',
  mode: 'audit',
  stackChips: ['Spend audit', 'Tool inventory', 'Integration map'],
  outcomes: [
    'Full tool inventory + spend',
    'Overlap + redundancy report',
    'Top 5 automation candidates',
    'Vendor risk flags',
  ],
  deliverables: [
    'Tool inventory + monthly + annual spend',
    'Overlap matrix (X is doing what Y also does)',
    'Top 5 automation candidates with rough effort',
    'Vendor risk register (lock-in, single-vendor, deprecation)',
    '60-min review call',
  ],
  notIncluded: [
    'Implementing the savings (rolls into Ops Automation Sprint)',
  ],
  faq: [],
  phases: [],
  resultMetrics: [
    { value: '5 days', label: 'Turnaround' },
    { value: '5+', label: 'Automation candidates surfaced' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: '5-day audit of tooling spend, overlap, automation candidates, and vendor risk.',
}

const hallucinationHunt: ExtendedTier = {
  slug: 'hallucination-hunt',
  name: 'Hallucination Hunt',
  shortName: 'Hallucination Hunt',
  category: 'diagnostics',
  tagline: 'Two-day stress test of your AI feature. Ranked vulnerability list at the end.',
  description:
    'Forty-eight hours. We attack your AI feature with adversarial prompts, edge cases, and known hallucination patterns. You get a ranked vulnerability list with reproductions and severity. Often a precursor to AI Reliability Audit.',
  price: '$2,000',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '48 hours',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('hallucination-hunt'),
  capability: 'automation',
  mode: 'audit',
  stackChips: ['Adversarial testing', 'Red-team', 'Eval suite'],
  outcomes: [
    'Reproducible failure cases',
    'Ranked severity (1–5)',
    'Top 5 fixes with rough effort',
    'A baseline you can use to prove improvement',
  ],
  deliverables: [
    'Adversarial test set (50–100 cases)',
    'Reproduction recipe for each failure',
    'Ranked vulnerability list',
    '30-min review call',
  ],
  notIncluded: [
    'Fixing the issues (rolls into AI Reliability Audit; fee credited)',
  ],
  faq: [],
  phases: [],
  resultMetrics: [
    { value: '48 hours', label: 'Turnaround' },
    { value: '50–100', label: 'Adversarial cases' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: '48-hour adversarial stress-test of an AI feature, with ranked vulnerability list.',
}

// ─────────────────────────────────────────────────────────────────────────
// PREMIUM BUNDLE
// ─────────────────────────────────────────────────────────────────────────

const studioPackage: ExtendedTier = {
  slug: 'studio-package',
  name: 'The Studio Package',
  shortName: 'Studio Package',
  category: 'bundle',
  tagline: 'Done-for-you AI-native stack. 90 days. One number. One contract.',
  description:
    'For seed and Series-A teams shipping AI: one engagement, one number. Reliability audit, five ops automations, internal AI copilot, one customer-facing AI feature, and six months of maintenance — bundled. The fastest way from "we should use AI" to "we are."',
  price: 'from $45,000',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '90 days + 6 mo retainer',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('studio-package'),
  capability: 'product',
  mode: 'build',
  stackChips: ['Multi-discipline', 'Bundled scope', 'Retainer included'],
  outcomes: [
    'AI Reliability Audit + eval harness installed',
    '5 ops automations shipped',
    'Internal AI copilot for the team',
    'One customer-facing AI feature productized',
    '6 months of AI Quality Retainer included',
  ],
  deliverables: [
    'AI Reliability Audit (full scope)',
    'Ops Automation Sprint — 5 workflows',
    'Internal AI Copilot — Slack/Teams + 30-day tuning',
    'One of: Docs-as-a-Product / AI Onboarding / Support Deflection',
    '6 months AI Quality Retainer (post-90-day)',
    'Single SOW, single point of contact, weekly updates',
  ],
  notIncluded: [
    'RAG Engineering (add-on if needed)',
    'Agent Ops (add-on if needed)',
    'Net-new product builds outside the bundle',
  ],
  faq: [
    {
      q: 'Can we substitute pieces?',
      a: 'Yes. The bundle is opinionated, not rigid. Common swap: trade Internal Copilot for Agent Ops if you already have agents in production.',
    },
    {
      q: 'What\'s the cancellation policy?',
      a: 'Milestone-based. If we miss a milestone, you exit clean. If we hit them, we both keep going.',
    },
  ],
  phases: [
    {
      label: 'Days 1–14',
      title: 'AI Reliability Audit',
      description: 'Eval harness, hallucination/cost/latency profile, regression CI gate.',
    },
    {
      label: 'Days 15–21',
      title: 'Ops Automation Sprint',
      description: '5 workflows shipped across your tool stack.',
    },
    {
      label: 'Days 22–49',
      title: 'Internal AI Copilot',
      description: 'Slack/Teams bot trained on your knowledge sources with citations.',
    },
    {
      label: 'Days 50–90',
      title: 'Customer-facing AI',
      description: 'Docs-as-a-Product, AI Onboarding Concierge, or Support Deflection — your pick.',
    },
    {
      label: 'Months 4–9',
      title: 'AI Quality Retainer',
      description: 'Monthly evals, regression reporting, one upgrade + one fix per month.',
    },
  ],
  resultMetrics: [
    { value: '90 days', label: 'Build window' },
    { value: '6 months', label: 'Retainer included' },
    { value: '1', label: 'Number, contract, point of contact' },
  ],
  addOns: [
    {
      name: 'Add RAG Engineering',
      description: 'Production RAG inside the bundle.',
      price: '+$8,500',
    },
    {
      name: 'Add Agent Ops',
      description: 'Tracing, replay, guardrails, budgets for agent runs.',
      price: '+$6,500',
    },
  ],
  caseStudySlugs: [],
  schemaSummary: 'A 90-day done-for-you AI engineering engagement plus 6 months of retainer.',
}

const bespokeBuild: ExtendedTier = {
  slug: 'bespoke-build',
  name: 'Bespoke Build',
  shortName: 'Bespoke',
  category: 'bundle',
  tagline: 'Custom-scoped. Free 30-min call → 48-hour proposal → fixed price or capped T&M.',
  description:
    'When none of the productized engagements fit, we scope something custom. Free 30-minute call to understand what you\'re trying to do, a 1-page proposal back in 48 hours, and a fixed price or T&M-with-cap. Anchored to a measurable outcome.',
  price: 'custom',
  priceCents: 0,
  cadence: 'custom',
  timeline: 'custom',
  cta: 'Book a scoping call',
  ctaHref: '/book',
  capability: 'strategy',
  mode: 'build',
  stackChips: ['Anything we know', 'Anything you need'],
  outcomes: [
    'A 1-page proposal in 48 hours',
    'Anchored to a measurable outcome',
    'Fixed price OR T&M with a cap',
    'No discovery fee, no asterisks',
  ],
  deliverables: [
    'Free 30-minute scoping call',
    '1-page proposal in 48 hours',
    'Measurable success criteria',
    'Fixed price or capped T&M',
  ],
  notIncluded: [],
  faq: [
    {
      q: 'Can you build anything?',
      a: 'No. If it\'s outside our wheelhouse — mobile native, hardware, on-prem enterprise — we\'ll say so on the call and recommend someone better.',
    },
  ],
  phases: [],
  resultMetrics: [
    { value: '48 hours', label: 'Proposal turnaround' },
    { value: '$0', label: 'Discovery fee' },
  ],
  addOns: [],
  caseStudySlugs: [],
  schemaSummary: 'Custom-scoped engagement with a fixed-price or capped-T&M proposal back in 48 hours.',
}

// ─────────────────────────────────────────────────────────────────────────
// AI FLAGSHIP SUITE — premium offers, rendered first on /services
// ─────────────────────────────────────────────────────────────────────────

const aiImplementationConsulting: ExtendedTier = {
  slug: 'ai-implementation-consulting',
  name: 'AI Implementation Consulting',
  shortName: 'AI Consulting',
  category: 'ai-flagship',
  tagline: 'Stop guessing where AI fits. Get a build plan you can actually ship.',
  description:
    'Most AI consulting ends with a slide deck and a bill. This ends with a build plan: the three highest-ROI agent opportunities in your business, mapped to your tools, your data, and your team — with cost models, eval criteria, and a rollout schedule. Two weeks. If you hire us to build, the consulting fee credits 100% toward the engagement.',
  price: 'from $1,000',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '2 weeks',
  cta: 'Book a Discovery Call',
  ctaHref: inquiryHref('ai-implementation-consulting'),
  capability: 'strategy',
  mode: 'audit',
  highlight: true,
  stackChips: ['Process mapping', 'ROI modeling', 'Tool audit', 'Build plan', 'Cost forecasting'],
  outcomes: [
    'Three ranked AI agent opportunities mapped to real ROI',
    'Build plan with cost model, eval criteria, and rollout schedule',
    'Tool + data audit so you know what you have to work with',
    'Honest assessment of what NOT to automate (saves you from the obvious mistakes)',
    '60-minute walkthrough + 14 days of Slack follow-up',
  ],
  deliverables: [
    'Process map of current workflows and where AI fits (or doesn\'t)',
    'Three opportunity briefs ranked by ROI and complexity',
    'Tool + data inventory (what\'s in your stack, what\'s missing, what\'s ready)',
    'Cost model: build estimate + monthly run cost per opportunity',
    'Recommended sequence (what to build first, why, and what to skip)',
    'Loom walkthrough + 60-minute review call',
    '14 days post-engagement Slack support',
  ],
  notIncluded: [
    'Building the agents (use AI Agent Development)',
    'Custom integrations or tool connectors (in-build scope)',
    'Vendor procurement or contract negotiation',
  ],
  faq: [
    {
      q: 'Is this just a deck?',
      a: 'No. Decks are easy and useless. You get a build plan with concrete next steps, cost numbers, and an opinion on what to skip. If you want a deck, we can render the build plan as one — but the value is in the recommendations, not the slides.',
    },
    {
      q: 'What if you find AI isn\'t a fit?',
      a: 'You get told that, in writing. The most valuable consulting outcome is sometimes "don\'t do this." We\'d rather lose the build engagement than waste your money on something that won\'t work.',
    },
    {
      q: 'Does the fee really credit toward a build?',
      a: 'Yes — 100%. If you hire us to build any of the recommended agents within 60 days, the consulting fee comes off the build invoice. It\'s not a discount; it\'s a credit.',
    },
    {
      q: 'Do I need technical staff to engage you?',
      a: 'No. We talk to whoever runs the business and whoever runs the tools. If that\'s the same person, even better.',
    },
  ],
  phases: [
    {
      label: 'Day 1–4',
      title: 'Discovery',
      description:
        'Calls with you and 2–3 team members. Map current workflows, tools, data sources, pain points. Identify the moments where AI could meaningfully help.',
      artifacts: ['Process map', 'Tool inventory', 'Pain point log'],
    },
    {
      label: 'Day 5–9',
      title: 'Opportunity sizing',
      description:
        'For the top 5–7 candidate workflows, model the ROI: time saved, error reduction, cost-per-task. Estimate build effort and monthly run cost.',
      artifacts: ['Opportunity briefs', 'ROI spreadsheet', 'Cost models'],
    },
    {
      label: 'Day 10–14',
      title: 'Build plan',
      description:
        'Rank the top 3, recommend a sequence, identify dependencies. Final report + Loom walkthrough + 60-minute review call.',
      artifacts: ['Final report', 'Build plan', 'Loom walkthrough'],
    },
  ],
  resultMetrics: [
    { value: '2 weeks', label: 'Median delivery', context: 'every consult' },
    { value: '3', label: 'Ranked opportunities', context: 'with cost models' },
    { value: '100%', label: 'Credit toward build', context: 'within 60 days' },
  ],
  addOns: [
    {
      name: 'Stakeholder workshop',
      description: 'Half-day workshop with your leadership team to align on AI strategy + answer questions.',
      price: '+$600',
    },
    {
      name: 'Vendor evaluation',
      description: 'Compare 3–5 off-the-shelf AI tools against custom build for your top use case.',
      price: '+$480',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Two-week AI implementation consulting: opportunity audit, ROI modeling, and build plan. Fee credits toward build engagement.',
}

const aiAgentDevelopment: ExtendedTier = {
  slug: 'ai-agent-development',
  name: 'AI Agent Development',
  shortName: 'AI Agent Build',
  category: 'ai-flagship',
  tagline: 'A custom AI agent trained on your business — running 24/7, measurable, and yours.',
  description:
    'Your business has processes. Quotes, scheduling, customer follow-up, vendor coordination, expense categorization, document review. We build an AI agent that handles them — trained on your SOPs, wired to your tools, with a dashboard you can actually read. Cloud-hosted by default. Eval harness included so you know it works. Human-in-the-loop guardrails on every action that touches money or customers.',
  price: 'from $2,600',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Book a Discovery Call',
  ctaHref: inquiryHref('ai-agent-development'),
  capability: 'automation',
  mode: 'build',
  highlight: true,
  stackChips: [
    'LangGraph',
    'OpenAI / Anthropic',
    'Tool calling',
    'Eval harness',
    'Observability',
    'Cloud-hosted',
    'BYOK',
  ],
  outcomes: [
    'A custom agent trained on YOUR business processes — not a generic assistant',
    'Live dashboard showing every action, cost, and decision the agent makes',
    'Eval harness that catches regressions before they hit production',
    'Human-in-the-loop guardrails on financial + customer-facing actions',
    'Monthly cost cap so you never get a surprise OpenAI bill',
    'Documented playbook so your team can update prompts and tools without us',
  ],
  deliverables: [
    'Agent runtime (LangGraph or equivalent) deployed to your cloud or ours',
    'Tool/function library wired to your stack — CRM, calendar, billing, docs, email',
    'Knowledge base built from your SOPs, processes, and reference docs',
    'Eval harness with 30–80 test cases derived from your real workflows',
    'Operations dashboard — live activity, cost meter, eval scores, error log',
    'Human-in-the-loop approval flows for high-stakes actions',
    'Monthly cost cap + alerting',
    'Operations playbook (how to add tools, update prompts, review evals)',
    '30 days post-launch Slack support + tuning',
  ],
  notIncluded: [
    'Ongoing agent operations (use Agent Operations Retainer)',
    'Building net-new business processes (we automate what exists)',
    'Replacing licensed software (we wire to existing tools)',
    'On-premise installs (cloud-hosted by default; VPC available as enterprise add-on)',
  ],
  faq: [
    {
      q: 'How is this different from buying ChatGPT Enterprise?',
      a: 'ChatGPT is a general assistant. This is a specialist trained on your processes, wired to your tools, with measurable outputs. ChatGPT can answer questions about your business; this one runs parts of it.',
    },
    {
      q: 'What if the agent makes a mistake on something important?',
      a: 'Every action that touches money, customers, or external systems goes through a human-in-the-loop approval flow by default. The agent drafts; a human approves. Over time, as eval scores prove out, you can lower the bar for low-risk actions.',
    },
    {
      q: 'Where does my data live?',
      a: 'Your cloud (AWS, GCP, Vercel, Supabase) or our managed environment — your call. We use your LLM API keys (BYOK), so your prompts and outputs never touch our infrastructure. Enterprise VPC deployment available.',
    },
    {
      q: 'How much does it cost to RUN per month after launch?',
      a: 'Depends entirely on volume — typical small-business agents run $50–$400/month in LLM costs. We give you a cost forecast in week 1 and put a monthly cap in place so you never get surprised.',
    },
    {
      q: 'Can I add new tools or processes later?',
      a: 'Yes — that\'s what the Operations Retainer is for. Or your team can do it themselves; the operations playbook covers it.',
    },
    {
      q: 'Do you do desktop installs?',
      a: 'No, by default. Desktop installs mean you can\'t push fixes, security becomes harder, and support gets messy. Cloud-hosted with SSO is the standard. If you need on-prem for compliance reasons, that\'s an enterprise add-on.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Discovery + agent design',
      description:
        'Process mapping with your team. Identify the workflows the agent will own. Design the tool library, knowledge base structure, and eval criteria. Lock the scope.',
      artifacts: ['Process map', 'Tool spec', 'Eval rubric', 'Cost forecast'],
    },
    {
      label: 'Week 2',
      title: 'Build — runtime + tools',
      description:
        'Stand up the agent runtime, wire the tool library to your stack, ingest your SOPs into the knowledge base. First end-to-end run on test data.',
      artifacts: ['Agent runtime deployed', 'Tool library', 'Knowledge base', 'First eval run'],
    },
    {
      label: 'Week 3',
      title: 'Evals + dashboard',
      description:
        'Build out the eval harness with real cases from your business. Stand up the operations dashboard. Wire human-in-the-loop approval flows on high-risk actions.',
      artifacts: ['Eval harness', 'Ops dashboard', 'Approval flows', 'Cost monitoring'],
    },
    {
      label: 'Week 4',
      title: 'Pilot + handoff',
      description:
        'Soft-launch with one team, monitor evals and dashboard, tune prompts. Documented playbook + 60-minute training session + 30 days Slack support.',
      artifacts: ['Operations playbook', 'Training session', 'Slack channel', 'Tuning report'],
    },
  ],
  resultMetrics: [
    { value: '4 weeks', label: 'Median delivery', context: 'spec to launch' },
    { value: '30–80', label: 'Eval cases at launch', context: 'real-workflow grounded' },
    { value: '$50–$400', label: 'Typical run cost / mo', context: 'small business volume' },
  ],
  addOns: [
    {
      name: 'Additional tool integration',
      description: 'Wire the agent to one additional system beyond the base scope (e.g., a niche CRM, ERP, or industry-specific tool).',
      price: '+$480',
    },
    {
      name: 'Custom dashboard branding',
      description: 'White-label the operations dashboard with your branding, custom domain, and SSO.',
      price: '+$600',
    },
    {
      name: 'VPC / on-premise deployment',
      description: 'Deploy the agent inside your private cloud or on-premise environment for compliance-sensitive workloads.',
      price: '+$2,000',
    },
    {
      name: 'Multi-agent orchestration',
      description: 'Add a second specialized agent that hands off to the first (e.g., research agent + execution agent).',
      price: '+$1,400',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Custom AI agent built on a business\'s processes, wired to its tools, with eval harness, human-in-the-loop guardrails, observability dashboard, and monthly cost cap.',
}

const aiVoiceAgent: ExtendedTier = {
  slug: 'ai-voice-agent',
  name: 'AI Voice Agent',
  shortName: 'Voice Agent',
  category: 'ai-flagship',
  tagline: 'A phone agent that handles one workflow well — measurable, always on, never tired.',
  description:
    'Pick one phone workflow that costs you time or money: inbound qualification, appointment booking, FAQ deflection, missed-call recovery. We build a voice agent that owns it. Twilio + LLM + your eval rig. Real recordings, scored conversations, monthly performance report. Not a "voice assistant" — a measurable replacement for one specific phone job.',
  price: 'from $1,800',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '3 weeks',
  cta: 'Book a Discovery Call',
  ctaHref: inquiryHref('ai-voice-agent'),
  capability: 'automation',
  mode: 'build',
  highlight: true,
  stackChips: [
    'Twilio',
    'LLM (GPT-4 / Claude)',
    'ElevenLabs / Deepgram',
    'Call scoring',
    'CRM sync',
    'Real-time analytics',
  ],
  outcomes: [
    'A voice agent owning one specific phone workflow end-to-end',
    'Call recordings + transcripts + scores you can review',
    'CRM sync so qualified leads or booked appointments land in your pipeline automatically',
    'Monthly performance report with conversion + cost-per-call',
    'Human escalation path when the agent hits its limits',
  ],
  deliverables: [
    'Voice agent built on Twilio + LLM with natural-sounding TTS',
    'Workflow logic for the chosen use case (qualification / booking / FAQ / recovery)',
    'Knowledge base of your business info, hours, services, FAQs',
    'CRM sync — qualified calls drop into HubSpot, Salesforce, Pipedrive, GoHighLevel, or sheet of choice',
    'Call recording + transcript + scoring pipeline',
    'Real-time dashboard: calls handled, qualified rate, average duration, cost-per-call',
    'Human escalation flow (warm transfer, callback request, or message capture)',
    'Monthly performance report',
    '30 days post-launch tuning + Slack support',
  ],
  notIncluded: [
    'Outbound cold calling (we don\'t build telemarketing bots)',
    'Multi-language (single language at launch; add via add-on)',
    'Replacing your full phone system (we sit alongside or in front of it)',
  ],
  faq: [
    {
      q: 'Will it sound like a robot?',
      a: 'No. We use ElevenLabs / Deepgram for natural-sounding voice, and the agent is scripted to acknowledge it\'s an AI when asked. Most callers either don\'t notice or appreciate that it\'s direct and fast.',
    },
    {
      q: 'What happens when it can\'t handle something?',
      a: 'It hands off — warm transfer to a human, callback request, or message capture. Default behavior is escalation, not pretending to know.',
    },
    {
      q: 'How much does each call cost to run?',
      a: 'Typically $0.10–$0.50 per call depending on length and complexity. Telephony + LLM + TTS combined. We give you a cost-per-call forecast before we build.',
    },
    {
      q: 'Can it handle Spanish / French / etc?',
      a: 'Yes — multilingual is an add-on. We support any language the underlying LLM and TTS provider support.',
    },
    {
      q: 'Is this compliant?',
      a: 'We follow TCPA + state-level disclosure rules. The agent identifies as AI when asked. Recording disclosure is built in. We don\'t build dialers or anything resembling outbound robocalling.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'Workflow design',
      description:
        'Lock the use case (qualification / booking / FAQ / recovery). Map the conversation flows, edge cases, escalation triggers. Design the knowledge base + integrations.',
      artifacts: ['Conversation flow', 'Knowledge base spec', 'Integration plan'],
    },
    {
      label: 'Week 2',
      title: 'Build',
      description:
        'Stand up the Twilio number, wire the LLM + TTS, build the workflow logic, integrate the CRM. Internal test calls.',
      artifacts: ['Voice agent live on test number', 'CRM sync wired', 'Test recordings'],
    },
    {
      label: 'Week 3',
      title: 'Tuning + launch',
      description:
        'Calibrate against real-sounding scenarios, build the dashboard, set up monthly reporting. Soft launch with controlled volume, monitor and tune.',
      artifacts: ['Production voice agent', 'Dashboard', 'Monthly report template', 'Slack channel'],
    },
  ],
  resultMetrics: [
    { value: '3 weeks', label: 'Median delivery', context: 'spec to live calls' },
    { value: '$0.10–$0.50', label: 'Cost per call', context: 'all-in (telco + LLM + TTS)' },
    { value: '24/7', label: 'Coverage', context: 'never misses a call' },
  ],
  addOns: [
    {
      name: 'Multilingual support',
      description: 'Add 1–2 additional languages with native-quality voice and grammar.',
      price: '+$600',
    },
    {
      name: 'SMS follow-up',
      description: 'Agent sends a follow-up SMS with confirmation, recap, or next steps after every call.',
      price: '+$360',
    },
    {
      name: 'Call sentiment scoring',
      description: 'Automated sentiment + intent scoring on every call for QA + coaching.',
      price: '+$480',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Phone-based AI agent for one specific workflow (qualification, booking, FAQ, or missed-call recovery) with CRM sync, call scoring, and performance dashboard.',
}

const aiLeadEngine: ExtendedTier = {
  slug: 'ai-lead-engine',
  name: 'AI Lead Engine',
  shortName: 'Lead Engine',
  category: 'ai-flagship',
  tagline: 'A pipeline that finds, enriches, scores, and engages your ideal leads — with a dashboard you actually open.',
  description:
    'Forget "AI SDR" hype. This is a measurable lead-generation pipeline: signal sources you choose, enrichment that resolves the right person, scoring grounded in your actual ICP, and outreach drafts your team approves before anything sends. Personalized dashboard tracks conversion at every stage so you know what works and what doesn\'t.',
  price: 'from $2,200',
  priceCents: 0,
  cadence: 'one-time',
  timeline: '4 weeks',
  cta: 'Book a Discovery Call',
  ctaHref: inquiryHref('ai-lead-engine'),
  capability: 'automation',
  mode: 'build',
  highlight: true,
  stackChips: [
    'Apollo / Clay',
    'LinkedIn signals',
    'Enrichment APIs',
    'LLM scoring',
    'CRM sync',
    'Custom dashboard',
  ],
  outcomes: [
    'Pipeline of pre-qualified leads matching your ICP, refreshed automatically',
    'Personalized outreach drafts you approve before they send (no auto-spam)',
    'Dashboard with stage-by-stage conversion: signal → contact → engaged → meeting → close',
    'Honest signal of which sources, segments, and messages actually work',
    'CRM sync so nothing falls through the cracks',
  ],
  deliverables: [
    'Signal sources wired (LinkedIn job changes, funding events, intent data, custom triggers)',
    'Enrichment layer resolving the right contact + verified email + role context',
    'LLM-based scoring grounded in your historical wins (or a starter ICP rubric)',
    'Personalized outreach draft generator (not template-stuffer)',
    'Approval queue — nothing sends without a human review',
    'CRM sync to HubSpot, Salesforce, Pipedrive, Attio, or sheet of choice',
    'Custom dashboard: source attribution, stage funnel, message performance, cost-per-meeting',
    'Monthly performance report with iteration recommendations',
    '30 days post-launch tuning + Slack support',
  ],
  notIncluded: [
    'Cold calling automation (use AI Voice Agent for that)',
    'Email warmup or domain reputation services (use a dedicated provider)',
    'Replacement of a human SDR — this augments, doesn\'t replace',
  ],
  faq: [
    {
      q: 'Won\'t this just spam people?',
      a: 'No — by design. Every outreach draft goes through an approval queue before sending. The agent drafts; a human reviews and clicks send (or rejects). You control quality, the agent saves you research time.',
    },
    {
      q: 'How is this different from Clay or Apollo?',
      a: 'Clay and Apollo are great tools. This wires them together with your scoring logic, your CRM, and a dashboard that shows what\'s working. It\'s the layer on top of those tools — not a replacement.',
    },
    {
      q: 'How much do leads cost?',
      a: 'Depends on signal sources and enrichment volume. Typical small-business pipelines run $200–$800/mo in tooling costs (Clay, enrichment APIs, LLM). We give you a forecast in week 1.',
    },
    {
      q: 'What if my ICP is hard to find?',
      a: 'Niche ICPs are where this shines. Generic ICPs ("SMB B2B") are easy and crowded. Specific ICPs ("HVAC contractors with 5–25 trucks in the Sun Belt who switched ERPs in the last 12 months") are where signal-based pipelines beat list-buying every time.',
    },
    {
      q: 'Can I use this with my existing SDR team?',
      a: 'Yes — that\'s the ideal use case. Your SDRs spend less time on research and more time on calls. The pipeline feeds them pre-qualified, pre-researched leads with draft outreach.',
    },
  ],
  phases: [
    {
      label: 'Week 1',
      title: 'ICP + signal design',
      description:
        'Define your ICP precisely. Identify which signals predict good fits (job changes, funding, hiring, tech stack changes, intent). Pick the sources we\'ll use.',
      artifacts: ['ICP rubric', 'Signal source list', 'Scoring criteria'],
    },
    {
      label: 'Week 2',
      title: 'Pipeline build',
      description:
        'Wire the signal sources, enrichment layer, scoring logic, and CRM sync. First end-to-end run on test data.',
      artifacts: ['Pipeline live', 'CRM sync wired', 'First lead batch'],
    },
    {
      label: 'Week 3',
      title: 'Outreach + dashboard',
      description:
        'Build the personalized outreach draft generator and approval queue. Stand up the custom dashboard with stage funnel + source attribution.',
      artifacts: ['Outreach generator', 'Approval queue', 'Custom dashboard'],
    },
    {
      label: 'Week 4',
      title: 'Pilot + tuning',
      description:
        'Soft launch with controlled volume, monitor scoring accuracy, tune outreach quality. Documented playbook + training + 30 days Slack support.',
      artifacts: ['Production pipeline', 'Playbook', 'Training session', 'Slack channel'],
    },
  ],
  resultMetrics: [
    { value: '4 weeks', label: 'Median delivery', context: 'spec to first leads' },
    { value: 'Approval-gated', label: 'Outreach quality', context: 'no auto-spam' },
    { value: '$200–$800', label: 'Typical tooling / mo', context: 'small business volume' },
  ],
  addOns: [
    {
      name: 'Custom signal source',
      description: 'Build a custom signal source beyond the base set (e.g., scraping a niche directory, monitoring a specific event feed).',
      price: '+$600',
    },
    {
      name: 'Multi-channel outreach',
      description: 'Add LinkedIn message + SMS as outreach channels alongside email.',
      price: '+$480',
    },
    {
      name: 'A/B testing framework',
      description: 'Built-in A/B testing for outreach messages with statistical significance reporting.',
      price: '+$360',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Lead-generation pipeline: signal sources, enrichment, LLM-based scoring, approval-gated personalized outreach, CRM sync, and custom performance dashboard.',
}

const agentOperationsRetainer: ExtendedTier = {
  slug: 'agent-operations-retainer',
  name: 'Agent Operations Retainer',
  shortName: 'Agent Ops',
  category: 'ai-flagship',
  tagline: 'Your agent gets better every month — or we tell you why it isn\'t.',
  description:
    'Agents drift. Models update. Tools change. Your business evolves. This retainer keeps your deployed agent sharp: weekly eval review, drift monitoring, prompt tuning, tool additions, monthly cost optimization, and a written report so you know exactly what we did and what changed. Cancel any month.',
  price: 'from $600',
  priceCents: 0,
  cadence: 'monthly',
  timeline: 'Monthly · cancel anytime',
  cta: 'Talk to Sage',
  ctaHref: inquiryHref('agent-operations-retainer'),
  capability: 'automation',
  mode: 'operate',
  highlight: true,
  stackChips: [
    'Eval review',
    'Drift monitoring',
    'Prompt tuning',
    'Cost optimization',
    'Tool additions',
    'Monthly report',
  ],
  outcomes: [
    'Agent quality stays high — or you find out exactly why it dropped',
    'New tools and workflows added as your business grows',
    'Monthly cost optimization (model swaps, prompt compression, caching)',
    'Drift detection so you catch problems before customers do',
    'Written monthly report — what we did, what changed, what\'s next',
  ],
  deliverables: [
    'Weekly eval review on a sampled set of real agent runs',
    'Drift monitoring with alerts when quality scores drop',
    'Prompt + tool tuning based on eval findings',
    'Up to 2 new tool integrations or workflow expansions per month',
    'Monthly cost optimization review (model choice, prompt length, caching opportunities)',
    'Monthly performance report (PDF + Loom)',
    'Slack channel with 1–2 business day response on issues',
    'Quarterly strategy call to review trajectory',
  ],
  notIncluded: [
    'Brand new agent builds (use AI Agent Development)',
    'Major architecture rebuilds (separate engagement)',
    'On-call / 24/7 support (use Reliability Retainer for that)',
  ],
  faq: [
    {
      q: 'Why do agents need ongoing operations?',
      a: 'Three reasons: (1) Models change — what worked on GPT-4-0314 may not work on GPT-5. (2) Your business changes — new tools, new processes, new edge cases. (3) Drift is real — without monitoring, quality degrades silently. The retainer makes this someone\'s job.',
    },
    {
      q: 'What if I built my agent with someone else?',
      a: 'We can take over operations on agents we didn\'t build, but we need a 1-week onboarding to map the architecture and stand up our eval harness if you don\'t already have one. Onboarding is included in the first month at no extra cost.',
    },
    {
      q: 'Can I cancel?',
      a: 'Any month, no commitment. We give you the playbook and dashboard access on the way out so your team can take it over.',
    },
    {
      q: 'How does this compare to hiring an AI engineer?',
      a: 'An in-house AI engineer costs $8–15k/mo loaded. This is a fraction of that, with a tighter scope (agent ops only). If you have multiple agents and need broader engineering, hire an engineer. If you have one or two agents and need them maintained well, this is the play.',
    },
  ],
  phases: [
    {
      label: 'Week 1 of month',
      title: 'Eval review + drift check',
      description:
        'Sample 20–50 real agent runs. Score against eval criteria. Flag anything that drifted. Review cost trends.',
      artifacts: ['Eval scorecard', 'Drift report', 'Cost trend chart'],
    },
    {
      label: 'Week 2',
      title: 'Tuning + improvements',
      description:
        'Apply prompt + tool fixes based on eval findings. Add new tools or workflow expansions. Re-run evals to measure improvement.',
      artifacts: ['Updated prompts', 'New tool integrations', 'Before/after eval delta'],
    },
    {
      label: 'Week 3',
      title: 'Cost optimization',
      description:
        'Review model choice + prompt length + caching opportunities. Test cheaper alternatives where quality holds. Document savings.',
      artifacts: ['Model comparison', 'Cost savings report', 'Updated configs'],
    },
    {
      label: 'Week 4',
      title: 'Report + planning',
      description:
        'Monthly performance report. Loom walkthrough of changes. Plan next month\'s priorities with you.',
      artifacts: ['Monthly PDF report', 'Loom walkthrough', 'Next-month plan'],
    },
  ],
  resultMetrics: [
    { value: 'Weekly', label: 'Eval review cadence', context: 'on real runs' },
    { value: '2 new', label: 'Tools / mo included', context: 'or workflow expansions' },
    { value: 'Cancel any month', label: 'Commitment', context: 'no contracts' },
  ],
  addOns: [
    {
      name: 'Additional agent',
      description: 'Add a second agent under the same retainer scope.',
      price: '+$360/mo',
    },
    {
      name: 'On-call support',
      description: '24/7 pager for agent-down incidents with 1-hour response.',
      price: '+$600/mo',
    },
  ],
  caseStudySlugs: [],
  schemaSummary:
    'Monthly retainer for operating a deployed AI agent: eval review, drift monitoring, prompt tuning, cost optimization, and tool additions.',
}

// ─────────────────────────────────────────────────────────────────────────
// CATALOG
// ─────────────────────────────────────────────────────────────────────────

export const extendedTiers: ExtendedTier[] = [
  // AI Flagship — premium, rendered first
  aiAgentDevelopment,
  aiVoiceAgent,
  aiLeadEngine,
  aiImplementationConsulting,
  agentOperationsRetainer,
  // AI services
  aiReliabilityAudit,
  ragSystemsEngineering,
  agentOps,
  internalAiCopilot,
  promptEvalLibrary,
  // Automation
  opsAutomationSprint,
  incidentPostmortem,
  releaseNotes,
  feedbackRouter,
  dataHygieneBot,
  // AI products
  docsAsProduct,
  aiOnboarding,
  supportDeflection,
  // Retainers
  aiQualityRetainer,
  automationRetainer,
  reliabilityRetainer,
  foundersTechPartner,
  // Diagnostics
  aiReadinessAssessment,
  stackXray,
  hallucinationHunt,
  // Bundle
  studioPackage,
  bespokeBuild,
  // Phase 13 — SMB-friendly productized offers (RAG, AI SDR, support, knowledge
  // bot, meeting notes, SOC 2, HIPAA, Stripe, auth+billing, fractional CTO,
  // SEO foundation, churn prediction). Distributed across categories above.
  ...phase13Offers,
]

export const extendedTiersBySlug = Object.fromEntries(
  extendedTiers.map((t) => [t.slug, t])
)

export type ExtendedCategoryMeta = {
  key: ExtendedCategory
  label: string
  tagline: string
  accent: string // hex color used by the section card
  icon:
    | 'sparkles'
    | 'workflow'
    | 'bot'
    | 'refresh'
    | 'compass'
    | 'package'
    | 'shield'
    | 'trending'
    | 'briefcase'
}

export const extendedCategories: ExtendedCategoryMeta[] = [
  {
    key: 'ai-flagship',
    label: 'AI Flagship',
    tagline: 'Custom AI agents, voice agents, and lead engines — built on your business.',
    accent: '#22D3EE',
    icon: 'sparkles',
  },
  {
    key: 'ai-services',
    label: 'AI services',
    tagline: 'Make your AI features measurable, defensible, and production-grade.',
    accent: '#06B6D4',
    icon: 'sparkles',
  },
  {
    key: 'automation-pipelines',
    label: 'Automation pipelines',
    tagline: 'Boring, reliable workflows that replace manual handoffs.',
    accent: '#8B5CF6',
    icon: 'workflow',
  },
  {
    key: 'ai-products',
    label: 'Customer-facing AI',
    tagline: 'AI features your users actually use — with citations and analytics.',
    accent: '#F59E0B',
    icon: 'bot',
  },
  {
    key: 'retainers',
    label: 'Productized retainers',
    tagline: 'Recurring scope with concrete monthly deliverables.',
    accent: '#10B981',
    icon: 'refresh',
  },
  {
    key: 'diagnostics',
    label: 'Diagnostics',
    tagline: 'Cheap, fast, on-ramps. Find out before you commit.',
    accent: '#EC4899',
    icon: 'compass',
  },
  {
    key: 'compliance',
    label: 'Compliance & security',
    tagline: 'SOC 2, HIPAA, GDPR — readiness sprints that hit audit-ready milestones.',
    accent: '#22C55E',
    icon: 'shield',
  },
  {
    key: 'growth',
    label: 'Growth engineering',
    tagline: 'SEO foundations, attribution, and conversion infrastructure that compounds.',
    accent: '#F97316',
    icon: 'trending',
  },
  {
    key: 'fractional',
    label: 'Fractional leadership',
    tagline: 'Seasoned technical leadership without the $300k headcount.',
    accent: '#A855F7',
    icon: 'briefcase',
  },
  {
    key: 'bundle',
    label: 'Bundles & bespoke',
    tagline: 'One contract for the whole AI stack — or scope something custom.',
    accent: '#FAFAFA',
    icon: 'package',
  },
]

export const extendedTiersByCategory = (() => {
  const byCat: Record<ExtendedCategory, ExtendedTier[]> = {
    'ai-flagship': [],
    'ai-services': [],
    'automation-pipelines': [],
    'ai-products': [],
    retainers: [],
    diagnostics: [],
    bundle: [],
    compliance: [],
    growth: [],
    fractional: [],
  }
  for (const t of extendedTiers) {
    byCat[t.category].push(t)
  }
  return byCat
})()
