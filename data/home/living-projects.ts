export type WorkStatus = 'Live' | 'In beta' | 'Private' | 'Open source'

export type WorkProject = {
  slug: string
  index: string
  name: string
  /** Accurate one-liner pulled from the actual repo — not marketing. */
  tagline: string
  domain: string
  stack: string
  /** Real counts only. No invented numbers. */
  metrics: readonly { value: string; label: string }[]
  status: WorkStatus
  year: string
  /** Only set when the repo or site is genuinely public. */
  href?: string
  linkLabel?: string
  featured?: boolean
  /** Real product screenshot — proof imagery, never stock. */
  image?: string
  imageAlt?: string
}

/**
 * Real build record — facts read from the actual repositories. Status badges
 * are honest and links only point at genuinely public repos/sites, so this
 * section earns the "no fabricated metrics, no fake screenshots" promise the
 * page makes lower down. Pre-code blueprints are deliberately excluded.
 */
export const workProjects: readonly WorkProject[] = [
  {
    slug: 'nexural',
    index: '01',
    name: 'Nexural',
    tagline:
      'The flagship fintech SaaS — member dashboard, Signal & Swing desks, admin operations, and Stripe billing. The largest, most mature system in the federation.',
    domain: 'Fintech · Trading SaaS',
    stack: 'Next.js · React · TypeScript · Supabase/Postgres · Stripe · Playwright',
    metrics: [
      { value: '398', label: 'test files' },
      { value: '227', label: 'app routes' },
      { value: '206', label: 'SQL files' },
    ],
    status: 'Private',
    year: 'Since 2020',
    href: 'https://github.com/JasonTeixeira/Nexural_Automation',
    linkLabel: 'Open-source lab ↗',
    featured: true,
    image: '/work/nexural-io.webp',
    imageAlt:
      'Nexural.io — the live marketing site: "Institutional trading for the rest of us", with a regime-aware terminal showing ranked setups and risk checks.',
  },
  {
    slug: 'athanor',
    index: '02',
    name: 'Athanor',
    tagline:
      'An AI app factory — describe an app in a sentence and ten agents plan, build in parallel, test-and-fix, QA-gate, review, and deploy it to a live URL.',
    domain: 'AI · App factory',
    stack: 'TypeScript monorepo · Next.js · Postgres · Docker · multi-agent pipeline',
    metrics: [
      { value: '10', label: 'agent pipeline' },
      { value: '~$0.003', label: 'per build' },
      { value: '3', label: 'pricing tiers' },
    ],
    status: 'Private',
    year: '2026',
  },
  {
    slug: 'voza',
    index: '03',
    name: 'Voza',
    tagline:
      'Speaking-first English coaching for Latin America — a full voice loop (STT, AI tutor, TTS, pronunciation scoring) over an adaptive FSRS fluency path.',
    domain: 'EdTech · Voice AI',
    stack: 'Next.js 16 · Supabase · Deepgram · Claude · ElevenLabs · Capacitor',
    metrics: [
      { value: '130', label: 'app routes' },
      { value: '149', label: 'test files' },
      { value: '105', label: 'migrations' },
    ],
    status: 'In beta',
    year: '2026',
  },
  {
    slug: 'nexural-qa-os',
    index: '04',
    name: 'Quality OS',
    tagline:
      'One CLI, 77+ quality runners — plans release gates, executes them across a DAG, scores readiness, and packages tamper-evident, cryptographically-signed audit evidence.',
    domain: 'DevTools · Quality engineering',
    stack: 'TypeScript monorepo · MCP server · Postgres RLS · Sigstore/SLSA L3',
    metrics: [
      { value: '77+', label: 'gate runners' },
      { value: '151', label: 'test files' },
      { value: 'SLSA L3', label: 'evidence' },
    ],
    status: 'Private',
    year: '2026',
  },
  {
    slug: 'giggl',
    index: '05',
    name: 'Giggl',
    tagline:
      'An AI comedy engine across web and mobile — 24 categories, six voice personas, and a taste model that learns what actually makes you laugh.',
    domain: 'Consumer AI · Mobile',
    stack: 'Expo · Next.js API · LightGBM · pgvector · RevenueCat',
    metrics: [
      { value: '40', label: 'mobile screens' },
      { value: '69', label: 'tests' },
      { value: '6', label: 'voice personas' },
    ],
    status: 'In beta',
    year: '2026',
  },
  {
    slug: 'nexural-automation',
    index: '06',
    name: 'Nexural Automation',
    tagline:
      'The open-source automation lab — a research engine, MCP server, Strategy + Bridge SDKs, a futures cost model, and a validation gauntlet, all agent-callable.',
    domain: 'Open source · Quant',
    stack: 'Python · MCP · Docker · NinjaTrader 8 · TradingView',
    metrics: [
      { value: '⭐5', label: 'public' },
      { value: '8', label: 'MCP tools' },
      { value: '5-stage', label: 'bridge' },
    ],
    status: 'Open source',
    year: '2026',
    href: 'https://jasonteixeira.github.io/Nexural_Automation/',
    linkLabel: 'Read the docs ↗',
  },
  {
    slug: 'sage-after-dark',
    index: '07',
    name: 'Sage After Dark',
    tagline:
      'A tactical-editorial publication with a cyberpunk redesign — fully free, live in production on its own domain.',
    domain: 'Publication · Web',
    stack: 'Next.js 15 · React 19 · MDX · Supabase · Resend',
    metrics: [
      { value: '24', label: 'essays' },
      { value: 'Live', label: 'in prod' },
      { value: 'Free', label: 'no paywall' },
    ],
    status: 'Live',
    year: '2026',
    href: 'https://www.sageafterdark.com',
    linkLabel: 'Visit site ↗',
  },
]
