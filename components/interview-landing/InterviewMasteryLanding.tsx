'use client'

/**
 * Interview Mastery — public marketing page.
 * Implemented from "Sage Interview Mastery.dc.html" (Claude Design, 2026-07-12).
 * Gold sub-brand on the shared Academy foundation (#0B0B0E · Fraunces/Hanken/Mono).
 *
 * Honesty note: the design mock carried illustrative member stats and quotes.
 * Pre-launch we ship only claims we can stand behind — the sample debrief is
 * labeled as a sample; there are no invented member counts or testimonials.
 */

import { useState } from 'react'
import Link from 'next/link'
import styles from './interview-landing.module.css'


const STEPS = [
  { num: '01', title: 'Placement mock', body: 'One real voice interview, no prep. It locates you honestly: readiness score, level read, and your weakest dimension.' },
  { num: '02', title: 'Personal plan', body: 'A week-by-week plan built from your gaps and your timeline — target role, target level, target date.' },
  { num: '03', title: 'Unlimited reps', body: 'Voice-first mocks with an interviewer that adapts, interrupts, and pressure-tests — calibrated to your target bar.' },
  { num: '04', title: 'Debrief → drill', body: 'Every session ends in a scored debrief with timestamped moments, then drills that attack the weakest skill first.' },
]

const TRACKS = [
  { glyph: '{ }', title: 'Coding', body: 'Live problem solving with a real editor and hidden tests. Scored on approach, correctness, and how you verify — not just whether it runs.', meta: 'DS&A · debugging · code review rounds' },
  { glyph: '◫', title: 'System design', body: 'Open-ended design under follow-up pressure. Tradeoffs, capacity math, failure modes — the interviewer digs where you hand-wave.', meta: 'APIs · scale · reliability · migrations' },
  { glyph: '“ ”', title: 'Behavioral', body: 'Your real stories, structured until they land. A STAR story bank that maps each story to the signals companies actually probe.', meta: 'leadership · conflict · failure · ownership' },
  { glyph: '$', title: 'Screens & negotiation', body: 'Recruiter screens, comp conversations, and offer negotiation — rehearsed until the numbers conversation feels routine.', meta: 'recruiter calls · comp · competing offers' },
]

const RUBRIC = [
  { name: 'Problem framing', score: '84 · above bar', pct: 84, tone: 'good' as const },
  { name: 'Communication', score: '81 · above bar', pct: 81, tone: 'good' as const },
  { name: 'Technical depth', score: '76 · at bar', pct: 76, tone: 'warn' as const },
  { name: 'Tradeoff judgment', score: '72 · near bar', pct: 72, tone: 'warn' as const },
  { name: 'Verification habit', score: '58 · below bar · caps your score', pct: 58, tone: 'bad' as const },
  { name: 'Composure under pressure', score: '79 · above bar', pct: 79, tone: 'good' as const },
]

const COMPARE = [
  { what: 'Reps per month', human: '4–6 sessions (~$150/hr)', sage: 'Unlimited, any hour, any timezone' },
  { what: 'Feedback', human: 'Notes after the call', sage: 'Scored debrief, timestamped transcript, speech analytics' },
  { what: 'Consistency', human: 'Varies by coach and day', sage: 'Same rubric every time — progress is measurable' },
  { what: 'Pressure calibration', human: 'Usually too nice', sage: 'Dial it: warm → adversarial, tuned to your level' },
  { what: 'Cost per month', human: '$600–1,200', sage: '$39 (or $24 annual)' },
]

