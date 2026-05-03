'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, FileCheck, GitBranch, Cloud, TestTube, Lock, ExternalLink, CheckCircle2, MessageSquareQuote } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'
import { Button } from '@/components/ui/button'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

const certifications = [
  { provider: 'ISTQB', name: 'Certified Tester Foundation Level (CTFL)', category: 'testing' },
  { provider: 'ISTQB', name: 'Test Automation Engineer (TAE)', category: 'testing' },
  { provider: 'ISTQB', name: 'Certified Tester AI Testing (CT-AI)', category: 'testing' },
  { provider: 'AWS', name: 'Certified Cloud Practitioner', category: 'cloud' },
  { provider: 'AWS', name: 'Certified Solutions Architect — Associate', category: 'cloud' },
  { provider: 'AWS', name: 'Certified Developer — Associate', category: 'cloud' },
  { provider: 'AWS', name: 'Certified SysOps Administrator — Associate', category: 'cloud' },
  { provider: 'AWS', name: 'Certified DevOps Engineer — Professional', category: 'cloud' },
  { provider: 'Cisco', name: 'CCNA (Routing & Switching)', category: 'networking' },
]

const categoryColors: Record<string, string> = {
  testing: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
  cloud: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/20',
  networking: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20',
}

const codeQualityStandards = [
  'TypeScript strict mode (no implicit any, no unchecked returns)',
  'ESLint + Prettier configured and enforced in CI',
  'Husky pre-commit hooks (lint, type-check, test)',
  'Minimum test coverage: 60% line coverage enforced by CI gate',
  'All external API calls have error handling and retry logic',
  'No hardcoded secrets — all credentials via environment variables or AWS Secrets Manager',
  'Dependency audits: npm audit / pip audit in CI, no known critical vulnerabilities shipped',
]

const testingFrameworks = [
  { layer: 'Unit', frameworks: 'Jest, Vitest' },
  { layer: 'Component', frameworks: 'Testing Library' },
  { layer: 'API', frameworks: 'Supertest' },
  { layer: 'Contract', frameworks: 'Pact' },
  { layer: 'E2E', frameworks: 'Playwright, Cypress' },
  { layer: 'Performance', frameworks: 'k6, Lighthouse CI' },
  { layer: 'Security', frameworks: 'OWASP ZAP' },
  { layer: 'Accessibility', frameworks: 'Axe' },
  { layer: 'Visual regression', frameworks: 'Percy / Chromatic' },
  { layer: 'BDD', frameworks: 'Cucumber' },
]

const cicdStandards = [
  'TypeScript type check — every PR',
  'ESLint (zero warnings policy)',
  'Full unit test suite',
  'Build verification',
  'E2E smoke test',
  'Security scan (OWASP ZAP on deployment pipelines)',
  'Lighthouse CI performance budget check',
  'GitHub Actions for all CI/CD',
  'Environment segregation: dev / staging / production',
  'GitHub OIDC for AWS deployments (no long-lived credentials)',
  'Rollback capability on all production deployments',
]

const infraStandards = [
  'VPC with public/private subnet architecture',
  'S3 + CloudFront for static assets (no public bucket access)',
  'Lambda + API Gateway for serverless workloads',
  'GitHub OIDC for CI/CD authentication (no IAM user keys)',
  'AWS Secrets Manager for credential management',
  'CloudTrail + Security Hub enabled by default',
  'tfsec + checkov security scanning on all Terraform PRs',
]

const openSourceStats = [
  { value: '106', label: 'Public repositories' },
  { value: '1,438', label: 'Commits (last 12 months)' },
  { value: '57', label: 'Pull requests (last 12 months)' },
  { value: '27', label: 'GitHub followers' },
]

const sections = [
  { id: 'certifications', icon: Shield, label: 'Certifications' },
  { id: 'quality', icon: FileCheck, label: 'Code Quality' },
  { id: 'testing', icon: TestTube, label: 'Testing' },
  { id: 'cicd', icon: GitBranch, label: 'CI/CD' },
  { id: 'infra', icon: Cloud, label: 'Infrastructure' },
  { id: 'oss', icon: Lock, label: 'Open Source' },
  { id: 'references', icon: MessageSquareQuote, label: 'References' },
]

