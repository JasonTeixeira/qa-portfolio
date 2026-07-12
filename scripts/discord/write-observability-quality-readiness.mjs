import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'observability-quality-readiness-latest.json');

const paths = {
  aiObservability: 'lib/ai/observability.ts',
  observabilityQuality: 'lib/discord/observability-quality.ts',
  observabilitySmoke: 'scripts/discord/smoke-observability-quality-v2.ts',
  observabilityProof: 'docs/evidence/discord-ai-os/phase-17-observability-quality-v2.json',
  migration: 'supabase/migrations/0091_discord_observability_quality_rollups.sql',
  adminPage: 'app/(main)/admin/discord/page.tsx',
  packageJson: 'package.json',
};

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

function validateObservabilityQualityReadiness(evidence) {
  const failures = [];
  const checkNames = new Set((evidence.checks ?? []).map((check) => check.name));
  const failedChecks = (evidence.checks ?? []).filter((check) => check.passed !== true).map((check) => check.name);

  if (evidence.version !== 'observability-quality-readiness-v1') failures.push('invalid_version');
  if (evidence.mutationMode !== 'local_file_evidence_only') failures.push('invalid_mutation_mode');
  if (evidence.ok !== (failedChecks.length === 0)) failures.push('ok_does_not_match_check_failures');
  if ((evidence.failures ?? []).join('|') !== failedChecks.join('|')) failures.push('failures_do_not_match_failed_checks');
  for (const checkName of [
    'langfuse_local_fallback_and_redaction_wired',
    'rollup_tracks_trace_cost_quality_and_jobs',
    'admin_surface_exposes_trace_cost_quality_and_job_posture',
    'phase_17_smoke_proves_rollup_persistence_and_cleanup_path',
  ]) {
    if (!checkNames.has(checkName)) failures.push(`missing_check:${checkName}`);
  }
  if (evidence.proofSummary?.smokeProofOk !== true) failures.push('smoke_proof_not_ok');
  if (evidence.proofSummary?.localFallbackAndRedaction !== true) failures.push('fallback_redaction_not_proven');
  if (evidence.proofSummary?.traceCostQualityJobRollup !== true) failures.push('rollup_not_proven');
  if (evidence.proofSummary?.adminSurface !== true) failures.push('admin_surface_not_proven');
  if (evidence.proofSummary?.schemaRls !== true) failures.push('schema_rls_not_proven');
  if (!(evidence.releaseMeaning ?? '').includes('does not mutate Supabase, call Discord, call DeepSeek')) failures.push('release_meaning_overclaims');
  if (!(evidence.antiFakeRules ?? []).some((rule) => rule.includes('live Langfuse trace coverage'))) failures.push('missing_langfuse_anti_fake_rule');
  if (!(evidence.antiFakeRules ?? []).some((rule) => rule.includes('billing truth'))) failures.push('missing_cost_anti_fake_rule');
  if (!(evidence.nextOperatingProofRequired ?? []).some((item) => item.includes('Configure Langfuse env in production'))) failures.push('missing_langfuse_production_next_proof');

  return {
    ok: failures.length === 0,
    validator: 'observability-quality-readiness-validator-v1',
    validatedAt: new Date().toISOString(),
    failures,
  };
}

