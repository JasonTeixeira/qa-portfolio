import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'local-verification-latest.json');

const evidencePaths = {
  finalScorecard: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json'),
  operatingCycle: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json'),
  contentFactory: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-22-content-factory-dry-run.json'),
  evalSeedQuality: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-quality.json'),
  evalSeedDryRun: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-dry-run.json'),
  proofRehearsalReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'proof-rehearsal-readiness-latest.json'),
  contentFactoryReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'content-factory-readiness-latest.json'),
  proofIntakeReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json'),
  weeklyProofPacket: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.json'),
  proofCandidateAudit: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-candidate-audit-latest.json'),
};

async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function requireTruthy(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function summarizeOperatingBlockers(operatingCycle) {
  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const blockers = [];

  if ((metrics.approvedDiscordKnowledgeSources ?? 0) <= 0) {
    blockers.push('approved_discord_knowledge_sources_empty');
  }
  if ((metrics.ragDiscordSources ?? 0) <= 0) {
    blockers.push('rag_discord_sources_empty');
  }
  if ((metrics.pendingPublicDrafts ?? 0) <= 0 && (metrics.publishedPublicDrafts ?? 0) <= 0) {
    blockers.push('public_proof_drafts_empty');
  }
  if ((metrics.premiumMembers ?? 0) <= 0) {
    blockers.push('premium_workflow_live_proof_empty');
  }

  return blockers;
}

async function main() {
  const [
    finalScorecard,
    operatingCycle,
    contentFactory,
    evalSeedQuality,
    evalSeedDryRun,
    proofRehearsalReadiness,
    contentFactoryReadiness,
    proofIntakeReadiness,
    weeklyProofPacket,
    proofCandidateAudit,
  ] = await Promise.all(
    Object.values(evidencePaths).map(readJson),
  );

  requireTruthy(finalScorecard.ok === true, 'Final scorecard evidence is not ok.');
  requireTruthy(contentFactory.ok === true, 'Content factory dry-run evidence is not ok.');
  requireTruthy(contentFactory.dryRun === true, 'Content factory evidence must be dry-run for verify:local.');
  requireTruthy(evalSeedQuality.ok === true, 'RAG eval seed quality evidence is not ok.');
  requireTruthy(evalSeedDryRun.ok === true, 'RAG eval seed dry-run evidence is not ok.');
  requireTruthy(evalSeedDryRun.dryRun === true, 'RAG eval seed evidence must be dry-run for verify:local.');
  requireTruthy(proofRehearsalReadiness.ok === true, 'Proof rehearsal readiness evidence is not ok.');
  requireTruthy(
    proofRehearsalReadiness.mutationMode === 'local_file_evidence_only',
    'Proof rehearsal readiness must not mutate external systems.',
  );
  requireTruthy(contentFactoryReadiness.ok === true, 'Content factory readiness evidence is not ok.');
  requireTruthy(
    contentFactoryReadiness.mutationMode === 'local_file_evidence_only',
    'Content factory readiness must not mutate external systems.',
  );
  requireTruthy(
    contentFactoryReadiness.dryRun === true && contentFactoryReadiness.created === 0,
    'Content factory readiness must prove read-only dry-run behavior.',
  );
  requireTruthy(proofIntakeReadiness.ok === true, 'Proof intake readiness evidence is not ok.');
  requireTruthy(
    proofIntakeReadiness.mutationMode === 'local_file_evidence_only',
    'Proof intake readiness must not mutate external systems.',
  );
  requireTruthy(
    proofIntakeReadiness.releaseMeaning?.includes('does not satisfy real operating proof lanes'),
    'Proof intake readiness must explicitly avoid claiming real operating proof.',
  );
  requireTruthy(
    Array.isArray(proofIntakeReadiness.lanes) && proofIntakeReadiness.lanes.length === 4,
    'Proof intake readiness must cover all four blocked proof lanes.',
  );
  requireTruthy(weeklyProofPacket.ok === true, 'Weekly proof packet evidence is not ok.');
  requireTruthy(
    weeklyProofPacket.mutationMode === 'local_file_evidence_only',
    'Weekly proof packet must not mutate external systems.',
  );
  requireTruthy(
    weeklyProofPacket.releaseMeaning?.includes('does not create or satisfy operating proof'),
    'Weekly proof packet must explicitly avoid claiming real operating proof.',
  );
  requireTruthy(
    Array.isArray(weeklyProofPacket.lanes) && weeklyProofPacket.lanes.length === 4,
    'Weekly proof packet must cover all four blocked proof lanes.',
  );
  requireTruthy(
    weeklyProofPacket.lanes.every((lane) => lane.intakeTemplate?.privacy_status),
    'Weekly proof packet must include privacy_status intake placeholders.',
  );
  requireTruthy(proofCandidateAudit.ok === true, 'Proof candidate audit evidence is not ok.');
  requireTruthy(
    proofCandidateAudit.mutationMode === 'local_file_evidence_only',
    'Proof candidate audit must not mutate external systems.',
  );
  requireTruthy(
    proofCandidateAudit.releaseMeaning?.includes('does not create, approve, sync, publish, or satisfy operating proof'),
    'Proof candidate audit must explicitly avoid claiming operating proof.',
  );
  requireTruthy(
    Array.isArray(proofCandidateAudit.lanes) && proofCandidateAudit.lanes.length === 4,
    'Proof candidate audit must cover all four proof lanes.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.every((lane) => lane.requiredEvidenceFields?.includes('privacy_status')),
    'Proof candidate audit must require privacy_status for every lane.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.every((lane) => lane.requiredEvidenceFields?.includes('decision_reason')),
    'Proof candidate audit must require decision_reason for every lane.',
  );

  const operatingStatus = operatingCycle.status ?? (operatingCycle.ok ? 'passed' : 'blocked');
  requireTruthy(
    operatingStatus === 'passed' || operatingStatus === 'blocked',
    `Unsupported operating-cycle status: ${operatingStatus}`,
  );

  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const knownBlockers = summarizeOperatingBlockers(operatingCycle);

  const evidence = {
    ok: true,
    version: 'local-verification-evidence-v1',
    timestamp: new Date().toISOString(),
    command: 'npm run verify:local',
    mutationMode: 'local_file_evidence_only',
    gates: [
      { command: 'npm run test:unit', passed: true },
      { command: 'npm run typecheck', passed: true },
      { command: 'npm run lint', passed: true },
      { command: 'npm run build', passed: true },
      { command: 'npm run discord:release-local', passed: true },
    ],
    sourceEvidence: Object.fromEntries(
      Object.entries(evidencePaths).map(([key, filePath]) => [key, path.relative(root, filePath)]),
    ),
    scorecard: {
      averageScore: finalScorecard.averageScore,
      worldClassEligible: finalScorecard.worldClassEligible,
      worldClassThreshold: finalScorecard.worldClassThreshold,
      blockedBelow95: finalScorecard.blockedBelow95 ?? [],
      runKey: finalScorecard.runKey,
    },
    operatingCycle: {
      status: operatingStatus,
      ok: operatingCycle.ok === true,
      cycleKey: operatingCycle.cycleKey,
      approvedDiscordKnowledgeSources: metrics.approvedDiscordKnowledgeSources ?? 0,
      ragDiscordSources: metrics.ragDiscordSources ?? 0,
      pendingKnowledgeCandidates: metrics.pendingKnowledgeCandidates ?? 0,
      pendingPublicDrafts: metrics.pendingPublicDrafts ?? 0,
      publishedPublicDrafts: metrics.publishedPublicDrafts ?? 0,
      approvedMembers: metrics.approvedMembers ?? 0,
      onboardedMembers: metrics.onboardedMembers ?? 0,
      activeMembers7d: metrics.activeMembers7d ?? 0,
      premiumMembers: metrics.premiumMembers ?? 0,
      premiumWorkflowProofs: metrics.premiumWorkflowProofs ?? metrics.premiumMembers ?? 0,
      knownBlockers,
    },
    ragEvalSeeds: {
      ok: evalSeedQuality.ok,
      dryRunOk: evalSeedDryRun.ok,
      seedCount: evalSeedQuality.seedCount,
      seededDryRun: evalSeedDryRun.seeded,
      categoryCounts: evalSeedQuality.categoryCounts,
      issues: evalSeedQuality.issues ?? [],
    },
    contentFactory: {
      ok: contentFactory.ok,
      dryRun: contentFactory.dryRun,
      planned: contentFactory.planned,
      created: contentFactory.created,
      failed: contentFactory.failed,
      channelCoverage: contentFactory.channelCoverage,
    },
    contentFactoryReadiness: {
      ok: contentFactoryReadiness.ok,
      mutationMode: contentFactoryReadiness.mutationMode,
      planned: contentFactoryReadiness.planned,
      created: contentFactoryReadiness.created,
      minQualityScore: contentFactoryReadiness.minQualityScore,
      channelCoverage: contentFactoryReadiness.channelCoverage,
      releaseMeaning: contentFactoryReadiness.releaseMeaning,
    },
    proofRehearsalReadiness: {
      ok: proofRehearsalReadiness.ok,
      mutationMode: proofRehearsalReadiness.mutationMode,
      laneCount: Array.isArray(proofRehearsalReadiness.lanes) ? proofRehearsalReadiness.lanes.length : 0,
      missingOrStale: proofRehearsalReadiness.missingOrStale ?? [],
      releaseMeaning: proofRehearsalReadiness.releaseMeaning,
    },
    proofIntakeReadiness: {
      ok: proofIntakeReadiness.ok,
      mutationMode: proofIntakeReadiness.mutationMode,
      laneCount: Array.isArray(proofIntakeReadiness.lanes) ? proofIntakeReadiness.lanes.length : 0,
      requiredFieldCount: proofIntakeReadiness.requiredFieldCount,
      weeklyIntakeOrder: proofIntakeReadiness.weeklyIntakeOrder,
      releaseMeaning: proofIntakeReadiness.releaseMeaning,
    },
    weeklyProofPacket: {
      ok: weeklyProofPacket.ok,
      mutationMode: weeklyProofPacket.mutationMode,
      backlogStatus: weeklyProofPacket.backlogStatus,
      laneCount: Array.isArray(weeklyProofPacket.lanes) ? weeklyProofPacket.lanes.length : 0,
      blockedLanes: weeklyProofPacket.lanes
        .filter((lane) => lane.status === 'blocked')
        .map((lane) => `${lane.key}:${lane.currentCount}/${lane.targetCount}`),
      releaseMeaning: weeklyProofPacket.releaseMeaning,
    },
    proofCandidateAudit: {
      ok: proofCandidateAudit.ok,
      mutationMode: proofCandidateAudit.mutationMode,
      status: proofCandidateAudit.status,
      laneCount: Array.isArray(proofCandidateAudit.lanes) ? proofCandidateAudit.lanes.length : 0,
      candidateStates: proofCandidateAudit.lanes.map((lane) => `${lane.key}:${lane.candidateState}:${lane.currentCount}/${lane.targetCount}`),
      nextActions: proofCandidateAudit.nextActions,
      releaseMeaning: proofCandidateAudit.releaseMeaning,
    },
    remainingGaps: [
      'Grow approved Discord knowledge from real member questions, answers, builds, reviews, wins, and resources.',
      'Approve Discord candidates into authoritative RAG and rerun non-dry-run RAG eval with explicit approval.',
      'Run weekly public proof/growth cycles with approved public drafts and measured conversion.',
      'Prove premium workflows with real or deliberately seeded premium-member scenarios.',
      'Rerun the final scorecard after each operating cycle until category evidence earns 95+.',
    ],
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
