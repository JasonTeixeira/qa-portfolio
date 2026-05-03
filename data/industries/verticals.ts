// Sage Ideas Studio — industry/vertical positioning.
// Each entry powers /industries/[slug] landing pages and SEO for
// "[service] for [industry]" queries.

export type VerticalChallenge = {
  title: string
  description: string
}

export type VerticalFAQ = {
  q: string
  a: string
}

export type Vertical = {
  /** URL slug. */
  slug: string
  /** Full display name. */
  name: string
  /** Short label used in chips and breadcrumbs. */
  shortName: string
  /** One-line tagline (cyan accent on page). */
  tagline: string
  /** Hero H1 — should read like a positioning statement, not a generic header. */
  heroH1: string
  /** 2–3 sentence positioning paragraph. */
  intro: string
  /** 4–6 substantive "why us" bullets. */
  whyUs: string[]
  /** Four industry-specific challenges Sage Ideas can solve. */
  challenges: VerticalChallenge[]
  /** Tier slugs from /data/services/tiers, ordered by relevance. */
  recommendedTiers: string[]
  /** Case study slugs from /data/work/case-studies. */
  relevantCaseStudySlugs: string[]
  /** SEO keywords for the vertical. */
  keywords: string[]
  /** 5 industry-specific FAQ entries. */
  faq: VerticalFAQ[]
  /** Closing CTA line — appears in the gradient strip at the end. */
  ctaLine: string
}

