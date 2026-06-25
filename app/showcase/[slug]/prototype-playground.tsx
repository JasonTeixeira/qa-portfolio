'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Clock3, FileText, MonitorPlay, MousePointer2, Send, Sparkles } from 'lucide-react'
import type { Prototype } from '../prototype-catalog'
import styles from './prototype-detail.module.css'

const sampleBySlug: Record<string, {
  account: string
  segment: string
  primaryAction: string
  secondaryAction: string
  insight: string
  output: string
  proof: string
  conversion: string
}> = {
  'contractor-quote-engine': {
    account: 'IronPeak Roofing',
    segment: 'Roof replacement lead',
    primaryAction: 'Build storm quote path',
    secondaryAction: 'Trigger SMS handoff',
    insight: 'Visitor arrived from hail-damage search and needs proof before the estimate form.',
    output: 'A mobile-first quote page with emergency routing, before/after proof, warranty framing, and a two-step estimate request.',
    proof: 'Before/after gallery, local reviews, service-area map, and 12-minute response promise.',
    conversion: 'Quote request ready',
  },
  'med-spa-consultation-funnel': {
    account: 'Vela Med Spa',
    segment: 'Injectables consultation',
    primaryAction: 'Route treatment interest',
    secondaryAction: 'Book consult',
    insight: 'The visitor wants treatment clarity but should not see risky before/after claims or medical guarantees.',
    output: 'A compliant treatment finder that routes by concern, readiness, budget range, and preferred appointment window.',
    proof: 'Provider credentials, treatment education, safety notes, consult expectations, and nurture follow-up.',
    conversion: 'Consult booked',
  },
  'law-firm-intake-system': {
    account: 'Northline Legal',
    segment: 'Business dispute intake',
    primaryAction: 'Qualify matter',
    secondaryAction: 'Schedule consult',
    insight: 'The prospect needs urgency routing, matter fit, and trust before sharing sensitive details.',
    output: 'A practice-area intake flow that captures urgency, conflict-safe basics, response expectations, and consultation intent.',
    proof: 'Attorney profile, case-safe process summary, jurisdiction fit, and response SLA.',
    conversion: 'Qualified consult',
  },
  'ai-support-agent-dashboard': {
    account: 'HelioCart Support',
    segment: 'Billing ticket surge',
    primaryAction: 'Classify request',
    secondaryAction: 'Escalate risky cases',
    insight: 'The support queue contains repeat billing questions, refund exceptions, and policy-sensitive cancellation requests.',
    output: 'A support cockpit that drafts grounded answers, cites knowledge matches, escalates uncertain tickets, and scores QA quality.',
    proof: 'Knowledge citation, policy match, confidence score, escalation trail, and resolution analytics.',
    conversion: 'Ticket resolved',
  },
}