const FAQ = [
  { q: 'Is talking to an AI interviewer actually like the real thing?', a: 'For the parts that matter — thinking out loud under follow-up pressure, being interrupted, defending a decision — yes, and you can rehearse them 40 times instead of 4. What it can’t simulate: a specific interviewer’s mood. No prep can.' },
  { q: 'Will it just flatter me so I keep subscribing?', a: 'No — flattery would kill the product. Scores are capped by your weakest dimension and verdicts use real committee language, including "no hire." The guarantee only works because the scoring is honest.' },
  { q: 'I’m interviewing in two weeks. Is it too late?', a: 'Two weeks of daily reps is enough to fix your two costliest habits and run three full loop simulations. Set your date in onboarding and the plan compresses around it.' },
  { q: 'Does it cover non-engineering roles?', a: 'Today: software engineering, frontend, data/ML, DevOps/SRE, engineering management, and product management. Behavioral and negotiation tracks work for any role.' },
  { q: 'What happens to my recordings?', a: 'They’re yours. Transcripts and audio live in your account, power your debriefs, and can be deleted any time. They’re never used to train models or shown to other members.' },
]

export function InterviewMasteryLanding() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const annual = billing === 'annual'

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* ── hero ── */}
        <section className={styles.hero} id="hero">
          <div>
            <div className={styles.pill}>◆ Premium · add-on to any Sage plan</div>
            <h1 className={styles.h1}>The interview is a skill. Master it like one.</h1>
            <p className={styles.lede}>
              Unlimited voice-first mock interviews with an AI interviewer that pushes back like a
              real one — scored against the bar for your target level, from internship to senior.
              Every session ends with a debrief and a drill plan.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/academy/interview/onboarding" className={`${styles.goldCta} ${styles.goldCtaLg} ${styles.pulse}`}>
                Take the placement mock — free
              </Link>
              <span className={styles.mono}>then {annual ? '$24/mo billed annually' : '$39/mo'} · cancel anytime</span>
            </div>
            <div className={styles.heroStats}>
              <div><div className={styles.statNum}>40&gt;4</div><div className={styles.statLbl}>reps beat rehearsals — the whole thesis</div></div>
              <div><div className={styles.statNum}>6</div><div className={styles.statLbl}>dimensions scored, zero flattery</div></div>
              <div><div className={styles.statNum}>4</div><div className={styles.statLbl}>tracks · intern → senior bars</div></div>
            </div>
          </div>

          {/* live session preview card */}
          <div className={styles.sessionCard} aria-label="Sample of a live mock session">
            <div className={styles.sessionHead}>
              <span className={styles.sessionLive}>● Live mock · System design · L5 bar</span>
              <span className={styles.monoDim}>32:14</span>
            </div>
            <div className={styles.sessionBody}>
              <div className={styles.msgRow}>
                <span className={styles.aiAvatar} aria-hidden />
                <div className={styles.aiBubble}>
                  Your fan-out doubles at 10× traffic. What breaks first — and how do you know
                  before it does?
                </div>
              </div>
              <div className={`${styles.msgRow} ${styles.msgRowUser}`}>
                <span className={styles.userAvatar}>YOU</span>
                <div className={styles.userBubble}>
                  The notification fan-out — it’s synchronous. I’d watch p99 on the write path and
                  shard by…
                </div>
              </div>
              <div className={styles.listenBar}>
                <span className={styles.eq} aria-hidden>
                  <span /><span /><span /><span /><span />
                </span>
                <span className={styles.monoDim}>listening · transcript live · pressure: calibrated to L5</span>
              </div>
            </div>
            <div className={styles.sessionMetrics}>
              <div><b className={styles.good}>142</b><i>wpm pace</i></div>
              <div><b className={styles.gold}>3</b><i>fillers/min</i></div>
              <div><b className={styles.good}>high</b><i>signal density</i></div>
              <div><b className={styles.goldBright}>82</b><i>readiness</i></div>
            </div>
          </div>
        </section>

        {/* proof strip — honest version */}
        <div className={styles.proofStrip}>
          <span>Built on the Sage honest-scoring engine</span>
          <span className={styles.proofItem}>server-scored rubrics</span>
          <span className={styles.proofItem}>committee-language verdicts</span>
          <span className={styles.proofItem}>your data stays yours</span>
        </div>

        {/* ── how it works ── */}
        <section id="how" className={styles.section}>
          <div className={styles.kicker}>The system</div>
          <h2 className={styles.h2}>Not question banks. A training loop that converges on the offer.</h2>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.num} className={styles.card}>
                <span className={styles.stepNum}>{s.num}</span>
                <div className={styles.cardTitle}>{s.title}</div>
                <p className={styles.cardBody}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── coverage ── */}
        <section id="tracks-sec" className={styles.section}>
          <div className={styles.rowBetween}>
            <div>
              <div className={styles.kicker}>Coverage</div>
              <h2 className={styles.h2}>Every round of the loop. Every level of the ladder.</h2>
            </div>
            <span className={styles.monoDim}>bars: Intern → New grad → Mid → Senior</span>
          </div>
          <div className={styles.tracks}>
            {TRACKS.map((t) => (
              <div key={t.title} className={`${styles.card} ${styles.trackCard}`}>
                <span className={styles.trackGlyph}>{t.glyph}</span>
                <div className={styles.cardTitle}>{t.title}</div>
                <p className={styles.cardBody}>{t.body}</p>
                <div className={styles.trackMeta}>{t.meta}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── what gets measured ── */}
        <section className={styles.section}>
          <div className={styles.metricsPanel}>
            <div>
              <div className={styles.kicker}>Honest scoring, like everything at Sage</div>
              <h2 className={styles.h2}>One readiness score. Six dimensions. Zero flattery.</h2>
              <p className={styles.cardBody} style={{ fontSize: 15, marginTop: 16 }}>
                Scored against the real hiring bar for your target level and role — not a
                participation grade. Your score is capped by your weakest dimension, so the plan
                always attacks the thing actually holding you back.
              </p>
              <span className={styles.sampleTag}>sample debrief — illustrative scores</span>
            </div>
            <div className={styles.rubric}>
              {RUBRIC.map((r) => (
                <div key={r.name}>
                  <div className={styles.rubricHead}>
                    <span>{r.name}</span>
                    <span className={`${styles.mono} ${styles[r.tone]}`}>{r.score}</span>
                  </div>
                  <div className={styles.rubricTrack}>
                    <div className={`${styles.rubricFill} ${styles[`fill_${r.tone}`]}`} style={{ width: `${r.pct}%` }} />
                    <div className={styles.rubricBarMark} title="the bar for your target level" />
                  </div>
                </div>
              ))}
              <div className={`${styles.monoDim} ${styles.right}`}>│ = the bar for your target level</div>
            </div>
          </div>
        </section>

        {/* ── pricing ── */}
        <section id="pricing-sec" className={styles.section}>
          <div className={styles.center}>
            <div className={styles.kicker}>Pricing</div>
            <h2 className={styles.h2}>Costs less than one hour of human coaching.</h2>
            <div className={styles.billingToggle} role="group" aria-label="Billing period">
              <button type="button" className={annual ? '' : styles.billingActive} onClick={() => setBilling('monthly')}>Monthly</button>
              <button type="button" className={annual ? styles.billingActive : ''} onClick={() => setBilling('annual')}>Annual · save 38%</button>
            </div>
          </div>
          <div className={styles.pricing}>
            <div className={styles.card}>
              <div className={styles.kickerDim}>Included with every Sage plan</div>
              <div className={styles.priceTitle}>The free placement mock</div>
              <div className={styles.priceList}>
                <span>· One full voice mock, any track</span>
                <span>· Your readiness score + level read</span>
                <span>· A sample debrief with drill plan</span>
              </div>
              <Link href="/academy/interview/onboarding" className={styles.ghostCta}>Take it now</Link>
            </div>
            <div className={`${styles.card} ${styles.priceCardGold}`}>
              <span className={styles.priceBadge}>Most members</span>
              <div className={styles.kicker}>Interview Mastery · add-on</div>
              <div className={styles.priceRow}>
                <span className={styles.price}>{annual ? '$24' : '$39'}</span>
                <span className={styles.monoDim}>{annual ? '/mo · billed $290/yr' : '/mo · added to your plan'}</span>
              </div>
              <div className={styles.featureGrid}>
                <span>· Unlimited AI mock interviews</span>
                <span>· All four tracks, intern → senior</span>
                <span>· Voice, transcript & speech analytics</span>
                <span>· Full onsite loop simulations</span>
                <span>· Debrief + drill plan every session</span>
                <span>· STAR story bank & offer tracker</span>
                <span>· Company-style round presets</span>
                <span>· Negotiation rehearsal rounds</span>
              </div>
              <div className={styles.priceCtas}>
                <Link href="/academy/interview/checkout" className={styles.goldCta}>Add to my plan</Link>
                <Link href="/academy/guarantee" className={styles.monoDim} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>14-day loop-ready guarantee</Link>
              </div>
            </div>
          </div>
          <p className={styles.guaranteeNote}>
            Loop-ready guarantee: if your readiness score hasn’t moved after 14 days of following
            your plan, the add-on is free until it does.
          </p>
        </section>

        {/* ── vs human coaching ── */}
        <section className={styles.section}>
          <div className={styles.center}>
            <div className={styles.kicker}>The honest comparison</div>
            <h2 className={styles.h2}>A great human coach is wonderful. You need 40 reps, not 4.</h2>
          </div>
          <div className={styles.compare}>
            <div className={`${styles.compareRow} ${styles.compareHead}`}>
              <div />
              <div>Human coach</div>
              <div className={styles.gold}>Interview Mastery</div>
            </div>
            {COMPARE.map((c) => (
              <div key={c.what} className={styles.compareRow}>
                <div className={styles.compareWhat}>{c.what}</div>
                <div className={styles.compareHuman}>{c.human}</div>
                <div className={styles.compareSage}>{c.sage}</div>
              </div>
            ))}
            <div className={styles.compareFoot}>
              Where a human wins — reading a specific company’s politics, referrals, gut feel — we
              say so. That’s not this product.
            </div>
          </div>
        </section>

        {/* ── principle band (replaces mock testimonials pre-launch) ── */}
        <section className={styles.section}>
          <div className={styles.principleBand}>
            <div className={styles.principleQuote}>
              “The room stops being scary when you’ve been in it forty times.”
            </div>
            <div className={styles.monoDim}>— the design principle behind everything on this page</div>
          </div>
        </section>

        {/* ── B2B ── */}
        <section className={styles.section}>
          <div className={styles.b2b}>
            <div>
              <div className={styles.kickerDim}>For bootcamps, universities & career services</div>
              <h2 className={styles.h2} style={{ fontSize: 'clamp(24px, 2.8vw, 34px)' }}>
                Your placement rate is your product. We’re the training ground.
              </h2>
              <p className={styles.cardBody} style={{ marginTop: 14, maxWidth: '58ch' }}>
                Cohort seats with an instructor view: aggregate readiness, common weak dimensions
                across the cohort, and anonymized session insights — never individual transcripts.
                From $12/seat/mo at 25+ seats.
              </p>
            </div>
            <div className={styles.b2bCtas}>
              <a href="mailto:teams@sageideas.dev" className={styles.ghostCta}>Talk to us about cohort seats</a>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className={`${styles.section} ${styles.faqSection}`}>
          <h2 className={styles.h2}>Honest answers</h2>
          <div>
            {FAQ.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.q}</div>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── closing ── */}
        <section className={`${styles.section} ${styles.center}`}>
          <h2 className={styles.closing}>Your next interview shouldn’t be the practice one.</h2>
          <p className={styles.lede} style={{ maxWidth: '46ch', margin: '16px auto 0' }}>
            Do the reps here — where a rough answer costs nothing and teaches everything.
          </p>
          <Link href="/academy/interview/onboarding" className={`${styles.goldCta} ${styles.goldCtaLg}`} style={{ marginTop: 28 }}>
            Start your first mock
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Sage Academy · Interview Mastery</span>
        <Link href="/pricing">Plans</Link>
        <Link href="/academy/help">Help</Link>
        <Link href="/academy/legal">Legal</Link>
        <span className={styles.footRight}>proof over promises · © {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
