'use client'

import { useState, useTransition } from 'react'
import { completeOnboarding } from '@/app/(main)/academy/_actions/onboarding'
import { GoalPicker } from '@/components/academy/goals/GoalPicker'
import { Icon } from '@/components/academy/ui/Icon'
import { Course00 } from './Course00'
import styles from './onboarding.module.css'

const GOALS = [
  { key: 'ship', label: 'Ship an AI product', sub: 'Founder / indie hacker' },
  { key: 'engineer', label: 'Become an AI engineer', sub: 'Land the role' },
  { key: 'levelup', label: 'Level up my dev skills', sub: 'Go deeper, build more' },
  { key: 'explore', label: 'Just exploring', sub: 'Curious what this is' },
]

const CALIBRATION = [
  { key: 'new', label: 'New to coding', sub: 'Starting fresh' },
  { key: 'some', label: 'Some experience', sub: 'I can write basic code' },
  { key: 'experienced', label: 'Experienced dev', sub: 'I ship code already' },
]

const GOAL_XP = [
  { xp: 20, label: 'Casual', sub: '~1 lesson / day' },
  { xp: 40, label: 'Regular', sub: '~2 lessons / day', recommended: true },
  { xp: 60, label: 'Serious', sub: '~3 lessons / day' },
]

/** The three-move welcome deck — the operator's authored intro (design-verbatim copy). */
const MOVES = [
  {
    num: '01 · LEARN BY DOING',
    numTone: 'accent' as const,
    title: 'Lessons end in labs',
    text: 'The starter code fails on purpose. Your fix is the lesson.',
  },
  {
    num: '02 · PROVE IT',
    numTone: 'green' as const,
    title: 'No vibes, ever',
    text: 'Every claim gets a check a skeptic can run. Proofs stack into a ledger you can show anyone.',
  },
  {
    num: '03 · KEEP IT',
    numTone: 'gold' as const,
    title: 'Six minutes a day',
    text: 'Spaced recall at 1 / 3 / 7 / 30 days, so it holds under pressure — not just until Friday.',
  },
]

/** Four progress dots that track the four setup steps (step 0 is the welcome deck). */
const DOTS = [0, 1, 2, 3]

const CRUMBS = ['how it works', 'your goal', 'your pace', 'your route']

type Props = {
  /** The learner's already-chosen commitment goal (pre-selects the GoalPicker). */
  initialGoalKey?: string | null
}