export function PrototypePlayground({ prototype }: { prototype: Prototype }) {
  const [activeStep, setActiveStep] = useState(0)
  const [approved, setApproved] = useState(false)
  const [sent, setSent] = useState(false)
  const sample = sampleBySlug[prototype.slug] ?? sampleBySlug['contractor-quote-engine']

  const selectedFlow = prototype.workflow[activeStep] ?? prototype.workflow[0]
  const selectedDemo = prototype.demo?.steps[activeStep] ?? prototype.demo?.steps[0]
  const packetState = sent ? 'Live handoff sent' : approved ? 'Approved packet' : 'Draft packet'
  const progress = Math.min(100, 38 + activeStep * 14 + (approved ? 18 : 0) + (sent ? 16 : 0))

  const proofItems = useMemo(() => [
    sample.proof,
    prototype.personalization.slice(0, 3).join(', '),
    `${prototype.screens.length} screens mapped into the demo flow`,
  ], [prototype.personalization, prototype.screens.length, sample.proof])

  return (
    <section id="live-prototype" className={styles.prototypeEmbed} aria-label={`${prototype.name} embedded prototype`}>
      <div className={styles.embedHeader}>
        <div>
          <span className={styles.kicker}>Live buyer workflow</span>
          <h2>Open the version a prospect would understand.</h2>
          <p>
            Click the steps, approve the packet, and send the handoff. The demo shows how the
            business problem turns into a visible workflow, not a static mockup.
          </p>
        </div>
        <div className={styles.embedStatus}>
          <MonitorPlay size={18} />
          <strong>{packetState}</strong>
          <span>{progress}% workflow proof</span>
        </div>
      </div>

      {prototype.demo ? (
        <div className={styles.decisionDemo} aria-label={`${prototype.name} decision demo`}>
          <div className={styles.decisionSteps}>
            {prototype.demo.steps.map((step, index) => (
              <button
                key={step.label}
                className={`${styles.decisionStep} ${activeStep === index ? styles.decisionStepActive : ''}`}
                onClick={() => setActiveStep(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
              </button>
            ))}
          </div>

          <div className={styles.decisionBoard}>
            <article>
              <span>Before</span>
              <p>{selectedDemo?.before}</p>
            </article>
            <div className={styles.decisionCore}>
              <span>{prototype.name}</span>
              <strong>{selectedDemo?.system}</strong>
            </div>
            <article>
              <span>Result</span>
              <p>{selectedDemo?.result}</p>
            </article>
          </div>

          <div className={styles.decisionFooter}>
            <div>
              <span>Buyer action</span>
              <strong>{selectedDemo?.buyerAction}</strong>
            </div>
            <button onClick={() => setActiveStep((current) => (current + 1) % (prototype.demo?.steps.length ?? 1))}>
              Next step <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div className={styles.playground}>
        <div className={styles.prototypeRail}>
          {prototype.workflow.map((item, index) => (
            <button
              key={item.step}
              className={`${styles.prototypeStep} ${activeStep === index ? styles.prototypeStepActive : ''}`}
              onClick={() => setActiveStep(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.step}</strong>
              <em>{item.detail}</em>
            </button>
          ))}
        </div>

        <div className={styles.prototypeCanvas}>
          <div className={styles.canvasTop}>
            <div>
              <span>{sample.segment}</span>
              <h3>{sample.account}</h3>
            </div>
            <b>{sample.conversion}</b>
          </div>

          <div className={styles.canvasGrid}>
            <article className={styles.canvasCard}>
              <div className={styles.cardTitle}>
                <Sparkles size={17} />
                <h4>{selectedFlow.step}</h4>
              </div>
              <p>{selectedFlow.detail}</p>
              <div className={styles.callout}>
                <strong>Insight</strong>
                <span>{sample.insight}</span>
              </div>
            </article>

            <article className={styles.canvasCard}>
              <div className={styles.cardTitle}>
                <FileText size={17} />
                <h4>Generated Output</h4>
              </div>
              <p>{sample.output}</p>
              <div className={styles.outputPreview}>
                <span>{sample.primaryAction}</span>
                <strong>{prototype.outcome}</strong>
                <button onClick={() => setApproved(true)}>
                  <CheckCircle2 size={15} />
                  {approved ? 'Packet approved' : 'Approve packet'}
                </button>
              </div>
            </article>

            <article className={styles.canvasCard}>
              <div className={styles.cardTitle}>
                <MousePointer2 size={17} />
                <h4>Clickable Screens</h4>
              </div>
              <div className={styles.screenChips}>
                {prototype.screens.map((screen) => (
                  <button key={screen} onClick={() => setActiveStep((current) => (current + 1) % prototype.workflow.length)}>
                {screen}
              </button>
            ))}
              </div>
            </article>

            <article className={styles.canvasCard}>
              <div className={styles.cardTitle}>
                <Clock3 size={17} />
                <h4>Proof And Handoff</h4>
              </div>
              <ul className={styles.proofList}>
                {proofItems.map((item) => (
                  <li key={item}><CheckCircle2 size={15} /> {item}</li>
                ))}
              </ul>
              <button
                className={styles.sendButton}
                disabled={!approved}
                onClick={() => setSent(true)}
              >
                <Send size={15} />
                {sent ? sample.secondaryAction : approved ? 'Send handoff' : 'Approve first'}
              </button>
            </article>
          </div>
        </div>
      </div>

      {prototype.demo ? (
        <div className={styles.proofStatus} aria-label={`${prototype.name} verified proof status`}>
          <span>Evidence-backed proof status</span>
          <div>
            {prototype.demo.proofStatus.map((item) => (
              <strong key={item}>
                <CheckCircle2 size={15} />
                {item}
              </strong>
            ))}
          </div>
          <LinkButton href={`/book?source=${prototype.slug}_prototype_demo`}>
            {prototype.demo.primaryCta}
          </LinkButton>
        </div>
      ) : null}
    </section>
  )
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className={styles.demoBookLink} href={href}>
      {children} <ArrowRight size={16} />
    </Link>
  )
}
