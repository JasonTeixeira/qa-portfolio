/**
 * Per-flagship visual configuration: architecture diagram, dashboard mockup,
 * and cost estimator settings. Keyed by flagship tier slug.
 *
 * Adding a new flagship offer? Add an entry here and the page template will
 * pick up the visuals automatically.
 */

import type { ArchNode, ArchConnection } from '@/components/agents/agent-architecture-diagram'
import type {
  DashboardActivity,
  DashboardKPI,
} from '@/components/agents/agent-dashboard-mockup'

export type FlagshipVisuals = {
  accent: string
  architecture: {
    title: string
    subtitle: string
    nodes: ArchNode[]
    connections: ArchConnection[]
  } | null
  dashboard: {
    title: string
    subtitle: string
    kpis: DashboardKPI[]
    activity: DashboardActivity[]
    evalPct?: number
    spendUsed?: string
    spendCap?: string
    pendingApprovals?: number
  } | null
  costEstimator: {
    unitLabel: string
    min: number
    max: number
    step: number
    defaultValue: number
    costPerUnit: number
    baseCost: number
    title?: string
    subtitle?: string
  } | null
  /** Use cases shown as a grid */
  useCases: { title: string; description: string }[]
  /** Story-told positioning copy under the hero */
  story: {
    eyebrow: string
    headline: string
    body: string
  } | null
}

