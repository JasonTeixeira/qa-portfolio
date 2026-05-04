import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AiAgentDevelopmentFlow() {
  return (
    <DiagramFrame
      viewBox="0 0 1200 500"
      title="AI Agent Flow"
      desc="A user intent enters a router agent which dispatches to four tool-using sub-agents (search, database, file ops, API caller), the responses pass through a validation layer before returning."
    >
      {/* User intent */}
      <Box x={30} y={210} w={170} h={80} label="User Intent" sublabel="task / question" accent={COLORS.violet} />

      {/* Router agent */}
      <Box x={250} y={200} w={200} h={100} label="Router Agent" sublabel="classify + plan" accent={COLORS.cyan} fontSize={16} />

      {/* Sub-agents (radial right) */}
      <Box x={520} y={60} w={220} h={70} label="Search Sub-Agent" sublabel="tool: web · vector" accent={COLORS.amber} />
      <Box x={520} y={160} w={220} h={70} label="Database Sub-Agent" sublabel="tool: SQL · query" accent={COLORS.amber} />
      <Box x={520} y={260} w={220} h={70} label="File Sub-Agent" sublabel="tool: read · write" accent={COLORS.amber} />
      <Box x={520} y={360} w={220} h={70} label="API Sub-Agent" sublabel="tool: REST · webhook" accent={COLORS.amber} />

      {/* Validation layer */}
      <Box x={800} y={180} w={220} h={140} label="Validation Layer" sublabel="schema · safety · eval" accent={COLORS.rose} fontSize={15} />

      {/* Response */}
      <Box x={1060} y={210} w={120} h={80} label="Response" accent={COLORS.emerald} />

      {/* Arrows */}
      <Arrow x1={200} y1={250} x2={250} y2={250} label="prompt" />

      {/* Router -> sub-agents */}
      <Arrow x1={450} y1={235} x2={520} y2={95} label="dispatch" />
      <Arrow x1={450} y1={245} x2={520} y2={195} />
      <Arrow x1={450} y1={255} x2={520} y2={295} />
      <Arrow x1={450} y1={265} x2={520} y2={395} />

      {/* Sub-agents -> validation */}
      <Arrow x1={740} y1={95} x2={800} y2={210} dashed color={COLORS.amber} />
      <Arrow x1={740} y1={195} x2={800} y2={230} dashed color={COLORS.amber} label="results" />
      <Arrow x1={740} y1={295} x2={800} y2={270} dashed color={COLORS.amber} />
      <Arrow x1={740} y1={395} x2={800} y2={290} dashed color={COLORS.amber} />

      {/* Validation -> response */}
      <Arrow x1={1020} y1={250} x2={1060} y2={250} label="approve" color={COLORS.emerald} />

      {/* Reject loop back to router */}
      <path d="M 910 320 Q 910 470 350 470 Q 350 300 350 300" stroke={COLORS.rose} strokeWidth={1.5} fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-F43F5E-d)" opacity={0.7} />
      <Label x={620} y={460} text="REJECT → REPLAN" color={COLORS.rose} size={10} />

      <defs>
        <marker id="arrow-F43F5E-d" markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.rose} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}
