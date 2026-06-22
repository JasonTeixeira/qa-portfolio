'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { FileText, KeyRound, FlaskConical, Wallet, UserCheck } from 'lucide-react'
import {
  Section,
  Surface,
  MonoLabel,
  Hairline,
  Reveal,
  CtaLink,
  StatDisplay,
  RegistrationTicks,
} from '@/components/el'
import { FaqAccordion } from '@/components/el/services/FaqAccordion'
import { CheckoutButton } from '@/components/studio/checkout-button'
import type { ExtendedTier } from '@/data/services/extended'
import { flagshipVisuals } from '@/data/services/flagship-visuals'
import { AgentArchitectureDiagram } from '@/components/agents/agent-architecture-diagram'
import { AgentDashboardMockup } from '@/components/agents/agent-dashboard-mockup'
import { AgentCostEstimator } from '@/components/agents/agent-cost-estimator'
import { VoiceAgentAudioCue } from '@/components/agents/voice-agent-audio-cue'
import { FlagshipCompare } from '@/components/agents/flagship-compare'
import { AgentFlowDiagrams } from '@/components/diagrams'
import { RiskReversal } from '@/components/services/risk-reversal'
import { SampleDeliverable } from '@/components/services/sample-deliverable'
import {
  LivingDiagram,
  LivingHero,
  LivingPageShell,
  LivingCTA,
} from '@/components/living/LivingPageSystem'
import { EASE_OUT_QUINT } from '@/lib/motion/presets'

// ── Trust signals ──────────────────────────────────────────────────────────

const TRUST_SIGNALS = [
  {
    icon: KeyRound,
    label: 'BYOK',
    sub: 'Pay LLM providers direct — no markup on tokens',
  },
  {
    icon: FlaskConical,
    label: 'Eval harness',
    sub: 'Regressions caught in CI before they reach production',
  },
  {
    icon: Wallet,
    label: 'Spend cap',
    sub: 'Hard ceiling you set — no surprise OpenAI invoices',
  },
  {
    icon: UserCheck,
    label: 'Human-in-loop',
    sub: 'Approval queue on every action that touches money or customers',
  },
] as const

// ── Cadence + mode labels ──────────────────────────────────────────────────

const CADENCE_NOTE: Record<string, string> = {
  'one-time': 'One-time / fixed scope',
  monthly: 'Monthly retainer / cancel anytime',
  custom: 'Custom / scoped after discovery',
}

const MODE_NOTE: Record<string, string> = {
  audit: 'Audit engagement',
  sprint: 'Sprint engagement',
  build: 'Build engagement',
  operate: 'Operate retainer',
}

// ── Main component ─────────────────────────────────────────────────────────

