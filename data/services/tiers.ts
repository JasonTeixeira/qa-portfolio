// Sage Ideas Studio service tiers — source of truth.
// Stripe products + prices are LIVE in production.
// Update prices via Stripe dashboard; the unit_amount comments here are for reference only.
//
// Phase 3 expansion: methodology, timeline phases, sample artifact, related work, result metrics, add-ons.

export type Phase = {
  /** Short label shown in the timeline strip (e.g., "Week 1", "Day 1–2"). */
  label: string
  /** Phase title (e.g., "Discovery"). */
  title: string
  /** What happens during this phase, plain prose. */
  description: string
  /** Concrete artifacts produced during this phase. */
  artifacts?: string[]
}

export type AddOn = {
  name: string
  description: string
  price: string
}

export type ResultMetric = {
  /** Headline number (e.g., "47%", "$1.2M", "9 months"). */
  value: string
  /** What it measures. */
  label: string
  /** Short context (e.g., "median client", "after Audit"). */
  context?: string
}

export type SampleArtifact = {
  title: string
  description: string
  /** Filename in /public/artifacts/ — served from CDN. */
  href?: string
  /** Set true while artifacts are still in production. */
  comingSoon?: boolean
}

export type Tier = {
  slug: string
  name: string
  shortName: string
  /** One-line tagline (cyan accent on page). */
  tagline: string
  /** 2–3 sentence positioning paragraph for hero + cards. */
  description: string
  /** Display string ("$1,500", "from $25,000", "$4,900/mo"). */
  price: string
  /** Cents (for Stripe + comparison math). 0 for custom. */
  priceCents: number
  cadence: 'one-time' | 'monthly' | 'custom'
  /** Top-level timeline label ("5 business days", "2 weeks", "Quarterly minimum"). */
  timeline: string
  /** Primary CTA button label. */
  cta: string
  /** Primary CTA destination. */
  ctaHref: string
  stripeProductId?: string
  stripePriceId?: string
  /** True for "flagship" highlight on cards/grid. */
  highlight?: boolean

  /** Service line — drives capability matrix and industry pages. */
  capability:
    | 'strategy'
    | 'web'
    | 'automation'
    | 'seo'
    | 'content'
    | 'brand'
    | 'product'
    | 'platform'
  /** Mode the engagement runs in. */
  mode: 'audit' | 'sprint' | 'build' | 'operate'

  /** What the client takes away (3–5 outcomes). */
  outcomes: string[]
  /** Concrete deliverables list. */
  deliverables: string[]
  /** Honest scope cuts. */
  notIncluded: string[]
  /** FAQ entries. */
  faq: { q: string; a: string }[]

  /** Phase-by-phase methodology — drives the timeline gantt strip. */
  phases: Phase[]
  /** Typical client outcomes (sourced from past work + benchmarks). */
  resultMetrics: ResultMetric[]
  /** Optional add-ons priced separately. */
  addOns: AddOn[]
  /** Slugs from /data/work/case-studies — case studies that exemplify this tier. */
  caseStudySlugs: string[]
  /** Downloadable sample artifact (PDF in /public/artifacts/). */
  sampleArtifact?: SampleArtifact
  /** Schema.org-friendly summary for JSON-LD Service. */
  schemaSummary?: string
}

