// Sage Ideas Studio service tiers — source of truth.
// Stripe products + prices are LIVE in production (created 2026-05-03).
// Update prices via Stripe dashboard; the unit_amount comments here are for reference only.

export type Tier = {
  slug: string
  name: string
  shortName: string
  tagline: string
  description: string
  price: string
  priceCents: number
  cadence: 'one-time' | 'monthly' | 'custom'
  timeline: string
  cta: string
  ctaHref: string
  stripeProductId?: string
  stripePriceId?: string
  highlight?: boolean
  outcomes: string[]
  deliverables: string[]
  notIncluded: string[]
  faq: { q: string; a: string }[]
}

export const tiers: Tier[] = [
  {
    slug: 'audit',
    name: 'Sage Audit',
    shortName: 'Audit',
    tagline: 'A senior set of eyes on your stack — in one week.',
    description:
      'A focused 5-day strategic audit. We dig into your product, site, infrastructure, or workflow and deliver a prioritized recommendations doc, a Loom walkthrough, and a 60-minute review call. Best for teams who suspect they’re leaving money or velocity on the table.',
    price: '$1,500',
    priceCents: 150_000,
    cadence: 'one-time',
    timeline: '5 business days',
    cta: 'Buy Sage Audit',
    ctaHref: '/checkout/audit',
    stripeProductId: 'prod_URxMF53KV9WPzt',
    stripePriceId: 'price_1TT3RbEDeyGfkojJjPhl3gQv',
    outcomes: [
      'Prioritized list of the 10 highest-leverage fixes',
      'Loom walkthrough you can share with your team',
      '60-minute review call to triage next steps',
      'Optional credit toward a follow-on engagement',
    ],
    deliverables: [
      'Recommendations doc (PDF + editable)',
      'Loom walkthrough video',
      'Architecture / SEO / UX scorecard',
      '60-minute review call',
    ],
    notIncluded: [
      'Implementation work (rolls into Ship / Automate / Build)',
      'Long-term retainer',
    ],
    faq: [
      {
        q: 'What systems can you audit?',
        a: 'Web apps, marketing sites, AI workflows, infrastructure, billing flows, SEO surface area, and developer experience. We are stack-flexible — most engagements involve Next.js, Python, AWS, Stripe, or some combination.',
      },
      {
        q: 'Can the cost be applied to a larger engagement?',
        a: 'Yes. If you move forward with Ship, Automate, or Build within 30 days, the full $1,500 is credited toward that engagement.',
      },
    ],
  },
  {
    slug: 'ship',
    name: 'Ship',
    shortName: 'Ship',
    tagline: 'A production marketing site, in two weeks.',
    description:
      'A 2-week sprint that takes your marketing site from idea to production. Next.js, CMS-backed content, SEO foundation, analytics, and deploy. You get the same engineering discipline we apply to our own products.',
    price: '$4,900',
    priceCents: 490_000,
    cadence: 'one-time',
    timeline: '2 weeks',
    cta: 'Buy Ship',
    ctaHref: '/checkout/ship',
    stripeProductId: 'prod_URxMDngEq9ZNBH',
    stripePriceId: 'price_1TT3RbEDeyGfkojJjHhT324h',
    outcomes: [
      'Live, fast, indexable marketing site',
      'CMS your team can update without engineering',
      'Analytics and SEO foundation in place from day one',
    ],
    deliverables: [
      'Up to 8 pages, fully responsive',
      'CMS-backed content (Sanity or Contentful)',
      'Analytics + sitemap + structured data',
      'Vercel production deploy + DNS handoff',
      'One custom integration (forms, CRM, booking)',
      '30 days of post-launch support',
    ],
    notIncluded: [
      'Logo / brand identity design (BYO or add-on)',
      'Long-form copywriting (we provide structure + edits)',
      'Custom illustrations or video',
    ],
    faq: [
      {
        q: 'Do you write the copy?',
        a: 'We provide structure, headlines, and edits. Long-form copywriting is available as an add-on or via a separate engagement.',
      },
      {
        q: 'What if I need more than 8 pages?',
        a: 'Each additional page is $400, or we can scope this into a Build engagement instead.',
      },
    ],
  },
  {
    slug: 'automate',
    name: 'Automate',
    shortName: 'Automate',
    tagline: 'One critical workflow, automated end-to-end.',
    description:
      'A 3-week sprint that takes one workflow — onboarding, billing, support, lead routing, content production — and automates it end-to-end with monitoring, error handling, and a runbook your team can actually operate.',
    price: '$9,900',
    priceCents: 990_000,
    cadence: 'one-time',
    timeline: '3 weeks',
    cta: 'Buy Automate',
    ctaHref: '/checkout/automate',
    stripeProductId: 'prod_URxMLWjK4k5izZ',
    stripePriceId: 'price_1TT3RbEDeyGfkojJRWFGFm9z',
    highlight: true,
    outcomes: [
      'One workflow runs without human supervision',
      'Monitoring + alerting in place — you know when it breaks',
      'Runbook your team can operate independently',
    ],
    deliverables: [
      'Workflow design + architecture diagram',
      'End-to-end implementation (LLM orchestration, integrations, fallbacks)',
      'Monitoring + alerting (Sentry / CloudWatch / Slack)',
      'Operator-facing dashboard for visibility',
      'Runbook + handoff session',
      '30 days of post-launch support',
    ],
    notIncluded: [
      'LLM token spend (passed through at cost)',
      'Long-term retainer (rolls into Operate)',
    ],
    faq: [
      {
        q: 'Which LLM stack do you use?',
        a: 'Whatever fits the job. We default to Claude or GPT-4-class models with structured outputs. We have shipped against OpenAI, Anthropic, and open-source via Bedrock.',
      },
      {
        q: 'Can you integrate with my existing tools?',
        a: 'Yes — Stripe, HubSpot, Salesforce, Notion, Slack, Gmail, and most modern SaaS via REST APIs are in scope.',
      },
    ],
  },
  {
    slug: 'scale',
    name: 'Scale',
    shortName: 'Scale',
    tagline: 'A monthly SEO + content engine that compounds.',
    description:
      'Programmatic SEO setup, 8 long-form articles per month, technical optimization, and monthly reporting. Built to compound over quarters, not weeks.',
    price: '$4,900',
    priceCents: 490_000,
    cadence: 'monthly',
    timeline: 'Quarterly minimum',
    cta: 'Subscribe to Scale',
    ctaHref: '/checkout/scale',
    stripeProductId: 'prod_URxMPJt8RTbNPx',
    stripePriceId: 'price_1TT3RbEDeyGfkojJTDhgGX30',
    outcomes: [
      'Compounding organic traffic — typically 3–9 month payback',
      'A content moat in your category',
      'Technical SEO that does not regress',
    ],
    deliverables: [
      'Programmatic SEO architecture (template pages, internal linking)',
      '8 long-form articles per month',
      'Technical SEO audit + monthly maintenance',
      'Monthly performance report + roadmap',
      'Quarterly strategic review',
    ],
    notIncluded: [
      'Paid media / ads (separate engagement)',
      'Outbound link building (we focus on earned + on-page)',
    ],
    faq: [
      {
        q: 'How fast will I see results?',
        a: 'Programmatic pages can index within weeks. Long-form articles compound over 3–9 months. We do not promise specific traffic numbers.',
      },
      {
        q: 'Do you write the articles?',
        a: 'We write, edit, and publish. We use AI assistance and human editing — every article is reviewed by an engineer who has shipped in your space.',
      },
    ],
  },
  {
    slug: 'build',
    name: 'Build',
    shortName: 'Build',
    tagline: 'Site + app + automation + SEO. Live in one sprint.',
    description:
      'The flagship engagement. A 4–12 week sprint where we take a business from idea or fragmented stack to a coherent, AI-native production system. Custom scope, custom proposal, starts after a 30-minute discovery call.',
    price: 'from $25,000',
    priceCents: 2_500_000,
    cadence: 'custom',
    timeline: '4–12 weeks',
    cta: 'Book a Discovery Call',
    ctaHref: '/book?tier=build',
    stripeProductId: 'prod_URxMU6zh8iJSls',
    stripePriceId: 'price_1TT3RbEDeyGfkojJeEI3l8QT',
    highlight: true,
    outcomes: [
      'A live, full-stack business in production',
      'Site + app + automation + SEO under one strategy',
      '90 days of operator-grade support post-launch',
    ],
    deliverables: [
      'Marketing site (Ship-equivalent)',
      'Custom application (Next.js + Supabase / FastAPI)',
      'AI workflow automation (Automate-equivalent)',
      'SEO foundation + initial content',
      'Stripe billing + customer accounts',
      'Analytics + monitoring + runbooks',
      'Architecture documentation + handoff',
    ],
    notIncluded: [
      'Native iOS / Android (we recommend a parallel native engagement)',
      'Hardware / IoT integrations',
    ],
    faq: [
      {
        q: 'How is the price determined?',
        a: 'Discovery call → fixed-fee proposal within 48 hours. We almost never bill hourly. Most Build engagements land between $35k and $80k.',
      },
      {
        q: 'What is the deposit?',
        a: '25% kickoff deposit, then milestone-based invoicing. Net 30.',
      },
    ],
  },
  {
    slug: 'operate',
    name: 'Operate',
    shortName: 'Operate',
    tagline: 'Senior engineering on retainer. Twenty hours a week.',
    description:
      'A monthly fractional CTO engagement. ~20 hours/week of senior engineering, architecture, and ownership of one critical surface area. Best for post-Build clients and growing SMBs without an in-house technical lead.',
    price: '$7,500',
    priceCents: 750_000,
    cadence: 'monthly',
    timeline: 'Quarterly minimum',
    cta: 'Book a Discovery Call',
    ctaHref: '/book?tier=operate',
    stripeProductId: 'prod_URxM07ZeyQoJdP',
    stripePriceId: 'price_1TT3RcEDeyGfkojJf8DHD2oV',
    outcomes: [
      'A senior engineer who owns one critical surface area',
      'Weekly syncs + async availability',
      'Architecture decisions you can stand behind',
    ],
    deliverables: [
      '~20 hours/week senior engineering',
      'Weekly sync + written status',
      'Async availability via Slack / Linear',
      'Architecture review on all major changes',
      'On-call coverage during launches',
    ],
    notIncluded: [
      'Hiring or managing an in-house team (advisory only)',
      'Production support beyond launch windows',
    ],
    faq: [
      {
        q: 'Can I scale this up to full-time?',
        a: 'Operate is capped at 20 hrs/week. For more, it converts to a Build sprint or a multi-month custom engagement.',
      },
      {
        q: 'What is the minimum commitment?',
        a: 'One quarter (3 months). After the first quarter, month-to-month with 30 days notice.',
      },
    ],
  },
] as const

export const tiersBySlug = Object.fromEntries(tiers.map((t) => [t.slug, t]))
