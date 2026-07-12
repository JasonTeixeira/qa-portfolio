import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileDown,
  Github,
  Layers3,
  Linkedin,
  ServerCog,
  ShieldCheck,
  TestTube2,
} from 'lucide-react'
import { CtaLink, Hairline, MonoLabel, Section, Surface } from '@/components/el'

export const metadata: Metadata = {
  title: 'Jason Teixeira - AI Applications Engineer',
  description:
    'Recruiter proof page for Jason Teixeira: AI applications engineering, LLM workflows, RAG, eval harnesses, agents, full-stack product engineering, and production deployment evidence.',
  alternates: {
    canonical: 'https://www.sageideas.dev/hire-ai-engineer',
  },
  keywords: [
    'Jason Teixeira AI engineer',
    'AI Applications Engineer',
    'LLM Engineer',
    'RAG Engineer',
    'Forward Deployed AI Engineer',
    'AI Evaluation Engineer',
    'Full Stack AI Engineer',
  ],
}

const targetRoles = [
  {
    title: 'AI Applications Engineer',
    fit: 'Highest fit',
    keywords: ['LLM workflows', 'agents', 'RAG', 'evals', 'TypeScript', 'Python', 'Next.js'],
  },
  {
    title: 'Forward Deployed AI Engineer',
    fit: 'High fit',
    keywords: ['customer workflows', 'prototyping', 'integration', 'APIs', 'production support'],
  },
  {
    title: 'RAG / LLM Evaluation Engineer',
    fit: 'High fit',
    keywords: ['retrieval', 'prompt evaluation', 'test harnesses', 'guardrails', 'observability'],
  },
  {
    title: 'Full-Stack AI Product Engineer',
    fit: 'High fit',
    keywords: ['SaaS', 'auth', 'Stripe', 'Supabase', 'Vercel', 'CI/CD', 'user workflows'],
  },
]

const proofStats = [
  { value: '105', label: 'Production routes in sageideas.dev' },
  { value: '58+', label: 'API endpoints in Nexural Research' },
  { value: '604', label: 'Tests reported in Nexural Research' },
  { value: '8', label: 'MCP tools in Nexural Automation' },
]

const proofProjects = [
  {
    name: 'Nexural Research',
    icon: BrainCircuit,
    summary:
      'AI research platform with multi-provider AI strategy analysis, API validation, portfolio analytics, and production-grade testing.',
    evidence: ['Claude/GPT/Perplexity provider layer', '58 API endpoints', '604 tests and 93% reported coverage'],
    href: 'https://github.com/JasonTeixeira/Nexural-Research',
  },
  {
    name: 'Nexural Automation',
    icon: Bot,
    summary:
      'MCP automation system with typed tools, validation gauntlets, contract tests, CI gates, and secret scanning.',
    evidence: ['8 MCP tools', 'Strategy and Bridge SDKs', 'cost model and contract tests'],
    href: 'https://github.com/JasonTeixeira/Nexural_Automation',
  },
  {
    name: 'SageIdeas.dev',
    icon: Layers3,
    summary:
      'Production Next.js platform on Vercel with auth, Supabase, Stripe, API routes, RLS, audit logs, and deployment workflows.',
    evidence: ['105 routes', '57 API endpoints', '38 database tables'],
    href: 'https://github.com/JasonTeixeira/sageideas.dev',
  },
  {
    name: 'Trade Engine / AlphaStream',
    icon: ServerCog,
    summary:
      'Python and full-stack trading systems with indicators, backtesting workflows, signal generation, and operational dashboards.',
    evidence: ['Python analytics', 'backtesting workflows', 'production-style dashboards'],
    href: 'https://github.com/JasonTeixeira',
  },
]

const operatingSignals = [
  {
    icon: TestTube2,
    title: 'Evaluation mindset',
    text: 'Builds validation harnesses, parser checks, contract tests, smoke tests, and regression gates around AI and product workflows.',
  },
  {
    icon: ShieldCheck,
    title: 'Production judgment',
    text: 'Comfortable with auth, RLS, Stripe, API boundaries, CI, deployment config, logging, and operational failure modes.',
  },
  {
    icon: CheckCircle2,
    title: 'Ships complete slices',
    text: 'Can turn vague product intent into working interfaces, backend routes, automations, docs, and deployable proof.',
  },
]

