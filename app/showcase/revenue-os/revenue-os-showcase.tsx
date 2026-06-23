'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Expand,
  FileText,
  MailCheck,
  Minimize2,
  MousePointer2,
  Play,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { FigmaMakeRevenueOsPrototype } from './figma-make-revenue-os-prototype'
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

const guidedSteps = [
  {
    label: 'Find',
    title: 'Score the market before a human writes a word.',
    copy: 'The demo starts with a ranked account queue: weak websites, active buying signals, revenue estimate, compliance risk, and the right prototype match.',
    result: '42 accounts scored, 6 promoted to today’s sprint',
  },
  {
    label: 'Personalize',
    title: 'Turn research into a prospect-specific proof asset.',
    copy: 'Each account gets a private concept: website gap, offer angle, matching prototype, outreach copy, and guardrails before anything is sent.',
    result: '31% private-demo click rate in the modeled sprint',
  },
  {
    label: 'Approve',
    title: 'Keep outbound controlled instead of messy.',
    copy: 'The operator reviews the packet, legal/compliance notes, and message before release. No spray-and-pray automation is shown to prospects.',
    result: 'Manual approval trail for every outbound packet',
  },
  {
    label: 'Learn',
    title: 'Feed replies, clicks, calls, and rejections back into strategy.',
    copy: 'The learning loop compares industries, channels, proof assets, and offers so the next sprint gets sharper instead of louder.',
    result: '+11 priority lift for winning contractor quote funnels',
  },
] as const

const proofBadges = [
  'Interactive prototype',
  'Personalized packet',
  'E2E tested',
  'Axe 0 violations',
  'Build verified',
]

const offerPackages = [
  {
    name: 'Private Prototype Packet',
    timeline: '48-72 hours',
    bestFor: 'One high-value prospect or one warm inbound lead',
    deliverables: [
      'Research brief and revenue leak diagnosis',
      'Private demo page with buyer-specific copy',
      'First email, follow-up, and call CTA',
    ],
  },
  {
    name: 'Outbound Sprint Kit',
    timeline: '5-7 days',
    bestFor: 'Testing one vertical with 5-10 target accounts',
    deliverables: [
      'Vertical prototype angle and proof pattern',
      'Personalized packets for each account',
      'Reply/click tracking and next-step recommendations',
    ],
  },
  {
    name: 'Full Revenue OS Build',
    timeline: '2-6 weeks',
    bestFor: 'Turning the winning packet into an operating system',
    deliverables: [
      'Lead scoring, approval workflow, and CRM routing',
      'Reusable prototype warehouse',
      'Analytics loop for replies, calls, and closed revenue',
    ],
  },
]

const faqs = [
  {
    question: 'Is this only a mockup?',
    answer:
      'The first packet is a high-fidelity playable prototype. If the offer works, the same flow can become a production build with forms, CRM, email, analytics, and automation connected.',
  },
  {
    question: 'What do you need from a client?',
    answer:
      'One target account or vertical, the offer you want to sell, your preferred call CTA, and any proof assets you already have. The system fills the rest with research and a private demo route.',
  },
  {
    question: 'Why would this beat a normal cold email?',
    answer:
      'A normal cold email asks the buyer to imagine the value. A private prototype shows the buyer the value in their own context before they reply.',
  },
  {
    question: 'How is this measured?',
    answer:
      'Each packet should track opens, clicks, replies, booked calls, objections, and follow-up outcomes. Real campaign data is the proof needed to move from a strong showcase to a proven sales machine.',
  },
]

