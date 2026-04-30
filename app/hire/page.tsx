import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Monitor, TestTube2, Cloud, TrendingUp, Brain, Briefcase, CheckCircle2, Download, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hire Jason Teixeira | Full-Stack Developer & Trading Systems Engineer — Remote',
  description: 'Full-stack developer with 5 years of fintech experience seeking remote roles. Self-taught builder with 20+ projects, 9 certifications, and a production platform with 185 database tables. B.S. in CS and Finance.',
  openGraph: {
    title: 'Hire Jason Teixeira — Full-Stack Developer',
    description: 'Seeking remote dev roles: full-stack, fintech, QA, DevOps. 5 years fintech experience, 9 certs, 20+ projects.',
  },
  keywords: [
    'hire developer', 'junior developer remote', 'full-stack developer',
    'fintech developer', 'trading systems developer', 'QA engineer',
    'devops engineer remote', 'Orlando FL developer', 'self-taught developer',
    'python developer', 'typescript developer', 'entry level software engineer'
  ],
}

const targetRoles = [
  { icon: Monitor, title: 'Software Developer', description: 'Full-stack development with Next.js, Python, TypeScript. 5 years building trading apps and business tools at HighStrike. 20+ personal projects.', keywords: 'Software Developer, Full-Stack Developer, Web Developer, SDE' },
  { icon: TestTube2, title: 'QA / Automation Engineer', description: 'Test frameworks, CI/CD pipelines, Playwright, Selenium, pytest. ISTQB certified (3x including CT-AI). Built multiple testing suites.', keywords: 'QA Engineer, SDET, Test Engineer, Automation Engineer' },
  { icon: Cloud, title: 'DevOps / Cloud Engineer', description: 'AWS, Terraform, Docker, GitHub Actions. Built CI/CD pipelines and cloud infrastructure. 5 AWS knowledge certifications.', keywords: 'DevOps Engineer, Cloud Engineer, Infrastructure Engineer' },
  { icon: TrendingUp, title: 'FinTech Developer', description: 'Trading platforms, market data, indicators, strategy development. Active futures trader who builds his own tools.', keywords: 'FinTech Developer, Trading Systems, Quantitative Developer' },
  { icon: Brain, title: 'AI / ML Developer', description: 'LLM integration (GPT-4o, Claude), ML signal systems, AI-powered bots. Built AlphaStream with 5 ML models.', keywords: 'AI Developer, ML Engineer, LLM Integration' },
]

const highlights = [
  '5 years building trading apps & business tools at HighStrike (contract)',
  'Built 185-table fintech platform independently — database to deploy',
  '20+ projects with real code on GitHub you can inspect today',
  '9 certifications (ISTQB x3, AWS x5, Cisco)',
  '51 technical blog posts published',
  'B.S. Computer Science (Full Sail) + B.S. Finance (Kean)',
  'Ran a construction business — project management, client delivery, budgets',
  'Active futures trader (8 symbols daily) — real domain expertise',
  'Trilingual: English, Portuguese, Spanish',
  'Self-taught developer with entrepreneurial drive',
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
          A Developer Who Builds and Ships
        </h1>
        <p className="mt-6 text-lg text-[#A1A1AA] max-w-3xl">
          {"Full-stack developer with 5 years of hands-on fintech development and 20+ projects you can inspect on GitHub. I'm self-taught, I've run my own business, and I've built a production platform with 185 database tables from scratch. I'm looking for a team where I can contribute from day one and keep growing as an engineer."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#71717A]">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Orlando, FL — Remote Only</span>
          <span>Full-Time or Contract</span>
          <span>Open to Any Level</span>
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
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">Roles I Am Targeting</h2>
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
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Why Take a Chance on Me</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">I show, not tell.</h3>
              <p className="text-[#A1A1AA] mb-4">{"I have 20+ projects with real code on GitHub, 5 case studies, a live telemetry dashboard, 51 blog posts, and 27 downloadable artifacts. Every claim on this site has a URL you can verify."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">I figure things out.</h3>
              <p className="text-[#A1A1AA] mb-4">{"Everything I know is self-taught. I built full-stack trading applications at HighStrike with no formal training — just persistence, documentation, and relentless problem-solving. Give me a problem and I will find the solution."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">{"I don't need hand-holding."}</h3>
              <p className="text-[#A1A1AA] mb-4">{"I ran a construction business and built a 185-table fintech platform solo. I know how to manage my time, prioritize work, communicate with stakeholders, and deliver. I'm looking for guidance and mentorship, not micromanagement."}</p>
            </div>
            <div>
              <h3 className="font-semibold text-[#FAFAFA] mb-3">I bring real-world perspective.</h3>
              <p className="text-[#A1A1AA] mb-4">{"Finance degree + CS degree + construction management + fintech development + active trading. I understand business, users, and the real-world impact of the software I build. I don't just write code — I understand why it matters."}</p>
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
