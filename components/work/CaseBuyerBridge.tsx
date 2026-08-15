import Link from 'next/link'
import type { CaseStudy } from '@/data/work/case-studies'

type BuyerBridge = {
  before: string
  system: string
  result: string
  buyer: string
}

const BRIDGES: Record<string, BuyerBridge> = {
  nexural: {
    before: 'A complex fintech product needed trading, data, billing, AI support, and operational controls to work together without a large team.',
    system: 'A full-stack trading platform with a relational data core, realtime surfaces, API layer, Discord AI, Stripe, and regression gates.',
    result: 'The evidence is concrete: 185 tables, 69 endpoints, 61 test suites, and zero billing incidents since launch.',
    buyer: 'If your product has many moving parts, this shows how Sage Ideas makes the operating layer visible before scale breaks it.',
  },
  alphastream: {
    before: 'A signal engine is useless if the user cannot see why a prediction fired or whether the workflow can be trusted.',
    system: 'A Python ML engine with 200+ indicators, five models, explainability, backtesting, and public repository proof.',
    result: 'The system turns model output into inspectable reasoning, so technical buyers can evaluate the signal instead of guessing.',
    buyer: 'Use this as proof for analytics, AI, and data-heavy builds where trust depends on visibility.',
  },
  jobpoise: {
    before: 'Job-search AI often invents, overgeneralizes, or generates content disconnected from the user’s actual proof.',
    system: 'A citation-grounded job copilot with Chrome extension workflow, Gmail tracking, Stripe tiers, and structured application support.',
    result: 'The product proves AI can support a serious workflow without fabricating experience or losing the human trail.',
    buyer: 'Use this as proof for AI products that need guardrails, workflow fit, and a payment-ready surface.',
  },
  trayd: {
    before: 'Trades teams lose revenue when quote requests, missed calls, urgency, and scheduling live in separate places.',
    system: 'A bilingual lead and quote workflow that captures intent, qualifies jobs, routes urgency, and hands off to the operator.',
    result: 'The team can see who to call, why now, and what the job may be worth before the opportunity cools.',
    buyer: 'Use this as proof for local service businesses that need quote qualification and faster follow-up.',
  },
  'aws-landing-zone': {
    before: 'Cloud environments become fragile when accounts, permissions, networks, and deployment rules grow without a foundation.',
    system: 'A landing-zone pattern that makes environments, identity, network boundaries, and release constraints visible.',
    result: 'The operating foundation reduces surprise and gives teams a safer path to scale.',
    buyer: 'Use this as proof for infrastructure-heavy businesses that need order before growth multiplies the mess.',
  },
  'quality-telemetry': {
    before: 'Quality signals lose force when test runs, performance, accessibility, and release health live in separate tools.',
    system: 'A telemetry board that collects quality evidence into one visible release-readiness surface.',
    result: 'The team can see what is slipping before customers or stakeholders discover the regression.',
    buyer: 'Use this as proof for software teams that need confidence before shipping.',
  },
  'brand-sprint-rebuild': {
    before: 'A business can have a polished site that still fails because the offer, proof, and buyer path are unclear.',
    system: 'A brand and conversion sprint that reconnects positioning, proof assets, page structure, and action paths.',
    result: 'The buyer stops guessing what the business does and starts seeing the version they want to hire.',
    buyer: 'Use this as proof for service businesses that need the website to sell the offer faster.',
  },
  'site-care-retainer': {
    before: 'A launch is not enough when content, updates, errors, conversion checks, and site health decay quietly.',
    system: 'A care rhythm for ongoing fixes, content, measurement, updates, and issue routing.',
    result: 'The site keeps improving after launch instead of becoming a static artifact.',
    buyer: 'Use this as proof for businesses that need their site operated, not abandoned.',
  },
}

function bridgeFor(study: CaseStudy): BuyerBridge {
  return (
    BRIDGES[study.slug] ?? {
      before: study.problem[0] ?? study.tagline,
      system: study.approach[0] ?? study.tagline,
      result: study.outcome[0] ?? study.kicker,
      buyer: study.tagline,
    }
  )
}

export function CaseBuyerBridge({ study }: { study: CaseStudy }) {
  const bridge = bridgeFor(study)
  const metrics = study.metrics.slice(0, 3)

  return (
    <section className="border-t border-[var(--sage-border)]" aria-label="Buyer proof bridge">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.035] p-1.5 shadow-[0_0_90px_rgba(61,90,254,0.12)]">
          <div className="rounded-[calc(2.25rem-0.375rem)] border border-white/[0.07] bg-[#07080d]/95 p-5 sm:p-7 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#bcd2ff]">Buyer read</p>
                <h2
                  className="mt-5 max-w-[9ch] text-5xl font-normal leading-[0.92] tracking-[-0.045em] text-[var(--sage-ink)] sm:text-6xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  What changed here?
                </h2>
                <p className="mt-6 max-w-[46ch] text-base leading-7 text-[var(--sage-ink-muted)]">{bridge.buyer}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href={`/book?source=work_${study.slug}`}
                    className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-full bg-[#f4f7ff] px-5 py-2.5 text-sm font-semibold text-[#05070d] shadow-[0_0_42px_rgba(61,90,254,0.24)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98]"
                  >
                    <span>Map my version</span>
                    <span className="grid size-8 place-items-center rounded-full bg-black/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/showcase"
                    className="group inline-flex min-h-12 items-center justify-between gap-3 rounded-full border border-white/12 bg-white/[0.035] px-5 py-2.5 text-sm font-semibold text-[var(--sage-ink)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/22 hover:bg-white/[0.06] active:scale-[0.98]"
                  >
                    <span>Open demos</span>
                    <span aria-hidden className="transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ['Before', bridge.before],
                    ['System', bridge.system],
                    ['Result', bridge.result],
                  ].map(([label, body]) => (
                    <div key={label} className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#bcd2ff]">{label}</p>
                      <p className="mt-4 text-sm leading-6 text-[var(--sage-ink-muted)]">{body}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-[#8da5ff]/16 bg-[#3D5AFE]/10 p-4">
                      <p className="text-3xl font-semibold tracking-[-0.04em] text-[#6ea0ff]">{metric.value}</p>
                      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#bcd2ff]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
