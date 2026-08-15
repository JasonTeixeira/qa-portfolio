'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveProfile } from '@/app/academy/interview/onboarding/_actions'
import styles from './onboarding.module.css'

/** A target level from interview_levels (real bar values, not invented). */
export type LevelOption = {
  slug: string
  name: string
  bar: number
  blurb: string
}

type Props = {
  levels: readonly LevelOption[]
}

type TimelineOption = {
  value: 'two_weeks' | 'six_weeks' | 'three_months' | 'no_date'
  name: string
  desc: string
  pace: string
  paceColor: string
}

const ROLES: readonly { name: string; meta: string; glyph: string }[] = [
  { name: 'Software Engineer', meta: 'coding · design · behavioral', glyph: '{ }' },
  { name: 'Frontend Engineer', meta: 'UI systems · coding · product sense', glyph: '◫' },
  { name: 'Data / ML Engineer', meta: 'pipelines · modeling · coding', glyph: '∿' },
  { name: 'Engineering Manager', meta: 'people · systems · behavioral-heavy', glyph: '⌘' },
  { name: 'Product Manager', meta: 'cases · metrics · behavioral', glyph: '◇' },
  { name: 'DevOps / SRE', meta: 'incidents · systems · debugging', glyph: '▣' },
]

const TIMELINES: readonly TimelineOption[] = [
  { value: 'two_weeks', name: '2 weeks', desc: 'Interview scheduled', pace: 'daily reps · intense', paceColor: 'var(--sa-danger)' },
  { value: 'six_weeks', name: '6 weeks', desc: 'Actively applying', pace: '4–5 reps/week', paceColor: 'var(--iv-gold-bright, #f0c36a)' },
  { value: 'three_months', name: '3 months', desc: 'Warming up', pace: '3 reps/week', paceColor: 'var(--sa-success)' },
  { value: 'no_date', name: 'No date yet', desc: 'Staying sharp', pace: '2 reps/week · maintenance', paceColor: 'var(--sa-success)' },
]

const CADENCE: Record<TimelineOption['value'], string> = {
  two_weeks: 'daily',
  six_weeks: '4–5×/week',
  three_months: '3×/week',
  no_date: '2×/week · maintenance',
}

const STEP_COPY: Record<number, { kicker: string; title: string; body: string }> = {
  1: {
    kicker: 'Step 1 · Role',
    title: 'What are you interviewing for?',
    body: 'This sets the question pool, the rubric weights, and which rounds your mocks include.',
  },
  2: {
    kicker: 'Step 2 · Level',
    title: 'Which bar should we hold you to?',
    body: 'Every score you see is relative to this bar. Honest placement beats flattering placement — you can move it later.',
  },
  3: {
    kicker: 'Step 3 · Timeline',
    title: 'When is the real one?',
    body: 'The plan works backwards from your date: heavier reps early, full loop simulations in the final stretch.',
  },
  4: {
    kicker: 'Step 4 · The job itself',
    title: 'Prep for a job, not an abstraction.',
    body: 'Name the job description you’re prepping against (optional) — mocks weight its stack and domain. Your cadence is set by your timeline.',
  },
  5: {
    kicker: 'Step 5 · Confirm',
    title: 'Locked. One mock to locate you.',
    body: 'Use your Sage evidence portfolio so Marlowe can probe your real shipped work — then review and lock it in.',
  },
}

const TUNES: readonly { glyph: string; title: string; body: string }[] = [
  { glyph: '◆', title: 'The interviewer', body: 'Marlowe calibrates pressure, follow-up depth, and patience to your target level.' },
  { glyph: '│', title: 'The bar on every chart', body: 'Scores mean nothing in a vacuum. Everything is measured against your level’s hiring bar.' },
  { glyph: '↻', title: 'The weekly plan', body: 'Track mix and rep frequency work backwards from your date — loops land in the final stretch.' },
]

const TOTAL_STEPS = 5

/**
 * The 5-step target wizard. Local state only; on finish it calls the saveProfile server action
 * (own-row RLS write, onboarded_at set) and routes to the cockpit, which then offers the first
 * mock. Nothing is fabricated — the level bars are the real interview_levels values.
 */
