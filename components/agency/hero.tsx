import type { ReactNode } from 'react'

import { HeroField } from '@/components/agency/islands/hero-field'
import { Magnetic } from '@/components/agency/islands/magnetic'
import siteProof from '@/proof/site-proof.json'

// Mobile gate strip (<1024px, where the GateRunner instrument is hidden).
// Same honesty contract as GateRunner: values render only if every check in
// proof/site-proof.json passes — otherwise the strip says so. Computed at
// module level so the hero stays a server component.
const GATE_ALL_PASS: boolean = siteProof.checks.every((check) => check.status === 'pass')
const GATE_LIGHTHOUSE: string = [
  siteProof.lighthouse.performance,
  siteProof.lighthouse.accessibility,
  siteProof.lighthouse.bestPractices,
  siteProof.lighthouse.seo,
].join('/')

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
      <HeroField />
      <div className="ag-hero-glow" aria-hidden="true" />
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
                  HIRE ME / CONTACT
                </a>
              </Magnetic>
              <span className="ag-hero-status">
                <span className="ag-hero-status-dot ag-pulse" aria-hidden="true" />
                AVAILABLE FOR CONTRACT WORK + SELECT ROLES
              </span>
          </div>
          <p className="ag-gate-strip ag-hero-enter" style={{ animationDelay: '480ms' }}>
            {GATE_ALL_PASS ? (
              <>
                GATE: SHIP <span className="ag-gate-strip-check">✓</span> · LIGHTHOUSE{' '}
                {GATE_LIGHTHOUSE} · AXE 0
              </>
            ) : (
              <>GATE: VERIFICATION IN PROGRESS</>
            )}
          </p>
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