export function OnboardingFlow({ initialGoalKey = null }: Props) {
  const [showPrimer, setShowPrimer] = useState(true)
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<string | null>(null)
  const [commitmentGoal, setCommitmentGoal] = useState<string | null>(initialGoalKey)
  const [calibration, setCalibration] = useState<string | null>(null)
  const [dailyGoalXp, setDailyGoalXp] = useState<number | null>(null)
  const [pending, start] = useTransition()

  const finish = () => {
    if (!goal || !calibration || !dailyGoalXp) return
    start(() => {
      void completeOnboarding({ goal, calibrationLevel: calibration, dailyGoalXp })
    })
  }

  const shell = (children: React.ReactNode) => (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <span className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">◆</span>
          <span className={styles.brandName}>Sage Academy</span>
        </span>
        <span className={styles.breadcrumb}>
          setup · {showPrimer ? 'how it works' : CRUMBS[Math.min(step, CRUMBS.length - 1)]} · ~2 min
        </span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )

  if (showPrimer) {
    return shell(
      <div className={styles.primerShell}>
        <Course00 />
        <div className={styles.primerActions}>
          <button type="button" className={styles.primary} onClick={() => setShowPrimer(false)}>
            Continue — set up my account <Icon name="arrow-right" size={16} />
          </button>
        </div>
      </div>,
    )
  }

  return shell(
    <div className={styles.shell}>
      <div className={styles.dots} aria-hidden="true">
        {DOTS.map((i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'off'
          return <span key={i} className={styles.dot} data-state={state} />
        })}
      </div>

      {step === 0 && (
        <section className={styles.step}>
          <div className={styles.center}>
            <p className={styles.kicker}>Welcome — here&rsquo;s the whole system</p>
            <h1 className={styles.title}>Three moves. Everything else is detail.</h1>
          </div>
          <div className={styles.cards}>
            {MOVES.map((m) => (
              <div
                key={m.num}
                className={m.numTone === 'green' ? `${styles.card} ${styles.cardAccentGreen}` : styles.card}
              >
                <div
                  className={`${styles.cardNum} ${
                    m.numTone === 'green'
                      ? styles.cardNumGreen
                      : m.numTone === 'gold'
                        ? styles.cardNumGold
                        : ''
                  }`}
                >
                  {m.num}
                </div>
                <div className={styles.cardTitle}>{m.title}</div>
                <div className={styles.cardText}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={() => setStep(1)}>
              Got it →
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className={styles.step}>
          <div className={styles.center}>
            <p className={styles.kicker}>Step 1 of 4 — your goal</p>
            <h1 className={styles.title}>What do you want to build?</h1>
          </div>
          <div className={styles.options}>
            {GOALS.map((g) => (
              <button
                key={g.key}
                type="button"
                data-on={goal === g.key}
                className={styles.option}
                onClick={() => {
                  setGoal(g.key)
                  setStep(2)
                }}
              >
                <span className={styles.optLabel}>{g.label}</span>
                <span className={styles.optSub}>{g.sub}</span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.back} onClick={() => setStep(0)}>
              <Icon name="arrow-left" size={14} /> Back
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className={styles.step}>
          <div className={styles.center}>
            <p className={styles.kicker}>Step 2 of 4 — your pace</p>
            <h1 className={styles.title}>What do you want to achieve?</h1>
            <p className={styles.lede}>
              Pick a goal to commit to. We&rsquo;ll track your progress toward it — you can change it anytime.
            </p>
          </div>
          <GoalPicker
            initialGoalKey={commitmentGoal}
            onSaved={(key) => {
              setCommitmentGoal(key)
              setStep(3)
            }}
          />
          <div className={styles.actions}>
            {commitmentGoal ? (
              <button type="button" className={styles.primary} onClick={() => setStep(3)}>
                Continue <Icon name="arrow-right" size={16} />
              </button>
            ) : null}
            <button type="button" className={styles.back} onClick={() => setStep(1)}>
              <Icon name="arrow-left" size={14} /> Back
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className={styles.step}>
          <div className={styles.center}>
            <p className={styles.kicker}>Step 3 of 4 — your route</p>
            <h1 className={styles.title}>Where are you starting?</h1>
          </div>
          <div className={styles.options}>
            {CALIBRATION.map((c) => (
              <button
                key={c.key}
                type="button"
                data-on={calibration === c.key}
                className={styles.option}
                onClick={() => {
                  setCalibration(c.key)
                  setStep(4)
                }}
              >
                <span className={styles.optLabel}>{c.label}</span>
                <span className={styles.optSub}>{c.sub}</span>
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.back} onClick={() => setStep(2)}>
              <Icon name="arrow-left" size={14} /> Back
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className={styles.step}>
          <div className={styles.center}>
            <p className={styles.kicker}>Step 4 of 4 — done</p>
            <h1 className={styles.title}>Set your daily goal.</h1>
            <p className={styles.lede}>
              A small daily commitment is what builds the habit. You can change it anytime.
            </p>
          </div>
          <div className={styles.goals}>
            {GOAL_XP.map((g) => (
              <button
                key={g.xp}
                type="button"
                data-on={dailyGoalXp === g.xp}
                className={styles.goalCard}
                onClick={() => setDailyGoalXp(g.xp)}
              >
                {g.recommended ? <span className={styles.recommend}>Recommended</span> : null}
                <span className={styles.goalLabel}>{g.label}</span>
                <span className={styles.goalXp}>{g.xp} XP</span>
                <span className={styles.goalSub}>{g.sub}</span>
              </button>
            ))}
          </div>
          <p className={styles.firstWin}>
            Next: we put your first step on the board right now — a real start toward your goal, before
            you read a single lesson.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!dailyGoalXp || pending}
              onClick={finish}
            >
              {pending ? 'Setting up…' : <>Claim my first win <Icon name="arrow-right" size={16} /></>}
            </button>
            <button type="button" className={styles.back} onClick={() => setStep(3)}>
              <Icon name="arrow-left" size={14} /> Back
            </button>
          </div>
        </section>
      )}
    </div>,
  )
}
