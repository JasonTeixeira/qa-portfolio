'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Expand,
  Hammer,
  Home,
  MapPin,
  Minimize2,
  PhoneCall,
  Play,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import styles from './contractor-quote.module.css'

const leadSources = ['Storm search', 'Website form', 'Missed call', 'Referral']
const outcomes = ['Emergency route', 'Repair quote', 'Replacement quote', 'Booked walkthrough']

const steps = [
  {
    label: 'Job type',
    title: 'Roof leak after storm',
    body: 'The visitor chooses the problem in one tap instead of reading a generic services page.',
    value: 'Roof repair',
  },
  {
    label: 'Urgency',
    title: 'Water entering today',
    body: 'The system separates urgent work from low-priority browsing so your team knows who to call first.',
    value: 'High',
  },
  {
    label: 'Proof',
    title: 'Local jobs + warranty',
    body: 'Before the form asks for details, the page shows nearby proof, reviews, insurance, and response expectations.',
    value: 'Trusted',
  },
  {
    label: 'Handoff',
    title: 'Walkthrough booked',
    body: 'The request lands in a daily queue with job value, location, photos, and the next call action.',
    value: 'Ready',
  },
]

const quoteCards = [
  { label: 'Walkthrough value', value: '$7.8k', detail: 'repair to replacement range' },
  { label: 'Response target', value: '12m', detail: 'SMS + call handoff' },
  { label: 'Lead score', value: '94', detail: 'urgent, nearby, photo attached' },
]

const buildScope = [
  'Emergency and standard quote paths',
  'Service-area landing pages',
  'Photo-first estimate intake',
  'Review and job-proof sections',
  'SMS/email handoff workflow',
  'Daily quote priority queue',
]

function FlowDiagram() {
  return (
    <div className={styles.flowShell} aria-label="Contractor quote routing visual">
      <svg className={styles.flowSvg} viewBox="0 0 900 560" aria-hidden="true">
        <defs>
          <radialGradient id="contractorCore" cx="48%" cy="35%" r="72%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
            <stop offset="48%" stopColor="rgba(71,122,255,0.42)" />
            <stop offset="100%" stopColor="rgba(8,10,18,0.95)" />
          </radialGradient>
          <filter id="contractorGlow">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className={styles.signalPaths}>
          <path d="M238 118 C322 118 334 214 360 238" />
          <path d="M238 204 C318 204 334 236 360 255" />
          <path d="M238 290 C318 290 334 280 360 280" />
          <path d="M238 376 C322 376 334 322 360 304" />
          <path d="M644 238 C674 212 674 126 706 118" />
          <path d="M644 255 C678 246 680 208 706 204" />
          <path d="M644 280 C676 288 678 288 706 290" />
          <path d="M644 304 C676 344 678 368 706 376" className={styles.greenPath} />
        </g>

        <g className={styles.nodes}>
          <text x="54" y="70" className={styles.nodeLabel}>QUOTE INTENT</text>
          {leadSources.map((source, index) => {
            const y = 94 + index * 86
            return (
              <g key={source}>
                <rect x="54" y={y} width="184" height="52" rx="12" />
                <circle cx="80" cy={y + 26} r="4.5" />
                <text x="100" y={y + 32}>{source}</text>
                <circle cx="238" cy={y + 26} r="5" className={styles.portDot} />
              </g>
            )
          })}

          <text x="706" y="70" className={styles.nodeLabel}>QUALIFIED WORK</text>
          {outcomes.map((outcome, index) => {
            const y = 94 + index * 86
            const hot = index === outcomes.length - 1
            return (
              <g key={outcome} className={hot ? styles.hotNode : ''}>
                <circle cx="706" cy={y + 26} r="5" className={hot ? styles.greenDot : styles.portDot} />
                <rect x="706" y={y} width="184" height="52" rx="12" />
                <text x="724" y={y + 32}>{outcome}</text>
              </g>
            )
          })}
        </g>

        <g className={styles.core}>
          <circle cx="502" cy="270" r="144" />
          <circle cx="502" cy="270" r="116" />
          <circle cx="502" cy="270" r="92" />
          <text x="502" y="218" className={styles.coreKicker}>QUOTE ENGINE</text>
          <text x="502" y="284" className={styles.coreTitle}>One quote queue</text>
          <text x="502" y="346" className={styles.coreFoot}>URGENCY · VALUE · NEXT CALL</text>
        </g>

        <g className={styles.corePorts}>
          <circle cx="360" cy="238" r="4.5" />
          <circle cx="360" cy="255" r="4.5" />
          <circle cx="360" cy="280" r="4.5" />
          <circle cx="360" cy="304" r="4.5" />
          <circle cx="644" cy="238" r="4.5" />
          <circle cx="644" cy="255" r="4.5" />
          <circle cx="644" cy="280" r="4.5" />
          <circle cx="644" cy="304" r="4.5" />
          <circle cx="706" cy="376" r="7" className={styles.greenDot} />
        </g>
      </svg>
      <div className={styles.flowMetric}>$7,800 estimate range · walkthrough ready</div>
    </div>
  )
}

