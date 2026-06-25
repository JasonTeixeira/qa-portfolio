'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { isComplete, type PublicQuestion, type AssessmentKind } from '@/lib/academy/assessment-logic'
import { gainBand } from '@/lib/academy/efficacy-logic'
import { submitAssessmentResponses } from '@/app/academy/_actions/assessments'
import styles from './assessment.module.css'

const COPY: Record<AssessmentKind, { kicker: string; title: string; blurb: string }> = {
  pretest: {
    kicker: 'Baseline check',
    title: 'Where are you starting?',
    blurb: 'A quick baseline before you begin — there’s no pass/fail. It lets us measure exactly how much you gain.',
  },
  posttest: {
    kicker: 'Prove the gain',
    title: 'What can you do now?',
    blurb: 'The same kind of questions as your baseline — this is where your normalized learning gain gets measured.',
  },
}

const BAND_LABEL = { high: 'High gain', medium: 'Medium gain', low: 'Low gain', negative: 'No gain yet' }

export function AssessmentGate({
  courseSlug,
  kind,
  questions,
  nextHref,
  nextLabel,
}: {
  courseSlug: string
  kind: AssessmentKind
  questions: PublicQuestion[]
  nextHref: string
  nextLabel: string
}) {
  const [responses, setResponses] = useState<(number | null)[]>(() => questions.map(() => null))
  const [result, setResult] = useState<{ score: number; g: number | null } | null>(null)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()
  const copy = COPY[kind]

  function choose(qi: number, oi: number) {
    setResponses((prev) => prev.map((r, i) => (i === qi ? oi : r)))
  }

  function submit() {
    if (!isComplete(responses, questions)) return
    setError(false)
    startTransition(async () => {
      const res = await submitAssessmentResponses({
        courseSlug,
        kind,
        responses: responses.map((r) => r ?? -1),
      })
      if (res.ok && typeof res.score === 'number') setResult({ score: res.score, g: res.g ?? null })
      else setError(true)
    })
  }

  if (result) {
    return (
      <div className={styles.page}>
        <div className={styles.resultCard} data-kind={kind}>
          <span className={styles.resultKicker}>{kind === 'pretest' ? 'Baseline recorded' : 'Result'}</span>
          <span className={styles.scoreBig}>{result.score}%</span>
          {kind === 'posttest' && result.g !== null ? (
            <p className={styles.gainLine}>
              Learning gain <strong>g = {result.g.toFixed(2)}</strong> · {BAND_LABEL[gainBand(result.g)]}
            </p>
          ) : (
            <p className={styles.gainLine}>
              {kind === 'pretest'
                ? 'Baseline saved. Now go build — your gain is measured at the end.'
                : 'Result saved.'}
            </p>
          )}
          <Link href={nextHref} className={styles.cta}>
            {nextLabel}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <p className={styles.kicker}>{copy.kicker}</p>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.blurb}>{copy.blurb}</p>
      </header>

      <ol className={styles.questions}>
        {questions.map((q, qi) => (
          <li key={q.id} className={styles.question}>
            <p className={styles.prompt}>
              <span className={styles.qnum}>{qi + 1}</span>
              {q.prompt}
            </p>
            <div className={styles.options}>
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  className={styles.option}
                  data-selected={responses[qi] === oi}
                  onClick={() => choose(qi, oi)}
                  aria-pressed={responses[qi] === oi}
                >
                  <span className={styles.bullet} aria-hidden="true" />
                  {opt}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {error ? <p className={styles.err}>Something went wrong saving that — try again.</p> : null}

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.submit}
          onClick={submit}
          disabled={pending || !isComplete(responses, questions)}
        >
          {pending ? 'Saving…' : kind === 'pretest' ? 'Save baseline & start' : 'Submit & see my gain'}
        </button>
        <span className={styles.progress}>
          {responses.filter((r) => r !== null).length} / {questions.length} answered
        </span>
      </div>
    </div>
  )
}
