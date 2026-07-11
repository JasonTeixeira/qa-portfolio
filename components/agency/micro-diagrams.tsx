import type { CSSProperties, ReactElement, ReactNode } from 'react'

/**
 * Six animated micro-diagram motifs — decorative SVG headers for the proof
 * grid cards. Server components, CSS-animated only (dash flows via
 * .ag-dashflow, pulses via .ag-pulse — both reduced-motion-guarded in
 * agency.css). All motifs are aria-hidden; adjacent card copy carries meaning.
 */

const DIM = 'rgba(226, 234, 250, 0.28)'
const DIM_SOFT = 'rgba(226, 234, 250, 0.16)'

function delayStyle(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` }
}

interface MotifShellProps {
  accent: string
  children: ReactNode
}

function MotifShell({ accent, children }: MotifShellProps): ReactElement {
  return (
    <svg
      className="ag-motif"
      viewBox="0 0 400 130"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={{ color: accent }}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

/** input → model → gauge → verdict, with a loop-back return path. */
export function EvalLoopMotif(): ReactElement {
  return (
    <MotifShell accent="var(--acc-ai)">
      <rect x="14" y="46" width="54" height="34" stroke={DIM} strokeWidth="1.5" />
      <path d="M22 56h32M22 63h24M22 70h30" stroke={DIM_SOFT} strokeWidth="1.5" />
      <path className="ag-dashflow" d="M68 63h44" stroke="currentColor" strokeWidth="1.5" />
      <circle className="ag-pulse" cx="140" cy="63" r="22" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M140 51l3.2 8.8 8.8 3.2-8.8 3.2-3.2 8.8-3.2-8.8-8.8-3.2 8.8-3.2z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path className="ag-dashflow" d="M162 63h44" stroke="currentColor" strokeWidth="1.5" style={delayStyle(200)} />
      <path d="M210 74a22 22 0 0 1 44 0" stroke="var(--acc-primary)" strokeWidth="1.8" />
      <path className="ag-pulse" d="M232 74l12-13" stroke="var(--acc-primary)" strokeWidth="1.8" />
      <circle cx="232" cy="74" r="2.5" fill="var(--acc-primary)" stroke="none" />
      <path className="ag-dashflow" d="M256 63h44" stroke="var(--acc-primary)" strokeWidth="1.5" style={delayStyle(400)} />
      <rect x="302" y="46" width="80" height="34" stroke="var(--acc-primary)" strokeWidth="1.6" />
      <path d="M316 63l6 6 12-12" stroke="var(--acc-pass)" strokeWidth="1.8" />
      <path d="M346 58h24M346 64h18M346 70h22" stroke={DIM_SOFT} strokeWidth="1.5" />
      <path
        className="ag-dashflow"
        d="M342 80v20c0 6-5 10-11 10H52c-6 0-11-4-11-10V80"
        stroke={DIM}
        strokeWidth="1.3"
        style={delayStyle(600)}
      />
      <path d="M41 84l-4 7h8z" fill={DIM} stroke="none" />
    </MotifShell>
  )
}

/** Browser window with a grid of crawling check dots. */
export function BrowserGridMotif(): ReactElement {
  const cols = [96, 128, 160, 192, 224, 256, 288]
  const rows = [56, 76, 96]
  return (
    <MotifShell accent="var(--acc-browser)">
      <rect x="70" y="14" width="260" height="102" rx="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M70 38h260" stroke={DIM} strokeWidth="1.5" />
      <circle cx="86" cy="26" r="3" fill="currentColor" stroke="none" />
      <circle cx="98" cy="26" r="3" fill={DIM} stroke="none" />
      <circle cx="110" cy="26" r="3" fill={DIM} stroke="none" />
      <rect x="130" y="21" width="186" height="10" rx="5" stroke={DIM_SOFT} strokeWidth="1.3" />
      {rows.map((y, ri) =>
        cols.map((x, ci) => {
          const i = ri * cols.length + ci
          const isChecked = i % 3 !== 2
          return isChecked ? (
            <path
              key={`${x}-${y}`}
              className="ag-pulse"
              d={`M${x - 4} ${y}l3 3 5.5-6`}
              stroke="currentColor"
              strokeWidth="1.7"
              style={delayStyle(i * 140)}
            />
          ) : (
            <circle
              key={`${x}-${y}`}
              className="ag-pulse"
              cx={x}
              cy={y}
              r="3.5"
              stroke={DIM}
              strokeWidth="1.4"
              style={delayStyle(i * 140)}
            />
          )
        }),
      )}
    </MotifShell>
  )
}

/** Branching DAG, left → right. */
export function WorkflowDagMotif(): ReactElement {
  return (
    <MotifShell accent="var(--acc-primary)">
      <path className="ag-dashflow" d="M36 65C70 65 96 32 128 32" stroke="currentColor" strokeWidth="1.5" />
      <path className="ag-dashflow" d="M36 65C70 65 96 100 128 100" stroke={DIM} strokeWidth="1.5" style={delayStyle(200)} />
      <path className="ag-dashflow" d="M152 32h96" stroke="currentColor" strokeWidth="1.5" style={delayStyle(400)} />
      <path className="ag-dashflow" d="M152 100h96" stroke={DIM} strokeWidth="1.5" style={delayStyle(600)} />
      <path className="ag-dashflow" d="M152 38c40 20 56 42 96 56" stroke={DIM_SOFT} strokeWidth="1.3" style={delayStyle(300)} />
      <path className="ag-dashflow" d="M260 32c40 0 66 33 100 33" stroke="currentColor" strokeWidth="1.5" style={delayStyle(500)} />
      <path className="ag-dashflow" d="M260 100c40 0 66-35 100-35" stroke={DIM} strokeWidth="1.5" style={delayStyle(700)} />
      <circle cx="28" cy="65" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle className="ag-pulse" cx="28" cy="65" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="140" cy="32" r="10" stroke="currentColor" strokeWidth="1.6" />
      <circle className="ag-pulse" cx="140" cy="32" r="3.5" fill="currentColor" stroke="none" style={delayStyle(300)} />
      <circle cx="140" cy="100" r="10" stroke={DIM} strokeWidth="1.6" />
      <rect x="240" y="22" width="20" height="20" stroke="currentColor" strokeWidth="1.6" />
      <rect x="240" y="90" width="20" height="20" stroke={DIM} strokeWidth="1.6" />
      <circle cx="372" cy="65" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M367 65l3.5 3.5 6.5-7" stroke="var(--acc-pass)" strokeWidth="1.8" />
    </MotifShell>
  )
}

/** Wide pipeline narrowing into a shield gate, then a pass/fail split. */
export function GateFunnelMotif(): ReactElement {
  return (
    <MotifShell accent="var(--acc-pass)">
      <path d="M12 24C80 24 120 48 172 52" stroke={DIM} strokeWidth="1.5" />
      <path d="M12 106C80 106 120 82 172 78" stroke={DIM} strokeWidth="1.5" />
      <path className="ag-dashflow" d="M12 44C80 44 124 56 172 59" stroke={DIM_SOFT} strokeWidth="1.3" />
      <path className="ag-dashflow" d="M12 65h160" stroke={DIM_SOFT} strokeWidth="1.3" style={delayStyle(200)} />
      <path className="ag-dashflow" d="M12 86C80 86 124 74 172 71" stroke={DIM_SOFT} strokeWidth="1.3" style={delayStyle(400)} />
      <path
        d="M200 40l18 7v14c0 12-8 20-18 25-10-5-18-13-18-25V47z"
        stroke="var(--tx-2)"
        strokeWidth="1.8"
        fill="var(--ag-bg-deep)"
      />
      <path d="M193 64l5 5 10-11" stroke="currentColor" strokeWidth="1.8" />
      <path className="ag-dashflow" d="M222 58C270 50 320 38 380 34" stroke="currentColor" strokeWidth="2" style={delayStyle(100)} />
      <circle className="ag-pulse" cx="384" cy="34" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M380.5 34l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" />
      <path className="ag-dashflow" d="M222 72C266 82 306 92 356 98" stroke="var(--acc-fail)" strokeWidth="1.5" style={delayStyle(500)} />
      <circle className="ag-pulse" cx="362" cy="99" r="7" stroke="var(--acc-fail)" strokeWidth="1.6" style={delayStyle(500)} />
      <path d="M359.5 96.5l5 5m0-5l-5 5" stroke="var(--acc-fail)" strokeWidth="1.6" />
    </MotifShell>
  )
}

/** model → human → queue approval cycle. */
export function ApprovalLoopMotif(): ReactElement {
  return (
    <MotifShell accent="var(--acc-log)">
      <path className="ag-dashflow" d="M136 38C170 24 230 24 264 38" stroke="currentColor" strokeWidth="1.5" />
      <path d="M258 32l8 5-9 3z" fill="currentColor" stroke="none" />
      <path className="ag-dashflow" d="M292 62C280 82 250 96 226 100" stroke="currentColor" strokeWidth="1.5" style={delayStyle(400)} />
      <path d="M234 104l-9 1 5-8z" fill="currentColor" stroke="none" />
      <path className="ag-dashflow" d="M174 100C150 96 120 82 108 62" stroke="currentColor" strokeWidth="1.5" style={delayStyle(800)} />
      <path d="M106 70l1-9 7 5z" fill="currentColor" stroke="none" />
      <circle className="ag-pulse" cx="112" cy="44" r="21" stroke="var(--acc-ai)" strokeWidth="1.6" />
      <path
        d="M112 33l2.9 8.1 8.1 2.9-8.1 2.9-2.9 8.1-2.9-8.1-8.1-2.9 8.1-2.9z"
        stroke="var(--acc-ai)"
        strokeWidth="1.3"
      />
      <circle cx="288" cy="44" r="21" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="288" cy="39" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M279 55c1-5 4-7.5 9-7.5s8 2.5 9 7.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="176" y="84" width="48" height="34" stroke="currentColor" strokeWidth="1.6" />
      <path d="M184 93h24M184 101h32M184 109h20" stroke={DIM} strokeWidth="1.5" />
      <path className="ag-pulse" d="M212 91.5l3 3 5-6" stroke="var(--acc-pass)" strokeWidth="1.6" style={delayStyle(600)} />
    </MotifShell>
  )
}

/** Root doc branching to leaf docs. */
export function DocTreeMotif(): ReactElement {
  const leafYs = [10, 42, 74, 106]
  return (
    <MotifShell accent="var(--acc-log)">
      <path d="M26 40h32l12 12v38H26z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M58 40v12h12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M34 62h22M34 70h16M34 78h20" stroke={DIM} strokeWidth="1.5" />
      {leafYs.map((y, i) => (
        <path
          key={y}
          className="ag-dashflow"
          d={`M70 65C160 65 220 ${y + 12} 306 ${y + 12}`}
          stroke="currentColor"
          strokeWidth="1.4"
          style={delayStyle(i * 250)}
        />
      ))}
      {leafYs.map((y, i) => (
        <g key={y} className="ag-pulse" style={delayStyle(i * 250)}>
          <path d={`M310 ${y}h30l8 8v16h-38z`} stroke="currentColor" strokeWidth="1.5" />
          <path d={`M316 ${y + 11}h20M316 ${y + 17}h14`} stroke={DIM} strokeWidth="1.3" />
        </g>
      ))}
    </MotifShell>
  )
}
