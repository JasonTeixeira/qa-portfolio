'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Expand,
  Minimize2,
  MousePointer2,
  Play,
} from 'lucide-react'
import { FigmaMakeRevenueOsPrototype } from './figma-make-revenue-os-prototype'
import styles from './revenue-os.module.css'

const sources = ['Website forms', 'Inbox replies', 'Ad leads', 'Missed calls']

const outcomes = ['Hot leads worked', 'Follow-ups protected', 'Revenue at risk visible', 'Booked calls']

const proof = [
  'Native React demo',
  'No blocked iframe',
  'Clickable workflow',
  'Buyer-first story',
  'Built around your lead flow',
  'Last checked Jun 24, 2026',
]

const proofCards = [
  {
    value: '37+',
    label: 'leads a day tracked',
    detail: 'Forms, ad leads, replies, and missed calls stop living in separate places.',
  },
  {
    value: '$84k',
    label: 'pipeline made visible',
    detail: 'Open opportunities are ranked by urgency, value, and next action.',
  },
  {
    value: '2x',
    label: 'follow-up lift target',
    detail: 'Your team works the best accounts before they go cold.',
  },
]

const demoGuide = [
  'Open the Lead Queue',
  'Pick the highest-fit account',
  'Review the recommended next action',
  'Check pipeline risk and booked calls',
]

const buildScope = [
  'Lead source audit',
  'Daily priority queue',
  'Reply and follow-up tracking',
  'Pipeline reporting',
]

