import type { CSSProperties, ReactElement } from 'react'

import { Reveal } from '@/components/agency/core'
import { SectionShell } from '@/components/agency/section-shell'

/**
 * Section 05 — skills as one system map: a center hub ("automation that
 * proves itself") with six outcome nodes around it, each carrying its tool
 * names as mono satellite chips. Desktop renders the SVG map (decorative,
 * aria-hidden); <720px renders the same content as a 2-col card grid.
 * Tool lists are verbatim from the original six-cell version.
 */

type SkillGlyphId = 'sparkle' | 'browser' | 'gear' | 'shield' | 'bug' | 'doc'

interface SkillNode {
  outcome: string
  tools: string
  accent: string
  glyph: SkillGlyphId
  /** node center in the 1160×560 map viewBox */
  x: number
  y: number
  /** satellite chip stack anchor */
  chipX: number
  chipY: number
  chipAnchor: 'start' | 'end'
}

const SKILL_NODES: readonly SkillNode[] = [
  {
    outcome: 'Build AI workflows',
    tools:
      'Claude / OpenAI APIs · RAG pipelines · prompt evaluation · retrieval testing · source grounding',
    accent: 'var(--acc-ai)',
    glyph: 'sparkle',
    x: 340, y: 105, chipX: 272, chipY: 55, chipAnchor: 'end',
  },
  {
    outcome: 'Test software systems',
    tools:
      'Playwright · unit / integration / E2E · accessibility checks · visual regression · API smoke tests',
    accent: 'var(--acc-browser)',
    glyph: 'browser',
    x: 840, y: 105, chipX: 908, chipY: 55, chipAnchor: 'start',
  },
  {
    outcome: 'Automate operations',
    tools:
      'Node.js · Python · scheduled jobs · webhooks · Discord / Slack workflows · report generation',
    accent: 'var(--acc-pass)',
    glyph: 'gear',
    x: 1005, y: 300, chipX: 938, chipY: 189, chipAnchor: 'end',
  },
  {
    outcome: 'Validate releases',
    tools:
      'build / typecheck / lint gates · test suites · API smoke checks · readiness reports · rollback notes',
    accent: 'var(--acc-primary)',
    glyph: 'shield',
    x: 840, y: 475, chipX: 908, chipY: 428, chipAnchor: 'start',
  },
  {
    outcome: 'Debug failures',
    tools:
      'reproduction steps · log review · flaky test diagnosis · root-cause notes · fix verification',
    accent: 'var(--acc-fail)',
    glyph: 'bug',
    x: 340, y: 475, chipX: 272, chipY: 428, chipAnchor: 'end',
  },
  {
    outcome: 'Document handoff-ready systems',
    tools: 'runbooks · workflow maps · architecture diagrams · QA checklists · operating notes',
    accent: 'var(--acc-log)',
    glyph: 'doc',
    x: 155, y: 300, chipX: 48, chipY: 196, chipAnchor: 'start',
  },
]

const HUB = { x: 580, y: 285, r: 84 } as const
const NODE_R = 38
const CHIP_STEP = 15

const SKILL_GLYPHS: Record<SkillGlyphId, ReactElement> = {
  sparkle: <path d="M12 3l1.9 7.1L21 12l-7.1 1.9L12 21l-1.9-7.1L3 12l7.1-1.9z" />,
  browser: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18" />
      <path d="M8.5 14.5l2.3 2.3 4.7-5.3" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 4.5v2.3M12 17.2v2.3M19.5 12h-2.3M6.8 12H4.5M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6M17.3 17.3l-1.6-1.6M8.3 8.3L6.7 6.7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3.3 8.4-7 10-3.7-1.6-7-5-7-10V6z" />
      <path d="M8.8 12l2.2 2.2 4.2-4.7" />
    </>
  ),
  bug: (
    <>
      <circle cx="12" cy="13.5" r="4.5" />
      <path d="M9.5 6.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5M9 10l-4-2M15 10l4-2M7.5 14H3.5M16.5 14h4M9 17.5l-3.5 2.5M15 17.5l3.5 2.5" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </>
  ),
}

