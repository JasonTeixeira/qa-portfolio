import { SectionShell } from '@/components/agency/section-shell'
import {
  DIAG_ACCENT,
  DiagBadgePin,
  DiagEdge,
  DiagFrame,
  DiagNode,
  type DiagAccent,
} from '@/components/agency/diagrams/primitives'
import type { GlyphKind } from '@/components/agency/diagrams/glyphs'
import { Reveal } from '@/components/agency/core'
import '@/app/agency/services/services.css'

/**
 * Section 08 — HOW AN ENGAGEMENT RUNS. One horizontal five-stage diagram with
 * the artifact each stage leaves behind pinned underneath. Server component;
 * all motion is the CSS dash-flow / pulse already defined in agency.css.
 * Mounts directly before the contact section (integrator renumbers contact).
 */

interface EngagementStage {
  label: string
  glyph: GlyphKind
  accent: DiagAccent
  artifact: string
}

const STAGES: readonly EngagementStage[] = [
  { label: 'AUDIT', glyph: 'log', accent: 'log', artifact: 'FINDINGS DOC' },
  { label: 'SPEC', glyph: 'report', accent: 'ai', artifact: 'SCOPED PLAN' },
  { label: 'BUILD', glyph: 'pipeline', accent: 'primary', artifact: 'WORKING SYSTEM' },
  { label: 'VERIFY', glyph: 'eval', accent: 'browser', artifact: 'PROOF REPORT' },
  { label: 'HANDOFF', glyph: 'human', accent: 'pass', artifact: 'RUNBOOK + WALKTHROUGH' },
]

const DIAG_W = 1000
const DIAG_H = 248
const NODE_Y = 104
const PIN_Y = 214
/** node half-width (sm = 59) + breathing room before the edge starts */
const EDGE_GAP = 66
const FIRST_X = 110
const LAST_X = DIAG_W - 110

/** Mirrors the width formula inside DiagBadgePin so pins center under nodes. */
function pinWidth(label: string): number {
  return label.length * 6.9 + 26
}

export function ProcessSection() {
  const step = (LAST_X - FIRST_X) / (STAGES.length - 1)
  const xs = STAGES.map((_, i) => FIRST_X + step * i)

  return (
    <SectionShell id="process" num="08" kicker="HOW AN ENGAGEMENT RUNS" ghost="08">
      <div className="ag-proc">
        <p className="ag-vh">
          Every engagement runs the same five stages: audit (you get a findings doc), spec (a
          scoped plan), build (a working system), verify (a proof report), and handoff (a runbook
          plus a recorded walkthrough).
        </p>
        <Reveal>
          <div className="ag-proc-diag">
            <DiagFrame uid="proc-home" viewW={DIAG_W} viewH={DIAG_H}>
              {STAGES.map((stage, i) =>
                i < STAGES.length - 1 ? (
                  <DiagEdge
                    key={`${stage.label}-edge`}
                    from={{ x: xs[i] + EDGE_GAP, y: NODE_Y }}
                    to={{ x: xs[i + 1] - EDGE_GAP, y: NODE_Y }}
                    accent={STAGES[i + 1].accent}
                  />
                ) : null,
              )}
              {STAGES.map((stage, i) => (
                <g key={stage.label}>
                  {/* dashed drop line: stage → the artifact it leaves behind */}
                  <path
                    d={`M${xs[i]} ${NODE_Y + 37} V${PIN_Y - 11}`}
                    fill="none"
                    stroke={DIAG_ACCENT[stage.accent]}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.5}
                  />
                  <DiagNode
                    uid="proc-home"
                    x={xs[i]}
                    y={NODE_Y}
                    glyph={stage.glyph}
                    label={stage.label}
                    accent={stage.accent}
                    size="sm"
                    pulse={i === STAGES.length - 1}
                  />
                  <DiagBadgePin
                    x={xs[i] - pinWidth(stage.artifact) / 2}
                    y={PIN_Y}
                    kind="artifact"
                    label={stage.artifact}
                    accent={stage.accent}
                  />
                </g>
              ))}
            </DiagFrame>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="ag-proc-foot">
            <p className="ag-proc-note">
              Five stages, five artifacts — every engagement ends with a proof report and a
              runbook, not a goodbye email.
            </p>
            <a href="/services" className="ag-proc-link">
              SEE THE SERVICES →
            </a>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}
