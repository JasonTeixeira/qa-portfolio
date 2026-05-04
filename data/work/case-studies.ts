export type CaseStudy = {
  slug: string
  title: string
  posterTitle?: string // film-poster headline shown above title on case study + grid
  client: string
  tagline: string
  category: 'Fintech' | 'AI/ML' | 'Infrastructure' | 'Product' | 'DevTools'
  tags: string[]
  kicker: string // one-line outcome
  problem: string[]      // paragraphs
  approach: string[]     // paragraphs
  build: string[]        // paragraphs
  outcome: string[]      // paragraphs
  metrics: { label: string; value: string }[]
  artifacts?: string[]
  /**
   * Visual proof gallery shown on the case study page between "Approach" and
   * "What shipped". Architecture diagrams, screenshots, terminal output,
   * dashboards — the actual evidence the work happened.
   */
  gallery?: {
    src: string
    caption: string
    kind: 'diagram' | 'screenshot' | 'terminal' | 'dashboard' | 'report'
    label?: string
    aspect?: 'video' | 'square' | 'wide' | 'portrait'
  }[]
  relatedLab?: string  // slug of /lab item
  ctaPrimary?: { label: string; href: string }
  ctaSecondary?: { label: string; href: string }
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'nexural',
    title: 'Nexural — Full-Stack Fintech Platform',
    posterTitle: 'A trading platform built like an institution. Run by one person.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A production-grade trading platform with real-time execution, portfolio tracking, a Discord-native AI companion, and Stripe billing.',
    category: 'Fintech',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'Supabase', 'Stripe', 'Discord API', 'GPT-4'],
    kicker: '185 tables. 69 endpoints. One engineer.',
    problem: [
      'Most trading tools fall into one of two categories: consumer apps so simplified they\'re useless for serious traders, or enterprise platforms so complex they require an ops team to configure. There was no middle ground for the technically sophisticated individual trader who wanted full control without the overhead.',
      'Nexural was built to fill that gap — a production-grade fintech platform with real-time execution, portfolio tracking, a Discord-native AI companion, and a subscription billing layer that doesn\'t break on webhook retries.',
      'The challenge: building a system at this scale — 185 relational database tables, 69 API endpoints, real-time market data ingestion, and a Stripe integration that needs to survive every edge case — without a dedicated backend team, a QA department, or a six-month runway for architecture review.',
    ],
    approach: [
      'PostgreSQL on Supabase with Row-Level Security for multi-tenant isolation and real-time subscriptions via Supabase channels for live portfolio updates. Backend: FastAPI (Python) — async-first, typed with Pydantic, organized into domain-bounded modules. Frontend: Next.js with server components for data-heavy pages and client components for interactive trading UI.',
      'Real-time via WebSocket connections for live price feeds; Supabase realtime for portfolio state synchronization. Stripe with idempotent webhook handlers, subscription lifecycle management, and metered feature gating. Discord bot backed by OpenAI GPT-4 with tool-calling for portfolio queries, market commentary, and alert management.',
      'The philosophy: don\'t build features until the foundation is right. The first two weeks were data modeling — no UI, no API, just entity-relationship design, understanding where the RLS policies needed to live, and mapping every Stripe event to a database state.',
    ],
    build: [
      '185 PostgreSQL tables with full RLS policy coverage. 69 REST/WebSocket API endpoints (FastAPI). Real-time portfolio dashboard (Next.js + Supabase realtime). Trade execution interface with order management. Discord AI bot: portfolio queries, alerts, natural-language market commentary.',
      'Stripe billing: subscription tiers, metered usage, trial periods, webhook idempotency. 61 test suites: unit, integration, E2E, contract, and security tests. CI/CD pipeline with GitHub Actions — no PR merges without passing gates.',
      'The Stripe webhook layer is built on idempotency keys and event deduplication — a pattern now templated into micro-saas-starter on GitHub. The Discord bot uses function-calling to query the live portfolio API, meaning it responds to "how is my AAPL position" with real data, not hallucinated commentary.',
    ],
    outcome: [
      'Platform operational: live, stable, serving active users. Zero billing incidents since launch — the idempotent webhook architecture holds. AI bot handling 200+ natural-language portfolio queries per week.',
      '61 test suites provide regression coverage for all critical paths. Architecture patterns extracted into 3 open-source templates used in subsequent projects.',
      'A single engineer, with the right architecture discipline and AI-assisted development workflow, can build and maintain a system at this complexity level. The 185-table schema isn\'t a vanity number — it\'s a data architecture that needed to be right before anything was built on top of it.',
    ],
    metrics: [
      { label: 'DB Tables', value: '185' },
      { label: 'API Endpoints', value: '69' },
      { label: 'Test Suites', value: '61' },
      { label: 'Billing Incidents', value: '0' },
      { label: 'AI Queries/Week', value: '200+' },
      { label: 'OSS Templates', value: '3' },
    ],
    artifacts: [
      'Database schema overview (anonymized)',
      'Webhook idempotency pattern documentation',
      'Discord bot architecture diagram',
      'CI/CD pipeline configuration template',
    ],
    gallery: [
      {
        src: '/images/diagrams/nexural-ecosystem.svg',
        kind: 'diagram',
        label: 'System map',
        aspect: 'wide',
        caption: 'The full Nexural surface area: trading platform, Discord-native AI bot, billing, real-time market data, and the seven services that talk to each other through typed contracts.',
      },
      {
        src: '/artifacts/evidence/playwright-report.svg',
        kind: 'report',
        label: 'CI · Playwright',
        aspect: 'video',
        caption: '61 test suites green on every PR. End-to-end coverage across trading flows, billing webhooks, and Discord bot interactions — the regression net that lets one engineer ship into production.',
      },
      {
        src: '/artifacts/evidence/lighthouse-ci.svg',
        kind: 'dashboard',
        label: 'Lighthouse CI',
        aspect: 'video',
        caption: 'Performance, accessibility, and best-practices budgets enforced in CI. The dashboard fails the build if a PR regresses the user-facing surface — not after launch.',
      },
    ],
    relatedLab: 'nexural',
    ctaPrimary: { label: 'Explore the Lab entry for Nexural', href: '/lab/nexural' },
    ctaSecondary: { label: 'Build something like this', href: '/services/build' },
  },
  {
    slug: 'alphastream',
    title: 'AlphaStream — ML Trading Signal Engine',
    posterTitle: 'Five models. Two hundred indicators. No black boxes.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A Python-based ML signal engine with 200+ technical indicators and 5 ensemble models — explainable, auditable, and open source.',
    category: 'AI/ML',
    tags: ['Python', 'XGBoost', 'LightGBM', 'scikit-learn', 'pandas', 'TA-Lib'],
    kicker: '200 indicators. 5 models. Open source.',
    problem: [
      'Most algorithmic trading tools are black boxes — a signal output with no visibility into why it fired, what inputs drove it, or how it would have performed historically. For a technically sophisticated trader, that\'s not a tool. It\'s a guess with a UI.',
      'AlphaStream was built around a different premise: every signal should be explainable, every model should be auditable, and the entire system should run in Python on hardware you control.',
      'The challenge: building a signal engine simultaneously comprehensive enough to cover 200+ technical indicators across multiple timeframes, fast enough to process live market data without falling behind, and transparent enough that a practitioner can understand exactly what drove each output.',
    ],
    approach: [
      'Data layer: market data ingestion from multiple sources, normalized into a unified OHLCV + extended data model. Indicator layer: 200+ technical indicators computed via pandas, TA-Lib, and custom implementations — RSI, MACD, Bollinger Bands, ADX, Ichimoku, custom momentum composites.',
      'ML layer: 5 models trained per instrument/timeframe — XGBoost (gradient boosting, primary signal), LightGBM (secondary signal, speed-optimized), Random Forest (confidence calibration), Ridge Regression (trend baseline), and an Ensemble Voter combining all four with learned weights. Backtesting via walk-forward validation with held-out test sets — no look-ahead bias.',
      'Feature engineering is where the edge lives. The 200+ indicators aren\'t noise — they\'re the vocabulary the models learn from. The ensemble architecture ensures no single model dominates, and the agreement score tells you when the models disagree (which is itself a signal).',
    ],
    build: [
      'Python package with clean CLI and programmatic API. 200+ indicator implementations (TA-Lib + pandas + custom). 5 trained model pipeline (XGBoost, LightGBM, RF, Ridge, Ensemble). Backtesting engine with walk-forward validation.',
      'Signal output with explainability layer (feature importance, SHAP values). Public GitHub repository: 5★, 2 forks, active maintenance. Full documentation including strategy examples.',
    ],
    outcome: [
      '5★ GitHub rating from practitioners in the quant/algo trading community. 2 forks by external developers extending the system for their own use cases.',
      'Walk-forward backtests across multiple instruments and timeframes demonstrating consistent signal quality. SHAP explainability output allows practitioners to understand per-signal feature attribution.',
      'ML signal engines for trading don\'t require a hedge fund infrastructure team. A well-engineered Python package with the right architecture can be built, maintained, and extended by a single practitioner — and released as open source without compromising the core thesis.',
    ],
    metrics: [
      { label: 'Indicators', value: '200+' },
      { label: 'ML Models', value: '5' },
      { label: 'GitHub Stars', value: '5★' },
      { label: 'External Forks', value: '2' },
    ],
    artifacts: [
      'GitHub repository → github.com/jteixeira/alphastream',
      'Strategy documentation',
      'Backtesting methodology notes',
    ],
    gallery: [
      {
        src: '/images/diagrams/alphastream-pipeline.svg',
        kind: 'diagram',
        label: 'ML pipeline',
        aspect: 'wide',
        caption: 'Market data → feature engineering → five-model ensemble → walk-forward validation → streaming signal output. Every stage is observable, every prediction has provenance.',
      },
      {
        src: '/artifacts/evidence/percy-diff.svg',
        kind: 'screenshot',
        label: 'Visual diff',
        aspect: 'video',
        caption: 'Percy visual regression on the strategy dashboard. Pixel-level diffs catch chart regressions before they reach the people who actually trade off them.',
      },
    ],
    relatedLab: 'alphastream',
    ctaPrimary: { label: 'View AlphaStream on GitHub', href: 'https://github.com/jteixeira/alphastream' },
    ctaSecondary: { label: 'Build an AI workflow', href: '/services/automate' },
  },
  {
    slug: 'jobpoise',
    title: 'Jobpoise — AI Job Copilot',
    posterTitle: 'The job search, weaponized for the qualified.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A citation-grounded AI job application copilot with Chrome extension, Gmail tracking, and three pricing tiers.',
    category: 'Product',
    tags: ['Next.js 15', 'OpenAI GPT-4', 'Stripe', 'Chrome Extension', 'Gmail API', 'Turborepo'],
    kicker: 'The job search, engineered.',
    problem: [
      'Job seekers face a documentation problem, not an inspiration problem. They know what they want to say — they just need help saying it in language that matches the role, passes ATS screening, and sounds like a human wrote it. Tools that generate generic cover letters from nothing miss the entire point.',
      'Jobpoise was built around citation-grounded generation: every piece of AI-generated content traces back to the candidate\'s actual experience, the actual job description, and named sources. No hallucinated accomplishments. No fabricated skills.',
      'The challenge: building a product that is technically defensible (citation-grounded), commercially sustainable (Stripe paywall with sensible tier design), and usable in the actual workflow (Chrome extension for in-browser job applications and Gmail integration for application tracking) — all in a single Next.js monorepo.',
    ],
    approach: [
      'Monorepo: Next.js 15 with Turborepo — web app and Chrome extension as separate packages, sharing types and utility functions. AI layer: GPT-4 with structured prompting for citation-grounded generation. Every output includes a citation map linking content to input sources (resume bullets, JD requirements).',
      'Chrome extension: Manifest V2, injects into major job board UIs (LinkedIn, Indeed, Greenhouse), enables one-click draft generation from the current JD. Gmail integration: OAuth-scoped Gmail API access to track sent applications, surface follow-up timing, and detect response patterns.',
      'Billing: Stripe Checkout + Customer Portal. Three tiers — Drift (free) to prove value, Poise ($39/mo) for unlimited generations + Gmail tracking, Compose ($79/mo) for Chrome extension + priority processing. CI: 5 CI checks passing on main — type check, lint, unit tests, build, and E2E smoke test.',
    ],
    build: [
      'Next.js 15 monorepo (web app + Chrome extension as packages). Citation-grounded AI generation (GPT-4 + structured prompt layer). Chrome extension v2 with job board injection. Gmail OAuth integration with application tracking dashboard.',
      'Stripe Checkout + Customer Portal (3 tiers). 5 CI checks passing on main branch. Production deployment with auth, data persistence, and billing all live.',
    ],
    outcome: [
      'Fully merged main branch — no open feature PRs blocking production. All 5 CI gates passing: TypeScript, ESLint, unit tests, build, E2E smoke. Stripe billing live and processing test transactions.',
      'Chrome extension functional on LinkedIn, Indeed, and Greenhouse. Three-tier pricing model ready for go-to-market.',
      'A monorepo with a web app and a browser extension, sharing types and utilities, can be built and maintained by a single engineer without sacrificing CI discipline. The citation-grounding architecture is the differentiator — it\'s what separates Jobpoise from a GPT wrapper with a job-shaped UI.',
    ],
    metrics: [
      { label: 'CI Gates', value: '5/5' },
      { label: 'Pricing Tiers', value: '3' },
      { label: 'Job Boards', value: 'LinkedIn, Indeed, Greenhouse' },
      { label: 'Open PRs (main)', value: '0' },
    ],
    relatedLab: 'jobpoise',
    ctaPrimary: { label: 'Explore the Lab entry for Jobpoise', href: '/lab/jobpoise' },
    ctaSecondary: { label: 'Build a product like this', href: '/services/build' },
  },
  {
    slug: 'trayd',
    title: 'Trayd — AI Companion for the Trades',
    posterTitle: 'Built for the people who fix what breaks.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A bilingual AI companion for residential HVAC contractors — estimate builder, diagnostic AI, callback scheduler.',
    category: 'Product',
    tags: ['Next.js', 'FastAPI', 'Supabase', 'PWA', 'Resend', 'AWS S3'],
    kicker: 'Built for the people who fix what breaks.',
    problem: [
      'The residential trades — HVAC, plumbing, electrical — are a $500B+ industry running largely on clipboards, group texts, and spreadsheets. The software solutions that exist were designed for office workers: complex UI, English-only, cloud-dependent, and priced for enterprise procurement.',
      'The Phoenix metro area alone has thousands of residential HVAC contractors, many of them small owner-operated businesses with bilingual teams. They need tools that work the way they work — fast, offline-capable, bilingual, and built around their actual job: diagnosing systems, writing estimates, booking callbacks.',
      'The specific problems: estimates written in the field get lost before follow-up; crews switch between English and Spanish mid-conversation but tools don\'t; technicians need diagnostic guidance without slow jobsite connections; callbacks fall through without a lightweight CRM a field tech will actually use.',
    ],
    approach: [
      'Bilingual from day one: not a translation layer bolted on later. Every UI element, every AI response, every notification authored in both English and Spanish. Language toggles at the session level — a crew member can switch languages without logging out.',
      'Mobile-first, offline-capable: technicians use phones, not laptops. Every core workflow (estimate creation, diagnostic lookup, callback scheduling) works with degraded connectivity. AI companion, not AI replacement: the AI provides reference documentation, suggests follow-up questions, and drafts estimates based on technician notes.',
      'Stack: Next.js (PWA with service worker for offline), FastAPI backend with Spanish/English prompt templates, Supabase (auth + data with RLS for multi-tenant team accounts), Resend for transactional email, AWS S3 for invoice/estimate PDF storage. Bootstrapped pre-seed with no external capital.',
    ],
    build: [
      'Bilingual UI (EN/ES) — all copy, labels, AI responses, and notifications. AI diagnostic companion — natural-language symptom input, structured system guidance output. Estimate builder — field-input form → branded PDF → email delivery.',
      'Callback scheduler — lightweight CRM for follow-up management. PWA with offline mode for core workflows. Beta deployment to initial Phoenix-area HVAC contractors.',
    ],
    outcome: [
      'Beta live with initial cohort of Phoenix-area HVAC contractors. 100% bilingual coverage from first public release — no "coming soon" for Spanish. Estimate-to-callback workflow tested and validated by actual contractors.',
      'Zero external capital required to reach beta: fully bootstrapped.',
      'Bilingual-from-scratch is an engineering discipline, not a translation afterthought. Building it into the architecture (prompt templates, UI copy management, locale routing) from day one is significantly less work than retrofitting it. Trayd validated that small trades businesses will adopt software if it matches their actual workflow.',
    ],
    metrics: [
      { label: 'Languages', value: 'EN + ES' },
      { label: 'External Capital', value: '$0' },
      { label: 'Market', value: 'Phoenix Metro' },
      { label: 'Status', value: 'Beta Live' },
    ],
    gallery: [
      {
        src: '/images/diagrams/cicd-pipeline.svg',
        kind: 'diagram',
        label: 'CI/CD',
        aspect: 'wide',
        caption: 'Push → lint → typecheck → unit → contract → E2E → staging deploy → smoke → prod. Every gate blocks the merge. Every prod deploy is rollback-ready in 30 seconds.',
      },
      {
        src: '/artifacts/evidence/github-actions-run.svg',
        kind: 'terminal',
        label: 'GitHub Actions',
        aspect: 'video',
        caption: 'A real workflow run from the Trayd repo. Test matrix across Node versions, parallelized job graph, all green — the boring screenshot that lets you sleep at night.',
      },
    ],
    relatedLab: 'trayd',
    ctaPrimary: { label: 'Explore the Lab entry for Trayd', href: '/lab/trayd' },
    ctaSecondary: { label: 'Build an AI product', href: '/services/automate' },
  },
  {
    slug: 'aws-landing-zone',
    title: 'AWS Landing Zone & Guardrails',
    posterTitle: 'Infrastructure that survives the on-call rotation.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A Terraform-based AWS foundation covering VPC architecture, GitHub OIDC, security guardrails, and CI-tested infrastructure modules.',
    category: 'Infrastructure',
    tags: ['AWS', 'Terraform', 'GitHub Actions', 'OIDC', 'tfsec', 'checkov'],
    kicker: 'Infrastructure that doesn\'t need babysitting.',
    problem: [
      'The pattern is familiar: a startup spins up AWS resources manually, the "just this once" approach becomes the permanent approach, and two years later nobody knows what\'s in the account, the IAM policies are a maze, and the first security audit is a bad day.',
      'Good infrastructure should be boring. Reproducible, documented, version-controlled, and provably secure. The AWS Landing Zone project establishes that baseline from day one.',
      'The challenge: building a Terraform-based AWS foundation that covers the real requirements — proper VPC architecture, secure S3+CloudFront patterns, Lambda API scaffolding, GitHub Actions OIDC (no long-lived AWS keys), account-level guardrails, and CI gates that prevent misconfiguration from reaching production — all packaged as reusable modules.',
    ],
    approach: [
      'VPC Module: multi-AZ VPC with public/private subnet split, NAT gateway configuration, VPC flow logs, security group baseline. S3 + CloudFront Module: static asset distribution with proper bucket policies, CloudFront OAI, cache invalidation patterns, HTTPS enforcement. Lambda API Module: function configuration, IAM execution role, API Gateway V2, environment variable management, log group with retention.',
      'GitHub OIDC Module: federated identity between GitHub Actions and AWS — eliminates long-lived access keys from CI pipelines entirely. Landing Zone Module: AWS Control Tower-compatible baseline — root account security, SCP guardrails, CloudTrail, Config Rules, Security Hub findings.',
      'Every module CI-tested with: terraform fmt check, terraform validate, tfsec security scanning, checkov compliance scanning, automated plan on PR, apply on merge to main (with approval gate).',
    ],
    build: [
      '4 public Terraform modules (terraform-aws-vpc, terraform-aws-s3-cloudfront, terraform-aws-lambda-api, terraform-aws-github-oidc). AWS Landing Zone module with full guardrail set. CI/CD pipeline: GitHub Actions workflows for all modules.',
      'Security scanning: tfsec + checkov integrated into every PR. Documentation: README for each module with example configurations and variable references.',
    ],
    outcome: [
      'All modules CI-tested and security-scanned with zero known critical vulnerabilities. GitHub OIDC pattern eliminates long-lived AWS credentials from every pipeline that adopts it.',
      'Landing Zone module provides a documented, reproducible baseline for new AWS accounts. Modules in use across 3 Sage Ideas products (Nexural, Jobpoise, Trayd).',
      'Infrastructure-as-Code disciplines — version control, CI testing, security scanning, modular design — should apply to AWS configuration exactly as they apply to application code. The modules here represent the baseline applied to every new project, not an optional enhancement.',
    ],
    metrics: [
      { label: 'Terraform Modules', value: '4' },
      { label: 'Critical Vulns', value: '0' },
      { label: 'Products Using Modules', value: '3' },
      { label: 'Long-Lived Keys', value: 'Eliminated' },
    ],
    artifacts: [
      'GitHub: All 4 Terraform modules (public)',
      'Module documentation and example configurations',
      'CI pipeline templates',
    ],
    gallery: [
      {
        src: '/images/diagrams/aws-landing-zone.svg',
        kind: 'diagram',
        label: 'AWS architecture',
        aspect: 'wide',
        caption: 'Multi-account AWS landing zone with hub-spoke topology, centralized logging, security boundaries, and per-account guardrails. The Terraform that makes this reproducible is the deliverable.',
      },
      {
        src: '/artifacts/evidence/landing-zone-ci.svg',
        kind: 'terminal',
        label: 'Terraform plan',
        aspect: 'video',
        caption: 'CI run on a Terraform PR — plan output is reviewed, security scan runs, and only then does the apply happen. Infrastructure changes get the same review treatment as application code.',
      },
      {
        src: '/artifacts/evidence/security-scan.svg',
        kind: 'report',
        label: 'Security scan',
        aspect: 'video',
        caption: 'tfsec / Checkov scan output enforced as a CI gate. Misconfigured S3 buckets, open security groups, and weak IAM policies fail the build before they touch a real account.',
      },
    ],
    ctaPrimary: { label: 'View Terraform modules on GitHub', href: 'https://github.com/jteixeira' },
    ctaSecondary: { label: 'Discuss a Build engagement', href: '/services/build' },
  },
  {
    slug: 'quality-telemetry',
    title: 'Quality Telemetry Platform',
    posterTitle: 'Thirteen frameworks. One verdict: ship or don\'t.',
    client: 'Sage Ideas (Internal)',
    tagline: 'A 13-framework testing infrastructure covering unit, E2E, mobile, security, BDD, performance, contract, visual regression, and Lighthouse CI.',
    category: 'DevTools',
    tags: ['Jest', 'Playwright', 'k6', 'OWASP ZAP', 'Lighthouse CI', 'Pact', 'Percy', 'GitHub Actions'],
    kicker: '13 frameworks. Zero guesswork.',
    problem: [
      'A test suite that only covers the happy path isn\'t a safety net — it\'s a false sense of security. Real quality engineering means having the right kind of test at every layer: contracts that prevent API breakage, visual regression that catches layout drift, performance budgets that catch bundle bloat, security scans that flag injection vectors before they hit production.',
      'The Quality Telemetry Platform is the testing infrastructure that runs under all Sage Ideas products. It\'s not a project delivered to a client — it\'s the engineering discipline that makes every client engagement trustworthy.',
      'The challenge: building a coherent, maintainable multi-framework testing system that doesn\'t collapse under its own weight. The risk with "13 frameworks" is that it becomes an unmaintained museum. The architecture here is designed so each framework has a single, non-overlapping responsibility.',
    ],
    approach: [
      'Framework responsibility map: Jest (unit — pure functions, utilities), Vitest (fast unit tests for Next.js components), Playwright (E2E browser tests — user flows, auth), Testing Library (component integration), Supertest (API endpoint contract), Pact (consumer/provider contract tests), Cypress (supplemental E2E for visual-heavy flows).',
      'k6 (performance/load — response time under traffic), Lighthouse CI (performance budgets — CWV, accessibility, SEO), OWASP ZAP (DAST security scan — injection, XSS, misconfiguration), Axe (WCAG 2.1 AA automated audit), Percy/Chromatic (visual regression — pixel-diff for UI components), Cucumber/BDD (behavior specs — readable test scenarios).',
      'The architecture principle: each framework owns a layer. Tests don\'t duplicate each other\'s coverage. If a bug can be caught by a unit test, it never reaches the E2E layer. This makes the suite fast, focused, and maintainable.',
    ],
    build: [
      '13 configured, actively maintained framework integrations. GitHub Actions CI pipeline running all frameworks in parallel with appropriate test gates. Lighthouse CI budget configuration (LCP < 2.5s, CLS < 0.1, TBT < 200ms).',
      'Playwright E2E suite covering authentication, checkout, and core user flows across all products. OWASP ZAP automated security scan on every production deployment. Pact contract tests for all cross-service API boundaries. Percy visual regression baseline for all critical UI components.',
      'Reporting: test results aggregated into GitHub PR checks and Slack notifications.',
    ],
    outcome: [
      'Zero production regressions caught in post-deploy monitoring that weren\'t first caught by CI (across 12 months of active use). Lighthouse CI budgets maintained: all Sage Ideas products score 90+ on Performance and Accessibility.',
      'Contract testing layer prevented 3 breaking API changes from reaching production during Nexural development. Full test suite runs in under 8 minutes in CI (parallelized across 4 runners).',
      'Testing infrastructure is a product decision, not a technical nicety. The studio now starts every new engagement with this infrastructure in place — not as an upgrade, but as the foundation.',
    ],
    metrics: [
      { label: 'Frameworks', value: '13' },
      { label: 'CI Run Time', value: '< 8 min' },
      { label: 'Prod Regressions Missed', value: '0' },
      { label: 'Lighthouse Score', value: '90+' },
      { label: 'Breaking Changes Prevented', value: '3' },
    ],
    artifacts: [
      'GitHub: Testing framework configuration templates',
      'CI pipeline configuration',
      'Lighthouse CI budget documentation',
      'Test coverage policy documentation',
    ],
    gallery: [
      {
        src: '/artifacts/evidence/playwright-report.svg',
        kind: 'report',
        label: 'Playwright',
        aspect: 'video',
        caption: 'End-to-end coverage across critical journeys. The report is the deliverable — stakeholders see exactly what was tested, what passed, and what got skipped.',
      },
      {
        src: '/artifacts/evidence/allure-report.svg',
        kind: 'dashboard',
        label: 'Allure',
        aspect: 'video',
        caption: 'Aggregated test results across thirteen frameworks in one place. Trends over time, flake detection, and a single pane of glass for ship-or-don’t.',
      },
      {
        src: '/artifacts/evidence/lighthouse-ci.svg',
        kind: 'dashboard',
        label: 'Lighthouse CI',
        aspect: 'video',
        caption: 'Performance + accessibility budgets enforced per PR. If a change drops the score below threshold, the build fails. The website never silently gets slower.',
      },
    ],
    ctaPrimary: { label: 'See our quality standards', href: '/trust' },
    ctaSecondary: { label: 'Start with an audit', href: '/services/audit' },
  },
  {
    slug: 'brand-sprint-rebuild',
    title: 'Brand Sprint — Founder-Led Identity Rebuild',
    posterTitle: 'Two weeks to look like a company that ships.',
    client: 'Sage Ideas Studio (illustrative engagement)',
    tagline: 'A two-week Brand Sprint for an early-stage founder transitioning from a personal portfolio to a productized studio identity.',
    category: 'Product',
    tags: ['Brand', 'Identity', 'Type System', 'Logo', 'Voice', 'Web'],
    kicker: 'Two weeks. One identity system. Shipped.',
    problem: [
      'Personal portfolios and small-business sites tend to accumulate years of inconsistent visual decisions — four typefaces, three accent colors, mismatched logo treatments, and copy written by different people at different stages of the business. The site works, but it does not feel coherent, and it does not signal seriousness to the small businesses the studio is trying to serve.',
      'The Brand Sprint engagement is designed for exactly this moment. Two weeks, one founder, one identity system shipped end-to-end. No quarterly brand-strategy retainer. No multi-stakeholder workshops. The founder sets the direction, the studio executes the system.',
      'The challenge is compression. A traditional brand rebuild burns three months on discovery and stakeholder rounds before a single asset ships. A Brand Sprint has to land a complete identity — logo, type, color, voice, and a working site treatment — in ten business days without cutting corners on the things that actually matter.',
    ],
    approach: [
      'Day 1–2: Discovery. Audit of the existing assets, copy patterns, and competitive landscape. Founder interview to extract the underlying voice and the one-sentence positioning statement. Output: a written brand brief signed off before any visual work begins.',
      'Day 3–5: System design. Custom SVG wordmark and monogram drafted in three directions. Type pairing chosen from a curated shortlist (typically Satoshi or General Sans for body, with a stronger display face for hero moments). Color system: a neutral surface palette plus one signal accent and one secondary, all token-mapped.',
      'Day 6–8: Voice and copy system. Voice document covering tone, vocabulary, sentence rhythm, and the things the brand never says. Boilerplate copy blocks for hero, services, footer, and email signature. Reusable header and CTA patterns.',
      'Day 9–10: Application. Identity applied to the existing site — navigation, hero, service cards, footer, OG image template, and favicon. All tokens written into the design system file. Final handoff package: SVG logo set, color hex/Tailwind tokens, type stack, voice doc, and a one-page brand guide PDF.',
    ],
    build: [
      'Custom SVG wordmark and monogram, optimized for 24px favicon through 200px hero scale, monochrome-first with an accent color variant.',
      'Type system: display + body pairing, full size scale tokenized, line-height and letter-spacing rules documented per breakpoint.',
      'Color system: 12 tokens covering surfaces, content, borders, accent, and feedback states. All mapped to Tailwind theme variables and CSS custom properties.',
      'Voice document: 4 pages covering tone, sentence rhythm, vocabulary inclusions and exclusions, and 8 before/after copy rewrites from the existing site.',
      'Site treatment: navigation, hero block, services grid, footer, and OG image template applied across all critical pages with no broken layouts on mobile.',
      'Handoff package: SVG asset library, brand guide PDF, voice document, and a half-day office-hours block to answer follow-up questions during week three.',
    ],
    outcome: [
      'Identity shipped on day 10. Site relaunched with the new system on day 11. No follow-on rebuild or retroactive cleanup work needed.',
      'Founder reported the new system reduced time-to-publish on new pages and posts because the voice document and color tokens removed the per-page decision overhead. New pages now ship in hours, not days.',
      'Pattern: a Brand Sprint pairs naturally with a Brand Care retainer. The Sprint sets the system; Brand Care keeps it consistent as the business adds new offers, services, and case studies. Together, they remove the slow drift that normally erodes an identity over the first 18 months.',
    ],
    metrics: [
      { label: 'Sprint Duration', value: '10 business days' },
      { label: 'Identity Tokens', value: '12 colors + 6 type' },
      { label: 'Voice Doc', value: '4 pages' },
      { label: 'Logo Variants', value: '3 directions, 1 final' },
      { label: 'Site Pages Treated', value: '8' },
      { label: 'Follow-on Rebuild', value: '0' },
    ],
    artifacts: [
      'Brand brief document (template)',
      'SVG wordmark and monogram set',
      'Color and type token map (Tailwind + CSS)',
      'Voice document (template)',
      'One-page brand guide PDF',
    ],
    ctaPrimary: { label: 'See the Brand Sprint tier', href: '/services/brand-sprint' },
    ctaSecondary: { label: 'Pair with Brand Care', href: '/services/brand-care' },
  },
  {
    slug: 'site-care-retainer',
    title: 'Site Care — Twelve Months of Quiet Reliability',
    posterTitle: 'A year. Zero outages. Nobody noticed. That\'s the point.',
    client: 'Sage Ideas Studio (illustrative engagement)',
    tagline: 'A twelve-month Site Care retainer for a small-business marketing site — dependency upkeep, performance monitoring, content publishes, and zero unplanned downtime.',
    category: 'Infrastructure',
    tags: ['Care Retainer', 'Site Reliability', 'Performance', 'Monitoring', 'CMS Publishing'],
    kicker: '12 months. Zero unplanned downtime.',
    problem: [
      'Small-business marketing sites have a predictable failure pattern. They get built well in week one, run cleanly for three months, and then quietly accumulate technical debt: outdated dependencies, broken third-party embeds, slow CMS pages, expired SSL warnings, and stale content that erodes search rankings. By month nine, the site that felt premium at launch feels neglected, and the founder has neither the time nor the appetite to dig back in.',
      'Site Care is the retainer that prevents that arc. A monthly subscription with a fixed scope: dependency and security updates, performance regression checks, content publishes, broken-link sweeps, monthly health report, and a small allotment of design or copy tweaks. No surprises, no reactive emergency fixes, no quarterly rebuild conversation.',
      'The challenge with retainers is that the value is invisible when they are working. A successful Site Care month produces no incident, no broken page, no angry email — which is exactly the point, but it also means the retainer has to make its work visible without theater. The monthly health report has to do that job.',
    ],
    approach: [
      'Onboarding: full site audit, dependency inventory, monitoring setup. Synthetic uptime checks configured for the homepage and three critical pages. Lighthouse baseline captured for performance regression detection. Backup and rollback procedure documented.',
      'Monthly cadence: dependency updates within 7 days of release for security advisories, within the month for non-critical updates. Lighthouse run weekly with diff against baseline; regressions investigated within 48 hours. Broken-link and 404 sweeps monthly. Content publishes within 2 business days of submission.',
      'Communication: monthly health report on the first Monday with a one-page summary — uptime, performance, content shipped, dependencies updated, and any items flagged for the founder. No status calls. No meeting overhead. Slack channel for ad-hoc questions, with a 24-hour response SLO during business days.',
    ],
    build: [
      'Synthetic uptime monitoring on 4 critical paths (homepage, services, contact, key landing page), 1-minute interval, alerting via email and Slack.',
      'Weekly automated Lighthouse runs with budget thresholds (LCP < 2.5s, CLS < 0.1, TBT < 200ms); regressions auto-create a tracked task.',
      'Monthly dependency update PR with changelog summary and test results; security advisories handled within 7 days regardless of cadence.',
      'Monthly broken-link sweep across the entire site; redirect map maintained for any moved or removed pages.',
      'Content publishing pipeline: founder submits markdown, copy, or assets via shared folder; content lives on production within 2 business days, including image optimization and OG image generation.',
      'Monthly health report: PDF with uptime numbers, performance trend, dependencies updated, content shipped, and a forward-looking risks-and-recommendations section.',
    ],
    outcome: [
      '12-month retainer completed with zero unplanned downtime and zero security incidents. All dependency updates landed within the cadence policy. Lighthouse performance held within the budget every month with one investigated regression that traced to a third-party embed and was resolved in 36 hours.',
      'Content publishing throughput tripled compared to the pre-retainer baseline because the founder no longer touched deployment pipelines. Twenty-eight content publishes shipped in the first six months — a volume the founder had not been able to sustain on their own.',
      'Pattern: Care retainers turn the relationship from transactional to compounding. The longer the retainer runs, the better the studio understands the system, and the smaller the marginal effort to keep it healthy. Year two of a Care retainer is meaningfully cheaper to deliver than year one — and that compounding is what makes the retainer pricing sustainable for both sides.',
    ],
    metrics: [
      { label: 'Retainer Duration', value: '12 months' },
      { label: 'Unplanned Downtime', value: '0 hours' },
      { label: 'Security Incidents', value: '0' },
      { label: 'Dependency PRs Merged', value: '14' },
      { label: 'Content Publishes', value: '28 in 6 months' },
      { label: 'Lighthouse Budget Holds', value: '12 of 12 months' },
    ],
    artifacts: [
      'Sample monthly health report (anonymized PDF)',
      'Onboarding audit checklist',
      'Dependency update policy document',
      'Lighthouse budget configuration',
      'Content publishing workflow document',
    ],
    ctaPrimary: { label: 'See the Site Care retainer', href: '/services/site-care' },
    ctaSecondary: { label: 'Compare all retainers', href: '/pricing' },
  },
]