export function OnboardingWizard({ levels }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<string | null>(null)
  const [level, setLevel] = useState<string | null>(null)
  const [timeline, setTimeline] = useState<TimelineOption['value'] | null>(null)
  const [targetDate, setTargetDate] = useState('')
  const [jdFilename, setJdFilename] = useState('')
  const [useEvidence, setUseEvidence] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  const copy = STEP_COPY[step]
  const cadence = timeline ? CADENCE[timeline] : ''

  const levelName = useMemo(
    () => levels.find((l) => l.slug === level)?.name ?? null,
    [levels, level],
  )
  const timelineName = timeline ? TIMELINES.find((t) => t.value === timeline)?.name ?? null : null

  const canContinue =
    (step === 1 && !!role) ||
    (step === 2 && !!level) ||
    (step === 3 && !!timeline) ||
    step === 4 ||
    step === 5

  function goNext() {
    setError(null)
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
      return
    }
    finish()
  }

  function goBack() {
    setError(null)
    setStep((s) => Math.max(1, s - 1))
  }

  function finish() {
    if (!role || !level || !timeline) {
      setError('Complete role, level, and timeline first.')
      return
    }
    startSaving(async () => {
      const result = await saveProfile({
        targetRole: role,
        targetLevel: level,
        timeline,
        targetDate: targetDate.trim() || null,
        cadence,
        jdFilename: jdFilename.trim() || null,
        useEvidencePortfolio: useEvidence,
      })
      if (result.ok) {
        router.push('/academy/interview')
        return
      }
      setError('Could not save your target — please try again.')
    })
  }

  return (
    <div className={styles.layout}>
      {/* LEFT — the form */}
      <div>
        <div className={styles.stepCount}>
          step {step} of {TOTAL_STEPS} · ~3 min
        </div>
        <div className={styles.progress}>
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`${styles.progressSeg} ${n <= step ? styles.progressSegOn : ''}`}
            />
          ))}
        </div>

        <div className={styles.kicker}>{copy.kicker}</div>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.body}>{copy.body}</p>

        {step === 1 ? (
          <div className={styles.roleGrid}>
            {ROLES.map((r) => {
              const on = role === r.name
              return (
                <button
                  key={r.name}
                  type="button"
                  className={`${styles.optCard} ${on ? styles.optCardOn : ''}`}
                  onClick={() => setRole(r.name)}
                  aria-pressed={on}
                >
                  <div className={`${styles.optGlyph} ${on ? styles.optGlyphOn : ''}`}>{r.glyph}</div>
                  <div className={styles.optName}>{r.name}</div>
                  <div className={styles.optMeta}>{r.meta}</div>
                </button>
              )
            })}
          </div>
        ) : null}

        {step === 2 ? (
          <div className={styles.levelList}>
            {levels.map((l) => {
              const on = level === l.slug
              return (
                <button
                  key={l.slug}
                  type="button"
                  className={`${styles.levelRow} ${on ? styles.levelRowOn : ''}`}
                  onClick={() => setLevel(l.slug)}
                  aria-pressed={on}
                >
                  <span className={`${styles.levelTag} ${on ? styles.levelTagOn : ''}`}>
                    {l.slug.replace('_', ' ')}
                  </span>
                  <span className={styles.levelBody}>
                    <span className={styles.levelName}>{l.name}</span>
                    <span className={styles.levelDesc}>{l.blurb}</span>
                  </span>
                  <span className={styles.levelBar}>bar: {l.bar}</span>
                </button>
              )
            })}
          </div>
        ) : null}

        {step === 3 ? (
          <>
            <div className={styles.timeGrid}>
              {TIMELINES.map((t) => {
                const on = timeline === t.value
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`${styles.timeCard} ${on ? styles.timeCardOn : ''}`}
                    onClick={() => setTimeline(t.value)}
                    aria-pressed={on}
                  >
                    <div className={styles.timeName}>{t.name}</div>
                    <div className={styles.timeDesc}>{t.desc}</div>
                    <div className={styles.timePace} style={{ color: t.paceColor }}>
                      {t.pace}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel} htmlFor="target-date">
                Interview date (optional)
              </label>
              <input
                id="target-date"
                type="date"
                className={styles.textInput}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <div className={styles.fieldHint}>
                Give us a date and the plan tapers toward it. No date? Pick &ldquo;No date yet&rdquo;
                above for a maintenance cadence.
              </div>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <div className={styles.fieldBlock}>
              <label className={styles.fieldLabel} htmlFor="jd-filename">
                Job description (optional)
              </label>
              <input
                id="jd-filename"
                type="text"
                className={styles.textInput}
                value={jdFilename}
                onChange={(e) => setJdFilename(e.target.value)}
                placeholder="e.g. senior-swe-meridian.pdf"
                maxLength={200}
              />
              <div className={styles.fieldHint}>
                Name the JD you&rsquo;re targeting and mocks weight its stack, domain, and the signals
                that role gets probed on. Skip it and mocks stay great and generic.
              </div>
            </div>
            {timeline ? (
              <div className={styles.fieldBlock}>
                <label className={styles.fieldLabel}>Your cadence</label>
                <span className={styles.cadencePill}>◆ {cadence}</span>
                <div className={styles.fieldHint}>
                  Set by your timeline ({timelineName}). Change your timeline to change the cadence.
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        {step === 5 ? (
          <>
            <button
              type="button"
              className={`${styles.toggleRow} ${useEvidence ? styles.toggleRowOn : ''}`}
              onClick={() => setUseEvidence((v) => !v)}
              aria-pressed={useEvidence}
            >
              <span className={`${styles.toggleBox} ${useEvidence ? styles.toggleBoxOn : ''}`}>
                {useEvidence ? '✓' : ''}
              </span>
              <span>
                <span className={styles.toggleTitle}>Also use my Sage evidence portfolio</span>
                <span className={styles.toggleDesc}>
                  Marlowe asks behavioral questions about YOUR real projects — the decision memos and
                  proofs you&rsquo;ve already shipped here.
                </span>
              </span>
            </button>
            <div className={styles.reviewCard}>
              <div className={styles.reviewKicker}>Your plan, built</div>
              <div className={styles.reviewGrid}>
                <div>
                  <div className={styles.reviewLabel}>Target</div>
                  <div className={styles.reviewValue}>
                    {role ?? '—'} · {levelName ?? '—'}
                  </div>
                </div>
                <div>
                  <div className={styles.reviewLabel}>Timeline</div>
                  <div className={styles.reviewValue}>{timelineName ?? '—'}</div>
                </div>
                <div>
                  <div className={styles.reviewLabel}>Cadence</div>
                  <div className={styles.reviewValue}>{cadence || '—'}</div>
                </div>
                <div>
                  <div className={styles.reviewLabel}>Tuned to</div>
                  <div className={styles.reviewValue}>
                    {jdFilename.trim()
                      ? 'your JD + portfolio'
                      : useEvidence
                        ? 'your evidence portfolio'
                        : 'generic — add a JD anytime'}
                  </div>
                </div>
              </div>
              <div className={styles.reviewFoot}>
                First up: a placement mock to locate you against the {levelName ?? 'target'} bar. No
                prep — that&rsquo;s the point. Your readiness score and personal plan come out the
                other side.
              </div>
            </div>
          </>
        ) : null}

        <div className={styles.navRow}>
          {step > 1 ? (
            <button type="button" className={styles.backBtn} onClick={goBack} disabled={saving}>
              ← Back
            </button>
          ) : null}
          <button
            type="button"
            className={styles.nextBtn}
            onClick={goNext}
            disabled={!canContinue || saving}
          >
            {step === TOTAL_STEPS ? (saving ? 'Saving…' : 'Save my target →') : 'Continue →'}
          </button>
          {error ? (
            <span className={styles.navError} role="alert">
              {error}
            </span>
          ) : step < TOTAL_STEPS ? (
            <span className={styles.navHint}>
              {step === 4 ? 'add a JD, or continue — your call' : 'pick one to continue'}
            </span>
          ) : null}
        </div>
      </div>

      {/* RIGHT — what your choice tunes */}
      <aside className={styles.aside}>
        <div className={styles.asideKicker}>What this tunes</div>
        <div className={styles.asideList}>
          {TUNES.map((tn) => (
            <div key={tn.title} className={styles.asideItem}>
              <span className={styles.asideGlyph}>{tn.glyph}</span>
              <div>
                <div className={styles.asideTitle}>{tn.title}</div>
                <div className={styles.asideBody}>{tn.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.asideFoot}>
          You can change target, level, and date any time in Settings — the plan re-plans itself.
        </div>
      </aside>
    </div>
  )
}