export const tiers: Tier[] = [
  // ────────────────────────────────────────────────────────────────────────
  // 1. AUDIT
  // ────────────────────────────────────────────────────────────────────────
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
    capability: 'strategy',
    mode: 'audit',
    outcomes: [
      'Prioritized list of the 10 highest-leverage fixes',
      'Loom walkthrough you can share with your team',
      '60-minute review call to triage next steps',
      'Optional credit toward a follow-on engagement',
    ],
    deliverables: [
      'Recommendations doc (PDF + editable Notion / Google Doc)',
      'Loom walkthrough video (typically 25–35 minutes)',
      'Architecture / SEO / UX scorecard with grades by surface area',
      'Risk register flagging anything urgent (security, compliance, perf)',
      '60-minute synchronous review call with founder + team',
    ],
    notIncluded: [
      'Implementation work (rolls into Ship / Automate / Build)',
      'Long-term retainer',
      'Penetration testing or formal SOC 2 evidence',
    ],
    faq: [
      {
        q: 'What systems can you audit?',
        a: 'Web apps, marketing sites, AI workflows, infrastructure, billing flows, SEO surface area, and developer experience. Stack-flexible — most engagements involve Next.js, Python, AWS, Stripe, or some combination.',
      },
      {
        q: 'Can the cost be applied to a larger engagement?',
        a: 'Yes. If you move forward with Ship, Automate, Build, SEO Sprint, Content Engine, or Brand Sprint within 30 days, the full $1,500 is credited toward that engagement.',
      },
      {
        q: 'How much access do you need?',
        a: 'Read-only access to the systems we’re auditing — analytics, repo, hosting dashboard, error tracker. We sign a mutual NDA before kickoff.',
      },
      {
        q: 'How is the recommendation list prioritized?',
        a: 'Each item gets an Impact score (1–5), an Effort estimate (hours/days/weeks), and a Confidence level. We sort by Impact / Effort and flag the top 10 explicitly.',
      },
    ],
    phases: [
      {
        label: 'Day 1',
        title: 'Kickoff & access',
        description:
          'Mutual NDA, 30-minute kickoff call to align on the question we’re answering, read-only access to the systems under review.',
        artifacts: ['Signed NDA', 'Kickoff doc', 'Access checklist'],
      },
      {
        label: 'Day 2–3',
        title: 'Deep dive',
        description:
          'We tear down architecture, observability, billing flow, SEO surface, security posture, and developer experience. Every page is read; every dashboard checked.',
        artifacts: ['Internal scorecard', 'Issue inventory'],
      },
      {
        label: 'Day 4',
        title: 'Synthesis',
        description:
          'We rank findings by impact / effort, build the recommendation list, and record the Loom walkthrough.',
        artifacts: ['Recommendations doc draft', 'Loom walkthrough'],
      },
      {
        label: 'Day 5',
        title: 'Review call',
        description:
          '60-minute live review with you and your team. We answer questions, sequence the work, and (if it makes sense) scope the follow-on.',
        artifacts: ['Final recommendations doc', 'Optional follow-on proposal'],
      },
    ],
    resultMetrics: [
      { value: '5 days', label: 'Median delivery', context: 'every audit since 2024' },
      { value: '10', label: 'Top-priority fixes surfaced', context: 'every audit' },
      { value: '40%', label: 'Of audits roll into a Ship/Build', context: 'past 12 months' },
    ],
    addOns: [
      {
        name: 'Compliance posture review',
        description: 'SOC 2 / GDPR / HIPAA gap analysis bolted onto the audit.',
        price: '+$1,000',
      },
      {
        name: 'Stakeholder readout',
        description: 'A second 60-min call presented to your board, investors, or buyer.',
        price: '+$500',
      },
    ],
    caseStudySlugs: ['quality-telemetry', 'aws-landing-zone'],
    sampleArtifact: {
      title: 'Sample Audit Report (redacted)',
      description:
        'A real Sage Audit deliverable — recommendations doc, scorecard, and risk register — with client identifiers redacted.',
      href: '/artifacts/sample-audit-report.pdf',
      comingSoon: true,
    },
    schemaSummary: 'Senior engineering and SEO audit delivered in 5 business days.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. SHIP
  // ────────────────────────────────────────────────────────────────────────
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
    capability: 'web',
    mode: 'sprint',
    outcomes: [
      'Live, fast, indexable marketing site',
      'CMS your team can update without engineering',
      'Analytics and SEO foundation in place from day one',
      '90+ Lighthouse across Performance, A11y, SEO, Best Practices',
    ],
    deliverables: [
      'Up to 8 pages, fully responsive, dark + light mode if requested',
      'CMS-backed content (Sanity or Contentful)',
      'Analytics + sitemap + robots + structured data',
      'Vercel production deploy + DNS + SSL handoff',
      'One custom integration (forms, CRM, booking)',
      'Open Graph + favicon + brand assets pipeline',
      '30 days of post-launch support',
    ],
    notIncluded: [
      'Logo / brand identity design (BYO or add-on, or pair with Brand Sprint)',
      'Long-form copywriting (we provide structure + edits)',
      'Custom illustrations or video',
    ],
    faq: [
      {
        q: 'Do you write the copy?',
        a: 'We provide structure, headlines, and edits. Long-form copywriting is available as an add-on or via a separate engagement (Content Engine).',
      },
      {
        q: 'What if I need more than 8 pages?',
        a: 'Each additional page is $400, or we scope this into a Build engagement instead.',
      },
      {
        q: 'What stack do you ship on?',
        a: 'Next.js (App Router) on Vercel, Sanity or Contentful for CMS, Tailwind for styling, Resend for transactional email. We use this exact stack on our own products.',
      },
      {
        q: 'Can you migrate me from WordPress / Webflow / Framer?',
        a: 'Yes — that’s a common Ship scenario. We handle redirects, SEO preservation, and content migration.',
      },
    ],
    phases: [
      {
        label: 'Day 1–2',
        title: 'Discovery & wireframes',
        description:
          'Brand audit, sitemap, content inventory, low-fi wireframes for every page. We confirm IA before any code is written.',
        artifacts: ['Sitemap', 'Wireframes', 'Content brief'],
      },
      {
        label: 'Day 3–6',
        title: 'Design & build',
        description:
          'Tokens, type system, component library, page-by-page implementation. Daily Vercel previews — no surprises at the end.',
        artifacts: ['Design tokens', 'Component library', 'Daily preview deploys'],
      },
      {
        label: 'Day 7–10',
        title: 'Content & integrations',
        description:
          'CMS schemas, content load-in, custom integration, analytics, SEO. Performance pass to land 90+ Lighthouse.',
        artifacts: ['CMS instance', 'Analytics dashboard', 'Lighthouse report'],
      },
      {
        label: 'Day 11–14',
        title: 'Launch',
        description:
          'DNS cutover, monitoring, redirects from old site, post-launch QA, handoff doc, training session.',
        artifacts: ['Production site', 'Handoff doc', 'Loom training video'],
      },
    ],
    resultMetrics: [
      { value: '14 days', label: 'Time to production', context: 'guaranteed' },
      { value: '95+', label: 'Median Lighthouse score', context: 'across past Ship sites' },
      { value: '<1.5s', label: 'Median LCP', context: 'measured on production' },
    ],
    addOns: [
      {
        name: 'Long-form copywriting',
        description: 'Up to 6,000 words across all pages, written and edited in your voice.',
        price: '+$2,000',
      },
      {
        name: 'Brand Sprint pairing',
        description: 'Ship + Brand Sprint as one engagement — saves $500 vs. buying separately.',
        price: '$12,900 combined',
      },
      {
        name: 'Bilingual / i18n',
        description: 'Set up next-intl + content schemas for a second language.',
        price: '+$1,500',
      },
    ],
    caseStudySlugs: ['nexural', 'jobpoise', 'trayd'],
    sampleArtifact: {
      title: 'Ship deliverables index',
      description: 'PDF showing the exact artifacts produced in a typical Ship engagement.',
      href: '/artifacts/ship-deliverables.pdf',
      comingSoon: true,
    },
    schemaSummary:
      'Production-grade marketing site built on Next.js + CMS + analytics in 2 weeks.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. AUTOMATE
  // ────────────────────────────────────────────────────────────────────────
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
    capability: 'automation',
    mode: 'sprint',
    outcomes: [
      'One workflow runs without human supervision',
      'Monitoring + alerting in place — you know when it breaks',
      'Runbook your team can operate independently',
      'Cost-of-ops baseline established + tracked',
    ],
    deliverables: [
      'Workflow design + architecture diagram (Excalidraw + written)',
      'End-to-end implementation (LLM orchestration, integrations, fallbacks)',
      'Monitoring + alerting (Sentry / CloudWatch / Slack)',
      'Operator-facing dashboard for visibility',
      'Cost telemetry — token spend, run rate, exception rate',
      'Runbook + handoff session',
      '30 days of post-launch support',
    ],
    notIncluded: [
      'LLM token spend (passed through at cost)',
      'Long-term retainer (rolls into Operate)',
      'Multi-tenant or customer-facing automation (rolls into Build)',
    ],
    faq: [
      {
        q: 'Which LLM stack do you use?',
        a: 'Whatever fits the job. Default to Claude or GPT-4-class models with structured outputs. Shipped against OpenAI, Anthropic, and open-source via Bedrock.',
      },
      {
        q: 'Can you integrate with my existing tools?',
        a: 'Yes — Stripe, HubSpot, Salesforce, Notion, Slack, Gmail, Linear, and most modern SaaS via REST APIs are in scope. Anything weirder gets sized in discovery.',
      },
      {
        q: 'How do you handle hallucinations / failure modes?',
        a: 'Every workflow ships with structured output validation, deterministic fallbacks, and a human-in-the-loop checkpoint where stakes warrant it. Monitoring surfaces drift early.',
      },
      {
        q: 'What about prompt injection / safety?',
        a: 'Inputs are validated, prompts are templated (never string-concatenated from user input), and tool-use is gated by allow-lists. Standard practice — not negotiable.',
      },
    ],
    phases: [
      {
        label: 'Week 1',
        title: 'Workflow design',
        description:
          'Map the existing manual workflow end-to-end. Identify the deterministic steps (rules) vs. the AI-suited steps (judgment, extraction, generation). Architecture diagram + cost model.',
        artifacts: ['Workflow diagram', 'Cost model', 'Risk register'],
      },
      {
        label: 'Week 2',
        title: 'Build',
        description:
          'Implementation, prompt engineering, integrations, dashboards. Daily preview environment — your team can poke at it.',
        artifacts: ['Production code', 'Dashboard', 'Integration tests'],
      },
      {
        label: 'Week 3',
        title: 'Monitor + handoff',
        description:
          'Production deploy, alerting wired in, runbook written, training session with the team that will operate it.',
        artifacts: ['Runbook', 'Monitoring config', 'Loom training video'],
      },
    ],
    resultMetrics: [
      { value: '21 days', label: 'Median time to production', context: 'guaranteed' },
      { value: '70–90%', label: 'Manual hours eliminated', context: 'typical workflow' },
      { value: '<2%', label: 'Exception rate at steady state', context: 'measured at 30 days' },
    ],
    addOns: [
      {
        name: 'Second workflow',
        description: 'Layer on a second related workflow during the same engagement.',
        price: '+$5,000',
      },
      {
        name: 'Compliance review',
        description:
          'Data flow analysis for SOC 2 / HIPAA / GDPR — what data goes where, with which sub-processors.',
        price: '+$1,500',
      },
      {
        name: 'Operate handoff',
        description: 'Roll into Operate at month 1 — first month at 50% off.',
        price: '$3,750 first month',
      },
    ],
    caseStudySlugs: ['alphastream', 'quality-telemetry'],
    sampleArtifact: {
      title: 'Automate workflow specification',
      description: 'Anonymized workflow diagram + spec from a past Automate engagement.',
      href: '/artifacts/automate-spec.pdf',
      comingSoon: true,
    },
    schemaSummary:
      'End-to-end workflow automation with LLM orchestration, monitoring, and runbook in 3 weeks.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. SEO SPRINT (NEW)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'seo-sprint',
    name: 'SEO Sprint',
    shortName: 'SEO Sprint',
    tagline: 'Technical SEO + on-page foundation, fixed in 30 days.',
    description:
      'A 30-day audit + fix sprint that gets your technical SEO right. Crawl health, Core Web Vitals, schema, internal linking, on-page optimization, and programmatic SEO scaffolding. Built for teams who want compounding organic traffic without a full retainer.',
    price: '$3,500',
    priceCents: 350_000,
    cadence: 'one-time',
    timeline: '30 days',
    cta: 'Buy SEO Sprint',
    ctaHref: '/checkout/seo-sprint',
    stripeProductId: 'prod_URyENd3VyvT2vt',
    stripePriceId: 'price_1TT4IcEDeyGfkojJdQLE5Rci',
    capability: 'seo',
    mode: 'sprint',
    outcomes: [
      'Every technical SEO blocker fixed — crawl, schema, vitals, sitemaps',
      'Programmatic SEO scaffolding for templated landing pages',
      'Tracking dashboard: rankings, clicks, vitals, indexation',
      '60 days of post-sprint support to monitor and tune',
    ],
    deliverables: [
      'Technical SEO audit (200+ checkpoint)',
      'Core Web Vitals fixes — LCP, CLS, INP under threshold sitewide',
      'Schema.org coverage: Organization, Service, Article, FAQ, Breadcrumb',
      'Internal linking strategy + implementation',
      'Programmatic SEO architecture (template pages, dynamic content)',
      'Sitemap, robots, canonical, hreflang configuration',
      'GSC + Bing Webmaster setup, validation, monitoring',
      'Tracking dashboard (Looker Studio or hosted)',
      '60-day post-sprint monitoring',
    ],
    notIncluded: [
      'Long-form content writing (use Content Engine)',
      'Paid media / PPC',
      'Outbound link building (we focus on earned + on-page)',
    ],
    faq: [
      {
        q: 'How fast will I see results?',
        a: 'Technical fixes can move rankings within 2–4 weeks of indexation. Programmatic pages typically start ranking in 4–8 weeks. Long-form compounds over 3–9 months — that’s where Content Engine takes over.',
      },
      {
        q: 'What CMS / stack do you support?',
        a: 'Next.js, WordPress, Webflow, Framer, Shopify, Contentful, Sanity, custom. If your stack can serve clean HTML and respect canonicals, we can fix it.',
      },
      {
        q: 'Will you guarantee specific traffic numbers?',
        a: 'No — anyone who promises a number is lying. We guarantee the technical work is done correctly and the dashboard accurately measures whatever happens next.',
      },
      {
        q: 'Do you do off-page / link building?',
        a: 'Not as outbound. We focus on earning links via Content Engine + technical excellence. If you need an outbound link partner, we can refer trusted ones.',
      },
    ],
    phases: [
      {
        label: 'Week 1',
        title: 'Audit',
        description:
          'Full technical crawl, Core Web Vitals baseline, schema coverage analysis, GSC + GA review, competitor benchmarking. Output: prioritized fix list.',
        artifacts: ['SEO audit report', 'Fix priority matrix'],
      },
      {
        label: 'Week 2',
        title: 'Technical fixes',
        description:
          'Highest-leverage technical work first — schema, vitals, internal linking, indexation, redirects. Daily PRs.',
        artifacts: ['PRs in your repo', 'Updated sitemaps', 'Schema coverage report'],
      },
      {
        label: 'Week 3',
        title: 'Programmatic + on-page',
        description:
          'Programmatic SEO architecture for templated pages, on-page optimization for top-priority URLs, FAQ schema rollout.',
        artifacts: ['Template pages live', 'On-page changes shipped'],
      },
      {
        label: 'Week 4',
        title: 'Dashboard + handoff',
        description:
          'Tracking dashboard built in Looker Studio (or hosted alternative), monitoring alerts wired up, training session, 60-day support handoff.',
        artifacts: ['Tracking dashboard', 'Runbook', 'Monitoring alerts'],
      },
    ],
    resultMetrics: [
      { value: '200+', label: 'SEO checkpoints in audit', context: 'every sprint' },
      { value: '30 days', label: 'Median time to first ranking lift', context: 'past sprints' },
      { value: '95+', label: 'Lighthouse SEO score', context: 'sitewide post-sprint' },
    ],
    addOns: [
      {
        name: 'Content Engine pairing',
        description: 'SEO Sprint + Content Engine first month at 50% off — total $6,750.',
        price: '$6,750 first month',
      },
      {
        name: 'Migration / replatform',
        description: 'If you’re also moving CMS or rebuilding the site, we manage redirects + SEO preservation.',
        price: '+$2,000',
      },
      {
        name: 'International SEO',
        description: 'Hreflang setup for up to 3 locales + locale-specific schema.',
        price: '+$1,500',
      },
    ],
    caseStudySlugs: ['nexural', 'jobpoise'],
    sampleArtifact: {
      title: 'SEO audit template',
      description:
        'A redacted SEO Sprint audit deliverable — what 200+ checkpoints actually look like.',
      href: '/artifacts/seo-audit-template.pdf',
      comingSoon: true,
    },
    schemaSummary:
      'Technical SEO audit and 30-day fix sprint with programmatic SEO scaffolding and post-sprint monitoring.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. CONTENT ENGINE (NEW)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'content-engine',
    name: 'Content Engine',
    shortName: 'Content',
    tagline: 'Editorial-grade long-form, every week, for compounding reach.',
    description:
      'A monthly engine that produces 4 long-form pieces (2,000+ words), distribution kits for LinkedIn / X / newsletter, an internal linking strategy that compounds, and a performance dashboard. Quarterly minimum.',
    price: '$6,500',
    priceCents: 650_000,
    cadence: 'monthly',
    timeline: 'Quarterly minimum',
    cta: 'Subscribe to Content Engine',
    ctaHref: '/checkout/content-engine',
    stripeProductId: 'prod_URyERLk7O50c0U',
    stripePriceId: 'price_1TT4IgEDeyGfkojJ8i1qbLyU',
    capability: 'content',
    mode: 'operate',
    outcomes: [
      '4 long-form pieces per month — research-backed, editorially tight',
      'Distribution kit for every piece (LinkedIn, X, newsletter)',
      'Internal linking strategy that compounds month-over-month',
      'Performance dashboard: traffic, rankings, conversions',
    ],
    deliverables: [
      '4 long-form articles per month (2,000+ words each, with original research)',
      'Editorial calendar 4–8 weeks out',
      'SEO brief per piece (target keyword, search intent, related entities)',
      'Distribution kit per piece: LinkedIn post, X thread, newsletter blurb',
      'Internal linking + topic cluster strategy',
      'Original diagrams / illustrations where useful',
      'Monthly performance dashboard + tactical adjustments',
      'Quarterly strategic review',
    ],
    notIncluded: [
      'Paid promotion / boosted posts (separate budget)',
      'Outbound link building',
      'Video production (use a video partner — we can recommend)',
      'Customer interviews or original research outside what’s in scope per piece',
    ],
    faq: [
      {
        q: 'Who actually writes the articles?',
        a: 'Sage Ideas writes, edits, and publishes — using AI assistance for first drafts and an engineer-editor pass for accuracy. Every article is reviewed by someone who has shipped in your space before it’s published.',
      },
      {
        q: 'Will the content be AI-detectable / generic?',
        a: 'No. AI assists with research and structure; voice, examples, and arguments are human-driven. We test against AI detectors and our pieces consistently read as human-written. We refuse to ship slop.',
      },
      {
        q: 'How long until I see organic traffic?',
        a: 'Articles typically index in days, gain initial rankings in 4–8 weeks, and compound over 3–9 months. We pair with SEO Sprint for fastest results.',
      },
      {
        q: 'Can I see the topic plan before signing?',
        a: 'Yes — a 30-min strategy call before subscribing produces a sample 4-week editorial calendar. No commitment until you’re happy with it.',
      },
      {
        q: 'What if I want a specific writer / SME?',
        a: 'Discuss in discovery. For specialist domains (legal, medical, hard-tech finance) we bring in a credentialed reviewer at +$1,500/mo.',
      },
    ],
    phases: [
      {
        label: 'Month 1',
        title: 'Foundations',
        description:
          'Topic cluster strategy, editorial calendar, voice guide, distribution playbook, dashboard setup. First 4 pieces shipped.',
        artifacts: ['Editorial calendar', 'Voice guide', 'Dashboard', '4 articles live'],
      },
      {
        label: 'Month 2',
        title: 'Compounding',
        description:
          'Pieces 5–8 ship. Internal linking strengthens. Distribution playbook refined based on Month 1 metrics.',
        artifacts: ['4 articles', 'Updated link map', 'Distribution analysis'],
      },
      {
        label: 'Month 3',
        title: 'Strategic review',
        description:
          'Pieces 9–12 ship. Quarterly review reads what’s working and what isn’t. Adjust topic mix, deepen what’s converting.',
        artifacts: ['4 articles', 'Quarterly review doc', 'Refined Q2 plan'],
      },
    ],
    resultMetrics: [
      { value: '12', label: 'Long-form pieces / quarter', context: 'guaranteed' },
      {
        value: '3–9 mo',
        label: 'Median compounding window',
        context: 'before sustained organic lift',
      },
      {
        value: '2,000+',
        label: 'Words per piece',
        context: 'minimum — many pieces ship at 3,000+',
      },
    ],
    addOns: [
      {
        name: 'SME reviewer',
        description: 'Credentialed reviewer (legal, medical, regulated finance) per piece.',
        price: '+$1,500/mo',
      },
      {
        name: 'Newsletter operations',
        description:
          'We run your newsletter end-to-end on Resend or Beehiiv — list growth, weekly cadence, segmentation.',
        price: '+$2,000/mo',
      },
      {
        name: 'Video repurpose',
        description: 'Each long-form piece repurposed into a 60-second YouTube Short + LinkedIn video.',
        price: '+$2,500/mo',
      },
    ],
    caseStudySlugs: ['nexural', 'alphastream'],
    sampleArtifact: {
      title: 'Sample editorial calendar',
      description: 'A 4-week editorial calendar from a past engagement with topic clusters mapped.',
      href: '/artifacts/content-editorial-calendar.pdf',
      comingSoon: true,
    },
    schemaSummary:
      'Monthly long-form content engine with 4 pieces, distribution kit, and performance dashboard.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 6. BRAND SPRINT (NEW)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'brand-sprint',
    name: 'Brand Sprint',
    shortName: 'Brand',
    tagline: 'Verbal + visual identity, ready to ship — in 2 weeks.',
    description:
      'A 2-week brand identity sprint. Verbal identity (positioning, voice, messaging), visual identity (logo, type, color, motion), brand guidelines, and web-ready design tokens. Delivered with a Figma library and a Notion brand book.',
    price: '$8,500',
    priceCents: 850_000,
    cadence: 'one-time',
    timeline: '2 weeks',
    cta: 'Buy Brand Sprint',
    ctaHref: '/checkout/brand-sprint',
    stripeProductId: 'prod_URyFr3xIKTBsIS',
    stripePriceId: 'price_1TT4IkEDeyGfkojJsxbCDh3E',
    capability: 'brand',
    mode: 'sprint',
    outcomes: [
      'A brand identity that looks like it belongs to a real company',
      'Verbal system: positioning, voice, taglines, messaging hierarchy',
      'Visual system: logo, type, color, spacing, motion principles',
      'Production-ready design tokens — no friction handing off to web build',
    ],
    deliverables: [
      'Positioning + messaging house (Notion brand book)',
      'Voice + tone guide with do/don’t examples',
      'Primary + secondary logo set (SVG, PNG, monochrome, favicon)',
      'Type system (display, body, mono) with web-loaded fallbacks',
      'Color system with WCAG AA contrast pairs',
      'Spacing scale + radius scale + shadow system',
      'Motion principles (durations, easings, signature gestures)',
      'Figma library with components, variants, and tokens',
      'Web-ready design tokens (CSS variables + Tailwind config)',
      'Brand guidelines PDF + Notion brand book',
    ],
    notIncluded: [
      'Marketing site implementation (pair with Ship)',
      'Photography / video production',
      'Trademark search / legal registration (we recommend a partner)',
      'Print collateral beyond the basics',
    ],
    faq: [
      {
        q: 'How is this different from a logo design?',
        a: 'A logo is one deliverable. Brand Sprint produces an identity system — verbal and visual — that you can deploy across web, deck, email, and social without it feeling like the logo is the whole brand.',
      },
      {
        q: 'Can you work from an existing brand?',
        a: 'Yes. A Brand Sprint that refines/extends an existing identity is the same scope and price — we audit what works, formalize what’s missing, and deliver the system.',
      },
      {
        q: 'How many logo options do I see?',
        a: 'Three concept directions in week 1, refined to one before week 2 begins. We don’t ship 30 mediocre options — we ship 3 considered ones.',
      },
      {
        q: 'What about trademark / legal?',
        a: 'We do basic conflict checks (Google, USPTO TESS) but a final trademark search is the client’s legal counsel’s job. We can refer trademark attorneys.',
      },
    ],
    phases: [
      {
        label: 'Day 1–3',
        title: 'Strategy',
        description:
          'Positioning workshop, audience map, competitor teardown, voice exercises. Output: messaging house + creative brief.',
        artifacts: ['Messaging house', 'Voice guide', 'Creative brief'],
      },
      {
        label: 'Day 4–7',
        title: 'Visual concepts',
        description:
          'Three concept directions (logo, type, color, sample applications). Live presentation. Pick one.',
        artifacts: ['3 concept directions', 'Application mocks'],
      },
      {
        label: 'Day 8–11',
        title: 'System',
        description:
          'Refine chosen direction into a full system. Build the Figma library. Token everything for web handoff.',
        artifacts: ['Figma library', 'Tokens (CSS + Tailwind)'],
      },
      {
        label: 'Day 12–14',
        title: 'Documentation + handoff',
        description:
          'Brand book in Notion + PDF. Loom walkthrough. Handoff session with anyone who’ll deploy the brand.',
        artifacts: ['Brand book', 'Loom training', 'Handoff session'],
      },
    ],
    resultMetrics: [
      { value: '14 days', label: 'Time to delivered system', context: 'guaranteed' },
      { value: '3', label: 'Considered logo directions', context: 'never 30' },
      {
        value: 'AA',
        label: 'WCAG contrast on every color pair',
        context: 'shipped, not promised',
      },
    ],
    addOns: [
      {
        name: 'Brand Sprint + Ship combo',
        description: 'Bundle Brand Sprint into a Ship engagement — saves $500.',
        price: '$12,900 combined',
      },
      {
        name: 'Pitch deck template',
        description: 'Branded Keynote + Google Slides + PowerPoint deck system.',
        price: '+$1,500',
      },
      {
        name: 'Naming sprint',
        description:
          '5-day naming sprint before the brand sprint — generated, screened, validated.',
        price: '+$2,500',
      },
      {
        name: 'Custom illustration set',
        description: 'A library of 12 custom SVG illustrations in your brand voice.',
        price: '+$3,500',
      },
    ],
    caseStudySlugs: ['nexural', 'jobpoise', 'trayd'],
    sampleArtifact: {
      title: 'Sample brand book (Nexural)',
      description: 'Full brand system from a past Brand Sprint, redacted for sensitive details.',
      href: '/artifacts/brand-book-sample.pdf',
      comingSoon: true,
    },
    schemaSummary: 'Two-week verbal + visual brand identity sprint with full design system and tokens.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 7. SCALE (renamed conceptually — kept slug for SEO continuity)
  // ────────────────────────────────────────────────────────────────────────
  {
    slug: 'scale',
    name: 'Scale',
    shortName: 'Scale',
    tagline: 'SEO + Content Engine running in lockstep — the compounding stack.',
    description:
      'The compounding stack. Programmatic SEO architecture, 8 long-form articles per month, technical SEO maintenance, distribution, and monthly reporting. Built for teams who want a real organic moat in their category.',
    price: '$4,900',
    priceCents: 490_000,
    cadence: 'monthly',
    timeline: 'Quarterly minimum',
    cta: 'Subscribe to Scale',
    ctaHref: '/checkout/scale',
    stripeProductId: 'prod_URxMPJt8RTbNPx',
    stripePriceId: 'price_1TT3RbEDeyGfkojJTDhgGX30',
    capability: 'seo',
    mode: 'operate',
    outcomes: [
      'Compounding organic traffic — typically 3–9 month payback',
      'A content moat in your category',
      'Technical SEO that does not regress',
      'Distribution that compounds with the content library',
    ],
    deliverables: [
      'Programmatic SEO architecture (template pages, internal linking)',
      '8 long-form articles per month',
      'Technical SEO audit + monthly maintenance',
      'Distribution kit per piece (LinkedIn, X, newsletter)',
      'Monthly performance report + roadmap',
      'Quarterly strategic review',
    ],
    notIncluded: [
      'Paid media / ads (separate engagement)',
      'Outbound link building (we focus on earned + on-page)',
    ],
    faq: [
      {
        q: 'How is Scale different from SEO Sprint + Content Engine?',
        a: 'Scale runs them as one engagement at a discounted combined rate vs. buying separately ($3,500 + $6,500 = $10,000/mo if standalone; Scale is $4,900/mo with a leaner content cadence — 8 instead of 4 pieces but no SME review by default).',
      },
      {
        q: 'How fast will I see results?',
        a: 'Programmatic pages can index within weeks. Long-form articles compound over 3–9 months. We do not promise specific traffic numbers.',
      },
      {
        q: 'Do you write the articles?',
        a: 'We write, edit, and publish. AI-assisted, human-edited — every article is reviewed by an engineer who has shipped in your space.',
      },
    ],
    phases: [
      {
        label: 'Month 1',
        title: 'Foundations',
        description:
          'Programmatic SEO architecture, 8 articles, dashboard setup, distribution playbook.',
        artifacts: ['Programmatic templates', '8 articles', 'Dashboard'],
      },
      {
        label: 'Month 2',
        title: 'Cadence',
        description: '8 more pieces. Internal linking strengthens. Distribution refines.',
        artifacts: ['8 articles', 'Updated link map'],
      },
      {
        label: 'Month 3',
        title: 'Strategic review',
        description: '8 more pieces + quarterly review.',
        artifacts: ['8 articles', 'Quarterly review doc'],
      },
    ],
    resultMetrics: [
      { value: '24', label: 'Long-form pieces / quarter', context: 'guaranteed' },
      { value: '3–9 mo', label: 'Compounding window', context: 'typical' },
      { value: '$10k+', label: 'Saved vs. buying SEO + Content separately', context: 'per quarter' },
    ],
    addOns: [
      {
        name: 'SME reviewer',
        description: 'Credentialed reviewer per piece for regulated industries.',
        price: '+$1,500/mo',
      },
      {
        name: 'Newsletter operations',
        description: 'Run your newsletter end-to-end on Resend or Beehiiv.',
        price: '+$2,000/mo',
      },
      {
        name: 'Video repurpose',
        description: 'Each long-form piece into a 60s Short + LinkedIn video.',
        price: '+$2,500/mo',
      },
    ],
    caseStudySlugs: ['nexural', 'alphastream', 'jobpoise'],
    sampleArtifact: {
      title: 'Scale 90-day plan template',
      description: 'A 90-day Scale roadmap with topic clusters and programmatic SEO map.',
      href: '/artifacts/scale-90-day-plan.pdf',
      comingSoon: true,
    },
    schemaSummary:
      'Combined SEO + content retainer with programmatic SEO, 8 articles/mo, distribution, and reporting.',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 8. BUILD
  // ────────────────────────────────────────────────────────────────────────
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
    capability: 'product',
    mode: 'build',
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
      {
        q: 'Who actually writes the code?',
        a: 'Sage Ideas + a curated bench of senior specialists when scope warrants. Every line of code is reviewed by Jason. No offshore unsupervised contractors.',
      },
      {
        q: 'What if scope changes?',
        a: 'Change orders go in a written addendum with their own price + timeline impact. No surprise bills.',
      },
    ],
    phases: [
      {
        label: 'Week 0',
        title: 'Discovery & proposal',
        description:
          'Discovery call → fixed-fee proposal within 48 hours. Mutual NDA, MSA, SOW. Kickoff once signed.',
        artifacts: ['Proposal', 'MSA', 'SOW'],
      },
      {
        label: 'Week 1–2',
        title: 'Architecture & design',
        description:
          'System architecture, data model, brand if needed, design system, IA. Daily Vercel previews.',
        artifacts: ['Architecture diagram', 'Design system', 'Wireframes'],
      },
      {
        label: 'Week 3–8',
        title: 'Build',
        description:
          'Site + app + automation + SEO foundation. Weekly demos, milestone invoices, daily preview deploys.',
        artifacts: ['Production code', 'Weekly demo Looms', 'Milestone invoices'],
      },
      {
        label: 'Week 9–12',
        title: 'Launch + 90-day support',
        description:
          'Production launch, monitoring, training, runbooks. 90 days of operator-grade support included.',
        artifacts: ['Production system', 'Runbooks', 'Handoff session'],
      },
    ],
    resultMetrics: [
      { value: '4–12 wk', label: 'Engagement length', context: 'fixed at scoping' },
      { value: '90 days', label: 'Post-launch support', context: 'included' },
      { value: '0', label: 'Surprise change orders', context: 'in past Builds' },
    ],
    addOns: [
      {
        name: 'Compliance package',
        description: 'SOC 2 readiness controls, audit trail, vendor docs, DPIA.',
        price: '+$8,000',
      },
      {
        name: 'Year-1 Operate retainer',
        description: 'Roll into Operate with the first month at 50% off.',
        price: '$3,750 first month',
      },
      {
        name: 'Brand Sprint pairing',
        description: 'Add a Brand Sprint into Build at a $1,500 discount.',
        price: '+$7,000',
      },
    ],
    caseStudySlugs: ['nexural', 'jobpoise', 'trayd', 'aws-landing-zone'],
    sampleArtifact: {
      title: 'Sample Build proposal',
      description: 'Anonymized Build proposal showing scope, milestones, and pricing structure.',
      href: '/artifacts/build-proposal-sample.pdf',
      comingSoon: true,
    },
    schemaSummary: 'Full-stack site + app + automation + SEO build engagement (4–12 weeks).',
  },

  // ────────────────────────────────────────────────────────────────────────
  // 9. OPERATE
  // ────────────────────────────────────────────────────────────────────────
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
    capability: 'platform',
    mode: 'operate',
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
      {
        q: 'How do you split time across multiple clients?',
        a: 'Operate is capped — we never run more concurrent Operate engagements than we can responsibly serve. Our calendar is transparent.',
      },
    ],
    phases: [
      {
        label: 'Week 1',
        title: 'Onboarding',
        description:
          'Access provisioning, architecture review, top-priority list, comms cadence agreed.',
        artifacts: ['Onboarding doc', 'Top-priority list'],
      },
      {
        label: 'Ongoing',
        title: 'Operate',
        description: '~20 hrs/week. Weekly sync. Written status. Architecture reviewed. Code shipped.',
        artifacts: ['Weekly status', 'PR reviews', 'Shipped features'],
      },
      {
        label: 'Quarterly',
        title: 'Strategic review',
        description: 'Quarterly review — what shipped, what didn’t, what changes for next quarter.',
        artifacts: ['Quarterly review doc'],
      },
    ],
    resultMetrics: [
      { value: '20 hrs/wk', label: 'Senior engineering capacity', context: 'guaranteed' },
      { value: '24h', label: 'Async response SLA', context: 'business days' },
      { value: '1', label: 'Surface area owned end-to-end', context: 'per engagement' },
    ],
    addOns: [
      {
        name: 'On-call coverage extension',
        description: 'Extended on-call beyond launch windows — pager + 30-min response.',
        price: '+$2,500/mo',
      },
      {
        name: 'Hiring partner',
        description: 'I help you hire your first engineer — JD, sourcing, interview rubric.',
        price: '+$5,000 one-time',
      },
    ],
    caseStudySlugs: ['aws-landing-zone', 'quality-telemetry'],
    sampleArtifact: {
      title: 'Sample Operate weekly status',
      description:
        'A redacted weekly Operate status doc — what fractional CTO ownership looks like in practice.',
      href: '/artifacts/operate-weekly-status.pdf',
      comingSoon: true,
    },
    schemaSummary: 'Fractional CTO retainer — 20 hrs/week senior engineering ownership.',
  },
] as const

