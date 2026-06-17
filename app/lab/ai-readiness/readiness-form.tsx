'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import { questions, dimensionLabels, maxScore, type Dimension } from '@/data/lab/ai-readiness-questions'
import { tierFor, dimensionGap } from '@/data/lab/ai-readiness-tiers'

type Answers = Record<string, number>

export function ReadinessForm() {
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every((q) => answers[q.id] !== undefined)

  function setAnswer(qid: string, points: number) {
    setAnswers((a) => ({ ...a, [qid]: points }))
  }

  function reset() {
    setAnswers({})
    setSubmitted(false)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (submitted) {
    return <ResultPanel answers={answers} onReset={reset} />
  }

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  return (
    <div className="space-y-10">
      {/* Progress bar */}
      <div className="-mx-4 sticky top-20 z-10 border-b border-[var(--sage-border)] bg-[rgba(11,11,14,0.94)] px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase tracking-[0.14em]">
          <span className="text-[var(--sage-ink-muted)]">{answeredCount} / {questions.length} answered</span>
          <span className="text-[var(--sage-accent-readable)]">{progress}%</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[var(--sage-border)]">
          <div
            className="h-full bg-[var(--sage-accent)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-12">
        {questions.map((q, idx) => {
          const selected = answers[q.id]
          return (
            <fieldset key={q.id} className="space-y-4">
              <legend className="block">
                <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
                  {String(idx + 1).padStart(2, '0')} · {dimensionLabels[q.dimension]}
                </span>
                <p className="mt-2 text-xl font-medium leading-snug text-[var(--sage-ink)]">{q.prompt}</p>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = selected === opt.points
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAnswer(q.id, opt.points)}
                      className={`border p-4 text-left transition ${
                        isSelected
                          ? 'border-[rgba(61,90,254,0.62)] bg-[rgba(61,90,254,0.10)] text-[var(--sage-ink)]'
                          : 'border-[var(--sage-border)] bg-[rgba(20,20,24,0.62)] text-[var(--sage-ink-muted)] hover:border-[rgba(61,90,254,0.45)] hover:text-[var(--sage-ink)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? 'border-[var(--sage-accent)] bg-[var(--sage-accent)]' : 'border-[var(--sage-ink-faint)]'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-sm leading-relaxed">{opt.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        })}
      </div>

      {/* Submit */}
      <div className="border-t border-[var(--sage-border)] pt-8">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true)
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold transition ${
            allAnswered
              ? 'bg-[var(--sage-accent)] text-white hover:bg-[#5670ff]'
              : 'cursor-not-allowed bg-[var(--sage-border)] text-[var(--sage-ink-faint)]'
          }`}
        >
          {allAnswered ? 'Get my readiness score' : `Answer ${questions.length - answeredCount} more`}
          {allAnswered && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function ResultPanel({ answers, onReset }: { answers: Answers; onReset: () => void }) {
  const total = Object.values(answers).reduce((sum, v) => sum + v, 0)
  const tier = tierFor(total)

  const byDim: Record<Dimension, number> = { data: 0, infra: 0, process: 0, talent: 0, roi: 0 }
  for (const q of questions) {
    byDim[q.dimension] += answers[q.id] ?? 0
  }
  const weakest = dimensionGap(byDim)

  return (
    <div className="space-y-12">
      {/* Score header */}
      <div className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.76)] p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
              Your readiness band
            </span>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-[var(--sage-ink)] sm:text-5xl">
              {tier.band}
            </h2>
          </div>
          <div className="text-right sm:text-right">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-ink-muted)]">Score</div>
            <div className="mt-1 text-5xl font-semibold tracking-tight text-[var(--sage-ink)] tabular-nums">
              {total}<span className="text-2xl text-[var(--sage-ink-faint)]"> / {maxScore}</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-lg leading-relaxed text-[var(--sage-ink)]">{tier.headline}</p>
        <p className="mt-4 leading-relaxed text-[var(--sage-ink-muted)]">{tier.diagnosis}</p>
      </div>

      {/* Dimension breakdown */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight text-[var(--sage-ink)]">By dimension</h3>
        <p className="mt-2 text-[var(--sage-ink-muted)]">
          Your weakest area is{' '}
          <span className="font-medium text-[var(--sage-accent-readable)]">{dimensionLabels[weakest]}</span>. Address
          that before scaling other investments.
        </p>
        <div className="mt-6 space-y-3">
          {(Object.keys(byDim) as Dimension[]).map((dim) => {
            const score = byDim[dim]
            const max = 6
            const pct = (score / max) * 100
            const isWeakest = dim === weakest
            return (
              <div key={dim} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-medium ${isWeakest ? 'text-[var(--sage-accent-readable)]' : 'text-[var(--sage-ink)]'}`}>
                    {dimensionLabels[dim]}
                  </span>
                  <span className="font-mono text-[var(--sage-ink-muted)] tabular-nums">
                    {score} / {max}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--sage-border)]">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isWeakest ? 'bg-[var(--sage-accent)]' : 'bg-[var(--sage-ink-faint)]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recommended offers */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight text-[var(--sage-ink)]">Where to start</h3>
        <p className="mt-2 text-[var(--sage-ink-muted)]">
          Engagements that match where you are right now.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tier.recommendedOffers.map((o) => (
            <Link
              key={o.slug}
              href={`/services/${o.slug}`}
              className="group flex items-center justify-between border border-[var(--sage-border)] bg-[rgba(20,20,24,0.62)] p-5 transition hover:border-[rgba(61,90,254,0.48)] hover:bg-[rgba(61,90,254,0.08)]"
            >
              <span className="font-medium text-[var(--sage-ink)]">{o.label}</span>
              <ArrowRight className="h-4 w-4 text-[var(--sage-ink-faint)] transition group-hover:translate-x-1 group-hover:text-[var(--sage-accent-readable)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Next step CTA */}
      <section className="border border-[rgba(61,90,254,0.34)] bg-[rgba(61,90,254,0.08)] p-8 sm:p-10">
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--sage-accent-readable)]">
          Recommended next step
        </span>
        <p className="mt-3 text-lg leading-relaxed text-[var(--sage-ink)]">{tier.nextStep}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/book?context=ai-readiness"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--sage-accent)] px-6 text-sm font-semibold text-white transition hover:bg-[#5670ff]"
          >
            Book a 30-minute call
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.58)] px-6 text-sm font-semibold text-[var(--sage-ink-muted)] transition hover:border-[var(--sage-accent)] hover:text-[var(--sage-ink)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retake the diagnostic
          </button>
        </div>
      </section>
    </div>
  )
}
