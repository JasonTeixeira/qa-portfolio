'use client'

import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, Calendar, Tag, Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { ReadingProgress } from '@/components/reading-progress'
import { BreadcrumbNav } from '@/components/breadcrumb-nav'
import { GlowCard } from '@/components/glow-card'
import { caseStudies } from '@/data/case-studies'

const caseStudyContent: Record<string, {
  overview: string[]
  problem: { heading: string; content: string[] }
  approach: { heading: string; content: string[] }
  technicalDetails: { heading: string; sections: { title: string; content: string; code?: string }[] }
  challenges: { title: string; challenge: string; solution: string; result: string }[]
  results: { heading: string; content: string; metrics: { label: string; value: string }[] }
  github?: string
  liveUrl?: string
}> = {
  'nexural-ecosystem': {
    overview: [
      'The Nexural ecosystem represents the culmination of my experience building enterprise systems, fintech platforms, and AI tools. What started as a personal trading dashboard evolved into a comprehensive platform serving the trading community.',
      'Built entirely as a solo architect, Nexural spans 7 interconnected systems: a trading dashboard, AI-powered Discord bot, research engine, alert system, newsletter studio, strategy tracker, and automation suite.',
      'This case study walks through the architecture decisions, technical challenges, and lessons learned from building a production fintech platform from scratch.'
    ],
    problem: {
      heading: 'The Challenge',
      content: [
        'Trading communities needed a unified platform that could handle real-time market data, user authentication, subscription billing, AI-powered insights, and community management — all in one place.',
        'Existing solutions were either too fragmented (requiring multiple tools) or too rigid (not customizable for specific trading workflows). The goal was to build a platform that traders could actually use daily.',
        'Key requirements included: sub-second data latency, Stripe subscription management, Discord integration for community features, and AI-powered analysis tools.'
      ]
    },
    approach: {
      heading: 'Architecture Decisions',
      content: [
        'I chose a phased development approach, building core infrastructure first (auth, database, API) before layering on features. This allowed for rapid iteration while maintaining stability.',
        'The tech stack was selected for developer velocity and production reliability: Next.js for the frontend (server components, API routes), Supabase for database and auth (PostgreSQL, RLS, realtime), and .NET 8 for compute-heavy backend services.',
        'Stripe handles all billing with webhook-based subscription management. The Discord bot runs on a separate Node.js service with Supabase for persistence and GPT-4o for AI features.'
      ]
    },
    technicalDetails: {
      heading: 'Implementation Highlights',
      sections: [
        {
          title: 'Database Architecture',
          content: 'The 185-table schema is designed around trading workflows: users, subscriptions, strategies, watchlists, alerts, research notes, and analytics. Foreign keys enforce referential integrity, and Supabase RLS policies control access at the row level.',
          code: `-- Row-Level Security: users can only access their own data
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

-- Denormalized view for dashboard performance
CREATE VIEW dashboard_summary AS
SELECT u.id, u.email,
  COUNT(DISTINCT s.id) as strategy_count,
  COUNT(DISTINCT a.id) as alert_count,
  MAX(t.executed_at) as last_trade
FROM users u
LEFT JOIN strategies s ON s.user_id = u.id
LEFT JOIN alerts a ON a.user_id = u.id
LEFT JOIN trades t ON t.user_id = u.id
GROUP BY u.id, u.email;`
        },
        {
          title: 'API Design',
          content: '69 API endpoints follow RESTful conventions with consistent error handling. Rate limiting protects against abuse, and request validation uses Zod schemas. All endpoints are covered by automated tests.',
          code: `// Zod schema validation middleware
const CreateStrategySchema = z.object({
  name: z.string().min(1).max(100),
  symbol: z.string().regex(/^[A-Z]{1,5}$/),
  timeframe: z.enum(['1m', '5m', '15m', '1h', '4h', '1d']),
  parameters: z.record(z.number()).optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = CreateStrategySchema.parse(body);
  // Rate limit: 10 creates per minute per user
  await enforceRateLimit(req, { window: 60, max: 10 });
  return NextResponse.json(await createStrategy(validated));
}`
        },
        {
          title: 'AI Integration',
          content: 'The Discord bot uses GPT-4o for natural language queries about market conditions, strategy analysis, and educational content. Context is maintained per conversation, and responses are formatted for Discord\'s message limits.',
          code: `// GPT-4o with financial safety guardrails
const systemPrompt = \`You are a trading education assistant.
NEVER: give financial advice, predict prices, recommend trades.
ALWAYS: frame responses as educational, include disclaimers.
Format: Discord-compatible markdown, max 2000 chars.\`;

async function handleAIQuery(message, conversationHistory) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // Last 5 messages for context
      { role: 'user', content: message }
    ],
    max_tokens: 500,
  });
  // Filter response for financial advice patterns
  return validateAndSanitize(response.choices[0].message);
}`
        },
        {
          title: 'Real-Time Features',
          content: 'Market data streams through WebSocket connections with automatic reconnection. Price alerts trigger within milliseconds of threshold crossings, and the dashboard updates without page refreshes.',
          code: `// WebSocket with auto-reconnection and exponential backoff
class MarketDataStream {
  private retryCount = 0;
  private maxRetries = 10;

  connect(symbols: string[]) {
    this.ws = new WebSocket(ALPACA_WS_URL);
    this.ws.onopen = () => {
      this.retryCount = 0; // Reset on successful connect
      this.subscribe(symbols);
    };
    this.ws.onclose = () => {
      const delay = Math.min(1000 * 2 ** this.retryCount, 30000);
      setTimeout(() => this.connect(symbols), delay);
      this.retryCount++;
    };
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.checkAlerts(data); // Sub-ms alert evaluation
      this.updateDashboard(data);
    };
  }
}`
        }
      ]
    },
    challenges: [
      {
        title: 'Schema Complexity',
        challenge: 'Designing a schema that connects 7 different systems coherently while maintaining performance.',
        solution: 'Created a normalized design with strategic denormalization for hot paths. Used Supabase views for complex joins.',
        result: 'Query times under 50ms for all dashboard operations, even with millions of rows.'
      },
      {
        title: 'Real-Time Data Reliability',
        challenge: 'Market data connections drop frequently, causing stale data and missed alerts.',
        solution: 'Implemented automatic reconnection with exponential backoff, local caching, and health checks.',
        result: '99.9% data availability with graceful degradation during outages.'
      },
      {
        title: 'AI Response Quality',
        challenge: 'GPT-4o responses were sometimes too generic or off-topic for trading discussions.',
        solution: 'Developed custom system prompts with trading context and implemented response validation.',
        result: '95% of AI responses rated helpful by users in feedback surveys.'
      }
    ],
    results: {
      heading: 'Impact & Metrics',
      content: 'The Nexural platform is now in production serving active traders. All core systems are operational with automated testing coverage.',
      metrics: [
        { label: 'Database Tables', value: '185' },
        { label: 'API Endpoints', value: '69/69 Passing' },
        { label: 'Test Suites', value: '61' },
        { label: 'Bot Commands', value: '30+' },
        { label: 'Uptime', value: '99.9%' },
        { label: 'Latency', value: '<50ms' }
      ]
    },
    liveUrl: 'https://nexural.io'
  },
  'alphastream': {
    overview: [
      'AlphaStream is a machine learning system for generating trading signals from technical indicators. It processes market data through 200+ indicators, trains multiple ML models, and outputs actionable signals.',
      'The project demonstrates the intersection of quantitative finance and machine learning — using real market data to build predictive models that can inform trading decisions.'
    ],
    problem: {
      heading: 'The Challenge',
      content: [
        'Manual technical analysis is subjective and time-consuming. Different traders interpret the same indicators differently, leading to inconsistent signals.',
        'The goal was to build a systematic approach: compute indicators programmatically, train ML models on historical data, and generate consistent signals that can be backtested.'
      ]
    },
    approach: {
      heading: 'ML Pipeline Design',
      content: [
        'Built a feature engineering pipeline that computes 200+ technical indicators from OHLCV data. Features include moving averages, oscillators, volume indicators, and volatility measures.',
        'Trained 5 different model architectures (Random Forest, XGBoost, LSTM, etc.) and used cross-validation to prevent overfitting. The best performers are ensembled for production signals.'
      ]
    },
    technicalDetails: {
      heading: 'Technical Implementation',
      sections: [
        {
          title: 'Feature Engineering',
          content: 'Used pandas-ta and custom functions to compute 200+ indicators. Feature selection reduced dimensionality while preserving predictive power.'
        },
        {
          title: 'Model Training',
          content: 'Walk-forward validation prevents look-ahead bias. Models are retrained weekly on rolling windows of historical data.'
        }
      ]
    },
    challenges: [
      {
        title: 'Overfitting Prevention',
        challenge: 'Initial models performed well on training data but failed on live markets.',
        solution: 'Implemented strict walk-forward validation, regularization, and out-of-sample testing.',
        result: 'Consistent performance across training and validation sets.'
      }
    ],
    results: {
      heading: 'Results',
      content: 'AlphaStream is the most-starred project in my portfolio, demonstrating interest from the quant trading community.',
      metrics: [
        { label: 'Indicators', value: '200+' },
        { label: 'ML Models', value: '5' },
        { label: 'GitHub Stars', value: '4' },
        { label: 'Accuracy', value: '73%' }
      ]
    },
    github: 'https://github.com/JasonTeixeira/AlphaStream'
  },
  'aws-landing-zone': {
    overview: [
      'A multi-account AWS architecture designed for enterprise compliance and security. Uses Terraform for infrastructure-as-code with Service Control Policies (SCPs) for guardrails.',
      'This landing zone pattern separates workloads into isolated accounts while centralizing audit logging and security controls.'
    ],
    problem: {
      heading: 'The Challenge',
      content: [
        'Organizations need to balance developer agility with security compliance. A single AWS account becomes a security and blast radius risk as teams grow.',
        'The goal was to create a reusable landing zone that enforces security best practices while allowing teams to work independently in isolated accounts.'
      ]
    },
    approach: {
      heading: 'Architecture Design',
      content: [
        'Implemented AWS Organizations with separate accounts for dev, staging, production, and audit. SCPs enforce guardrails like preventing public S3 buckets and requiring MFA.',
        'All infrastructure is defined in Terraform with CI/CD gates that prevent non-compliant changes from reaching production.'
      ]
    },
    technicalDetails: {
      heading: 'Implementation Details',
      sections: [
        {
          title: 'Account Structure',
          content: 'Organizational Units (OUs) separate workloads by environment. Cross-account roles enable centralized operations without compromising isolation.'
        },
        {
          title: 'Security Controls',
          content: 'SCPs prevent dangerous actions at the organization level. CloudTrail logs are centralized in a locked-down audit account.'
        }
      ]
    },
    challenges: [
      {
        title: 'SCP Complexity',
        challenge: 'Balancing security restrictions with developer productivity.',
        solution: 'Iterative SCP development with developer feedback. Created escape hatches for legitimate use cases.',
        result: 'Zero security incidents while maintaining deployment velocity.'
      }
    ],
    results: {
      heading: 'Results',
      content: 'The landing zone is production-ready and fully documented for reuse across organizations.',
      metrics: [
        { label: 'Accounts', value: 'Multi' },
        { label: 'IaC Coverage', value: '100%' },
        { label: 'CI-Gated', value: 'Yes' },
        { label: 'SCP Policies', value: '15+' }
      ]
    },
    github: 'https://github.com/JasonTeixeira/Landing-Zone-Guardrails'
  },
  'testing-frameworks': {
    overview: [
      'A systematic approach to testing: 13 specialized frameworks covering every layer of the modern software stack. From API testing to visual regression to security scanning.',
      'Built from real-world experience at Home Depot and HighStrike where reliable testing prevented production incidents.'
    ],
    problem: {
      heading: 'The Challenge',
      content: [
        'Most teams struggle with test coverage because they try to use one framework for everything. Different types of testing require different approaches.',
        'The goal was to build purpose-built frameworks for each testing discipline, optimized for their specific requirements.'
      ]
    },
    approach: {
      heading: 'Framework Design',
      content: [
        'Each framework follows a consistent structure: clear directory layout, reusable utilities, CI integration, and comprehensive documentation.',
        'Frameworks are designed to be composable — they can be used independently or combined into a comprehensive test suite.'
      ]
    },
    technicalDetails: {
      heading: 'Framework Catalog',
      sections: [
        {
          title: 'API Testing',
          content: 'Smart retry logic for 429/5xx errors, Pydantic validation, session pooling for 3x speed improvement.'
        },
        {
          title: 'E2E & Visual',
          content: 'Full user journey coverage with Playwright, visual regression with baseline management and diff reporting.'
        },
        {
          title: 'Performance & Security',
          content: 'Load testing with JMeter, OWASP Top 10 automated scanning, vulnerability assessment.'
        }
      ]
    },
    challenges: [
      {
        title: 'Flaky Tests',
        challenge: 'Initial E2E tests had >10% flaky rate, blocking CI pipelines.',
        solution: 'Implemented retry logic, better waits, and test isolation.',
        result: '<1% flaky rate, reliable CI pipelines.'
      }
    ],
    results: {
      heading: 'Results',
      content: 'These frameworks have been used in production at enterprise scale, preventing numerous production incidents.',
      metrics: [
        { label: 'Frameworks', value: '13' },
        { label: 'Tests', value: '500+' },
        { label: 'Pipeline Reduction', value: '82%' },
        { label: 'Flaky Rate', value: '<1%' }
      ]
    }
  },
  'nexural-discord-bot': {
    overview: [
      'An AI-powered Discord bot built for trading communities. 30+ commands, GPT-4o integration, auto-moderation, and real-time market data.',
      'Developed across 12 phases, from basic commands to full AI integration and community management features.'
    ],
    problem: {
      heading: 'The Challenge',
      content: [
        'Trading communities on Discord need tools for education, market updates, and moderation. Generic bots lack the trading context needed to be useful.',
        'The goal was to build a purpose-built bot that understands trading concepts and can provide relevant assistance to community members.'
      ]
    },
    approach: {
      heading: 'Development Phases',
      content: [
        'Built iteratively across 12 phases: core commands, database integration, market data, AI chat, moderation, welcome flows, and more.',
        'Each phase was tested in a private server before deploying to the production community.'
      ]
    },
    technicalDetails: {
      heading: 'Technical Details',
      sections: [
        {
          title: 'AI Integration',
          content: 'GPT-4o powers natural language interactions. Custom system prompts provide trading context and ensure helpful responses.'
        },
        {
          title: 'Market Data',
          content: 'Alpaca API provides real-time market data. Price alerts trigger Discord notifications within seconds.'
        }
      ]
    },
    challenges: [
      {
        title: 'AI Content Safety',
        challenge: 'Preventing the AI from giving financial advice that could be harmful.',
        solution: 'Strict system prompts, response filtering, and clear disclaimers on all AI-generated content.',
        result: 'Educational content only, no actionable trading advice.'
      }
    ],
    results: {
      heading: 'Results',
      content: 'The bot is live and actively used by the Nexural trading community.',
      metrics: [
        { label: 'Commands', value: '30+' },
        { label: 'Dev Phases', value: '12' },
        { label: 'AI-Powered', value: 'Yes' },
        { label: 'Real-Time Data', value: 'Yes' }
      ]
    }
  }
}

