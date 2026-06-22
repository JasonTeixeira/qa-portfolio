'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import type { AcademyPlan, PlanInterval } from '@/lib/academy/plans'
import styles from './join.module.css'

const FEATURES = [
  'Every course, path, and future release',
  'Hands-on in-browser labs — write and run real code',
  'Quizzes and checkpoints that verify your work',
  'Earn shareable certificates as you finish',
  'Progress tracking and a personal learner dashboard',
  'Cancel anytime — keep access through the period you paid for',
]

export function JoinClient({
  plans,
  alreadyMember,
  signedIn,
}: {
  plans: Record<PlanInterval, AcademyPlan>
  alreadyMember: boolean
  signedIn: boolean
}) {
  const [interval, setInterval] = useState<PlanInterval>('yearly')
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')
  const plan = plans[interval]

  if (alreadyMember) {
    return (
      <div className={styles.root}>
        <div className={styles.wrap}>
          <div className={styles.member}>
            <div className={styles.memberGlyph}>✓</div>
            <h1 className={styles.h1} style={{ fontSize: '2rem', margin: '0.6rem 0' }}>You&rsquo;re all-access</h1>
            <p className={styles.sub} style={{ margin: '0 auto' }}>
              Your membership is active. Every course, lab, and certificate is unlocked.
            </p>
            <Link href="/academy/dashboard" className={styles.memberLink}>Go to your dashboard →</Link>
          </div>
        </div>
      </div>
    )
  }

  const subscribe = () => {
    setMsg('')
    start(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'academy_allaccess', interval }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.status === 401 && data.signIn) {
          window.location.href = data.signIn
          return
        }
        if (res.ok && data.url) {
          window.location.href = data.url
          return
        }
        setMsg(data.error ?? "Couldn't start checkout. Please try again.")
      } catch {
        setMsg('Network error. Please try again.')
      }
    })
  }

  return (
    <div className={styles.root}>
      <div className={styles.wrap}>
        <span className={styles.kicker}>◆ Sage Academy · All-access</span>
        <h1 className={styles.h1}>Learn to build with AI — <em>everything, unlocked</em></h1>
        <p className={styles.sub}>
          One membership opens every course, every hands-on lab, and every certificate. Learn by
          actually building — not by watching.
        </p>

        <div className={styles.toggle} role="tablist" aria-label="Billing interval">
          <button role="tab" aria-selected={interval === 'monthly'} data-on={interval === 'monthly'} onClick={() => setInterval('monthly')}>
            Monthly
          </button>
          <button role="tab" aria-selected={interval === 'yearly'} data-on={interval === 'yearly'} onClick={() => setInterval('yearly')}>
            Yearly<span className={styles.save}>2 months free</span>
          </button>
        </div>

        <div className={styles.card}>
          <div className={styles.cardMain}>
            <span className={styles.planName}>All-access · {interval}</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>{plan.price}</span>
              <span className={styles.cadence}>{plan.cadence}</span>
            </div>
            <p className={styles.note}>{plan.note ?? ' '}</p>
            <ul className={styles.features}>
              {FEATURES.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
          <div className={styles.cardSide}>
            <button type="button" className={styles.cta} onClick={subscribe} disabled={pending} aria-busy={pending}>
              {pending ? 'Starting…' : signedIn ? `Start ${interval} membership →` : 'Sign in & subscribe →'}
            </button>
            <p className={styles.fine}>
              Secure checkout by Stripe. {interval === 'yearly' ? 'Billed $200/year.' : 'Billed $20/month.'} Cancel anytime.
            </p>
            <p className={styles.msg} role="status" aria-live="polite">{msg}</p>
          </div>
        </div>

        <div className={styles.guarantee}>
          <span>⬡ Cancel anytime</span>
          <span>◇ Keep access through the paid period</span>
          <span>✓ New courses included</span>
        </div>
      </div>
    </div>
  )
}
