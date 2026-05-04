// AI Readiness Score — 10-question diagnostic
// Scores org/team on data, infra, process, talent, and ROI dimensions.

export type Dimension = 'data' | 'infra' | 'process' | 'talent' | 'roi'

export type Question = {
  id: string
  dimension: Dimension
  prompt: string
  options: { label: string; points: number }[]
}

export const questions: Question[] = [
  {
    id: 'q1-data-quality',
    dimension: 'data',
    prompt: 'How would you describe the state of your operational data today?',
    options: [
      { label: 'Scattered across tools, no single source of truth', points: 0 },
      { label: 'Centralized but inconsistent (duplicates, stale fields)', points: 1 },
      { label: 'Clean enough for reporting, untested for AI use', points: 2 },
      { label: 'Versioned, documented, query-ready for agents', points: 3 },
    ],
  },
  {
    id: 'q2-data-access',
    dimension: 'data',
    prompt: 'Can a developer pull customer or product data via API today?',
    options: [
      { label: 'Not without IT involvement and a ticket', points: 0 },
      { label: 'Some APIs exist, undocumented', points: 1 },
      { label: 'Most data is queryable with auth tokens', points: 2 },
      { label: 'Full read/write API coverage with role-based access', points: 3 },
    ],
  },
  {
    id: 'q3-infra-cloud',
    dimension: 'infra',
    prompt: 'Where does your application infrastructure live?',
    options: [
      { label: 'On-prem or shared hosting, infrequent deploys', points: 0 },
      { label: 'Mixed cloud + on-prem, manual deploys', points: 1 },
      { label: 'Single cloud (AWS / GCP / Vercel) with CI', points: 2 },
      { label: 'Cloud-native, IaC-managed, multi-env, observability in place', points: 3 },
    ],
  },
  {
    id: 'q4-infra-deploy',
    dimension: 'infra',
    prompt: 'How fast can a small change reach production?',
    options: [
      { label: 'Weeks — release windows and approval boards', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'Same day if it passes review', points: 2 },
      { label: 'Minutes — trunk-based deploys, feature flags', points: 3 },
    ],
  },
  {
    id: 'q5-process-docs',
    dimension: 'process',
    prompt: 'How is institutional knowledge captured?',
    options: [
      { label: 'Mostly in heads / Slack history', points: 0 },
      { label: 'Wikis exist but go stale fast', points: 1 },
      { label: 'Maintained docs for top workflows', points: 2 },
      { label: 'Versioned, indexed, AI-retrievable knowledge base', points: 3 },
    ],
  },
  {
    id: 'q6-process-evals',
    dimension: 'process',
    prompt: 'When something AI-related ships, how do you measure if it works?',
    options: [
      { label: 'Vibes — someone tries it and gives a thumbs up', points: 0 },
      { label: 'Manual spot-checks on a small sample', points: 1 },
      { label: 'A/B tests or usage metrics', points: 2 },
      { label: 'Automated evals + cost/latency dashboards before rollout', points: 3 },
    ],
  },
  {
    id: 'q7-talent',
    dimension: 'talent',
    prompt: 'Who on your team is comfortable shipping production AI features?',
    options: [
      { label: 'Nobody yet', points: 0 },
      { label: 'One or two engineers experimenting on the side', points: 1 },
      { label: 'A small group with one production deployment', points: 2 },
      { label: 'Cross-functional team, multiple shipped features, on-call rotation', points: 3 },
    ],
  },
  {
    id: 'q8-talent-vendor',
    dimension: 'talent',
    prompt: 'Have you worked with an external AI consultancy or contractor before?',
    options: [
      { label: 'Never — not sure what to ask for', points: 0 },
      { label: 'One short engagement, mixed results', points: 1 },
      { label: 'Yes, ongoing relationship', points: 2 },
      { label: 'Yes, we know how to scope and manage them', points: 3 },
    ],
  },
  {
    id: 'q9-roi-budget',
    dimension: 'roi',
    prompt: 'What budget have you set aside for AI / automation in the next 6 months?',
    options: [
      { label: 'No budget yet', points: 0 },
      { label: 'Under $10k for experiments', points: 1 },
      { label: '$10k – $50k', points: 2 },
      { label: '$50k+ committed across multiple initiatives', points: 3 },
    ],
  },
  {
    id: 'q10-roi-target',
    dimension: 'roi',
    prompt: 'Do you have a specific business outcome you want AI to move?',
    options: [
      { label: 'Not really — exploring possibilities', points: 0 },
      { label: 'A general theme (efficiency, cost, growth)', points: 1 },
      { label: 'A named metric and a hypothesis', points: 2 },
      { label: 'Named metric, baseline, target, and owner', points: 3 },
    ],
  },
]

export const dimensionLabels: Record<Dimension, string> = {
  data: 'Data foundation',
  infra: 'Infrastructure & shipping',
  process: 'Process & evaluation',
  talent: 'Talent & vendors',
  roi: 'ROI clarity',
}

export const maxScore = questions.length * 3 // 30
