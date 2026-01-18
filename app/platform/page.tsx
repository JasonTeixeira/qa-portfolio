import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Gauge, Workflow, Radar, Wrench, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Automation Platform Engineering | Jason Teixeira',
  description:
    'How I design, build, and operate automation systems in the cloud: CI/CD pipelines, infrastructure-as-code, telemetry, performance budgets, and security gates.',
};

export default function PlatformPage() {
  const pillars = [
    {
      title: 'CI/CD Automation Gates',
      icon: Workflow,
      points: [
        'Multi-layer pipelines: lint → typecheck → unit → integration → E2E',
        'Fast feedback via parallelization and smart retries (flake-aware)',
        'Reports published as artifacts for auditability',
      ],
    },
    {
      title: 'Infrastructure as Code (IaC)',
      icon: Wrench,
      points: [
        'Terraform modules for repeatable cloud infrastructure (S3, IAM, lifecycle retention)',
        'Least-privilege access with GitHub OIDC (no long-lived keys)',
        'Cost-aware defaults: retention windows + minimal always-on services',
      ],
    },
    {
      title: 'Test Observability',
      icon: Radar,
      points: [
        'Pass-rate and flake-rate trend tracking over time',
        'Quarantine workflow for flaky tests + root-cause playbooks',
        'Telemetry-first mindset: measure, then optimize',
      ],
    },
    {
      title: 'Performance Budgets',
      icon: Gauge,
      points: [
        'Lighthouse CI budgets and regression detection',
        'P95/P99 thinking: define acceptable latency and enforce it',
        'Synthetic monitoring style checks after deploy',
      ],
    },
    {
      title: 'Security Automation',
      icon: ShieldCheck,
      points: [
        'OWASP-style scanning + dependency hygiene + secrets detection',
        'Secure-by-default pipelines (fail on critical findings)',
        'Defense-in-depth: auth, rate limiting, input validation, logging',
      ],
    },
    {
      title: 'Operations & Maintainability',
      icon: Wrench,
      points: [
        'Runbooks, checklists, and clear ownership boundaries (operational readiness)',
        'Environment drift management + reliability fixes + repeatable workflows',
        'Design for maintainability: conventions, docs, onboarding, and safe defaults',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <p className="text-primary font-mono mb-3">Automation Platform Engineering</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              I build and operate automation systems in the cloud.
            </h1>
            <p className="text-gray-300 mt-5 max-w-3xl">
              My focus is not just “writing tests”—it’s building automation platforms that scale with engineering teams.
              That includes cloud infrastructure (IaC), CI/CD pipelines, telemetry/observability, performance budgets, security gates, and the QA automation layer that proves it works.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                View Quality Dashboard
              </Link>
              <Link
                href="/platform/quality-telemetry"
                className="px-6 py-3 border border-dark-lighter bg-dark-card text-foreground font-semibold rounded-lg hover:border-primary/60 transition-colors"
              >
                System design: Telemetry <ArrowRight size={16} className="inline-block ml-2" />
              </Link>
              <Link
                href="/platform/ops-reliability"
                className="px-6 py-3 border border-dark-lighter bg-dark-card text-foreground font-semibold rounded-lg hover:border-primary/60 transition-colors"
              >
                Ops: SLOs & Incident Drills <ArrowRight size={16} className="inline-block ml-2" />
              </Link>
              <Link
                href="/projects"
                className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-dark transition-colors"
              >
                Explore Case Studies
              </Link>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Reference Architecture</h2>
            <p className="text-gray-300 text-sm mb-4">
              A pragmatic reference model for how I design quality platforms that are measurable and maintainable.
            </p>

            <div className="overflow-x-auto">
              <pre className="bg-dark-lighter border border-dark-lighter rounded-lg p-5 text-gray-200 text-sm leading-relaxed">
{`PR / Commit
  └─► CI Pipeline (lint/typecheck/unit)
        └─► Integration tests (DB/services)
              └─► E2E + a11y + visual
                    └─► Perf budgets (Lighthouse / load)
                          └─► Security gates (deps/secrets/ZAP)
                                └─► Publish artifacts (reports/screenshots)
                                      └─► Telemetry snapshot + dashboard
                                            └─► Alerts / triage playbooks`}
              </pre>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="bg-dark-card border border-dark-lighter rounded-xl p-6 hover:border-primary transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="text-primary" size={20} />
                    <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
                  </div>
                  <ul className="space-y-2 text-gray-300 text-sm list-disc ml-5">
                    {p.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-br from-dark-card to-dark-card/50 border border-primary/20 rounded-xl">
            <h2 className="text-2xl font-bold text-foreground mb-3">How I work</h2>
            <p className="text-gray-300 max-w-3xl">
              I’m opinionated about clean interfaces, predictable pipelines, and fast feedback loops.
              I prefer building systems that are easy to operate: clear ownership, clear runbooks, and metrics that make quality measurable.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link href="/artifacts" className="text-primary hover:text-primary-dark font-semibold">
                View playbooks & templates →
              </Link>
              <Link href="/contact" className="text-primary hover:text-primary-dark font-semibold">
                Contact me →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