async function main() {
  const [
    aiObservability,
    observabilityQuality,
    observabilitySmoke,
    observabilityProofRaw,
    migration,
    adminPage,
    packageRaw,
  ] = await Promise.all([
    read(paths.aiObservability),
    read(paths.observabilityQuality),
    read(paths.observabilitySmoke),
    read(paths.observabilityProof),
    read(paths.migration),
    read(paths.adminPage),
    read(paths.packageJson),
  ]);
  const observabilityProof = JSON.parse(observabilityProofRaw);
  const packageJson = JSON.parse(packageRaw);
  const proofChecks = observabilityProof.checks ?? {};

  const checks = [
    {
      name: 'langfuse_local_fallback_and_redaction_wired',
      passed: includesAll(aiObservability, [
        'langfuseConfigured',
        'aiObservabilityMode',
        'redactAiPayload',
        'isSensitiveKey',
        'api[_-]?key|secret|token|password|authorization|cookie|stripe|supabase.*key',
        'createLocalObservation',
        'aiTraceMetadata',
        "ai_observability_provider: observation.enabled ? 'langfuse' : 'local'",
        'langfuse_trace_id',
      ]),
      evidence: paths.aiObservability,
    },
    {
      name: 'rollup_tracks_trace_cost_quality_and_jobs',
      passed: includesAll(observabilityQuality, [
        'DISCORD_OBSERVABILITY_QUALITY_VERSION',
        'DEEPSEEK_PRICING_USD_PER_1M_TOKENS',
        'estimateDeepSeekCostUsd',
        'buildDiscordObservabilityQualityRollup',
        'loadDiscordObservabilityQualityRollup',
        'traceCoverage',
        'providerBreakdown',
        'extractUsage',
        'summarizeRagEvals',
        'avgContentQuality',
        'avgPremiumQuality',
        'premiumSlaOverdue',
        'openDeadLetters',
        'scoreObservabilityHealth',
      ]),
      evidence: paths.observabilityQuality,
    },
    {
      name: 'rollup_reads_expected_live_artifact_tables',
      passed: includesAll(observabilityQuality, [
        "sb.from('rag_answers')",
        "sb.from('rag_retrieval_logs')",
        "sb.from('discord_job_runs')",
        "sb.from('discord_job_dead_letters')",
        "sb.from('rag_eval_runs')",
        "sb.from('rag_eval_results')",
        "sb.from('discord_content_drafts')",
        "sb.from('discord_content_draft_evaluations')",
        "sb.from('discord_premium_review_requests')",
        "sb.from('discord_observability_rollups').upsert",
      ]),
      evidence: paths.observabilityQuality,
    },
    {
      name: 'database_schema_indexes_and_rls_wired',
      passed: includesAll(migration, [
        'create table if not exists public.discord_observability_rollups',
        'trace_coverage numeric',
        'estimated_deepseek_cost_usd numeric',
        'rag_eval_pass_rate numeric',
        'avg_content_quality numeric',
        'avg_premium_quality numeric',
        'job_success_rate numeric',
        'open_dead_letters integer',
        'health_score integer',
        'metrics jsonb',
        'alter table public.discord_observability_rollups enable row level security',
        'discord_observability_rollups_admin_all',
      ]),
      evidence: paths.migration,
    },
    {
      name: 'admin_surface_exposes_trace_cost_quality_and_job_posture',
      passed: includesAll(adminPage, [
        'loadDiscordObservabilityQualityRollup',
        'data-testid="discord-observability-quality"',
        'Observability, cost, and quality',
        'Trace coverage',
        'DeepSeek estimated cost',
        'RAG eval pass rate',
        'Content quality',
        'Premium quality',
        'Job success',
        'Cost is estimated from persisted DeepSeek usage tokens',
      ]),
      evidence: paths.adminPage,
    },
    {
      name: 'phase_17_smoke_proves_rollup_persistence_and_cleanup_path',
      passed: observabilityProof.ok === true
        && proofChecks.deterministic_rollup_healthy === true
        && proofChecks.cost_estimate_priced === true
        && proofChecks.live_rollup_persisted === true
        && proofChecks.live_trace_visible === true
        && proofChecks.live_quality_visible === true
        && proofChecks.admin_surface_present === true
        && proofChecks.migration_present === true
        && observabilitySmoke.includes("sb.from('discord_observability_rollups').delete()")
        && observabilitySmoke.includes("sb.from('rag_answers').delete()")
        && observabilitySmoke.includes("sb.from('discord_job_runs').delete()"),
      evidence: `${paths.observabilitySmoke}, ${paths.observabilityProof}`,
    },
    {
      name: 'smoke_command_is_explicit_and_local_gate_is_read_only',
      passed: packageJson.scripts?.['discord:smoke-observability-quality'] === 'tsx --env-file=.env.local scripts/discord/smoke-observability-quality-v2.ts'
        && packageJson.scripts?.['discord:observability-quality-readiness'] === 'node scripts/discord/write-observability-quality-readiness.mjs'
        && !packageJson.scripts?.['verify:local']?.includes('discord:smoke-observability-quality')
        && !packageJson.scripts?.['discord:observability-quality-readiness']?.includes('tsx --env-file=.env.local'),
      evidence: paths.packageJson,
    },
  ];

  const failures = checks.filter((check) => check.passed !== true).map((check) => check.name);
  const evidence = {
    ok: failures.length === 0,
    version: 'observability-quality-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: paths,
    checks,
    proofSummary: {
      smokeProofOk: observabilityProof.ok === true,
      deterministicRollupHealthy: proofChecks.deterministic_rollup_healthy === true,
      liveRollupPersistedInSmoke: proofChecks.live_rollup_persisted === true,
      localFallbackAndRedaction: checks.find((check) => check.name === 'langfuse_local_fallback_and_redaction_wired')?.passed === true,
      traceCostQualityJobRollup: checks.find((check) => check.name === 'rollup_tracks_trace_cost_quality_and_jobs')?.passed === true,
      adminSurface: checks.find((check) => check.name === 'admin_surface_exposes_trace_cost_quality_and_job_posture')?.passed === true,
      schemaRls: checks.find((check) => check.name === 'database_schema_indexes_and_rls_wired')?.passed === true,
    },
    antiFakeRules: [
      'Do not count this local readiness file as live Langfuse trace coverage.',
      'Do not treat DeepSeek cost estimates from token metadata as billing truth.',
      'Do not count smoke-created and cleaned-up rows as production quality, cost, job, or trace health.',
      'Do not claim 95+ observability until real Discord commands, jobs, RAG answers, content drafts, premium responses, and eval runs all produce current rollups.',
      'Do not treat an empty alert list as healthy if the current window has no live artifacts.',
    ],
    nextOperatingProofRequired: [
      'Run the live Phase 17 smoke after observability, cost, quality, admin, migration, or job schema changes.',
      'Configure Langfuse env in production and verify at least one real /ask-sage trace appears in Langfuse and in persisted metadata.',
      'Verify current-window admin rollups after real scheduled jobs, RAG answers, content drafts, premium responses, and eval runs exist.',
      'Compare estimated DeepSeek token cost against provider billing during weekly operating review.',
      'Review open alerts and dead letters from /admin/discord during every operating cycle.',
    ],
    failures,
    releaseMeaning: 'Observability/quality readiness proves local wiring, schema, admin surface, latest smoke evidence, trace metadata, cost estimates, and anti-fake boundaries. It does not mutate Supabase, call Discord, call DeepSeek, create Langfuse traces, create rollup rows, or prove current production observability health.',
  };
  evidence.validation = validateObservabilityQualityReadiness(evidence);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  if (!evidence.ok || evidence.validation.ok !== true) {
    console.error(JSON.stringify(evidence, null, 2));
    process.exit(1);
  }
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
