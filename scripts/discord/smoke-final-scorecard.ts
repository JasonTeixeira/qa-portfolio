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

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');
const dryRun = process.argv.includes('--dry-run') || process.env.DISCORD_FINAL_SCORECARD_DRY_RUN === 'true';

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

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runKey = `phase-20-final-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const scorecard = buildDiscordFinalScorecard();
  const summary = buildDiscordFinalScorecardSummary(scorecard);
  const rhythm = buildDiscordOperatingRhythm();
  const [scorecardValidation, rhythmValidation, evidenceValidation, databaseValidation, ragEval, proofRehearsal, contentFactoryReadiness, runbook, migration] = await Promise.all([
    Promise.resolve(validateDiscordFinalScorecard(scorecard)),
    Promise.resolve(validateDiscordOperatingRhythm(rhythm)),
    validateEvidenceFiles(),
    validateDatabaseReleaseTables(sb),
    readJsonFile('docs/evidence/rag/eval-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/proof-rehearsal-readiness-latest.json'),
    readJsonFile('docs/evidence/engineering-loop/content-factory-readiness-latest.json'),
    readFile(path.join(process.cwd(), 'docs', 'discord', 'FINAL_OPERATING_RHYTHM_RELEASE_STANDARD.md'), 'utf8'),
    readFile(path.join(process.cwd(), 'supabase', 'migrations', '0094_discord_final_scorecard_release.sql'), 'utf8'),
  ]);
  const proofRehearsalValidation = validateProofRehearsalReadiness(proofRehearsal);
  const contentFactoryReadinessValidation = validateContentFactoryReadiness(contentFactoryReadiness);
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
      name: 'operating_rhythm',
      passed: rhythmValidation.ok && runbook.includes('Weekly Operating Loop') && runbook.includes('Quarterly Review'),
      evidence: `${rhythm.weekly.length} weekly / ${rhythm.monthly.length} monthly / ${rhythm.quarterly.length} quarterly items`,
    },
    {
      name: 'rag_eval_latest',
      passed: ragEval?.ok === true
        && Number(ragEval?.summary?.passRate ?? 0) >= 0.95
        && Number(ragEval?.summary?.avgScore ?? 0) >= 0.9
        && Number(ragEval?.summary?.contextPrecision ?? 0) >= 0.7
        && Number(ragEval?.summary?.answerUsefulness ?? 0) >= 0.85
        && Number(ragEval?.evaluatedQuestionCount ?? 0) >= 50,
      evidence: `${ragEval?.summary?.passed ?? 0}/${ragEval?.summary?.total ?? 0} passed, avg ${ragEval?.summary?.avgScore ?? 'n/a'}, context precision ${ragEval?.summary?.contextPrecision ?? 'n/a'}, usefulness ${ragEval?.summary?.answerUsefulness ?? 'n/a'}`,
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
    ...proofRehearsalValidation.failures.map((failure) => `proof_rehearsal:${failure}`),
    ...contentFactoryReadinessValidation.failures.map((failure) => `content_factory_readiness:${failure}`),
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
    databaseValidation,
    proofRehearsalValidation,
    contentFactoryReadinessValidation,
    releaseGates,
    ragEvalLatest: {
      ok: ragEval?.ok,
      evaluatedQuestionCount: ragEval?.evaluatedQuestionCount,
      summary: ragEval?.summary,
    },
    failures,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-20-final-scorecard.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exitCode = 1;
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
