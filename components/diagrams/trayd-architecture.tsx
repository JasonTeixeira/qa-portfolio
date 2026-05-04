import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function TraydArchitecture() {
  return (
    <DiagramFrame
      title="Trayd AI Companion Architecture"
      desc="A bilingual mobile app routes user voice and text through a central AI agent, which dispatches to estimate-builder, diagnostic, and callback-scheduling tools, persisting outcomes to a CRM."
    >
      {/* Mobile app */}
      <Box x={40} y={260} w={170} h={70} label="Mobile App" sublabel="iOS / Android" accent={COLORS.amber} />

      {/* Voice/Text input */}
      <Box x={250} y={180} w={170} h={56} label="Voice Input" sublabel="EN / ES" accent={COLORS.cyan} />
      <Box x={250} y={350} w={170} h={56} label="Text Input" sublabel="chat" accent={COLORS.cyan} />

      {/* AI agent (central) */}
      <Box x={470} y={250} w={220} h={90} label="Bilingual AI Agent" sublabel="intent + dispatch" accent={COLORS.violet} fontSize={15} />

      {/* Tools */}
      <Box x={750} y={120} w={200} h={56} label="Estimate Builder" sublabel="line-item pricing" accent={COLORS.amber} />
      <Box x={750} y={210} w={200} h={56} label="Diagnostic Tool" sublabel="symptom flow" accent={COLORS.amber} />
      <Box x={750} y={300} w={200} h={56} label="Callback Scheduler" sublabel="calendar slots" accent={COLORS.amber} />
      <Box x={750} y={390} w={200} h={56} label="Photo Analysis" sublabel="vision" accent={COLORS.amber} />

      {/* CRM at end */}
      <Box x={1000} y={250} w={170} h={90} label="CRM" sublabel="lead + ticket" accent={COLORS.emerald} />

      {/* Arrows */}
      <Arrow x1={210} y1={280} x2={250} y2={208} label="speech" />
      <Arrow x1={210} y1={310} x2={250} y2={378} label="text" />
      <Arrow x1={420} y1={208} x2={470} y2={278} />
      <Arrow x1={420} y1={378} x2={470} y2={312} />

      {/* Agent -> tools */}
      <Arrow x1={690} y1={272} x2={750} y2={148} label="tool call" />
      <Arrow x1={690} y1={285} x2={750} y2={238} />
      <Arrow x1={690} y1={300} x2={750} y2={328} />
      <Arrow x1={690} y1={315} x2={750} y2={418} />

      {/* Tools -> CRM */}
      <Arrow x1={950} y1={148} x2={1000} y2={272} dashed color={COLORS.emerald} />
      <Arrow x1={950} y1={238} x2={1000} y2={285} dashed color={COLORS.emerald} />
      <Arrow x1={950} y1={328} x2={1000} y2={305} dashed color={COLORS.emerald} label="persist" />
      <Arrow x1={950} y1={418} x2={1000} y2={320} dashed color={COLORS.emerald} />

      {/* Response back to mobile */}
      <Arrow x1={580} y1={340} x2={125} y2={330} dashed color={COLORS.cyan} label="response" />

      {/* Legend */}
      <Label x={40} y={540} text="INPUT" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={90} y1={536} x2={120} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={128} y={540} text="USER ↔ AGENT" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={235} y1={536} x2={265} y2={536} stroke={COLORS.emerald} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={273} y={540} text="WRITE TO CRM" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
