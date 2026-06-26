import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'local-verification-latest.json');
const OPERATING_TARGETS = {
  approvedDiscordKnowledgeSources: 10,
  ragDiscordSources: 10,
  publicProofAssets: 4,
  publicProofApplyClicks: 1,
  applicationsSubmitted: 1,
  premiumWorkflowProofs: 1,
};

const evidencePaths = {
  finalScorecard: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json'),
  operatingCycle: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json'),
  contentFactory: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-22-content-factory-dry-run.json'),
  evalSeedQuality: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-quality.json'),
  evalSeedDryRun: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-dry-run.json'),
  evalCoverageReadiness: path.join(root, 'docs', 'evidence', 'rag', 'eval-coverage-readiness.json'),
  evalExecutionPacket: path.join(root, 'docs', 'evidence', 'rag', 'eval-execution-packet.json'),
  evalMissingPreflight: path.join(root, 'docs', 'evidence', 'rag', 'eval-missing-preflight.json'),
  proofRehearsalReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'proof-rehearsal-readiness-latest.json'),
  contentFactoryReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'content-factory-readiness-latest.json'),
  proofIntakeReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json'),
  proofBacklog: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json'),
  weeklyProofPacket: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.json'),
  proofCandidateAudit: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-candidate-audit-latest.json'),
  proofSourceVolumeScan: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-volume-scan-latest.json'),
  proofSourceRecoveryPlan: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.json'),
  operatorBrief: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-operator-brief-latest.json'),
  gatewayCaptureDiagnosis: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json'),
  worldClassReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'world-class-readiness-latest.json'),
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

function releaseGateFailures(payload) {
  return (payload.releaseGates ?? [])
    .filter((gate) => gate.passed !== true)
    .map((gate) => gate.name);
}

function summarizeOperatingBlockers(operatingCycle) {
  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const blockers = [];

  if ((metrics.approvedDiscordKnowledgeSources ?? 0) < OPERATING_TARGETS.approvedDiscordKnowledgeSources) {
    blockers.push(`approved_discord_knowledge_sources_below_target:${metrics.approvedDiscordKnowledgeSources ?? 0}/${OPERATING_TARGETS.approvedDiscordKnowledgeSources}`);
  }
  if ((metrics.ragDiscordSources ?? 0) < OPERATING_TARGETS.ragDiscordSources) {
    blockers.push(`rag_discord_sources_below_target:${metrics.ragDiscordSources ?? 0}/${OPERATING_TARGETS.ragDiscordSources}`);
  }
  const publicProofAssets = (metrics.pendingPublicDrafts ?? 0) + (metrics.publishedPublicDrafts ?? 0);
  if (publicProofAssets < OPERATING_TARGETS.publicProofAssets) {
    blockers.push(`public_proof_assets_below_target:${publicProofAssets}/${OPERATING_TARGETS.publicProofAssets}`);
  }
  if ((metrics.publicProofApplyClicks ?? 0) < OPERATING_TARGETS.publicProofApplyClicks) {
    blockers.push(`public_proof_apply_clicks_below_target:${metrics.publicProofApplyClicks ?? 0}/${OPERATING_TARGETS.publicProofApplyClicks}`);
  }
  if ((metrics.applicationsSubmitted ?? 0) < OPERATING_TARGETS.applicationsSubmitted) {
    blockers.push(`applications_submitted_below_target:${metrics.applicationsSubmitted ?? 0}/${OPERATING_TARGETS.applicationsSubmitted}`);
  }
  if ((metrics.premiumWorkflowProofs ?? 0) < OPERATING_TARGETS.premiumWorkflowProofs) {
    blockers.push(`premium_workflow_proof_below_target:${metrics.premiumWorkflowProofs ?? 0}/${OPERATING_TARGETS.premiumWorkflowProofs}`);
  }

  return blockers;
}

function laneHasRequiredEvidenceFields(lane) {
  const fields = lane.requiredFields ?? [];
  const keys = new Set(fields.map((field) => field.key));
  return [
    'proof_cycle_key',
    'source_record_id',
    'source_created_at',
    'decision_reason',
    'evidence_artifact_path',
    'operator_attestation',
    'privacy_status',
  ].every((key) => keys.has(key));
}

