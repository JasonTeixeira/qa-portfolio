// Comparison data for /compare/sage-vs-* pages.
// Honest, specific, no strawmen. If a competitor wins on a row, we say so.

export type ComparisonRow = {
  dimension: string
  sage: string
  competitor: string
  edge: 'sage' | 'competitor' | 'tie'
}

export type Comparison = {
  slug: string
  competitorName: string
  competitorShort: string
  tagline: string
  intro: string
  whenTheyWin: string
  whenWeWin: string
  rows: ComparisonRow[]
  ctaSlug: string
}

export const comparisons: Comparison[] = [
  {
    slug: 'sage-vs-in-house-hire',
    competitorName: 'Hiring an in-house AI engineer',
    competitorShort: 'In-house hire',
    tagline:
      'When you need AI work done in 2026 — should you hire someone or bring in a studio?',
    intro:
      'For most SMB and mid-market teams, the actual decision is not "Sage Ideas vs another agency" — it is "do we hire someone or contract this out?" Both are valid. Here is the honest tradeoff.',
    whenTheyWin:
      'You should hire if you have at least three named AI initiatives stretching past 18 months, you can afford $250k+ all-in for a senior generalist, and your CTO has shipped agents before and can manage the role. In that case the per-hour cost wins on duration alone.',
    whenWeWin:
      'You should bring us in if you want a working agent in production within 8 weeks, you do not yet know which workflow is highest leverage, and you need to learn what "good" looks like before you commit to a hire. We are also a better fit if you want senior pattern matching from day one — not someone learning on your bill.',
    rows: [
      {
        dimension: 'Time to first agent in production',
        sage: '2 to 6 weeks from kickoff',
        competitor: '3 to 6 months (recruit, ramp, ship)',
        edge: 'sage',
      },
      {
        dimension: 'All-in cost, year one',
        sage: '$15k–$60k for one or two engagements',
        competitor: '$220k–$320k loaded (salary, benefits, ramp)',
        edge: 'sage',
      },
      {
        dimension: 'All-in cost, year three',
        sage: '$45k–$200k cumulative if engagements continue',
        competitor: '$700k+ cumulative',
        edge: 'sage',
      },
      {
        dimension: 'Pattern recognition across orgs',
        sage: 'Yes — we see ~30 stacks per year',
        competitor: 'Limited to past employers',
        edge: 'sage',
      },
      {
        dimension: 'Day-to-day institutional knowledge',
        sage: 'We have to ramp into your domain',
        competitor: 'Wins decisively after 6+ months',
        edge: 'competitor',
      },
      {
        dimension: 'On-call ownership 24/7',
        sage: 'Retainer only; otherwise client-owned',
        competitor: 'Yes',
        edge: 'competitor',
      },
      {
        dimension: 'Hiring risk',
        sage: 'None',
        competitor: 'High — bad AI hires set teams back 6+ months',
        edge: 'sage',
      },
      {
        dimension: 'Output quality variance',
        sage: 'Senior-only; consistent',
        competitor: 'Depends entirely on the hire',
        edge: 'sage',
      },
      {
        dimension: 'Best fit when',
        sage: 'Exploring, scoping, building first 1–3 agents',
        competitor: 'You already know what to build for the next 24 months',
        edge: 'tie',
      },
    ],
    ctaSlug: 'ai-implementation-consulting',
  },
  {
    slug: 'sage-vs-big-consultancy',
    competitorName: 'Big-4 / large IT consultancies (Accenture, Deloitte, IBM)',
    competitorShort: 'Big-4 consultancies',
    tagline:
      'Boutique studio vs $50B firm — when to pick which.',
    intro:
      'Big-4 firms are fine at things we are not — global rollouts, board-level political cover, and 200-person SAP integrations. They are also wildly mismatched for "we want one agent shipped in six weeks." Here is where the line is.',
    whenTheyWin:
      'Pick a Big-4 if you need 50+ consultants across 5 geographies, your board requires a brand-name signature on the SOW, the project crosses ERP and finance and HR systems, or you are spending $5M+ over a year. They have surface area no studio can match.',
    whenWeWin:
      'Pick us if you want senior engineers actually writing the code, you measure success in shipped agents not slide decks, and your budget is $5k–$200k per engagement. We deliver in weeks because there are no committees, no offshore handoffs, and no day-rate inflation from the SOW upward.',
    rows: [
      {
        dimension: 'Day rate',
        sage: '$200–$300/hr blended',
        competitor: '$450–$900/hr (partner-loaded)',
        edge: 'sage',
      },
      {
        dimension: 'Who actually writes the code',
        sage: 'The engineer you hired',
        competitor: 'Often a less-experienced offshore team',
        edge: 'sage',
      },
      {
        dimension: 'Time to kickoff',
        sage: '1 week',
        competitor: '6–12 weeks of contracting',
        edge: 'sage',
      },
      {
        dimension: 'Time to first shipped agent',
        sage: '2–6 weeks',
        competitor: '4–9 months',
        edge: 'sage',
      },
      {
        dimension: 'Decks-to-code ratio',
        sage: 'Mostly code',
        competitor: 'Mostly decks',
        edge: 'sage',
      },
      {
        dimension: 'Global rollouts (10+ countries)',
        sage: 'Out of scope',
        competitor: 'Wins decisively',
        edge: 'competitor',
      },
      {
        dimension: 'Board-level political cover',
        sage: 'Not a brand name',
        competitor: 'Yes — the safe choice for a CIO',
        edge: 'competitor',
      },
      {
        dimension: 'ERP + HR + finance integration projects',
        sage: 'Not our shape',
        competitor: 'Their wheelhouse',
        edge: 'competitor',
      },
      {
        dimension: 'Best fit when',
        sage: 'You want one agent shipped, evaluated, and operated',
        competitor: 'You want a full transformation program',
        edge: 'tie',
      },
    ],
    ctaSlug: 'ai-agent-development',
  },
  {
    slug: 'sage-vs-platform',
    competitorName: 'AI agent platforms (Glean, Sierra, Writer, etc.)',
    competitorShort: 'Off-the-shelf AI platforms',
    tagline:
      'Buy vs build vs hybrid — when a platform is the answer and when it is not.',
    intro:
      'Off-the-shelf AI platforms are excellent for narrow, well-defined use cases (enterprise search, customer support deflection). They become expensive and limiting when your workflow is a snowflake. Here is the breakdown.',
    whenTheyWin:
      'Buy a platform if your use case is "the same thing every other company does" — internal search across SaaS apps, generic support deflection, or basic prompt-library management. The product team has invested far more than any custom build can match.',
    whenWeWin:
      'Bring us in if your workflow is unique to your business, you need agents that touch internal systems no platform supports, you need to control cost at scale, or you have already tried a platform and outgrown it. We often build alongside platforms — using their search or memory primitives, and writing the orchestration ourselves.',
    rows: [
      {
        dimension: 'Time to value (generic use case)',
        sage: '2–6 weeks',
        competitor: 'Days, sometimes hours',
        edge: 'competitor',
      },
      {
        dimension: 'Time to value (custom workflow)',
        sage: '2–8 weeks',
        competitor: 'Often impossible without escape hatch',
        edge: 'sage',
      },
      {
        dimension: 'Cost at 1k seats / mo',
        sage: 'Build cost amortizes; ~$0.05–0.30/user',
        competitor: '$8–40 per seat per month',
        edge: 'sage',
      },
      {
        dimension: 'Customization ceiling',
        sage: 'Whatever you can write code for',
        competitor: 'Whatever the vendor exposes',
        edge: 'sage',
      },
      {
        dimension: 'Vendor lock-in',
        sage: 'You own the code',
        competitor: 'You rent the workflow',
        edge: 'sage',
      },
      {
        dimension: 'Ongoing maintenance burden',
        sage: 'You operate it (or we do, on retainer)',
        competitor: 'Vendor handles infra',
        edge: 'competitor',
      },
      {
        dimension: 'Eval and observability',
        sage: 'Built to your standard',
        competitor: 'Black box — what they expose',
        edge: 'sage',
      },
      {
        dimension: 'Integrating with internal systems',
        sage: 'Direct via APIs and queues',
        competitor: 'Limited to vendor connectors',
        edge: 'sage',
      },
      {
        dimension: 'Best fit when',
        sage: 'Workflow is custom, scale matters, you want ownership',
        competitor: 'Workflow is generic, scale is small, time matters most',
        edge: 'tie',
      },
    ],
    ctaSlug: 'ai-agent-development',
  },
]