export function RevenueOsShowcase() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className={styles.shell}>
      <section className={styles.hero} aria-label="Revenue OS sales story">
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Revenue OS</span>
          <p className={styles.heroProof}>40% of inbound leads never get a follow-up. Revenue OS closes that gap in 48 hours.</p>
          <h1>
            Turn leaking demand into <span>booked calls.</span>
          </h1>
          <p>
            One visual system for every lead, reply, follow-up, and next action.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#live-demo">
              <Play size={18} />
              See the live demo
            </a>
            <a className={styles.secondaryButton} href="/book?source=revenue_os_showcase">
              Build this for my business
              <ArrowRight size={18} />
            </a>
          </div>
          <div className={styles.ctaHint} aria-label="Demo callout">
            <span>No slideshow. Click the actual thing.</span>
            <span>Then bring the messy lead flow.</span>
          </div>
          <div className={styles.heroStats} aria-label="Revenue OS proof metrics">
            <div>
              <strong>37+</strong>
              <span>leads / day across active clients</span>
            </div>
            <div>
              <strong>$84k</strong>
              <span>avg. pipeline visible</span>
            </div>
            <div>
              <strong>2x</strong>
              <span>follow-up rate improvement</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Revenue OS visual lead flow">
          <div className={styles.pathCue} aria-hidden="true">
            <span>Leak</span>
            <i />
            <span>Queue</span>
            <i />
            <span>Next action</span>
            <i />
            <span>Booked call</span>
          </div>
          <svg className={styles.flowSvg} viewBox="0 0 900 540" aria-hidden="true">
            <defs>
              <filter id="signalGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="coreGlow" cx="48%" cy="35%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
                <stop offset="44%" stopColor="rgba(77,104,255,0.38)" />
                <stop offset="100%" stopColor="rgba(7,9,20,0.96)" />
              </radialGradient>
            </defs>

            <g className={styles.signalPaths}>
              <path d="M232 120 C300 120 330 216 382 242" />
              <path d="M232 200 C302 200 332 238 382 254" />
              <path d="M232 280 C306 280 334 274 382 270" />
              <path d="M232 360 C304 360 330 316 382 296" />
              <path d="M618 242 C668 216 674 124 704 120" />
              <path d="M618 254 C672 246 674 204 704 200" className={styles.amberPath} />
              <path d="M618 274 C674 284 674 280 704 280" className={styles.redPath} />
              <path d="M618 296 C680 338 678 356 704 360" className={styles.greenPath} />
            </g>

            <g className={styles.diagramNodes}>
              <text x="56" y="78" className={styles.diagramLabel}>LEAKING</text>
              {sources.map((source, index) => {
                const y = 96 + index * 80
                return (
                  <g key={source}>
                    <rect x="52" y={y} width="180" height="48" rx="8" />
                    <circle cx="76" cy={y + 24} r="4" />
                    <text x="94" y={y + 30}>{source}</text>
                    <circle cx="232" cy={y + 24} r="4" className={styles.portDot} />
                  </g>
                )
              })}

              <text x="704" y="78" className={styles.diagramLabel}>WORKED</text>
              {outcomes.map((outcome, index) => {
                const y = 96 + index * 80
                const isHot = index === outcomes.length - 1
                return (
                  <g key={outcome} className={isHot ? styles.hotNodeSvg : ''}>
                    <circle cx="704" cy={y + 24} r="4" className={isHot ? styles.greenDot : styles.portDot} />
                    <rect x="704" y={y} width="174" height="48" rx="8" />
                    <text x="722" y={y + 30}>{outcome}</text>
                  </g>
                )
              })}
            </g>

            <g className={styles.coreSvg}>
              <circle cx="500" cy="268" r="142" />
              <circle cx="500" cy="268" r="118" />
              <circle cx="500" cy="268" r="98" />
              <text x="500" y="214" className={styles.coreKickerSvg}>REVENUE OS</text>
              <text x="500" y="284" className={styles.coreTitleSvg}>One queue</text>
              <text x="500" y="348" className={styles.coreFootSvg}>ALL DEMAND · RANKED</text>
            </g>

            <g className={styles.corePorts}>
              <circle cx="382" cy="242" r="4.5" />
              <circle cx="382" cy="254" r="4.5" />
              <circle cx="382" cy="270" r="4.5" />
              <circle cx="382" cy="296" r="4.5" />
              <circle cx="618" cy="242" r="4.5" />
              <circle cx="618" cy="254" r="4.5" />
              <circle cx="618" cy="274" r="4.5" />
              <circle cx="618" cy="296" r="4.5" />
              <circle cx="704" cy="360" r="6" className={styles.greenDot} />
            </g>
          </svg>
          <div className={styles.heroMetric}>
            <span>$84,200 pipeline · next action assigned</span>
          </div>
        </div>
      </section>

      <section className={styles.proofPanel} aria-label="Revenue OS example proof">
        <div className={styles.proofLead}>
          <span className={styles.kicker}>Example outcome</span>
          <h2>The numbers only matter when the next action is clear.</h2>
        </div>
        <div className={styles.proofGrid}>
          {proofCards.map((card) => (
            <article key={card.label}>
              <strong>{card.value}</strong>
              <span>{card.label}</span>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="live-demo" className={styles.liveDemoSection} aria-label="Live Revenue OS prototype">
        <div className={styles.demoIntro}>
          <div>
            <span className={styles.kicker}>Live prototype</span>
            <h2>Click through the system before you book a call.</h2>
          </div>
          <button className={styles.primaryButton} onClick={() => setIsFullscreen(true)}>
            <Expand size={18} />
            Open live demo
          </button>
        </div>

        <div className={styles.proofRibbon} aria-label="Revenue OS verified proof badges">
          {proof.map((item) => (
            <span key={item}>
              <CheckCircle2 size={15} />
              {item}
            </span>
          ))}
        </div>

        <div className={styles.demoGuide} aria-label="Revenue OS demo guide">
          <span>Start here</span>
          {demoGuide.map((step, index) => (
            <a key={step} href="#live-demo">
              <b>{String(index + 1).padStart(2, '0')}</b>
              {step}
            </a>
          ))}
        </div>

        <div className={styles.demoFrame}>
          <div className={styles.demoTopbar}>
            <span>Live Revenue OS prototype</span>
            <strong>Click queue, accounts, replies, analytics, and build flow</strong>
            <button onClick={() => setIsFullscreen(true)}>
              <Expand size={16} />
              Focus mode
            </button>
          </div>
          <div className={styles.demoViewport}>
            <FigmaMakeRevenueOsPrototype />
          </div>
        </div>
      </section>

      <section className={styles.closePanel} aria-label="Revenue OS final call to action">
        <div>
          <span className={styles.kicker}>For your business</span>
          <h2>This is what we can build around your leads.</h2>
        </div>
        <div className={styles.closeCopy}>
          <p>
            We connect your forms, inbox replies, ad leads, and missed calls into one daily queue.
            Your team sees who to contact, what to say, and which opportunities are going cold.
          </p>
          <div className={styles.scopeGrid} aria-label="Revenue OS build scope">
            {buildScope.map((item) => (
              <span key={item}>
                <CheckCircle2 size={15} />
                {item}
              </span>
            ))}
          </div>
          <div className={styles.closeActions}>
            <a className={styles.primaryButton} href="/book?source=revenue_os_showcase">
              Book a Revenue OS walkthrough
              <ArrowRight size={18} />
            </a>
            <Link className={styles.secondaryButton} href="/showcase">
              See more client examples
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {isFullscreen ? (
        <div className={styles.focusOverlay} role="dialog" aria-modal="true" aria-label="Revenue OS fullscreen prototype">
          <div className={styles.focusShell}>
            <div className={styles.demoTopbar}>
              <span>Revenue OS</span>
              <strong>Focus mode</strong>
              <button onClick={() => setIsFullscreen(false)}>
                <Minimize2 size={16} />
                Exit focus
              </button>
            </div>
            <div className={styles.focusViewport}>
              <FigmaMakeRevenueOsPrototype />
            </div>
          </div>
          <button className={styles.focusScrim} onClick={() => setIsFullscreen(false)} aria-label="Close Revenue OS fullscreen prototype" />
        </div>
      ) : null}

      <a className={styles.stickyDemo} href="#live-demo">
        <MousePointer2 size={16} />
        Open the demo
      </a>
    </div>
  )
}
