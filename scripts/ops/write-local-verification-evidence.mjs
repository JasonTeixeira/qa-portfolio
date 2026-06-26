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
  approvalBoundaryCheck: path.join(root, 'docs', 'evidence', 'engineering-loop', 'approval-boundary-check-latest.json'),
  finalScorecard: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-20-final-scorecard.json'),
  operatingCycle: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-21-operating-proof-cycle.json'),
  contentFactory: path.join(root, 'docs', 'evidence', 'discord-ai-os', 'phase-22-content-factory-dry-run.json'),
  evalSeedQuality: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-quality.json'),
  evalSeedDryRun: path.join(root, 'docs', 'evidence', 'rag', 'eval-seed-dry-run.json'),
  evalCoverageReadiness: path.join(root, 'docs', 'evidence', 'rag', 'eval-coverage-readiness.json'),
  evalExecutionPacket: path.join(root, 'docs', 'evidence', 'rag', 'eval-execution-packet.json'),
  evalMissingPreflight: path.join(root, 'docs', 'evidence', 'rag', 'eval-missing-preflight.json'),
  evalRecoveryPlan: path.join(root, 'docs', 'evidence', 'rag', 'eval-recovery-plan.json'),
  discordCorpusReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-corpus-readiness-latest.json'),
  durableJobsReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'durable-jobs-readiness-latest.json'),
  securityPrivacyReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'security-privacy-readiness-latest.json'),
  observabilityQualityReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'observability-quality-readiness-latest.json'),
  proofRehearsalReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'proof-rehearsal-readiness-latest.json'),
  contentFactoryReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'content-factory-readiness-latest.json'),
  premiumWorkflowReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'premium-workflow-readiness-latest.json'),
  publicGrowthReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'public-growth-readiness-latest.json'),
  proofIntakeReadiness: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-intake-readiness-latest.json'),
  proofBacklog: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-backlog-latest.json'),
  weeklyProofPacket: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-weekly-proof-packet-latest.json'),
  proofCandidateAudit: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-candidate-audit-latest.json'),
  proofSourceVolumeScan: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-volume-scan-latest.json'),
  proofSourceRecoveryPlan: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-proof-source-recovery-plan-latest.json'),
  approvedKnowledgePacket: path.join(root, 'docs', 'evidence', 'engineering-loop', 'approved-knowledge-operating-packet-latest.json'),
  operatorBrief: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-operator-brief-latest.json'),
  gatewayCaptureDiagnosis: path.join(root, 'docs', 'evidence', 'engineering-loop', 'discord-gateway-capture-diagnosis-latest.json'),
  gatewayOperatingPacket: path.join(root, 'docs', 'evidence', 'engineering-loop', 'gateway-operating-packet-latest.json'),
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

function candidateLaneHasCriticalFields(lane) {
  const required = new Set(lane.requiredEvidenceFields ?? []);
  const critical = lane.criticalEvidenceFields ?? [];
  return critical.length >= 3 && critical.every((key) => required.has(key));
}

function ragEvalCommandIsGuarded(command) {
  const value = String(command ?? '');
  return !value.includes('npm run rag:evaluate')
    || value.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')
    || value.includes('--dry-run')
    || value.includes(':seed-dry-run')
    || value.includes(':missing-plan')
    || value.includes(':coverage-readiness')
    || value.includes(':execution-packet')
    || value.includes(':missing-preflight')
    || value.includes(':recovery-plan');
}

function proofLaneRagEvalCommandsAreGuarded(lanes) {
  return (lanes ?? []).every((lane) => {
    const commands = [
      lane.verificationCommand,
      lane.provingCommand,
      ...(lane.verificationCommands ?? []),
    ];
    return commands.every(ragEvalCommandIsGuarded);
  });
}

