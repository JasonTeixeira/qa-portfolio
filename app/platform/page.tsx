'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GitBranch, Server, TestTube2, Gauge, Shield, Wrench,
  AlertTriangle, Activity, Lock, FileCheck, ArrowRight,
  Target, Siren, Clock, DollarSign, Eye, BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/section-label'
import { GlowCard } from '@/components/glow-card'

const pillars = [
  {
    icon: GitBranch,
    title: 'CI/CD Automation Gates',
    description: 'Multi-layer pipelines: lint → typecheck → unit → integration → E2E. Fast feedback via parallelization and smart retries (flake-aware). Every merge is gated.',
    details: ['Parallel test execution', 'Flake-aware retry logic', 'Artifact publishing', 'Automated rollback'],
  },
  {
    icon: Server,
    title: 'Infrastructure as Code',
    description: 'Terraform modules with least-privilege IAM. GitHub OIDC federation — no long-lived keys. Cost-aware defaults and environment promotion gates.',
    details: ['Terraform + HCL', 'GitHub OIDC (no static keys)', 'Multi-environment promotion', 'Cost guardrails'],
  },
  {
    icon: TestTube2,
    title: 'Test Observability',
    description: 'Pass-rate and flake-rate trend tracking across repos. Quarantine workflow for flaky tests. Telemetry-first mindset — if you can\'t measure it, you can\'t improve it.',
    details: ['Flake rate tracking', 'Test quarantine workflow', 'Coverage trend analysis', 'Quality telemetry dashboard'],
  },
  {
    icon: Gauge,
    title: 'Performance Budgets',
    description: 'Lighthouse CI budgets enforced in pipeline. P95/P99 thinking: define acceptable latency thresholds and enforce them before every deploy.',
    details: ['Lighthouse CI integration', 'P95/P99 latency budgets', 'Bundle size monitoring', 'Core Web Vitals tracking'],
  },
  {
    icon: Shield,
    title: 'Security Automation',
    description: 'OWASP-style scanning, dependency hygiene, secrets detection. Secure-by-default pipelines that fail on critical findings — not optional manual reviews.',
    details: ['OWASP dependency scanning', 'Secrets detection (pre-commit)', 'WAF + rate limiting', 'Least-privilege IAM'],
  },
  {
    icon: Wrench,
    title: 'Operations & Maintainability',
    description: 'Runbooks, checklists, clear ownership. Environment drift management. Design for maintainability — the next person should be able to operate it.',
    details: ['Runbooks for every system', 'Incident triage playbooks', 'Environment drift detection', 'Documented architecture decisions'],
  },
]

const sloTargets = [
  {
    icon: Activity,
    metric: 'Dashboard Availability',
    target: '99.9%',
    window: 'Monthly',
    measurement: 'Synthetic HTTP checks + uptime monitoring',
  },
  {
    icon: Clock,
    metric: 'Telemetry Freshness',
    target: '< 24h',
    window: 'Rolling',
    measurement: 'Time since last metrics update',
  },
  {
    icon: Target,
    metric: 'AWS Proxy Reliability',
    target: '99.9%',
    window: 'Monthly',
    measurement: 'Lambda errors + API Gateway 4xx/5xx rates',
  },
  {
    icon: Gauge,
    metric: 'P95 Response Time',
    target: '< 500ms',
    window: 'Rolling',
    measurement: 'API Gateway + Lambda duration percentiles',
  },
]

const securityReceipts = [
  {
    icon: Shield,
    title: 'WAF + Rate Limiting',
    description: 'CloudFront-scope Web ACL with rate-based rules. API Gateway stage throttling. Attack simulation script proves the controls work.',
    evidence: 'Evidence: waf-rate-limit.txt, attack simulation script, Terraform CloudFront+WAF module',
  },
  {
    icon: Lock,
    title: 'IAM Least Privilege',
    description: 'Lambda has only s3:GetObject for a single key. DynamoDB operations limited to specific table and actions. No wildcard policies.',
    evidence: 'Evidence: IAM policy JSON, GitHub OIDC trust policy',
  },
  {
    icon: FileCheck,
    title: 'Token Strategy',
    description: 'x-metrics-token shared secret for API auth. No long-lived AWS keys anywhere — GitHub OIDC federation for all CI/CD to AWS interactions.',
    evidence: 'Evidence: OIDC trust policy, token validation middleware',
  },
  {
    icon: Eye,
    title: 'Threat Model',
    description: 'Documented abuse cases with mitigations: API scraping (token + rate limit), secrets exposure (server-only), untrusted artifact input (schema-validated), blast radius containment.',
    evidence: 'Pattern: least privilege + untrusted input handling + safe degradation',
  },
]

const incidentDrills = [
  { scenario: 'GitHub API rate limits exceeded', response: 'Fall back to Snapshot mode (committed metrics.json)', status: 'Tested' },
  { scenario: 'Missing CI artifact', response: 'Scan back through recent runs, degrade to Snapshot', status: 'Tested' },
  { scenario: 'AWS proxy token mismatch', response: 'CloudWatch alarm fires, auto-degrade to Snapshot', status: 'Tested' },
  { scenario: 'S3 object missing', response: 'Fail closed (no secrets leak), degrade gracefully', status: 'Tested' },
]

