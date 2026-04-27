import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Monitor, TestTube2, Cloud, TrendingUp, Brain, Briefcase, CheckCircle2, Download, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hire Jason Teixeira | Senior Systems Architect & Full-Stack Engineer — Remote',
  description: 'Senior/Staff-level systems architect seeking remote roles in automation engineering, platform engineering, full-stack development, or fintech. Fortune 50 + fintech experience. 9 certifications. 20+ production projects.',
  openGraph: {
    title: 'Hire Jason Teixeira — Senior Systems Architect',
    description: 'Seeking remote roles: automation, platform engineering, full-stack, fintech. Fortune 50 experience, 9 certs, 20+ projects.',
  },
  keywords: [
    'hire senior engineer', 'staff engineer remote', 'senior automation engineer',
    'platform engineer hire', 'SDET remote', 'senior full-stack developer',
    'fintech engineer', 'test infrastructure lead', 'QA architect',
    'devops engineer remote', 'Orlando FL developer', 'hire systems architect'
  ],
}

const targetRoles = [
  { icon: Monitor, title: 'Senior / Staff Software Engineer', description: 'Full-stack development with Next.js, Python, .NET. Architecture ownership, mentoring, technical decision-making.', keywords: 'SDE, SWE, Software Engineer, Full-Stack Developer' },
  { icon: TestTube2, title: 'Senior Automation / QA Engineer', description: 'Test framework architecture, CI/CD pipeline optimization, quality engineering culture. ISTQB certified (3x).', keywords: 'SDET, QA Architect, Test Lead, Automation Architect' },
  { icon: Cloud, title: 'Platform / DevOps Engineer', description: 'AWS infrastructure, Terraform IaC, CI/CD, SLOs, incident response, cost optimization. 6 AWS certifications.', keywords: 'Platform Engineer, SRE, DevOps Engineer, Cloud Engineer' },
  { icon: TrendingUp, title: 'FinTech / Trading Systems Engineer', description: 'Trading platforms, risk systems, market data pipelines. Active futures trader who builds his own tools.', keywords: 'FinTech Developer, Trading Systems, Quantitative Engineer' },
  { icon: Brain, title: 'AI / ML Engineer', description: 'LLM integration (GPT-4o, Claude), ML signal systems, AI-powered bots with safety guardrails.', keywords: 'AI Engineer, ML Engineer, LLM Integration' },
  { icon: Briefcase, title: 'Engineering Manager / Tech Lead', description: 'Trained 50+ engineers, established QA standards at 2 companies, architecture decision ownership.', keywords: 'Tech Lead, Engineering Manager, QA Manager' },
]

const highlights = [
  'Fortune 50 experience (Home Depot, 2,300+ stores)',
  'Fintech production systems ($10M+ daily volume)',
  'Built 185-table platform as sole architect',
  '13 testing frameworks, 500+ tests in production',
  '9 certifications (ISTQB x3, AWS x5, Cisco)',
  '50 technical articles published',
  '120,000-word trading book (24 chapters)',
  'Active futures trader (8 symbols daily)',
  'Trilingual: English, Portuguese, Spanish',
  'B.S. Finance (Kean) + B.S. Computer Science (Full Sail)',
]

const techStack = {
  'Languages': 'TypeScript, Python, C#/.NET, JavaScript, SQL, HCL',
  'Frontend': 'Next.js, React, Tailwind CSS, Framer Motion',
  'Backend': 'Node.js, .NET 8, FastAPI, Express, REST APIs',
  'Cloud': 'AWS, Vercel, Terraform, Docker, Kubernetes, GitHub Actions',
  'Testing': 'Selenium, Playwright, Cypress, Appium, pytest, JMeter',
  'AI/Data': 'GPT-4/Claude API, scikit-learn, pandas, XGBoost, PyTorch',
  'Trading': 'NinjaTrader 8, Sierra Chart, Alpaca API, WebSockets',
}

