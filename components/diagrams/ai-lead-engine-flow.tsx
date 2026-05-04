import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AiLeadEngineFlow() {
  return (
    <DiagramFrame
      viewBox="0 0 1200 500"
      title="AI Lead Engine Flow"
      desc="Firmographic and intent signals feed an enrichment service; a scoring agent ranks the leads and a personalization agent crafts outreach for parallel email and LinkedIn delivery, with replies routed back to a handler."
    >
      {/* Sources */}
      <Box x={30} y={130} w={170} h={70} label="Firmographic" sublabel="Apollo / Clearbit" accent={COLORS.violet} />
      <Box x={30} y={230} w={170} h={70} label="Intent Signals" sublabel="G2 / 6sense" accent={COLORS.violet} />
      <Box x={30} y={330} w={170} h={70} label="ICP Filters" sublabel="vertical · revenue" accent={COLORS.violet} />

      {/* Enrichment */}
      <Box x={240} y={210} w={180} h={80} label="Enrichment" sublabel="merge + dedupe" accent={COLORS.cyan} />

      {/* Scoring agent */}
      <Box x={460} y={210} w={200} h={80} label="Scoring Agent" sublabel="fit × intent → score" accent={COLORS.cyan} fontSize={15} />

      {/* Personalization agent */}
      <Box x={700} y={210} w={200} h={80} label="Personalization" sublabel="hook · proof · CTA" accent={COLORS.amber} fontSize={15} />

      {/* Multichannel send */}
      <Box x={940} y={130} w={220} h={70} label="Email Send" sublabel="warm domain" accent={COLORS.amber} />
      <Box x={940} y={230} w={220} h={70} label="LinkedIn Send" sublabel="conn · message" accent={COLORS.amber} />

      {/* Reply handler */}
      <Box x={940} y={350} w={220} h={80} label="Reply Handler" sublabel="classify + route" accent={COLORS.emerald} />

      {/* Source -> enrichment */}
      <Arrow x1={200} y1={165} x2={240} y2={230} />
      <Arrow x1={200} y1={265} x2={240} y2={250} label="sync" />
      <Arrow x1={200} y1={365} x2={240} y2={270} />

      {/* Pipeline */}
      <Arrow x1={420} y1={250} x2={460} y2={250} />
      <Arrow x1={660} y1={250} x2={700} y2={250} />

      {/* To channels */}
      <Arrow x1={900} y1={235} x2={940} y2={165} label="parallel" />
      <Arrow x1={900} y1={250} x2={940} y2={265} />

      {/* Replies back */}
      <Arrow x1={1050} y1={300} x2={1050} y2={350} dashed color={COLORS.emerald} label="reply" />
      <Arrow x1={1050} y1={200} x2={1050} y2={170} dashed color={COLORS.emerald} />

      {/* Loop back to scoring with new signal */}
      <path d="M 940 390 Q 600 470 560 290" stroke={COLORS.emerald} strokeWidth={1.5} fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-emerald-feedback)" opacity={0.7} />
      <Label x={620} y={460} text="ENGAGEMENT FEEDBACK → RESCORE" color={COLORS.emerald} size={10} />

      <defs>
        <marker id="arrow-emerald-feedback" markerWidth={10} markerHeight={10} refX={8} refY={5} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={COLORS.emerald} />
        </marker>
      </defs>
    </DiagramFrame>
  )
}
