import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AiImplementationConsultingFlow() {
  return (
    <DiagramFrame
      viewBox="0 0 1200 500"
      title="AI Implementation Consulting Flow"
      desc="A five-stage horizontal flow: discovery audit, use-case prioritization, pilot scoping, ship, and measure — with a deliverable badge under each stage."
    >
      {/* Top rule */}
      <line x1={40} y1={100} x2={1160} y2={100} stroke={COLORS.border} strokeWidth={1} />
      <Label x={40} y={84} text="ENGAGEMENT TIMELINE" anchor="start" color={COLORS.textDim} size={11} />

      {/* 5 Stages */}
      <Box x={40} y={140} w={200} h={120} label="1 · Discovery Audit" sublabel="systems · workflows · data" accent={COLORS.violet} fontSize={15} />
      <Box x={280} y={140} w={200} h={120} label="2 · Prioritize" sublabel="ICE-rank use cases" accent={COLORS.violet} fontSize={15} />
      <Box x={520} y={140} w={200} h={120} label="3 · Scope Pilot" sublabel="success criteria" accent={COLORS.cyan} fontSize={15} />
      <Box x={760} y={140} w={200} h={120} label="4 · Ship" sublabel="working pilot, prod-grade" accent={COLORS.cyan} fontSize={15} />
      <Box x={1000} y={140} w={160} h={120} label="5 · Measure" sublabel="metrics · ROI" accent={COLORS.emerald} fontSize={15} />

      {/* Arrows */}
      <Arrow x1={240} y1={200} x2={280} y2={200} />
      <Arrow x1={480} y1={200} x2={520} y2={200} />
      <Arrow x1={720} y1={200} x2={760} y2={200} />
      <Arrow x1={960} y1={200} x2={1000} y2={200} />

      {/* Deliverable badges below */}
      <g>
        <rect x={50} y={290} width={180} height={36} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={140} y={313} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">audit report</text>
      </g>
      <g>
        <rect x={290} y={290} width={180} height={36} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={380} y={313} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">use-case roadmap</text>
      </g>
      <g>
        <rect x={530} y={290} width={180} height={36} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={620} y={313} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">pilot SOW</text>
      </g>
      <g>
        <rect x={770} y={290} width={180} height={36} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={860} y={313} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">working agent</text>
      </g>
      <g>
        <rect x={1010} y={290} width={140} height={36} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={1080} y={313} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">scorecard</text>
      </g>

      {/* Time labels */}
      <Label x={140} y={400} text="WEEK 1–2" color={COLORS.cyan} size={11} />
      <Label x={380} y={400} text="WEEK 2–3" color={COLORS.cyan} size={11} />
      <Label x={620} y={400} text="WEEK 3–4" color={COLORS.cyan} size={11} />
      <Label x={860} y={400} text="WEEK 4–7" color={COLORS.cyan} size={11} />
      <Label x={1080} y={400} text="WEEK 7–8" color={COLORS.cyan} size={11} />

      {/* Bottom outcome rail */}
      <line x1={40} y1={440} x2={1160} y2={440} stroke={COLORS.cyan} strokeWidth={1.5} opacity={0.5} />
      <Label x={600} y={465} text="OUTCOME · A working agent in production with measurable lift, ready to scale" color={COLORS.text} size={12} weight={600} mono={false} />
    </DiagramFrame>
  )
}
