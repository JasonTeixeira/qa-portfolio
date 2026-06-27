'use client'

import { useState, useTransition } from 'react'
import { completeOnboarding } from '@/app/academy/_actions/onboarding'
import { GoalPicker } from '@/components/academy/goals/GoalPicker'
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

const LOOP = [
  { glyph: '◆', label: 'Learn', sub: 'Tight, no-fluff concepts' },
  { glyph: '⌘', label: 'Build', sub: 'Real code in the browser' },
  { glyph: '↻', label: 'Review', sub: 'Spaced so it sticks' },
  { glyph: '✦', label: 'Prove', sub: 'Certs + a proof-of-work record' },
]

const STEPS = 5

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

  if (showPrimer) {
    return (
      <div className={styles.page}>
        <div className={styles.primerShell}>
          <Course00 />
          <div className={styles.primerActions}>
            <button type="button" className={styles.primary} onClick={() => setShowPrimer(false)}>
              Continue — set up my account →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.track} aria-hidden="true">
          {Array.from({ length: STEPS }).map((_, i) => (
            <span key={i} data-on={i <= step} />
          ))}
        </div>

        {step === 0 && (
          <section className={styles.stepCard}>
            <p className={styles.kicker}>How Sage Academy works</p>
            <h1 className={styles.title}>You don’t watch. You build — and it sticks.</h1>
            <p className={styles.lede}>The whole loop in 30 seconds:</p>
            <div className={styles.loop}>
              {LOOP.map((l, i) => (
                <div key={l.label} className={styles.loopStep}>
                  <span className={styles.loopGlyph} aria-hidden="true">{l.glyph}</span>
                  <span className={styles.loopLabel}>{l.label}</span>
                  <span className={styles.loopSub}>{l.sub}</span>
                  {i < LOOP.length - 1 ? <span className={styles.loopArrow} aria-hidden="true">→</span> : null}
                </div>
              ))}
            </div>
            <p className={styles.loopFoot}>
              …and a <strong>daily streak</strong> + <strong>XP</strong> keep you moving. Miss a day? A streak freeze has your back.
            </p>
            <button type="button" className={styles.primary} onClick={() => setStep(1)}>
              Got it — set me up →
            </button>
          </section>
        )}

        {step === 1 && (
          <section className={styles.stepCard}>
            <p className={styles.kicker}>Step 1 of 4</p>
            <h1 className={styles.title}>What do you want to build?</h1>
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
            <button type="button" className={styles.back} onClick={() => setStep(0)}>← Back</button>
          </section>
        )}

        {step === 2 && (
          <section className={styles.stepCard}>
            <p className={styles.kicker}>Step 2 of 4</p>
            <h1 className={styles.title}>What do you want to achieve?</h1>
            <p className={styles.lede}>Pick a goal to commit to. We’ll track your progress toward it — you can change it anytime.</p>
            <GoalPicker
              initialGoalKey={commitmentGoal}
              onSaved={(key) => {
                setCommitmentGoal(key)
                setStep(3)
              }}
            />
            {commitmentGoal ? (
              <button type="button" className={styles.primary} onClick={() => setStep(3)}>
                Continue →
              </button>
            ) : null}
            <button type="button" className={styles.back} onClick={() => setStep(1)}>← Back</button>
          </section>
        )}

        {step === 3 && (
          <section className={styles.stepCard}>
            <p className={styles.kicker}>Step 3 of 4</p>
            <h1 className={styles.title}>Where are you starting?</h1>
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
            <button type="button" className={styles.back} onClick={() => setStep(2)}>← Back</button>
          </section>
        )}

        {step === 4 && (
          <section className={styles.stepCard}>
            <p className={styles.kicker}>Step 4 of 4</p>
            <h1 className={styles.title}>Set your daily goal.</h1>
            <p className={styles.lede}>A small daily commitment is what builds the habit. You can change it anytime.</p>
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
              Next: we put your first step on the board right now — a real start toward
              your goal, before you read a single lesson.
            </p>
            <button type="button" className={styles.primary} disabled={!dailyGoalXp || pending} onClick={finish}>
              {pending ? 'Setting up…' : 'Claim my first win →'}
            </button>
            <button type="button" className={styles.back} onClick={() => setStep(3)}>← Back</button>
          </section>
        )}
      </div>
    </div>
  )
}
