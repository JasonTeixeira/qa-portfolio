export type LegacyServiceAlias = {
  slug: string
  title: string
  eyebrow: string
  description: string
  seoTitle: string
  seoDescription: string
  nodes: string[]
  proof: { label: string; value: string }[]
  outcomes: string[]
  capabilities: { title: string; description: string }[]
  resources: { label: string; href: string; type: string }[]
  primaryHref?: string
  secondaryHref?: string
}

export const legacyServiceAliases: Record<string, LegacyServiceAlias> = {
  'ai-development': {
    slug: 'ai-development',
    title: 'AI applications that actually work.',
    eyebrow: 'AI development / legacy entry',
    description:
      'LLM features, bots, content workflows, evals, and AI safety layers built as product systems instead of demo wrappers. The page now routes into the current AI service catalog while preserving the original SEO intent.',
    seoTitle: 'AI & LLM Application Development',
    seoDescription:
      'Custom AI application development: LLM integration, AI bots, content automation, evals, and safety guardrails.',
    nodes: ['Prompt', 'Eval', 'Tool', 'Ship'],
    proof: [
      { label: 'AI surface', value: 'LLM' },
      { label: 'guardrails', value: 'evals' },
      { label: 'route', value: 'build' },
      { label: 'mode', value: 'safe' },
    ],
    outcomes: [
      'AI features with structured prompts, typed outputs, and fallback paths.',
      'Evaluation harnesses that catch regressions before users do.',
      'Bot and workflow integrations connected to real business systems.',
      'Clear separation between product logic, model calls, and human review.',
    ],
    capabilities: [
      {
        title: 'LLM product integration',
        description:
          'OpenAI, Anthropic, and retrieval flows connected to actual workflows, not bolted onto the edge of the app.',
      },
      {
        title: 'AI bots and copilots',
        description:
          'Discord, Slack, support, sales, and internal copilots with command surfaces, context windows, and cost controls.',
      },
      {
        title: 'Safety and evals',
        description:
          'Golden datasets, regression checks, refusal boundaries, output schemas, and review queues where stakes are high.',
      },
    ],
    resources: [
      { label: 'AI Agent Development', href: '/services/ai-agent-development', type: 'Service' },
      { label: 'AI Reliability Audit', href: '/services/ai-reliability-audit', type: 'Service' },
      { label: 'Jobpoise', href: '/lab/jobpoise', type: 'Lab proof' },
    ],
  },
  'cloud-infrastructure': {
    slug: 'cloud-infrastructure',
    title: 'Cloud infrastructure that costs what it should.',
    eyebrow: 'Platform / legacy entry',
    description:
      'AWS, Vercel, Supabase, CI/CD, observability, and infrastructure as code for teams that need reliability without enterprise ceremony.',
    seoTitle: 'Cloud Infrastructure & DevOps',
    seoDescription:
      'Cloud infrastructure, AWS architecture, Terraform, CI/CD, observability, and cost-aware platform engineering.',
    nodes: ['Cloud', 'CI', 'Cost', 'Ops'],
    proof: [
      { label: 'platform', value: 'AWS' },
      { label: 'deploys', value: 'CI/CD' },
      { label: 'cost posture', value: 'lean' },
      { label: 'mode', value: 'operate' },
    ],
    outcomes: [
      'Deployment paths that are repeatable, observable, and easy to roll back.',
      'Infrastructure decisions documented in plain English before they become expensive.',
      'Cost visibility before managed services quietly become the largest line item.',
      'Security posture based on least privilege, not dashboard theater.',
    ],
    capabilities: [
      {
        title: 'Platform architecture',
        description:
          'Vercel, AWS, Supabase, queues, background jobs, and storage arranged around the actual product shape.',
      },
      {
        title: 'CI/CD and release systems',
        description:
          'Preview environments, test gates, deployment checks, and clear ownership for production changes.',
      },
      {
        title: 'Cost and observability',
        description:
          'Budgets, dashboards, logs, traces, and alerts that help the team catch drift early.',
      },
    ],
    resources: [
      { label: 'Operate', href: '/services/operate', type: 'Service' },
      { label: 'Stack X-Ray', href: '/services/stack-xray', type: 'Diagnostic' },
      { label: 'Engineering OS', href: '/engineering-os', type: 'Proof' },
    ],
  },
  'enterprise-qa': {
    slug: 'enterprise-qa',
    title: 'Quality systems that ship confidence.',
    eyebrow: 'QA automation / legacy entry',
    description:
      'API, E2E, visual, performance, and reliability testing systems built into the delivery loop so quality is visible before production.',
    seoTitle: 'Enterprise QA Automation',
    seoDescription:
      'QA automation architecture, Playwright testing, API tests, CI quality gates, performance testing, and quality engineering.',
    nodes: ['API', 'E2E', 'Perf', 'Gate'],
    proof: [
      { label: 'surface', value: 'tests' },
      { label: 'signal', value: 'CI' },
      { label: 'risk', value: 'lower' },
      { label: 'mode', value: 'audit' },
    ],
    outcomes: [
      'Critical user paths covered by tests that run where engineers already work.',
      'Flaky tests reduced by clear ownership, retries, and deterministic fixtures.',
      'Quality dashboards that show coverage, failures, and risk without hiding behind vanity metrics.',
      'Release confidence for teams that cannot afford silent regressions.',
    ],
    capabilities: [
      {
        title: 'API and contract testing',
        description:
          'Schema validation, retry behavior, auth boundaries, and regression suites for backend interfaces.',
      },
      {
        title: 'E2E and visual testing',
        description:
          'Playwright paths, visual baselines, viewport coverage, and production-like smoke checks.',
      },
      {
        title: 'Quality gates',
        description:
          'CI checks, release notes, failure triage, and monitoring that close the loop after deploy.',
      },
    ],
    resources: [
      { label: 'Sage Audit', href: '/services/audit', type: 'Service' },
      { label: 'Quality telemetry', href: '/work/quality-telemetry', type: 'Case study' },
      { label: 'Engineering OS', href: '/engineering-os', type: 'Proof' },
    ],
  },
  fintech: {
    slug: 'fintech',
    title: 'Fintech systems that survive audit.',
    eyebrow: 'Fintech / legacy entry',
    description:
      'Money-moving software needs idempotency, reconciliation, audit trails, and boring operational discipline. This page routes fintech buyers into the newer industry and service system.',
    seoTitle: 'Fintech Software Development',
    seoDescription:
      'Fintech software development, Stripe integration, ledgers, reconciliation, audit trails, and compliance-aware engineering.',
    nodes: ['Ledger', 'Stripe', 'Risk', 'Audit'],
    proof: [
      { label: 'domain', value: 'fintech' },
      { label: 'payments', value: 'Stripe' },
      { label: 'posture', value: 'audit' },
      { label: 'route', value: 'fit' },
    ],
    outcomes: [
      'Webhook and payment flows designed for retries, replays, and reconciliation.',
      'Audit trails for state transitions that matter to finance, compliance, and support.',
      'Data boundaries and access controls treated as product requirements.',
      'Clear handoff between engineering work and legal/compliance ownership.',
    ],
    capabilities: [
      {
        title: 'Stripe and billing systems',
        description:
          'Checkout, subscriptions, Connect-style flows, webhook idempotency, refunds, disputes, and reconciliation.',
      },
      {
        title: 'Ledger and audit posture',
        description:
          'Append-only events, state change logs, operational dashboards, and traceable financial records.',
      },
      {
        title: 'Fintech product UX',
        description:
          'Interfaces that expose the right risk, account, and transaction context without overwhelming the user.',
      },
    ],
    resources: [
      { label: 'Fintech industry page', href: '/industries/fintech', type: 'Industry' },
      { label: 'Nexural', href: '/lab/nexural', type: 'Lab proof' },
      { label: 'Stripe Integration Sprint', href: '/services/stripe-integration-sprint', type: 'Service' },
    ],
  },
  'technical-consulting': {
    slug: 'technical-consulting',
    title: 'Technical clarity without the overhead.',
    eyebrow: 'Technical consulting / legacy entry',
    description:
      'Architecture reviews, code audits, build/buy decisions, roadmap shaping, and focused advisory for teams that need senior judgment before they commit budget.',
    seoTitle: 'Technical Consulting & Architecture Reviews',
    seoDescription:
      'Technical consulting for startups and teams: architecture reviews, code audits, build planning, test strategy, and cloud planning.',
    nodes: ['Audit', 'Plan', 'Scope', 'Build'],
    proof: [
      { label: 'entry', value: 'audit' },
      { label: 'proposal', value: '48h' },
      { label: 'mode', value: 'clear' },
      { label: 'route', value: 'next' },
    ],
    outcomes: [
      'A prioritized roadmap instead of an endless backlog.',
      'Architecture decisions explained with tradeoffs and maintenance cost.',
      'Code and process risks surfaced before they become rebuilds.',
      'A scoped next engagement when implementation makes sense.',
    ],
    capabilities: [
      {
        title: 'Architecture review',
        description:
          'Data model, API, auth, deployment, testing, observability, and maintainability reviewed as one system.',
      },
      {
        title: 'Code and process audit',
        description:
          'Quality, velocity, security, and reliability risks translated into fixes your team can sequence.',
      },
      {
        title: 'Technical roadmap',
        description:
          'Build/buy calls, stack decisions, team shape, and realistic sequencing for the next phase.',
      },
    ],
    resources: [
      { label: 'Sage Audit', href: '/services/audit', type: 'Service' },
      { label: 'Capabilities', href: '/capabilities', type: 'Map' },
      { label: 'Book a call', href: '/book', type: 'Next step' },
    ],
  },
  'trading-systems': {
    slug: 'trading-systems',
    title: 'Trading software built by an operator.',
    eyebrow: 'Trading systems / legacy entry',
    description:
      'Signal engines, backtesting, alerting, dashboards, and risk workflows for trading products where domain nuance matters.',
    seoTitle: 'Trading Systems Development',
    seoDescription:
      'Trading systems development: signal engines, backtesting, dashboards, alerts, risk systems, and ML trading infrastructure.',
    nodes: ['Data', 'Signal', 'Risk', 'Alert'],
    proof: [
      { label: 'domain', value: 'markets' },
      { label: 'signals', value: 'ML' },
      { label: 'proof', value: 'live' },
      { label: 'route', value: 'lab' },
    ],
    outcomes: [
      'Signal and alert systems designed around real trading behavior, not generic dashboard patterns.',
      'Backtesting and evaluation flows that name assumptions instead of hiding them.',
      'Risk and portfolio views that make the next action clear.',
      'Engineering discipline around data quality, latency, and operational failure modes.',
    ],
    capabilities: [
      {
        title: 'Signal and data pipelines',
        description:
          'Feature engineering, model evaluation, market data ingestion, and pipeline monitoring.',
      },
      {
        title: 'Backtesting and analytics',
        description:
          'Walk-forward evaluation, slippage assumptions, performance reporting, and explainable metrics.',
      },
      {
        title: 'Trading product UI',
        description:
          'Dashboards, alerts, risk views, and control surfaces built for people making fast decisions.',
      },
    ],
    resources: [
      { label: 'AlphaStream', href: '/lab/alphastream', type: 'Lab proof' },
      { label: 'Nexural', href: '/lab/nexural', type: 'Lab proof' },
      { label: 'AI Agent Development', href: '/services/ai-agent-development', type: 'Service' },
    ],
  },
}

export function getLegacyServiceAlias(slug: string) {
  return legacyServiceAliases[slug]
}
