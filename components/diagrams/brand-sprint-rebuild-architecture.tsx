import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function BrandSprintRebuildArchitecture() {
  return (
    <DiagramFrame
      title="Brand Sprint Process"
      desc="A linear five-stage flow: discovery interviews establish positioning, which informs visual system design, then a component library, culminating in launch."
    >
      {/* 5 stages horizontal */}
      <Box x={40} y={240} w={180} h={100} label="1 · Discovery" sublabel="interviews / audit" accent={COLORS.violet} />
      <Box x={260} y={240} w={180} h={100} label="2 · Positioning" sublabel="messaging frame" accent={COLORS.violet} />
      <Box x={480} y={240} w={180} h={100} label="3 · Visual System" sublabel="type · color · motion" accent={COLORS.cyan} />
      <Box x={700} y={240} w={180} h={100} label="4 · Component Library" sublabel="Tailwind tokens" accent={COLORS.cyan} />
      <Box x={920} y={240} w={180} h={100} label="5 · Launch" sublabel="ship + monitor" accent={COLORS.emerald} />

      {/* Arrows between */}
      <Arrow x1={220} y1={290} x2={260} y2={290} />
      <Arrow x1={440} y1={290} x2={480} y2={290} />
      <Arrow x1={660} y1={290} x2={700} y2={290} />
      <Arrow x1={880} y1={290} x2={920} y2={290} />

      {/* Deliverable badges below each */}
      <g>
        <rect x={50} y={370} width={160} height={30} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={130} y={390} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">findings doc</text>
      </g>
      <g>
        <rect x={270} y={370} width={160} height={30} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={350} y={390} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">brand brief</text>
      </g>
      <g>
        <rect x={490} y={370} width={160} height={30} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={570} y={390} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">design tokens</text>
      </g>
      <g>
        <rect x={710} y={370} width={160} height={30} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={790} y={390} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">React + Storybook</text>
      </g>
      <g>
        <rect x={930} y={370} width={160} height={30} rx={6} fill={COLORS.bg} stroke={COLORS.border} />
        <text x={1010} y={390} textAnchor="middle" fill={COLORS.textMuted} fontSize={11} fontFamily="ui-monospace, monospace">live site</text>
      </g>

      {/* Timeline header */}
      <Label x={40} y={180} text="WEEK 1" color={COLORS.textDim} size={11} anchor="start" />
      <Label x={260} y={180} text="WEEK 1 → 2" color={COLORS.textDim} size={11} anchor="start" />
      <Label x={480} y={180} text="WEEK 2" color={COLORS.textDim} size={11} anchor="start" />
      <Label x={700} y={180} text="WEEK 2" color={COLORS.textDim} size={11} anchor="start" />
      <Label x={920} y={180} text="WEEK 2" color={COLORS.textDim} size={11} anchor="start" />

      {/* Top rule with timeline */}
      <line x1={40} y1={200} x2={1100} y2={200} stroke={COLORS.border} strokeWidth={1} />

      {/* Bottom: outcomes summary */}
      <Box x={350} y={460} w={500} h={70} label="Outcome" sublabel="cohesive brand · ready for traffic" accent={COLORS.amber} />
      <Arrow x1={1010} y1={400} x2={850} y2={485} dashed color={COLORS.amber} />
      <Arrow x1={130} y1={400} x2={350} y2={485} dashed color={COLORS.amber} />
    </DiagramFrame>
  )
}
