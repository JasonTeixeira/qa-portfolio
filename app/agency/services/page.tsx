import type { Metadata } from 'next'
import type { CSSProperties } from 'react'

import { AgencyNav } from '@/components/agency/nav'
import { AgencyFooter } from '@/components/agency/footer'
import {
  DIAG_ACCENT,
  DiagEdge,
  DiagFrame,
  DiagNode,
} from '@/components/agency/diagrams/primitives'
import { SERVICES, type Service, type ServiceStage } from '@/data/agency/services'
import { TOOL_GROUPS } from '@/data/agency/toolbox'
import './services.css'

export const metadata: Metadata = {
  title: 'Services — Jason Teixeira',
  description:
    'Three fixed-scope engagements: AI Workflow Build, Test Coverage Sprint, and Release Gate Setup. Every engagement ships with the artifacts that prove it works — no invented metrics.',
  alternates: { canonical: 'https://agency.sageideas.dev/services' },
}

const BOOKING_URL = 'https://sageideas.dev/book'

/* ---------- per-service process strip ---------- */

const DIAG_W = 1000
const DIAG_H = 220
const NODE_Y = 110
/** node half-width (sm = 59) + breathing room before the edge starts */
const EDGE_GAP = 66

function stageXs(count: number): number[] {
  const first = 110
  const last = DIAG_W - 110
  if (count < 2) return [DIAG_W / 2]
  return Array.from({ length: count }, (_, i) => first + ((last - first) / (count - 1)) * i)
}

/** Horizontal stage diagram — decorative; the <ol> below it carries the text. */
function ProcessDiagram({ uid, stages }: { uid: string; stages: readonly ServiceStage[] }) {
  const xs = stageXs(stages.length)
  return (
    <div className="ag-proc-diag">
      <DiagFrame uid={uid} viewW={DIAG_W} viewH={DIAG_H}>
        {stages.map((stage, i) =>
          i < stages.length - 1 ? (
            <DiagEdge
              key={`${stage.label}-edge`}
              from={{ x: xs[i] + EDGE_GAP, y: NODE_Y }}
              to={{ x: xs[i + 1] - EDGE_GAP, y: NODE_Y }}
              accent={stages[i + 1].accent}
            />
          ) : null,
        )}
        {stages.map((stage, i) => (
          <DiagNode
            key={stage.label}
            uid={uid}
            x={xs[i]}
            y={NODE_Y}
            glyph={stage.glyph}
            label={stage.label}
            accent={stage.accent}
            size="sm"
            pulse={i === stages.length - 1}
          />
        ))}
      </DiagFrame>
    </div>
  )
}

/* ---------- full service block ---------- */

function ServiceBlock({ service, index }: { service: Service; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <section
      id={service.id}
      className="ag-section ag-svc"
      style={{ '--svc-acc': DIAG_ACCENT[service.accent] } as CSSProperties}
      aria-labelledby={`${service.id}-title`}
    >
      <header className="ag-svc-head">
        <p className="ag-kicker ag-svc-kicker">
          {num} — {service.kicker}
        </p>
        <h2 id={`${service.id}-title`} className="ag-svc-title">
          {service.title}
        </h2>
        <p className="ag-svc-tagline">{service.tagline}</p>
      </header>

      <ProcessDiagram uid={`svc-${service.id}`} stages={service.process} />
      <ol className="ag-svc-stages">
        {service.process.map((stage) => (
          <li
            key={stage.label}
            className="ag-svc-stage"
            style={{ '--stage-acc': DIAG_ACCENT[stage.accent] } as CSSProperties}
          >
            <span className="ag-svc-stage-label">{stage.label}</span>
            <span className="ag-svc-stage-detail">{stage.detail}</span>
          </li>
        ))}
      </ol>

      <div className="ag-svc-body">
        <div className="ag-svc-get">
          <h3 className="ag-svc-minihead">WHAT YOU GET</h3>
          <ul className="ag-svc-get-list">
            {service.whatYouGet.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="ag-svc-fit">
          <div className="ag-svc-fit-col">
            <h3 className="ag-svc-minihead ag-svc-minihead--pass">GOOD FIT</h3>
            <ul className="ag-svc-fit-list ag-svc-fit-list--good">
              {service.goodFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="ag-svc-fit-col">
            <h3 className="ag-svc-minihead ag-svc-minihead--fail">NOT A FIT</h3>
            <ul className="ag-svc-fit-list ag-svc-fit-list--bad">
              {service.badFit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="ag-svc-faq">
        <h3 className="ag-svc-minihead">QUESTIONS</h3>
        {service.faq.map((item) => (
          <details key={item.q} className="ag-svc-faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>

      <div className="ag-svc-cta">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ag-btn ag-btn--solid"
        >
          BOOK A CALL →
        </a>
        <a href="mailto:sage@sageideas.dev" className="ag-svc-cta-quiet">
          or email sage@sageideas.dev
        </a>
      </div>
    </section>
  )
}

/* ---------- page ---------- */

export default function ServicesPage() {
  return (
    <>
      <AgencyNav />
      <main id="main-content" tabIndex={-1}>
        <section className="ag-section ag-svc-hero" aria-labelledby="services-heading">
          <p className="ag-kicker">SERVICES</p>
          <h1 id="services-heading" className="ag-svc-h1">
            Fixed scope. Proof included.
          </h1>
          <p className="ag-svc-sub">
            Three engagements, each scoped up front and delivered with the artifacts that prove it
            works — evals, traces, reports, and runbooks, not promises.
          </p>
          <nav className="ag-svc-jump" aria-label="Services on this page">
            {SERVICES.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className="ag-svc-jump-link"
                style={{ '--svc-acc': DIAG_ACCENT[service.accent] } as CSSProperties}
              >
                {service.title} ↓
              </a>
            ))}
          </nav>
        </section>

        {SERVICES.map((service, index) => (
          <ServiceBlock key={service.id} service={service} index={index} />
        ))}

        {/* Compact toolbox — moved here from the homepage scan section. */}
        <section className="ag-section ag-svc-toolbox" aria-labelledby="svc-toolbox-heading">
          <h2 id="svc-toolbox-heading" className="ag-svc-minihead">
            THE TOOLBOX — ALL IN ACTIVE USE
          </h2>
          <div className="ag-svc-toolgroups">
            {TOOL_GROUPS.map((group) => (
              <div key={group.label} className="ag-svc-toolgroup">
                <p className="ag-svc-toolgroup-label">{group.label}</p>
                <div className="ag-svc-toolchips">
                  {group.tools.map((tool) => (
                    <span key={tool} className="ag-chip ag-chip--sm">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <AgencyFooter />
    </>
  )
}
