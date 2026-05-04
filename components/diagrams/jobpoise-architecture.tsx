import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function JobpoiseArchitecture() {
  return (
    <DiagramFrame
      title="Jobpoise Architecture"
      desc="Three user surfaces (web app, Chrome extension, Gmail OAuth flow) feed a citation-grounded AI layer powered by GPT-4 with retrieval, fronted by Stripe billing across three subscription tiers."
    >
      {/* User */}
      <Box x={40} y={260} w={140} h={64} label="User" sublabel="job seeker" accent={COLORS.violet} />

      {/* Three surfaces */}
      <Box x={240} y={120} w={200} h={56} label="Web App" sublabel="Next.js dashboard" accent={COLORS.cyan} />
      <Box x={240} y={260} w={200} h={56} label="Chrome Extension" sublabel="job-board overlay" accent={COLORS.cyan} />
      <Box x={240} y={400} w={200} h={56} label="Gmail OAuth" sublabel="reply assistant" accent={COLORS.cyan} />

      {/* AI layer */}
      <Box x={510} y={200} w={220} h={80} label="Citation-Grounded AI" sublabel="GPT-4 + retrieval" accent={COLORS.violet} fontSize={15} />
      <Box x={510} y={310} w={220} h={56} label="Resume + Profile Store" sublabel="user context" accent={COLORS.emerald} />

      {/* Stripe tiers */}
      <Box x={800} y={140} w={180} h={56} label="Tier · Free" sublabel="$0 / 5 actions" accent={COLORS.textDim} />
      <Box x={800} y={220} w={180} h={56} label="Tier · Pro" sublabel="$19 / unlimited" accent={COLORS.amber} />
      <Box x={800} y={300} w={180} h={56} label="Tier · Coach" sublabel="$49 / + drafts" accent={COLORS.amber} />
      <Box x={800} y={380} w={180} h={56} label="Stripe Billing" sublabel="webhooks" accent={COLORS.cyan} />

      {/* Arrows from user */}
      <Arrow x1={180} y1={280} x2={240} y2={148} />
      <Arrow x1={180} y1={292} x2={240} y2={288} />
      <Arrow x1={180} y1={304} x2={240} y2={428} />

      {/* Surfaces -> AI layer */}
      <Arrow x1={440} y1={148} x2={510} y2={228} />
      <Arrow x1={440} y1={288} x2={510} y2={240} label="prompt" />
      <Arrow x1={440} y1={428} x2={510} y2={252} />

      {/* AI layer -> resume store */}
      <Arrow x1={620} y1={280} x2={620} y2={310} dashed label="hydrate" />

      {/* AI -> tiers gating */}
      <Arrow x1={730} y1={222} x2={800} y2={168} dashed color={COLORS.amber} label="meter" />
      <Arrow x1={730} y1={240} x2={800} y2={248} dashed color={COLORS.amber} />
      <Arrow x1={730} y1={258} x2={800} y2={328} dashed color={COLORS.amber} />

      {/* Tiers -> stripe */}
      <Arrow x1={890} y1={196} x2={890} y2={380} color={COLORS.textDim} />

      {/* Legend */}
      <Label x={40} y={540} text="REQUEST FLOW" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={170} y1={536} x2={200} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={208} y={540} text="USER" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={260} y1={536} x2={290} y2={536} stroke={COLORS.amber} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={298} y={540} text="BILLING METER" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