export const verticals: Vertical[] = [
  {
    slug: 'fintech',
    name: 'Fintech & Financial Services',
    shortName: 'Fintech',
    tagline: 'Ship money-moving software without breaking compliance.',
    heroH1: 'Fintech engineering that survives audit.',
    intro:
      'We have shipped production fintech for five years — payments, ledgers, brokerage UX, KYC flows, and Stripe integrations that actually reconcile. Sage Ideas builds money-moving software with the boring discipline regulators expect: idempotent webhooks, append-only ledgers, audit trails on every state transition, and SOC 2-ready evidence from day one. You move faster because we have already made the expensive mistakes.',
    whyUs: [
      'Five years shipping fintech in production — Stripe Connect, Treasury, Issuing, ACH, brokerage integrations, and double-entry ledgers we have personally debugged at 3am.',
      'Idempotent webhook handlers, retry-safe job queues, and append-only event logs as defaults — not afterthoughts bolted on after the first reconciliation incident.',
      'SOC 2 Type II posture from week one: structured logging, IAM scoped to least privilege, automated evidence collection, and runbooks that map to CC-series controls.',
      'PCI scope reduction by design — tokenize at the edge, never let raw PAN touch your servers, and document the data-flow diagram your QSA will actually accept.',
      'Honest about what we are not: we are not your compliance officer, your QSA, or your legal counsel. We will work alongside them and ship code that does not embarrass anyone.',
      'Regulatory awareness across KYC/AML, Reg E, Reg D, and state money-transmitter requirements — enough to know what questions to ask before architecture solidifies.',
    ],
    challenges: [
      {
        title: 'Webhooks that double-charge customers',
        description:
          'Stripe retries on 5xx and network timeouts. Without idempotency keys, deterministic event handlers, and a deduplication store, you will eventually create duplicate ledger entries. We design the boring infrastructure that makes this impossible.',
      },
      {
        title: 'Ledger drift between Stripe and your database',
        description:
          'Your application database and Stripe diverge slowly — refunds processed manually, disputes that never make it into your books, fees missing from MRR calculations. We build reconciliation jobs that close the gap nightly and alert before finance notices.',
      },
      {
        title: 'PCI scope creeping into your codebase',
        description:
          'Once card data touches one service, your audit boundary explodes. We refactor checkout flows to use Stripe Elements or Hosted Checkout, prove tokenization at the edge, and produce the data-flow diagram your QSA needs.',
      },
      {
        title: 'KYC flows that block legitimate users',
        description:
          'Drop-off at identity verification is silently killing your activation. We instrument the funnel, integrate with Persona/Alloy/Stripe Identity, and build manual-review queues that do not require an engineer in the loop for every edge case.',
      },
    ],
    recommendedTiers: ['audit', 'automate', 'build', 'operate'],
    relevantCaseStudySlugs: ['nexural', 'alphastream', 'quality-telemetry'],
    keywords: [
      'fintech development',
      'fintech engineering consultant',
      'Stripe integration consultant',
      'PCI DSS development',
      'SOC 2 readiness engineering',
      'fintech compliance development',
      'idempotent webhooks Stripe',
      'fintech CTO for hire',
      'KYC integration development',
      'double-entry ledger development',
      'Stripe Connect platform builder',
      'fintech audit preparation',
    ],
    faq: [
      {
        q: 'Can you reduce our PCI scope?',
        a: 'Yes — the goal is almost always SAQ A or SAQ A-EP. We move card capture into Stripe Elements or Hosted Checkout so card data never touches your origin, then produce the network and data-flow diagrams your QSA will request. If you currently take card numbers via a custom form or store anything that looks like a PAN in your database, that is the first thing we change.',
      },
      {
        q: 'How do you handle Stripe webhooks safely?',
        a: 'Every handler is idempotent on Stripe event ID — we store processed event IDs and short-circuit on replay. Handlers are pure functions over the event payload (we re-fetch from the API rather than trust webhook bodies for amounts), wrapped in database transactions so partial failures roll back cleanly. Retries are exponential with a dead-letter queue after N attempts so engineers can inspect rather than data silently disappearing.',
      },
      {
        q: 'Do you know the difference between Stripe Connect, Treasury, and Issuing?',
        a: 'Yes. Connect is for marketplaces and platforms paying out to third parties — Standard, Express, and Custom accounts have different KYC and liability profiles. Treasury is FBO-account banking-as-a-service for paying companies and earning yield. Issuing is for spawning virtual or physical cards. They are often combined (Connect + Issuing for spend management products) and the choice cascades into your compliance posture, so we want to make it deliberately, not by accident.',
      },
      {
        q: 'What does SOC 2 evidence collection look like in practice?',
        a: 'It is mostly automation plus discipline. Drata/Vanta/Secureframe pull evidence from AWS, GitHub, and your HRIS automatically, but they cannot collect what does not exist — so we make sure access reviews happen quarterly with a documented log, deploys are tied to ticketed change management, secrets rotate on a schedule, and incident runbooks have post-mortems attached. The Audit and Operate tiers map directly to the CC-series controls auditors care about most.',
      },
      {
        q: 'Are you our compliance officer or our auditor?',
        a: 'No, and we will say so loudly. We are the engineering team that builds systems your compliance officer and QSA can defend. We work alongside them — we will join calls, answer technical questions, and produce architecture documentation in their preferred format — but the legal sign-off and attestations are theirs to give. If you do not have either yet, we can recommend firms we have worked well with.',
      },
    ],
    ctaLine:
      'Bring us your reconciliation drift, your webhook nightmares, or the SOC 2 deadline that keeps you up at night.',
  },
  {
    slug: 'saas',
    name: 'SaaS & B2B Software',
    shortName: 'SaaS',
    tagline: 'Multi-tenant infrastructure, billing that actually nets, and SEO that compounds.',
    heroH1: 'SaaS engineering that compounds.',
    intro:
      'We build B2B SaaS the way it should have been built the first time — multi-tenant from line one, usage-based billing that survives a scale event, retention dashboards your CS team will actually open, and a content engine that ranks for the queries your buyers actually search. The boring stuff is what wins long-term, and we sweat the boring stuff.',
    whyUs: [
      'Multi-tenant Postgres with row-level security policies tested against tenant escape — not the leaky "filter in the ORM" pattern that produces a Hacker News post when it fails.',
      'Usage-based and hybrid billing on Stripe — metered events, idempotent reporting, proration, dunning, and the "did our bill change?" email customers will inevitably send.',
      'SEO and content infrastructure that compounds: programmatic landing pages, internal linking, schema markup, Core Web Vitals discipline, and editorial workflow non-engineers can use.',
      'Retention and product analytics wired correctly the first time — events that survive a Segment-to-Mixpanel migration, identity stitching, and dashboards your CS team checks daily.',
      'Onboarding flows engineered as funnels, not features — every drop-off instrumented, every step measured, no "we will fix activation next quarter" theater.',
      'Honest opinions on Next.js vs Remix, Postgres vs Planetscale, Clerk vs Stytch vs roll-your-own — from someone who has shipped all of it and will tell you which one fits your team, not which one is trending.',
    ],
    challenges: [
      {
        title: 'Tenant data leaks between accounts',
        description:
          'A missing WHERE clause in one query, a cached object reused across requests, a shared Redis key without tenant prefix — and suddenly Customer A sees Customer B data. We design row-level security in Postgres, tenant-scoped middleware, and tests that explicitly try to break the boundary.',
      },
      {
        title: 'Billing that does not match what your CRM says',
        description:
          'MRR in Stripe diverges from MRR in HubSpot diverges from MRR in your dashboard. We build the metered-events pipeline, reconcile nightly, and instrument proration, plan changes, and refunds as first-class events — not afterthoughts.',
      },
      {
        title: 'Activation funnels with invisible drop-offs',
        description:
          'You know top-of-funnel signups but not which step in onboarding loses the most users. We instrument every step, build cohort retention curves, and ship the highest-leverage UX fixes before guessing.',
      },
      {
        title: 'Content stuck on a single blog with no internal linking',
        description:
          'You have content, but no programmatic templates for category pages, feature comparisons, or integration directories. Each post is a leaf with no links pointing in. We build the structural SEO layer that makes every new piece of content compound.',
      },
    ],
    recommendedTiers: ['ship', 'build', 'scale', 'content-engine', 'seo-sprint', 'operate'],
    relevantCaseStudySlugs: ['nexural', 'jobpoise', 'trayd'],
    keywords: [
      'SaaS development consultant',
      'SaaS CTO for hire',
      'multi-tenant SaaS architecture',
      'usage-based billing Stripe',
      'B2B SaaS engineering',
      'SaaS programmatic SEO',
      'SaaS content marketing engineer',
      'SaaS retention analytics',
      'product-led growth engineering',
      'SaaS onboarding optimization',
      'SaaS technical co-founder',
      'Postgres row-level security SaaS',
    ],
    faq: [
      {
        q: 'How do you implement multi-tenancy in Postgres?',
        a: 'Default to row-level security (RLS) policies enforced at the database, with a per-request connection setting (SET LOCAL app.current_tenant) wrapped in middleware. Application code cannot query without a tenant context — even a forgotten WHERE clause is safe. We add integration tests that explicitly try cross-tenant access and assert they fail. For workloads where RLS is too slow, schema-per-tenant or database-per-tenant are options, with documented tradeoffs around migrations and connection pooling.',
      },
      {
        q: 'How do you handle usage-based billing without melting Stripe?',
        a: 'Buffer and aggregate usage events in your own store first — never call Stripe per event from a hot path. We use a job queue (BullMQ, SQS, or Inngest) to batch usage records to Stripe Meter or Subscription Item Usage Records on a cadence (typically every 1–15 minutes). Reporting is idempotent on a deterministic key, so retries and replays do not double-count. We also reconcile nightly between your event log and Stripe, alerting on drift.',
      },
      {
        q: 'What does retention analytics actually look like?',
        a: 'Three layers. First, a clean event taxonomy — typed event schemas, identify calls on every meaningful auth boundary, and a single source of truth (usually Segment or PostHog). Second, cohort retention curves by signup month and by activation event. Third, reverse-funnels showing which actions in week one predict month-six retention — those become your activation north star.',
      },
      {
        q: 'Can you build programmatic SEO pages without it looking like spam?',
        a: 'Yes — the trick is genuine differentiation per page. Programmatic SEO works when each page has unique data the user is searching for: real comparisons, real pricing, real customer counts, real integration details. We build templates that pull from a structured content source, add unique introductory copy and FAQ schema, and gate publishing behind a quality threshold. Pages that are 90% boilerplate get filtered before they ship.',
      },
      {
        q: 'What stack do you recommend for a new SaaS?',
        a: 'Defaults: Next.js App Router on Vercel, Postgres (Neon or Supabase) with RLS, Clerk or Auth.js for auth, Stripe for billing, Resend for transactional email, PostHog for product analytics, and Inngest or Trigger for background jobs. We will deviate based on team skills — if your team is Rails-fluent, Rails 7 + Hotwire is faster to ship and we will say so. The wrong stack is the one your team cannot maintain after we leave.',
      },
    ],
    ctaLine:
      'Whether it is multi-tenant architecture, billing reconciliation, or compounding content infrastructure — we ship the boring stuff that wins long-term.',
  },
  {
    slug: 'ecommerce',
    name: 'E-commerce & DTC',
    shortName: 'E-commerce',
    tagline: 'Faster checkouts, programmatic category pages, lifecycle that converts.',
    heroH1: 'E-commerce engineering that turns traffic into revenue.',
    intro:
      'Storefront performance is conversion. Programmatic SEO is your unit-economics weapon. Lifecycle email is your retention floor. Sage Ideas builds the engineering layer underneath your DTC brand — Shopify Hydrogen or custom Next.js, Stripe and Shop Pay, Klaviyo flows, and the Core Web Vitals discipline that compounds into measurable revenue lift.',
    whyUs: [
      'Core Web Vitals as a revenue metric — every 100ms of LCP improvement is measurable conversion lift, and we instrument before and after so you can prove it to the CFO.',
      'Programmatic SEO for SKU, category, collection, and "best [product] for [use-case]" pages — the long-tail traffic that compounds without paid spend.',
      'Shopify Hydrogen, Liquid, and headless Next.js — we will tell you honestly which fits your catalog size, content velocity, and team.',
      'Checkout funnel optimization with real instrumentation — payment method drop-off, address validation friction, "why did 30% of users abandon at shipping?" answered with data, not guesses.',
      'Lifecycle email and SMS architecture in Klaviyo or Customer.io: abandoned cart, browse abandonment, win-back, post-purchase, and replenishment flows that match real LTV math.',
      'Stripe and Shop Pay integration including subscriptions, gift cards, store credit, and the inevitable "can we accept Apple Pay on the PDP?" — yes, and here is how.',
    ],
    challenges: [
      {
        title: 'A storefront that loads in 4 seconds on mobile',
        description:
          'Hero videos that block render, third-party scripts that ship 800KB of JS, image sizes that ignore device pixel ratio. We profile the real waterfall, prioritize LCP-blocking resources, and ship a budget that the next marketing team cannot accidentally blow.',
      },
      {
        title: 'Category pages with no SEO depth',
        description:
          'Your category pages are template stubs with no copy, no FAQ, no buyer guides, no cross-links. They cannot rank for "[product] for [use-case]" queries that drive intent traffic. We build the programmatic content infrastructure that makes every collection a destination.',
      },
      {
        title: 'Abandoned-cart flows that send three generic emails',
        description:
          'No segmentation by cart value, no urgency signals, no SMS fallback, no win-back tier. Every abandoned cart is treated the same. We architect the lifecycle layer in Klaviyo with branching logic tied to LTV cohorts and product margin.',
      },
      {
        title: 'Checkout drop-off with no instrumentation',
        description:
          'You know cart-to-checkout rate but not which specific field, validation error, or payment method is killing conversion. We instrument every interaction in checkout, find the highest-friction step, and ship the fix in days — not after a six-month rebuild.',
      },
    ],
    recommendedTiers: ['seo-sprint', 'scale', 'ship', 'content-engine', 'brand-sprint'],
    relevantCaseStudySlugs: ['trayd', 'nexural'],
    keywords: [
      'e-commerce development consultant',
      'Shopify Hydrogen developer',
      'DTC technical consultant',
      'programmatic SEO e-commerce',
      'Core Web Vitals e-commerce',
      'checkout optimization consultant',
      'Klaviyo lifecycle email developer',
      'headless e-commerce Next.js',
      'Shopify SEO consultant',
      'e-commerce conversion optimization',
      'Stripe e-commerce integration',
      'Shop Pay implementation',
    ],
    faq: [
      {
        q: 'Hydrogen, Liquid, or headless Next.js — which should we use?',
        a: 'Liquid (Online Store 2.0) is the right answer for most brands under $10M GMV with a small dev team. It is fast enough, the merchant tooling is unmatched, and you do not need a build pipeline. Hydrogen makes sense once you outgrow Liquid sections and need React-level component reuse, custom checkout extensions, or aggressive personalization. Headless Next.js fits when commerce is a small piece of a larger content site, you have non-Shopify catalog sources, or the brand needs marketing pages a CMS can power without engineering. We will recommend the option your team can actually maintain.',
      },
      {
        q: 'How do you build programmatic SEO for SKU and category pages?',
        a: 'Templates fed from structured product data, with each page earning its uniqueness through real differentiation — actual specs, actual reviews, actual buyer use-cases, FAQ schema, and internal links to comparison and accessory pages. We index gradually, monitor Search Console for thin-content flags, and prune underperforming URLs. The goal is a long-tail moat — pages ranking for "[product] for [persona]" and "[product] vs [competitor]" queries that paid search cannot economically serve.',
      },
      {
        q: 'What is your Core Web Vitals approach?',
        a: 'Measure first with field data from Chrome UX Report and your real users (RUM via Vercel Speed Insights or Cloudflare Web Analytics), not lab tools. The biggest LCP wins are usually image format and dimensions (next/image with proper sizes, WebP or AVIF), critical CSS, and removing render-blocking third-party scripts. CLS comes from web fonts and ad slots without reserved height. INP comes from heavy event handlers and React hydration cost. We profile, fix, and re-measure in production.',
      },
      {
        q: 'Can you build abandoned-cart and lifecycle flows in Klaviyo?',
        a: 'Yes — and the architecture matters more than the copy. We segment by cart value, product margin, and customer LTV cohort, then branch flows accordingly: a $30 abandoned cart from a first-time buyer gets a different sequence than a $400 abandoned cart from a repeat customer. SMS fallback is wired in for high-LTV cohorts where economics support it. Win-back, post-purchase replenishment, and browse-abandonment flows all run from the same event spine.',
      },
      {
        q: 'Do you do paid media and creative, or just engineering?',
        a: 'Engineering and SEO/content are our core. We do not run Meta or Google Ads campaigns ourselves — that is a different discipline and we have agency partners we trust. What we do is build the landing page infrastructure, instrument the conversion events correctly (server-side via Conversions API or GA4 Measurement Protocol), and make sure your media buyers are optimizing on signal that actually predicts revenue.',
      },
    ],
    ctaLine:
      'Slow storefront, thin category pages, leaky checkout — bring the bottleneck and we will ship the fix.',
  },
  {
    slug: 'healthcare',
    name: 'Healthcare & HealthTech',
    shortName: 'Healthcare',
    tagline: 'HIPAA-aware engineering. Audit-ready by default. Calm under regulatory pressure.',
    heroH1: 'HealthTech engineering that respects the stakes.',
    intro:
      'Healthcare software fails differently. A bug here is not a degraded user experience — it is a HIPAA violation, a delayed diagnosis, or a missing audit trail at the worst possible moment. Sage Ideas builds HealthTech with the deliberate cadence the domain demands: BAAs in place before code is written, audit logging on every PHI access, encrypted transport and at-rest by default, and a paranoid attitude toward third-party dependencies.',
    whyUs: [
      'HIPAA-aware development practices: BAAs with every subprocessor, PHI minimization in logs and error reports, audit trails on every PHI read and write, role-based access control tested against privilege escalation.',
      'A deliberately slower, more documented cadence than our other engagements — every change gets a ticket, every deploy gets a runbook, every incident gets a post-mortem. We will not "move fast" with PHI.',
      'Architectural patterns built for healthcare: encrypted PHI columns, separation of identifiable and clinical data, append-only audit logs, and access reviews that produce evidence on a schedule.',
      'Honest about scope: we are not your privacy officer, your compliance counsel, or your HIPAA security risk assessor. We work alongside them and ship engineering that does not give them new problems.',
      'Familiarity with HL7 v2, FHIR, SMART on FHIR, and the messy reality of integrating with EHRs that were architected in the 1990s — including the parts vendors do not put in the marketing materials.',
      'Clear-eyed about HITRUST, SOC 2, and state-level requirements like CCPA medical-information provisions and Texas HB 300 — enough to know what to ask before architecture solidifies.',
    ],
    challenges: [
      {
        title: 'PHI leaking into logs and error reports',
        description:
          'Sentry captures stack traces with request bodies. Datadog ingests structured logs with patient names. Cloudwatch retains everything for 90 days. Without explicit PHI scrubbing in the logging pipeline, you have a HIPAA disclosure waiting to be discovered. We build the redaction layer and prove it works.',
      },
      {
        title: 'Audit trails that do not actually audit',
        description:
          'You log "user X read patient Y" — but not the IP address, the session ID, the application context, or whether the read was through the API or the admin tool. When the OCR asks for an access log next year, the gaps will be glaring. We design audit logs that map to the HIPAA Security Rule access requirements.',
      },
      {
        title: 'Third-party dependencies without BAAs',
        description:
          'Your error tracker, analytics tool, customer support tool, or AI assistant might be touching PHI without a Business Associate Agreement. We map every subprocessor, identify where BAAs are required, and document the data-flow your privacy officer can defend.',
      },
      {
        title: 'EHR integrations that break at the worst time',
        description:
          'HL7 v2 over MLLP, FHIR R4 with custom extensions, SMART on FHIR with vendor-specific scopes — every EHR is a special snowflake. We build defensive integrations with circuit breakers, dead-letter queues, and the boring fault-tolerance these interfaces actually require in production.',
      },
    ],
    recommendedTiers: ['audit', 'build', 'operate'],
    relevantCaseStudySlugs: ['quality-telemetry', 'aws-landing-zone'],
    keywords: [
      'healthcare software development',
      'HIPAA compliant development',
      'HealthTech engineering consultant',
      'FHIR integration developer',
      'SMART on FHIR developer',
      'HL7 integration consultant',
      'healthcare audit logging',
      'PHI handling engineering',
      'HealthTech CTO for hire',
      'HIPAA Security Rule engineering',
      'healthcare cloud architecture',
      'EHR integration developer',
    ],
    faq: [
      {
        q: 'Will you sign a BAA?',
        a: 'Yes — Sage Ideas will execute a Business Associate Agreement before any engagement that involves PHI access. We use a standard BAA template, but we are happy to use yours if your privacy team prefers. Note that you also need BAAs with every subprocessor that may touch PHI: AWS, the database host, error tracking, analytics, AI providers, and so on. Part of our Audit tier is mapping the subprocessor chain and identifying where BAAs are missing.',
      },
      {
        q: 'How do you handle PHI in logs and observability?',
        a: 'PHI never enters logs by default. Structured logging libraries are configured with field allow-lists rather than block-lists, request bodies are scrubbed at the middleware layer, and Sentry/Datadog/Honeycomb are configured to drop known PHI fields before transmission. We add unit tests that send synthetic PHI through the logging pipeline and assert it does not appear in the output. Error stack traces include only stable identifiers, never names, MRNs, or DOBs.',
      },
      {
        q: 'What does an audit log need to contain?',
        a: 'The HIPAA Security Rule requires you to record information system activity, but the practical requirement comes from breach response: when an incident happens, you need to answer "who accessed what PHI, when, from where, and why?" That means timestamps, user identifiers (not just internal IDs — the human-resolvable username), patient identifiers, the action (read/write/export/print), the request context (IP, session, app), and ideally the business reason. Audit logs are append-only, retained per your policy (typically six years), and tested by querying them in tabletop exercises.',
      },
      {
        q: 'Do you work with FHIR and HL7?',
        a: 'Yes — we have built FHIR R4 clients and servers, integrated with Epic, Cerner/Oracle Health, and Athena via SMART on FHIR, and parsed enough HL7 v2 ADT and ORU messages to know exactly how each vendor deviates from spec. The non-obvious work is fault tolerance — vendor endpoints time out, drop messages, and return malformed payloads. Our integrations include retry logic, dead-letter queues, replayable event logs, and human-readable failure dashboards because someone will need to explain why a discharge summary did not flow downstream.',
      },
      {
        q: 'Can you help with HITRUST or SOC 2?',
        a: 'We can help engineer the technical controls and produce evidence — IAM policies, encryption at rest and in transit, access reviews, vulnerability management, change management, and incident response — but we are not a HITRUST assessor or a SOC 2 auditor. The Audit tier surfaces gaps; the Build and Operate tiers implement the controls; an external assessor or auditor signs off. We coordinate with them tightly and have worked with several firms we can recommend.',
      },
    ],
    ctaLine:
      'Send us your audit log gaps, your missing BAAs, or the EHR integration that has been a roadmap item for two years.',
  },
  {
    slug: 'ai-startups',
    name: 'AI Startups & ML Platforms',
    shortName: 'AI Startups',
    tagline: 'LLM-native engineering, real evals, and infra cost discipline.',
    heroH1: 'AI infrastructure that ships and stays cheap.',
    intro:
      'Most AI startups burn the same way: a brilliant prototype, a six-month effort to "make it production," and an OpenAI bill that grows faster than revenue. Sage Ideas builds AI-native systems the way they should be built — RAG pipelines with measurable evals, prompt versioning under source control, LLM cost tracking per request, and the boring infrastructure that turns a demo into a real product.',
    whyUs: [
      'LLM orchestration in production: tool-use, function-calling, structured output, multi-step agents, and the streaming UX that does not fall apart on retries — across OpenAI, Anthropic, Gemini, and open-weight models.',
      'RAG built like a search engine, not a magic trick: chunking strategy informed by your data, hybrid sparse-plus-dense retrieval, reranking with cross-encoders, and recall@k metrics you can actually optimize.',
      'Eval frameworks that catch regressions before they ship: golden datasets, LLM-as-judge with calibration, A/B-able prompts under version control, and CI that fails when quality drops.',
      'Cost discipline: per-request token attribution, model routing (use cheap models for cheap tasks), caching layers, and dashboards that show the unit economics of every feature.',
      'Vector database choice driven by your access patterns — pgvector for under 10M vectors, Pinecone or Weaviate when you need namespace isolation and high QPS, Turbopuffer when cost is the constraint.',
      'Rapid sprint cadence appropriate for AI products: weekly user feedback loops, prompt tweaks shipped behind feature flags, and the discipline to know when to ship a new model and when to retrieve better.',
    ],
    challenges: [
      {
        title: 'A demo that breaks at scale',
        description:
          'The single-user prototype hits 50 RPS and falls apart — rate limits, hot keys, streaming connections that pile up, and timeouts that take the whole worker pool down. We harden the request lifecycle: queues, backoff, circuit breakers, and the model-routing layer that keeps latency budgets intact.',
      },
      {
        title: 'No evals — every prompt change is a coin flip',
        description:
          'You change the system prompt, ship it, and find out a week later it broke a use case nobody tested. We build a golden dataset, an LLM-as-judge harness with calibration against human ratings, and CI that blocks merges when quality regresses on any segment.',
      },
      {
        title: 'OpenAI bill growing faster than revenue',
        description:
          'No per-feature token attribution, no caching, no model routing, no cap on runaway agent loops. We instrument cost per request and per feature, push easy work to cheaper models, add semantic and exact-match caches, and surface the unit economics every PM should be staring at.',
      },
      {
        title: 'RAG quality flatlining at 60%',
        description:
          'You have a vector DB, an embedding model, and a "good enough" retrieval step — but answers are wrong half the time. We diagnose with recall@k metrics, fix the chunking and hybrid retrieval, add a reranker, and prove the lift on a held-out eval set rather than vibes.',
      },
    ],
    recommendedTiers: ['automate', 'build', 'ship', 'brand-sprint', 'content-engine'],
    relevantCaseStudySlugs: ['nexural', 'alphastream', 'jobpoise'],
    keywords: [
      'AI startup engineering',
      'LLM application development',
      'RAG implementation consultant',
      'AI evals framework',
      'LLM cost optimization',
      'vector database consultant',
      'AI agent development',
      'AI startup CTO for hire',
      'prompt engineering production',
      'AI MVP development',
      'AI infrastructure consultant',
      'LangChain alternative consultant',
    ],
    faq: [
      {
        q: 'What evals framework do you use?',
        a: 'We avoid frameworks-for-frameworks-sake. The minimum viable eval stack is: a golden dataset of 50–200 representative inputs and expected behaviors, a deterministic test runner (pytest or vitest works fine), and an LLM-as-judge prompt calibrated against human-rated samples to confirm it correlates. CI runs the suite on every prompt change, comparing pass rate and segment-level metrics against the previous prompt. For richer needs we use Braintrust, Langfuse, or Inspect — but only after the basics are in place.',
      },
      {
        q: 'How do you keep LLM costs under control?',
        a: 'Four levers. First, attribution — every request is tagged with feature, user, and model so cost per feature is queryable. Second, routing — cheap models (gpt-4o-mini, Haiku, Flash) handle classification and extraction, expensive models handle generation only when needed. Third, caching — exact-match caches for deterministic prompts, semantic caches for retrieval-heavy flows. Fourth, hard limits — per-user and per-feature token budgets enforced server-side, so a runaway agent loop cannot torch the bill before someone notices.',
      },
      {
        q: 'Which vector database should we use?',
        a: 'For most products under 10M vectors with predictable QPS, pgvector on Postgres is the right answer — one database, transactional consistency with your application data, no separate operational surface. Pinecone or Weaviate make sense when you need multi-tenant namespace isolation, high QPS with sub-50ms latency, or features like hybrid search out of the box. Turbopuffer is excellent when you have hundreds of millions of vectors and cost is dominant. We will not pick the trendy answer; we will pick what your access pattern justifies.',
      },
      {
        q: 'How do you version and test prompts?',
        a: 'Prompts live in source control as templated files (typically Markdown or TOML), not in a database. Every change ships as a PR, runs through the eval suite in CI, and is deployed behind a feature flag so it can be rolled back instantly. We version model + prompt as a unit because they co-evolve. For richer experimentation we plug in Braintrust or Langfuse, but the source-of-truth is always the repo.',
      },
      {
        q: 'Can you build agents — or do you think they are overhyped?',
        a: 'Both. Multi-step tool-using agents work for narrow, well-bounded tasks where the action space is small and reversible: data extraction, code review, scheduled research, narrow customer-support flows. They struggle when the action space is large, irreversible, or requires real judgment under ambiguity. We build agents with hard step limits, tool-call budgets, structured outputs, deterministic fallbacks, and full observability into every reasoning trace — because debugging an agent that "just stopped working" without traces is genuinely awful.',
      },
    ],
    ctaLine:
      'Bring your demo, your eval gap, or your runaway OpenAI bill — we will turn it into infrastructure.',
  },
]

export const verticalsBySlug: Record<string, Vertical> = Object.fromEntries(
  verticals.map((v) => [v.slug, v]),
)
