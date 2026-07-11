import type { CSSProperties } from 'react'

import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'
import '@/app/agency/audit/audit.css'

interface Offer {
  kicker: string
  accent: string
  title: string
  scope: string
}

const BOOKING_URL = 'https://sageideas.dev/book'

const OFFERS: readonly Offer[] = [
  {
    kicker: 'AI SYSTEMS',
    accent: 'var(--acc-ai)',
    title: 'AI Workflow Build',
    scope:
      'One scoped AI workflow — with evals, source-grounding checks, logging, and a runbook your team can operate.',
  },
  {
    kicker: 'QA COVERAGE',
    accent: 'var(--acc-browser)',
    title: 'Test Coverage Sprint',
    scope:
      'Playwright + API coverage for your highest-risk user flows — delivered with reports, screenshots, and a coverage map.',
  },
  {
    kicker: 'RELEASE SAFETY',
    accent: 'var(--acc-primary)',
    title: 'Release Gate Setup',
    scope:
      'A readiness gate anyone can read: build, typecheck, lint, tests, smoke checks — output as a generated scorecard.',
  },
]

/** Section 08 — resume / contact + fixed-scope contract offers. */
export function ContactSection() {
  return (
    <SectionShell id="contact" num="08" kicker="RESUME / CONTACT" ghost="08">
      <div className="ag-contact">
        <Reveal>
          <h2 className="ag-contact-h2">
            If the proof holds up, <em className="ag-contact-h2-em">let&apos;s talk.</em>
          </h2>
        </Reveal>
        <Reveal delay={90}>
          <p className="ag-contact-sub">
            Open to AI automation, QA engineering, SDET, test infrastructure, and workflow
            automation roles — or consulting projects: building an AI workflow, adding test
            coverage to a fragile product, creating evals for an AI feature, or turning a manual
            process into a monitored workflow.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="ag-contact-ctas">
            <a href="mailto:sage@sageideas.dev" className="ag-btn ag-btn--solid">
              ✉ SAGE@SAGEIDEAS.DEV
            </a>
            <a
              href="https://github.com/JasonTeixeira"
              target="_blank"
              rel="noopener noreferrer"
              className="ag-btn"
            >
              ↗ GITHUB
            </a>
            <a
              href="https://linkedin.com/in/jason-teixeira"
              target="_blank"
              rel="noopener noreferrer"
              className="ag-btn"
            >
              ↗ LINKEDIN
            </a>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="ag-audit-band">
            <p className="ag-kicker">FREE — SITE TEARDOWN</p>
            <p className="ag-audit-band-copy">
              Paste your URL, get four Lighthouse scores and your six worst findings in ~20
              seconds.
            </p>
            <a href="/audit" className="ag-audit-band-link">
              RUN THE FREE TEARDOWN →
            </a>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="ag-contact-offers">
            <h3 className="ag-contact-offers-label">
              CONTRACT ENGAGEMENTS — FIXED SCOPE, PROOF INCLUDED
            </h3>
            <div className="ag-grid ag-offer-grid">
              {OFFERS.map((offer) => (
                <article
                  key={offer.title}
                  className="ag-cell ag-offer-card"
                  style={{ '--card-acc': offer.accent } as CSSProperties}
                >
                  <p className="ag-offer-kicker">{offer.kicker}</p>
                  <h4 className="ag-offer-title">{offer.title}</h4>
                  <p className="ag-offer-scope">{offer.scope}</p>
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ag-offer-cta"
                  >
                    BOOK A CALL →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <blockquote className="ag-contact-quote">
            AI / QA / Automation engineer focused on building tested AI workflows, browser
            automation, release readiness gates, and operational systems with inspectable proof.
          </blockquote>
        </Reveal>
      </div>
    </SectionShell>
  )
}
