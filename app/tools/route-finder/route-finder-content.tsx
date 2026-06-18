'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  formatRouteFinderScope,
  getRouteRecommendation,
  type RouteFinderInput,
} from '@/lib/leads/route-finder'
import { trackEvent } from '@/lib/analytics/events'
import { SystemFlowLayer, SystemFlowOverlay } from '@/components/living/SystemFlowLayer'

const goals: Array<{ value: RouteFinderInput['goal']; label: string; detail: string }> = [
  { value: 'build', label: 'Build product', detail: 'App, SaaS, product surface, system architecture.' },
  { value: 'grow', label: 'Grow demand', detail: 'SEO, content, conversion, authority.' },
  { value: 'learn', label: 'Learn system', detail: 'Academy, templates, build notes.' },
  { value: 'fix', label: 'Fix leaks', detail: 'Audit, repair, conversion or SEO cleanup.' },
  { value: 'automate', label: 'Automate ops', detail: 'AI workflows, agents, internal systems.' },
]

const stages: Array<{ value: RouteFinderInput['stage']; label: string }> = [
  { value: 'idea', label: 'Idea / pre-build' },
  { value: 'live', label: 'Live but early' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'stuck', label: 'Stuck / leaking' },
]

const budgets: Array<{ value: RouteFinderInput['budget']; label: string }> = [
  { value: '<10k', label: '< $10k' },
  { value: '10-25k', label: '$10k-$25k' },
  { value: '25-50k', label: '$25k-$50k' },
  { value: '50-100k', label: '$50k-$100k' },
  { value: '100k+', label: '$100k+' },
  { value: 'unsure', label: 'Unsure' },
]

const timelines: Array<{ value: RouteFinderInput['timeline']; label: string }> = [
  { value: 'asap', label: 'ASAP' },
  { value: '2-4w', label: '2-4 weeks' },
  { value: '1-2m', label: '1-2 months' },
  { value: '3m+', label: '3+ months' },
  { value: 'exploring', label: 'Exploring' },
]

const mono = 'font-mono text-[11px] uppercase tracking-[0.16em]'