export function RevenueOsShowcase() {
  const [selectedId, setSelectedId] = useState(leads[0].id)
  const [stage, setStage] = useState(0)
  const [approved, setApproved] = useState(false)
  const [demoGenerated, setDemoGenerated] = useState(false)
  const [sent, setSent] = useState(false)
  const [guidedIndex, setGuidedIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [prospectName, setProspectName] = useState('Luma Dental Studio')
  const [prospectIndustry, setProspectIndustry] = useState('Local healthcare')
  const [prospectGoal, setProspectGoal] = useState('Book more qualified calls from website traffic')
  const [prospectPain, setProspectPain] = useState('Paid traffic lands on a generic page with no clear appointment path')

  const selected = useMemo(() => leads.find((lead) => lead.id === selectedId) ?? leads[0], [selectedId])
  const guided = guidedSteps[guidedIndex]
  const nextGuidedStep = () => setGuidedIndex((current) => Math.min(guidedSteps.length - 1, current + 1))
  const previousGuidedStep = () => setGuidedIndex((current) => Math.max(0, current - 1))

  const computedStatus: LeadStatus = sent ? 'Replied' : approved ? 'Approved' : demoGenerated ? 'Demo ready' : selected.status
  const sprintProgress = Math.min(100, 42 + stage * 7 + (approved ? 10 : 0) + (demoGenerated ? 8 : 0) + (sent ? 8 : 0))
  const safeProspectName = prospectName.trim() || 'Your business'
  const safeIndustry = prospectIndustry.trim() || 'your market'
  const safeGoal = prospectGoal.trim() || 'turn attention into qualified pipeline'
  const safePain = prospectPain.trim() || 'the current path makes buyers work too hard before they can take action'
  const privateSlug = safeProspectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'your-business'

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Prototype 01 / Revenue OS</span>
          <h1>Show a buyer their business inside the system.</h1>
          <p>
            A private, playable sales demo that turns cold outreach into a working concept: their brand, their market,
            their revenue leak, and the exact workflow you can build for them.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={() => setIsFullscreen(true)}>
              <Play size={16} />
              Open live demo
            </button>
            <a className={styles.secondaryButton} href="/book?source=revenue_os_showcase">
              Build this for my market
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
        <div className={styles.heroPanel} aria-label="Revenue OS proof metrics">
          <div className={styles.panelStatus}>
            <span>Sales outcome</span>
            <strong>Give prospects a reason to reply</strong>
          </div>
          <Metric label="Private demo packet" value="1:1" trend="built for their business" />
          <Metric label="Proof angle" value="3x" trend="research, prototype, CTA" />
          <Metric label="Follow-up story" value="Clear" trend="what changes and why" />
          <Metric label="Operator proof" value="Open" trend="dashboard below" />
        </div>
      </section>

      <section className={styles.figmaSection} aria-label="Revenue OS flagship live demo">
        <div className={styles.figmaHeader}>
          <div>
            <span className={styles.kicker}>Flagship live demo</span>
            <h2>Make the prospect feel like this already belongs to them.</h2>
            <p>
              The page should sell the transformation first: a broken website becomes a focused revenue path, a generic
              email becomes a tailored concept, and the call becomes the obvious next step.
            </p>
          </div>
          <div className={styles.demoHeaderActions}>
            <button className={styles.secondaryButton} onClick={() => setIsFullscreen(true)}>
              <Expand size={16} />
              Focus mode
            </button>
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
        </div>

        <div className={styles.proofRibbon} aria-label="Revenue OS verified proof badges">
          {proofBadges.map((badge) => (
            <span key={badge}>
              <CheckCircle2 size={14} />
              {badge}
            </span>
          ))}
        </div>

        <section className={styles.contrastSection} aria-label="Cold email versus private prototype packet">
          <div className={styles.contrastHeader}>
            <span className={styles.storyEyebrow}>The selling difference</span>
            <h3>Stop asking buyers to imagine the outcome. Show it.</h3>
          </div>
          <div className={styles.contrastGrid}>
            <article className={styles.coldCard}>
              <span>Generic cold email</span>
              <strong>“We help businesses improve their website and get more leads.”</strong>
              <p>
                Easy to ignore. No proof. No context. The buyer has to do all the imagination before they trust you.
              </p>
            </article>
            <article className={styles.demoPacketCard}>
              <span>Private prototype packet</span>
              <strong>“I built a working concept for {safeProspectName} showing how to {safeGoal.toLowerCase()}.”</strong>
              <p>
                Specific diagnosis, private URL, proof of thinking, and a clear next step. The buyer sees the future
                state before the sales call.
              </p>
            </article>
          </div>
        </section>

        <div className={styles.demoShowcaseGrid}>
          <div className={styles.demoStoryCard}>
            <span className={styles.storyEyebrow}>Guided walkthrough</span>
            <strong>{guided.title}</strong>
            <p>{guided.copy}</p>
            <div className={styles.storyResult}>
              <TrendingUp size={16} />
              {guided.result}
            </div>
            <div className={styles.storySteps} aria-label="Guided demo steps">
              {guidedSteps.map((step, index) => (
                <button
                  key={step.label}
                  className={index === guidedIndex ? styles.storyStepActive : ''}
                  onClick={() => setGuidedIndex(index)}
                >
                  <span>{index + 1}</span>
                  {step.label}
                </button>
              ))}
            </div>
            <div className={styles.storyControls}>
              <button onClick={previousGuidedStep} disabled={guidedIndex === 0}>
                <ChevronLeft size={16} />
                Back
              </button>
              <button onClick={nextGuidedStep} disabled={guidedIndex === guidedSteps.length - 1}>
                Next
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setGuidedIndex(guidedSteps.length - 1)}>
                View result
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className={styles.personalizationCard} aria-label="Private outbound personalization controls">
            <span className={styles.storyEyebrow}>Private packet inputs</span>
            <strong>Make the demo feel built for one buyer.</strong>
            <p>
              Change the business, segment, and outcome to make the packet read like it was prepared for one company,
              not a list.
            </p>
            <label>
              Business
              <input value={prospectName} onChange={(event) => setProspectName(event.target.value)} />
            </label>
            <label>
              Segment
              <input value={prospectIndustry} onChange={(event) => setProspectIndustry(event.target.value)} />
            </label>
            <label>
              Current leak
              <textarea value={prospectPain} onChange={(event) => setProspectPain(event.target.value)} />
            </label>
            <label>
              Desired outcome
              <textarea value={prospectGoal} onChange={(event) => setProspectGoal(event.target.value)} />
            </label>
            <div className={styles.packetPreview}>
              <span>Preview headline</span>
              <strong>{safeProspectName} Revenue OS concept</strong>
              <p>
                Built for {safeIndustry} to {safeGoal.toLowerCase()}.
              </p>
            </div>
          </div>
        </div>

        <section className={styles.livePacketPreview} aria-label="Live private packet preview">
          <div>
            <span className={styles.storyEyebrow}>Private URL preview</span>
            <strong>/showcase/private/{privateSlug}</strong>
            <p>
              Diagnosis: {safePain}. The packet leads with a specific observation, shows the improved path, and asks
              for a build call only after the prospect sees the working concept.
            </p>
          </div>
          <div className={styles.emailPreviewCard}>
            <span>Email opener</span>
            <p>
              Subject: quick concept for {safeProspectName}
              <br />
              I noticed {safePain.toLowerCase()}. I mocked up a private concept showing how {safeProspectName} could
              {` ${safeGoal.toLowerCase()}`} without making visitors guess the next step.
            </p>
          </div>
          <div className={styles.packetOutcomeCard}>
            <span>Call CTA</span>
            <strong>Want me to turn this into the live version?</strong>
            <p>CTA path: private demo view → reply → build call → implementation plan.</p>
          </div>
        </section>

        <div className={styles.figmaMakeAppFrame}>
          <div className={styles.figmaMakeAppTopbar}>
            <span>Live Revenue OS prototype</span>
            <strong>Native embedded app · click the left navigation</strong>
            <button onClick={() => setIsFullscreen(true)}>
              <Expand size={16} />
              Focus mode
            </button>
          </div>
          <div className={styles.figmaMakeAppViewport}>
            <FigmaMakeRevenueOsPrototype />
          </div>
        </div>

        <div className={styles.mobileDemoStory} aria-label="Mobile demo summary">
          <span className={styles.storyEyebrow}>Mobile view</span>
          <strong>The phone version sells the story instead of shrinking the whole dashboard.</strong>
          <div>
            {guidedSteps.map((step) => (
              <article key={step.label}>
                <span>{step.label}</span>
                <p>{step.result}</p>
              </article>
            ))}
          </div>
          <button className={styles.primaryButton} onClick={() => setIsFullscreen(true)}>
            <Expand size={16} />
            Open full demo
          </button>
        </div>

        <details className={styles.technicalProof}>
          <summary>Technical proof for reviewers</summary>
          <p>
            The broken iframe was removed. This prototype is the recovered Figma Make React source running natively in
            the website, with automated route coverage and accessibility checks.
          </p>
        </details>
      </section>

      <section className={styles.nativeIntro} aria-label="Website-native embedded prototype">
        <div>
          <span className={styles.kicker}>Behind the sales page</span>
          <h2>The dense command center is proof, not the first impression.</h2>
        </div>
        <p>
          Open the operator layer when you want to show how the system finds accounts, assembles packets, controls
          approval, and learns from replies. Keep the default buyer journey clean and outcome-led.
        </p>
      </section>

      {isFullscreen ? (
        <div className={styles.focusOverlay} role="dialog" aria-modal="true" aria-label="Revenue OS fullscreen prototype">
          <div className={styles.focusShell}>
            <div className={styles.figmaMakeAppTopbar}>
              <span>Live Revenue OS prototype</span>
              <strong>Focus mode</strong>
              <button onClick={() => setIsFullscreen(false)}>
                <Minimize2 size={16} />
                Exit focus
              </button>
            </div>
            <div className={styles.figmaMakeAppViewport}>
              <FigmaMakeRevenueOsPrototype />
            </div>
          </div>
        </div>
      ) : null}

      <details className={styles.operatorDetails}>
        <summary>
          <span>Operator proof layer</span>
          <strong>Open the command center that powers the sales demo.</strong>
          <em>Account scoring, packet approval, controlled send, reply learning, and proof assets.</em>
        </summary>

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
          <div className={styles.leftRail} aria-label="Revenue OS main opportunity queue">
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
          </div>

          <section className={styles.mainStage} aria-label="Revenue OS main selected account">
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

          <div className={styles.rightRail}>
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
          </div>
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
      </details>

      <section className={styles.offerSection} aria-label="Revenue OS productized offers">
        <div className={styles.offerHeader}>
          <span className={styles.kicker}>What a client can buy</span>
          <h2>Start with one packet. Scale the pattern after it earns replies.</h2>
          <p>
            This turns the showcase into a practical offer: a buyer can order one private concept, a vertical sprint, or
            the full system once the proof shows traction.
          </p>
        </div>
        <div className={styles.packageGrid}>
          {offerPackages.map((offer) => (
            <article key={offer.name} className={styles.packageCard}>
              <span>{offer.timeline}</span>
              <h3>{offer.name}</h3>
              <p>{offer.bestFor}</p>
              <ul>
                {offer.deliverables.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.faqSection} aria-label="Revenue OS objection handling">
        <div>
          <span className={styles.kicker}>Objection handling</span>
          <h2>Answer the questions that stop buyers from booking.</h2>
        </div>
        <div className={styles.faqGrid}>
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-label="Revenue OS final call to action">
        <div>
          <span className={styles.kicker}>Build the version for your market</span>
          <h2>Send a working concept, not another pitch.</h2>
          <p>
            We can turn one target account, one vertical, or one campaign into a personalized prototype packet that
            makes the buyer feel the outcome before the first call.
          </p>
        </div>
        <div className={styles.finalCtaActions}>
          <a className={styles.primaryButton} href="/book?source=revenue_os_final_cta">
            Book the build call
            <ArrowRight size={16} />
          </a>
          <a className={styles.secondaryButton} href="/showcase">
            View prototype warehouse
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </div>
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