const resumeVariants = [
  {
    label: 'AI Applications Engineer',
    href: '/recruiter/Jason_Teixeira_AI_Applications_Engineer.pdf',
  },
  {
    label: 'AI Data Annotation / LLM Evaluator',
    href: '/recruiter/Jason_Teixeira_AI_Data_Annotation_LLM_Evaluator.pdf',
  },
  {
    label: 'RAG / Evaluation Engineer',
    href: '/recruiter/Jason_Teixeira_RAG_Evaluation_Engineer.pdf',
  },
  {
    label: 'Forward Deployed AI Engineer',
    href: '/recruiter/Jason_Teixeira_Forward_Deployed_AI_Engineer.pdf',
  },
  {
    label: 'AI QA / LLM Evaluation Engineer',
    href: '/recruiter/Jason_Teixeira_AI_QA_LLM_Evaluation_Engineer.pdf',
  },
  {
    label: 'AI Prompt / Content Evaluator',
    href: '/recruiter/Jason_Teixeira_AI_Prompt_Content_Evaluator.pdf',
  },
  {
    label: 'Full-Stack AI Product Engineer',
    href: '/recruiter/Jason_Teixeira_Full_Stack_AI_Product_Engineer.pdf',
  },
  {
    label: 'Application Support Analyst',
    href: '/recruiter/Jason_Teixeira_Application_Support_Analyst.pdf',
  },
  {
    label: 'IT Support Specialist',
    href: '/recruiter/Jason_Teixeira_IT_Support_Specialist.pdf',
  },
  {
    label: 'NOC Technician',
    href: '/recruiter/Jason_Teixeira_NOC_Technician.pdf',
  },
  {
    label: 'Cloud Support Associate',
    href: '/recruiter/Jason_Teixeira_Cloud_Support_Associate.pdf',
  },
  {
    label: 'Junior Security / GRC Analyst',
    href: '/recruiter/Jason_Teixeira_SOC_GRC_Analyst.pdf',
  },
  {
    label: 'Junior QA Analyst',
    href: '/recruiter/Jason_Teixeira_Junior_QA_Analyst.pdf',
  },
  {
    label: 'QA Automation Engineer',
    href: '/recruiter/Jason_Teixeira_QA_Automation_Engineer.pdf',
  },
  {
    label: 'Technical Support Engineer',
    href: '/recruiter/Jason_Teixeira_Technical_Support_Engineer.pdf',
  },
  {
    label: 'Product Support Specialist',
    href: '/recruiter/Jason_Teixeira_Product_Support_Specialist.pdf',
  },
  {
    label: 'Implementation Specialist',
    href: '/recruiter/Jason_Teixeira_Implementation_Specialist.pdf',
  },
  {
    label: 'Associate Solutions Engineer',
    href: '/recruiter/Jason_Teixeira_Associate_Solutions_Engineer.pdf',
  },
  {
    label: 'Technical Customer Success Associate',
    href: '/recruiter/Jason_Teixeira_Technical_Customer_Success_Associate.pdf',
  },
  {
    label: 'Junior Data Analyst',
    href: '/recruiter/Jason_Teixeira_Junior_Data_Analyst.pdf',
  },
  {
    label: 'Data Quality Analyst',
    href: '/recruiter/Jason_Teixeira_Data_Quality_Analyst.pdf',
  },
  {
    label: 'Business Systems Analyst',
    href: '/recruiter/Jason_Teixeira_Business_Systems_Analyst.pdf',
  },
  {
    label: 'Technical Project Coordinator',
    href: '/recruiter/Jason_Teixeira_Technical_Project_Coordinator.pdf',
  },
  {
    label: 'Revenue Operations Associate',
    href: '/recruiter/Jason_Teixeira_Revenue_Operations_Associate.pdf',
  },
  {
    label: 'Junior Web Developer',
    href: '/recruiter/Jason_Teixeira_Junior_Web_Developer.pdf',
  },
  {
    label: 'Web / CMS Specialist',
    href: '/recruiter/Jason_Teixeira_Web_CMS_Specialist.pdf',
  },
  {
    label: 'Junior Full-Stack Developer',
    href: '/recruiter/Jason_Teixeira_Junior_Full_Stack_Developer.pdf',
  },
  {
    label: 'Technical Writer',
    href: '/recruiter/Jason_Teixeira_Technical_Writer.pdf',
  },
]