export default function CaseStudyDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const study = caseStudies.find(s => s.slug === slug)
  const content = caseStudyContent[slug]

  if (!study || !content) {
    notFound()
  }

  const currentIndex = caseStudies.findIndex(s => s.slug === slug)
  const prevStudy = currentIndex > 0 ? caseStudies[currentIndex - 1] : null
  const nextStudy = currentIndex < caseStudies.length - 1 ? caseStudies[currentIndex + 1] : null

  return (
    <div className="min-h-screen pt-24 pb-20">
      <ReadingProgress />
      
      {/* Header */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Breadcrumb */}
          <BreadcrumbNav
            items={[
              { label: 'Case Studies', href: '/case-studies' },
              { label: study.title }
            ]}
          />

          <SectionLabel>Case Study {study.number}</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-[#FAFAFA]">
            {study.title}
          </h1>
          <p className="mt-4 text-xl text-[#A1A1AA]">{study.subtitle}</p>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#71717A]">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(study.publishedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {study.readTime} min read
            </span>
            <span className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {study.category}
            </span>
          </div>

          {/* Tags */}
          <div className="mt-6 flex flex-wrap gap-2">
            {study.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono text-[#71717A] bg-[#18181B] border border-[#27272A] px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Key Metrics */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {study.metrics.map((metric) => (
            <div key={metric.label} className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl text-center">
              <div className="text-2xl font-bold text-[#06B6D4]">{metric.value}</div>
              <div className="text-sm text-[#71717A]">{metric.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="prose prose-invert max-w-none">
            {content.overview.map((para, i) => (
              <p key={i} className="text-[#A1A1AA] leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </motion.section>

        {/* The Problem */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-6">
            {content.problem.heading}
          </h2>
          <div className="prose prose-invert max-w-none">
            {content.problem.content.map((para, i) => (
              <p key={i} className="text-[#A1A1AA] leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </motion.section>

        {/* The Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SectionLabel>The Approach</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-6">
            {content.approach.heading}
          </h2>
          <div className="prose prose-invert max-w-none">
            {content.approach.content.map((para, i) => (
              <p key={i} className="text-[#A1A1AA] leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </motion.section>

        {/* Technical Details */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SectionLabel>Technical Details</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-6">
            {content.technicalDetails.heading}
          </h2>
          <div className="space-y-6">
            {content.technicalDetails.sections.map((section) => (
              <div key={section.title} className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl">
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">{section.title}</h3>
                <p className="text-[#A1A1AA]">{section.content}</p>
                {section.code && (
                  <pre className="mt-4 p-4 bg-[#09090B] border border-[#27272A] rounded-lg overflow-x-auto text-sm font-mono text-[#A1A1AA] leading-relaxed">
                    <code>{section.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Challenges */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SectionLabel>Challenges</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-6">
            Problems & Solutions
          </h2>
          <div className="space-y-6">
            {content.challenges.map((challenge) => (
              <div key={challenge.title} className="p-6 bg-[#18181B] border border-[#27272A] rounded-xl">
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">{challenge.title}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-[#EF4444]">Challenge: </span>
                    <span className="text-[#A1A1AA]">{challenge.challenge}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#F59E0B]">Solution: </span>
                    <span className="text-[#A1A1AA]">{challenge.solution}</span>
                  </div>
                  <div>
                    <span className="font-medium text-[#10B981]">Result: </span>
                    <span className="text-[#A1A1AA]">{challenge.result}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <SectionLabel>Results</SectionLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-[#FAFAFA] mb-6">
            {content.results.heading}
          </h2>
          <p className="text-[#A1A1AA] mb-8">{content.results.content}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {content.results.metrics.map((metric) => (
              <div key={metric.label} className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl text-center">
                <div className="text-xl font-bold text-[#06B6D4]">{metric.value}</div>
                <div className="text-xs text-[#71717A]">{metric.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Links */}
        {(content.github || content.liveUrl) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex flex-wrap gap-4">
              {content.github && (
                <Button asChild variant="outline" className="border-[#27272A] text-[#A1A1AA] hover:text-[#06B6D4] hover:border-[#06B6D4]">
                  <Link href={content.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
              )}
              {content.liveUrl && (
                <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE]">
                  <Link href={content.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Live
                  </Link>
                </Button>
              )}
            </div>
          </motion.section>
        )}

        {/* Navigation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 pt-8 border-t border-[#27272A]"
        >
          <div className="flex justify-between">
            {prevStudy ? (
              <Link href={`/case-studies/${prevStudy.slug}`} className="group">
                <span className="text-xs text-[#71717A]">Previous</span>
                <p className="text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {prevStudy.title}
                </p>
              </Link>
            ) : <div />}
            {nextStudy && (
              <Link href={`/case-studies/${nextStudy.slug}`} className="group text-right">
                <span className="text-xs text-[#71717A]">Next</span>
                <p className="text-[#FAFAFA] group-hover:text-[#06B6D4] transition-colors flex items-center justify-end">
                  {nextStudy.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </p>
              </Link>
            )}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlowCard glowColor="violet">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#FAFAFA] mb-4">
                Want me to build something like this for you?
              </h2>
              <p className="text-[#A1A1AA] mb-6 max-w-lg mx-auto">
                {"I help businesses build custom software, automate operations, and ship trading tools. Let's discuss your project."}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild className="bg-[#8B5CF6] text-white hover:bg-[#A78BFA] btn-glow">
                  <Link href="/services">
                    View Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-[#27272A] text-[#A1A1AA] hover:text-[#06B6D4] hover:border-[#06B6D4]">
                  <Link href="/contact">
                    Contact Me
                  </Link>
                </Button>
              </div>
            </div>
          </GlowCard>
        </motion.section>
      </article>
    </div>
  )
}
