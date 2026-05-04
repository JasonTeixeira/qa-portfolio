import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function QualityTelemetryArchitecture() {
  return (
    <DiagramFrame
      title="Quality Telemetry CI Matrix"
      desc="A pull request triggers a CI matrix of 13 frameworks (unit, E2E, mobile, security, BDD, performance, contract, visual, lighthouse, and more), feeding a status gate that controls merge."
    >
      {/* PR */}
      <Box x={40} y={270} w={140} h={64} label="Pull Request" sublabel="merge candidate" accent={COLORS.violet} />

      {/* CI matrix orchestrator */}
      <Box x={220} y={270} w={170} h={64} label="CI Matrix" sublabel="GitHub Actions" accent={COLORS.amber} />

      {/* 13 framework boxes (3 columns x 5 rows roughly, but 13) */}
      {/* col 1 */}
      <Box x={430} y={40} w={150} h={44} label="Unit · Vitest" accent={COLORS.cyan} fontSize={12} />
      <Box x={430} y={92} w={150} h={44} label="E2E · Playwright" accent={COLORS.cyan} fontSize={12} />
      <Box x={430} y={144} w={150} h={44} label="Mobile · Detox" accent={COLORS.cyan} fontSize={12} />
      <Box x={430} y={196} w={150} h={44} label="Security · OWASP ZAP" accent={COLORS.rose} fontSize={12} />
      <Box x={430} y={248} w={150} h={44} label="BDD · Cucumber" accent={COLORS.violet} fontSize={12} />
      <Box x={430} y={300} w={150} h={44} label="Perf · k6" accent={COLORS.amber} fontSize={12} />
      <Box x={430} y={352} w={150} h={44} label="Contract · Pact" accent={COLORS.emerald} fontSize={12} />
      {/* col 2 */}
      <Box x={600} y={40} w={150} h={44} label="Visual · Chromatic" accent={COLORS.violet} fontSize={12} />
      <Box x={600} y={92} w={150} h={44} label="Lighthouse" accent={COLORS.amber} fontSize={12} />
      <Box x={600} y={144} w={150} h={44} label="A11y · axe" accent={COLORS.emerald} fontSize={12} />
      <Box x={600} y={196} w={150} h={44} label="Mutation · Stryker" accent={COLORS.rose} fontSize={12} />
      <Box x={600} y={248} w={150} h={44} label="Type · tsc" accent={COLORS.cyan} fontSize={12} />
      <Box x={600} y={300} w={150} h={44} label="Lint · ESLint" accent={COLORS.cyan} fontSize={12} />

      {/* Status gate */}
      <Box x={810} y={210} w={180} h={80} label="Status Gate" sublabel="13/13 must pass" accent={COLORS.amber} fontSize={15} />

      {/* Merge */}
      <Box x={1030} y={210} w={140} h={80} label="Merge" sublabel="green only" accent={COLORS.emerald} />

      {/* PR -> matrix */}
      <Arrow x1={180} y1={302} x2={220} y2={302} label="trigger" />

      {/* Matrix -> all framework boxes (fan out) */}
      {[62, 114, 166, 218, 270, 322, 374].map((y, i) => (
        <Arrow key={`f1-${i}`} x1={390} y1={302} x2={430} y2={y} dashed />
      ))}
      {[62, 114, 166, 218, 270, 322].map((y, i) => (
        <Arrow key={`f2-${i}`} x1={390} y1={302} x2={600} y2={y} dashed />
      ))}

      {/* Frameworks -> status gate (collapsed) */}
      {[62, 114, 166, 218, 270, 322, 374].map((y, i) => (
        <Arrow key={`g1-${i}`} x1={580} y1={y} x2={810} y2={250} color={COLORS.textDim} />
      ))}
      {[62, 114, 166, 218, 270, 322].map((y, i) => (
        <Arrow key={`g2-${i}`} x1={750} y1={y} x2={810} y2={250} color={COLORS.textDim} />
      ))}

      {/* Gate -> merge */}
      <Arrow x1={990} y1={250} x2={1030} y2={250} label="all green" color={COLORS.emerald} />

      {/* Legend */}
      <Label x={40} y={540} text="JOB DISPATCH" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={170} y1={536} x2={200} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={208} y={540} text="13 FRAMEWORKS" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={325} y1={536} x2={355} y2={536} stroke={COLORS.emerald} strokeWidth={1.5} />
      <Label x={363} y={540} text="MERGE GATE" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
