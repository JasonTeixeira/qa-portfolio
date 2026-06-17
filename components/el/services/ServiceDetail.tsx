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

const CADENCE_NOTE: Record<Tier['cadence'], string> = {
  'one-time': 'One-time / fixed scope',
  monthly: 'Monthly retainer / cancel anytime',
  custom: 'Custom / scoped after discovery',
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

      {/* ── Outcomes ───────────────────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="what you walk away with"
        ariaLabel="Outcomes"
        heading={
          <>
            The outcome,{' '}
            <span className="italic text-[#0ED3CF]">not just the output.</span>
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
            <span className="italic text-[#0ED3CF]">and what we leave out.</span>
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
                  <span aria-hidden className="mt-[9px] h-px w-3.5 shrink-0 bg-[#0ED3CF]" />
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
              <span className="italic text-[#0ED3CF]">actually runs.</span>
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
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[3px] border border-[var(--sage-border-strong)] bg-[var(--sage-surface-2)] text-sm tabular-nums text-[#0ED3CF] [font-family:var(--font-mono),ui-monospace,monospace]"
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
            <span className="italic text-[#0ED3CF]">{tier.shortName}?</span>
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