function SkillGlyph({ glyph }: { glyph: SkillGlyphId }): ReactElement {
  return (
    <svg
      className="ag-skillmap-card-glyph"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {SKILL_GLYPHS[glyph]}
    </svg>
  )
}

function SkillMapSvg(): ReactElement {
  return (
    <svg
      className="ag-skillmap"
      viewBox="0 0 1160 560"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* edges */}
      {SKILL_NODES.map((n, i) => (
        <line
          key={n.outcome}
          className="ag-dashflow"
          x1={HUB.x}
          y1={HUB.y}
          x2={n.x}
          y2={n.y}
          stroke={n.accent}
          strokeWidth="1.5"
          opacity="0.55"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
      {/* hub */}
      <circle
        cx={HUB.x}
        cy={HUB.y}
        r={HUB.r + 13}
        fill="none"
        stroke="rgba(160, 185, 235, 0.18)"
        strokeWidth="1"
        strokeDasharray="4 7"
      />
      <circle
        cx={HUB.x}
        cy={HUB.y}
        r={HUB.r}
        fill="var(--ag-bg-deep)"
        stroke="var(--acc-primary)"
        strokeWidth="1.8"
      />
      <text className="ag-skillmap-hub-text" x={HUB.x} y={HUB.y - 16} textAnchor="middle">
        AUTOMATION
      </text>
      <text className="ag-skillmap-hub-text" x={HUB.x} y={HUB.y + 6} textAnchor="middle">
        THAT PROVES
      </text>
      <text className="ag-skillmap-hub-text" x={HUB.x} y={HUB.y + 28} textAnchor="middle">
        ITSELF
      </text>
      {/* outcome nodes */}
      {SKILL_NODES.map((n) => (
        <g key={n.outcome} style={{ color: n.accent } as CSSProperties}>
          <circle
            cx={n.x}
            cy={n.y}
            r={NODE_R}
            fill="var(--ag-raised)"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle className="ag-pulse" cx={n.x} cy={n.y} r={NODE_R + 7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
          <g
            transform={`translate(${n.x - 16}, ${n.y - 16}) scale(1.333)`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {SKILL_GLYPHS[n.glyph]}
          </g>
          <text className="ag-skillmap-node-label" x={n.x} y={n.y + NODE_R + 26} textAnchor="middle">
            {n.outcome}
          </text>
          {n.tools.split(' · ').map((tool, ti) => (
            <text
              key={tool}
              className="ag-skillmap-chip"
              x={n.chipX}
              y={n.chipY + ti * CHIP_STEP}
              textAnchor={n.chipAnchor}
            >
              {tool}
            </text>
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Section 05 — skills grouped by the outcome they produce, not the tool. */
export function SkillsSection() {
  return (
    <SectionShell
      id="skills"
      num="05"
      kicker="SKILLS, ORGANIZED BY OUTCOME"
      annotation="NOT A TOOL LIST"
      ghost="05"
    >
      <Reveal>
        <div className="ag-skillmap-frame">
          <SkillMapSvg />
        </div>

        {/* <720px: same content as compact node cards */}
        <div className="ag-skillmap-cards">
          {SKILL_NODES.map((n) => (
            <article
              key={n.outcome}
              className="ag-skillmap-card"
              style={{ '--node-acc': n.accent } as CSSProperties}
            >
              <SkillGlyph glyph={n.glyph} />
              <h3 className="ag-skillmap-card-outcome">{n.outcome}</h3>
              <p className="ag-skillmap-card-tools">{n.tools}</p>
            </article>
          ))}
        </div>

        {/* plain mono outcome row — accessible text for the decorative map */}
        <ul className="ag-skillmap-row">
          {SKILL_NODES.map((n) => (
            <li key={n.outcome} className="ag-skillmap-row-item">
              {n.outcome}
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}
