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
  visual?: {
    theme: 'healthcare' | 'legal' | 'support'
    eyebrow: string
    headline: string
    lede: string
    inputLabel: string
    outputLabel: string
    inputs: string[]
    outputs: string[]
    core: string
    result: string
  }
  demo?: {
    primaryCta: string
    proofStatus: string[]
    steps: Array<{
      label: string
      before: string
      system: string
      result: string
      buyerAction: string
    }>
  }
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
    headline: 'Turn treatment interest into booked consultations.',
    narrative:
      'A visual med spa funnel that helps visitors choose the right treatment path, understand the consult, and book without risky claims or generic beauty-site copy.',
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
    visual: {
      theme: 'healthcare',
      eyebrow: 'Visual consult path',
      headline: 'A treatment visitor should know the next safe step in seconds.',
      lede: 'The page turns scattered beauty interest into a guided consultation path without making risky medical claims.',
      inputLabel: 'Visitor intent',
      outputLabel: 'Booked consult path',
      inputs: ['Skin concern', 'Injectables interest', 'Membership question', 'Price hesitation'],
      outputs: ['Treatment finder', 'Provider trust', 'Compliant consult', 'Nurture follow-up'],
      core: 'Consult router',
      result: 'Visitor sees the right path, understands the consult, and books when ready.',
    },
    demo: {
      primaryCta: 'Book consultation',
      proofStatus: ['Route screenshot captured', 'Accessibility checked', 'Mobile layout checked'],
      steps: [
        {
          label: 'Choose concern',
          before: 'The visitor sees a treatment menu and has to guess what fits.',
          system: 'The funnel asks for concern, readiness, and appointment intent without promising a result.',
          result: 'The visitor lands on the safest consult path.',
          buyerAction: 'Start treatment finder',
        },
        {
          label: 'Match treatment path',
          before: 'Generic pages mix education, pricing, and before/after content.',
          system: 'The system separates education, provider trust, pricing expectations, and consult next step.',
          result: 'The visitor understands what happens before booking.',
          buyerAction: 'View safe consult path',
        },
        {
          label: 'Book safely',
          before: 'Booking is buried after long copy and risky claims.',
          system: 'The CTA stays focused on consultation, eligibility, and provider review.',
          result: 'The clinic gets a cleaner consult request.',
          buyerAction: 'Reserve consult slot',
        },
        {
          label: 'Nurture follow-up',
          before: 'Visitors who hesitate disappear after the first visit.',
          system: 'The follow-up sequence routes by interest, safety notes, and seasonal offer.',
          result: 'Warm leads keep moving without aggressive claims.',
          buyerAction: 'Send nurture sequence',
        },
      ],
    },
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
    headline: 'Turn serious legal visitors into qualified consultations.',
    narrative:
      'A trust-first intake system that routes visitors by matter type, captures urgency, sets expectations, and moves qualified prospects toward a consultation.',
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
    visual: {
      theme: 'legal',
      eyebrow: 'Trust-first intake',
      headline: 'Serious visitors need confidence, routing, and a clear consultation path.',
      lede: 'The system separates matter type, urgency, fit, and next step before a prospect gets lost on a generic contact page.',
      inputLabel: 'Matter signals',
      outputLabel: 'Qualified consult',
      inputs: ['Practice area', 'Urgency', 'Jurisdiction', 'Fit concern'],
      outputs: ['Matter route', 'Attorney proof', 'Expectation set', 'Consult request'],
      core: 'Intake router',
      result: 'The firm sees what matters, who is urgent, and why the next conversation is qualified.',
    },
    demo: {
      primaryCta: 'Request consultation',
      proofStatus: ['Route screenshot captured', 'Accessibility checked', 'Mobile layout checked'],
      steps: [
        {
          label: 'Pick matter type',
          before: 'The visitor lands on a generic contact form with no confidence.',
          system: 'The intake flow routes by practice area, urgency, and jurisdiction fit.',
          result: 'The firm sees the right matter category before the first call.',
          buyerAction: 'Select practice area',
        },
        {
          label: 'Capture urgency',
          before: 'Important deadlines and risk signals are buried in a long message.',
          system: 'The system asks for deadline, opposing party, and urgency without giving advice.',
          result: 'Qualified matters rise above casual inquiries.',
          buyerAction: 'Mark urgency',
        },
        {
          label: 'Build trust',
          before: 'The prospect has to hunt for process, attorney credibility, and next steps.',
          system: 'Trust proof, consultation expectations, and response timing sit beside the intake.',
          result: 'The prospect knows what happens next.',
          buyerAction: 'Review consultation path',
        },
        {
          label: 'Schedule consult',
          before: 'The firm loses serious buyers to friction and uncertainty.',
          system: 'The CTA moves qualified visitors into a consultation request with clear boundaries.',
          result: 'The firm gets a cleaner consult queue.',
          buyerAction: 'Send consult request',
        },
      ],
    },
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
    headline: 'Turn support volume into a controlled AI operations cockpit.',
    narrative:
      'A visual support command center that shows what AI handled, what humans reviewed, where risk escalated, and how resolution quality is measured.',
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
    visual: {
      theme: 'support',
      eyebrow: 'Support control loop',
      headline: 'AI support should reduce volume without hiding risk.',
      lede: 'The dashboard makes every answer, escalation, policy gap, and quality signal visible before automation scales.',
      inputLabel: 'Incoming support',
      outputLabel: 'Controlled resolution',
      inputs: ['Ticket queue', 'Live chat', 'Help docs', 'Refund risk'],
      outputs: ['Safe draft', 'Human escalation', 'QA review', 'Trend report'],
      core: 'AI cockpit',
      result: 'Repetitive work moves faster while edge cases stay visible to humans.',
    },
    demo: {
      primaryCta: 'Resolve ticket',
      proofStatus: ['Route screenshot captured', 'Accessibility checked', 'Mobile layout checked'],
      steps: [
        {
          label: 'Classify ticket',
          before: 'Every request hits the same inbox, whether it is simple or risky.',
          system: 'The cockpit detects intent, urgency, policy risk, and confidence.',
          result: 'Simple requests move fast and risky ones stay visible.',
          buyerAction: 'Classify request',
        },
        {
          label: 'Match knowledge',
          before: 'Agents answer from memory or search scattered docs.',
          system: 'The system matches approved knowledge, citations, and policy notes.',
          result: 'Drafts are grounded before anyone sends them.',
          buyerAction: 'Open matched source',
        },
        {
          label: 'Escalate risk',
          before: 'Refunds, cancellations, and angry customers get mixed with routine tickets.',
          system: 'Low-confidence or policy-sensitive cases route to human review.',
          result: 'Automation does not hide the cases that need judgment.',
          buyerAction: 'Escalate case',
        },
        {
          label: 'Measure quality',
          before: 'The team only sees volume, not response quality or policy drift.',
          system: 'QA scores, deflection, escalation reasons, and knowledge gaps stay visible.',
          result: 'The team improves the support system each week.',
          buyerAction: 'Review QA dashboard',
        },
      ],
    },
  },
]

export function getPrototype(slug: string) {
  return prototypes.find((prototype) => prototype.slug === slug)
}
