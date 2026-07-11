import { Fragment } from 'react'
import type { CaseStudy, PipelineAccent } from '@/data/agency/case-studies'

/**
 * Decorative pipeline header for a case study: accent-tinted icon tiles joined
 * by animated dashed connectors on a 30px grid background. Server component.
 * aria-hidden — the stage labels are repeated as text below the diagram.
 */

const ACCENT_COLOR: Record<PipelineAccent, string> = {
  primary: 'var(--acc-primary)',
  ai: 'var(--acc-ai)',
  browser: 'var(--acc-browser)',
  pass: 'var(--acc-pass)',
  log: 'var(--acc-log)',
  fail: 'var(--acc-fail)',
}

function Glyph({ accent }: { accent: PipelineAccent }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (accent) {
    case 'primary':
      return (
        <svg {...common}>
          <path d="M12 4l8 8-8 8-8-8z" />
        </svg>
      )
    case 'ai':
      return (
        <svg {...common}>
          <path d="M12 3l2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z" />
        </svg>
      )
    case 'browser':
      return (
        <svg {...common}>
          <path d="M8 5l11 7-11 7z" />
        </svg>
      )
    case 'pass':
      return (
        <svg {...common}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'log':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      )
    case 'fail':
      return (
        <svg {...common}>
          <path d="M12 4L2.5 20h19z" />
          <path d="M12 10v4" />
          <path d="M12 17.2v.01" />
        </svg>
      )
  }
}

export function PipelineDiagram({ stages }: { stages: CaseStudy['pipeline'] }) {
  return (
    <div className="ag-pipe" aria-hidden="true">
      <div className="ag-pipe-track">
        {stages.map((stage, index) => (
          <Fragment key={stage.label}>
            {index > 0 ? (
              <svg
                className="ag-pipe-connector"
                viewBox="0 0 60 2"
                preserveAspectRatio="none"
                style={{ color: ACCENT_COLOR[stages[index - 1].accent] }}
              >
                <line
                  className="ag-dashflow"
                  x1="0"
                  y1="1"
                  x2="60"
                  y2="1"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : null}
            <div className="ag-pipe-stage" style={{ color: ACCENT_COLOR[stage.accent] }}>
              <span className="ag-pipe-icon">
                <Glyph accent={stage.accent} />
              </span>
              <span className="ag-pipe-label">{stage.label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
