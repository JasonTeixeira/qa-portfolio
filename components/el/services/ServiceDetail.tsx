'use client'

import * as React from 'react'
import {
  Section,
  Surface,
  MonoLabel,
  Reveal,
  CtaLink,
} from '@/components/el'
import { CheckoutButton } from '@/components/studio/checkout-button'
import type { Tier } from '@/data/services/tiers'
import type { ExtendedTier } from '@/data/services/extended'
import { isSelfServe } from '@/data/services/tier-classification'
import { FaqAccordion } from './FaqAccordion'
import {
  LivingDiagram,
  LivingHero,
  LivingPageShell,
  LivingCTA,
} from '@/components/living/LivingPageSystem'
import { DeepSystemDiagram } from '@/components/living/DeepSystemDiagram'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'

const CADENCE_NOTE: Record<Tier['cadence'], string> = {
  'one-time': 'One-time / fixed scope',
  monthly: 'Monthly retainer / cancel anytime',
  custom: 'Custom / scoped after discovery',
}

type ServiceDiagramSpec = {
  eyebrow: string
  title: string
  lede: string
  description: string
  nodes: Array<{ label: string; detail?: string }>
  stats: Array<{ label: string; value: string }>
}

const BESPOKE_SERVICE_DIAGRAMS: Record<string, ServiceDiagramSpec> = {
  'studio-package': {
    eyebrow: 'studio operating system',
    title: 'Full-stack studio engine',
    lede:
      'The Studio Package is the highest-leverage path: offer, product surface, AI system, growth loop, and operating cadence built as one system.',
    description:
      'This is scoped as an integrated business system, not a stack of disconnected agency deliverables. Strategy becomes product architecture, the product becomes proof, and the proof feeds content, SEO, and sales routing.',
    nodes: [
      { label: 'Offer', detail: 'positioning' },
      { label: 'Product', detail: 'surface' },
      { label: 'AI', detail: 'workflows' },
      { label: 'Growth', detail: 'content' },
      { label: 'Ops', detail: 'handoff' },
    ],
    stats: [
      { label: 'mode', value: 'end-to-end' },
      { label: 'motion', value: 'surface ⇄ system' },
      { label: 'handoff', value: 'operator-ready' },
    ],
  },
  'bespoke-build': {
    eyebrow: 'bespoke build architecture',
    title: 'Custom product system',
    lede:
      'Bespoke Build is for high-complexity work where the real value is deciding the right architecture before production code starts.',
    description:
      'The engagement moves from discovery and constraints into architecture, implementation, instrumentation, and operational handoff so the product can survive beyond launch week.',
    nodes: [
      { label: 'Discover', detail: 'constraints' },
      { label: 'Model', detail: 'data' },
      { label: 'Build', detail: 'product' },
      { label: 'Wire', detail: 'systems' },
      { label: 'Run', detail: 'ops' },
    ],
    stats: [
      { label: 'scope', value: 'custom' },
      { label: 'risk', value: 'mapped first' },
      { label: 'handoff', value: 'documented' },
    ],
  },
  build: {
    eyebrow: 'build engagement map',
    title: 'Launchable product path',
    lede:
      'Build turns a validated need into a working app, SaaS surface, or internal system with the core product mechanics in place.',
    description:
      'The path keeps decisions visible: scope, interface, data, integrations, billing or workflow logic, and a launch handoff that makes the result usable.',
    nodes: [
      { label: 'Scope', detail: 'MVP' },
      { label: 'UI', detail: 'product' },
      { label: 'Data', detail: 'model' },
      { label: 'Integrate', detail: 'APIs' },
      { label: 'Launch', detail: 'handoff' },
    ],
    stats: [
      { label: 'surface', value: 'app/SaaS' },
      { label: 'stack', value: 'production' },
      { label: 'handoff', value: 'usable' },
    ],
  },
  'app-development': {
    eyebrow: 'application system',
    title: 'App build pipeline',
    lede:
      'App Development needs more than screens. It needs auth, data, workflows, integration paths, QA, and a clear deployment loop.',
    description:
      'This diagram shows the application as a product system: a user-facing surface backed by state, business rules, integrations, analytics, and supportable release mechanics.',
    nodes: [
      { label: 'Spec', detail: 'flows' },
      { label: 'Surface', detail: 'UI' },
      { label: 'State', detail: 'data' },
      { label: 'Connect', detail: 'APIs' },
      { label: 'Ship', detail: 'release' },
    ],
    stats: [
      { label: 'surface', value: 'web app' },
      { label: 'quality', value: 'tested' },
      { label: 'release', value: 'deployable' },
    ],
  },
  'rag-engineering': {
    eyebrow: 'retrieval system',
    title: 'RAG reliability loop',
    lede:
      'RAG work is only valuable when the answers can be trusted, evaluated, and improved as the underlying knowledge changes.',
    description:
      'The system starts with source discipline, then chunking, retrieval, answer composition, evaluation, and iteration. The diagram stays honest about where failures usually happen.',
    nodes: [
      { label: 'Sources', detail: 'truth' },
      { label: 'Chunk', detail: 'context' },
      { label: 'Retrieve', detail: 'rank' },
      { label: 'Answer', detail: 'guarded' },
      { label: 'Eval', detail: 'score' },
    ],
    stats: [
      { label: 'failure mode', value: 'measured' },
      { label: 'outputs', value: 'cited' },
      { label: 'ops', value: 'retrain loop' },
    ],
  },
  'internal-ai-copilot': {
    eyebrow: 'copilot system',
    title: 'Internal copilot loop',
    lede:
      'An internal copilot has to fit the way the team actually works: knowledge, permissions, tools, adoption, and measurement.',
    description:
      'This path keeps the assistant inside useful boundaries. It maps source material, allowed actions, user workflows, escalation points, and adoption telemetry before the copilot is treated as production.',
    nodes: [
      { label: 'SOPs', detail: 'source' },
      { label: 'Roles', detail: 'access' },
      { label: 'Agent', detail: 'tools' },
      { label: 'Use', detail: 'adopt' },
      { label: 'Measure', detail: 'impact' },
    ],
    stats: [
      { label: 'boundary', value: 'role-aware' },
      { label: 'tools', value: 'approved' },
      { label: 'adoption', value: 'tracked' },
    ],
  },
  'support-deflection': {
    eyebrow: 'support automation',
    title: 'Support deflection system',
    lede:
      'Support deflection works when the AI answers routine questions, escalates edge cases, and teaches the business what customers keep asking.',
    description:
      'The system routes tickets through knowledge, intent detection, answer confidence, escalation, and insight capture. The goal is fewer repetitive tickets without hiding real customer problems.',
    nodes: [
      { label: 'Ticket', detail: 'intent' },
      { label: 'Know', detail: 'KB' },
      { label: 'Answer', detail: 'confidence' },
      { label: 'Escalate', detail: 'human' },
      { label: 'Learn', detail: 'insight' },
    ],
    stats: [
      { label: 'risk', value: 'escalated' },
      { label: 'source', value: 'owned KB' },
      { label: 'feedback', value: 'closed loop' },
    ],
  },
  'ai-onboarding-concierge': {
    eyebrow: 'activation system',
    title: 'AI onboarding concierge',
    lede:
      'Onboarding AI should reduce confusion at the exact moment a user is trying to activate, not become another chatbot parked in the corner.',
    description:
      'The concierge maps onboarding friction, user intent, product education, guided next actions, and activation analytics so the system can improve instead of guessing.',
    nodes: [
      { label: 'Intent', detail: 'user' },
      { label: 'Guide', detail: 'steps' },
      { label: 'Teach', detail: 'context' },
      { label: 'Activate', detail: 'moment' },
      { label: 'Track', detail: 'signal' },
    ],
    stats: [
      { label: 'goal', value: 'activation' },
      { label: 'tone', value: 'guided' },
      { label: 'feedback', value: 'instrumented' },
    ],
  },
  'agent-ops': {
    eyebrow: 'agent operations',
    title: 'Agent operations loop',
    lede:
      'Agent work needs monitoring, evals, escalation paths, and maintenance. Otherwise the demo becomes an operational liability.',
    description:
      'This diagram treats agents like production systems: tool permissions, live traces, regression evals, drift checks, incident review, and a clear patch loop.',
    nodes: [
      { label: 'Trace', detail: 'runs' },
      { label: 'Eval', detail: 'quality' },
      { label: 'Guard', detail: 'risk' },
      { label: 'Patch', detail: 'fix' },
      { label: 'Report', detail: 'ops' },
    ],
    stats: [
      { label: 'mode', value: 'operate' },
      { label: 'quality', value: 'eval-gated' },
      { label: 'risk', value: 'visible' },
    ],
  },
}

