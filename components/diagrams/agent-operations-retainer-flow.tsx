import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AgentOperationsRetainerFlow() {
  return (
    <DiagramFrame
      viewBox="0 0 1200 500"
      title="Agent Operations Retainer Cycle"
      desc="A cyclical operations loop: monitoring (latency, eval, cost) → drift detection → eval harness → patch deploy → reporting, with arrows returning to monitoring."
    >
      {/* 5 stages around a cycle */}
      <Box x={460} y={40} w={280} h={80} label="1 · Monitoring" sublabel="latency · eval · cost" accent={COLORS.cyan} fontSize={15} />
      <Box x={830} y={170} w={260} h={80} label="2 · Drift Detection" sublabel="distribution shift · regressions" accent={COLORS.amber} fontSize={15} />
      <Box x={750} y={350} w={260} h={80} label="3 · Eval Harness" sublabel="golden set · A/B" accent={COLORS.violet} fontSize={15} />
      <Box x={190} y={350} w={260} h={80} label="4 · Patch Deploy" sublabel="canary + rollback" accent={COLORS.rose} fontSize={15} />
      <Box x={110} y={170} w={260} h={80} label="5 · Reporting" sublabel="weekly · monthly" accent={COLORS.emerald} fontSize={15} />

      {/* Cycle arrows (clockwise) */}
      <Arrow x1={740} y1={100} x2={830} y2={185} label="signal" />
      <Arrow x1={920} y1={250} x2={880} y2={350} label="rerun" />
      <Arrow x1={750} y1={400} x2={450} y2={400} label="ship fix" />
      <Arrow x1={250} y1={350} x2={240} y2={250} label="record" />
      <Arrow x1={370} y1={210} x2={460} y2={100} label="rollup" />

      {/* Center label */}
      <circle cx={600} cy={250} r={70} fill={COLORS.surface} stroke={COLORS.borderStrong} strokeWidth={1.5} />
      <text x={600} y={245} textAnchor="middle" fill={COLORS.cyan} fontSize={13} fontWeight={700} fontFamily="ui-sans-serif, system-ui">CONTINUOUS</text>
      <text x={600} y={263} textAnchor="middle" fill={COLORS.text} fontSize={11} fontFamily="ui-monospace, monospace">monthly retainer</text>

      {/* Side legend */}
      <Label x={40} y={480} text="CYCLE · arrows clockwise · feedback never stops" anchor="start" color={COLORS.textDim} size={11} />
    </DiagramFrame>
  )
}
