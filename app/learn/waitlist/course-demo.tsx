'use client'

import { useState } from 'react'
import styles from './waitlist.module.css'

type Step = { title: string; why: string; code: string; out: string }
type Project = { id: string; name: string; tag: string; goal: string; ship: string; steps: Step[] }

const PROJECTS: Project[] = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    tag: 'AI Engineering · Lab 03',
    goal: 'A chatbot that streams real AI replies — live on the web.',
    ship: 'https://your-bot.vercel.app',
    steps: [
      {
        title: 'Call the model',
        why: 'One API call and you’re talking to a frontier LLM.',
        code: "const res = await ai.chat({\n  model: 'claude-opus',\n  messages: [{ role: 'user', content: input }],\n})",
        out: 'Hey! What are we building today?',
      },
      {
        title: 'Stream it',
        why: 'Tokens appear as they generate — it feels alive, not frozen.',
        code: 'for await (const token of res.stream) {\n  ui.append(token)\n}',
        out: 'H · e · y · ! — token by token …',
      },
      {
        title: 'Give it memory',
        why: 'It remembers the whole conversation, not just your last line.',
        code: "history.push({ role: 'assistant', content: reply })\n// every turn now sees the full thread",
        out: 'Remembers your name, your stack, the context.',
      },
      {
        title: 'Ship it',
        why: 'Deploy to a real URL. Shareable. Yours.',
        code: '$ vercel --prod\n✓ deploying…',
        out: '✓ Live. Send the link to anyone.',
      },
    ],
  },
  {
    id: 'saas',
    name: 'Ship a SaaS',
    tag: 'Ship Real Products · Lab 09',
    goal: 'A full-stack app with auth, a database, and Stripe billing.',
    ship: 'https://your-saas.vercel.app',
    steps: [
      {
        title: 'Model the data',
        why: 'Your schema is the spine of the whole product.',
        code: 'create table projects (\n  id uuid primary key default gen_random_uuid(),\n  owner uuid references auth.users,\n  name text not null\n);',
        out: '✓ Table created · row-level security on',
      },
      {
        title: 'Add auth',
        why: 'Real users, real sessions — in a few lines.',
        code: "const { data } = await supabase.auth\n  .signInWithOtp({ email })",
        out: '✓ Magic link sent · logged in',
      },
      {
        title: 'Take payment',
        why: 'A checkout that actually charges money.',
        code: "const session = await stripe.checkout.sessions\n  .create({ mode: 'subscription', line_items })",
        out: '✓ $20/mo subscription · live',
      },
      {
        title: 'Ship it',
        why: 'One command. A real product on the internet.',
        code: '$ vercel --prod\n✓ deploying…',
        out: '✓ Live. Your first paying SaaS.',
      },
    ],
  },
]

export function CourseDemo() {
  const [pi, setPi] = useState(0)
  const [step, setStep] = useState(0)
  const project = PROJECTS[pi]
  const s = project.steps[step]
  const last = step === project.steps.length - 1
  const pct = ((step + 1) / project.steps.length) * 100

  const pick = (i: number) => {
    setPi(i)
    setStep(0)
  }

  return (
    <div className={styles.demo} data-reveal>
      {/* Project tabs */}
      <div className={styles.demoTabs} role="tablist" aria-label="Pick a project">
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === pi}
            className={`${styles.demoTab} ${i === pi ? styles.demoTabOn : ''}`}
            onClick={() => pick(i)}
          >
            {p.name}
          </button>
        ))}
        <span className={styles.demoTabNote}>One of 100+ guided labs</span>
      </div>

      {/* Lesson player */}
      <div className={styles.demoPlayer}>
        <div className={styles.demoBar}>
          <span className={styles.demoDots} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.demoTag}>{project.tag}</span>
          <span className={styles.demoProgress}>
            Step {step + 1} / {project.steps.length}
          </span>
        </div>
        <div className={styles.demoTrack} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>

        <div className={styles.demoBody}>
          {/* Left — the brief + current instruction */}
          <div className={styles.demoBrief}>
            <span className={styles.demoGoal}>{project.goal}</span>
            <h3 key={`${pi}-${step}-t`} className={styles.demoStepTitle}>
              {s.title}
            </h3>
            <p key={`${pi}-${step}-w`} className={styles.demoWhy}>
              {s.why}
            </p>
            <div className={styles.demoNav}>
              <button type="button" className={styles.demoBack} onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0}>
                ← Back
              </button>
              {last ? (
                <a className={styles.demoNext} href="#waitlist-hero">
                  Build 100+ like this →
                </a>
              ) : (
                <button type="button" className={styles.demoNext} onClick={() => setStep((v) => v + 1)}>
                  Next step →
                </button>
              )}
            </div>
          </div>

          {/* Right — the code + result */}
          <div className={styles.demoCode}>
            <pre key={`${pi}-${step}-c`} className={styles.demoPre}>
              <code>{s.code}</code>
            </pre>
            <div key={`${pi}-${step}-o`} className={`${styles.demoOut} ${last ? styles.demoOutShip : ''}`}>
              <span className={styles.demoOutLabel}>{last ? 'shipped' : 'output'}</span>
              {s.out}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