export interface ServiceDetailProps {
  tier: Tier | ExtendedTier
}

/**
 * ServiceDetail — the single Engineered Luxury tier detail template. Replaces
 * the v0 tier-a/b/c neon templates. Same composition for every productized
 * tier: identity hero with the price from tiers.ts, a ruled outcomes ledger,
 * a deliverables grid, an honest "not included" panel, a phased timeline,
 * result metrics, the tier FAQ, and a close. Self-serve tiers render the live
 * Stripe CheckoutButton; the rest route to book/inquiry through it.
 */
export function ServiceDetail({ tier }: ServiceDetailProps) {
  const selfServe = isSelfServe(tier)
  const stack = (tier as ExtendedTier).stackChips
  const showMonthlySuffix = tier.cadence === 'monthly' && !tier.price.includes('/mo')
  const routeFinderHref = `/tools/route-finder?source=service_detail&service=${tier.slug}`
  const bespokeDiagram = BESPOKE_SERVICE_DIAGRAMS[tier.slug]
  const matrixRows = [
    {
      label: 'best fit',
      value:
        tier.cadence === 'monthly'
          ? 'Operate and improve an existing system every month.'
          : selfServe
            ? 'Find the leak before you buy a larger build.'
            : `Build ${tier.capability.toLowerCase()} with a fixed scope and written handoff.`,
    },
    {
      label: 'commercial shape',
      value: `${tier.price}${showMonthlySuffix ? '/mo' : ''} · ${tier.timeline} · ${CADENCE_NOTE[tier.cadence]}`,
    },
    {
      label: 'route logic',
      value: selfServe
        ? 'Start directly, then credit the useful work into a larger engagement if needed.'
        : 'Use the diagnostic or book a call to confirm fit before scope is written.',
    },
  ]

  return (
    <LivingPageShell>
      <LivingHero
        eyebrow={`Services / ${tier.mode} / ${tier.capability}`}
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
            eyebrow="service graph"
            title={tier.name}
            nodes={[tier.shortName, tier.capability, tier.mode, tier.cadence]}
            stats={[
              { label: 'price', value: tier.price },
              { label: 'timeline', value: tier.timeline },
              { label: 'cadence', value: tier.cadence },
            ]}
          />
        }
        proof={[
          { label: 'price', value: tier.price },
          { label: 'timeline', value: tier.timeline },
          { label: 'cadence', value: showMonthlySuffix ? `${tier.cadence}/mo` : tier.cadence },
          { label: 'scope', value: CADENCE_NOTE[tier.cadence] },
        ]}
        actions={
          <>
            <CheckoutButton tier={tier} variant="primary" />
            <LivingCTA href={`/contact?engagement=${tier.slug}`} variant="secondary">
              {selfServe ? 'questions first?' : 'scope a call'}
            </LivingCTA>
            <LivingCTA href="/services" variant="text">
              services index
            </LivingCTA>
            {tier.sampleArtifact?.href && !tier.sampleArtifact.comingSoon && (
              <LivingCTA href={tier.sampleArtifact.href} variant="text">
                see a sample deliverable
              </LivingCTA>
            )}
          </>
        }
      />

      {stack && stack.length > 0 && (
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

      <Section
        index="00"
        eyebrow="matrix position"
        ariaLabel="Where this service fits"
        heading={
          <>
            Where this fits in{' '}
            <span className="italic text-[#3D5AFE]">the services matrix.</span>
          </>
        }
        lede="Every service page now names the buyer state, the commercial shape, and the next route. That keeps the catalog navigable instead of feeling like disconnected offers."
        width="max-w-6xl"
        grain
      >
        <div className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] lg:grid-cols-[1fr_1fr_1fr_0.9fr]">
          {matrixRows.map((row, index) => (
            <div className="relative min-h-[210px] overflow-hidden bg-[var(--sage-surface-1)] p-5" key={row.label}>
              <SystemFlowOverlay variant={index === 1 ? 'growth' : 'systems'} intensity="quiet" />
              <div className="relative z-10">
                <MonoLabel tone="accent">{String(index + 1).padStart(2, '0')} · {row.label}</MonoLabel>
                <p className="mt-8 text-sm leading-6 text-[var(--sage-ink-muted)]">{row.value}</p>
              </div>
            </div>
          ))}
          <div className="relative min-h-[210px] overflow-hidden bg-[var(--sage-surface-2)] p-5">
            <SystemFlowOverlay variant="academy" intensity="quiet" />
            <div className="relative z-10 flex h-full flex-col">
              <MonoLabel tone="accent">04 · decide</MonoLabel>
              <p className="mt-8 text-sm leading-6 text-[var(--sage-ink-muted)]">
                Not sure this is the right service? Run the route finder and get the matching path.
              </p>
              <div className="mt-auto pt-6">
                <LivingCTA href={routeFinderHref}>find my route</LivingCTA>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section
        index="00B"
        eyebrow={bespokeDiagram ? bespokeDiagram.eyebrow : 'system flow'}
        ariaLabel="Service system flow"
        heading={
          bespokeDiagram ? (
            <>
              Bespoke architecture for{' '}
              <span className="italic text-[#3D5AFE]">{tier.shortName}.</span>
            </>
          ) : (
            <>
              The offer is a route,{' '}
              <span className="italic text-[#3D5AFE]">not a loose task list.</span>
            </>
          )
        }
        lede={
          bespokeDiagram?.lede ??
          'This diagram gives every service page a concrete operating model: intake, system design, implementation, proof, and handoff.'
        }
        width="max-w-6xl"
      >
        <DeepSystemDiagram
          eyebrow={bespokeDiagram?.eyebrow ?? 'service operating path'}
          title={bespokeDiagram?.title ?? `${tier.shortName} flow`}
          description={
            bespokeDiagram?.description ??
            `${tier.name} moves from fit check to scoped work, then into build/proof/handoff so the buyer can understand how the engagement actually runs.`
          }
          nodes={
            bespokeDiagram?.nodes ?? [
              { label: 'Fit', detail: tier.mode },
              { label: 'Scope', detail: tier.price },
              { label: 'Build', detail: tier.timeline },
              { label: 'Proof', detail: `${tier.outcomes.length} outcomes` },
              { label: 'Handoff', detail: tier.cadence },
            ]
          }
          stats={[
            { label: 'price', value: tier.price },
            { label: 'timeline', value: tier.timeline },
            ...(bespokeDiagram?.stats ?? [{ label: 'cadence', value: tier.cadence }]),
          ].slice(0, 4)}
        />
      </Section>

      {/* ── Outcomes ───────────────────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="what you walk away with"
        ariaLabel="Outcomes"
        heading={
          <>
            The outcome,{' '}
            <span className="italic text-[#3D5AFE]">not just the output.</span>
          </>
        }
        width="max-w-5xl"
      >
        <ul className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-2">
          {tier.outcomes.map((o, i) => (
            <li
              key={o}
              className="flex items-start gap-4 bg-[var(--sage-surface-1)] px-6 py-6"
            >
              <MonoLabel tone="accent" className="mt-1 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </MonoLabel>
              <span className="text-[15px] leading-[1.6] text-[var(--sage-ink)]">
                {o}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Deliverables + Not included ────────────────────────────── */}
      <Section
        index="02"
        eyebrow="scope"
        ariaLabel="Deliverables and scope"
        heading={
          <>
            Concrete artifacts you keep —{' '}
            <span className="italic text-[#3D5AFE]">and what we leave out.</span>
          </>
        }
        lede="Working code, written docs, dashboards your team owns. We also list what this engagement deliberately does not cover, so scope is honest before you click."
        width="max-w-5xl"
        grain
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Surface level={2} className="p-7 sm:p-8">
            <MonoLabel tone="muted" as="div">
              {'// deliverables'}
            </MonoLabel>
            <ul className="mt-5 space-y-3.5">
              {tier.deliverables.map((d) => (
                <li key={d} className="flex gap-3.5">
                  <span aria-hidden className="mt-[9px] h-px w-3.5 shrink-0 bg-[#3D5AFE]" />
                  <span className="text-[14px] leading-[1.6] text-[var(--sage-ink)]">
                    {d}
                  </span>
                </li>
              ))}
            </ul>
          </Surface>

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
                    <span aria-hidden className="mt-[8px] h-px w-3 shrink-0 bg-[var(--sage-border-hover)]" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </Surface>
          )}
        </div>
      </Section>

      {/* ── Timeline ───────────────────────────────────────────────── */}
      {tier.phases.length > 0 && (
        <Section
          index="03"
          eyebrow="methodology"
          ariaLabel="Engagement timeline"
          heading={
            <>
              How the engagement{' '}
              <span className="italic text-[#3D5AFE]">actually runs.</span>
            </>
          }
          width="max-w-5xl"
        >
          <ol className="space-y-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)]">
            {tier.phases.map((phase, i) => (
              <li
                key={phase.title}
                className="flex flex-col gap-4 bg-[var(--sage-surface-1)] px-6 py-6 sm:flex-row sm:gap-8"
              >
                <div className="flex items-center gap-4 sm:w-48 sm:shrink-0">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] text-sm tabular-nums text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]"
                  >
                    {i + 1}
                  </span>
                  <MonoLabel tone="muted">{phase.label}</MonoLabel>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-[var(--sage-ink)]">
                    {phase.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--sage-ink-muted)]">
                    {phase.description}
                  </p>
                  {phase.artifacts && phase.artifacts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {phase.artifacts.map((a) => (
                        <span
                          key={a}
                          className="rounded-[3px] border border-[var(--sage-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]"
                        >
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

      {/* ── Result metrics ─────────────────────────────────────────── */}
      {tier.resultMetrics.length > 0 && (
        <Section
          eyebrow="track record"
          ariaLabel="Result metrics"
          heading="Receipts, not promises."
          width="max-w-5xl"
        >
          <dl className="grid gap-px overflow-hidden rounded-[3px] border border-[var(--sage-border)] bg-[var(--sage-border)] sm:grid-cols-3 [font-family:var(--font-mono),ui-monospace,monospace]">
            {tier.resultMetrics.map((m) => (
              <div key={m.label} className="flex flex-col gap-2 bg-[var(--sage-surface-1)] px-6 py-7">
                <dt className="text-[clamp(1.75rem,_1rem_+_2vw,_2.5rem)] leading-none tabular-nums text-[var(--sage-ink)]">
                  {m.value}
                </dt>
                <dd className="text-[11px] uppercase tracking-[0.16em] text-[var(--sage-ink-muted)]">
                  {m.label}
                </dd>
                {m.context && (
                  <dd className="text-[10px] text-[var(--sage-ink-faint)] [font-family:var(--font-sans)]">
                    {m.context}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      {tier.faq.length > 0 && (
        <Section
          index="04"
          eyebrow="questions"
          ariaLabel="Frequently asked questions"
          heading="Common questions."
          width="max-w-4xl"
        >
          <FaqAccordion items={tier.faq} />
        </Section>
      )}

      {/* ── Close ──────────────────────────────────────────────────── */}
      <Section
        eyebrow="engage"
        ariaLabel={`Start ${tier.shortName}`}
        centered
        heading={
          <>
            Ready to start{' '}
            <span className="italic text-[#3D5AFE]">{tier.shortName}?</span>
          </>
        }
        lede={
          selfServe
            ? 'Fixed scope, fixed price, Stripe checkout. Click below and we kick off within a week.'
            : 'A 30-minute call to confirm fit, scope, and timeline. No pressure, no slides.'
        }
        width="max-w-3xl"
      >
        <Reveal className="flex flex-col items-center gap-4">
          <CheckoutButton tier={tier} variant="primary" />
          <CtaLink variant="text" href="/services">
            ls services/
          </CtaLink>
        </Reveal>
      </Section>
    </LivingPageShell>
  )
}
