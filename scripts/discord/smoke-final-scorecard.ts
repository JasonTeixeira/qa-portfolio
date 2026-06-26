import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  buildDiscordFinalScorecardSummary,
  buildDiscordFinalScorecard,
  buildDiscordOperatingRhythm,
  DISCORD_FINAL_SCORECARD_VERSION,
  REQUIRED_PHASE_EVIDENCE,
  validateDiscordFinalScorecard,
  validateDiscordOperatingRhythm,
  type DiscordReleaseGate,
} from '@/lib/discord/final-scorecard';
import { RAG_EVAL_QUESTION_SEEDS } from '@/lib/rag/evals';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');
const dryRun = process.argv.includes('--dry-run') || process.env.DISCORD_FINAL_SCORECARD_DRY_RUN === 'true';
const READINESS_VALIDATION_EVIDENCE = [
  'docs/evidence/engineering-loop/content-factory-readiness-latest.json',
  'docs/evidence/engineering-loop/discord-corpus-readiness-latest.json',
  'docs/evidence/engineering-loop/discord-proof-intake-readiness-latest.json',
  'docs/evidence/engineering-loop/durable-jobs-readiness-latest.json',
  'docs/evidence/engineering-loop/observability-quality-readiness-latest.json',
  'docs/evidence/engineering-loop/premium-workflow-readiness-latest.json',
  'docs/evidence/engineering-loop/proof-rehearsal-readiness-latest.json',
  'docs/evidence/engineering-loop/public-growth-readiness-latest.json',
  'docs/evidence/engineering-loop/security-privacy-readiness-latest.json',
];

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function readJsonFile(relativePath: string): Promise<any> {
  return JSON.parse(await readFile(path.join(process.cwd(), relativePath), 'utf8'));
}

function evidencePasses(payload: any): boolean {
  if (payload?.ok === true) return true;
  const status = String(payload?.status ?? '');
  if (status === 'completed' || status === 'passed' || status.startsWith('passed_') || status.startsWith('deployed')) return true;
  if (payload?.summary?.ok === true) return true;
  return false;
}

async function validateEvidenceFiles(): Promise<{
  ok: boolean;
  missing: string[];
  failing: string[];
  evidenceIndex: Array<{ path: string; ok: boolean; status: string | null }>;
}> {
  const missing: string[] = [];
  const failing: string[] = [];
  const evidenceIndex: Array<{ path: string; ok: boolean; status: string | null }> = [];
  for (const evidencePath of REQUIRED_PHASE_EVIDENCE) {
    try {
      const payload = await readJsonFile(evidencePath);
      const ok = evidencePasses(payload);
      if (!ok) failing.push(evidencePath);
      evidenceIndex.push({
        path: evidencePath,
        ok,
        status: String(payload?.status ?? payload?.ok ?? payload?.summary?.ok ?? 'unknown'),
      });
    } catch {
      missing.push(evidencePath);
      evidenceIndex.push({ path: evidencePath, ok: false, status: 'missing' });
    }
  }
  return { ok: missing.length === 0 && failing.length === 0, missing, failing, evidenceIndex };
}

