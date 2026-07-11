import type { ReactNode } from 'react'

import { Reveal } from '@/components/agency/core'

interface HeroProps {
  /** Optional live instrument (e.g. GateRunner) rendered in the right-side background layer. */
  instrument?: ReactNode
}

/**
 * Full-viewport hero, content bottom-anchored. Server component —
 * scroll-entrance handled by the Reveal client wrapper.
 */
export function Hero({ instrument }: HeroProps) {
  return (
    <section id="top" className="ag-hero" aria-labelledby="hero-heading">
      {/* Decorative layers */}
      <div className="ag-hero-gridlines" aria-hidden="true" />
      <div className="ag-hero-glow" aria-hidden="true" />
      <svg className="ag-hero-lines" aria-hidden="true" focusable="false">
        <line x1="56%" y1="20%" x2="100%" y2="20%" stroke="var(--acc-primary)" strokeWidth="2" className="ag-dashflow" />
        <line x1="63%" y1="31%" x2="100%" y2="31%" stroke="var(--acc-ai)" strokeWidth="2" className="ag-dashflow" />
        <line x1="59%" y1="42%" x2="100%" y2="42%" stroke="var(--acc-pass)" strokeWidth="2" className="ag-dashflow" />
        <circle cx="56%" cy="20%" r="6" fill="var(--acc-primary)" className="ag-pulse" />
        <circle cx="63%" cy="31%" r="6" fill="var(--acc-ai)" className="ag-pulse" />
        <circle cx="59%" cy="42%" r="6" fill="var(--acc-pass)" className="ag-pulse" />
      </svg>

      {instrument ? <div className="ag-hero-instrument">{instrument}</div> : null}

      <div className="ag-hero-content">
        <Reveal>
          <p className="ag-kicker ag-hero-kicker">
            <span className="ag-hero-kicker-rule" aria-hidden="true" />
            AI / QA / AUTOMATION ENGINEER
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 id="hero-heading" className="ag-hero-h1">
            I build AI systems, QA infrastructure, and automation workflows{' '}
            <em className="ag-hero-h1-em">that prove they work.</em>
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="ag-hero-sub">
            Tested automation systems, AI workflows, eval harnesses, and QA pipelines — for teams
            that need reliable software, not fragile demos.
          </p>
        </Reveal>
        <Reveal delay={270}>
          <div className="ag-hero-ctas">
            <a href="#proof" className="ag-btn ag-btn--solid">
              VIEW PROOF <span aria-hidden="true">↓</span>
            </a>
            <a href="#contact" className="ag-btn">
              RESUME / CONTACT
            </a>
            <span className="ag-hero-status">
              <span className="ag-hero-status-dot ag-pulse" aria-hidden="true" />
              OPEN TO ROLES + CONSULTING
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
