import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
  buildWorldClassReadinessReport,
  validateWorldClassReadinessReport,
  type WorldClassScorecardItem,
} from '@/lib/discord/world-class-readiness';

const root = process.cwd();
const finalScorecardPath = path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json');
const localVerificationPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'local-verification-latest.json');
const gatewayCapturePath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json');
const gatewayOperatingPacketPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'gateway-operating-packet-latest.json');
const ragEvalMissingPreflightPath = path.join(root, 'docs', 'evidence', 'rag', 'eval-missing-preflight.json');
const ragEvalRecoveryPlanPath = path.join(root, 'docs', 'evidence', 'rag', 'eval-recovery-plan.json');
const proofSourceRecoveryPlanPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.json');
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'world-class-readiness-latest.json');

async function readJson(filePath: string) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const [
    finalScorecard,
    localVerification,
    gatewayCapture,
    gatewayOperatingPacket,
    ragEvalMissingPreflight,
    ragEvalRecoveryPlan,
    proofSourceRecoveryPlan,
  ] = await Promise.all([
    readJson(finalScorecardPath),
    readJson(localVerificationPath),
    readJson(gatewayCapturePath),
    readJson(gatewayOperatingPacketPath),
    readJson(ragEvalMissingPreflightPath),
    readJson(ragEvalRecoveryPlanPath),
    readJson(proofSourceRecoveryPlanPath),
  ]);

  const scorecard = Array.isArray(finalScorecard.scorecard)
    ? finalScorecard.scorecard as WorldClassScorecardItem[]
    : [];
  if (scorecard.length === 0) {
    throw new Error('Final scorecard evidence does not include category scores.');
  }
  if (localVerification.ok !== true) {
    throw new Error('Local verification evidence is not ok.');
  }

  const operatingBlockers = [
    ...(gatewayCapture.diagnosis?.status === 'blocked' ? ['discord_gateway_capture_blocked'] : []),
    ...(localVerification.operatingCycle?.knownBlockers ?? []),
  ];

  const report = buildWorldClassReadinessReport({
    generatedAt: new Date().toISOString(),
    averageScore: Number(finalScorecard.averageScore ?? localVerification.scorecard?.averageScore ?? 0),
    worldClassThreshold: Number(finalScorecard.worldClassThreshold ?? 95),
    worldClassEligible: Boolean(finalScorecard.worldClassEligible),
    scorecard,
    releaseGates: Array.isArray(finalScorecard.releaseGates) ? finalScorecard.releaseGates : [],
    operatingBlockers,
    requiredOperatingProof: finalScorecard.requiredOperatingProof ?? [],
    ragEvalMissingPreflight: {
      status: ragEvalMissingPreflight.status,
      ok: ragEvalMissingPreflight.ok === true,
      missingEvalCount: ragEvalMissingPreflight.summary?.missingEvalCount ?? ragEvalMissingPreflight.missingEvalKeys?.length ?? 0,
      readyForApprovedEvalCount: ragEvalMissingPreflight.summary?.readyForApprovedEvalCount ?? 0,
      selectedMatchesCoverage: ragEvalMissingPreflight.selectedMatchesCoverage === true,
      approvedCommand: ragEvalMissingPreflight.approvedCommand,
      releaseMeaning: ragEvalMissingPreflight.releaseMeaning,
    },
    ragEvalRecoveryPlan: {
      status: ragEvalRecoveryPlan.status,
      ok: ragEvalRecoveryPlan.ok === true,
      missingEvalCount: ragEvalRecoveryPlan.coverage?.missingEvalCount ?? ragEvalRecoveryPlan.coverage?.missingEvalKeys?.length ?? 0,
      readyMissingEvalCount: Array.isArray(ragEvalRecoveryPlan.missingEvalBacklog)
        ? ragEvalRecoveryPlan.missingEvalBacklog.filter((item: { readyForApprovedEval?: boolean }) => item.readyForApprovedEval === true).length
        : 0,
      failedEvalCount: ragEvalRecoveryPlan.latestEval?.failedCount ?? ragEvalRecoveryPlan.failedEvalBacklog?.length ?? 0,
      approvedCommand: ragEvalRecoveryPlan.approvedCommand,
      releaseMeaning: ragEvalRecoveryPlan.releaseMeaning,
    },
    proofSourceRecoveryPlan: {
      status: proofSourceRecoveryPlan.status,
      ok: proofSourceRecoveryPlan.ok === true,
      totalShortfall: proofSourceRecoveryPlan.summary?.totalShortfall ?? 0,
      blockedLaneCount: proofSourceRecoveryPlan.summary?.blockedLaneCount ?? 0,
      nextLaneKey: proofSourceRecoveryPlan.summary?.nextLane ?? null,
      releaseMeaning: proofSourceRecoveryPlan.releaseMeaning,
    },
    gatewayOperatingPacket: {
      status: gatewayOperatingPacket.status,
      current: gatewayOperatingPacket.target?.current ?? 0,
      target: gatewayOperatingPacket.target?.target ?? 1,
      remaining: gatewayOperatingPacket.target?.remaining ?? 1,
      usableMessageState: gatewayOperatingPacket.target?.usableMessageState,
      messageContentEnabled: gatewayOperatingPacket.messageContentSignal?.effectiveEnabled ?? null,
      messageContentSignalSource: gatewayOperatingPacket.messageContentSignal?.source ?? null,
      heartbeatFresh: gatewayOperatingPacket.heartbeat?.fresh === true,
      workerId: gatewayOperatingPacket.heartbeat?.workerId ?? null,
      nextActions: gatewayOperatingPacket.nextActions ?? [],
      releaseMeaning: gatewayOperatingPacket.releaseMeaning,
    },
  });
  const validation = validateWorldClassReadinessReport(report);
  if (!validation.ok) {
    throw new Error(`World-class readiness validation failed: ${validation.failures.join(', ')}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify({
    ...report,
    validation,
  }, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