function laneHasAntiFakeControls(lane) {
  const qualityGates = lane.qualityGates ?? [];
  const nonProofExamples = lane.nonProofExamples ?? [];
  const nonProofText = nonProofExamples.join(' ').toLowerCase();
  return qualityGates.length >= 4
    && nonProofExamples.length >= 4
    && (nonProofText.includes('smoke') || nonProofText.includes('dry-run') || nonProofText.includes('synthetic'));
}

function packetLaneHasRequiredTemplate(lane) {
  const template = lane.intakeTemplate ?? {};
  return [
    'proof_cycle_key',
    'source_record_id',
    'source_created_at',
    'decision_reason',
    'evidence_artifact_path',
    'operator_attestation',
    'privacy_status',
  ].every((key) => template[key]);
}

async function main() {
  const [
    finalScorecard,
    operatingCycle,
    contentFactory,
    evalSeedQuality,
    evalSeedDryRun,
    evalCoverageReadiness,
    evalExecutionPacket,
    evalMissingPreflight,
    proofRehearsalReadiness,
    contentFactoryReadiness,
    proofIntakeReadiness,
    proofBacklog,
    weeklyProofPacket,
    proofCandidateAudit,
    proofSourceVolumeScan,
    proofSourceRecoveryPlan,
    operatorBrief,
    gatewayCaptureDiagnosis,
    worldClassReadiness,
  ] = await Promise.all(
    Object.values(evidencePaths).map(readJson),
  );

  const finalScorecardReleaseGateFailures = releaseGateFailures(finalScorecard);
  requireTruthy(
    finalScorecard.ok === true || (finalScorecard.dryRun === true && finalScorecardReleaseGateFailures.length > 0),
    'Final scorecard evidence must either pass or be a dry-run with explicit release-gate blockers.',
  );
  requireTruthy(
    finalScorecard.ok === true || finalScorecard.worldClassEligible === false,
    'Blocked final scorecard evidence must not claim world-class eligibility.',
  );
  requireTruthy(contentFactory.ok === true, 'Content factory dry-run evidence is not ok.');
  requireTruthy(contentFactory.dryRun === true, 'Content factory evidence must be dry-run for verify:local.');
  requireTruthy(evalSeedQuality.ok === true, 'RAG eval seed quality evidence is not ok.');
  requireTruthy(evalSeedDryRun.ok === true, 'RAG eval seed dry-run evidence is not ok.');
  requireTruthy(evalSeedDryRun.dryRun === true, 'RAG eval seed evidence must be dry-run for verify:local.');
  requireTruthy(evalCoverageReadiness.ok === true, 'RAG eval coverage readiness evidence is not ok.');
  requireTruthy(
    evalCoverageReadiness.mutationMode === 'local_file_evidence_only',
    'RAG eval coverage readiness must not mutate external systems.',
  );
  requireTruthy(
    evalCoverageReadiness.releaseMeaning?.includes('does not seed Supabase, call DeepSeek, run retrieval, or satisfy the full eval release gate'),
    'RAG eval coverage readiness must explicitly avoid claiming full eval proof.',
  );
  requireTruthy(evalExecutionPacket.ok === true, 'RAG eval execution packet evidence is not ok.');
  requireTruthy(
    evalExecutionPacket.mutationMode === 'local_file_evidence_only',
    'RAG eval execution packet must not mutate external systems.',
  );
  requireTruthy(
    evalExecutionPacket.releaseMeaning?.includes('does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage'),
    'RAG eval execution packet must explicitly avoid claiming eval proof.',
  );
  requireTruthy(
    evalExecutionPacket.selectedMatchesCoverage === true,
    'RAG eval execution packet selected keys must match missing coverage keys.',
  );
  requireTruthy(
    evalExecutionPacket.commandPlan?.requiresExplicitApproval === true,
    'RAG eval execution packet must require explicit approval while eval keys are missing.',
  );
  requireTruthy(
    evalExecutionPacket.commandPlan?.approvedCommand?.includes('npm run rag:evaluate:missing'),
    'RAG eval execution packet must include the approved missing-eval command.',
  );
  requireTruthy(
    (evalExecutionPacket.antiFakeRules ?? []).some((rule) => rule.includes('Dry-run')),
    'RAG eval execution packet must block dry-run evidence from satisfying eval coverage.',
  );
  requireTruthy(evalMissingPreflight.ok === true, 'RAG missing eval preflight evidence is not ok.');
  requireTruthy(
    evalMissingPreflight.mutationMode === 'local_file_evidence_only',
    'RAG missing eval preflight must not mutate external systems.',
  );
  requireTruthy(
    evalMissingPreflight.releaseMeaning?.includes('does not seed Supabase, call DeepSeek, run retrieval, write rag_eval_results, or satisfy eval coverage'),
    'RAG missing eval preflight must explicitly avoid claiming eval proof.',
  );
  requireTruthy(
    evalMissingPreflight.selectedMatchesCoverage === true,
    'RAG missing eval preflight selected keys must match coverage plan and execution packet keys.',
  );
  requireTruthy(
    Array.isArray(evalMissingPreflight.missingEvalKeys)
      && evalMissingPreflight.missingEvalKeys.length === (evalExecutionPacket.missingEvalKeys ?? []).length
      && evalMissingPreflight.missingEvalKeys.every((key) => (evalExecutionPacket.missingEvalKeys ?? []).includes(key)),
    'RAG missing eval preflight missing keys must match the execution packet.',
  );
  requireTruthy(
    (evalMissingPreflight.items ?? []).every((item) => item.sourceReady === true && item.termCoverageReady === true && item.readyForApprovedEval === true),
    'RAG missing eval preflight must prove local sources and required terms are ready for every missing eval key.',
  );
  requireTruthy(
    evalMissingPreflight.approvedCommand?.includes('npm run rag:evaluate:missing'),
    'RAG missing eval preflight must repeat the approved missing-eval command.',
  );
  requireTruthy(
    (evalMissingPreflight.antiFakeRules ?? []).some((rule) => rule.includes('preflight-only')),
    'RAG missing eval preflight must block preflight-only evidence from satisfying eval coverage.',
  );
  requireTruthy(proofRehearsalReadiness.ok === true, 'Proof rehearsal readiness evidence is not ok.');
  requireTruthy(
    proofRehearsalReadiness.mutationMode === 'local_file_evidence_only',
    'Proof rehearsal readiness must not mutate external systems.',
  );
  requireTruthy(
    Array.isArray(proofRehearsalReadiness.lanes) && proofRehearsalReadiness.lanes.length === 5,
    'Proof rehearsal readiness must cover all five rehearsal lanes, including gateway capture and content factory readiness.',
  );
  requireTruthy(
    proofRehearsalReadiness.lanes[0]?.key === 'gateway_capture_rehearsal',
    'Proof rehearsal readiness must start with gateway_capture_rehearsal.',
  );
  requireTruthy(
    proofRehearsalReadiness.lanes[1]?.key === 'content_factory_readiness_rehearsal',
    'Proof rehearsal readiness must include content_factory_readiness_rehearsal immediately after gateway capture.',
  );
  requireTruthy(
    (proofRehearsalReadiness.missingOrStale ?? []).length === 0,
    'Proof rehearsal readiness must not have missing or stale rehearsal evidence.',
  );
  requireTruthy(
    proofRehearsalReadiness.releaseMeaning?.includes('live gateway capture'),
    'Proof rehearsal readiness must explicitly state live gateway capture remains required for operating proof.',
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
    Array.isArray(proofIntakeReadiness.lanes) && proofIntakeReadiness.lanes.length === 5,
    'Proof intake readiness must cover all five proof lanes, including gateway capture.',
  );
  requireTruthy(
    proofIntakeReadiness.lanes[0]?.key === 'gateway_capture',
    'Proof intake readiness must start with gateway_capture.',
  );
  requireTruthy(
    proofIntakeReadiness.lanes.every(laneHasRequiredEvidenceFields),
    'Proof intake readiness must require proof cycle, source timestamp, evidence artifact, operator attestation, decision reason, and privacy status for every lane.',
  );
  requireTruthy(
    proofIntakeReadiness.lanes.every(laneHasAntiFakeControls),
    'Proof intake readiness must include quality gates and non-proof examples that block smoke, dry-run, or synthetic evidence from being counted.',
  );
  requireTruthy(proofBacklog.ok === true, 'Proof backlog evidence is not ok.');
  requireTruthy(
    proofBacklog.mutationMode === 'local_file_evidence_only',
    'Proof backlog must not mutate external systems.',
  );
  requireTruthy(
    Array.isArray(proofBacklog.lanes) && proofBacklog.lanes.length === 5,
    'Proof backlog must cover all five proof lanes, including gateway capture.',
  );
  requireTruthy(
    proofBacklog.lanes[0]?.key === 'gateway_capture',
    'Proof backlog must start with gateway_capture.',
  );
  requireTruthy(
    proofBacklog.weeklyChecklist?.[0]?.laneKey === 'gateway_capture',
    'Proof backlog weekly checklist must start with gateway_capture.',
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
    Array.isArray(weeklyProofPacket.lanes) && weeklyProofPacket.lanes.length === 5,
    'Weekly proof packet must cover all five proof lanes, including gateway capture.',
  );
  requireTruthy(
    weeklyProofPacket.lanes[0]?.key === 'gateway_capture',
    'Weekly proof packet must start with gateway_capture.',
  );
  requireTruthy(
    weeklyProofPacket.lanes.every((lane) => lane.intakeTemplate?.privacy_status),
    'Weekly proof packet must include privacy_status intake placeholders.',
  );
  requireTruthy(
    weeklyProofPacket.lanes.every(packetLaneHasRequiredTemplate),
    'Weekly proof packet must include proof cycle, source timestamp, evidence artifact, operator attestation, decision reason, and privacy placeholders.',
  );
  requireTruthy(
    weeklyProofPacket.lanes.every(laneHasAntiFakeControls),
    'Weekly proof packet must include quality gates and non-proof examples that block smoke, dry-run, or synthetic evidence from being counted.',
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
    Array.isArray(proofCandidateAudit.lanes) && proofCandidateAudit.lanes.length === 5,
    'Proof candidate audit must cover all five proof lanes, including gateway capture.',
  );
  requireTruthy(
    proofCandidateAudit.lanes[0]?.key === 'gateway_capture',
    'Proof candidate audit must start with gateway_capture.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.every((lane) => lane.requiredEvidenceFields?.includes('privacy_status')),
    'Proof candidate audit must require privacy_status for every lane.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.every((lane) => lane.requiredEvidenceFields?.includes('decision_reason')),
    'Proof candidate audit must require decision_reason for every lane.',
  );
  requireTruthy(proofSourceVolumeScan.ok === true, 'Proof source volume scan evidence is not ok.');
  requireTruthy(
    proofSourceVolumeScan.mutationMode === 'read_only_supabase_selects_and_local_file_evidence_only',
    'Proof source volume scan must be read-only.',
  );
  requireTruthy(
    proofSourceVolumeScan.releaseMeaning?.includes('does not approve, sync, publish, assign roles, or satisfy operating proof'),
    'Proof source volume scan must explicitly avoid claiming operating proof.',
  );
  requireTruthy(
    proofSourceVolumeScan.laneReadiness?.approvedDiscordKnowledge?.target === OPERATING_TARGETS.approvedDiscordKnowledgeSources,
    'Proof source volume scan must enforce the approved knowledge target.',
  );
  requireTruthy(
    proofSourceVolumeScan.laneReadiness?.ragDiscordSources?.target === OPERATING_TARGETS.ragDiscordSources,
    'Proof source volume scan must enforce the Discord RAG source target.',
  );
  requireTruthy(
    proofSourceVolumeScan.laneReadiness?.publicProofAssets?.target === OPERATING_TARGETS.publicProofAssets,
    'Proof source volume scan must enforce the public proof asset target.',
  );
  requireTruthy(
    proofSourceVolumeScan.laneReadiness?.premiumWorkflowProof?.target === OPERATING_TARGETS.premiumWorkflowProofs,
    'Proof source volume scan must enforce the premium workflow proof target.',
  );
  requireTruthy(proofSourceRecoveryPlan.ok === true, 'Proof source recovery plan evidence is not ok.');
  requireTruthy(
    proofSourceRecoveryPlan.mutationMode === 'local_file_evidence_only',
    'Proof source recovery plan must not mutate external systems.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.releaseMeaning?.includes('does not approve, sync, publish, assign roles, call AI models, or satisfy operating proof'),
    'Proof source recovery plan must explicitly avoid claiming mutation or operating proof.',
  );
  requireTruthy(
    Array.isArray(proofSourceRecoveryPlan.lanes) && proofSourceRecoveryPlan.lanes.length === 4,
    'Proof source recovery plan must cover approved knowledge, RAG sources, public proof, and premium workflow lanes.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.summary?.totalShortfall === proofSourceRecoveryPlan.lanes.reduce((sum, lane) => sum + Math.max(0, (lane.target ?? 0) - (lane.current ?? 0)), 0),
    'Proof source recovery plan total shortfall must match lane counts.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.lanes.every((lane) => Array.isArray(lane.doNotCount) && lane.doNotCount.length >= 3),
    'Proof source recovery plan must include anti-fake do-not-count rules for every lane.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.lanes.every((lane) => Array.isArray(lane.collectionCadence) && lane.collectionCadence.length >= 3),
    'Proof source recovery plan must include collection cadence for every lane.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.lanes.every((lane) => Array.isArray(lane.acceptanceChecklist) && lane.acceptanceChecklist.length >= 3),
    'Proof source recovery plan must include acceptance checklist for every lane.',
  );
  requireTruthy(
    proofSourceRecoveryPlan.antiFakeRules?.some((rule) => rule.includes('dry-run')),
    'Proof source recovery plan must explicitly block dry-run/smoke/synthetic evidence from counting.',
  );
  requireTruthy(operatorBrief.ok === true, 'Operator brief evidence is not ok.');
  requireTruthy(
    operatorBrief.mutationMode === 'local_file_evidence_only',
    'Operator brief must not mutate external systems.',
  );
  requireTruthy(
    operatorBrief.blockedLaneCount === 5,
    'Operator brief must report all five blocked proof lanes.',
  );
  requireTruthy(
    operatorBrief.proofLanes?.[0]?.key === 'gateway_capture',
    'Operator brief must start proof lanes with gateway_capture.',
  );
  requireTruthy(
    operatorBrief.proofSourceRecoveryPlan?.status !== 'missing',
    'Operator brief must include the proof source recovery plan.',
  );
  requireTruthy(
    operatorBrief.proofSourceRecoveryPlan?.totalShortfall === proofSourceRecoveryPlan.summary?.totalShortfall,
    'Operator brief proof source recovery shortfall must match the recovery plan.',
  );
  requireTruthy(
    operatorBrief.proofSourceRecoveryPlan?.laneStates?.every((lane) => lane.collectionCadenceCount >= 3),
    'Operator brief proof source recovery lanes must preserve collection cadence counts.',
  );
  requireTruthy(
    operatorBrief.proofSourceRecoveryPlan?.laneStates?.every((lane) => lane.acceptanceChecklistCount >= 3),
    'Operator brief proof source recovery lanes must preserve acceptance checklist counts.',
  );
  requireTruthy(
    operatorBrief.ragEvalMissingPreflight?.status !== 'missing',
    'Operator brief must include the RAG missing eval preflight.',
  );
  requireTruthy(
    operatorBrief.ragEvalMissingPreflight?.missingEvalCount === (evalMissingPreflight.missingEvalKeys ?? []).length,
    'Operator brief missing eval count must match the preflight.',
  );
  requireTruthy(
    operatorBrief.ragEvalMissingPreflight?.readyForApprovedEvalCount === evalMissingPreflight.summary?.readyForApprovedEvalCount,
    'Operator brief ready missing eval count must match the preflight.',
  );
  requireTruthy(
    operatorBrief.commandOrder?.includes('npm run discord:proof-source-recovery-plan'),
    'Operator brief must include the proof source recovery plan refresh command.',
  );
  requireTruthy(
    operatorBrief.commandOrder?.includes('npm run rag:evaluate:missing-preflight'),
    'Operator brief must include the RAG missing eval preflight command.',
  );
  requireTruthy(worldClassReadiness.ok === true, 'World-class readiness evidence is not ok.');
  requireTruthy(
    worldClassReadiness.mutationMode === 'local_file_evidence_only',
    'World-class readiness must not mutate external systems.',
  );
  requireTruthy(
    worldClassReadiness.releaseDecision === 'do_not_claim_world_class',
    'World-class readiness must not claim world-class while release gates or operating proof are blocked.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalMissingPreflight?.status !== 'missing',
    'World-class readiness must include the RAG missing eval preflight.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalMissingPreflight?.missingEvalCount === (evalMissingPreflight.missingEvalKeys ?? []).length,
    'World-class readiness missing eval count must match the preflight.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalMissingPreflight?.readyForApprovedEvalCount === evalMissingPreflight.summary?.readyForApprovedEvalCount,
    'World-class readiness ready missing eval count must match the preflight.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalMissingPreflight?.approvedCommand === evalMissingPreflight.approvedCommand,
    'World-class readiness approved eval command must match the preflight.',
  );
  requireTruthy(
    worldClassReadiness.proofSourceRecoveryPlan?.status !== 'missing',
    'World-class readiness must include the proof source recovery plan.',
  );
  requireTruthy(
    worldClassReadiness.proofSourceRecoveryPlan?.totalShortfall === proofSourceRecoveryPlan.summary?.totalShortfall,
    'World-class readiness proof source recovery shortfall must match the recovery plan.',
  );
  requireTruthy(
    worldClassReadiness.proofSourceRecoveryPlan?.nextLaneKey === proofSourceRecoveryPlan.summary?.nextLane,
    'World-class readiness next proof lane must match the recovery plan.',
  );
  requireTruthy(
    worldClassReadiness.immediateActionOrder?.some((action) => action.includes('rag:evaluate:missing-preflight')),
    'World-class readiness must put the missing-eval preflight in immediate actions.',
  );
  requireTruthy(
    worldClassReadiness.immediateActionOrder?.some((action) => action.includes('discord:proof-source-recovery-plan')),
    'World-class readiness must put the proof source recovery plan in immediate actions.',
  );
  requireTruthy(gatewayCaptureDiagnosis.ok === true, 'Gateway capture diagnosis evidence is not ok.');
  requireTruthy(
    gatewayCaptureDiagnosis.mutationMode === 'read_only_supabase_selects_and_local_file_evidence_only',
    'Gateway capture diagnosis must be read-only.',
  );
  requireTruthy(
    gatewayCaptureDiagnosis.releaseMeaning?.includes('does not post messages'),
    'Gateway capture diagnosis must explicitly avoid claiming live mutation or proof satisfaction.',
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
      ok: finalScorecard.ok === true,
      averageScore: finalScorecard.averageScore,
      worldClassEligible: finalScorecard.worldClassEligible,
      worldClassThreshold: finalScorecard.worldClassThreshold,
      releaseGateFailures: finalScorecardReleaseGateFailures,
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
      premiumWorkflowProofs: metrics.premiumWorkflowProofs ?? 0,
      publicProofApplyClicks: metrics.publicProofApplyClicks ?? 0,
      knownBlockers,
    },
    gatewayCapture: {
      ok: gatewayCaptureDiagnosis.ok,
      status: gatewayCaptureDiagnosis.diagnosis?.status ?? 'unknown',
      usableMessageCount: gatewayCaptureDiagnosis.counts?.['discord_messages.non_bot_non_empty'] ?? 0,
      rootCauses: gatewayCaptureDiagnosis.diagnosis?.rootCauses ?? [],
      nextActions: gatewayCaptureDiagnosis.diagnosis?.nextActions ?? [],
      releaseMeaning: gatewayCaptureDiagnosis.releaseMeaning,
    },
    ragEvalSeeds: {
      ok: evalSeedQuality.ok,
      dryRunOk: evalSeedDryRun.ok,
      seedCount: evalSeedQuality.seedCount,
      seededDryRun: evalSeedDryRun.seeded,
      categoryCounts: evalSeedQuality.categoryCounts,
      issues: evalSeedQuality.issues ?? [],
    },
    ragEvalCoverageReadiness: {
      ok: evalCoverageReadiness.ok,
      mutationMode: evalCoverageReadiness.mutationMode,
      releaseReady: evalCoverageReadiness.releaseReady,
      expectedQuestionCount: evalCoverageReadiness.expectedQuestionCount,
      seededQuestionCount: evalCoverageReadiness.seededQuestionCount,
      evaluatedQuestionCount: evalCoverageReadiness.evaluatedQuestionCount,
      missingEvalKeys: evalCoverageReadiness.missingEvalKeys,
      unexpectedEvalKeys: evalCoverageReadiness.unexpectedEvalKeys,
      blockers: evalCoverageReadiness.blockers,
      nextActions: evalCoverageReadiness.nextActions,
    },
    ragEvalExecutionPacket: {
      ok: evalExecutionPacket.ok,
      mutationMode: evalExecutionPacket.mutationMode,
      status: evalExecutionPacket.status,
      selectedMatchesCoverage: evalExecutionPacket.selectedMatchesCoverage,
      missingEvalKeys: evalExecutionPacket.missingEvalKeys,
      approvedCommand: evalExecutionPacket.commandPlan?.approvedCommand,
      requiresExplicitApproval: evalExecutionPacket.commandPlan?.requiresExplicitApproval,
      antiFakeRuleCount: evalExecutionPacket.antiFakeRules?.length ?? 0,
      releaseMeaning: evalExecutionPacket.releaseMeaning,
    },
    ragEvalMissingPreflight: {
      ok: evalMissingPreflight.ok,
      mutationMode: evalMissingPreflight.mutationMode,
      status: evalMissingPreflight.status,
      selectedMatchesCoverage: evalMissingPreflight.selectedMatchesCoverage,
      missingEvalKeys: evalMissingPreflight.missingEvalKeys,
      sourceReadyCount: evalMissingPreflight.summary?.sourceReadyCount,
      termCoverageReadyCount: evalMissingPreflight.summary?.termCoverageReadyCount,
      readyForApprovedEvalCount: evalMissingPreflight.summary?.readyForApprovedEvalCount,
      approvedCommand: evalMissingPreflight.approvedCommand,
      antiFakeRuleCount: evalMissingPreflight.antiFakeRules?.length ?? 0,
      releaseMeaning: evalMissingPreflight.releaseMeaning,
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
      laneKeys: proofIntakeReadiness.lanes.map((lane) => lane.key),
      requiredFieldCount: proofIntakeReadiness.requiredFieldCount,
      antiFakeGateSummary: proofIntakeReadiness.lanes.map((lane) => ({
        key: lane.key,
        qualityGateCount: lane.qualityGates?.length ?? 0,
        nonProofExampleCount: lane.nonProofExamples?.length ?? 0,
        hasRequiredEvidenceFields: laneHasRequiredEvidenceFields(lane),
        blocksSyntheticProof: laneHasAntiFakeControls(lane),
      })),
      weeklyIntakeOrder: proofIntakeReadiness.weeklyIntakeOrder,
      releaseMeaning: proofIntakeReadiness.releaseMeaning,
    },
    proofBacklog: {
      ok: proofBacklog.ok,
      mutationMode: proofBacklog.mutationMode,
      status: proofBacklog.status,
      laneCount: Array.isArray(proofBacklog.lanes) ? proofBacklog.lanes.length : 0,
      laneKeys: proofBacklog.lanes.map((lane) => lane.key),
      blockedLanes: proofBacklog.lanes
        .filter((lane) => lane.status === 'blocked')
        .map((lane) => `${lane.key}:${lane.currentCount}/${lane.targetCount}`),
      nextActions: proofBacklog.nextActions,
    },
    weeklyProofPacket: {
      ok: weeklyProofPacket.ok,
      mutationMode: weeklyProofPacket.mutationMode,
      backlogStatus: weeklyProofPacket.backlogStatus,
      laneCount: Array.isArray(weeklyProofPacket.lanes) ? weeklyProofPacket.lanes.length : 0,
      laneKeys: weeklyProofPacket.lanes.map((lane) => lane.key),
      blockedLanes: weeklyProofPacket.lanes
        .filter((lane) => lane.status === 'blocked')
        .map((lane) => `${lane.key}:${lane.currentCount}/${lane.targetCount}`),
      antiFakeGateSummary: weeklyProofPacket.lanes.map((lane) => ({
        key: lane.key,
        qualityGateCount: lane.qualityGates?.length ?? 0,
        nonProofExampleCount: lane.nonProofExamples?.length ?? 0,
        hasRequiredTemplateFields: packetLaneHasRequiredTemplate(lane),
        blocksSyntheticProof: laneHasAntiFakeControls(lane),
      })),
      releaseMeaning: weeklyProofPacket.releaseMeaning,
    },
    proofCandidateAudit: {
      ok: proofCandidateAudit.ok,
      mutationMode: proofCandidateAudit.mutationMode,
      status: proofCandidateAudit.status,
      laneCount: Array.isArray(proofCandidateAudit.lanes) ? proofCandidateAudit.lanes.length : 0,
      laneKeys: proofCandidateAudit.lanes.map((lane) => lane.key),
      candidateStates: proofCandidateAudit.lanes.map((lane) => `${lane.key}:${lane.candidateState}:${lane.currentCount}/${lane.targetCount}`),
      nextActions: proofCandidateAudit.nextActions,
      releaseMeaning: proofCandidateAudit.releaseMeaning,
    },
    proofSourceVolumeScan: {
      ok: proofSourceVolumeScan.ok,
      mutationMode: proofSourceVolumeScan.mutationMode,
      laneReadiness: proofSourceVolumeScan.laneReadiness,
      counts: proofSourceVolumeScan.counts,
      queryErrors: proofSourceVolumeScan.queryErrors ?? [],
      releaseMeaning: proofSourceVolumeScan.releaseMeaning,
    },
    proofSourceRecoveryPlan: {
      ok: proofSourceRecoveryPlan.ok,
      mutationMode: proofSourceRecoveryPlan.mutationMode,
      status: proofSourceRecoveryPlan.status,
      summary: proofSourceRecoveryPlan.summary,
      laneStates: proofSourceRecoveryPlan.lanes.map((lane) => ({
        key: lane.key,
        status: lane.status,
        sourceVolumeState: lane.sourceVolumeState,
        current: lane.current,
        target: lane.target,
        shortfall: lane.shortfall,
        collectionCadenceCount: lane.collectionCadence?.length ?? 0,
        acceptanceChecklistCount: lane.acceptanceChecklist?.length ?? 0,
      })),
      antiFakeRuleCount: proofSourceRecoveryPlan.antiFakeRules?.length ?? 0,
      releaseMeaning: proofSourceRecoveryPlan.releaseMeaning,
    },
    operatorBrief: {
      ok: operatorBrief.ok,
      mutationMode: operatorBrief.mutationMode,
      blockedLaneCount: operatorBrief.blockedLaneCount,
      proofSourceRecoveryPlan: operatorBrief.proofSourceRecoveryPlan,
      proofLaneKeys: operatorBrief.proofLanes.map((lane) => lane.key),
      currentReality: operatorBrief.currentReality,
      nonClaimRule: operatorBrief.nonClaimRule,
    },
    worldClassReadiness: {
      ok: worldClassReadiness.ok,
      mutationMode: worldClassReadiness.mutationMode,
      releaseDecision: worldClassReadiness.releaseDecision,
      releaseGateFailures: worldClassReadiness.summary?.releaseGateFailures ?? [],
      ragEvalMissingPreflight: worldClassReadiness.ragEvalMissingPreflight,
      proofSourceRecoveryPlan: worldClassReadiness.proofSourceRecoveryPlan,
      immediateActionCount: worldClassReadiness.immediateActionOrder?.length ?? 0,
    },
    remainingGaps: [
      'Deploy or run the gateway worker with Message Content Intent proven, then capture a fresh non-bot non-empty Discord message.',
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
