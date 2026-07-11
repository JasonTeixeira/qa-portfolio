import type { ReactNode } from 'react'

import { HeroSchematic } from '@/components/agency/hero-schematic'
import { Magnetic } from '@/components/agency/islands/magnetic'

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
      <HeroSchematic />
      <div className="ag-hero-glow" aria-hidden="true" />
      <svg className="ag-hero-lines" aria-hidden="true" focusable="false">
        <line x1="64%" y1="12%" x2="100%" y2="12%" stroke="var(--acc-primary)" strokeWidth="1.5" className="ag-dashflow" />
        <line x1="70%" y1="19%" x2="100%" y2="19%" stroke="var(--acc-ai)" strokeWidth="1.5" className="ag-dashflow" />
        <line x1="67%" y1="26%" x2="100%" y2="26%" stroke="var(--acc-pass)" strokeWidth="1.5" className="ag-dashflow" />
        <circle cx="64%" cy="12%" r="5" fill="var(--acc-primary)" className="ag-pulse" />
        <circle cx="70%" cy="19%" r="5" fill="var(--acc-ai)" className="ag-pulse" />
        <circle cx="67%" cy="26%" r="5" fill="var(--acc-pass)" className="ag-pulse" />
      </svg>
      <div className="ag-grain" aria-hidden="true" />

      <div className="ag-hero-inner">
        <div className="ag-hero-content">
          <p className="ag-kicker ag-hero-kicker ag-hero-enter">
            <span className="ag-hero-kicker-rule" aria-hidden="true" />
            AI / QA / AUTOMATION ENGINEER
          </p>
          <h1 id="hero-heading" className="ag-hero-h1 ag-hero-h1-rise">
            I build AI systems, QA infrastructure, and automation workflows{' '}
            <em className="ag-hero-h1-em">that prove they work.</em>
          </h1>
          <p className="ag-hero-sub ag-hero-enter" style={{ animationDelay: '280ms' }}>
              Tested automation systems, AI workflows, eval harnesses, and QA pipelines — for
              teams that need reliable software, not fragile demos.
          </p>
          <div className="ag-hero-ctas ag-hero-enter" style={{ animationDelay: '400ms' }}>
              <Magnetic>
                <a href="#proof" className="ag-btn ag-btn--solid">
                  VIEW PROOF <span aria-hidden="true">↓</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#contact" className="ag-btn">
                  RESUME / CONTACT
                </a>
              </Magnetic>
              <span className="ag-hero-status">
                <span className="ag-hero-status-dot ag-pulse" aria-hidden="true" />
                OPEN TO ROLES + CONSULTING
              </span>
          </div>
        </div>

        {instrument ? (
          <div className="ag-hero-instrument-reveal ag-hero-enter" style={{ animationDelay: '480ms' }}>
            <aside className="ag-hero-instrument" aria-label="Live release gate for this site">
              {instrument}
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  )
}