async function main() {
  const [
    approvalBoundaryCheck,
    finalScorecard,
    operatingCycle,
    contentFactory,
    evalSeedQuality,
    evalSeedDryRun,
    evalCoverageReadiness,
    evalExecutionPacket,
    evalMissingPreflight,
    evalRecoveryPlan,
    discordCorpusReadiness,
    durableJobsReadiness,
    securityPrivacyReadiness,
    observabilityQualityReadiness,
    proofRehearsalReadiness,
    contentFactoryReadiness,
    premiumWorkflowReadiness,
    publicGrowthReadiness,
    proofIntakeReadiness,
    proofBacklog,
    weeklyProofPacket,
    proofCandidateAudit,
    proofSourceVolumeScan,
    proofSourceRecoveryPlan,
    approvedKnowledgePacket,
    operatorBrief,
    gatewayCaptureDiagnosis,
    gatewayOperatingPacket,
    worldClassReadiness,
  ] = await Promise.all(
    Object.values(evidencePaths).map(readJson),
  );

  const finalScorecardReleaseGateFailures = releaseGateFailures(finalScorecard);
  requireTruthy(
    approvalBoundaryCheck.ok === true,
    'Approval-boundary evidence is not ok.',
  );
  requireTruthy(
    approvalBoundaryCheck.mutationMode === 'local_file_evidence_only',
    'Approval-boundary check must only inspect local files and write local evidence.',
  );
  requireTruthy(
    approvalBoundaryCheck.releaseMeaning?.includes('does not push, deploy, post to Discord, mutate Supabase, change Stripe, or run RAG evaluation'),
    'Approval-boundary check must explicitly avoid claiming live mutation or RAG eval execution.',
  );
  requireTruthy(
    (approvalBoundaryCheck.failures ?? []).length === 0,
    'Approval-boundary check must not have failures.',
  );
  requireTruthy(
    (approvalBoundaryCheck.riskyScripts ?? []).some((script) => script.script === 'db:push' && script.approvalBoundary === 'requires_explicit_user_approval_before_running'),
    'Approval-boundary check must identify db:push as requiring explicit approval.',
  );
  requireTruthy(
    (approvalBoundaryCheck.riskyScripts ?? []).every((script) => script.includedInLocalRelease === false),
    'Explicit-approval scripts must not be included in the local release graph.',
  );
  requireTruthy(
    approvalBoundaryCheck.guardedEvalScripts?.fullCycleCommand?.includes('npm run rag:evaluate')
      && !approvalBoundaryCheck.guardedEvalScripts.fullCycleCommand.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved')
      && approvalBoundaryCheck.guardedEvalScripts?.fullCycleApprovalBoundary?.includes('must receive explicit approval through the operator environment'),
    'Approval-boundary check must verify full-cycle RAG eval requires external explicit approval.',
  );

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
    evalExecutionPacket.commandPlan?.approvedCommand?.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved'),
    'RAG eval execution packet approved command must include the non-dry-run approval guard.',
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
    evalMissingPreflight.approvedCommand?.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved'),
    'RAG missing eval preflight approved command must include the non-dry-run approval guard.',
  );
  requireTruthy(
    (evalMissingPreflight.antiFakeRules ?? []).some((rule) => rule.includes('preflight-only')),
    'RAG missing eval preflight must block preflight-only evidence from satisfying eval coverage.',
  );
  requireTruthy(evalRecoveryPlan.ok === true, 'RAG eval recovery plan evidence is not ok.');
  requireTruthy(
    evalRecoveryPlan.mutationMode === 'local_file_evidence_only',
    'RAG eval recovery plan must not mutate external systems.',
  );
  requireTruthy(
    evalRecoveryPlan.releaseMeaning?.includes('does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage'),
    'RAG eval recovery plan must explicitly avoid claiming eval proof.',
  );
  requireTruthy(
    evalRecoveryPlan.coverage?.missingEvalCount === (evalCoverageReadiness.missingEvalKeys ?? []).length,
    'RAG eval recovery plan missing count must match eval coverage readiness.',
  );
  requireTruthy(
    (evalRecoveryPlan.missingEvalBacklog ?? []).length === evalRecoveryPlan.coverage?.missingEvalCount,
    'RAG eval recovery plan must create one backlog item for each missing eval key.',
  );
  requireTruthy(
    (evalRecoveryPlan.antiFakeRules ?? []).some((rule) => rule.includes('plan-only')),
    'RAG eval recovery plan must block plan-only evidence from satisfying eval coverage.',
  );
  requireTruthy(
    evalRecoveryPlan.approvedCommand?.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved'),
    'RAG eval recovery plan approved command must include the non-dry-run approval guard.',
  );
  requireTruthy(discordCorpusReadiness.ok === true, 'Discord corpus readiness evidence is not ok.');
  requireTruthy(
    discordCorpusReadiness.validation?.ok === true,
    'Discord corpus readiness validation is not ok.',
  );
  requireTruthy(
    discordCorpusReadiness.mutationMode === 'local_file_evidence_only',
    'Discord corpus readiness must not mutate external systems.',
  );
  requireTruthy(
    discordCorpusReadiness.releaseMeaning?.includes('does not mutate Supabase, sync live RAG, create knowledge rows'),
    'Discord corpus readiness must avoid claiming live RAG sync or corpus growth.',
  );
  requireTruthy(
    discordCorpusReadiness.proofSummary?.approvedOnlyCollector === true
      && discordCorpusReadiness.proofSummary?.adminApprovalSurface === true,
    'Discord corpus readiness must prove approved-only collector and admin approval surface.',
  );
  requireTruthy(
    (discordCorpusReadiness.antiFakeRules ?? []).some((rule) => rule.includes('raw discord_messages rows')),
    'Discord corpus readiness must block raw Discord messages from authoritative RAG proof.',
  );
  requireTruthy(
    (discordCorpusReadiness.antiFakeRules ?? []).some((rule) => rule.includes('smoke-created and cleaned-up RAG rows')),
    'Discord corpus readiness must block smoke rows from counting as live corpus volume.',
  );
  requireTruthy(durableJobsReadiness.ok === true, 'Durable jobs readiness evidence is not ok.');
  requireTruthy(
    durableJobsReadiness.validation?.ok === true,
    'Durable jobs readiness validation is not ok.',
  );
  requireTruthy(
    durableJobsReadiness.mutationMode === 'local_file_evidence_only',
    'Durable jobs readiness must not mutate external systems.',
  );
  requireTruthy(
    durableJobsReadiness.releaseMeaning?.includes('does not mutate Supabase, run jobs, publish Discord posts'),
    'Durable jobs readiness must avoid claiming live job execution or publishing.',
  );
  requireTruthy(
    durableJobsReadiness.proofSummary?.requiredJobCount >= 12
      && durableJobsReadiness.proofSummary?.duplicateDetected === true
      && durableJobsReadiness.proofSummary?.deadLetterCreated === true
      && durableJobsReadiness.proofSummary?.deadLetterRetryQueued === true
      && durableJobsReadiness.proofSummary?.adminSurface === true,
    'Durable jobs readiness must prove registry, idempotency, dead letters, retry, and admin surface.',
  );
  requireTruthy(
    (durableJobsReadiness.antiFakeRules ?? []).some((rule) => rule.includes('smoke-created and cleaned-up job rows')),
    'Durable jobs readiness must block smoke rows from counting as production job health.',
  );
  requireTruthy(
    (durableJobsReadiness.antiFakeRules ?? []).some((rule) => rule.includes('empty dead-letter table')),
    'Durable jobs readiness must block empty dead-letter table from counting as production health by itself.',
  );
  requireTruthy(securityPrivacyReadiness.ok === true, 'Security/privacy readiness evidence is not ok.');
  requireTruthy(
    securityPrivacyReadiness.validation?.ok === true,
    'Security/privacy readiness validation is not ok.',
  );
  requireTruthy(
    securityPrivacyReadiness.mutationMode === 'local_file_evidence_only',
    'Security/privacy readiness must not mutate external systems.',
  );
  requireTruthy(
    securityPrivacyReadiness.releaseMeaning?.includes('does not mutate Supabase, call Discord, create audit rows, moderate members'),
    'Security/privacy readiness must avoid claiming live audit or moderation actions.',
  );
  requireTruthy(
    securityPrivacyReadiness.proofSummary?.promptInjectionBlocked === true
      && securityPrivacyReadiness.proofSummary?.privacyGuardBlocksPrivateData === true
      && securityPrivacyReadiness.proofSummary?.reportAbuseWired === true
      && securityPrivacyReadiness.proofSummary?.adminActionsGuarded === true
      && securityPrivacyReadiness.proofSummary?.publicProofPrivacyGate === true,
    'Security/privacy readiness must prove AI guard, privacy guard, abuse reporting, admin guard, and public proof privacy gate.',
  );
  requireTruthy(
    (securityPrivacyReadiness.antiFakeRules ?? []).some((rule) => rule.includes('fresh live Discord permission audit')),
    'Security/privacy readiness must block local evidence from counting as fresh live Discord permission audit.',
  );
  requireTruthy(
    (securityPrivacyReadiness.antiFakeRules ?? []).some((rule) => rule.includes('moderator decision')),
    'Security/privacy readiness must block abuse classification from counting as moderation decision.',
  );
  requireTruthy(observabilityQualityReadiness.ok === true, 'Observability/quality readiness evidence is not ok.');
  requireTruthy(
    observabilityQualityReadiness.validation?.ok === true,
    'Observability/quality readiness validation is not ok.',
  );
  requireTruthy(
    observabilityQualityReadiness.mutationMode === 'local_file_evidence_only',
    'Observability/quality readiness must not mutate external systems.',
  );
  requireTruthy(
    observabilityQualityReadiness.releaseMeaning?.includes('does not mutate Supabase, call Discord, call DeepSeek, create Langfuse traces'),
    'Observability/quality readiness must avoid claiming live trace, cost, quality, or rollup health.',
  );
  requireTruthy(
    observabilityQualityReadiness.proofSummary?.localFallbackAndRedaction === true
      && observabilityQualityReadiness.proofSummary?.traceCostQualityJobRollup === true
      && observabilityQualityReadiness.proofSummary?.adminSurface === true
      && observabilityQualityReadiness.proofSummary?.schemaRls === true,
    'Observability/quality readiness must prove local fallback, redaction, trace/cost/quality/job rollup, admin surface, and schema/RLS.',
  );
  requireTruthy(
    (observabilityQualityReadiness.antiFakeRules ?? []).some((rule) => rule.includes('live Langfuse trace coverage')),
    'Observability/quality readiness must block local evidence from counting as live Langfuse trace coverage.',
  );
  requireTruthy(
    (observabilityQualityReadiness.antiFakeRules ?? []).some((rule) => rule.includes('billing truth')),
    'Observability/quality readiness must block estimated token cost from counting as billing truth.',
  );
  requireTruthy(
    (observabilityQualityReadiness.antiFakeRules ?? []).some((rule) => rule.includes('smoke-created and cleaned-up rows')),
    'Observability/quality readiness must block smoke rows from counting as production health.',
  );
  requireTruthy(proofRehearsalReadiness.ok === true, 'Proof rehearsal readiness evidence is not ok.');
  requireTruthy(
    proofRehearsalReadiness.validation?.ok === true,
    'Proof rehearsal readiness validation is not ok.',
  );
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
    contentFactoryReadiness.validation?.ok === true,
    'Content factory readiness validation is not ok.',
  );
  requireTruthy(
    contentFactoryReadiness.mutationMode === 'local_file_evidence_only',
    'Content factory readiness must not mutate external systems.',
  );
  requireTruthy(
    contentFactoryReadiness.dryRun === true && contentFactoryReadiness.created === 0,
    'Content factory readiness must prove read-only dry-run behavior.',
  );
  requireTruthy(
    (contentFactoryReadiness.requiredChannelCoverage?.missing ?? []).length === 0,
    'Content factory readiness must cover every required operating channel.',
  );
  requireTruthy(
    (contentFactoryReadiness.channelCadence ?? []).length >= 10,
    'Content factory readiness must include per-channel cadence.',
  );
  requireTruthy(
    (contentFactoryReadiness.approvalChecklist ?? []).length >= 7,
    'Content factory readiness must include a strong admin approval checklist.',
  );
  requireTruthy(
    contentFactoryReadiness.proofPromotionRequirements?.realOperatingProofRequired === true,
    'Content factory readiness must require real operating proof before promotion.',
  );
  requireTruthy(premiumWorkflowReadiness.ok === true, 'Premium workflow readiness evidence is not ok.');
  requireTruthy(
    premiumWorkflowReadiness.validation?.ok === true,
    'Premium workflow readiness validation is not ok.',
  );
  requireTruthy(
    premiumWorkflowReadiness.mutationMode === 'local_file_evidence_only',
    'Premium workflow readiness must not mutate external systems.',
  );
  requireTruthy(
    premiumWorkflowReadiness.releaseMeaning?.includes('does not mutate Supabase, call RAG, create Stripe sessions, change Discord roles'),
    'Premium workflow readiness must explicitly avoid claiming live premium mutation.',
  );
  requireTruthy(
    premiumWorkflowReadiness.proofSummary?.seededProofOk === true && premiumWorkflowReadiness.proofSummary?.qualityScore >= 80,
    'Premium workflow readiness must prove seeded premium proof quality.',
  );
  requireTruthy(
    (premiumWorkflowReadiness.antiFakeRules ?? []).some((rule) => rule.includes('Premium Member role alone')),
    'Premium workflow readiness must block role-only proof.',
  );
  requireTruthy(publicGrowthReadiness.ok === true, 'Public growth readiness evidence is not ok.');
  requireTruthy(
    publicGrowthReadiness.validation?.ok === true,
    'Public growth readiness validation is not ok.',
  );
  requireTruthy(
    publicGrowthReadiness.mutationMode === 'local_file_evidence_only',
    'Public growth readiness must not mutate external systems.',
  );
  requireTruthy(
    publicGrowthReadiness.releaseMeaning?.includes('does not mutate Supabase, publish externally, create growth events'),
    'Public growth readiness must explicitly avoid claiming live public growth mutation.',
  );
  requireTruthy(
    publicGrowthReadiness.proofSummary?.seededProofOk === true
      && publicGrowthReadiness.proofSummary?.privacyScore >= 90
      && publicGrowthReadiness.proofSummary?.qualityScore >= 80,
    'Public growth readiness must prove seeded public proof privacy and quality.',
  );
  requireTruthy(
    (publicGrowthReadiness.antiFakeRules ?? []).some((rule) => rule.includes('four weekly public proof cycles')),
    'Public growth readiness must block seeded smoke proof from counting as weekly cycles.',
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
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded(proofIntakeReadiness.lanes),
    'Proof intake readiness must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
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
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded(proofBacklog.lanes),
    'Proof backlog must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
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
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded(weeklyProofPacket.lanes),
    'Weekly proof packet must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
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
  requireTruthy(
    proofCandidateAudit.lanes.every(candidateLaneHasCriticalFields),
    'Proof candidate audit must preserve lane-specific critical fields for gateway, knowledge, RAG, public proof, and premium proof lanes.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.some((lane) => lane.key === 'public_proof_assets' && lane.criticalEvidenceFields?.includes('growth_tracking_status')),
    'Proof candidate audit public proof lane must require growth_tracking_status before public growth proof can count.',
  );
  requireTruthy(
    proofCandidateAudit.lanes.some((lane) => lane.key === 'premium_workflow_proof' && lane.criticalEvidenceFields?.includes('authorization_evidence') && lane.criticalEvidenceFields?.includes('fulfillment_summary')),
    'Proof candidate audit premium lane must require authorization and fulfillment evidence together.',
  );
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded(proofCandidateAudit.lanes),
    'Proof candidate audit must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
  );
  requireTruthy(approvedKnowledgePacket.ok === true, 'Approved knowledge operating packet evidence is not ok.');
  requireTruthy(
    approvedKnowledgePacket.mutationMode === 'local_file_evidence_only',
    'Approved knowledge operating packet must not mutate external systems.',
  );
  requireTruthy(
    approvedKnowledgePacket.releaseMeaning?.includes('does not approve records, sync RAG, publish content, call AI models, mutate Supabase'),
    'Approved knowledge operating packet must explicitly avoid claiming approval, sync, publish, AI, or Supabase mutation.',
  );
  requireTruthy(
    approvedKnowledgePacket.target?.target === 10
      && approvedKnowledgePacket.target?.remaining === Math.max(0, approvedKnowledgePacket.target.target - approvedKnowledgePacket.target.current),
    'Approved knowledge operating packet must preserve the 10-item target and correct remaining count.',
  );
  requireTruthy(
    (approvedKnowledgePacket.fields ?? []).filter((field) => field.required).length >= 18,
    'Approved knowledge operating packet must require a complete evidence field set.',
  );
  requireTruthy(
    (approvedKnowledgePacket.weeklySlots ?? []).length === approvedKnowledgePacket.target?.target
      && approvedKnowledgePacket.weeklySlots.every((slot) => slot.minimumQualityScore >= 80),
    'Approved knowledge operating packet must define one high-quality slot per target item.',
  );
  requireTruthy(
    approvedKnowledgePacket.scoringRubric?.passScore >= 80
      && (approvedKnowledgePacket.scoringRubric?.dimensions ?? []).reduce((sum, item) => sum + item.points, 0) === approvedKnowledgePacket.scoringRubric?.maxScore,
    'Approved knowledge operating packet must have an 80+ pass score and a complete 100-point rubric.',
  );
  requireTruthy(
    (approvedKnowledgePacket.antiFakeRules ?? []).some((rule) => rule.includes('not operating proof'))
      && (approvedKnowledgePacket.antiFakeRules ?? []).some((rule) => rule.includes('raw discord_messages'))
      && (approvedKnowledgePacket.antiFakeRules ?? []).some((rule) => rule.includes('required field')),
    'Approved knowledge operating packet must block packet-only, raw-message, and incomplete-field proof.',
  );
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded([{ verificationCommands: approvedKnowledgePacket.verificationCommands ?? [] }]),
    'Approved knowledge operating packet must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
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
  requireTruthy(
    proofLaneRagEvalCommandsAreGuarded(proofSourceRecoveryPlan.lanes),
    'Proof source recovery plan must guard non-dry RAG eval commands with SAGE_ALLOW_NON_DRY_RAG_EVAL=approved.',
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
    worldClassReadiness.validation?.ok === true && (worldClassReadiness.validation?.failures ?? []).length === 0,
    'World-class readiness validator must pass before local verification can pass.',
  );
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
    worldClassReadiness.ragEvalRecoveryPlan?.status !== 'missing',
    'World-class readiness must include the RAG eval recovery plan.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalRecoveryPlan?.missingEvalCount === (evalMissingPreflight.missingEvalKeys ?? []).length,
    'World-class readiness RAG eval recovery missing count must match the preflight.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalRecoveryPlan?.readyMissingEvalCount === evalMissingPreflight.summary?.readyForApprovedEvalCount,
    'World-class readiness RAG eval recovery ready count must match the preflight.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalRecoveryPlan?.approvedCommand === evalRecoveryPlan.approvedCommand,
    'World-class readiness RAG eval recovery approved command must match the recovery plan.',
  );
  requireTruthy(
    worldClassReadiness.ragEvalRecoveryPlan?.releaseMeaning?.includes('does not seed Supabase'),
    'World-class readiness RAG eval recovery plan must preserve the no-mutation/no-proof boundary.',
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
    worldClassReadiness.immediateActionOrder?.some((action) => action.includes('rag:evaluate:recovery-plan')),
    'World-class readiness must put the RAG eval recovery plan in immediate actions.',
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
  requireTruthy(gatewayOperatingPacket.ok === true, 'Gateway operating packet evidence is not ok.');
  requireTruthy(
    gatewayOperatingPacket.mutationMode === 'local_file_evidence_only',
    'Gateway operating packet must not mutate external systems.',
  );
  requireTruthy(
    gatewayOperatingPacket.releaseMeaning?.includes('does not run the worker')
      && gatewayOperatingPacket.releaseMeaning?.includes('post messages')
      && gatewayOperatingPacket.releaseMeaning?.includes('mutate Supabase')
      && gatewayOperatingPacket.releaseMeaning?.includes('satisfy operating proof'),
    'Gateway operating packet must explicitly avoid claiming worker execution, Discord posting, Supabase mutation, or operating proof.',
  );
  requireTruthy(
    gatewayOperatingPacket.target?.target === 1
      && gatewayOperatingPacket.target?.remaining === Math.max(0, gatewayOperatingPacket.target.target - gatewayOperatingPacket.target.current),
    'Gateway operating packet must target one fresh usable message with correct remaining count.',
  );
  requireTruthy(
    (gatewayOperatingPacket.fields ?? []).filter((field) => field.required).length >= 16,
    'Gateway operating packet must include enough required proof fields.',
  );
  for (const requiredGatewayField of ['worker_id', 'message_content_enabled', 'usable_message_id', 'content_length', 'author_bot', 'deleted', 'evidence_artifact_path', 'operator_attestation']) {
    requireTruthy(
      (gatewayOperatingPacket.fields ?? []).some((field) => field.key === requiredGatewayField && field.required),
      `Gateway operating packet missing required field ${requiredGatewayField}.`,
    );
  }
  requireTruthy(
    (gatewayOperatingPacket.antiFakeRules ?? []).some((rule) => rule.includes('identify-only'))
      && (gatewayOperatingPacket.antiFakeRules ?? []).some((rule) => rule.includes('empty content'))
      && (gatewayOperatingPacket.antiFakeRules ?? []).some((rule) => rule.includes('bot messages'))
      && (gatewayOperatingPacket.antiFakeRules ?? []).some((rule) => rule.includes('deleted messages'))
      && (gatewayOperatingPacket.antiFakeRules ?? []).some((rule) => rule.includes('stale heartbeat')),
    'Gateway operating packet must block identify-only, empty-content, bot, deleted-message, and stale-heartbeat proof.',
  );
  requireTruthy(
    (gatewayOperatingPacket.verificationCommands ?? []).every((command) => !String(command).includes('discord:gateway:once') && !String(command).includes('discord:classify-messages')),
    'Gateway operating packet local verification commands must not run worker one-shots or live classification mutation.',
  );
  requireTruthy(
    gatewayOperatingPacket.status === 'proven' || gatewayOperatingPacket.status === 'ready_for_fresh_message',
    `Gateway operating packet must be proven or ready for a fresh member message, got ${gatewayOperatingPacket.status}.`,
  );
  if (gatewayOperatingPacket.status === 'ready_for_fresh_message') {
    requireTruthy(
      gatewayOperatingPacket.messageContentSignal?.effectiveEnabled === true,
      'Gateway operating packet must prove Message Content Intent is effectively enabled before asking for a fresh member message.',
    );
    requireTruthy(
      gatewayOperatingPacket.messageContentSignal?.source === 'identify_event',
      'Gateway operating packet must identify the Message Content Intent signal source before asking for a fresh member message.',
    );
    requireTruthy(
      gatewayOperatingPacket.target?.remaining === 1,
      'Gateway operating packet must expose the remaining fresh-member-message target.',
    );
    requireTruthy(
      gatewayOperatingPacket.target?.usableMessageState === 'message_content_ready_needs_fresh_member_message',
      'Gateway operating packet must name the precise usable-message state.',
    );
    requireTruthy(
      (gatewayOperatingPacket.nextActions ?? []).some((action) => String(action).includes('fresh non-bot member message')),
      'Gateway operating packet must tell the operator to post or request one fresh non-bot member message.',
    );
  }

  const operatingStatus = operatingCycle.status ?? (operatingCycle.ok ? 'passed' : 'blocked');
  requireTruthy(
    operatingStatus === 'passed' || operatingStatus === 'blocked',
    `Unsupported operating-cycle status: ${operatingStatus}`,
  );

  const metrics = operatingCycle.metricsAfter ?? operatingCycle.metricsBefore ?? {};
  const knownBlockers = summarizeOperatingBlockers(operatingCycle);
  const proofBacklogBlockedLanes = proofBacklog.lanes
    .filter((lane) => lane.status === 'blocked')
    .map((lane) => `${lane.key}:${lane.currentCount}/${lane.targetCount}`);
  const ragEvalApprovedCommand = evalMissingPreflight.approvedCommand
    ?? evalRecoveryPlan.approvedCommand
    ?? evalExecutionPacket.commandPlan?.approvedCommand
    ?? null;

  const evidence = {
    ok: true,
    version: 'local-verification-evidence-v1',
    timestamp: new Date().toISOString(),
    command: 'npm run verify:local',
    mutationMode: 'local_file_evidence_only',
    summary: {
      localVerificationPassed: true,
      worldClassEligible: finalScorecard.worldClassEligible === true,
      averageScore: finalScorecard.averageScore,
      releaseGateFailures: finalScorecardReleaseGateFailures,
      ragEvalCoverage: {
        releaseReady: evalCoverageReadiness.releaseReady === true,
        evaluatedQuestionCount: evalCoverageReadiness.evaluatedQuestionCount,
        expectedQuestionCount: evalCoverageReadiness.expectedQuestionCount,
        missingEvalKeyCount: evalCoverageReadiness.missingEvalKeys?.length ?? 0,
        approvedCommand: ragEvalApprovedCommand,
        requiresExplicitApproval: Boolean(ragEvalApprovedCommand),
      },
      operatingProof: {
        status: operatingStatus,
        blockedLanes: proofBacklogBlockedLanes,
        knownBlockers,
      },
      actionPlan: {
        localOnlyCommands: worldClassReadiness.actionPlan?.localOnlyCommands ?? [],
        explicitApprovalCommands: worldClassReadiness.actionPlan?.explicitApprovalCommands ?? [],
        liveOperatorActions: worldClassReadiness.actionPlan?.liveOperatorActions ?? [],
      },
      nonClaimRule: 'Local verification passing does not mean world-class or 95+ until RAG coverage and real operating proof lanes pass.',
    },
    gates: [
      { command: 'npm run test:unit', passed: true },
      { command: 'npm run typecheck', passed: true },
      { command: 'npm run lint', passed: true },
      { command: 'npm run build', passed: true },
      { command: 'npm run ops:approval-boundaries', passed: true },
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
    approvalBoundaryCheck: {
      ok: approvalBoundaryCheck.ok,
      mutationMode: approvalBoundaryCheck.mutationMode,
      localReleaseRoots: approvalBoundaryCheck.localReleaseRoots,
      riskyScriptCount: approvalBoundaryCheck.riskyScripts?.length ?? 0,
      riskyScriptsIncludedInLocalRelease: (approvalBoundaryCheck.riskyScripts ?? [])
        .filter((script) => script.includedInLocalRelease)
        .map((script) => script.script),
      failures: approvalBoundaryCheck.failures ?? [],
      releaseMeaning: approvalBoundaryCheck.releaseMeaning,
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
    ragEvalRecoveryPlan: {
      ok: evalRecoveryPlan.ok,
      mutationMode: evalRecoveryPlan.mutationMode,
      status: evalRecoveryPlan.status,
      missingEvalCount: evalRecoveryPlan.coverage?.missingEvalCount ?? 0,
      failedEvalCount: evalRecoveryPlan.latestEval?.failedCount ?? 0,
      missingEvalBacklogReadyCount: (evalRecoveryPlan.missingEvalBacklog ?? []).filter((item) => item.readyForApprovedEval).length,
      approvedCommand: evalRecoveryPlan.approvedCommand,
      antiFakeRuleCount: evalRecoveryPlan.antiFakeRules?.length ?? 0,
      releaseMeaning: evalRecoveryPlan.releaseMeaning,
    },
    discordCorpusReadiness: {
      ok: discordCorpusReadiness.ok,
      mutationMode: discordCorpusReadiness.mutationMode,
      proofSummary: discordCorpusReadiness.proofSummary,
      checkCount: discordCorpusReadiness.checks?.length ?? 0,
      failures: discordCorpusReadiness.failures ?? [],
      antiFakeRules: discordCorpusReadiness.antiFakeRules,
      nextOperatingProofRequired: discordCorpusReadiness.nextOperatingProofRequired,
      releaseMeaning: discordCorpusReadiness.releaseMeaning,
    },
    durableJobsReadiness: {
      ok: durableJobsReadiness.ok,
      mutationMode: durableJobsReadiness.mutationMode,
      proofSummary: durableJobsReadiness.proofSummary,
      checkCount: durableJobsReadiness.checks?.length ?? 0,
      failures: durableJobsReadiness.failures ?? [],
      antiFakeRules: durableJobsReadiness.antiFakeRules,
      nextOperatingProofRequired: durableJobsReadiness.nextOperatingProofRequired,
      releaseMeaning: durableJobsReadiness.releaseMeaning,
    },
    securityPrivacyReadiness: {
      ok: securityPrivacyReadiness.ok,
      mutationMode: securityPrivacyReadiness.mutationMode,
      proofSummary: securityPrivacyReadiness.proofSummary,
      checkCount: securityPrivacyReadiness.checks?.length ?? 0,
      failures: securityPrivacyReadiness.failures ?? [],
      antiFakeRules: securityPrivacyReadiness.antiFakeRules,
      nextOperatingProofRequired: securityPrivacyReadiness.nextOperatingProofRequired,
      releaseMeaning: securityPrivacyReadiness.releaseMeaning,
    },
    observabilityQualityReadiness: {
      ok: observabilityQualityReadiness.ok,
      mutationMode: observabilityQualityReadiness.mutationMode,
      proofSummary: observabilityQualityReadiness.proofSummary,
      checkCount: observabilityQualityReadiness.checks?.length ?? 0,
      failures: observabilityQualityReadiness.failures ?? [],
      antiFakeRules: observabilityQualityReadiness.antiFakeRules,
      nextOperatingProofRequired: observabilityQualityReadiness.nextOperatingProofRequired,
      releaseMeaning: observabilityQualityReadiness.releaseMeaning,
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
      requiredChannelCoverage: contentFactoryReadiness.requiredChannelCoverage,
      channelCadence: contentFactoryReadiness.channelCadence,
      approvalChecklistCount: contentFactoryReadiness.approvalChecklist?.length ?? 0,
      proofPromotionRequirements: contentFactoryReadiness.proofPromotionRequirements,
      releaseMeaning: contentFactoryReadiness.releaseMeaning,
    },
    premiumWorkflowReadiness: {
      ok: premiumWorkflowReadiness.ok,
      mutationMode: premiumWorkflowReadiness.mutationMode,
      proofSummary: premiumWorkflowReadiness.proofSummary,
      checkCount: premiumWorkflowReadiness.checks?.length ?? 0,
      failures: premiumWorkflowReadiness.failures ?? [],
      antiFakeRules: premiumWorkflowReadiness.antiFakeRules,
      nextOperatingProofRequired: premiumWorkflowReadiness.nextOperatingProofRequired,
      releaseMeaning: premiumWorkflowReadiness.releaseMeaning,
    },
    publicGrowthReadiness: {
      ok: publicGrowthReadiness.ok,
      mutationMode: publicGrowthReadiness.mutationMode,
      proofSummary: publicGrowthReadiness.proofSummary,
      checkCount: publicGrowthReadiness.checks?.length ?? 0,
      failures: publicGrowthReadiness.failures ?? [],
      antiFakeRules: publicGrowthReadiness.antiFakeRules,
      nextOperatingProofRequired: publicGrowthReadiness.nextOperatingProofRequired,
      releaseMeaning: publicGrowthReadiness.releaseMeaning,
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
      blockedLanes: proofBacklogBlockedLanes,
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
      criticalFieldSummary: proofCandidateAudit.lanes.map((lane) => ({
        key: lane.key,
        criticalFieldCount: lane.criticalEvidenceFields?.length ?? 0,
        hasCriticalFields: candidateLaneHasCriticalFields(lane),
        criticalEvidenceFields: lane.criticalEvidenceFields ?? [],
      })),
      nextActions: proofCandidateAudit.nextActions,
      releaseMeaning: proofCandidateAudit.releaseMeaning,
    },
    approvedKnowledgePacket: {
      ok: approvedKnowledgePacket.ok,
      mutationMode: approvedKnowledgePacket.mutationMode,
      status: approvedKnowledgePacket.status,
      target: approvedKnowledgePacket.target,
      requiredFieldCount: approvedKnowledgePacket.fields?.filter((field) => field.required).length ?? 0,
      weeklySlotCount: approvedKnowledgePacket.weeklySlots?.length ?? 0,
      passScore: approvedKnowledgePacket.scoringRubric?.passScore,
      antiFakeRules: approvedKnowledgePacket.antiFakeRules,
      nextActions: approvedKnowledgePacket.nextActions,
      releaseMeaning: approvedKnowledgePacket.releaseMeaning,
    },
    gatewayOperatingPacket: {
      ok: gatewayOperatingPacket.ok,
      mutationMode: gatewayOperatingPacket.mutationMode,
      status: gatewayOperatingPacket.status,
      target: gatewayOperatingPacket.target,
      heartbeat: gatewayOperatingPacket.heartbeat,
      messageContentSignal: gatewayOperatingPacket.messageContentSignal,
      requiredFieldCount: gatewayOperatingPacket.fields?.filter((field) => field.required).length ?? 0,
      antiFakeRules: gatewayOperatingPacket.antiFakeRules,
      nextActions: gatewayOperatingPacket.nextActions,
      releaseMeaning: gatewayOperatingPacket.releaseMeaning,
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
      validation: worldClassReadiness.validation,
      releaseGateFailures: worldClassReadiness.summary?.releaseGateFailures ?? [],
      ragEvalMissingPreflight: worldClassReadiness.ragEvalMissingPreflight,
      ragEvalRecoveryPlan: worldClassReadiness.ragEvalRecoveryPlan,
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
