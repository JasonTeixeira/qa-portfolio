export interface Project {
  slug: string
  name: string
  description: string
  longDescription?: string
  category: 'full-stack' | 'fintech' | 'cloud' | 'qa' | 'ai' | 'security' | 'open-source'
  tags: string[]
  status: 'production' | 'active' | 'open-source' | 'archived'
  github?: string
  liveUrl?: string
  caseStudy?: string
  image?: string
  stars?: number
  isPrivate: boolean
  featured: boolean
  metrics?: { label: string; value: string }[]
}

export const projects: Project[] = [
  // ═══ FULL-STACK & PLATFORMS ═══
  {
    slug: 'nexural-platform',
    name: 'Nexural Trading Platform',
    description: 'Full-stack fintech platform with real-time market data, AI-powered analysis, Stripe billing, and 185 database tables.',
    category: 'full-stack',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Stripe', 'Vercel'],
    status: 'production',
    liveUrl: 'https://nexural.io',
    caseStudy: '/case-studies/nexural-ecosystem',
    isPrivate: true,
    featured: true,
    metrics: [
      { label: 'DB Tables', value: '185' },
      { label: 'APIs', value: '69' },
      { label: 'Tests', value: '61' },
      { label: 'Phases', value: '7' }
    ]
  },
  {
    slug: 'quality-telemetry',
    name: 'Quality Telemetry Dashboard',
    description: 'CI-artifact-fed quality dashboard with AWS S3 ingestion, 3 data modes, real-time test health, and 6 CI workflows including Playwright E2E.',
    category: 'qa',
    tags: ['Next.js', 'TypeScript', 'Playwright', 'GitHub Actions', 'AWS', 'Terraform'],
    status: 'production',
    github: 'https://github.com/JasonTeixeira/qa-portfolio',
    liveUrl: '/dashboard',
    isPrivate: false,
    featured: true,
    metrics: [
      { label: 'CI Workflows', value: '6' },
      { label: 'Playwright Tests', value: '20+' },
      { label: 'Data Modes', value: '3' },
      { label: 'Commits', value: '156' }
    ]
  },

  // ═══ SAAS TEMPLATES ═══
  {
    slug: 'micro-saas-starter',
    name: 'Micro-SaaS Starter',
    description: 'Production SaaS template — Supabase Auth, Stripe billing with idempotent webhooks, RLS, dashboard. The same patterns behind a 185-table platform, packaged for reuse.',
    category: 'full-stack',
    tags: ['Next.js', 'Supabase', 'Stripe', 'TypeScript', 'Tailwind'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/micro-saas-starter',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Auth', value: 'Supabase' },
      { label: 'Billing', value: 'Stripe' },
      { label: 'RLS', value: 'Enabled' },
      { label: 'Webhooks', value: 'Idempotent' }
    ]
  },

  // ═══ REAL-TIME APPS ═══
  {
    slug: 'realtime-market-dash',
    name: 'Real-Time Market Dashboard',
    description: 'Live crypto dashboard — 8 coins with prices, 7-day SVG sparklines, global market stats. Auto-refresh with graceful degradation. Zero API keys needed.',
    category: 'fintech',
    tags: ['Next.js', 'TypeScript', 'CoinGecko', 'Real-Time', 'SVG'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/realtime-market-dash',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Coins', value: '8' },
      { label: 'Refresh', value: '30s' },
      { label: 'API Routes', value: '2' }
    ]
  },

  // ═══ DEVELOPER TOOLS ═══
  {
    slug: 'sage-cli',
    name: 'sage-dev-cli',
    description: 'Developer CLI for project health audits, scaffolding, and automation. 13 checks across CI, tests, docs, security. Zero dependencies — pure Node.js.',
    category: 'open-source',
    tags: ['Node.js', 'CLI', 'Developer Tools', 'Automation'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/sage-cli',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Commands', value: '4' },
      { label: 'Checks', value: '13' },
      { label: 'Tests', value: '11' },
      { label: 'Dependencies', value: '0' }
    ]
  },

  // ═══ TRADING & FINTECH ═══
  {
    slug: 'trade-engine',
    name: 'Trade Engine',
    description: 'Event-driven order execution engine — strict state machines (7 states, enforced transitions), position tracking with P&L, risk management, event sourcing, simulated broker. 37 tests passing.',
    category: 'fintech',
    tags: ['Python', 'Event Sourcing', 'State Machines', 'Trading', 'Risk Management'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/trade-engine',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Tests', value: '37' },
      { label: 'Order States', value: '7' },
      { label: 'Event Types', value: '9' },
      { label: 'Python', value: '2,200+' }
    ]
  },
  {
    slug: 'alphastream',
    name: 'AlphaStream',
    description: 'ML-powered trading signal system — XGBoost, LightGBM, LSTM models, FastAPI with WebSocket streaming, Redis caching, and event-driven backtesting.',
    category: 'fintech',
    tags: ['Python', 'scikit-learn', 'XGBoost', 'PyTorch', 'FastAPI', 'Redis'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/AlphaStream',
    caseStudy: '/case-studies/alphastream',
    isPrivate: false,
    featured: true,
    stars: 4,
    metrics: [
      { label: 'Indicators', value: '200+' },
      { label: 'ML Models', value: '5' },
      { label: 'GitHub Stars', value: '4' },
      { label: 'Python', value: '208K' }
    ]
  },
  {
    slug: 'nexural-discord-bot',
    name: 'Nexural Discord AI Engine',
    description: 'AI-powered trading community bot — 30+ commands, GPT-4o with financial safety guardrails, auto-moderation, and real-time Alpaca market data.',
    category: 'ai',
    tags: ['JavaScript', 'Discord.js', 'Supabase', 'GPT-4o', 'Alpaca'],
    status: 'production',
    caseStudy: '/case-studies/nexural-discord-bot',
    isPrivate: true,
    featured: true
  },
  {
    slug: 'riskradar',
    name: 'RiskRadar',
    description: 'Portfolio risk platform — Ledoit-Wolf covariance estimation, Monte Carlo VaR, scipy portfolio optimization, FastAPI backend with WebSockets.',
    category: 'fintech',
    tags: ['Python', 'FastAPI', 'Next.js', 'scipy', 'WebSockets'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/RiskRadar',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Risk Engine', value: '35KB' },
      { label: 'Python', value: '83K' },
      { label: 'TypeScript', value: '54K' }
    ]
  },
  {
    slug: 'quantumtrader',
    name: 'QuantumTrader',
    description: 'Event-driven backtesting engine with multiple fill models, MACD/ADX/RSI momentum strategies, and proper Position/Signal/Order abstractions.',
    category: 'fintech',
    tags: ['Python', 'Trading', 'Backtesting', 'Event-Driven'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/QuantumTrader',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'nexural-studio',
    name: 'Nexural Studio',
    description: 'AI-powered market intelligence newsletter platform with automated content generation and distribution.',
    category: 'ai',
    tags: ['TypeScript', 'AI', 'Newsletter', 'Automation'],
    status: 'production',
    isPrivate: true,
    featured: false
  },
  {
    slug: 'nt8-alert-system',
    name: 'NT8 Alert System',
    description: 'Real-time trading alert system for NinjaTrader 8 — .NET backend with Next.js dashboard frontend.',
    category: 'fintech',
    tags: ['C#/.NET', 'Next.js', 'NinjaTrader', 'Real-Time'],
    status: 'production',
    isPrivate: true,
    featured: false
  },
  {
    slug: 'nexural-strategy-tracker',
    name: 'Nexural Strategy Tracker',
    description: 'Strategy performance tracking application for monitoring and analyzing trading system results over time.',
    category: 'fintech',
    tags: ['HTML', 'Trading', 'Analytics'],
    status: 'production',
    isPrivate: true,
    featured: false
  },

  // ═══ CLOUD & INFRASTRUCTURE ═══
  {
    slug: 'terraform-aws-modules',
    name: 'Terraform AWS Module Library',
    description: 'Production-ready Terraform modules — VPC (multi-AZ, NAT, flow logs), S3+CloudFront static sites, Lambda API Gateway, GitHub OIDC keyless CI/CD. CI-tested with Checkov security scanning.',
    category: 'cloud',
    tags: ['Terraform', 'AWS', 'HCL', 'GitHub Actions', 'Checkov'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/terraform-aws-modules',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Modules', value: '4' },
      { label: 'HCL Lines', value: '1,600+' },
      { label: 'CI Checks', value: '3' }
    ]
  },
  {
    slug: 'aws-landing-zone',
    name: 'AWS Landing Zone + Guardrails',
    description: 'Multi-account AWS Organizations architecture with Terraform, SCPs, centralized audit logging, and CI gates.',
    category: 'cloud',
    tags: ['AWS', 'Terraform', 'HCL', 'GitHub Actions', 'Security'],
    status: 'production',
    caseStudy: '/case-studies/aws-landing-zone',
    isPrivate: true,
    featured: true
  },

  // ═══ QA & TESTING ═══
  {
    slug: 'ecommerce-tests',
    name: 'E-Commerce Test Suite',
    description: 'Full-spectrum QA suite — UI, API, accessibility, performance (Locust), security, visual regression, and integration tests. 250K+ Python, 278+ tests.',
    category: 'qa',
    tags: ['Python', 'Selenium', 'Locust', 'pytest', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/E-Commerce-Test-Suite',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Tests', value: '278+' },
      { label: 'Python', value: '250K' },
      { label: 'Test Types', value: '7' },
      { label: 'Commits', value: '12' }
    ]
  },
  {
    slug: 'selenium-framework',
    name: 'Web Automation Framework',
    description: 'Production Selenium framework — Page Object Model, multi-browser support, pytest-xdist parallel execution, Docker, and CI integration. 118+ tests.',
    category: 'qa',
    tags: ['Python', 'Selenium', 'pytest', 'Docker', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Web-Automation-Test-Framework',
    isPrivate: false,
    featured: false,
    metrics: [
      { label: 'Tests', value: '118+' },
      { label: 'Python', value: '120K' },
      { label: 'Commits', value: '10' }
    ]
  },
  {
    slug: 'api-test-automation',
    name: 'API Test Automation Framework',
    description: 'Layered API testing — smart retry on 429/5xx, Pydantic schema validation, session pooling for 3x speed, Docker containerized, full CI pipeline.',
    category: 'qa',
    tags: ['Python', 'pytest', 'Requests', 'Pydantic', 'Docker', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/API-Test-Automation-Wireframe',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'security-suite',
    name: 'Security Testing Suite',
    description: 'OWASP Top 10 automated scanning — SQL injection detection, XSS scanning, secrets detection, with CWE ID tracking and severity classification.',
    category: 'security',
    tags: ['Python', 'Security', 'OWASP', 'Scanning', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Security-Testing-Suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'visual-regression',
    name: 'Visual Regression Testing Suite',
    description: 'Automated visual comparison testing with Percy integration, multi-viewport snapshots, baseline management, and CI workflow.',
    category: 'qa',
    tags: ['Python', 'Percy', 'Visual Testing', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/visual-regression-testing-suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'api-testing',
    name: 'API Testing Framework',
    description: 'REST API testing with FastAPI test app, request chaining, data-driven tests, schema validation, and environment management.',
    category: 'qa',
    tags: ['Python', 'FastAPI', 'API', 'REST', 'Testing'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/API-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'cicd-pipeline',
    name: 'CI/CD Testing Pipeline',
    description: 'Containerized testing pipeline architecture with Docker, Kubernetes configs, Jenkins pipelines, and parallel execution patterns.',
    category: 'qa',
    tags: ['Kubernetes', 'Docker', 'Jenkins', 'pytest', 'CI/CD'],
    status: 'active',
    isPrivate: true,
    featured: false
  },

  // ═══ SECURITY ═══
  {
    slug: 'nexus-encryption',
    name: 'NexusEncryption',
    description: 'Desktop encryption app built with Tauri + Rust backend — OS keychain integration, AES-256-GCM encryption, and Next.js 15 frontend.',
    category: 'security',
    tags: ['Tauri', 'Rust', 'TypeScript', 'Cryptography'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/NexusEncryption',
    isPrivate: false,
    featured: false
  },
]

export const categories = [
  { slug: 'all', name: 'All', count: projects.length },
  { slug: 'full-stack', name: 'Full-Stack', count: projects.filter(p => p.category === 'full-stack').length },
  { slug: 'fintech', name: 'Trading & FinTech', count: projects.filter(p => p.category === 'fintech').length },
  { slug: 'cloud', name: 'Cloud & Infra', count: projects.filter(p => p.category === 'cloud').length },
  { slug: 'qa', name: 'QA & Testing', count: projects.filter(p => p.category === 'qa').length },
  { slug: 'ai', name: 'AI & Automation', count: projects.filter(p => p.category === 'ai').length },
  { slug: 'security', name: 'Security', count: projects.filter(p => p.category === 'security').length },
]

export const featuredProjects = projects.filter(p => p.featured)