export const tiersBySlug = Object.fromEntries(tiers.map((t) => [t.slug, t]))

/** Order tiers want to appear in across pricing/services index/footer. */
export const tierDisplayOrder: string[] = [
  'audit',
  'ship',
  'automate',
  'seo-sprint',
  'content-engine',
  'brand-sprint',
  'scale',
  'build',
  'operate',
]

/** Tiers in display order. */
export const tiersOrdered: Tier[] = tierDisplayOrder
  .map((slug) => tiersBySlug[slug])
  .filter(Boolean) as Tier[]

/** Capability metadata — drives the /capabilities matrix. */
export type CapabilityKey = Tier['capability']

export const capabilities: Record<
  CapabilityKey,
  { label: string; tagline: string; tierSlugs: string[] }
> = {
  strategy: {
    label: 'Strategy',
    tagline: 'A senior set of eyes on what to build, ship, and stop doing.',
    tierSlugs: ['audit'],
  },
  web: {
    label: 'Web',
    tagline: 'Production marketing sites, fast, indexable, and CMS-backed.',
    tierSlugs: ['ship'],
  },
  automation: {
    label: 'Automation',
    tagline: 'AI-native workflows with monitoring, fallbacks, and runbooks.',
    tierSlugs: ['automate'],
  },
  seo: {
    label: 'SEO',
    tagline: 'Technical SEO + programmatic SEO that compounds.',
    tierSlugs: ['seo-sprint', 'scale'],
  },
  content: {
    label: 'Content',
    tagline: 'Long-form, research-backed, distributed — every week.',
    tierSlugs: ['content-engine'],
  },
  brand: {
    label: 'Brand',
    tagline: 'Verbal + visual identity, ready for production.',
    tierSlugs: ['brand-sprint'],
  },
  product: {
    label: 'Product',
    tagline: 'Site + app + automation + SEO under one engagement.',
    tierSlugs: ['build'],
  },
  platform: {
    label: 'Platform',
    tagline: 'Senior engineering on retainer for one critical surface area.',
    tierSlugs: ['operate'],
  },
}