export function FlagshipPageContent({ tier }: { tier: ExtendedTier }) {
  const visuals = flagshipVisuals[tier.slug]
  const stack = tier.stackChips ?? []
  const hasAddOns = tier.addOns && tier.addOns.length > 0
  const showMonthlySuffix = tier.cadence === 'monthly' && !tier.price.includes('/mo')

  return (
    <LivingPageShell>
      <LivingHero
        eyebrow={`Services / flagship / ${MODE_NOTE[tier.mode] ?? tier.mode}`}
        title={tier.name}
        lede={
          <>
            <span className="block font-semibold text-[var(--sage-accent-readable)]">
              {tier.tagline}
            </span>
            <span className="mt-4 block">{tier.description}</span>
          </>
        }
        panel={
          <LivingDiagram
            eyebrow="flagship graph"
            title={tier.name}
            nodes={[tier.shortName, 'Eval', 'Agent', 'Ops']}
            stats={[
              { label: 'price', value: tier.price },
              { label: 'timeline', value: tier.timeline },
              { label: 'mode', value: tier.mode },
            ]}
          />
        }
        proof={[
          { label: 'price', value: tier.price },
          { label: 'timeline', value: tier.timeline },
          { label: 'cadence', value: showMonthlySuffix ? `${tier.cadence}/mo` : tier.cadence },
          { label: 'scope', value: CADENCE_NOTE[tier.cadence] ?? tier.cadence },
        ]}
        actions={
          <>
              <CheckoutButton tier={tier} variant="primary" />
              <LivingCTA href={`/contact?engagement=${tier.slug}&mode=custom`} variant="secondary">
                Request custom scope
              </LivingCTA>
              <LivingCTA href="/services" variant="text">services index</LivingCTA>
          </>
        }
      />

      {stack.length > 0 && (
        <section className="border-b border-[var(--sage-border)] px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
            {stack.map((chip) => (
              <span
                key={chip}
                className="rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-1)] px-2.5 py-1 text-[11px] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]"
              >
                {chip}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Flagship comparison strip ──────────────────────────────────── */}
      <div className="border-t border-[var(--sage-border)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16">
          <Reveal>
            <MonoLabel tone="muted" as="div" className="mb-6">
              {'// compare the flagship suite'}
            </MonoLabel>
            <FlagshipCompare currentSlug={tier.slug} />
          </Reveal>
        </div>
      </div>

      {/* ── Story / positioning ────────────────────────────────────────── */}
      {visuals?.story && (
        <Section
          index="01"
          eyebrow="why this exists"
          ariaLabel="Positioning"
          heading={
            <>
              {visuals.story.headline.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="italic text-[#3D5AFE]">
                {visuals.story.headline.split(' ').slice(-2).join(' ')}
              </span>
            </>
          }
          lede={visuals.story.body}
          width="max-w-6xl"
          grain
        >
          {/* Trust signals grid */}
          <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_SIGNALS.map((signal) => {
              const Icon = signal.icon
              return (
                <div
                  key={signal.label}
                  className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-6 py-7"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className="h-4 w-4 shrink-0 text-[#3D5AFE]"
                      aria-hidden
                    />
                    <MonoLabel tone="ink" className="text-[11px]">
                      {signal.label}
                    </MonoLabel>
                  </div>
                  <p className="text-[13px] leading-[1.55] text-[var(--sage-ink-muted)]">
                    {signal.sub}
                  </p>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* ── Architecture diagram ───────────────────────────────────────── */}
      {visuals?.architecture && (
        <Section
          index="02"
          eyebrow="how it works"
          ariaLabel="Architecture"
          heading={
            <>
              The architecture,{' '}
              <span className="italic text-[#3D5AFE]">end to end.</span>
            </>
          }
          lede="No black boxes. Here's the actual shape of the system you get — with the guardrails, eval loops, and human approvals where they belong."
          width="max-w-6xl"
        >
          <Reveal>
            <Surface level={1} ticks className="overflow-hidden p-0">
              <AgentArchitectureDiagram
                title={visuals.architecture.title}
                subtitle={visuals.architecture.subtitle}
                nodes={visuals.architecture.nodes}
                connections={visuals.architecture.connections}
                accent="#3D5AFE"
              />
            </Surface>
          </Reveal>
        </Section>
      )}

      {/* ── Voice agent demo — slug-gated ─────────────────────────────── */}
      {tier.slug === 'ai-voice-agent' && (
        <Section
          index="03"
          eyebrow="listen in"
          ariaLabel="Voice demo"
          heading={
            <>
              A real call,{' '}
              <span className="italic text-[#3D5AFE]">scripted from a deployment.</span>
            </>
          }
          lede="No recording, no marketing voice-over. A line-by-line walk-through of how the agent handles a typical inbound — including the moment the caller asks if they're talking to AI."
          width="max-w-6xl"
        >
          <Reveal>
            <VoiceAgentAudioCue accent="#3D5AFE" />
          </Reveal>
        </Section>
      )}

      {/* ── Use cases grid ────────────────────────────────────────────── */}
      {visuals?.useCases && visuals.useCases.length > 0 && (
        <Section
          eyebrow="where this fits"
          ariaLabel="Use cases"
          heading={
            <>
              Real use cases{' '}
              <span className="italic text-[#3D5AFE]">we ship.</span>
            </>
          }
          width="max-w-6xl"
          grain
        >
          <ul className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2 lg:grid-cols-3">
            {visuals.useCases.map((uc, i) => (
              <motion.li
                key={uc.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, ease: EASE_OUT_QUINT, delay: i * 0.04 }}
                className="flex flex-col gap-3 bg-[var(--sage-surface-1)] px-6 py-7"
              >
                <MonoLabel tone="accent" className="tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </MonoLabel>
                <h3 className="text-[15px] font-medium text-[var(--sage-ink)] leading-snug">
                  {uc.title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-[var(--sage-ink-muted)]">
                  {uc.description}
                </p>
              </motion.li>
            ))}
          </ul>
        </Section>
      )}

      {/* ── Outcomes ledger ───────────────────────────────────────────── */}
      <Section
        index="04"
        eyebrow="what you walk away with"
        ariaLabel="Outcomes"
        heading={
          <>
            The outcome,{' '}
            <span className="italic text-[#3D5AFE]">not just the output.</span>
          </>
        }
        width="max-w-6xl"
      >
        <ul className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
          {tier.outcomes.map((o, i) => (
            <li
              key={o}
              className="flex items-start gap-4 bg-[var(--sage-surface-1)] px-6 py-7"
            >
              <MonoLabel tone="accent" className="mt-0.5 shrink-0 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </MonoLabel>
              <span className="text-[15px] leading-[1.65] text-[var(--sage-ink)]">{o}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Agent flow diagram ────────────────────────────────────────── */}
      {AgentFlowDiagrams[tier.slug] && (
        <Section
          eyebrow="agent flow"
          ariaLabel="Agent decision graph"
          heading={
            <>
              How the agent{' '}
              <span className="italic text-[#3D5AFE]">thinks.</span>
            </>
          }
          lede="The decision graph behind the engagement. Inputs, branches, and the point where a human stays in the loop."
          width="max-w-6xl"
          grain
        >
          <Reveal>
            <Surface level={1} ticks className="overflow-hidden p-6 sm:p-8">
              {(() => {
                const Flow = AgentFlowDiagrams[tier.slug]
                return Flow ? <Flow /> : null
              })()}
            </Surface>
          </Reveal>
        </Section>
      )}

      {/* ── Dashboard mockup ──────────────────────────────────────────── */}
      {visuals?.dashboard && (
        <Section
          eyebrow="your command center"
          ariaLabel="Dashboard"
          heading={
            <>
              The dashboard{' '}
              <span className="italic text-[#3D5AFE]">you actually use.</span>
            </>
          }
          lede="Every flagship engagement ships with a control panel — live activity, eval pass rate, spend cap, and an approval queue you can act on from your phone."
          width="max-w-6xl"
        >
          <Reveal>
            <AgentDashboardMockup
              title={visuals.dashboard.title}
              subtitle={visuals.dashboard.subtitle}
              kpis={visuals.dashboard.kpis}
              activity={visuals.dashboard.activity}
              liveTickerPool={visuals.dashboard.liveTickerPool}
              evalPct={visuals.dashboard.evalPct}
              spendUsed={visuals.dashboard.spendUsed}
              spendCap={visuals.dashboard.spendCap}
              pendingApprovals={visuals.dashboard.pendingApprovals}
              accent="#3D5AFE"
            />
          </Reveal>
        </Section>
      )}

      {/* ── Cost estimator ────────────────────────────────────────────── */}
      {visuals?.costEstimator && (
        <Section
          eyebrow="cost forecast"
          ariaLabel="Cost estimator"
          heading={
            <>
              Estimate your{' '}
              <span className="italic text-[#3D5AFE]">monthly run cost.</span>
            </>
          }
          width="max-w-6xl"
          grain
        >
          <Reveal>
            <AgentCostEstimator
              unitLabel={visuals.costEstimator.unitLabel}
              min={visuals.costEstimator.min}
              max={visuals.costEstimator.max}
              step={visuals.costEstimator.step}
              defaultValue={visuals.costEstimator.defaultValue}
              costPerUnit={visuals.costEstimator.costPerUnit}
              baseCost={visuals.costEstimator.baseCost}
              title={visuals.costEstimator.title}
              subtitle={visuals.costEstimator.subtitle}
              accent="#3D5AFE"
            />
          </Reveal>
        </Section>
      )}

      {/* ── Phases timeline ───────────────────────────────────────────── */}
      {tier.phases.length > 0 && (
        <Section
          index="05"
          eyebrow="methodology"
          ariaLabel="Engagement timeline"
          heading={
            <>
              How the engagement{' '}
              <span className="italic text-[#3D5AFE]">actually runs.</span>
            </>
          }
          lede="Concrete phases, concrete artifacts. You always know where we are and what comes next."
          width="max-w-6xl"
        >
          <ol className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)]">
            {tier.phases.map((phase, i) => (
              <li
                key={phase.title}
                className="flex flex-col gap-4 bg-[var(--sage-surface-1)] px-6 py-7 sm:flex-row sm:gap-8"
              >
                {/* Phase index + label column */}
                <div className="flex items-center gap-4 sm:w-52 sm:shrink-0">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] text-sm tabular-nums text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <MonoLabel tone="muted">{phase.label}</MonoLabel>
                </div>

                {/* Phase content */}
                <div className="flex-1">
                  <h3 className="text-base font-medium text-[var(--sage-ink)]">
                    {phase.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.65] text-[var(--sage-ink-muted)]">
                    {phase.description}
                  </p>
                  {phase.artifacts && phase.artifacts.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-[var(--sage-border)]">
                      {phase.artifacts.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-surface-2)] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                        >
                          <FileText className="h-3 w-3 shrink-0" aria-hidden />
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ── Result metrics ────────────────────────────────────────────── */}
      {tier.resultMetrics.length > 0 && (
        <Section
          eyebrow="track record"
          ariaLabel="Result metrics"
          heading="Receipts, not promises."
          width="max-w-6xl"
          grain
        >
          <StatDisplay
            stats={tier.resultMetrics.map((m) => ({
              value: m.value,
              label: m.context ? `${m.label} · ${m.context}` : m.label,
            }))}
          />
        </Section>
      )}

      {/* ── Deliverables + Not included ───────────────────────────────── */}
      <Section
        index="06"
        eyebrow="scope"
        ariaLabel="Deliverables and scope"
        heading={
          <>
            Concrete artifacts you keep —{' '}
            <span className="italic text-[#3D5AFE]">and what we leave out.</span>
          </>
        }
        lede="Working code, written docs, dashboards your team owns. We also list what this engagement deliberately does not cover, so scope is honest before you sign."
        width="max-w-6xl"
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          {/* Deliverables */}
          <Surface level={2} ticks className="p-7 sm:p-8">
            <MonoLabel tone="muted" as="div">
              {'// deliverables'}
            </MonoLabel>
            <ul className="mt-5 space-y-4">
              {tier.deliverables.map((d) => (
                <li key={d} className="flex gap-3.5">
                  <span
                    aria-hidden
                    className="mt-[9px] h-px w-4 shrink-0 bg-[#3D5AFE]"
                  />
                  <span className="text-[14px] leading-[1.65] text-[var(--sage-ink)]">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </Surface>

          {/* Not included */}
          {tier.notIncluded.length > 0 && (
            <Surface level={1} className="p-7 sm:p-8">
              <MonoLabel tone="muted" as="div">
                {'// not included'}
              </MonoLabel>
              <ul className="mt-5 space-y-3">
                {tier.notIncluded.map((n) => (
                  <li
                    key={n}
                    className="flex gap-3.5 text-[13px] leading-[1.55] text-[var(--sage-ink-muted)]"
                  >
                    <span
                      aria-hidden
                      className="mt-[8px] h-px w-3 shrink-0 bg-[var(--sage-border-hover)]"
                    />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Surface>
          )}
        </div>
      </Section>

      {/* ── Add-ons ───────────────────────────────────────────────────── */}
      {hasAddOns && (
        <Section
          eyebrow="add-ons"
          ariaLabel="Extend the engagement"
          heading={
            <>
              Extend the{' '}
              <span className="italic text-[#3D5AFE]">engagement.</span>
            </>
          }
          width="max-w-6xl"
          grain
        >
          <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
            {tier.addOns!.map((addon, i) => (
              <Reveal key={addon.name} delay={i * 0.05} className="contents">
                <div className="flex flex-col gap-2.5 bg-[var(--sage-surface-1)] px-6 py-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-[15px] font-medium text-[var(--sage-ink)] leading-snug">
                      {addon.name}
                    </h3>
                    <MonoLabel tone="accent" className="shrink-0 text-[11px]">
                      {addon.price}
                    </MonoLabel>
                  </div>
                  <p className="text-[13px] leading-[1.55] text-[var(--sage-ink-muted)]">
                    {addon.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* ── Sample deliverables ───────────────────────────────────────── */}
      <div className="border-t border-[var(--sage-border)]">
        <SampleDeliverable />
      </div>

      {/* ── Risk reversal ─────────────────────────────────────────────── */}
      <div className="border-t border-[var(--sage-border)]">
        <RiskReversal />
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      {tier.faq.length > 0 && (
        <Section
          index="07"
          eyebrow="questions"
          ariaLabel="Frequently asked questions"
          heading="Honest answers."
          width="max-w-4xl"
        >
          <FaqAccordion items={tier.faq} />
        </Section>
      )}

      {/* ── Close ─────────────────────────────────────────────────────── */}
      <section
        aria-label={`Start ${tier.shortName}`}
        className="relative isolate overflow-hidden border-t border-[var(--sage-border)] py-24 sm:py-32 sage-grain"
      >
        {/* Ruled-grid accent layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(var(--sage-border) 1px, transparent 1px), linear-gradient(90deg, var(--sage-border) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Corner ticks — precision framing */}
        <div aria-hidden className="pointer-events-none absolute inset-6 sm:inset-10">
          <RegistrationTicks size={16} color="rgba(61,90,254,0.3)" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-8 text-center">
          <Reveal>
            {/* Eyebrow */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <Hairline className="hidden w-12 sm:block" />
              <MonoLabel tone="muted">{'// engage'}</MonoLabel>
              <Hairline className="hidden w-12 sm:block" />
            </div>

            <h2
              className="text-[var(--sage-ink)] font-normal text-[clamp(2rem,_1rem_+_3.5vw,_3.5rem)]"
              style={{
                fontFamily: 'var(--font-serif)',
                fontVariationSettings: "'opsz' 144, 'SOFT' 0, 'WONK' 0",
                letterSpacing: '-0.024em',
                lineHeight: 1.02,
              }}
            >
              Ready to scope{' '}
              <span className="italic text-[#3D5AFE]">{tier.shortName}?</span>
            </h2>

            <p className="mx-auto mt-5 max-w-[52ch] text-[15px] leading-[1.75] text-[var(--sage-ink-muted)] sm:text-base">
              Book a 30-minute discovery call. No pitch deck. We&apos;ll either confirm fit
              and send a proposal, or tell you straight that this isn&apos;t the right move.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <CheckoutButton tier={tier} variant="primary" />
              <CtaLink
                variant="ghost"
                href={`/contact?engagement=${tier.slug}&mode=custom`}
              >
                Request custom pricing
              </CtaLink>
              <CtaLink variant="text" href="/services">
                ls services/
              </CtaLink>
            </div>
          </Reveal>
        </div>
      </section>

    </LivingPageShell>
  )
}