export default function HireAiEngineerPage() {
  return (
    <main className="overflow-hidden bg-[var(--sage-bg)]">
      <section className="relative border-b border-[var(--sage-border)] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-4">
            <MonoLabel tone="accent">open to work</MonoLabel>
            <Hairline className="flex-1" />
            <MonoLabel tone="muted">AI engineering</MonoLabel>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[clamp(2.5rem,1.4rem+5vw,5.7rem)] font-normal leading-[0.98] text-[var(--sage-ink)]">
                Jason Teixeira
                <span className="block italic text-[#3D5AFE]">AI Applications Engineer</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--sage-ink-muted)] sm:text-lg">
                Full-stack builder focused on AI products, LLM workflows, RAG systems, evaluation
                harnesses, MCP-style automation, and production deployment. Best fit for teams that
                need someone who can build working AI applications, not only model demos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaLink
                  href="/recruiter/Jason_Teixeira_AI_Applications_Engineer.pdf"
                  variant="solid"
                  event="recruiter_resume_download"
                  eventProps={{ role: 'ai_applications_engineer' }}
                >
                  Download resume
                </CtaLink>
                <CtaLink
                  href="https://github.com/JasonTeixeira"
                  event="recruiter_external_click"
                  eventProps={{ destination: 'github' }}
                >
                  GitHub
                </CtaLink>
                <CtaLink
                  href="https://www.linkedin.com/in/jason-teixeira"
                  event="recruiter_external_click"
                  eventProps={{ destination: 'linkedin' }}
                >
                  LinkedIn
                </CtaLink>
              </div>
            </div>

            <Surface level={2} ticks className="p-5 sm:p-6">
              <MonoLabel tone="muted">best-fit roles</MonoLabel>
              <div className="mt-5 space-y-4">
                {targetRoles.map((role) => (
                  <div key={role.title} className="border-t border-[var(--sage-border)] pt-4 first:border-t-0 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-mono text-sm uppercase tracking-[0.08em] text-[var(--sage-ink)]">
                        {role.title}
                      </h2>
                      <span className="rounded-[3px] border border-[var(--sage-border-strong)] px-2 py-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#3D5AFE]">
                        {role.fit}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--sage-ink-muted)]">
                      {role.keywords.join(' / ')}
                    </p>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </section>

      <Section
        index="01"
        eyebrow="proof"
        ariaLabel="Recruiter proof"
        heading={
          <>
            Concrete build evidence, <span className="italic text-[#3D5AFE]">not loose claims.</span>
          </>
        }
        lede="The fastest hiring-manager scan should show production systems, AI workflows, test coverage, deployment experience, and real repositories."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofStats.map((stat) => (
            <Surface key={stat.label} level={2} className="p-5">
              <div className="font-mono text-3xl text-[var(--sage-ink)]">{stat.value}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--sage-ink-muted)]">{stat.label}</p>
            </Surface>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {proofProjects.map((project) => {
            const Icon = project.icon
            return (
              <Surface key={project.name} level={2} interactive className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-3)] text-[#3D5AFE]">
                    <Icon size={21} aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal text-[var(--sage-ink)]">{project.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">
                      {project.summary}
                    </p>
                    <ul className="mt-4 grid gap-2">
                      {project.evidence.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-[var(--sage-ink-subtle)]">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#A8C633]" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={project.href}
                      className="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[#3D5AFE] hover:text-[#5670ff]"
                    >
                      View repo <ArrowUpRight size={14} aria-hidden />
                    </Link>
                  </div>
                </div>
              </Surface>
            )
          })}
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="signals"
        ariaLabel="Operating signals"
        heading={
          <>
            Why this profile matches <span className="italic text-[#3D5AFE]">AI application teams.</span>
          </>
        }
        lede="The strongest angle is not generic machine learning research. It is applied AI engineering: product surfaces, integration work, evaluation loops, and deployment."
        grain
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {operatingSignals.map((signal) => {
            const Icon = signal.icon
            return (
              <Surface key={signal.title} level={2} className="p-6">
                <Icon className="size-7 text-[#3D5AFE]" aria-hidden />
                <h3 className="mt-5 text-xl font-normal text-[var(--sage-ink)]">{signal.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--sage-ink-muted)]">{signal.text}</p>
              </Surface>
            )
          })}
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="resume pack"
        ariaLabel="Resume variants"
        heading={
          <>
            ATS-safe resumes for <span className="italic text-[#3D5AFE]">multiple hiring funnels.</span>
          </>
        }
        lede="Each PDF is plain-text parseable and tuned to a different role family: AI engineering, QA/testing, AI evaluation, support, implementation, solutions, data, and junior web/full-stack."
        action={
          <CtaLink href="mailto:sage@sageideas.dev?subject=AI%20Engineering%20Interview%20-%20Jason%20Teixeira" variant="solid">
            Contact Jason
          </CtaLink>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {resumeVariants.map((resume) => (
            <Link
              key={resume.href}
              href={resume.href}
              className="group flex items-center justify-between gap-4 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] p-4 transition-colors hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-3)]"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-[var(--sage-ink)]">
                <FileDown className="size-4 text-[#3D5AFE]" aria-hidden />
                {resume.label}
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-[var(--sage-ink-faint)] transition-colors group-hover:text-[#3D5AFE]" aria-hidden />
            </Link>
          ))}
        </div>

        <Surface level={1} className="mt-8 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="https://github.com/JasonTeixeira"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--sage-ink-muted)] hover:text-[#3D5AFE]"
            >
              <Github size={16} aria-hidden /> github.com/JasonTeixeira
            </Link>
            <Link
              href="https://www.linkedin.com/in/jason-teixeira"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--sage-ink-muted)] hover:text-[#3D5AFE]"
            >
              <Linkedin size={16} aria-hidden /> linkedin.com/in/jason-teixeira
            </Link>
          </div>
        </Surface>
      </Section>
    </main>
  )
}
