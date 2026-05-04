import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function NexuralArchitecture() {
  return (
    <DiagramFrame
      title="Nexural Architecture"
      desc="A user request flows from the Next.js frontend to a FastAPI backend, which orchestrates a Postgres database with row-level security, Stripe webhooks, Supabase realtime channels, and a Discord bot powered by GPT-4."
    >
      {/* User */}
      <Box x={40} y={260} w={140} h={64} label="User" sublabel="trader" accent={COLORS.violet} />

      {/* Next.js frontend */}
      <Box x={240} y={260} w={180} h={64} label="Next.js" sublabel="App Router + RSC" accent={COLORS.cyan} />

      {/* FastAPI */}
      <Box x={490} y={260} w={200} h={64} label="FastAPI" sublabel="async / Pydantic" accent={COLORS.cyan} />

      {/* Backend services on the right */}
      <Box x={780} y={60} w={200} h={56} label="Postgres + RLS" sublabel="185 tables" accent={COLORS.emerald} />
      <Box x={780} y={140} w={200} h={56} label="Stripe Webhooks" sublabel="idempotent" accent={COLORS.amber} />
      <Box x={780} y={220} w={200} h={56} label="Supabase Realtime" sublabel="WS channels" accent={COLORS.cyan} />
      <Box x={780} y={300} w={200} h={56} label="Discord Bot" sublabel="GPT-4 tool calls" accent={COLORS.violet} />
      <Box x={780} y={380} w={200} h={56} label="Market Feed" sublabel="WebSocket" accent={COLORS.emerald} />

      {/* CI/CD bottom */}
      <Box x={490} y={460} w={200} h={56} label="GitHub Actions" sublabel="61 test suites" accent={COLORS.amber} />

      {/* Arrows */}
      <Arrow x1={180} y1={292} x2={240} y2={292} label="HTTPS" />
      <Arrow x1={420} y1={292} x2={490} y2={292} label="REST" />

      <Arrow x1={690} y1={278} x2={780} y2={88} label="SQL" />
      <Arrow x1={690} y1={285} x2={780} y2={168} label="events" />
      <Arrow x1={690} y1={292} x2={780} y2={248} />
      <Arrow x1={690} y1={300} x2={780} y2={328} label="API" />
      <Arrow x1={690} y1={308} x2={780} y2={408} label="quotes" dashed />

      {/* Realtime back to frontend */}
      <Arrow x1={780} y1={262} x2={420} y2={282} dashed color={COLORS.violet} label="live updates" />

      {/* CI relation */}
      <Arrow x1={590} y1={460} x2={590} y2={324} dashed color={COLORS.amber} label="deploys" />

      {/* Legend */}
      <Label x={40} y={540} text="LEGEND" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={120} y1={536} x2={150} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={158} y={540} text="REQUEST" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={240} y1={536} x2={270} y2={536} stroke={COLORS.violet} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={278} y={540} text="REALTIME" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
