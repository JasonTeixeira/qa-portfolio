'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  MailCheck,
  MousePointer2,
  Play,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import styles from './revenue-os.module.css'

const figmaPrototypeUrl =
  'https://www.figma.com/make/rWyEGQoNrkIvPKt1lF8waC/Prototype-Development?code-node-id=0-9&p=f&t=MMlMfdxCbTpVxvqO-0&fullscreen=1'

type LeadStatus = 'Queued' | 'Researched' | 'Demo ready' | 'Approved' | 'Replied'

type Lead = {
  id: string
  business: string
  vertical: string
  location: string
  score: number
  value: string
  gap: string
  trigger: string
  prototype: string
  offer: string
  status: LeadStatus
  reply: string
  risk: string
}

const leads: Lead[] = [
  {
    id: 'lead-01',
    business: 'Luma Dental Studio',
    vertical: 'Dental',
    location: 'Orlando, FL',
    score: 94,
    value: '$18k',
    gap: 'No appointment CTA above the fold; mobile page buries insurance and emergency care.',
    trigger: 'Running Google Ads into a generic services page.',
    prototype: 'Dental Booking Conversion Site',
    offer: '72-hour booking funnel rebuild with appointment routing and treatment pages.',
    status: 'Demo ready',
    reply: 'Asked whether the prototype can support Spanish landing pages.',
    risk: 'Verify practice owner before sending.',
  },
  {
    id: 'lead-02',
    business: 'IronPeak Roofing',
    vertical: 'Contractor',
    location: 'Austin, TX',
    score: 91,
    value: '$24k',
    gap: 'Quote request flow has six fields before trust proof; no storm-damage landing page.',
    trigger: 'Recent hail storm search volume spike in service area.',
    prototype: 'Contractor Quote Engine',
    offer: 'Storm response quote funnel with before/after proof and SMS handoff.',
    status: 'Researched',
    reply: 'No reply yet; second proof follow-up recommended.',
    risk: 'Avoid insurance claim guarantees.',
  },
  {
    id: 'lead-03',
    business: 'Vela Med Spa',
    vertical: 'Med Spa',
    location: 'Scottsdale, AZ',
    score: 88,
    value: '$15k',
    gap: 'Beautiful brand, weak offer path; treatments do not connect to consultation booking.',
    trigger: 'New injectables campaign, but no dedicated landing page.',
    prototype: 'Med Spa Consultation Funnel',
    offer: 'Treatment quiz, booking funnel, and retention sequence.',
    status: 'Queued',
    reply: 'Pending first send.',
    risk: 'Use compliant aesthetic language, no medical outcome claims.',
  },
  {
    id: 'lead-04',
    business: 'Northline Legal',
    vertical: 'Law Firm',
    location: 'Denver, CO',
    score: 86,
    value: '$30k',
    gap: 'High-trust service, but the intake form feels generic and hides response time.',
    trigger: 'New practice-area page published without lead magnet.',
    prototype: 'Law Firm Consultation Funnel',
    offer: 'Practice-area intake path with qualification and consult scheduling.',
    status: 'Approved',
    reply: 'Clicked demo twice; partner asked for examples.',
    risk: 'No legal advice claims.',
  },
]

const steps = [
  'Command',
  'Queue',
  'Research',
  'Prototype',
  'Outreach',
  'Approval',
  'Replies',
  'Analytics',
  'Offer',
] as const

const activity = [
  'AI scored 42 businesses and promoted 6 to today’s sprint.',
  'Prototype match generated for Luma Dental Studio.',
  'Compliance check flagged medical-claim wording for Vela Med Spa.',
  'Northline Legal clicked private demo twice in 18 minutes.',
  'Learning loop raised contractor quote funnels by +11 priority points.',
]

