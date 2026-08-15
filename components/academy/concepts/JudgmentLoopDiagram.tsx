/**
 * The academy's real learning loop — frame → route → map → decide → prove —
 * rendered in the system-map visual language. Server-safe static SVG with
 * SMIL packet motion; honest by construction (it depicts the actual method,
 * not invented architecture).
 */

const NODES = [
  { x: 46, y: 75, label: 'frame', sub: 'the incident as a question' },
  { x: 148, y: 75, label: 'route', sub: 'to the right map' },
  { x: 250, y: 75, label: 'map', sub: 'the system honestly' },
  { x: 352, y: 75, label: 'decide', sub: 'and defend the edges' },
  { x: 454, y: 75, label: 'prove', sub: 'row one of your ledger' },
]

type Props = {
  /** 0-based stage to highlight; defaults to the whole loop */
  activeStage?: number
}

export function JudgmentLoopDiagram({ activeStage }: Props) {
  return (
    <div
      style={{
        border: '1px solid #1E1E24',
        borderRadius: 14,
        background: '#101014',
        padding: '10px 0 4px',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 500 150"
        style={{ display: 'block', width: '100%', height: 'auto' }}
        role="img"
        aria-label="The Sage learning loop: frame the incident, route to the right map, map the system, decide and defend the edges, prove it in your ledger."
      >
        <path d="M46,75 H454" fill="none" stroke="#1E1E24" strokeWidth="1.5" />
        {NODES.map((n, i) => {
          const active = activeStage === undefined || activeStage === i
          const color = active ? '#8FA0FF' : '#3A3A44'
          const ink = active ? '#C7CFFF' : '#5B5B66'
          return (
            <g key={n.label}>
              <circle cx={n.x} cy={n.y} r={10} fill="none" stroke={color} strokeOpacity={0.35} />
              <circle cx={n.x} cy={n.y} r={3.5} fill={color} />
              <text
                x={n.x}
                y={n.y + 28}
                fill={ink}
                fontFamily="var(--font-mono), monospace"
                fontSize="11"
                letterSpacing="0.08em"
                textAnchor="middle"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 42}
                fill="#5B5B66"
                fontFamily="var(--font-mono), monospace"
                fontSize="7.5"
                textAnchor="middle"
              >
                {n.sub}
              </text>
            </g>
          )
        })}
        <circle r="2.8" fill="#8FA0FF" opacity="0.9">
          <animateMotion dur="6s" repeatCount="indefinite" path="M46,75 H454" />
        </circle>
      </svg>
    </div>
  )
}
