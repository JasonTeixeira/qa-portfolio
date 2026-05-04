import { Box, Arrow, DiagramFrame, COLORS, Label } from './primitives'

export function AwsLandingZoneArchitecture() {
  return (
    <DiagramFrame
      title="AWS Landing Zone Architecture"
      desc="Terraform plans expand into VPC networking, GitHub OIDC trust, IAM guardrails, and KMS keys, applied across a multi-account AWS Organization, with CI smoke tests gating the apply."
    >
      {/* Terraform */}
      <Box x={40} y={260} w={170} h={70} label="Terraform Plan" sublabel="HCL modules" accent={COLORS.violet} />

      {/* Modules */}
      <Box x={260} y={100} w={200} h={56} label="VPC Module" sublabel="subnets + NAT" accent={COLORS.cyan} />
      <Box x={260} y={180} w={200} h={56} label="GitHub OIDC" sublabel="federated trust" accent={COLORS.amber} />
      <Box x={260} y={260} w={200} h={56} label="IAM Guardrails" sublabel="SCPs + permissions" accent={COLORS.rose} />
      <Box x={260} y={340} w={200} h={56} label="KMS Keys" sublabel="customer-managed" accent={COLORS.emerald} />
      <Box x={260} y={420} w={200} h={56} label="Logging" sublabel="CloudTrail + S3" accent={COLORS.cyan} />

      {/* AWS Org with accounts */}
      <Box x={520} y={120} w={250} h={400} label="AWS Organization" sublabel="" accent={COLORS.amber} />
      <rect x={540} y={170} width={210} height={50} rx={6} fill={COLORS.bg} stroke={COLORS.borderStrong} />
      <text x={645} y={195} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="ui-sans-serif, system-ui" fontWeight={600}>account · prod</text>
      <text x={645} y={210} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">workloads</text>

      <rect x={540} y={235} width={210} height={50} rx={6} fill={COLORS.bg} stroke={COLORS.borderStrong} />
      <text x={645} y={260} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="ui-sans-serif, system-ui" fontWeight={600}>account · staging</text>
      <text x={645} y={275} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">non-prod</text>

      <rect x={540} y={300} width={210} height={50} rx={6} fill={COLORS.bg} stroke={COLORS.borderStrong} />
      <text x={645} y={325} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="ui-sans-serif, system-ui" fontWeight={600}>account · security</text>
      <text x={645} y={340} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">audit + GuardDuty</text>

      <rect x={540} y={365} width={210} height={50} rx={6} fill={COLORS.bg} stroke={COLORS.borderStrong} />
      <text x={645} y={390} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="ui-sans-serif, system-ui" fontWeight={600}>account · log-archive</text>
      <text x={645} y={405} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">central trail</text>

      <rect x={540} y={430} width={210} height={50} rx={6} fill={COLORS.bg} stroke={COLORS.borderStrong} />
      <text x={645} y={455} textAnchor="middle" fill={COLORS.text} fontSize={12} fontFamily="ui-sans-serif, system-ui" fontWeight={600}>account · sandbox</text>
      <text x={645} y={470} textAnchor="middle" fill={COLORS.textDim} fontSize={10} fontFamily="ui-monospace, monospace">dev playground</text>

      {/* CI smoke tests */}
      <Box x={830} y={250} w={200} h={70} label="CI Smoke Tests" sublabel="apply + verify" accent={COLORS.cyan} />
      <Box x={830} y={350} w={200} h={70} label="Drift Detection" sublabel="nightly" accent={COLORS.violet} />

      {/* Plan -> modules */}
      <Arrow x1={210} y1={278} x2={260} y2={128} dashed />
      <Arrow x1={210} y1={285} x2={260} y2={208} dashed />
      <Arrow x1={210} y1={295} x2={260} y2={288} dashed label="plan" />
      <Arrow x1={210} y1={305} x2={260} y2={368} dashed />
      <Arrow x1={210} y1={315} x2={260} y2={448} dashed />

      {/* Modules -> Org */}
      <Arrow x1={460} y1={128} x2={520} y2={195} label="apply" />
      <Arrow x1={460} y1={208} x2={520} y2={260} />
      <Arrow x1={460} y1={288} x2={520} y2={325} />
      <Arrow x1={460} y1={368} x2={520} y2={390} />
      <Arrow x1={460} y1={448} x2={520} y2={455} />

      {/* Org -> CI smoke + drift */}
      <Arrow x1={770} y1={285} x2={830} y2={285} color={COLORS.cyan} label="verify" />
      <Arrow x1={770} y1={385} x2={830} y2={385} color={COLORS.violet} label="scan" />

      {/* Legend */}
      <Label x={40} y={540} text="PLAN" color={COLORS.textDim} size={10} anchor="start" />
      <line x1={85} y1={536} x2={115} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} strokeDasharray="4 4" />
      <Label x={123} y={540} text="TF MODULE" color={COLORS.textMuted} size={10} anchor="start" />
      <line x1={210} y1={536} x2={240} y2={536} stroke={COLORS.cyan} strokeWidth={1.5} />
      <Label x={248} y={540} text="APPLY" color={COLORS.textMuted} size={10} anchor="start" />
    </DiagramFrame>
  )
}
