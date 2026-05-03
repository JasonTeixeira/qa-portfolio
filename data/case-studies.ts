export interface CaseStudy {
  slug: string
  number: string
  title: string
  subtitle: string
  summary: string
  tags: string[]
  metrics: { label: string; value: string }[]
  readTime: number
  publishedDate: string
  category: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'nexural-ecosystem',
    number: '01',
    title: 'Building the Nexural Ecosystem',
    subtitle: 'How I designed and built an entire fintech platform from scratch',
    summary: 'From zero to 185 database tables, 69 API endpoints, Stripe billing, Discord AI bot, research engine, and newsletter studio — the full story of building Nexural as sole architect across 7 phases.',
    tags: ['Next.js', '.NET 8', 'Supabase', 'Stripe', 'Discord.js', 'GPT-4o'],
    metrics: [
      { label: 'Tables', value: '185' },
      { label: 'APIs', value: '69' },
      { label: 'Tests', value: '61' },
      { label: 'Phases', value: '7' }
    ],
    readTime: 12,
    publishedDate: '2024-12-01',
    category: 'FinTech'
  },
  {
    slug: 'alphastream',
    number: '02',
    title: 'AlphaStream: ML-Powered Trading Signals',
    subtitle: 'Building a full-stack ML signal platform from scratch',
    summary: '45 engineered features, 28 trained models across 7 futures symbols, walk-forward validation with zero data leakage. FastAPI backend with JWT auth and rate limiting, Next.js dashboard with Supabase Auth and Stripe billing.',
    tags: ['Python', 'scikit-learn', 'XGBoost', 'LightGBM', 'FastAPI', 'Next.js'],
    metrics: [
      { label: 'Features', value: '45' },
      { label: 'Models', value: '28' },
      { label: 'Symbols', value: '7' },
      { label: 'Accuracy', value: '~50%' }
    ],
    readTime: 10,
    publishedDate: '2024-11-15',
    category: 'ML/AI'
  },
  {
    slug: 'aws-landing-zone',
    number: '03',
    title: 'AWS Landing Zone at Enterprise Scale',
    subtitle: 'Multi-account AWS architecture with Terraform and guardrails',
    summary: 'Designing a secure, compliant AWS organization structure with SCPs, centralized audit logging, CI gates, and infrastructure-as-code that scales from startup to enterprise.',
    tags: ['AWS', 'Terraform', 'HCL', 'GitHub Actions', 'Security'],
    metrics: [
      { label: 'Accounts', value: 'Multi' },
      { label: 'IaC', value: '100%' },
      { label: 'CI-Gated', value: 'Yes' },
      { label: 'SCP-Enforced', value: 'Yes' }
    ],
    readTime: 8,
    publishedDate: '2024-10-20',
    category: 'Cloud'
  },
  {
    slug: 'testing-frameworks',
    number: '04',
    title: '13 Testing Frameworks: A Systematic Approach',
    subtitle: 'How I built a comprehensive testing framework for every layer',
    summary: 'API, E2E, mobile, security, visual regression, BDD, performance, contract, web automation — building specialized testing frameworks for every layer of the modern software stack.',
    tags: ['Python', 'Selenium', 'Playwright', 'Appium', 'pytest', 'Cucumber'],
    metrics: [
      { label: 'Frameworks', value: '13' },
      { label: 'Tests', value: '500+' },
      { label: 'Languages', value: '4' },
      { label: 'Coverage', value: 'Full Stack' }
    ],
    readTime: 15,
    publishedDate: '2024-09-10',
    category: 'QA'
  },
  {
    slug: 'nexural-discord-bot',
    number: '05',
    title: 'The Nexural Discord AI Engine',
    subtitle: 'Building an AI-powered trading community bot from scratch',
    summary: '30+ commands, GPT-4o integration, auto-moderation, market intelligence feeds, welcome system, and community management — architected across 12 development phases.',
    tags: ['JavaScript', 'Discord.js', 'GPT-4o', 'Supabase', 'Alpaca API'],
    metrics: [
      { label: 'Commands', value: '30+' },
      { label: 'Phases', value: '12' },
      { label: 'AI-Powered', value: 'Yes' },
      { label: 'Real-Time', value: 'Yes' }
    ],
    readTime: 11,
    publishedDate: '2024-08-05',
    category: 'AI'
  }
]
