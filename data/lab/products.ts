export type LabProduct = {
  slug: string
  name: string
  tagline: string
  status: 'Production' | 'Beta' | 'Alpha' | 'Pre-launch'
  category: string
  description: string  // 1-paragraph
  problem: string
  whatItDoes: string[]
  stack: string[]
  metrics: { label: string; value: string }[]
  links?: { github?: string; site?: string }
  thesis: string  // why we built it
  status_note?: string
  relatedWork?: string  // slug of /work item
}

export const labProducts: LabProduct[] = [
  {
    slug: 'nexural',
    name: 'Nexural',
    tagline: 'Real-time fintech platform, built for the technically sophisticated trader.',
    status: 'Production',
    category: 'Fintech',
    description: 'Nexural is a production-grade trading platform with real-time portfolio management, a Discord AI companion, and Stripe subscription billing. It\'s the largest and most architecturally complex product in the Lab.',
    problem: 'Serious traders are underserved by both consumer apps (too simple) and enterprise platforms (too complex and ops-heavy). There was no middle ground for technically sophisticated individual traders who wanted full control without the overhead.',
    whatItDoes: [
      'Real-time portfolio dashboard with live price feeds via WebSocket connections and Supabase realtime subscriptions',
      'Trade execution interface with order management and position tracking',
      'Discord AI bot backed by GPT-4 — handles portfolio queries, market commentary, and alert management in natural language',
      'Stripe subscription billing with tiered access, trial periods, metered usage, and idempotent webhook handling',
      '61 test suites covering unit, integration, E2E, contract, and security layers',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'FastAPI', 'Python', 'PostgreSQL', 'Supabase', 'Stripe', 'Discord API', 'AWS S3'],
    metrics: [
      { label: 'DB Tables', value: '185' },
      { label: 'API Endpoints', value: '69' },
      { label: 'Test Suites', value: '61' },
      { label: 'AI Queries/Week', value: '200+' },
      { label: 'Billing Incidents', value: '0' },
    ],
    thesis: 'Data modeling is the highest-leverage decision in a complex platform. The 185-table schema took two weeks to design before any code was written. Every subsequent feature built cleanly on top of it — a validation of the "architecture first, code second" discipline. Nexural is also the source of the micro-saas-starter template and three other open-source infrastructure patterns now used across the studio.',
    status_note: 'Live — production',
    relatedWork: 'nexural',
  },
  {
    slug: 'jobpoise',
    name: 'Jobpoise',
    tagline: 'The job search, engineered.',
    status: 'Production',
    category: 'AI Productivity · SaaS',
    description: 'Jobpoise is a citation-grounded AI job application copilot. It generates cover letters, follow-up emails, and application materials that trace back to the candidate\'s actual resume and the actual job description — no hallucinated accomplishments.',
    problem: 'Job seekers face a documentation problem, not an inspiration problem. Generic AI cover letter generators miss the point entirely — they produce content disconnected from the candidate\'s real experience and the role\'s actual requirements.',
    whatItDoes: [
      'Citation-grounded AI generation — every output maps to a source (resume bullet, JD requirement) via a structured citation layer',
      'Chrome extension (MV2) injecting into LinkedIn, Indeed, and Greenhouse for one-click draft generation from the current job posting',
      'Gmail OAuth integration for application tracking — surfaces follow-up timing and detects response patterns',
      'Three-tier Stripe billing: Drift (free), Poise ($39/mo), Compose ($79/mo) with Customer Portal',
      'Turborepo monorepo sharing types and utilities between the web app and Chrome extension',
    ],
    stack: ['Next.js 15', 'TypeScript', 'OpenAI GPT-4', 'Stripe', 'Chrome Extension MV2', 'Gmail API', 'Supabase', 'Turborepo'],
    metrics: [
      { label: 'Pricing Tiers', value: '3' },
      { label: 'CI Gates', value: '5/5' },
      { label: 'Job Boards', value: '3' },
      { label: 'Open PRs (main)', value: '0' },
    ],
    thesis: 'The citation-grounding architecture is the product. It\'s what separates Jobpoise from a GPT wrapper with a job-shaped UI. A monorepo with a web app and a browser extension, sharing types and utilities, can be built and maintained by a single engineer without sacrificing CI discipline.',
    status_note: 'Live — production',
    relatedWork: 'jobpoise',
  },
  {
    slug: 'trayd',
    name: 'Trayd',
    tagline: 'Built for the people who fix what breaks.',
    status: 'Beta',
    category: 'Trades Tech · B2B SaaS',
    description: 'Trayd is a bilingual AI companion for residential HVAC contractors. It handles estimate generation, diagnostic guidance, and callback scheduling — in English and Spanish, from day one.',
    problem: 'The residential trades are a $500B+ industry running largely on clipboards, group texts, and spreadsheets. Existing software was designed for office workers: complex UI, English-only, cloud-dependent, and priced for enterprise procurement.',
    whatItDoes: [
      'Bilingual UI (EN/ES) — every label, AI response, and notification available in English and Spanish with session-level language toggle',
      'AI diagnostic companion — natural-language symptom input yields structured system guidance',
      'Estimate builder — field-input form generates a branded PDF and delivers it via email',
      'Callback scheduler — lightweight CRM for follow-up management that field techs will actually use',
      'PWA with offline mode for core workflows on degraded jobsite connectivity',
    ],
    stack: ['Next.js', 'TypeScript', 'FastAPI', 'Python', 'Supabase', 'Resend', 'AWS S3', 'PWA'],
    metrics: [
      { label: 'Languages', value: 'EN + ES' },
      { label: 'External Capital', value: '$0' },
      { label: 'Bilingual Coverage', value: '100%' },
      { label: 'Market', value: 'Phoenix Metro' },
    ],
    thesis: 'Building Trayd taught us that "bilingual from day one" is an architecture decision, not a localization afterthought. The prompt templates, UI copy management, and locale routing need to be designed in before the first component renders. Trayd validated that small trades businesses will adopt software if it matches their actual workflow — the barrier is design, not appetite.',
    status_note: 'Beta — Phoenix market',
    relatedWork: 'trayd',
  },
  {
    slug: 'voza',
    name: 'VOZA',
    tagline: 'Speaking-first English learning for LATAM.',
    status: 'Alpha',
    category: 'Edtech · Language Learning',
    description: 'VOZA is an English learning platform designed specifically for Spanish and Portuguese speakers in Latin America. The core thesis: most English learning apps teach reading first, but spoken fluency is what actually changes economic outcomes. VOZA puts speaking practice at the center — from the first lesson.',
    problem: 'Most English learning apps are built for global audiences with reading-first curricula that don\'t reflect how LATAM learners actually need to use English — in spoken professional contexts that change economic outcomes.',
    whatItDoes: [
      'Speaking-first curriculum organized around conversation scenarios, not grammar drills',
      'AI speech evaluation for pronunciation and fluency scoring',
      'Full native language support for Spanish and Portuguese speakers',
      'Curriculum designed for LATAM professionals seeking English fluency for career advancement',
    ],
    stack: ['Next.js', 'Python', 'AI Speech Evaluation', 'Supabase'],
    metrics: [
      { label: 'Languages Supported', value: '3 (EN/ES/PT)' },
      { label: 'Target Market', value: 'LATAM Professionals' },
      { label: 'Status', value: 'Alpha' },
    ],
    thesis: 'Jason speaks Portuguese and Spanish natively, and saw the gap between available English learning tools and what actually works for LATAM learners. VOZA is the product version of that frustration — and a proof point that speaking-first AI evaluation can be built without enterprise infrastructure.',
    status_note: 'Alpha',
  },
  {
    slug: 'owly',
    name: 'Owly',
    tagline: 'A reading app that actually ships.',
    status: 'Production',
    category: 'Reading · Edtech',
    description: 'Owly is a reading app with a web-first experience and native mobile scaffolding via Capacitor. v2.0 shipped iOS and Android builds with FCM push notifications and native bridge integrations. Phases 7 (i18n) and 8 (polish + app store submission) are the remaining roadmap items.',
    problem: 'Most reading apps are either pure web with no native feel, or native-only with high maintenance overhead. Owly demonstrates the Capacitor pattern for teams who want one codebase across web, iOS, and Android without compromise.',
    whatItDoes: [
      'Web-first reading experience accessible at owly.pplx.app',
      'iOS and Android Capacitor scaffold with native look and feel',
      'FCM push notifications for reading reminders and updates',
      'Native bridge integrations: camera and file system access',
      'Internationalization (i18n) and app store submission in progress (Phases 7–8)',
    ],
    stack: ['Next.js', 'Capacitor', 'iOS', 'Android', 'FCM', 'TypeScript'],
    metrics: [
      { label: 'Platforms', value: 'Web + iOS + Android' },
      { label: 'Version', value: 'v2.0' },
      { label: 'Push Notifications', value: 'FCM' },
    ],
    links: { site: 'https://owly.pplx.app' },
    thesis: 'Owly exists to validate the Capacitor pattern for the studio — proving that a single Next.js codebase can ship to web, iOS, and Android with native bridge integrations and push notifications without the full overhead of a native development cycle.',
    status_note: 'Live — v2.0 (Phases 7–8 in progress)',
  },
  {
    slug: 'alphastream',
    name: 'AlphaStream',
    tagline: 'ML trading signals that show their work.',
    status: 'Production',
    category: 'Machine Learning · Quant Finance',
    description: 'AlphaStream is a Python package for ML-based trading signal generation. It\'s open-source, maintained, and used by quant practitioners who want explainable signals backed by a rigorous feature engineering pipeline.',
    problem: 'Most algorithmic trading signal tools are black boxes — output with no visibility into why a signal fired, what inputs drove it, or how it performed historically. For practitioners, that\'s not a tool. It\'s a guess with a UI.',
    whatItDoes: [
      '200+ technical indicators computed via TA-Lib, pandas, and custom implementations',
      '5 ML models per instrument/timeframe: XGBoost (primary), LightGBM (speed-optimized), Random Forest (confidence calibration), Ridge Regression (trend baseline), Ensemble Voter (learned weights)',
      'Backtesting engine with walk-forward validation and held-out test sets — no look-ahead bias',
      'SHAP value explainability: every signal maps to contributing features with importance scores',
      'Clean CLI and programmatic Python API with full documentation and strategy examples',
    ],
    stack: ['Python', 'XGBoost', 'LightGBM', 'scikit-learn', 'pandas', 'TA-Lib', 'SHAP'],
    metrics: [
      { label: 'Indicators', value: '200+' },
      { label: 'ML Models', value: '5' },
      { label: 'GitHub Stars', value: '5★' },
      { label: 'External Forks', value: '2' },
    ],
    links: { github: 'https://github.com/jteixeira/alphastream' },
    thesis: 'ML signal engines for trading don\'t require a hedge fund infrastructure team. A well-engineered Python package with the right architecture can be built, maintained, and extended by a single practitioner — and released as open source without compromising the core thesis. The ensemble architecture and SHAP explainability are what make AlphaStream a practitioner tool, not a toy.',
    status_note: 'Live — open source',
    relatedWork: 'alphastream',
  },
]
