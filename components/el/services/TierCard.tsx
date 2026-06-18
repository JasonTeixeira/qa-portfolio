'use client'

import * as React from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline } from '@/components/el'
import { CheckoutButton } from '@/components/studio/checkout-button'
import { SystemFlowOverlay } from '@/components/living/SystemFlowLayer'
import type { Tier } from '@/data/services/tiers'
import { isSelfServe } from '@/data/services/tier-classification'

export interface TierCardProps {
  tier: Tier
  /** Two-digit index marker, e.g. "01". */
  index: string
  /** Mark this card as the recommended/primary lane. */
  recommended?: boolean
}

/**
 * TierCard — the Engineered Luxury money card. Single price (from tiers.ts),
 * outcomes, a hairline-framed deliverables ledger, and one clear CTA. The
 * self-serve path renders the live Stripe CheckoutButton; everything else
 * routes to book/inquiry inside CheckoutButton's own logic.
 *
 * Exactly one card per surface is `recommended` — that card gets the accent
 * top-rule + corner ticks. The rest stay quiet on the near-black ramp.
 */
export function TierCard({ tier, index, recommended = false }: TierCardProps) {
  const selfServe = isSelfServe(tier)
  const cadenceNote =
    tier.cadence === 'monthly'
      ? 'Monthly retainer · cancel anytime'
      : tier.cadence === 'custom'
        ? 'Custom — scoped after discovery'
        : 'One-time · fixed scope'

  return (
    <Surface
      level={recommended ? 3 : 2}
      ticks={recommended}
      className="relative flex h-full flex-col p-7 sm:p-8"
    >
      <SystemFlowOverlay variant={recommended ? 'growth' : 'studio'} intensity={recommended ? 'normal' : 'quiet'} />
      {recommended && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--sage-accent)] via-[rgba(124,58,237,0.45)] to-transparent"
        />
      )}

      {/* Eyebrow row */}
      <div className="flex items-center justify-between">
        <MonoLabel tone={recommended ? 'accent' : 'muted'}>
          {recommended ? '// recommended' : `// ${tier.mode}`}
        </MonoLabel>
        <MonoLabel tone="faint" className="tabular-nums">
          {index}
        </MonoLabel>
      </div>

      {/* Name + tagline */}
      <h3
        className="mt-5 text-2xl font-normal tracking-[-0.02em] text-[var(--sage-ink)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {tier.name}
      </h3>
      <p className="mt-2 text-sm leading-[1.6] text-[var(--sage-ink-muted)]">
        {tier.tagline}
      </p>

      {/* Price block — single source of truth: tiers.ts */}
      <div className="mt-6 flex items-baseline gap-2">
        <span
          className="text-[2.5rem] leading-none tabular-nums text-[var(--sage-ink)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {tier.price}
        </span>
        {tier.cadence === 'monthly' && !tier.price.includes('/mo') && (
          <span className="text-sm text-[var(--sage-ink-faint)]">/mo</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <MonoLabel tone="faint">{tier.timeline}</MonoLabel>
        <span aria-hidden className="text-[var(--sage-ink-faint)]">·</span>
        <MonoLabel tone="faint">{cadenceNote}</MonoLabel>
      </div>

      <Hairline className="my-6" />

      {/* Outcomes — what you walk away with */}
      <MonoLabel tone="muted" as="div">
        {'// outcomes'}
      </MonoLabel>
      <ul className="mt-4 space-y-2.5">
        {tier.outcomes.slice(0, 4).map((o) => (
          <li
            key={o}
            className="flex gap-3 text-[13px] leading-[1.55] text-[var(--sage-ink-muted)]"
          >
            <span aria-hidden className="mt-[7px] h-px w-3 shrink-0 bg-[var(--sage-accent)]" />
            <span>{o}</span>
          </li>
        ))}
      </ul>

      {/* CTA pinned to the bottom */}
      <div className="mt-7 flex flex-col gap-3 pt-1">
        <CheckoutButton
          tier={tier}
          variant={recommended ? 'primary' : 'secondary'}
        />
        <Link
          href={`/services/${tier.slug}`}
          className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)] transition-colors hover:text-[var(--sage-accent-readable)] [font-family:var(--font-mono),ui-monospace,monospace]"
        >
          <span>{selfServe ? 'full scope + deliverables' : 'full scope + what’s included'}</span>
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </Surface>
  )
}