async function validateReadinessValidationArtifacts(): Promise<{
  ok: boolean;
  failures: string[];
  evidence: string;
  artifacts: Array<{ path: string; ok: boolean; validationOk: boolean; validator: string | null }>;
}> {
  const failures: string[] = [];
  const artifacts = await Promise.all(READINESS_VALIDATION_EVIDENCE.map(async (evidencePath) => {
    try {
      const payload = await readJsonFile(evidencePath);
      const artifact = {
        path: evidencePath,
        ok: payload?.ok === true,
        validationOk: payload?.validation?.ok === true,
        validator: typeof payload?.validation?.validator === 'string' ? payload.validation.validator : null,
      };
      if (!artifact.ok) failures.push(`readiness_not_ok:${evidencePath}`);
      if (!artifact.validationOk) failures.push(`readiness_validation_not_ok:${evidencePath}`);
      if (!artifact.validator) failures.push(`readiness_validator_missing:${evidencePath}`);
      return artifact;
    } catch {
      failures.push(`readiness_missing:${evidencePath}`);
      return {
        path: evidencePath,
        ok: false,
        validationOk: false,
        validator: null,
      };
    }
  }));
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${artifacts.filter((artifact) => artifact.ok && artifact.validationOk).length}/${artifacts.length} readiness validators passed`,
    artifacts,
  };
}

async function validateDatabaseReleaseTables(sb: any) {
  const tables = [
    'discord_security_audit_runs',
    'discord_scale_readiness_runs',
    'discord_final_scorecard_runs',
    'discord_job_runs',
    'discord_job_dead_letters',
    'discord_gateway_heartbeats',
    'rag_eval_runs',
    'rag_eval_results',
  ];
  const checks: Record<string, boolean> = {};
  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { count, error } = await (sb as any).from(table).select('*', { count: 'exact', head: true });
    checks[table] = !error;
    counts[table] = count ?? 0;
  }
  return {
    ok: Object.values(checks).every(Boolean),
    checks,
    counts,
  };
}

function validateProofRehearsalReadiness(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  const lanes = Array.isArray(payload?.lanes) ? payload.lanes : [];
  const laneKeys = lanes.map((lane: any) => String(lane?.key ?? ''));
  if (payload?.ok !== true) failures.push('proof_rehearsal_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('proof_rehearsal_mutation_mode_not_read_only');
  if (lanes.length < 5) failures.push('proof_rehearsal_missing_lanes');
  if (laneKeys[0] !== 'gateway_capture_rehearsal') failures.push('proof_rehearsal_gateway_not_first');
  if (!laneKeys.includes('content_factory_readiness_rehearsal')) failures.push('proof_rehearsal_missing_content_factory');
  if (!lanes.every((lane: any) => lane?.ok === true)) failures.push('proof_rehearsal_lane_failed');
  if (!String(payload?.releaseMeaning ?? '').includes('Real 95+ operating proof')) failures.push('proof_rehearsal_operating_proof_disclaimer_missing');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${lanes.filter((lane: any) => lane?.ok === true).length}/${lanes.length} rehearsal lanes ready, mutation=${payload?.mutationMode ?? 'unknown'}`,
  };
}

