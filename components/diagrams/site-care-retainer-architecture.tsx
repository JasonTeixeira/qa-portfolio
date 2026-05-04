import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function SiteCareRetainerArchitecture() {
  return (
    <DiagramFrame
      title="Site Care Retainer Architecture"
      desc="A scheduled monitor fans out across dependency, performance, uptime, and backup checks, aggregates into a dashboard, and produces a monthly report for the client."
    >
      {/* Cron monitor */}
      <Box x={40} y={260} w={180} h={70} label="Cron Monitor" sublabel="hourly + daily" accent={COLORS.cyan} />

      {/* Four checks */}
      <Box x={290} y={80} w={200} h={60} label="Dep Updates" sublabel="renovate / npm audit" accent={COLORS.amber} />
      <Box x={290} y={170} w={200} h={60} label="Performance" sublabel="lighthouse + RUM" accent={COLORS.violet} />
      <Box x={290} y={260} w={200} h={60} label="Uptime" sublabel="multi-region pings" accent={COLORS.emerald} />
      <Box x={290} y={350} w={200} h={60} label="Backups" sublabel="DB + assets" accent={COLORS.emerald} />
      <Box x={290} y={440} w={200} h={60} label="Security Scans" sublabel="OWASP / SSL" accent={COLORS.rose} />

      {/* Dashboard */}
      <Box x={580} y={230} w={220} h={120} label="Dashboard" sublabel="status + history" accent={COLORS.cyan} fontSize={16} />

      {/* Alerts side */}
      <Box x={870} y={120} w={200} h={60} label="Slack Alerts" sublabel="critical only" accent={COLORS.rose} />
      <Box x={870} y={200} w={200} h={60} label="Email Digest" sublabel="weekly" accent={COLORS.amber} />

      {/* Monthly report */}
      <Box x={870} y={320} w={200} h={70} label="Monthly Report" sublabel="PDF + summary" accent={COLORS.violet} />

      {/* Cron -> checks */}
      <Arrow x1={220} y1={278} x2={290} y2={108} dashed />
      <Arrow x1={220} y1={285} x2={290} y2={198} dashed />
      <Arrow x1={220} y1={295} x2={290} y2={288} dashed label="run" />
      <Arrow x1={220} y1={305} x2={290} y2={378} dashed />
      <Arrow x1={220} y1={315} x2={290} y2={468} dashed />

      {/* Checks -> dashboard */}
      <Arrow x1={490} y1={108} x2={580} y2={258} />
      <Arrow x1={490} y1={198} x2={580} y2={272} />
      <Arrow x1={490} y1={288} x2={580} y2={290} label="metrics" />
      <Arrow x1={490} y1={378} x2={580} y2={310} />
      <Arrow x1={490} y1={468} x2={580} y2={325} />

      {/* Dashboard -> alerts + report */}
      <Arrow x1={800} y1={250} x2={870} y2={148} color={COLORS.rose} label="page" />
      <Arrow x1={800} y1={275} x2={870} y2={228} color={COLORS.amber} />
      <Arrow x1={800} y1={320} x2={870} y2={350} color={COLORS.violet} label="rollup" />

      {/* Cycle back arrow showing monitor is recurring */}
      <path d="M 130 330 Q 130 460 50 460 Q 50 330 130 330" stroke={COLORS.cyanDark} strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
      <text x={90} y={490} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">tick</text>

      {/* Legend */}
      <Label x={550} y={540} text="DASHBOARD CYCLE" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={690} y1={536} x2={720} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={728} y={540} text="LIVE METRICS" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
