export type Prototype = {
  slug: string
  name: string
  type: string
  status: string
  category: 'Acquisition' | 'Local Services' | 'Healthcare' | 'Professional Services' | 'AI Operations'
  proofLevel: 'Verified local' | 'Needs bespoke pass' | 'Design source only'
  packageTier: string
  buyer: string
  outcome: string
  headline: string
  narrative: string
  metrics: Array<{ label: string; value: string; note: string }>
  workflow: Array<{ step: string; detail: string }>
  screens: string[]
  personalization: string[]
}

export const prototypes: Prototype[] = [
  {
    slug: 'revenue-os',
    name: 'Revenue OS',
    type: 'AI client acquisition system',
    status: 'Flagship interactive build',
    category: 'Acquisition',
    proofLevel: 'Verified local',
    packageTier: 'Revenue command center',
    buyer: 'B2B operators, agencies, service businesses',
    outcome: 'Find qualified accounts, match proof assets, approve outbound, classify replies, and learn from every sprint.',
    headline: 'A revenue command center that turns research into personalized outbound.',
    narrative:
      'Revenue OS connects opportunity discovery, AI account research, prototype matching, controlled outreach, reply classification, and campaign learning in one workflow.',
    metrics: [
      { label: 'Pipeline surfaced', value: '$87k', note: '+18% sprint lift' },
      { label: 'Qualified accounts', value: '42', note: '6 ready today' },
      { label: 'Demo clicks', value: '31%', note: '+9.4% vs generic links' },
      { label: 'Booked calls', value: '7', note: 'current sprint' },
    ],
    workflow: [
      { step: 'Discover', detail: 'Score accounts by visible digital gaps, urgency, and budget likelihood.' },
      { step: 'Research', detail: 'Generate a concise business brief, offer angle, and compliance risk note.' },
      { step: 'Personalize', detail: 'Match a reusable prototype and create a private demo packet.' },
      { step: 'Convert', detail: 'Track clicks, replies, objections, meetings, and close reasons.' },
    ],
    screens: ['Command center', 'Opportunity queue', 'Account brief', 'Prototype match', 'Outreach composer', 'Reply loop'],
    personalization: ['Business name', 'vertical', 'website gap', 'recommended prototype', 'private demo URL'],
  },
  {
    slug: 'contractor-quote-engine',
    name: 'Contractor Quote Engine',
    type: 'Local service funnel',
    status: 'Warehouse prototype',
    category: 'Local Services',
    proofLevel: 'Verified local',
    packageTier: 'Conversion funnel build',
    buyer: 'Roofing, HVAC, plumbing, electrical, landscaping',
    outcome: 'Turn high-intent visitors into quote requests with proof, urgency, routing, and fast follow-up.',
    headline: 'A quote funnel for service businesses that cannot afford missed calls.',
    narrative:
      'This prototype replaces a generic services page with a conversion path built around emergency intent, trust proof, service-area pages, and quote routing.',
    metrics: [
      { label: 'Quote intent', value: '4.8x', note: 'clearer CTA density' },
      { label: 'Response SLA', value: '12m', note: 'SMS handoff target' },
      { label: 'Proof blocks', value: '9', note: 'before/after assets' },
      { label: 'Service pages', value: '14', note: 'local SEO ready' },
    ],
    workflow: [
      { step: 'Diagnose', detail: 'Find where the current site loses quote intent.' },
      { step: 'Route', detail: 'Send emergency, repair, and replacement visitors to distinct flows.' },
      { step: 'Prove', detail: 'Show reviews, jobs, before/after proof, and response expectations.' },
      { step: 'Follow up', detail: 'Trigger SMS/email follow-up after quote request.' },
    ],
    screens: ['Hero quote path', 'Service selector', 'Proof gallery', 'Estimate form', 'SMS handoff'],
    personalization: ['Trade', 'service area', 'storm trigger', 'reviews', 'before/after proof'],
  },
  {
    slug: 'med-spa-consultation-funnel',
    name: 'Med Spa Consultation Funnel',
    type: 'Health and beauty funnel',
    status: 'Warehouse prototype',
    category: 'Healthcare',
    proofLevel: 'Verified local',
    packageTier: 'Consultation funnel build',
    buyer: 'Med spas, salons, aesthetic clinics, wellness studios',
    outcome: 'Move treatment interest into compliant consultation bookings and nurture sequences.',
    headline: 'A premium consultation path for high-trust aesthetic services.',
    narrative:
      'This prototype turns treatment curiosity into booked consults with education, package framing, compliant copy, and follow-up automation.',
    metrics: [
      { label: 'Consult paths', value: '6', note: 'treatment-specific' },
      { label: 'Follow-ups', value: '5', note: 'nurture sequence' },
      { label: 'Compliance flags', value: '3', note: 'claim checks' },
      { label: 'Booking lift', value: '+22%', note: 'modeled target' },
    ],
    workflow: [
      { step: 'Educate', detail: 'Show treatment options without risky outcome claims.' },
      { step: 'Qualify', detail: 'Route visitors by concern, readiness, and booking intent.' },
      { step: 'Book', detail: 'Make consultation booking the obvious next step.' },
      { step: 'Retain', detail: 'Trigger post-consult and seasonal follow-up.' },
    ],
    screens: ['Treatment finder', 'Consult booking', 'Package explainer', 'Before/after-safe proof', 'Follow-up dashboard'],
    personalization: ['Treatment menu', 'brand tone', 'location', 'provider trust proof', 'compliance guardrails'],
  },
  {
    slug: 'law-firm-intake-system',
    name: 'Law Firm Intake System',
    type: 'Professional services funnel',
    status: 'Warehouse prototype',
    category: 'Professional Services',
    proofLevel: 'Verified local',
    packageTier: 'Trust and intake system',
    buyer: 'Boutique law firms and high-ticket professional services',
    outcome: 'Convert qualified visitors into consultations with trust proof, practice-area routing, and intake control.',
    headline: 'A consultation funnel for serious service firms where trust comes first.',
    narrative:
      'This prototype clarifies who the firm helps, routes visitors by matter type, captures urgency, and preserves professional tone.',
    metrics: [
      { label: 'Matter routes', value: '8', note: 'practice areas' },
      { label: 'Intake fields', value: '11', note: 'qualified only' },
      { label: 'Trust proof', value: '12', note: 'case-safe blocks' },
      { label: 'Response target', value: '1d', note: 'expectation set' },
    ],
    workflow: [
      { step: 'Route', detail: 'Match visitors to the right practice area and intake path.' },
      { step: 'Qualify', detail: 'Collect urgency and fit without giving legal advice.' },
      { step: 'Reassure', detail: 'Show attorney credibility, process, and response expectations.' },
      { step: 'Schedule', detail: 'Move qualified prospects to consultation booking.' },
    ],
    screens: ['Practice router', 'Matter intake', 'Trust page', 'Consult scheduler', 'Follow-up ledger'],
    personalization: ['Practice areas', 'jurisdiction', 'attorney proof', 'response SLA', 'risk language'],
  },
  {
    slug: 'ai-support-agent-dashboard',
    name: 'AI Support Agent Dashboard',
    type: 'AI operations dashboard',
    status: 'Warehouse prototype',
    category: 'AI Operations',
    proofLevel: 'Verified local',
    packageTier: 'AI operations cockpit',
    buyer: 'SaaS, ecommerce, support-heavy service teams',
    outcome: 'Deflect repetitive support, escalate risky cases, and measure resolution quality.',
    headline: 'An AI support cockpit that shows exactly what the assistant handled and why.',
    narrative:
      'This prototype demonstrates triage, retrieval-backed answers, human escalation, quality scoring, and customer outcome reporting.',
    metrics: [
      { label: 'Deflection', value: '38%', note: 'safe automation' },
      { label: 'Escalations', value: '17', note: 'human-reviewed' },
      { label: 'Avg handle', value: '-31%', note: 'modeled reduction' },
      { label: 'QA score', value: '94', note: 'policy aligned' },
    ],
    workflow: [
      { step: 'Triage', detail: 'Classify incoming requests by intent, urgency, and risk.' },
      { step: 'Retrieve', detail: 'Use approved knowledge to draft grounded responses.' },
      { step: 'Escalate', detail: 'Route uncertain or high-risk cases to a human.' },
      { step: 'Measure', detail: 'Track deflection, satisfaction, and policy quality.' },
    ],
    screens: ['Support inbox', 'Knowledge match', 'Draft answer', 'Escalation queue', 'Quality dashboard'],
    personalization: ['Support categories', 'knowledge base', 'risk policy', 'tone', 'escalation rules'],
  },
]

export function getPrototype(slug: string) {
  return prototypes.find((prototype) => prototype.slug === slug)
}
