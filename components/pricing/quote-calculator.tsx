'use client'

// Interactive scope estimator, restyled to Engineered Luxury.
// Lives on /pricing. Lets a prospect click their way to a real-time estimate.
// The pricing rules are unchanged from the prior version — derived from real
// engagement averages over the last 18 months.

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Surface, MonoLabel, Hairline } from '@/components/el'

// ────────────────────────────────────────────────────────────────────
// Scope parameters & pricing rules
// ────────────────────────────────────────────────────────────────────

type Engagement = 'audit' | 'sprint' | 'build' | 'retainer'
type Timeline = 'flex' | 'standard' | 'rush'
type AiNeed = 'none' | 'light' | 'heavy'

interface Scope {
  engagement: Engagement
  weeks: number
  timeline: Timeline
  ai: AiNeed
  integrations: number // count of 3rd-party APIs/services
  withQa: boolean
}

const ENGAGEMENT_BASE: Record<Engagement, { label: string; base: number; min: number; max: number; verb: string }> = {
  audit:    { label: 'audit',    base: 750,  min: 1, max: 2,  verb: 'audit_and_recommend' },
  sprint:   { label: 'sprint',   base: 4500, min: 1, max: 4,  verb: 'ship_a_focused_outcome' },
  build:    { label: 'build',    base: 9500, min: 4, max: 14, verb: 'build_a_production_system' },
  retainer: { label: 'retainer', base: 3500, min: 1, max: 1,  verb: 'continuous_care_per_month' },
}

const TIMELINE_MULT: Record<Timeline, { label: string; mult: number; note: string }> = {
  flex:     { label: 'flex',     mult: 0.95, note: 'we slot you in when capacity opens' },
  standard: { label: 'standard', mult: 1.00, note: 'kickoff in 1–2 weeks' },
  rush:     { label: 'rush',     mult: 1.25, note: 'we drop a current slot to start now' },
}

const AI_ADD: Record<AiNeed, { label: string; add: number; note: string }> = {
  none:  { label: 'none',  add: 0,    note: 'classic web/backend work' },
  light: { label: 'light', add: 1200, note: 'one feature with an LLM in it' },
  heavy: { label: 'heavy', add: 3500, note: 'multi-step agents, RAG, evals' },
}

function calculate(scope: Scope) {
  const eng = ENGAGEMENT_BASE[scope.engagement]
  const weekUnits = scope.engagement === 'retainer' ? 1 : Math.max(eng.min, Math.min(eng.max, scope.weeks))
  let total =
    eng.base * (scope.engagement === 'sprint' || scope.engagement === 'build' ? weekUnits / Math.max(1, eng.min) : 1)
  total *= TIMELINE_MULT[scope.timeline].mult
  total += AI_ADD[scope.ai].add
  total += scope.integrations * 600
  if (scope.withQa) total *= 1.12
  return Math.round(total / 50) * 50 // nearest $50
}