function validateContentFactoryReadiness(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  if (payload?.ok !== true) failures.push('content_factory_readiness_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('content_factory_readiness_mutation_mode_not_read_only');
  if (payload?.dryRun !== true) failures.push('content_factory_readiness_not_dry_run');
  if (Number(payload?.planned ?? 0) < 28) failures.push('content_factory_readiness_insufficient_planned');
  if (Number(payload?.created ?? 0) !== 0) failures.push('content_factory_readiness_created_drafts');
  if (Number(payload?.failed ?? 0) !== 0) failures.push('content_factory_readiness_failed_drafts');
  if (Number(payload?.minQualityScore ?? 0) < 90) failures.push('content_factory_readiness_quality_below_gate');
  if (!payload?.approvalGate?.adminApprovalRequired) failures.push('content_factory_readiness_missing_admin_gate');
  if (!payload?.approvalGate?.noPublicPublish) failures.push('content_factory_readiness_public_publish_not_blocked');
  if (!String(payload?.releaseMeaning ?? '').includes('Real operating proof still requires')) failures.push('content_factory_readiness_disclaimer_missing');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${payload?.planned ?? 0} planned / min quality ${payload?.minQualityScore ?? 'n/a'} / mutation=${payload?.mutationMode ?? 'unknown'}`,
  };
}

function validateProofSourceVolumeScan(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  const lanes = payload?.laneReadiness ?? {};
  const approvedKnowledge = lanes.approvedDiscordKnowledge ?? {};
  const ragDiscordSources = lanes.ragDiscordSources ?? {};
  const publicProofAssets = lanes.publicProofAssets ?? {};
  const premiumWorkflowProof = lanes.premiumWorkflowProof ?? {};
  if (payload?.ok !== true) failures.push('proof_source_volume_scan_not_ok');
  if (payload?.mutationMode !== 'read_only_supabase_selects_and_local_file_evidence_only') failures.push('proof_source_volume_scan_mutation_mode_not_read_only');
  if (!String(payload?.releaseMeaning ?? '').includes('does not approve, sync, publish, assign roles, or satisfy operating proof')) failures.push('proof_source_volume_scan_non_proof_disclaimer_missing');
  if (Number(approvedKnowledge.target ?? 0) !== 10) failures.push('proof_source_volume_scan_approved_knowledge_target_wrong');
  if (Number(ragDiscordSources.target ?? 0) !== 10) failures.push('proof_source_volume_scan_rag_target_wrong');
  if (Number(publicProofAssets.target ?? 0) !== 4) failures.push('proof_source_volume_scan_public_proof_target_wrong');
  if (Number(premiumWorkflowProof.target ?? 0) !== 1) failures.push('proof_source_volume_scan_premium_target_wrong');
  for (const [key, lane] of Object.entries(lanes)) {
    const current = Number((lane as any)?.current ?? 0);
    const target = Number((lane as any)?.target ?? 0);
    if (current < target && !String((lane as any)?.blocker ?? '').trim()) {
      failures.push(`proof_source_volume_scan_missing_blocker:${key}`);
    }
  }
  return {
    ok: failures.length === 0,
    failures,
    evidence: [
      `approved ${approvedKnowledge.current ?? 0}/${approvedKnowledge.target ?? 0}`,
      `rag ${ragDiscordSources.current ?? 0}/${ragDiscordSources.target ?? 0}`,
      `public ${publicProofAssets.current ?? 0}/${publicProofAssets.target ?? 0}`,
      `premium ${premiumWorkflowProof.current ?? 0}/${premiumWorkflowProof.target ?? 0}`,
    ].join(' / '),
  };
}

function validateProofSourceRecoveryPlan(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  const lanes = Array.isArray(payload?.lanes) ? payload.lanes : [];
  if (payload?.ok !== true) failures.push('proof_source_recovery_plan_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('proof_source_recovery_plan_mutation_mode_not_local_only');
  if (!String(payload?.releaseMeaning ?? '').includes('does not approve, sync, publish, assign roles, call AI models, or satisfy operating proof')) failures.push('proof_source_recovery_plan_non_proof_disclaimer_missing');
  if (lanes.length !== 4) failures.push('proof_source_recovery_plan_wrong_lane_count');
  if (lanes[0]?.key !== 'approvedDiscordKnowledge') failures.push('proof_source_recovery_plan_approved_knowledge_not_first');
  if (!lanes.some((lane: any) => lane?.key === 'premiumWorkflowProof')) failures.push('proof_source_recovery_plan_missing_premium_lane');
  const totalShortfall = lanes.reduce((sum: number, lane: any) => sum + Math.max(0, Number(lane?.target ?? 0) - Number(lane?.current ?? 0)), 0);
  if (Number(payload?.summary?.totalShortfall ?? -1) !== totalShortfall) failures.push('proof_source_recovery_plan_shortfall_mismatch');
  if (payload?.status === 'blocked' && !String(payload?.summary?.nextLane ?? '').trim()) failures.push('proof_source_recovery_plan_blocked_without_next_lane');
  if (!lanes.every((lane: any) => Array.isArray(lane?.evidenceToCollect) && lane.evidenceToCollect.length >= 2)) failures.push('proof_source_recovery_plan_missing_evidence_guidance');
  if (!lanes.every((lane: any) => Array.isArray(lane?.doNotCount) && lane.doNotCount.length >= 3)) failures.push('proof_source_recovery_plan_missing_anti_fake_lane_rules');
  if (!Array.isArray(payload?.antiFakeRules) || !payload.antiFakeRules.some((rule: string) => rule.includes('dry-run'))) failures.push('proof_source_recovery_plan_missing_global_dry_run_rule');
  if (!lanes.every(laneRagEvalCommandsAreGuarded)) failures.push('proof_source_recovery_plan_unguarded_rag_eval_command');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${lanes.length} lanes / blocked ${lanes.filter((lane: any) => lane?.status === 'blocked').length}/${lanes.length} / shortfall ${payload?.summary?.totalShortfall ?? 'n/a'} / RAG eval guard lanes ${lanes.filter(laneRagEvalCommandsAreGuarded).length}/${lanes.length}`,
  };
}