function OptionButton({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean
  label: string
  detail?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-[96px] overflow-hidden border p-4 text-left transition ${
        active
          ? 'border-[var(--sage-accent)] bg-[rgba(61,90,254,0.13)]'
          : 'border-[var(--sage-border)] bg-[var(--sage-surface-1)] hover:border-[var(--sage-border-hover)] hover:bg-[var(--sage-surface-2)]'
      }`}
    >
      <SystemFlowOverlay variant={active ? 'growth' : 'systems'} intensity={active ? 'normal' : 'quiet'} />
      <span className="block text-sm font-semibold text-[var(--sage-ink)]">{label}</span>
      {detail ? <span className="mt-2 block text-xs leading-5 text-[var(--sage-ink-muted)]">{detail}</span> : null}
    </button>
  )
}

export function RouteFinderContent() {
  const [input, setInput] = useState<RouteFinderInput>({
    goal: 'build',
    stage: 'live',
    budget: '25-50k',
    timeline: '2-4w',
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const recommendation = useMemo(() => getRouteRecommendation(input), [input])

  useEffect(() => {
    const source = new URLSearchParams(window.location.search).get('source') || undefined
    trackEvent('route_finder_start', { source })
  }, [])

  function setField<K extends keyof RouteFinderInput>(field: K, value: RouteFinderInput[K]) {
    const nextInput = { ...input, [field]: value }
    const nextRecommendation = getRouteRecommendation(nextInput)
    setInput(nextInput)
    trackEvent('route_finder_step', {
      field,
      value,
      route: nextRecommendation.route,
    })
  }

  function trackRouteCta(label: string, href: string) {
    trackEvent('route_finder_cta_click', {
      route: recommendation.route,
      label,
      href,
      location: 'result',
    })
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setMessage(null)

    const scope = formatRouteFinderScope(input, recommendation)
    const res = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        engagement_type: recommendation.route === 'academy' ? 'consult' : 'studio',
        name,
        email,
        company,
        website_url: website,
        timeline: input.timeline,
        budget_band: input.budget,
        scope,
        source: 'route-finder',
        referrer: typeof window !== 'undefined' ? window.location.href : '/tools/route-finder',
      }),
    })

    if (res.ok) {
      trackEvent('route_finder_complete', {
        route: recommendation.route,
        score: recommendation.score,
        goal: input.goal,
        stage: input.stage,
        budget: input.budget,
        timeline: input.timeline,
      })
      setStatus('success')
      setMessage('Got it. The route is saved and the next step is below.')
      return
    }

    const body = await res.json().catch(() => ({}))
    setStatus('error')
    setMessage(typeof body?.error === 'string' ? body.error : 'Could not save the route. Try again.')
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.58fr)] lg:items-start">
      <form className="space-y-8" onSubmit={submitLead}>
        <fieldset>
          <legend className={`${mono} mb-4 text-[var(--sage-accent-readable)]`}>01 · What do you need?</legend>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {goals.map((goal) => (
              <OptionButton
                key={goal.value}
                active={input.goal === goal.value}
                label={goal.label}
                detail={goal.detail}
                onClick={() => setField('goal', goal.value)}
              />
            ))}
          </div>
        </fieldset>

        <div className="grid gap-8 md:grid-cols-3">
          <fieldset>
            <legend className={`${mono} mb-4 text-[var(--sage-accent-readable)]`}>02 · Stage</legend>
            <div className="grid gap-2">
              {stages.map((stage) => (
                <OptionButton
                  key={stage.value}
                  active={input.stage === stage.value}
                  label={stage.label}
                  onClick={() => setField('stage', stage.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={`${mono} mb-4 text-[var(--sage-accent-readable)]`}>03 · Budget</legend>
            <div className="grid gap-2">
              {budgets.map((budget) => (
                <OptionButton
                  key={budget.value}
                  active={input.budget === budget.value}
                  label={budget.label}
                  onClick={() => setField('budget', budget.value)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className={`${mono} mb-4 text-[var(--sage-accent-readable)]`}>04 · Timeline</legend>
            <div className="grid gap-2">
              {timelines.map((timeline) => (
                <OptionButton
                  key={timeline.value}
                  active={input.timeline === timeline.value}
                  label={timeline.label}
                  onClick={() => setField('timeline', timeline.value)}
                />
              ))}
            </div>
          </fieldset>
        </div>

        <SystemFlowLayer className="border border-[var(--sage-border)] bg-[var(--sage-surface-1)] p-5 sm:p-6" variant="growth" intensity="quiet">
          <p className={`${mono} mb-5 text-[var(--sage-accent-readable)]`}>Send yourself the route</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="min-h-11 border border-[var(--sage-border)] bg-[var(--sage-bg)] px-4 text-sm text-[var(--sage-ink)] outline-none placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-accent)]"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="min-h-11 border border-[var(--sage-border)] bg-[var(--sage-bg)] px-4 text-sm text-[var(--sage-ink)] outline-none placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-accent)]"
            />
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Company"
              className="min-h-11 border border-[var(--sage-border)] bg-[var(--sage-bg)] px-4 text-sm text-[var(--sage-ink)] outline-none placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-accent)]"
            />
            <input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="Website"
              className="min-h-11 border border-[var(--sage-border)] bg-[var(--sage-bg)] px-4 text-sm text-[var(--sage-ink)] outline-none placeholder:text-[var(--sage-ink-faint)] focus:border-[var(--sage-accent)]"
            />
          </div>
          <button
            disabled={status === 'loading'}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {status === 'loading' ? 'Saving route...' : 'Save my route ->'}
          </button>
          {message ? (
            <p className={`mt-3 text-sm ${status === 'error' ? 'text-red-400' : 'text-[var(--sage-accent-readable)]'}`}>
              {message}
            </p>
          ) : null}
        </SystemFlowLayer>
      </form>

      <SystemFlowLayer
        className="sticky top-24 border border-[var(--sage-border)] bg-[rgba(20,20,24,0.72)] p-5 sm:p-6"
        variant="systems"
        intensity="normal"
      >
        <p className={`${mono} text-[var(--sage-accent-readable)]`}>recommended route</p>
        <h2
          className="mt-5 text-[clamp(2rem,_1.4rem_+_2.2vw,_3.7rem)] font-extrabold text-[var(--sage-ink)]"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 0.98 }}
        >
          {recommendation.title}
        </h2>
        <p className="mt-5 text-sm leading-6 text-[var(--sage-ink-muted)]">{recommendation.summary}</p>
        <dl className="mt-6 grid grid-cols-2 gap-px bg-[var(--sage-border)]">
          <div className="bg-[var(--sage-bg)] p-3">
            <dt className={`${mono} text-[var(--sage-ink-faint)]`}>fit score</dt>
            <dd className="mt-2 font-mono text-xl text-[var(--sage-ink)]">{recommendation.score}</dd>
          </div>
          <div className="bg-[var(--sage-bg)] p-3">
            <dt className={`${mono} text-[var(--sage-ink-faint)]`}>route</dt>
            <dd className="mt-2 font-mono text-xl text-[var(--sage-ink)]">{recommendation.route}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={recommendation.primaryHref}
            onClick={() => trackRouteCta(recommendation.primaryLabel, recommendation.primaryHref)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--sage-accent)] px-5 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
          >
            {recommendation.primaryLabel}
            <span aria-hidden className="ml-1">-&gt;</span>
          </Link>
          <Link
            href={recommendation.secondaryHref}
            onClick={() => trackRouteCta(recommendation.secondaryLabel, recommendation.secondaryHref)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--sage-border-strong)] px-5 text-sm font-semibold text-[var(--sage-ink)] transition hover:border-[var(--sage-accent)]"
          >
            {recommendation.secondaryLabel}
            <span aria-hidden className="ml-1">-&gt;</span>
          </Link>
        </div>
        <div className="mt-6 border-t border-[var(--sage-border)] pt-5">
          <p className={`${mono} mb-3 text-[var(--sage-ink-faint)]`}>why</p>
          <ul className="space-y-2 text-sm leading-6 text-[var(--sage-ink-muted)]">
            {recommendation.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      </SystemFlowLayer>
    </div>
  )
}