export default function PlatformPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel>Platform Engineering</SectionLabel>
          <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAFAFA]">
            I Build and Operate Automation Systems
          </h1>
          <p className="mt-6 text-lg text-[#A1A1AA] max-w-3xl">
            {"My focus is not just \"writing tests\" — it's building automation platforms that scale with engineering teams. That includes cloud infrastructure (IaC), CI/CD pipelines, telemetry/observability, performance budgets, security gates, and the QA automation layer that proves it works."}
          </p>
          <p className="mt-4 text-sm text-[#71717A] max-w-2xl">
            I prefer building systems that are easy to operate: clear ownership, clear runbooks, and metrics that make quality measurable.
          </p>
        </motion.div>
      </section>

      {/* 6 Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <SectionLabel>Capabilities</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">Six Pillars</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <GlowCard className="h-full p-6">
                <pillar.icon className="h-8 w-8 text-[#06B6D4] mb-4" />
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-3">{pillar.title}</h3>
                <p className="text-sm text-[#A1A1AA] mb-4">{pillar.description}</p>
                <ul className="space-y-1.5">
                  {pillar.details.map(detail => (
                    <li key={detail} className="flex items-center gap-2 text-xs text-[#71717A]">
                      <span className="w-1 h-1 bg-[#06B6D4] rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reference Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionLabel>Architecture</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-8">Reference Pipeline</h2>

          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 sm:p-8 overflow-x-auto">
            <pre className="font-mono text-sm text-[#A1A1AA] leading-relaxed whitespace-pre">
              <span className="text-[#FAFAFA] font-semibold">PR / Commit</span>{'\n'}
              {'  └─► '}<span className="text-[#06B6D4]">CI Pipeline</span>{' (lint / typecheck / unit)\n'}
              {'        └─► '}<span className="text-[#06B6D4]">Integration tests</span>{' (DB / services)\n'}
              {'              └─► '}<span className="text-[#06B6D4]">E2E + a11y + visual</span>{'\n'}
              {'                    └─► '}<span className="text-[#8B5CF6]">Perf budgets</span>{' (Lighthouse / load)\n'}
              {'                          └─► '}<span className="text-[#EF4444]">Security gates</span>{' (deps / secrets / ZAP)\n'}
              {'                                └─► '}<span className="text-[#F59E0B]">Publish artifacts</span>{' (reports / screenshots)\n'}
              {'                                      └─► '}<span className="text-[#10B981]">Telemetry snapshot + dashboard</span>{'\n'}
              {'                                            └─► '}<span className="text-[#10B981]">Alerts / triage playbooks</span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* SLOs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <SectionLabel color="violet">Reliability</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">SLOs & Operational Targets</h2>
          <p className="mt-4 text-[#A1A1AA] max-w-2xl">
            This portfolio is intentionally operated like a production system. These are the same
            signals senior cloud/platform teams look for: SLOs, SLIs, error budgets, and a
            repeatable incident drill loop.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sloTargets.map((slo, index) => (
            <motion.div
              key={slo.metric}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="p-5 bg-[#18181B] border border-[#27272A] rounded-2xl"
            >
              <slo.icon className="h-6 w-6 text-[#8B5CF6] mb-3" />
              <p className="text-2xl font-bold text-[#FAFAFA] mb-1">{slo.target}</p>
              <p className="text-sm font-medium text-[#A1A1AA] mb-2">{slo.metric}</p>
              <p className="text-xs text-[#71717A]">{slo.measurement}</p>
              <span className="inline-block mt-2 text-[10px] font-mono text-[#71717A] bg-[#27272A] px-2 py-0.5 rounded">
                {slo.window}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-6 text-xs text-[#71717A] italic"
        >
          Pattern: measure → alert → drill → postmortem → fix. High-comp cloud roles are hired to hit SLOs under cost and security constraints.
        </motion.p>
      </section>

      {/* Security Receipts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <SectionLabel color="violet">Security</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">
            Receipts, Not Buzzwords
          </h2>
          <p className="mt-4 text-[#A1A1AA] max-w-2xl">
            Every security claim has evidence behind it. WAF configs, IAM policies, attack simulations,
            and threat models — designed for cloud/infrastructure reviewers and senior engineers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {securityReceipts.map((receipt, index) => (
            <motion.div
              key={receipt.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl"
            >
              <div className="flex items-start gap-3 mb-3">
                <receipt.icon className="h-5 w-5 text-[#EF4444] mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-[#FAFAFA]">{receipt.title}</h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">{receipt.description}</p>
                </div>
              </div>
              <p className="text-xs text-[#71717A] pl-8 italic">{receipt.evidence}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Incident Drills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <SectionLabel>Operations</SectionLabel>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-[#FAFAFA]">Incident Drills</h2>
          <p className="mt-4 text-[#A1A1AA] max-w-2xl">
            Every failure mode has been tested. These aren&apos;t theoretical — each drill was executed
            and the response validated.
          </p>
        </motion.div>

        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-[#27272A] text-xs font-mono text-[#71717A] uppercase tracking-wider">
            <span>Scenario</span>
            <span>Response</span>
            <span>Status</span>
          </div>
          {incidentDrills.map((drill, index) => (
            <motion.div
              key={drill.scenario}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-3 gap-4 p-4 border-b border-[#27272A] last:border-0"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B] mt-0.5 shrink-0" />
                <span className="text-sm text-[#FAFAFA]">{drill.scenario}</span>
              </div>
              <span className="text-sm text-[#A1A1AA]">{drill.response}</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981]">
                <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                {drill.status}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 bg-[#18181B] border border-[#27272A] rounded-2xl text-center"
        >
          <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">See It Running</h3>
          <p className="text-[#A1A1AA] mb-6">Check the live dashboard or download the operational artifacts.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#06B6D4] text-[#09090B] hover:bg-[#22D3EE] font-semibold">
              <Link href="/dashboard">
                Live Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#06B6D4] hover:text-[#06B6D4] bg-transparent">
              <Link href="/artifacts">Artifacts & Evidence</Link>
            </Button>
            <Button asChild variant="outline" className="border-[#3F3F46] text-[#A1A1AA] hover:border-[#8B5CF6] hover:text-[#8B5CF6] bg-transparent">
              <Link href="/contact">Hire Me</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
