import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { buildDiscordProofBacklogReport } from '@/lib/discord/proof-backlog';
import type { OperatingCycleMetrics } from '@/lib/discord/operating-proof-cycle-rules';

const root = process.cwd();
const operatingCyclePath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json');
const gatewayCapturePath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json');
const gatewayOperatingPacketPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'gateway-operating-packet-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json');

async function main() {
  const [operatingCycle, gatewayCaptureEvidence, gatewayOperatingPacket] = await Promise.all([
    readFile(operatingCyclePath, 'utf8').then(JSON.parse),
    readFile(gatewayCapturePath, 'utf8').then(JSON.parse),
    readFile(gatewayOperatingPacketPath, 'utf8').then(JSON.parse),
  ]);
  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore;
  if (!metrics) {
    throw new Error('Operating cycle evidence is missing metrics.');
  }

  const report = buildDiscordProofBacklogReport({
    generatedAt: new Date().toISOString(),
    metrics: metrics as OperatingCycleMetrics,
    gatewayCapture: {
      status: gatewayCaptureEvidence.diagnosis?.status ?? 'blocked',
      usableMessageCount: gatewayCaptureEvidence.counts?.['discord_messages.non_bot_non_empty'] ?? 0,
      rootCauses: gatewayCaptureEvidence.diagnosis?.rootCauses ?? [],
      nextActions: gatewayCaptureEvidence.diagnosis?.nextActions ?? [],
    },
    gatewayOperatingPacket: {
      status: gatewayOperatingPacket.status ?? 'blocked',
      current: gatewayOperatingPacket.target?.current ?? 0,
      target: gatewayOperatingPacket.target?.target ?? 1,
      remaining: gatewayOperatingPacket.target?.remaining ?? 1,
      usableMessageState: gatewayOperatingPacket.target?.usableMessageState ?? 'missing_gateway_packet_state',
      messageContentEnabled: gatewayOperatingPacket.messageContentSignal?.effectiveEnabled ?? null,
      messageContentSignalSource: gatewayOperatingPacket.messageContentSignal?.source ?? null,
      heartbeatFresh: gatewayOperatingPacket.heartbeat?.fresh === true,
      workerId: gatewayOperatingPacket.heartbeat?.workerId ?? null,
      nextActions: gatewayOperatingPacket.nextActions ?? [],
      antiFakeRules: gatewayOperatingPacket.antiFakeRules ?? [],
    },
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