export const flagshipVisuals: Record<string, FlagshipVisuals> = {
  // ─────────────────────────────────────────────────────────────────────
  'ai-implementation-consulting': {
    accent: '#22D3EE',
    story: {
      eyebrow: 'Two weeks. One opinion. Zero fluff.',
      headline: 'Most AI consulting hands you a deck. We hand you a build plan.',
      body: 'You don\u2019t need another vendor pitching their stack. You need a clear-eyed map of where AI fits in YOUR business \u2014 and where it absolutely does not. Two weeks of process mapping, ROI modeling, and tool audit. You walk away knowing what to build, what to buy, and what to skip. If you hire us to build, the entire fee credits toward the engagement.',
    },
    architecture: {
      title: 'How a 2-week consult flows',
      subtitle: 'From your messiest workflows to a ranked, costed build plan.',
      nodes: [
        { id: 'workflows', label: 'Your workflows', sub: 'calls · sheets · SOPs', col: 0, row: 0, variant: 'input' },
        { id: 'pain', label: 'Pain points', sub: 'time · errors · cost', col: 0, row: 1, variant: 'input' },
        { id: 'tools', label: 'Tool audit', sub: 'what you have', col: 0, row: 2, variant: 'input' },
        { id: 'process', label: 'Process map', sub: 'where AI fits', col: 1, row: 0, variant: 'core' },
        { id: 'roi', label: 'ROI model', sub: 'time · $ · risk', col: 1, row: 1, variant: 'core' },
        { id: 'cost', label: 'Cost forecast', sub: 'build + run / mo', col: 1, row: 2, variant: 'core' },
        { id: 'plan', label: 'Build plan', sub: '3 ranked opps', col: 2, row: 0, variant: 'output' },
        { id: 'sequence', label: 'Sequence', sub: 'what to ship first', col: 2, row: 1, variant: 'output' },
        { id: 'walkthrough', label: 'Loom + review', sub: '60-min call', col: 2, row: 2, variant: 'output' },
      ],
      connections: [
        { from: 'workflows', to: 'process' },
        { from: 'pain', to: 'roi' },
        { from: 'tools', to: 'cost' },
        { from: 'process', to: 'plan' },
        { from: 'roi', to: 'plan' },
        { from: 'cost', to: 'sequence' },
        { from: 'process', to: 'sequence', dashed: true },
        { from: 'plan', to: 'walkthrough' },
        { from: 'sequence', to: 'walkthrough' },
      ],
    },
    dashboard: null,
    costEstimator: null,
    useCases: [
      { title: 'Operations-heavy SMB', description: 'Quotes, scheduling, vendor coordination eating 30+ hours/week of manual work.' },
      { title: 'Customer-facing teams', description: 'Support tickets and follow-ups where 80% of replies are template-shaped.' },
      { title: 'Document-heavy workflows', description: 'Contracts, invoices, intake forms \u2014 anything that gets re-typed into a system.' },
      { title: 'Data already exists, nobody reads it', description: 'CRM, sheets, and inboxes loaded with signal that never reaches a decision.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  'ai-agent-development': {
    accent: '#22D3EE',
    story: {
      eyebrow: 'Custom-built. Not off-the-shelf.',
      headline: 'A trained agent that knows your business \u2014 working 24/7 with humans in the loop.',
      body: 'We build AI agents the way real software gets built: scoped to one job, trained on your SOPs, wired to the tools you already use, with an eval harness that proves it works. Cloud-hosted by default. Hard monthly spend cap. Approval queue for anything that touches money or customers. You get a dashboard you can actually read \u2014 and an agent that gets better, not flakier.',
    },
    architecture: {
      title: 'AI Agent architecture',
      subtitle: 'Signal in \u2192 grounded reasoning \u2192 tool use \u2192 human-approved action.',
      nodes: [
        { id: 'email', label: 'Email / Slack', sub: 'incoming signal', col: 0, row: 0, variant: 'input' },
        { id: 'forms', label: 'Forms / CRM', sub: 'structured data', col: 0, row: 1, variant: 'input' },
        { id: 'sched', label: 'Schedule', sub: 'cron triggers', col: 0, row: 2, variant: 'input' },
        { id: 'agent', label: 'Sage Agent', sub: 'LangGraph + LLM', col: 1, row: 1, variant: 'core' },
        { id: 'kb', label: 'Knowledge base', sub: 'your SOPs · vector DB', col: 1, row: 0, variant: 'tool' },
        { id: 'tools', label: 'Tool calls', sub: 'CRM · email · stripe', col: 2, row: 0, variant: 'tool' },
        { id: 'guard', label: 'Approval queue', sub: '$ + customers', col: 2, row: 1, variant: 'guard' },
        { id: 'eval', label: 'Eval harness', sub: 'pass / fail tests', col: 2, row: 2, variant: 'tool' },
        { id: 'dash', label: 'Dashboard', sub: 'you see everything', col: 3, row: 1, variant: 'output' },
      ],
      connections: [
        { from: 'email', to: 'agent' },
        { from: 'forms', to: 'agent' },
        { from: 'sched', to: 'agent' },
        { from: 'kb', to: 'agent', label: 'context' },
        { from: 'agent', to: 'tools' },
        { from: 'agent', to: 'guard', label: 'risky action' },
        { from: 'agent', to: 'eval', dashed: true },
        { from: 'tools', to: 'dash' },
        { from: 'guard', to: 'dash' },
        { from: 'eval', to: 'dash', dashed: true },
      ],
    },
    dashboard: {
      title: 'Sage Agent \u2014 Operations',
      subtitle: 'Real layout from a production deployment (anonymized).',
      kpis: [
        { label: 'Tasks handled / 24h', value: '847', delta: '+12% vs last week', good: true },
        { label: 'Avg resolution', value: '38s', delta: '\u22126s', good: true },
        { label: 'Hands-off rate', value: '91%', delta: '+3pp', good: true },
        { label: 'Hours saved / mo', value: '127', delta: '\u2248 $4.8k labor', good: true },
      ],
      activity: [
        { t: '12s', text: 'Quote drafted for ACME Corp \u2014 $4,250 \u2014 sent to approval queue', status: 'pending' },
        { t: '48s', text: 'Customer follow-up sent: 6 leads · day-3 nurture', status: 'ok' },
        { t: '2m', text: 'Vendor invoice categorized & posted to QuickBooks (auto)', status: 'ok' },
        { t: '4m', text: 'Refund $312 \u2014 over $250 threshold \u2014 awaiting human review', status: 'warn' },
        { t: '6m', text: 'Scheduling: rescheduled 2 appointments after weather alert', status: 'ok' },
        { t: '8m', text: 'Eval run: 42/44 passed (2 edge cases flagged for review)', status: 'ok' },
      ],
      evalPct: 95,
      spendUsed: '$182',
      spendCap: '$500',
      pendingApprovals: 3,
    },
    costEstimator: {
      unitLabel: 'tasks / mo',
      min: 500,
      max: 25000,
      step: 500,
      defaultValue: 5000,
      costPerUnit: 0.04,
      baseCost: 95,
      title: 'Forecast your monthly run cost',
      subtitle: 'Drag the slider. Real cost is capped in production \u2014 you set the ceiling.',
    },
    useCases: [
      { title: 'Quote & proposal generation', description: 'Inbound request \u2192 trained on your pricing \u2192 drafts quote \u2192 you approve \u2192 sends.' },
      { title: 'Customer follow-up', description: 'Day-3, day-7, day-30 nurture sequences personalized to each conversation.' },
      { title: 'Invoice + expense categorization', description: 'Auto-codes and posts to QuickBooks/Xero. Flags anything weird for human review.' },
      { title: 'Scheduling & coordination', description: 'Calendar-aware booking, rescheduling, and confirmation across your team and clients.' },
      { title: 'Document review & extraction', description: 'Contracts, intake forms, vendor docs \u2014 pulls fields, flags risk, files cleanly.' },
      { title: 'Internal Q&A on your SOPs', description: 'Slack / Teams bot trained on your playbooks. Cites source. Says "I don\u2019t know" honestly.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  'ai-voice-agent': {
    accent: '#A78BFA',
    story: {
      eyebrow: 'Phones that pick up. 24/7. Without sounding like a robot.',
      headline: 'A voice agent that handles the calls you keep missing.',
      body: 'Inbound calls are still the #1 way customers reach SMBs \u2014 and the #1 thing falling through the cracks. We deploy a voice agent that answers, qualifies, books, and hands off cleanly to humans. TCPA-compliant, identifies as AI when asked, never makes outbound cold calls. Wired to your calendar and CRM so every conversation lands somewhere useful.',
    },
    architecture: {
      title: 'Voice Agent flow',
      subtitle: 'Caller dials \u2192 voice in/out \u2192 reasoning \u2192 your CRM and calendar.',
      nodes: [
        { id: 'caller', label: 'Caller', sub: 'inbound only', col: 0, row: 1, variant: 'input' },
        { id: 'twilio', label: 'Twilio voice', sub: 'speech I/O', col: 1, row: 1, variant: 'tool' },
        { id: 'agent', label: 'Voice Agent', sub: 'LLM + persona', col: 2, row: 1, variant: 'core' },
        { id: 'kb', label: 'Knowledge', sub: 'FAQs · pricing', col: 2, row: 0, variant: 'tool' },
        { id: 'guard', label: 'Identifies as AI', sub: 'on request', col: 2, row: 2, variant: 'guard' },
        { id: 'cal', label: 'Calendar', sub: 'book / reschedule', col: 3, row: 0, variant: 'output' },
        { id: 'crm', label: 'CRM', sub: 'log + tag lead', col: 3, row: 1, variant: 'output' },
        { id: 'human', label: 'Human handoff', sub: 'warm transfer', col: 3, row: 2, variant: 'output' },
      ],
      connections: [
        { from: 'caller', to: 'twilio' },
        { from: 'twilio', to: 'agent' },
        { from: 'kb', to: 'agent', label: 'context' },
        { from: 'agent', to: 'guard', dashed: true },
        { from: 'agent', to: 'cal' },
        { from: 'agent', to: 'crm' },
        { from: 'agent', to: 'human', label: 'when asked' },
      ],
    },
    dashboard: {
      title: 'Voice Agent \u2014 Reception',
      subtitle: 'Live calls + transcripts + booking outcomes.',
      kpis: [
        { label: 'Calls / 24h', value: '143', delta: '+22% vs last week', good: true },
        { label: 'Answer rate', value: '100%', delta: 'no missed calls', good: true },
        { label: 'Booked', value: '37', delta: '26% conversion', good: true },
        { label: 'Avg call length', value: '2m 14s', delta: '\u221218s', good: true },
      ],
      activity: [
        { t: '8s', text: 'Caller booked appt for Thu 2pm \u2014 logged to CRM as warm lead', status: 'ok' },
        { t: '1m', text: 'Caller asked "are you a real person?" \u2014 agent identified as AI', status: 'ok' },
        { t: '3m', text: 'Pricing question \u2014 agent quoted from approved FAQ \u2014 lead captured', status: 'ok' },
        { t: '5m', text: 'Complex billing issue \u2014 transferred to Sarah (warm handoff)', status: 'warn' },
        { t: '7m', text: 'Spam call detected and dropped \u2014 no log entry', status: 'pending' },
        { t: '9m', text: 'After-hours appt request \u2014 booked + confirmation SMS sent', status: 'ok' },
      ],
      evalPct: 92,
      spendUsed: '$67',
      spendCap: '$300',
      pendingApprovals: 0,
    },
    costEstimator: {
      unitLabel: 'minutes / mo',
      min: 200,
      max: 10000,
      step: 100,
      defaultValue: 2000,
      costPerUnit: 0.09,
      baseCost: 65,
      title: 'Forecast your monthly voice cost',
      subtitle: 'Includes Twilio carrier fees + LLM. Pay your providers directly with BYOK.',
    },
    useCases: [
      { title: 'After-hours reception', description: 'Books the appointment, captures the lead, sends a confirmation \u2014 while you sleep.' },
      { title: 'Appointment scheduling', description: 'Two-way calendar sync. Reschedules, cancels, and reminds without staff time.' },
      { title: 'FAQ deflection', description: 'Hours, pricing, location, scope \u2014 answered consistently every single time.' },
      { title: 'Lead qualification', description: 'Asks the 3-5 questions you\u2019d ask, scores the lead, routes hot ones to a human.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  'ai-lead-engine': {
    accent: '#F59E0B',
    story: {
      eyebrow: 'Approval-gated outreach. Not auto-spam.',
      headline: 'Find the right buyers, learn what they care about, write outreach you\u2019d be proud to send.',
      body: 'Most "AI lead gen" is just a faster spam cannon. We build something different: a pipeline that ingests your ICP, finds matching companies and people, enriches with public-only signal, scores fit, and drafts outreach that goes through YOUR approval queue before a single message is sent. Nothing leaves the system without you saying yes. Every send is logged, every reply is routed, every metric is honest.',
    },
    architecture: {
      title: 'Lead Engine pipeline',
      subtitle: 'Signal \u2192 enrichment \u2192 scoring \u2192 your approval \u2192 send.',
      nodes: [
        { id: 'icp', label: 'Your ICP', sub: 'industry · size · role', col: 0, row: 0, variant: 'input' },
        { id: 'signals', label: 'Public signals', sub: 'jobs · funding · news', col: 0, row: 1, variant: 'input' },
        { id: 'crm', label: 'Your CRM', sub: 'past wins/losses', col: 0, row: 2, variant: 'input' },
        { id: 'enrich', label: 'Enrichment', sub: 'public sources only', col: 1, row: 0, variant: 'core' },
        { id: 'score', label: 'Fit score', sub: 'tuned to your wins', col: 1, row: 1, variant: 'core' },
        { id: 'draft', label: 'Outreach draft', sub: 'cited reasons', col: 1, row: 2, variant: 'core' },
        { id: 'queue', label: 'Approval queue', sub: 'you say yes', col: 2, row: 1, variant: 'guard' },
        { id: 'send', label: 'Send', sub: 'email · LinkedIn', col: 3, row: 0, variant: 'output' },
        { id: 'reply', label: 'Reply routing', sub: 'hot \u2192 human', col: 3, row: 1, variant: 'output' },
        { id: 'dash', label: 'Dashboard', sub: 'metrics · retros', col: 3, row: 2, variant: 'output' },
      ],
      connections: [
        { from: 'icp', to: 'enrich' },
        { from: 'signals', to: 'enrich' },
        { from: 'crm', to: 'score', label: 'training' },
        { from: 'enrich', to: 'score' },
        { from: 'score', to: 'draft' },
        { from: 'draft', to: 'queue' },
        { from: 'queue', to: 'send', label: 'approved' },
        { from: 'send', to: 'reply' },
        { from: 'reply', to: 'dash' },
        { from: 'queue', to: 'dash', dashed: true },
      ],
    },
    dashboard: {
      title: 'Lead Engine \u2014 Pipeline',
      subtitle: 'Your weekly pipeline review, but always live.',
      kpis: [
        { label: 'Qualified leads / wk', value: '124', delta: '+18 vs last wk', good: true },
        { label: 'Approval rate', value: '78%', delta: 'you trust the drafts', good: true },
        { label: 'Reply rate', value: '14.2%', delta: '+3.1pp', good: true },
        { label: 'Booked meetings', value: '11', delta: 'this week', good: true },
      ],
      activity: [
        { t: '5m', text: '12 new outreach drafts ready for your review (priority: Acme, Vertex, Lume)', status: 'pending' },
        { t: '14m', text: 'Reply from Lume CFO \u2014 marked HOT, routed to Sage', status: 'warn' },
        { t: '32m', text: 'Enrichment found 47 new ICP matches from last week\u2019s funding events', status: 'ok' },
        { t: '1h', text: 'Send batch: 8 messages sent (you approved at 9:14am)', status: 'ok' },
        { t: '2h', text: 'Score model recalibrated on last 30 days of wins/losses', status: 'ok' },
        { t: '3h', text: 'Bounce: 2 invalid emails removed from queue automatically', status: 'pending' },
      ],
      evalPct: 88,
      spendUsed: '$214',
      spendCap: '$800',
      pendingApprovals: 12,
    },
    costEstimator: {
      unitLabel: 'leads / mo',
      min: 200,
      max: 10000,
      step: 100,
      defaultValue: 1500,
      costPerUnit: 0.18,
      baseCost: 145,
      title: 'Forecast your monthly lead cost',
      subtitle: 'Includes enrichment + scoring + drafting. Email/LinkedIn sending stays in your tools.',
    },
    useCases: [
      { title: 'B2B services & consulting', description: 'Find decision-makers at companies showing buying signals \u2014 not the whole TAM.' },
      { title: 'Vertical SaaS', description: 'Trigger-based outreach when your ideal customer hires for a role or hits a milestone.' },
      { title: 'Agency new business', description: 'Surface accounts whose stack or hiring patterns match your bread and butter.' },
      { title: 'Account-based plays', description: 'Target list of 50? Get rich profiles, custom angles, and approval-gated touches.' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  'agent-operations-retainer': {
    accent: '#34D399',
    story: {
      eyebrow: 'Agents drift. We catch it before your customers do.',
      headline: 'Your agent has an on-call team. That team is us.',
      body: 'AI agents fail in slow, quiet ways: a vendor changes a tool API, a model gets updated, eval scores creep down, costs creep up, edge cases stack up. Without monitoring you find out from a customer. We watch eval pass rates, spend trends, and the activity log every week. We tune prompts, add test cases, ship guardrails, and write a monthly retro you actually want to read. Cancel any month \u2014 no annual lock-in.',
    },
    architecture: {
      title: 'What we monitor every week',
      subtitle: 'A real ops loop, not a dashboard you forget about.',
      nodes: [
        { id: 'evals', label: 'Eval pass rate', sub: 'trend · regressions', col: 0, row: 0, variant: 'input' },
        { id: 'spend', label: 'Spend trend', sub: '$ / task drift', col: 0, row: 1, variant: 'input' },
        { id: 'errors', label: 'Error log', sub: 'tool failures', col: 0, row: 2, variant: 'input' },
        { id: 'review', label: 'Weekly review', sub: 'us, with you', col: 1, row: 1, variant: 'core' },
        { id: 'tune', label: 'Prompt tune', sub: 'prove with evals', col: 2, row: 0, variant: 'output' },
        { id: 'tests', label: 'New test cases', sub: 'edge cases captured', col: 2, row: 1, variant: 'output' },
        { id: 'retro', label: 'Monthly retro', sub: 'what changed · why', col: 2, row: 2, variant: 'output' },
      ],
      connections: [
        { from: 'evals', to: 'review' },
        { from: 'spend', to: 'review' },
        { from: 'errors', to: 'review' },
        { from: 'review', to: 'tune' },
        { from: 'review', to: 'tests' },
        { from: 'review', to: 'retro' },
        { from: 'tests', to: 'evals', dashed: true, label: 'feeds back' },
      ],
    },
    dashboard: {
      title: 'Agent Ops \u2014 This week',
      subtitle: 'Sample retainer report. You get this every Monday.',
      kpis: [
        { label: 'Eval pass rate', value: '96%', delta: '+1pp vs last wk', good: true },
        { label: 'Spend / task', value: '$0.041', delta: '\u22128%', good: true },
        { label: 'Tool failures', value: '4', delta: '3 fixed', good: true },
        { label: 'New evals added', value: '+7', delta: 'edge cases', good: true },
      ],
      activity: [
        { t: 'Mon', text: 'Tuned quote-drafting prompt: cut hallucinated SKUs from 3% to 0% in evals', status: 'ok' },
        { t: 'Tue', text: 'Added 4 test cases from this week\u2019s approval-queue rejections', status: 'ok' },
        { t: 'Wed', text: 'Anthropic API change \u2014 updated client lib, no agent downtime', status: 'ok' },
        { t: 'Thu', text: 'Spend cap raised $500 \u2192 $750 (you approved) \u2014 reflects 30% volume growth', status: 'pending' },
        { t: 'Fri', text: 'Sent monthly retro: 3 wins, 1 close call, 2 changes for next month', status: 'ok' },
      ],
      evalPct: 96,
      spendUsed: '$612',
      spendCap: '$750',
      pendingApprovals: 1,
    },
    costEstimator: null,
    useCases: [
      { title: 'You shipped the agent, now what?', description: 'Production AI is a moving target. Models update, APIs change, edge cases stack up.' },
      { title: 'No internal AI team yet', description: 'Buy ops capacity by the month instead of hiring a $180k role for a part-time job.' },
      { title: 'Multi-agent stack', description: 'Voice + ops + lead engine all running? Coordinated tuning so they don\u2019t fight each other.' },
      { title: 'Compliance-sensitive industries', description: 'Documented changes, eval evidence, and audit-ready retros every month.' },
    ],
  },
}
