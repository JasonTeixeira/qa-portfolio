import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, TestTube2, GitBranch, Gauge, Shield, BarChart3, Smartphone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Enterprise QA Automation | Jason Teixeira — Test Frameworks, CI/CD, Quality Engineering',
  description: 'QA automation architecture for enterprise teams. 13 testing frameworks built, 500+ tests in production, 82% pipeline reduction. Home Depot and HighStrike experience. ISTQB certified.',
  openGraph: {
    title: 'Enterprise QA Automation — Jason Teixeira',
    description: '13 testing frameworks, 500+ tests, 82% faster pipelines. ISTQB certified QA automation architect.',
  },
  keywords: ['qa automation engineer', 'test automation architect', 'enterprise testing', 'selenium framework', 'playwright testing', 'CI/CD pipeline optimization', 'ISTQB certified', 'QA consultant'],
}

const frameworks = [
  { icon: TestTube2, title: 'API Testing', description: 'Smart retry logic on 429/5xx, Pydantic schema validation, session pooling. 3x speed improvement over baseline.', link: '/blog/building-a-production-ready-api-testing-framework' },
  { icon: GitBranch, title: 'E2E & Web Automation', description: 'Selenium POM + Playwright. Multi-browser, parallel execution via pytest-xdist, Docker containerized, CI integrated.', link: '/projects' },
  { icon: Gauge, title: 'Performance Testing', description: 'Locust load testing with realistic user scenarios, P95/P99 latency tracking, threshold enforcement in CI.', link: '/blog/performance-testing-from-zero-to-production' },
  { icon: Shield, title: 'Security Testing', description: 'OWASP Top 10 automated scanning — SQL injection, XSS, secrets detection with CWE ID tracking.', link: '/blog/owasp-top-10-automated-testing-a-practical-implementation' },
  { icon: BarChart3, title: 'Visual Regression', description: 'Percy integration for visual comparison testing. Multi-viewport snapshots, baseline management, CI workflow.', link: '/projects' },
  { icon: Smartphone, title: 'Mobile Testing', description: 'Appium cross-platform automation — iOS and Android. Device farm support, visual validation, CI integration.', link: '/blog/mobile-test-automation-with-appium-the-complete-guide' },
]

const results = [
  { metric: '82%', label: 'Pipeline Time Reduction', context: 'From 45 min to 8 min through parallelization and Docker caching' },
  { metric: '<1%', label: 'Flaky Test Rate', context: 'Down from 10% through systematic isolation and retry logic' },
  { metric: '500+', label: 'Tests in Production', context: 'Across API, E2E, visual, performance, and security suites' },
  { metric: '50+', label: 'Engineers Trained', context: 'In test automation practices at enterprise scale' },
]

export default function EnterpriseQAPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full">Enterprise QA</span>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA] leading-tight">
          QA Automation That Ships Confidence
        </h1>
        <p className="mt-6 text-lg text-[#A1A1AA] max-w-3xl">
          {"I've built 13 specialized testing frameworks and run QA at Fortune 50 scale (Home Depot, 2,300+ stores) and fintech speed (HighStrike, $10M+ daily volume). ISTQB certified across 3 disciplines."}
        </p>
        <p className="mt-4 text-sm text-[#71717A] max-w-2xl">
          {"Most QA consultants set up Selenium and leave. I build quality engineering systems — CI/CD integration, telemetry dashboards, incident playbooks, and the automation culture that makes testing stick."}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="https://cal.com/jason-teixeira-8elz3z" target="_blank" className="inline-flex items-center px-6 py-3 bg-[#06B6D4] text-[#09090B] font-semibold rounded-xl hover:bg-[#22D3EE] transition-colors">
            Book a Discovery Call <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/case-studies/testing-frameworks" className="inline-flex items-center px-6 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
            Read the Testing Case Study <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">Proven Results</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map(r => (
            <div key={r.label} className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl">
              <p className="text-3xl font-bold text-[#06B6D4]">{r.metric}</p>
              <p className="text-sm font-medium text-[#FAFAFA] mt-1">{r.label}</p>
              <p className="text-xs text-[#71717A] mt-2">{r.context}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frameworks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <h2 className="text-3xl font-bold text-[#FAFAFA] mb-8">Testing Frameworks I Build</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frameworks.map(fw => (
            <Link key={fw.title} href={fw.link} className="block p-6 bg-[#18181B] border border-[#27272A] rounded-2xl hover:border-[#06B6D4]/30 transition-colors group">
              <fw.icon className="h-8 w-8 text-[#10B981] mb-4" />
              <h3 className="text-lg font-semibold text-[#FAFAFA] mb-2 group-hover:text-[#06B6D4] transition-colors">{fw.title}</h3>
              <p className="text-sm text-[#A1A1AA]">{fw.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="p-8 bg-gradient-to-r from-[#10B981]/10 to-[#06B6D4]/10 border border-[#10B981]/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-4">ISTQB Certified</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl">
              <p className="text-sm font-semibold text-[#FAFAFA]">CTFL</p>
              <p className="text-xs text-[#71717A]">Certified Tester Foundation Level</p>
            </div>
            <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl">
              <p className="text-sm font-semibold text-[#FAFAFA]">TAE</p>
              <p className="text-xs text-[#71717A]">Test Automation Engineer</p>
            </div>
            <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl">
              <p className="text-sm font-semibold text-[#FAFAFA]">CT-AI</p>
              <p className="text-xs text-[#71717A]">AI Testing Specialist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center">
          <h2 className="text-2xl font-bold text-[#FAFAFA] mb-3">Ready to Fix Your Testing?</h2>
          <p className="text-[#A1A1AA] mb-6">{"Whether you need a framework built from scratch or an existing suite optimized — let's talk."}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://cal.com/jason-teixeira-8elz3z" target="_blank" className="inline-flex items-center px-8 py-3 bg-[#06B6D4] text-[#09090B] font-semibold rounded-xl hover:bg-[#22D3EE] transition-colors">
              Book a Call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/services" className="inline-flex items-center px-8 py-3 border border-[#3F3F46] text-[#A1A1AA] rounded-xl hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors">
              All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