function MiniQuoteApp({ expanded = false }: { expanded?: boolean }) {
  const [active, setActive] = useState(0)
  const [booked, setBooked] = useState(false)
  const current = steps[active]

  const progress = useMemo(() => Math.min(100, 36 + active * 18 + (booked ? 18 : 0)), [active, booked])

  return (
    <div className={`${styles.quoteApp} ${expanded ? styles.quoteAppExpanded : ''}`} aria-label="Live contractor quote prototype">
      <div className={styles.appTopbar}>
        <div>
          <span>IronPeak Roofing</span>
          <strong>Quote Command Center</strong>
        </div>
        <div className={styles.livePill}>Live demo · {progress}%</div>
      </div>

      <div className={styles.appGrid}>
        <nav className={styles.stepRail} aria-label="Quote workflow steps">
          {steps.map((step, index) => (
            <button
              key={step.label}
              className={active === index ? styles.activeStep : ''}
              onClick={() => setActive(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.label}</strong>
              <em>{step.value}</em>
            </button>
          ))}
        </nav>

        <section className={styles.appCanvas}>
          <div className={styles.canvasHeader}>
            <span>{current.label}</span>
            <h3>{current.title}</h3>
            <p>{current.body}</p>
          </div>

          <div className={styles.routeCard}>
            <div className={styles.routeIcon}>
              {active === 0 ? <Home size={24} /> : active === 1 ? <Clock3 size={24} /> : active === 2 ? <ShieldCheck size={24} /> : <PhoneCall size={24} />}
            </div>
            <div>
              <span>Recommended route</span>
              <strong>{active < 3 ? 'Priority estimate path' : 'Book the walkthrough call'}</strong>
            </div>
            <b>{current.value}</b>
          </div>

          <div className={styles.quoteMetrics}>
            {quoteCards.map((card) => (
              <article key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <em>{card.detail}</em>
              </article>
            ))}
          </div>

          <div className={styles.handoff}>
            <div>
              <span>Next action</span>
              <strong>{booked ? 'Walkthrough confirmation sent' : 'Call within 12 minutes'}</strong>
            </div>
            <button onClick={() => setBooked(true)}>
              {booked ? <CheckCircle2 size={17} /> : <PhoneCall size={17} />}
              {booked ? 'Booked' : 'Book walkthrough'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export function ContractorQuoteShowcase() {
  const [focusOpen, setFocusOpen] = useState(false)

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Contractor Quote Engine</span>
          <p className={styles.heroProof}>Most contractor sites ask visitors to “contact us.” This one tells your team who is worth calling first.</p>
          <h1>
            Turn quote traffic into <span>booked walkthroughs.</span>
          </h1>
          <p className={styles.heroSubcopy}>
            A visual quote system for roofers, HVAC teams, plumbers, electricians, landscapers, and remodelers.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#live-demo">
              <Play size={18} />
              See the live demo
            </a>
            <a className={styles.secondaryButton} href="/book?source=contractor_quote_engine_showcase">
              Build this for my trade
              <ArrowRight size={18} />
            </a>
          </div>
          <div className={styles.heroStats} aria-label="Contractor Quote Engine proof metrics">
            <div>
              <strong>4.8x</strong>
              <span>clearer quote intent path</span>
            </div>
            <div>
              <strong>12m</strong>
              <span>target response handoff</span>
            </div>
            <div>
              <strong>94</strong>
              <span>urgent lead score</span>
            </div>
          </div>
        </div>

        <FlowDiagram />
      </section>

      <section className={styles.storyPanel} aria-label="Contractor Quote Engine visual story">
        <div className={styles.storyLead}>
          <span className={styles.kicker}>What changes</span>
          <h2>Visitors stop guessing. Your team gets the next job to work.</h2>
        </div>
        <div className={styles.storyGrid}>
          <article>
            <Wrench size={24} />
            <span>Before</span>
            <strong>Every service visitor hits the same page.</strong>
          </article>
          <article>
            <Sparkles size={24} />
            <span>During</span>
            <strong>The quote engine routes by job type, urgency, location, and proof needed.</strong>
          </article>
          <article>
            <Hammer size={24} />
            <span>After</span>
            <strong>Your daily queue shows who to call, why now, and what the job may be worth.</strong>
          </article>
        </div>
      </section>

      <section id="live-demo" className={styles.demoSection} aria-label="Contractor Quote Engine live demo">
        <div className={styles.demoIntro}>
          <div>
            <span className={styles.kicker}>Live prototype</span>
            <h2>Four clicks show the entire quote workflow.</h2>
          </div>
          <button className={styles.primaryButton} onClick={() => setFocusOpen(true)}>
            <Expand size={18} />
            Open live demo
          </button>
        </div>

        <div className={styles.guideStrip} aria-label="Contractor demo guide">
          <span>Click path</span>
          {steps.map((step, index) => (
            <button key={step.label}>
              <b>{String(index + 1).padStart(2, '0')}</b>
              {step.label}
            </button>
          ))}
        </div>

        <MiniQuoteApp />
      </section>

      <section className={styles.closePanel} aria-label="Contractor Quote Engine final call to action">
        <div>
          <span className={styles.kicker}>For your trade</span>
          <h2>This is what we can build around your quote flow.</h2>
        </div>
        <div className={styles.closeCopy}>
          <p>
            The demo is the pattern: diagnose the lost quote path, rebuild it visually, connect the handoff,
            and give your team a daily list of the highest-value jobs to work.
          </p>
          <div className={styles.scopeGrid}>
            {buildScope.map((item) => (
              <span key={item}>
                <CheckCircle2 size={15} />
                {item}
              </span>
            ))}
          </div>
          <div className={styles.closeActions}>
            <a className={styles.primaryButton} href="/book?source=contractor_quote_engine_showcase">
              Book a contractor funnel walkthrough
              <ArrowRight size={18} />
            </a>
            <Link className={styles.secondaryButton} href="/showcase">
              View prototype warehouse
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {focusOpen ? (
        <div className={styles.focusOverlay} role="dialog" aria-modal="true" aria-label="Contractor Quote Engine fullscreen prototype">
          <div className={styles.focusShell}>
            <div className={styles.focusTopbar}>
              <span>Contractor Quote Engine</span>
              <strong>Focus mode</strong>
              <button onClick={() => setFocusOpen(false)}>
                <Minimize2 size={16} />
                Exit focus
              </button>
            </div>
            <MiniQuoteApp expanded />
          </div>
          <button className={styles.focusScrim} onClick={() => setFocusOpen(false)} aria-label="Close contractor quote fullscreen prototype" />
        </div>
      ) : null}

      <a className={styles.stickyDemo} href="#live-demo">
        <MapPin size={16} />
        Open quote demo
      </a>
    </div>
  )
}
