'use client'

// Phase 9: Terminal-style interactive quote calculator.
// Lives at the top of /pricing. Lets a prospect type or click their way to a
// real-time estimate — no spreadsheet, no "request a quote", just a number.

import { useState, useMemo } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

// ────────────────────────────────────────────────────────────────────
// Scope parameters & pricing rules
// All numbers are derived from real engagement averages over the last 18 months.
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
    <section className="relative">
      <div className="rounded-2xl border border-[#2A2826] bg-[#0B0A09] overflow-hidden">
        {/* Terminal header */}
        <header className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-[#2A2826] bg-[#12110F]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E85D3A]/70" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#A8C633]/60" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[#0ED3CF]/70" aria-hidden />
            <span className="ml-3 text-[11px] font-mono text-[#A8A29E]">~/sage/scope.sh</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#57534E]">interactive</span>
        </header>

        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          {/* Inputs */}
          <div className="p-5 sm:p-7 space-y-6 border-r border-[#2A2826]">
            {/* Engagement type */}
            <FieldSet label="engagement_type">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

            {/* Weeks (only when not retainer) */}
            {!isRetainer && (
              <FieldSet label={`scope_weeks (${eng.min}–${eng.max})`}>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={eng.min}
                    max={eng.max}
                    value={scope.weeks}
                    onChange={(e) => setScope({ ...scope, weeks: Number(e.target.value) })}
                    className="flex-1 accent-[#0ED3CF] h-1.5"
                    aria-label="Scope in weeks"
                  />
                  <span className="text-[#0ED3CF] font-mono text-sm w-16 text-right">
                    {scope.weeks} {scope.weeks === 1 ? 'wk' : 'wks'}
                  </span>
                </div>
              </FieldSet>
            )}

            {/* Timeline */}
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

            {/* AI need */}
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

            {/* Integrations */}
            <FieldSet label="integrations (Stripe, Supabase, OAuth, etc.)">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={8}
                  value={scope.integrations}
                  onChange={(e) => setScope({ ...scope, integrations: Number(e.target.value) })}
                  className="flex-1 accent-[#0ED3CF] h-1.5"
                  aria-label="Number of third-party integrations"
                />
                <span className="text-[#0ED3CF] font-mono text-sm w-16 text-right">
                  {scope.integrations} svc
                </span>
              </div>
            </FieldSet>

            {/* QA */}
            <FieldSet label="qa_coverage">
              <button
                type="button"
                onClick={() => setScope({ ...scope, withQa: !scope.withQa })}
                aria-pressed={scope.withQa}
                className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  scope.withQa
                    ? 'border-[#0ED3CF]/60 bg-[#0ED3CF]/10 text-[#0ED3CF]'
                    : 'border-[#2A2826] bg-[#12110F] text-[#A8A29E] hover:border-[#3D3A37]'
                }`}
              >
                <span className="text-sm font-mono">
                  {scope.withQa ? '[x]' : '[ ]'} include full QA suite (+12%)
                </span>
                {scope.withQa && <Check className="h-4 w-4" />}
              </button>
              <Caption>{'// playwright, contract tests, lighthouse, axe, pact'}</Caption>
            </FieldSet>
          </div>

          {/* Output */}
          <div className="p-5 sm:p-7 bg-gradient-to-br from-[#0B0A09] via-[#0F0E0D] to-[#0B0A09] flex flex-col">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0ED3CF] mb-2">
              {'// scope.estimate()'}
            </div>
            <div
              className="text-5xl sm:text-6xl font-normal text-[#F4F2EF] leading-none tracking-tight sage-text-bloom-cyan"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {totalLabel}
            </div>
            <p className="mt-3 text-xs text-[#A8A29E] leading-relaxed">
              Estimate based on real engagements. Final number is fixed on signature, with a written kill switch
              if anything changes.
            </p>

            {/* Breakdown */}
            <ul className="mt-6 space-y-1.5 text-[12px] font-mono text-[#A8A29E]">
              <li className="flex justify-between">
                <span>base · {eng.label}</span>
                <span className="text-[#D4D4D8]">${eng.base.toLocaleString()}</span>
              </li>
              {!isRetainer && (
                <li className="flex justify-between">
                  <span>scope · {scope.weeks} wk</span>
                  <span className="text-[#D4D4D8]">×{(scope.weeks / Math.max(1, eng.min)).toFixed(1)}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span>timeline · {TIMELINE_MULT[scope.timeline].label}</span>
                <span className="text-[#D4D4D8]">×{TIMELINE_MULT[scope.timeline].mult.toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>ai · {AI_ADD[scope.ai].label}</span>
                <span className="text-[#D4D4D8]">+${AI_ADD[scope.ai].add.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span>integrations · {scope.integrations}</span>
                <span className="text-[#D4D4D8]">+${(scope.integrations * 600).toLocaleString()}</span>
              </li>
              {scope.withQa && (
                <li className="flex justify-between">
                  <span>qa_suite</span>
                  <span className="text-[#D4D4D8]">+12%</span>
                </li>
              )}
            </ul>

            <div className="mt-auto pt-6 flex flex-col gap-2">
              <Link
                href={`/contact?engagement=${scope.engagement}&estimate=${total}`}
                className="sage-neon-cta sage-bloom-cyan inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-[#0ED3CF] text-[#09090B] font-semibold uppercase tracking-wide [font-family:var(--font-mono),ui-monospace,monospace] text-sm hover:bg-[#0AA8A5] transition-colors"
              >
                ./book --estimate
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-[10px] font-mono text-[#57534E] text-center">
                {'// the number above is what you pay. fixed at signature.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Small primitives
// ────────────────────────────────────────────────────────────────────

function FieldSet({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#57534E] mb-2">
        {'// '}
        {label}
      </div>
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
      className={`rounded-md border px-3 py-2 text-sm [font-family:var(--font-mono),ui-monospace,monospace] uppercase tracking-wide transition-colors ${
        active
          ? 'border-[#0ED3CF]/60 bg-[#0ED3CF]/10 text-[#0ED3CF]'
          : 'border-[#2A2826] bg-[#12110F] text-[#A8A29E] hover:border-[#3D3A37] hover:text-[#F4F2EF]'
      }`}
    >
      {label}
    </button>
  )
}

function Caption({ children }: { children: React.ReactNode }) {
  return <div className="mt-1.5 text-[11px] font-mono text-[#57534E]">{children}</div>
}
