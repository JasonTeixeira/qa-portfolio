/**
 * The full 10-stage Sage learning loop in the system-map visual language —
 * the same grammar as the hero system map and JudgmentLoopDiagram, scaled to
 * the complete Frame → Package cycle. Server-safe static SVG; SMIL packet
 * traces the loop. Depicts the actual method, nothing invented.
 */

const STAGES = [
  { label: 'frame', tone: 'accent' },
  { label: 'route', tone: 'accent' },
  { label: 'map', tone: 'accent' },
  { label: 'decide', tone: 'accent' },
  { label: 'prove', tone: 'mastery' },
  { label: 'review', tone: 'mastery' },
  { label: 'repair', tone: 'gold' },
  { label: 'space', tone: 'accent' },
  { label: 'transfer', tone: 'accent' },
  { label: 'package', tone: 'mastery' },
] as const

const TONE_COLOR: Record<string, string> = {
  accent: '#8FA0FF',
  mastery: '#4ADE80',
  gold: '#E0A93E',
}

// Two rows of five, connected left-to-right then wrapping down — reads like a
// circuit, not a bullet list. Top row y=52, bottom row y=132.
const XS = [60, 190, 320, 450, 580]
const TOP_Y = 52
const BOT_Y = 132

function stagePos(i: number): { x: number; y: number } {
  return i < 5 ? { x: XS[i], y: TOP_Y } : { x: XS[9 - i], y: BOT_Y }
}

// Packet path: across the top, down the right edge, back across the bottom
// (right-to-left, matching stage order 6→10), closing the loop up the left.
const PACKET_PATH = `M60,${TOP_Y} H580 V${BOT_Y} H60 V${TOP_Y}`

export function LoopMap() {
  return (
    <div
      style={{
        border: '1px solid #1E1E24',
        borderRadius: 14,
        background: '#101014',
        padding: '8px 0 2px',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 640 180"
        style={{ display: 'block', width: '100%', height: 'auto' }}
        role="img"
        aria-label="The ten-stage Sage learning loop: frame, route, map, decide, prove, review, repair, space, transfer, package — a closed circuit, not a checklist."
      >
        {/* circuit rails */}
        <path d={PACKET_PATH} fill="none" stroke="#1E1E24" strokeWidth="1.5" />
        {STAGES.map((s, i) => {
          const { x, y } = stagePos(i)
          const color = TONE_COLOR[s.tone]
          return (
            <g key={s.label}>
              <circle cx={x} cy={y} r={11} fill="none" stroke={color} strokeOpacity={0.35} />
              <circle cx={x} cy={y} r={3.5} fill={color} />
              <text
                x={x}
                y={y + (i < 5 ? 28 : -20)}
                fill="#9FA6BF"
                fontFamily="var(--font-mono), monospace"
                fontSize="11"
                letterSpacing="0.08em"
                textAnchor="middle"
              >
                {String(i + 1).padStart(2, '0')} {s.label}
              </text>
            </g>
          )
        })}
        <circle r="2.8" fill="#8FA0FF" opacity="0.9">
          <animateMotion dur="12s" repeatCount="indefinite" path={PACKET_PATH} />
        </circle>
      </svg>
    </div>
  )
}