export default function HirePage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 text-sm text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 rounded-full py-1.5 px-4">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            Actively seeking opportunities
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA] leading-tight">
          Hire a Systems Architect Who Ships
        </h1>
        <p className="mt-6 text-lg text-[#A1A1AA] max-w-3xl">
          {"Senior/Staff-level engineer with Fortune 50 enterprise and fintech production experience. I don't just write code — I architect systems, build platforms, train teams, and operate infrastructure. 20+ production projects. 50 technical articles. 9 certifications."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#71717A]">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Orlando, FL — Remote-First</span>
          <span>Senior / Staff Level</span>
          <span>Full-Time or Contract</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href="/resume.pdf" download className="inline-flex items-center px-6 py-3 bg-[#06B6D4] text-[#09090B] font-semibold rounded-xl hover:bg-[#22D3EE] transition-colors">
            <Download className="mr-2 h-4 w-4" /> Download Resume
          </a>
          <Link href="https://cal.com/jason-teixeira-8elz3z" target="_blank" className="inline-flex items-center px-6 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
            <Calendar className="mr-2 h-4 w-4" /> Schedule a Call
          </Link>
          <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
            Contact Me <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* What I'm Looking For */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">Roles I Excel In</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetRoles.map(role => (
            <div key={role.title} className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/30 transition-colors">
              <role.icon className="h-6 w-6 text-[#06B6D4] mb-3" />
              <h3 className="text-base font-semibold text-[#FAFAFA] mb-2">{role.title}</h3>
              <p className="text-sm text-[#A1A1AA] mb-3">{role.description}</p>
              <p className="text-[10px] font-mono text-[#71717A]">{role.keywords}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What I Bring */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">What I Bring to Your Team</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {highlights.map(item => (
            <div key={item} className="flex items-start gap-3 p-3">
              <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5 shrink-0" />
              <span className="text-sm text-[#A1A1AA]">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Summary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">Technical Skills</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(techStack).map(([category, techs]) => (
            <div key={category} className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl">
              <h3 className="text-sm font-semibold text-[#06B6D4] mb-2">{category}</h3>
              <p className="text-sm text-[#A1A1AA]">{techs}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center">
          <Link href="/stack" className="text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors">
            See full tech stack (56 technologies) →
          </Link>
        </p>
      </section>

      {/* Why Me vs Other Candidates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 bg-gradient-to-r from-[#06B6D4]/10 to-[#8B5CF6]/10 border border-[#06B6D4]/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Why Hire Me Over Other Candidates</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">Most engineers say they build.</h3>
              <p className="text-[#A1A1AA] mb-4">{"I have a live portfolio with 20+ production projects, 5 case studies with code, a live telemetry dashboard, 50 blog posts, and 27 downloadable artifacts. Every claim on my resume has a URL."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">Most engineers specialize in one thing.</h3>
              <p className="text-[#A1A1AA] mb-4">{"I architect full-stack applications, build test automation frameworks, deploy cloud infrastructure, develop trading systems, and integrate AI — across enterprise retail and fintech. I bring pattern recognition across domains."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">Most engineers need direction.</h3>
              <p className="text-[#A1A1AA] mb-4">{"I founded Sage Ideas LLC and built the Nexural ecosystem solo — 185 tables, 69 APIs, 7 systems, from architecture to production. I'm self-directed, I document everything, and I mentor others."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">Most engineers just code.</h3>
              <p className="text-[#A1A1AA] mb-4">{"I operate systems. SLOs, incident drills, runbooks, security receipts. My portfolio site has a platform engineering page with 99.9% availability targets and tested failure modes. I think about production, not just development."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Explore My Work</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/projects" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors text-center">
            <p className="text-2xl font-bold text-[#FAFAFA]">20+</p>
            <p className="text-sm text-[#A1A1AA]">Projects</p>
          </Link>
          <Link href="/case-studies" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors text-center">
            <p className="text-2xl font-bold text-[#FAFAFA]">5</p>
            <p className="text-sm text-[#A1A1AA]">Case Studies</p>
          </Link>
          <Link href="/blog" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors text-center">
            <p className="text-2xl font-bold text-[#FAFAFA]">50</p>
            <p className="text-sm text-[#A1A1AA]">Blog Posts</p>
          </Link>
          <Link href="/platform" className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl hover:border-[#06B6D4]/50 transition-colors text-center">
            <p className="text-2xl font-bold text-[#FAFAFA]">99.9%</p>
            <p className="text-sm text-[#A1A1AA]">SLO Target</p>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-3">{"Let's Talk"}</h2>
          <p className="text-[#A1A1AA] mb-6">{"I'm open to remote full-time roles, contract positions, and consulting engagements."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/resume.pdf" download className="inline-flex items-center px-8 py-3 bg-[#06B6D4] text-[#09090B] font-semibold rounded-xl hover:bg-[#22D3EE] transition-colors">
              <Download className="mr-2 h-4 w-4" /> Download Resume
            </a>
            <Link href="https://cal.com/jason-teixeira-8elz3z" target="_blank" className="inline-flex items-center px-8 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
              Schedule a Call
            </Link>
            <Link href="mailto:sage@sageideas.org" className="inline-flex items-center px-8 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
              sage@sageideas.org
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