function validateRagEvalCoverageReadiness(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  if (payload?.ok !== true) failures.push('rag_eval_coverage_readiness_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('rag_eval_coverage_readiness_mutation_mode_not_local_only');
  if (!String(payload?.releaseMeaning ?? '').includes('does not seed Supabase, call DeepSeek, run retrieval, or satisfy the full eval release gate')) failures.push('rag_eval_coverage_readiness_disclaimer_missing');
  if (Number(payload?.expectedQuestionCount ?? 0) !== RAG_EVAL_QUESTION_SEEDS.length) failures.push('rag_eval_coverage_expected_count_wrong');
  if (!Array.isArray(payload?.missingEvalKeys)) failures.push('rag_eval_coverage_missing_keys_not_array');
  if (!Array.isArray(payload?.unexpectedEvalKeys)) failures.push('rag_eval_coverage_unexpected_keys_not_array');
  if (payload?.releaseReady !== true && !Array.isArray(payload?.blockers)) failures.push('rag_eval_coverage_missing_blockers');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${payload?.evaluatedQuestionCount ?? 0}/${payload?.expectedQuestionCount ?? RAG_EVAL_QUESTION_SEEDS.length} evaluated, missing ${(payload?.missingEvalKeys ?? []).length}, releaseReady=${payload?.releaseReady === true}`,
  };
}

function laneHasRequiredEvidenceFields(lane: any): boolean {
  const fields = Array.isArray(lane?.requiredFields) ? lane.requiredFields : [];
  const keys = new Set(fields.map((field: any) => String(field?.key ?? '')));
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

function laneHasAntiFakeControls(lane: any): boolean {
  const qualityGates = Array.isArray(lane?.qualityGates) ? lane.qualityGates : [];
  const nonProofExamples = Array.isArray(lane?.nonProofExamples) ? lane.nonProofExamples : [];
  const nonProofText = nonProofExamples.join(' ').toLowerCase();
  return qualityGates.length >= 4
    && nonProofExamples.length >= 4
    && (nonProofText.includes('smoke') || nonProofText.includes('dry-run') || nonProofText.includes('synthetic'));
}

function packetLaneHasRequiredTemplate(lane: any): boolean {
  const template = lane?.intakeTemplate ?? {};
  return [
    'proof_cycle_key',
    'source_record_id',
    'source_created_at',
    'decision_reason',
    'evidence_artifact_path',
    'operator_attestation',
    'privacy_status',
  ].every((key) => Boolean(template[key]));
}

function ragEvalCommandIsGuarded(command: unknown): boolean {
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

function laneRagEvalCommandsAreGuarded(lane: any): boolean {
  const commands = [
    lane?.verificationCommand,
    lane?.provingCommand,
    ...(Array.isArray(lane?.verificationCommands) ? lane.verificationCommands : []),
  ];
  return commands.every(ragEvalCommandIsGuarded);
}

function validateProofIntakeAntiFakeControls(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  const lanes = Array.isArray(payload?.lanes) ? payload.lanes : [];
  if (payload?.ok !== true) failures.push('proof_intake_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('proof_intake_mutation_mode_not_read_only');
  if (!String(payload?.releaseMeaning ?? '').includes('does not satisfy real operating proof lanes')) failures.push('proof_intake_non_proof_disclaimer_missing');
  if (lanes.length !== 5) failures.push('proof_intake_wrong_lane_count');
  if (lanes[0]?.key !== 'gateway_capture') failures.push('proof_intake_gateway_not_first');
  if (!lanes.every(laneHasRequiredEvidenceFields)) failures.push('proof_intake_missing_required_evidence_fields');
  if (!lanes.every(laneHasAntiFakeControls)) failures.push('proof_intake_missing_anti_fake_controls');
  if (!lanes.every(laneRagEvalCommandsAreGuarded)) failures.push('proof_intake_unguarded_rag_eval_command');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${lanes.length} lanes / anti-fake lanes ${lanes.filter(laneHasAntiFakeControls).length}/${lanes.length} / required-field lanes ${lanes.filter(laneHasRequiredEvidenceFields).length}/${lanes.length} / RAG eval guard lanes ${lanes.filter(laneRagEvalCommandsAreGuarded).length}/${lanes.length}`,
  };
}