export function TrustContent() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp} className="max-w-3xl">
          <SectionLabel>Evidence</SectionLabel>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] leading-tight">
            Why teams trust<br />the studio.
          </h1>
          <p className="mt-6 text-xl text-[#A1A1AA] font-medium">We don&apos;t ask you to take our word for it. Here&apos;s the evidence.</p>
          <p className="mt-4 text-lg text-[#A1A1AA] leading-relaxed">
            Trust in a software engagement comes from verifiable evidence, not assertions. Every claim on this page is
            backed by something you can check: a public GitHub repo, a certification verification link, a methodology
            document, a test suite count.
          </p>
        </motion.div>

        {/* Quick nav chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mt-10"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] bg-[#0F0F12] border border-[#27272A] rounded-full px-3 py-1.5 hover:border-[#06B6D4] hover:text-[#06B6D4] transition-colors"
            >
              <s.icon className="h-3 w-3" />
              {s.label}
            </a>
          ))}
        </motion.div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-[#06B6D4]" />
              <SectionLabel>Certifications</SectionLabel>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-3">
              9 active certifications across testing, cloud, and networking.
            </h2>
            <p className="text-[#71717A] text-sm mb-2">
              All certifications are active. Verification links available on request — just ask during a discovery call.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {certifications.map((cert, i) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3 p-4 bg-[#09090B] border border-[#27272A] rounded-xl"
              >
                <div className={`mt-0.5 px-2 py-0.5 text-xs font-mono rounded border flex-shrink-0 ${categoryColors[cert.category]}`}>
                  {cert.provider}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#FAFAFA]">{cert.name}</p>
                  <p className="text-xs text-[#71717A] mt-0.5">Active</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Quality */}
      <section id="quality" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <FileCheck className="h-5 w-5 text-[#06B6D4]" />
            <SectionLabel>Code Quality</SectionLabel>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
            Every project ships with these standards enforced.
          </h2>
        </motion.div>
        <div className="space-y-3 max-w-3xl mt-8">
          {codeQualityStandards.map((std, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-start gap-3 p-4 bg-[#0F0F12] border border-[#27272A] rounded-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              <span className="text-[#A1A1AA] text-sm">{std}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testing Infrastructure */}
      <section id="testing" className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-3 mb-2">
              <TestTube className="h-5 w-5 text-[#06B6D4]" />
              <SectionLabel>Testing Infrastructure</SectionLabel>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
              13 testing frameworks. Every layer covered.
            </h2>
            <p className="text-[#A1A1AA] mb-3">
              See the{' '}
              <Link href="/work/quality-telemetry" className="text-[#06B6D4] hover:text-[#22D3EE]">
                Quality Telemetry case study
              </Link>{' '}
              for the full architecture.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8 max-w-4xl">
            {testingFrameworks.map((fw, i) => (
              <motion.div
                key={fw.layer}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl"
              >
                <p className="text-xs font-mono uppercase tracking-widest text-[#06B6D4] mb-2">{fw.layer}</p>
                <p className="text-sm text-[#A1A1AA]">{fw.frameworks}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CI/CD Standards */}
      <section id="cicd" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <GitBranch className="h-5 w-5 text-[#06B6D4]" />
            <SectionLabel>CI/CD Standards</SectionLabel>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
            No code ships without passing CI gates.
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mt-8">
          {cicdStandards.map((std, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-[#0F0F12] border border-[#27272A] rounded-xl"
            >
              <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              <span className="text-[#A1A1AA] text-sm">{std}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Infrastructure Standards */}
      <section id="infra" className="bg-[#0F0F12] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div {...fadeInUp}>
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-5 w-5 text-[#06B6D4]" />
              <SectionLabel>Infrastructure</SectionLabel>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
              Terraform-managed. Security-scanned. Auditable.
            </h2>
            <p className="text-[#A1A1AA] mb-8">All infrastructure provisioned via Terraform.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-3 max-w-3xl">
            {infraStandards.map((std, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3 p-3 bg-[#09090B] border border-[#27272A] rounded-xl"
              >
                <Lock className="h-4 w-4 text-[#06B6D4] mt-0.5 flex-shrink-0" />
                <span className="text-[#A1A1AA] text-sm">{std}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source */}
      <section id="oss" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-5 w-5 text-[#06B6D4]" />
            <SectionLabel>Open-Source Record</SectionLabel>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
            106 public repositories. 1,438 commits in the last year.
          </h2>
          <p className="text-[#A1A1AA] mb-8 max-w-2xl">
            All open-source projects are publicly available and maintained. The commit history is not curated for
            appearances — it&apos;s the actual development record.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mb-10">
          {openSourceStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center p-4 bg-[#0F0F12] border border-[#27272A] rounded-xl"
            >
              <p className="text-3xl font-bold text-[#FAFAFA] font-mono">{stat.value}</p>
              <p className="text-xs text-[#71717A] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            asChild
            className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold"
          >
            <a href="https://github.com/JasonTeixeira" target="_blank" rel="noopener noreferrer">
              View GitHub profile
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>
      </section>

      {/* References */}
      <section id="references" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3 mb-2">
            <MessageSquareQuote className="h-5 w-5 text-[#06B6D4]" />
            <SectionLabel>References</SectionLabel>
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-4">
            Talk to past collaborators directly.
          </h2>
          <p className="text-[#A1A1AA] text-base leading-relaxed max-w-3xl">
            Sage Ideas is a young studio. Rather than ship cherry-picked
            testimonials, every prospective client gets the option to talk
            directly to people I&apos;ve built things with — fintech engineers,
            founders, ops leads. Real phone numbers, real conversations, no
            scripts.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {[
            {
              role: 'Fintech engineering lead',
              context:
                'Worked alongside on production trading systems for 5 years. Available for technical reference calls.',
            },
            {
              role: 'Studio client (founder)',
              context:
                'Engaged Sage Ideas for a Ship + Operate combination. Willing to talk about scope, timeline, and outcome.',
            },
            {
              role: 'Open-source collaborator',
              context:
                'Co-shipped a developer-tooling project. Available to discuss code quality, communication, and reliability.',
            },
          ].map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl border border-[#27272A] bg-[#0F0F12] p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-[#06B6D4]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#06B6D4]">
                  Reference available
                </span>
              </div>
              <h3 className="font-semibold text-[#FAFAFA] mb-1.5">{r.role}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{r.context}</p>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-[#71717A] mt-8 max-w-3xl"
        >
          Reference contact details are shared with prospective clients during
          discovery, with both parties&apos; consent. As the client roster grows,
          quoted testimonials will replace this honest stub — not before.
        </motion.p>
      </section>

      {/* CTA */}
      <section className="bg-[#0F0F12] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-4 items-center"
          >
            <Button
              asChild
              variant="outline"
              className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent"
            >
              <Link href="/process">
                See our process
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold"
            >
              <Link href="/book">
                Book a call
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
