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
  // FULL-STACK & PLATFORMS
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
    description: 'CI-artifact-fed quality dashboard with AWS S3 ingestion. Real-time test health, coverage trends, and quality metrics.',
    category: 'qa',
    tags: ['Next.js', 'TypeScript', 'Playwright', 'GitHub Actions', 'AWS'],
    status: 'production',
    github: 'https://github.com/JasonTeixeira/qa-portfolio',
    liveUrl: '/dashboard',
    isPrivate: false,
    featured: true
  },
  {
    slug: 'cloud-resume-aws',
    name: 'Cloud Resume Challenge AWS',
    description: 'Full AWS infrastructure — S3, CloudFront, Route53, Lambda, DynamoDB visitor counter with CloudFormation IaC.',
    category: 'cloud',
    tags: ['AWS', 'CloudFront', 'Lambda', 'DynamoDB', 'CloudFormation'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/CloudResumeChallangeAWS',
    isPrivate: false,
    featured: false
  },

  // TRADING & FINTECH
  {
    slug: 'alphastream',
    name: 'AlphaStream',
    description: 'ML-powered trading signal generation — 200+ indicators, 5 ML models, backtesting engine, real-time streaming.',
    category: 'fintech',
    tags: ['Python', 'ML/AI', 'scikit-learn', 'pandas', 'NumPy'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/AlphaStream',
    caseStudy: '/case-studies/alphastream',
    isPrivate: false,
    featured: true,
    stars: 4
  },
  {
    slug: 'nexural-discord-bot',
    name: 'Nexural Discord AI Engine',
    description: 'AI-powered trading community bot — 30+ commands, GPT-4o, auto-moderation, market intelligence, 12 dev phases.',
    category: 'ai',
    tags: ['JavaScript', 'Discord.js', 'Supabase', 'GPT-4o', 'Alpaca'],
    status: 'production',
    caseStudy: '/case-studies/nexural-discord-bot',
    isPrivate: true,
    featured: true
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
    slug: 'riskradar',
    name: 'RiskRadar',
    description: 'Full-stack risk assessment platform — FastAPI backend with 35KB risk engine, Next.js frontend, real-time threat analysis.',
    category: 'security',
    tags: ['Python', 'FastAPI', 'Next.js', 'Risk Management'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/RiskRadar',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'quantumtrader',
    name: 'QuantumTrader',
    description: 'Quantitative trading system with algorithmic execution, backtesting engine, momentum strategies, and risk management.',
    category: 'fintech',
    tags: ['Python', 'Trading', 'Algorithms', 'Backtesting'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/QuantumTrader',
    isPrivate: false,
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

  // CLOUD & INFRASTRUCTURE
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

  // QA & TESTING FRAMEWORKS
  {
    slug: 'api-test-automation',
    name: 'API Test Automation Framework',
    description: 'Layered API testing with smart retry on 429/5xx, Pydantic validation, session pooling — 3x speed improvement.',
    category: 'qa',
    tags: ['Python', 'pytest', 'Requests', 'Pydantic', 'Docker', 'GitHub Actions'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/API-Test-Automation-Wireframe',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'selenium-framework',
    name: 'Selenium Python Framework',
    description: 'Production-ready Selenium framework with Page Object Model, cross-browser support, and comprehensive reporting.',
    category: 'qa',
    tags: ['Python', 'Selenium', 'pytest', 'POM'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Web-Automation-Test-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'e2e-framework',
    name: 'E2E Framework',
    description: 'End-to-end testing framework with Selenium POM architecture, full user journey coverage, and CI integration.',
    category: 'qa',
    tags: ['Python', 'Selenium', 'E2E', 'Testing', 'CI'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/E2E-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'security-suite',
    name: 'Security Testing Suite',
    description: 'Security testing automation — 31KB security scanner, API security module, secrets detection, OWASP Top 10 coverage.',
    category: 'security',
    tags: ['Python', 'Security', 'OWASP', 'Scanning'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Security-Testing-Suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'bdd-cucumber',
    name: 'BDD Cucumber Framework',
    description: 'Behavior-driven development framework with Gherkin syntax, automated step definitions, and GitHub Actions CI.',
    category: 'qa',
    tags: ['Python', 'BDD', 'Cucumber', 'Gherkin'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/BDD-Cucumber-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'performance-testing',
    name: 'Performance Testing Framework',
    description: 'Load testing suite built with Locust — configurable user scenarios, metrics collection, and threshold enforcement.',
    category: 'qa',
    tags: ['Python', 'Locust', 'Performance', 'Load Testing'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Performance-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'visual-regression',
    name: 'Visual Regression Testing Suite',
    description: 'Automated visual comparison testing with Percy integration, baseline management, and CI integration.',
    category: 'qa',
    tags: ['Python', 'Visual Testing', 'Percy', 'CI'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/visual-regression-testing-suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'api-testing',
    name: 'API Testing Framework',
    description: 'REST API testing framework with request chaining, data-driven tests, schema validation, and environment management.',
    category: 'qa',
    tags: ['Python', 'API', 'REST', 'Testing'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/API-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'ecommerce-tests',
    name: 'E-Commerce Test Suite',
    description: 'Comprehensive test suite for e-commerce platforms — cart, checkout, payment, inventory, and user flow coverage.',
    category: 'qa',
    tags: ['Python', 'E-Commerce', 'Testing', 'Selenium'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/E-Commerce-Test-Suite',
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

  // SECURITY & CRYPTOGRAPHY
  {
    slug: 'nexus-encryption',
    name: 'NexusEncryption',
    description: 'Desktop encryption application built with Tauri — TypeScript crypto library with modern cryptographic standards.',
    category: 'security',
    tags: ['TypeScript', 'Tauri', 'Cryptography', 'Security'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/NexusEncryption',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'eidocrypt',
    name: 'Eidocrypt',
    description: 'Encryption and decryption tool with secure file processing and modern cryptographic standards.',
    category: 'security',
    tags: ['JavaScript', 'Cryptography', 'Security'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Eidocrypt',
    isPrivate: false,
    featured: false
  },

  // OPEN SOURCE & EDUCATION
  {
    slug: 'cissp-prep',
    name: 'CISSP Exam Prep',
    description: 'Comprehensive 105KB CISSP certification study guide covering all 8 security domains with practice materials.',
    category: 'open-source',
    tags: ['CISSP', 'Security', 'Certification', 'Education'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/CISSP-Exam-Prep',
    isPrivate: false,
    featured: false,
    stars: 2
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
  { slug: 'open-source', name: 'Open Source', count: projects.filter(p => p.category === 'open-source').length }
]

export const featuredProjects = projects.filter(p => p.featured)