function validateWeeklyProofPacketAntiFakeControls(payload: any): { ok: boolean; failures: string[]; evidence: string } {
  const failures: string[] = [];
  const lanes = Array.isArray(payload?.lanes) ? payload.lanes : [];
  if (payload?.ok !== true) failures.push('weekly_proof_packet_not_ok');
  if (payload?.mutationMode !== 'local_file_evidence_only') failures.push('weekly_proof_packet_mutation_mode_not_read_only');
  if (!String(payload?.releaseMeaning ?? '').includes('does not create or satisfy operating proof')) failures.push('weekly_proof_packet_non_proof_disclaimer_missing');
  if (lanes.length !== 5) failures.push('weekly_proof_packet_wrong_lane_count');
  if (lanes[0]?.key !== 'gateway_capture') failures.push('weekly_proof_packet_gateway_not_first');
  if (!lanes.every(packetLaneHasRequiredTemplate)) failures.push('weekly_proof_packet_missing_required_template_fields');
  if (!lanes.every(laneHasAntiFakeControls)) failures.push('weekly_proof_packet_missing_anti_fake_controls');
  if (!lanes.every(laneRagEvalCommandsAreGuarded)) failures.push('weekly_proof_packet_unguarded_rag_eval_command');
  return {
    ok: failures.length === 0,
    failures,
    evidence: `${lanes.length} lanes / anti-fake lanes ${lanes.filter(laneHasAntiFakeControls).length}/${lanes.length} / template-field lanes ${lanes.filter(packetLaneHasRequiredTemplate).length}/${lanes.length} / RAG eval guard lanes ${lanes.filter(laneRagEvalCommandsAreGuarded).length}/${lanes.length}`,
  };
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runKey = `phase-20-final-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const scorecard = buildDiscordFinalScorecard();
  const summary = buildDiscordFinalScorecardSummary(scorecard);
  const rhythm = buildDiscordOperatingRhythm();
  const [scorecardValidation, rhythmValidation, evidenceValidation, readinessValidation, databaseValidation, ragEval, ragEvalCoverageReadiness, proofRehearsal, contentFactoryReadiness, proofSourceVolumeScan, proofSourceRecoveryPlan, proofIntakeReadiness, weeklyProofPacket, runbook, migration] = await Promise.all([
    Promise.resolve(validateDiscordFinalScorecard(scorecard)),
    Promise.resolve(validateDiscordOperatingRhythm(rhythm)),
    validateEvidenceFiles(),
    validateReadinessValidationArtifacts(),
    validateDatabaseReleaseTables(sb),
    readJsonFile('docs/evidence/rag/eval-latest.json'),
    readJsonFile('docs/evidence/rag/eval-coverage-readiness.json'),
    readJsonFile('docs/evidence/engineering-loop/proof-rehearsal-readiness-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/content-factory-readiness-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/discord-proof-source-volume-scan-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/discord-proof-source-recovery-plan-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/discord-proof-intake-readiness-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/discord-weekly-proof-packet-latest.json'),
    readFile(path.join(process.cwd(), 'docs', 'discord', 'FINAL_OPERATING_RHYTHM_RELEASE_STANDARD.md'), 'utf8'),
    readFile(path.join(process.cwd(), 'supabase', 'migrations', '0094_discord_final_scorecard_release.sql'), 'utf8'),
  ]);
  const ragEvalCoverageReadinessValidation = validateRagEvalCoverageReadiness(ragEvalCoverageReadiness);
  const proofRehearsalValidation = validateProofRehearsalReadiness(proofRehearsal);
  const contentFactoryReadinessValidation = validateContentFactoryReadiness(contentFactoryReadiness);
  const proofSourceVolumeScanValidation = validateProofSourceVolumeScan(proofSourceVolumeScan);
  const proofSourceRecoveryPlanValidation = validateProofSourceRecoveryPlan(proofSourceRecoveryPlan);
  const proofIntakeAntiFakeValidation = validateProofIntakeAntiFakeControls(proofIntakeReadiness);
  const weeklyProofPacketAntiFakeValidation = validateWeeklyProofPacketAntiFakeControls(weeklyProofPacket);
  const releaseGates: DiscordReleaseGate[] = [
    {
      name: 'scorecard_schema',
      passed: scorecardValidation.ok,
      evidence: `${scorecardValidation.categoryCount} categories / avg ${scorecardValidation.averageScore}`,
    },
    {
      name: 'evidence_index',
      passed: evidenceValidation.ok,
      evidence: `${evidenceValidation.evidenceIndex.filter((item) => item.ok).length}/${REQUIRED_PHASE_EVIDENCE.length} required evidence files pass`,
    },
    {
      name: 'readiness_validations',
      passed: readinessValidation.ok,
      evidence: readinessValidation.evidence,
    },
    {
      name: 'operating_rhythm',
      passed: rhythmValidation.ok && runbook.includes('Weekly Operating Loop') && runbook.includes('Quarterly Review'),
      evidence: `${rhythm.weekly.length} weekly / ${rhythm.monthly.length} monthly / ${rhythm.quarterly.length} quarterly items`,
    },
    {
      name: 'rag_eval_latest',
      passed: ragEval?.ok === true
        && ragEval?.dryRun === false
        && Number(ragEval?.seededQuestionCount ?? 0) >= RAG_EVAL_QUESTION_SEEDS.length
        && Number(ragEval?.summary?.passRate ?? 0) >= 0.95
        && Number(ragEval?.summary?.avgScore ?? 0) >= 0.9
        && Number(ragEval?.summary?.contextPrecision ?? 0) >= 0.7
        && Number(ragEval?.summary?.answerUsefulness ?? 0) >= 0.85
        && Number(ragEval?.evaluatedQuestionCount ?? 0) >= RAG_EVAL_QUESTION_SEEDS.length,
      evidence: `${ragEval?.summary?.passed ?? 0}/${ragEval?.summary?.total ?? 0} passed, seeded ${ragEval?.seededQuestionCount ?? 0}/${RAG_EVAL_QUESTION_SEEDS.length}, dryRun=${ragEval?.dryRun === true}, avg ${ragEval?.summary?.avgScore ?? 'n/a'}, context precision ${ragEval?.summary?.contextPrecision ?? 'n/a'}, usefulness ${ragEval?.summary?.answerUsefulness ?? 'n/a'}`,
    },
    {
      name: 'rag_eval_coverage_readiness',
      passed: ragEvalCoverageReadinessValidation.ok && ragEvalCoverageReadiness?.releaseReady === true,
      evidence: ragEvalCoverageReadinessValidation.evidence,
    },
    {
      name: 'database_release_tables',
      passed: databaseValidation.ok,
      evidence: Object.entries(databaseValidation.checks).filter(([, ok]) => ok).map(([table]) => table).join(', '),
    },
    {
      name: 'proof_rehearsal_readiness',
      passed: proofRehearsalValidation.ok,
      evidence: proofRehearsalValidation.evidence,
    },
    {
      name: 'content_factory_readiness',
      passed: contentFactoryReadinessValidation.ok,
      evidence: contentFactoryReadinessValidation.evidence,
    },
    {
      name: 'proof_source_volume_scan',
      passed: proofSourceVolumeScanValidation.ok,
      evidence: proofSourceVolumeScanValidation.evidence,
    },
    {
      name: 'proof_source_recovery_plan',
      passed: proofSourceRecoveryPlanValidation.ok,
      evidence: proofSourceRecoveryPlanValidation.evidence,
    },
    {
      name: 'proof_intake_anti_fake_controls',
      passed: proofIntakeAntiFakeValidation.ok,
      evidence: proofIntakeAntiFakeValidation.evidence,
    },
    {
      name: 'weekly_proof_packet_anti_fake_controls',
      passed: weeklyProofPacketAntiFakeValidation.ok,
      evidence: weeklyProofPacketAntiFakeValidation.evidence,
    },
    {
      name: 'migration_present',
      passed: migration.includes('create table if not exists public.discord_final_scorecard_runs'),
      evidence: '0094_discord_final_scorecard_release.sql',
    },
    {
      name: 'below_95_scores_have_blockers',
      passed: scorecardValidation.blockedBelow95.every((category) => scorecard.some((item) => item.category === category && item.blocker)),
      evidence: scorecardValidation.blockedBelow95.join(', ') || 'none',
    },
  ];
  const failures = [
    ...scorecardValidation.failures.map((failure) => `scorecard:${failure}`),
    ...rhythmValidation.failures.map((failure) => `rhythm:${failure}`),
    ...ragEvalCoverageReadinessValidation.failures.map((failure) => `rag_eval_coverage:${failure}`),
    ...proofRehearsalValidation.failures.map((failure) => `proof_rehearsal:${failure}`),
    ...contentFactoryReadinessValidation.failures.map((failure) => `content_factory_readiness:${failure}`),
    ...proofSourceVolumeScanValidation.failures.map((failure) => `proof_source_volume_scan:${failure}`),
    ...proofSourceRecoveryPlanValidation.failures.map((failure) => `proof_source_recovery_plan:${failure}`),
    ...proofIntakeAntiFakeValidation.failures.map((failure) => `proof_intake:${failure}`),
    ...weeklyProofPacketAntiFakeValidation.failures.map((failure) => `weekly_proof_packet:${failure}`),
    ...readinessValidation.failures.map((failure) => `readiness_validation:${failure}`),
    ...evidenceValidation.missing.map((failure) => `missing_evidence:${failure}`),
    ...evidenceValidation.failing.map((failure) => `failing_evidence:${failure}`),
    ...releaseGates.filter((gate) => !gate.passed).map((gate) => `release_gate:${gate.name}`),
  ];
  const status = failures.length ? 'failed' : 'passed';
  let auditRowId: string | null = null;
  if (!dryRun) {
    const { data: row, error } = await (sb as any).from('discord_final_scorecard_runs').insert({
      run_key: runKey,
      status,
      scorecard_version: DISCORD_FINAL_SCORECARD_VERSION,
      average_score: scorecardValidation.averageScore,
      category_count: scorecardValidation.categoryCount,
      blocked_below_95: scorecardValidation.blockedBelow95,
      release_gates: releaseGates,
      scorecard,
      operating_rhythm: rhythm,
      failures,
    }).select('id').single();
    if (error) throw error;
    auditRowId = row.id;
  }
  const evidence = {
    ok: failures.length === 0,
    version: DISCORD_FINAL_SCORECARD_VERSION,
    runKey,
    dryRun,
    auditRowId,
    averageScore: summary.averageScore,
    categoryCount: summary.categoryCount,
    blockedBelow95: summary.blockedBelow95,
    worldClassEligible: summary.worldClassEligible,
    worldClassThreshold: summary.worldClassThreshold,
    requiredOperatingProof: summary.requiredOperatingProof,
    scorecard,
    summary,
    scorecardValidation,
    operatingRhythm: rhythm,
    rhythmValidation,
    evidenceValidation,
    readinessValidation,
    databaseValidation,
    ragEvalCoverageReadinessValidation,
    proofRehearsalValidation,
    contentFactoryReadinessValidation,
    proofSourceVolumeScanValidation,
    proofSourceRecoveryPlanValidation,
    proofIntakeAntiFakeValidation,
    weeklyProofPacketAntiFakeValidation,
    releaseGates,
    ragEvalLatest: {
      ok: ragEval?.ok,
      seededQuestionCount: ragEval?.seededQuestionCount,
      evaluatedQuestionCount: ragEval?.evaluatedQuestionCount,
      requiredQuestionCount: RAG_EVAL_QUESTION_SEEDS.length,
      summary: ragEval?.summary,
    },
    ragEvalCoverageReadiness: {
      releaseReady: ragEvalCoverageReadiness?.releaseReady,
      expectedQuestionCount: ragEvalCoverageReadiness?.expectedQuestionCount,
      seededQuestionCount: ragEvalCoverageReadiness?.seededQuestionCount,
      evaluatedQuestionCount: ragEvalCoverageReadiness?.evaluatedQuestionCount,
      missingEvalKeys: ragEvalCoverageReadiness?.missingEvalKeys,
      unexpectedEvalKeys: ragEvalCoverageReadiness?.unexpectedEvalKeys,
      blockers: ragEvalCoverageReadiness?.blockers,
      nextActions: ragEvalCoverageReadiness?.nextActions,
    },
    failures,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-20-final-scorecard.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok && !dryRun) process.exitCode = 1;
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-20-final-scorecard.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