export function RevenueOsShowcase() {
  const [selectedId, setSelectedId] = useState(leads[0].id)
  const [stage, setStage] = useState(0)
  const [approved, setApproved] = useState(false)
  const [demoGenerated, setDemoGenerated] = useState(false)
  const [sent, setSent] = useState(false)

  const selected = useMemo(() => leads.find((lead) => lead.id === selectedId) ?? leads[0], [selectedId])

  const computedStatus: LeadStatus = sent ? 'Replied' : approved ? 'Approved' : demoGenerated ? 'Demo ready' : selected.status
  const sprintProgress = Math.min(100, 42 + stage * 7 + (approved ? 10 : 0) + (demoGenerated ? 8 : 0) + (sent ? 8 : 0))

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Prototype 01 / Revenue OS</span>
          <h1>AI client acquisition command center.</h1>
          <p>
            A playable front-end prototype showing how Sage Ideas finds qualified accounts, creates personalized proof
            assets, controls outbound approvals, classifies replies, and learns from every sprint.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={() => setStage(1)}>
              <Play size={16} />
              Run revenue sprint
            </button>
            <a className={styles.secondaryButton} href="/book?source=revenue_os_showcase">
              Customize this for my business
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className={styles.heroPanel} aria-label="Revenue OS proof metrics">
          <div className={styles.panelStatus}>
            <span>Live prototype</span>
            <strong>Click through the revenue workflow</strong>
          </div>
          <Metric label="Pipeline surfaced" value="$87k" trend="+18%" />
          <Metric label="Qualified accounts" value="42" trend="6 ready" />
          <Metric label="Demo clicks" value="31%" trend="+9.4%" />
          <Metric label="Booked calls" value="7" trend="this sprint" />
        </div>
      </section>

      <section className={styles.figmaSection} aria-label="Original Figma Make prototype">
        <div className={styles.figmaHeader}>
          <div>
            <span className={styles.kicker}>Original Figma Make build</span>
            <h2>Open and inspect the Rev OS prototype we built in Figma.</h2>
          </div>
          <a
            className={styles.secondaryButton}
            href={figmaPrototypeUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Figma prototype
            <ArrowRight size={16} />
          </a>
        </div>
        <div className={styles.figmaLaunch}>
          <div>
            <span>Figma Make blocks reliable embedded rendering on this page.</span>
            <strong>The original Rev OS prototype opens cleanly in Figma from the button above.</strong>
            <p>
              The production-grade, website-native version starts directly below this panel so prospects can still
              click through the Revenue OS workflow without leaving the site.
            </p>
          </div>
          <a href={figmaPrototypeUrl} target="_blank" rel="noreferrer">
            Launch original Figma build
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className={styles.nativeIntro} aria-label="Website-native embedded prototype">
        <div>
          <span className={styles.kicker}>Embedded website-native prototype</span>
          <h2>The product demo is built directly into this showcase.</h2>
        </div>
        <p>
          The command center below is the usable Rev OS prototype: click accounts, generate private demos, approve
          outreach packets, simulate sends, and inspect the learning loop without leaving the site.
        </p>
      </section>

      <section className={styles.commandBar} aria-label="Revenue sprint workflow">
        {steps.map((step, index) => (
          <button
            key={step}
            className={`${styles.step} ${stage === index ? styles.stepActive : ''} ${index < stage ? styles.stepDone : ''}`}
            onClick={() => setStage(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {step}
          </button>
        ))}
      </section>

      <section className={styles.workspace}>
        <aside className={styles.leftRail}>
          <div className={styles.panelHeader}>
            <span>Opportunity Queue</span>
            <strong>{leads.length} accounts</strong>
          </div>
          <div className={styles.leadList}>
            {leads.map((lead) => (
              <button
                key={lead.id}
                className={`${styles.leadCard} ${selected.id === lead.id ? styles.leadCardActive : ''}`}
                onClick={() => {
                  setSelectedId(lead.id)
                  setStage(2)
                }}
              >
                <span className={styles.leadTopline}>
                  <strong>{lead.business}</strong>
                  <b>{lead.score}</b>
                </span>
                <span>{lead.vertical} · {lead.location}</span>
                <em>{lead.gap}</em>
              </button>
            ))}
          </div>
        </aside>

        <section className={styles.mainStage}>
          <div className={styles.stageHeader}>
            <div>
              <span className={styles.kicker}>Selected Account</span>
              <h2>{selected.business}</h2>
            </div>
            <StatusPill status={computedStatus} />
          </div>

          <div className={styles.stageGrid}>
            <InsightCard icon={<Radar size={18} />} title="AI Research Brief">
              <p>{selected.gap}</p>
              <dl className={styles.dataRows}>
                <div><dt>Trigger</dt><dd>{selected.trigger}</dd></div>
                <div><dt>Estimated value</dt><dd>{selected.value}</dd></div>
                <div><dt>Guardrail</dt><dd>{selected.risk}</dd></div>
              </dl>
            </InsightCard>

            <InsightCard icon={<Sparkles size={18} />} title="Prototype Match">
              <p>{selected.prototype}</p>
              <div className={styles.prototypePreview}>
                <span>{selected.vertical}</span>
                <strong>{selected.offer}</strong>
                <button
                  onClick={() => {
                    setDemoGenerated(true)
                    setStage(4)
                  }}
                >
                  Generate private demo link
                </button>
              </div>
            </InsightCard>

            <InsightCard icon={<MailCheck size={18} />} title="Personalized Outreach">
              <div className={styles.emailBox}>
                <span>Subject: quick concept for {selected.business}</span>
                <p>
                  I mocked up a more conversion-focused version for {selected.business} after noticing {selected.gap.toLowerCase()}
                  The private demo shows a clearer offer path, stronger proof, and a faster route to booked calls.
                </p>
              </div>
            </InsightCard>

            <InsightCard icon={<ShieldCheck size={18} />} title="Approval Control">
              <div className={styles.approvalBox}>
                <div>
                  <strong>{approved ? 'Approved for controlled send' : 'Waiting for operator approval'}</strong>
                  <span>Proof link, copy, and compliance flags are logged before outreach.</span>
                </div>
                <button
                  className={approved ? styles.successButton : styles.primaryButton}
                  onClick={() => {
                    setApproved(true)
                    setStage(6)
                  }}
                >
                  <CheckCircle2 size={16} />
                  {approved ? 'Approved' : 'Approve packet'}
                </button>
              </div>
            </InsightCard>

            <InsightCard icon={<Send size={18} />} title="Controlled Send Simulation">
              <div className={styles.sendBox}>
                <div>
                  <strong>{sent ? 'Packet sent and tracked' : approved ? 'Ready for proof-based send' : 'Locked until approval'}</strong>
                  <span>
                    {sent
                      ? 'Click, reply, and booked-call outcomes are now attributed to this private prototype packet.'
                      : approved
                        ? 'The send action is available because the demo, copy, and guardrails were approved.'
                        : 'Institutional flow keeps outbound locked until the operator approves the packet.'}
                  </span>
                </div>
                <button
                  disabled={!approved}
                  onClick={() => {
                    setSent(true)
                    setStage(7)
                  }}
                >
                  <Send size={16} />
                  {sent ? 'Send logged' : 'Send approved packet'}
                </button>
              </div>
            </InsightCard>
          </div>
        </section>

        <aside className={styles.rightRail}>
          <div className={styles.panelHeader}>
            <span>Live Sprint</span>
            <strong>{sprintProgress}%</strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${sprintProgress}%` }} />
          </div>
          <div className={styles.nextAction}>
            <Target size={18} />
            <div>
              <strong>Next best action</strong>
              <span>
                {sent
                  ? 'Watch reply intent and route booked-call handoff.'
                  : approved
                    ? 'Send the approved packet and start reply tracking.'
                    : 'Approve private demo packet after proof review.'}
              </span>
            </div>
          </div>
          <div className={styles.activityFeed}>
            {activity.map((item) => (
              <div key={item}>
                <Clock3 size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className={styles.lowerGrid}>
        <div className={styles.analyticsPanel}>
          <div className={styles.sectionTitle}>
            <BarChart3 size={18} />
            <h2>Learning loop</h2>
          </div>
          <div className={styles.chartRows}>
            <ChartRow label="Contractor quote engines" value={82} note="+11 priority" />
            <ChartRow label="Dental booking funnels" value={76} note="+8 reply lift" />
            <ChartRow label="Med spa consult paths" value={69} note="copy needs compliance pass" />
            <ChartRow label="Law firm intake pages" value={61} note="higher value, slower close" />
          </div>
        </div>

        <div className={styles.packetPanel}>
          <div className={styles.sectionTitle}>
            <FileText size={18} />
            <h2>Outbound packet</h2>
          </div>
          <ul>
            <li><CheckCircle2 size={15} /> Private demo route with business-specific headline</li>
            <li><CheckCircle2 size={15} /> Website diagnosis and revenue leak summary</li>
            <li><CheckCircle2 size={15} /> Matched prototype with personalized offer angle</li>
            <li><CheckCircle2 size={15} /> Short email plus one proof-based follow-up</li>
          </ul>
          <a href="/book?source=revenue_os_packet" className={styles.packetCta}>
            Build a packet for my business
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className={styles.metric}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em><TrendingUp size={13} /> {trend}</em>
    </div>
  )
}

function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span className={styles.statusPill}>
      <MousePointer2 size={14} />
      {status}
    </span>
  )
}

function InsightCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className={styles.insightCard}>
      <div className={styles.insightTitle}>
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </article>
  )
}

function ChartRow({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className={styles.chartRow}>
      <div>
        <strong>{label}</strong>
        <span>{note}</span>
      </div>
      <div className={styles.chartTrack}>
        <span style={{ width: `${value}%` }} />
      </div>
      <b>{value}</b>
    </div>
  )
}
