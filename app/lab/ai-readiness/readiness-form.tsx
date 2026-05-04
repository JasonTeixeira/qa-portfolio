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
      <div className="sticky top-20 z-10 bg-[#09090B]/95 backdrop-blur py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-[#27272A]">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider mb-2">
          <span className="text-[#A1A1AA]">{answeredCount} / {questions.length} answered</span>
          <span className="text-[#06B6D4]">{progress}%</span>
        </div>
        <div className="h-1 bg-[#27272A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#06B6D4] transition-all duration-300 ease-out"
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
                <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
                  {String(idx + 1).padStart(2, '0')} · {dimensionLabels[q.dimension]}
                </span>
                <p className="mt-2 text-xl text-[#FAFAFA] font-medium leading-snug">{q.prompt}</p>
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = selected === opt.points
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAnswer(q.id, opt.points)}
                      className={`text-left rounded-lg border p-4 transition-all ${
                        isSelected
                          ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-[#FAFAFA]'
                          : 'border-[#27272A] bg-[#18181B] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#FAFAFA]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? 'border-[#06B6D4] bg-[#06B6D4]' : 'border-[#52525B]'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-[#09090B]" />}
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
      <div className="border-t border-[#27272A] pt-8">
        <button
          type="button"
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true)
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium transition-all ${
            allAnswered
              ? 'bg-[#06B6D4] text-[#09090B] hover:bg-[#0891B2]'
              : 'bg-[#27272A] text-[#52525B] cursor-not-allowed'
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
      <div className="rounded-2xl border border-[#27272A] bg-[#18181B] p-8 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
              Your readiness band
            </span>
            <h2 className="mt-2 text-4xl sm:text-5xl font-bold text-[#FAFAFA] tracking-tight">
              {tier.band}
            </h2>
          </div>
          <div className="text-right sm:text-right">
            <div className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">Score</div>
            <div className="mt-1 text-5xl font-bold text-[#FAFAFA] tracking-tight tabular-nums">
              {total}<span className="text-2xl text-[#52525B]"> / {maxScore}</span>
            </div>
          </div>
        </div>
        <p className="mt-6 text-lg text-[#FAFAFA] leading-relaxed">{tier.headline}</p>
        <p className="mt-4 text-[#A1A1AA] leading-relaxed">{tier.diagnosis}</p>
      </div>

      {/* Dimension breakdown */}
      <section>
        <h3 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">By dimension</h3>
        <p className="mt-2 text-[#A1A1AA]">
          Your weakest area is{' '}
          <span className="text-[#06B6D4] font-medium">{dimensionLabels[weakest]}</span>. Address
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
                  <span className={`font-medium ${isWeakest ? 'text-[#06B6D4]' : 'text-[#FAFAFA]'}`}>
                    {dimensionLabels[dim]}
                  </span>
                  <span className="font-mono tabular-nums text-[#A1A1AA]">
                    {score} / {max}
                  </span>
                </div>
                <div className="h-2 bg-[#27272A] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      isWeakest ? 'bg-[#06B6D4]' : 'bg-[#52525B]'
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
        <h3 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Where to start</h3>
        <p className="mt-2 text-[#A1A1AA]">
          Engagements that match where you are right now.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tier.recommendedOffers.map((o) => (
            <Link
              key={o.slug}
              href={`/services/${o.slug}`}
              className="group flex items-center justify-between rounded-lg border border-[#27272A] bg-[#18181B] p-5 transition-all hover:border-[#06B6D4]/50 hover:bg-[#06B6D4]/5"
            >
              <span className="font-medium text-[#FAFAFA]">{o.label}</span>
              <ArrowRight className="h-4 w-4 text-[#52525B] transition-all group-hover:translate-x-1 group-hover:text-[#06B6D4]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Next step CTA */}
      <section className="rounded-2xl border border-[#06B6D4]/30 bg-gradient-to-br from-[#06B6D4]/10 to-transparent p-8 sm:p-10">
        <span className="text-xs font-mono uppercase tracking-wider text-[#06B6D4]">
          Recommended next step
        </span>
        <p className="mt-3 text-lg text-[#FAFAFA] leading-relaxed">{tier.nextStep}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/contact?engagement=ai-readiness-assessment"
            className="inline-flex items-center gap-2 rounded-lg bg-[#06B6D4] px-6 py-3 text-sm font-medium text-[#09090B] transition-all hover:bg-[#0891B2]"
          >
            Book a 30-minute call
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#27272A] bg-[#18181B] px-6 py-3 text-sm font-medium text-[#A1A1AA] transition-all hover:border-[#3F3F46] hover:text-[#FAFAFA]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retake the diagnostic
          </button>
        </div>
      </section>
    </div>
  )
}