export function QuoteCalculator() {
  const [scope, setScope] = useState<Scope>({
    engagement: 'build',
    weeks: 6,
    timeline: 'standard',
    ai: 'light',
    integrations: 2,
    withQa: true,
  })

  const total = useMemo(() => calculate(scope), [scope])
  const eng = ENGAGEMENT_BASE[scope.engagement]
  const isRetainer = scope.engagement === 'retainer'
  const totalLabel = isRetainer ? `$${total.toLocaleString()}/mo` : `$${total.toLocaleString()}`

  return (
    <Surface level={2} className="overflow-hidden">
      <div className="grid lg:grid-cols-[1.2fr_1fr]">
        {/* Inputs */}
        <div className="space-y-6 border-b border-[var(--sage-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <FieldSet label="engagement_type">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(ENGAGEMENT_BASE) as Engagement[]).map((e) => (
                <Pill
                  key={e}
                  active={scope.engagement === e}
                  onClick={() => setScope({ ...scope, engagement: e, weeks: ENGAGEMENT_BASE[e].min })}
                  label={ENGAGEMENT_BASE[e].label}
                />
              ))}
            </div>
            <Caption>
              {'// '}
              {eng.verb}() · from ${eng.base.toLocaleString()}
            </Caption>
          </FieldSet>

          {!isRetainer && (
            <FieldSet label={`scope_weeks (${eng.min}–${eng.max})`}>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={eng.min}
                  max={eng.max}
                  value={scope.weeks}
                  onChange={(e) => setScope({ ...scope, weeks: Number(e.target.value) })}
                  className="h-1.5 flex-1 accent-[#3D5AFE]"
                  aria-label="Scope in weeks"
                />
                <span className="w-16 text-right text-sm text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                  {scope.weeks} {scope.weeks === 1 ? 'wk' : 'wks'}
                </span>
              </div>
            </FieldSet>
          )}

          <FieldSet label="timeline">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(TIMELINE_MULT) as Timeline[]).map((t) => (
                <Pill
                  key={t}
                  active={scope.timeline === t}
                  onClick={() => setScope({ ...scope, timeline: t })}
                  label={TIMELINE_MULT[t].label}
                />
              ))}
            </div>
            <Caption>
              {'// '}
              {TIMELINE_MULT[scope.timeline].note}
            </Caption>
          </FieldSet>

          <FieldSet label="ai_surface">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(AI_ADD) as AiNeed[]).map((a) => (
                <Pill
                  key={a}
                  active={scope.ai === a}
                  onClick={() => setScope({ ...scope, ai: a })}
                  label={AI_ADD[a].label}
                />
              ))}
            </div>
            <Caption>
              {'// '}
              {AI_ADD[scope.ai].note}
            </Caption>
          </FieldSet>

          <FieldSet label="integrations (Stripe, Supabase, OAuth, etc.)">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={8}
                value={scope.integrations}
                onChange={(e) => setScope({ ...scope, integrations: Number(e.target.value) })}
                className="h-1.5 flex-1 accent-[#3D5AFE]"
                aria-label="Number of third-party integrations"
              />
              <span className="w-16 text-right text-sm text-[#3D5AFE] [font-family:var(--font-mono),ui-monospace,monospace]">
                {scope.integrations} svc
              </span>
            </div>
          </FieldSet>

          <FieldSet label="qa_coverage">
            <button
              type="button"
              onClick={() => setScope({ ...scope, withQa: !scope.withQa })}
              aria-pressed={scope.withQa}
              className={`flex w-full items-center justify-between rounded-[3px] border px-4 py-2.5 text-left transition-colors ${
                scope.withQa
                  ? 'border-[#3D5AFE]/50 bg-[#3D5AFE]/[0.08] text-[#3D5AFE]'
                  : 'border-[var(--sage-border-strong)] bg-[var(--sage-surface-1)] text-[var(--sage-ink-muted)] hover:border-[var(--sage-border-hover)]'
              }`}
            >
              <span className="text-sm [font-family:var(--font-mono),ui-monospace,monospace]">
                {scope.withQa ? '[x]' : '[ ]'} include full QA suite (+12%)
              </span>
            </button>
            <Caption>{'// playwright, contract tests, lighthouse, axe, pact'}</Caption>
          </FieldSet>
        </div>

        {/* Output */}
        <div className="flex flex-col bg-[var(--sage-surface-1)] p-6 sm:p-8">
          <MonoLabel tone="accent">{'// scope.estimate()'}</MonoLabel>
          <div
            className="mt-3 text-[clamp(2.5rem,1.5rem+3vw,3.75rem)] leading-none tabular-nums tracking-tight text-[var(--sage-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {totalLabel}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[var(--sage-ink-muted)]">
            Estimate based on real engagements. The final number is fixed on signature, with a
            written kill switch if scope changes mid-flight.
          </p>

          <Hairline className="my-5" />

          {/* Breakdown */}
          <ul className="space-y-1.5 text-[12px] text-[var(--sage-ink-muted)] [font-family:var(--font-mono),ui-monospace,monospace]">
            <li className="flex justify-between">
              <span>base · {eng.label}</span>
              <span className="text-[var(--sage-ink)]">${eng.base.toLocaleString()}</span>
            </li>
            {!isRetainer && (
              <li className="flex justify-between">
                <span>scope · {scope.weeks} wk</span>
                <span className="text-[var(--sage-ink)]">×{(scope.weeks / Math.max(1, eng.min)).toFixed(1)}</span>
              </li>
            )}
            <li className="flex justify-between">
              <span>timeline · {TIMELINE_MULT[scope.timeline].label}</span>
              <span className="text-[var(--sage-ink)]">×{TIMELINE_MULT[scope.timeline].mult.toFixed(2)}</span>
            </li>
            <li className="flex justify-between">
              <span>ai · {AI_ADD[scope.ai].label}</span>
              <span className="text-[var(--sage-ink)]">+${AI_ADD[scope.ai].add.toLocaleString()}</span>
            </li>
            <li className="flex justify-between">
              <span>integrations · {scope.integrations}</span>
              <span className="text-[var(--sage-ink)]">+${(scope.integrations * 600).toLocaleString()}</span>
            </li>
            {scope.withQa && (
              <li className="flex justify-between">
                <span>qa_suite</span>
                <span className="text-[var(--sage-ink)]">+12%</span>
              </li>
            )}
          </ul>

          <div className="mt-auto flex flex-col gap-2 pt-6">
            <Link
              href={`/contact?engagement=${scope.engagement}&estimate=${total}`}
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-[3px] bg-[#3D5AFE] px-6 text-[13px] font-medium uppercase tracking-[0.08em] text-[#08110F] transition-[background-color,box-shadow,transform] duration-200 ease-out [font-family:var(--font-mono),ui-monospace,monospace] hover:bg-[#5670ff] hover:shadow-[0_0_28px_-4px_rgba(61,90,254,0.55)] active:translate-y-px"
            >
              <span>./book --estimate</span>
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <span className="text-center text-[10px] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
              {'// the number above is what you pay. fixed at signature.'}
            </span>
          </div>
        </div>
      </div>
    </Surface>
  )
}

// ────────────────────────────────────────────────────────────────────
// Small primitives
// ────────────────────────────────────────────────────────────────────

function FieldSet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <MonoLabel tone="faint" as="div" className="mb-2.5">
        {'// '}
        {label}
      </MonoLabel>
      {children}
    </div>
  )
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[3px] border px-3 py-2 text-sm uppercase tracking-wide transition-colors [font-family:var(--font-mono),ui-monospace,monospace] ${
        active
          ? 'border-[#3D5AFE]/50 bg-[#3D5AFE]/[0.08] text-[#3D5AFE]'
          : 'border-[var(--sage-border-strong)] bg-[var(--sage-surface-1)] text-[var(--sage-ink-muted)] hover:border-[var(--sage-border-hover)] hover:text-[var(--sage-ink)]'
      }`}
    >
      {label}
    </button>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1.5 text-[11px] text-[var(--sage-ink-faint)] [font-family:var(--font-mono),ui-monospace,monospace]">
      {children}
    </div>
  )
}
