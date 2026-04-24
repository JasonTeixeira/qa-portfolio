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
    slug: 'nexquantsite',
    name: 'NexQuantSite',
    description: 'Professional quantitative trading platform with real-time market analytics and algorithmic strategies.',
    category: 'fintech',
    tags: ['TypeScript', 'Next.js', 'React'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/NexQuantSite',
    isPrivate: false,
    featured: false
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
    name: 'CloudResumeChallenge AWS',
    description: 'Full AWS infrastructure — S3, CloudFront, Route53, Lambda, DynamoDB visitor counter. The classic cloud resume challenge.',
    category: 'cloud',
    tags: ['AWS', 'CloudFront', 'Lambda', 'DynamoDB', 'S3'],
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
    slug: 'nexural-research',
    name: 'Nexural Research',
    description: 'Institutional-grade strategy analysis — 71+ metrics, AI-powered insights, and comprehensive research tools.',
    category: 'fintech',
    tags: ['TypeScript', 'Next.js', 'AI'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Nexural-Research',
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
    slug: 'nexural-automation',
    name: 'Nexural Automation',
    description: 'End-to-end automation suite for the Nexural ecosystem — 61 test suites passing, .NET 8 backend.',
    category: 'qa',
    tags: ['TypeScript', '.NET 8', 'Testing', 'Automation'],
    status: 'production',
    github: 'https://github.com/JasonTeixeira/Nexural_Automation',
    isPrivate: false,
    featured: false,
    stars: 2
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
    slug: 'quantumtrader',
    name: 'QuantumTrader',
    description: 'Quantitative trading system with algorithmic execution and risk management.',
    category: 'fintech',
    tags: ['Python', 'Trading', 'Algorithms'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/QuantumTrader',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'trading-scripts',
    name: 'Trading Automation Scripts',
    description: 'Collection of trading automation utilities and scripts for futures market analysis and execution.',
    category: 'fintech',
    tags: ['Python', 'Trading', 'Automation', 'Futures'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/2025-trading-automation-scripts',
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
    description: 'Multi-account AWS Organizations with Terraform, SCPs, centralized audit logging, and CI gates.',
    category: 'cloud',
    tags: ['AWS', 'Terraform', 'HCL', 'GitHub Actions', 'Security'],
    status: 'production',
    github: 'https://github.com/JasonTeixeira/Landing-Zone-Guardrails',
    caseStudy: '/case-studies/aws-landing-zone',
    isPrivate: false,
    featured: true
  },
  {
    slug: 'cloudeng-library',
    name: 'CloudEngLibrary',
    description: 'Enterprise-grade cloud platform library with high availability architecture and auto-scaling patterns.',
    category: 'cloud',
    tags: ['Shell', 'AWS', 'Cloud', 'HA'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/CloudEngLibrary',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'migration-pipeline',
    name: 'Master Migration Pipeline',
    description: 'Enterprise migration pipeline with automated deployment strategies and rollback capabilities.',
    category: 'cloud',
    tags: ['Cloud', 'DevOps', 'Migration', 'Automation'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Master-Migration-Pipeline',
    isPrivate: false,
    featured: false,
    stars: 1
  },
  {
    slug: 'cloudmind',
    name: 'Cloudmind',
    description: 'AI-powered cloud intelligence platform for automated infrastructure optimization and monitoring.',
    category: 'cloud',
    tags: ['Python', 'AWS', 'AI', 'Monitoring'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Cloudmind',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'nexuralflow',
    name: 'NexuralFlow',
    description: 'Infrastructure workflow automation for the Nexural ecosystem deployment pipeline.',
    category: 'cloud',
    tags: ['DevOps', 'Automation', 'CI/CD'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/NexuralFlow',
    isPrivate: false,
    featured: false
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
    slug: 'cicd-pipeline',
    name: 'CI/CD Testing Pipeline',
    description: 'Containerized Kubernetes testing with parallel execution — 82% pipeline time reduction, 500+ tests per build.',
    category: 'qa',
    tags: ['Kubernetes', 'Docker', 'GitHub Actions', 'pytest', 'Prometheus', 'Grafana'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/CI-CD-Pipeline',
    isPrivate: false,
    featured: true
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
    description: 'End-to-end testing framework with full user journey coverage, CI integration, and detailed reporting.',
    category: 'qa',
    tags: ['Python', 'E2E', 'Testing', 'CI'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/E2E-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'bdd-cucumber',
    name: 'BDD Cucumber Framework',
    description: 'Behavior-driven development framework with Gherkin syntax, automated step definitions, and living documentation.',
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
    description: 'Load and performance testing suite with metrics collection, threshold enforcement, and trend analysis.',
    category: 'qa',
    tags: ['Python', 'Performance', 'JMeter', 'Load Testing'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Performance-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'mobile-testing',
    name: 'Mobile Testing Framework',
    description: 'Cross-platform mobile test automation with device farm support, visual validation, and CI integration.',
    category: 'qa',
    tags: ['Python', 'Appium', 'Mobile', 'iOS', 'Android'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Mobile-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'visual-regression',
    name: 'Visual Regression Testing Suite',
    description: 'Automated visual comparison testing with baseline management, diff reporting, and CI integration.',
    category: 'qa',
    tags: ['Python', 'Visual Testing', 'Screenshot', 'CI'],
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
    description: 'Comprehensive test suite for e-commerce — cart, checkout, payment, inventory, and user flow coverage.',
    category: 'qa',
    tags: ['Python', 'E-Commerce', 'Testing', 'Selenium'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/E-Commerce-Test-Suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'contract-testing',
    name: 'Contract Testing Framework',
    description: 'Consumer-driven contract testing for microservices API compatibility verification and versioning.',
    category: 'qa',
    tags: ['Contract Testing', 'Microservices', 'API', 'Pact'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Contract-Testing-Framework',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'security-suite',
    name: 'Security Testing Suite',
    description: 'Security testing automation — OWASP Top 10 checks, vulnerability scanning, and compliance verification.',
    category: 'security',
    tags: ['Python', 'Security', 'OWASP', 'Scanning'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Security-Testing-Suite',
    isPrivate: false,
    featured: false
  },
  {
    slug: 'security-framework',
    name: 'Security Testing Framework',
    description: 'Security-focused testing framework with penetration test automation and vulnerability assessment capabilities.',
    category: 'security',
    tags: ['Python', 'Security', 'Pen Testing'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Security-Testing-Framework',
    isPrivate: false,
    featured: false
  },

  // SECURITY & CRYPTOGRAPHY
  {
    slug: 'nexus-encryption',
    name: 'NexusEncryption',
    description: 'Encryption library with quantum-resistant cryptographic algorithms and secure key management.',
    category: 'security',
    tags: ['Cryptography', 'Security', 'Quantum-Resistant'],
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
  {
    slug: 'riskradar',
    name: 'RiskRadar',
    description: 'Risk assessment and monitoring platform with enterprise and standard editions for threat analysis.',
    category: 'security',
    tags: ['Python', 'Risk Management', 'Security', 'Analytics'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/RiskRadar',
    isPrivate: false,
    featured: false
  },

  // OPEN SOURCE & EDUCATION
  {
    slug: 'togaf-template',
    name: 'TOGAF Master Template',
    description: 'Enterprise architecture documentation template with comprehensive TOGAF framework guidelines and examples.',
    category: 'open-source',
    tags: ['TOGAF', 'Architecture', 'Documentation', 'Enterprise'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/TOGAF-Master-Documenting-Template',
    isPrivate: false,
    featured: false,
    stars: 2
  },
  {
    slug: 'cissp-prep',
    name: 'CISSP Exam Prep',
    description: 'Comprehensive CISSP certification study guide with practice exams and all 8 security domain coverage.',
    category: 'open-source',
    tags: ['CISSP', 'Security', 'Certification', 'Education'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/CISSP-Exam-Prep',
    isPrivate: false,
    featured: false,
    stars: 2
  },
  {
    slug: 'sierra-studies',
    name: 'Nexural Sierra Studies',
    description: 'Curated collection of libraries, packages, and resources for traders using Sierra Chart.',
    category: 'open-source',
    tags: ['Sierra Chart', 'Trading', 'Resources', 'Curated'],
    status: 'active',
    github: 'https://github.com/JasonTeixeira/Nexural_Sierra_Studies',
    isPrivate: false,
    featured: false
  }
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
