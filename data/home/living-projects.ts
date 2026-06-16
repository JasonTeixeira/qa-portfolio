export type LivingProject = {
  slug: 'nexural' | 'alphastream' | 'jobpoise' | 'trayd'
  index: string
  name: string
  href: string
  brand: string
  caption: string
  category: string
  stack: string
  system: string
  screenshot: {
    src: string
    alt: string
  }
  metrics: readonly {
    value: string
    count?: number
    suffix?: string
    label: string
  }[]
}

export const livingProjects: readonly LivingProject[] = [
  {
    slug: 'nexural',
    index: '01',
    name: 'Nexural',
    href: '/work/nexural',
    brand: '#5B8DEF',
    caption: 'Fintech SaaS · 185 tables · 69 APIs',
    category: 'Fintech SaaS',
    stack: 'Next.js · Supabase · 185-table schema',
    system: '69 REST routes · realtime market and treasury surfaces',
    screenshot: {
      src: '/work/screens/nexural-1.png',
      alt: 'Nexural AI trading dashboard showing market chart, open positions, sentiment, and risk exposure',
    },
    metrics: [
      { value: '185', count: 185, label: 'Tables' },
      { value: '69', count: 69, label: 'APIs' },
      { value: '4', count: 4, label: 'Modules' },
    ],
  },
  {
    slug: 'alphastream',
    index: '02',
    name: 'AlphaStream',
    href: '/work/alphastream',
    brand: '#38B98C',
    caption: 'ML trading · 200+ indicators · 5 models',
    category: 'ML trading',
    stack: 'Python · DuckDB · NinjaTrader 8',
    system: '5-model ensemble · 200+ indicator feature space',
    screenshot: {
      src: '/work/screens/alphastream-1.png',
      alt: 'AlphaStream ML dashboard showing model ensemble confidence, equity curve, and feature importance',
    },
    metrics: [
      { value: '200+', count: 200, suffix: '+', label: 'Indicators' },
      { value: '5', count: 5, label: 'Models' },
      { value: '4h', label: 'Timeframe' },
    ],
  },
  {
    slug: 'jobpoise',
    index: '03',
    name: 'Jobpoise',
    href: '/work/jobpoise',
    brand: '#C879F0',
    caption: 'AI copilot · Stripe · 3 tiers',
    category: 'AI SaaS',
    stack: 'TypeScript · Claude API · Stripe',
    system: 'LLM tools routed through subscription gates',
    screenshot: {
      src: '/work/screens/jobpoise-1.png',
      alt: 'Jobpoise AI cover letter generator with job description analysis and version history',
    },
    metrics: [
      { value: '3', count: 3, label: 'Tiers' },
      { value: '3', count: 3, label: 'AI tools' },
      { value: '∞', label: 'Iterations' },
    ],
  },
  {
    slug: 'trayd',
    index: '04',
    name: 'Trayd',
    href: '/work/trayd',
    brand: '#E8923A',
    caption: 'Bilingual trades AI · EN / ES',
    category: 'Field service AI',
    stack: 'Next.js · Voice AI · HouseCall Pro',
    system: 'Bilingual intake and dispatch workflow for trades operators',
    screenshot: {
      src: '/work/screens/trayd-1.png',
      alt: 'Trayd bilingual customer estimate mobile app in English and Spanish',
    },
    metrics: [
      { value: '2', count: 2, label: 'Languages' },
      { value: 'AI', label: 'Dispatch' },
      { value: 'EN/ES', label: 'Voice' },
    ],
  },
]
