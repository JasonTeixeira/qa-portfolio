export interface CaseStudy {
  slug: string
  number: string
  title: string
  subtitle: string
  summary: string
  tags: string[]
  metrics: { label: string; value: string }[]
  outcomes?: { label: string; detail: string }[]
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
    outcomes: [
      { label: 'Shipped from zero to production', detail: '7 phases, fully operational fintech platform with active subscribers' },
      { label: 'Full-stack ownership', detail: 'One engineer architected billing, AI bot, research engine, and newsletter studio end-to-end' },
      { label: 'Live and maintained', detail: 'Platform runs continuously with automated CI, monitoring, and on-call discipline' },
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
    outcomes: [
      { label: 'Production ML pipeline', detail: 'Walk-forward validated models across 7 symbols with zero data leakage — deployed and queryable via API' },
      { label: 'Open-source published', detail: 'AlphaStream Python package on PyPI with documented methodology and reproducible results' },
      { label: 'Full-stack delivery', detail: 'FastAPI backend + Next.js dashboard + Supabase Auth + Stripe billing — solo, 4 weeks' },
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
    outcomes: [
      { label: '100% infrastructure as code', detail: 'Every resource Terraform-managed — no manual console drift, reproducible in any region' },
      { label: 'Enterprise guardrails from day one', detail: 'SCP-enforced policies, centralized audit logging, and CI gates blocking non-compliant changes' },
      { label: 'Days to deploy, not months', detail: 'Modular design ships a compliant multi-account org in a single sprint rather than a quarter-long engagement' },
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
    outcomes: [
      { label: '13 specialized frameworks, zero flake', detail: 'Full coverage from API to mobile to security — each framework independently runnable and CI-integrated' },
      { label: 'Production-grade quality signal', detail: 'Failing PRs catch regressions before they reach staging — not after they reach production' },
      { label: 'Reusable across any stack', detail: 'Python, TypeScript, Java, and Appium implementations covering 4 languages and every major test layer' },
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
    outcomes: [
      { label: '30+ commands, live community', detail: 'AI-powered trading bot serving an active Discord community with real-time market data and moderation' },
      { label: 'GPT-4o integrated end-to-end', detail: 'Natural language Q&A, auto-moderation, and market intelligence pipelines — all wired to production Supabase' },
      { label: 'Shipped across 12 phases', detail: 'Feature-flagged delivery kept the community live throughout development — zero downtime migrations' },
    ],
    readTime: 11,
    publishedDate: '2024-08-05',
    category: 'AI'
  }
]
