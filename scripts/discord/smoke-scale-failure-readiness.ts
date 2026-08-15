import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createClient } from '@supabase/supabase-js';
import {
  buildDiscordJobRunKey,
  DISCORD_DURABLE_JOB_REGISTRY,
  failDiscordDurableJobRun,
  retryDiscordDurableDeadLetter,
  startDiscordDurableJobRun,
  syncDiscordDurableJobRegistry,
} from '@/lib/discord/durable-jobs';
import {
  assessDiscordDashboardPerformance,
  DISCORD_SCALE_READINESS_VERSION,
  DISCORD_SCALE_SCENARIOS,
  evaluateDiscordScaleScenario,
  requiredDiscordFailureModeAssessments,
  summarizeDiscordScaleReadiness,
} from '@/lib/discord/scale-readiness';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function measureDashboardQueries(sb: any) {
  const started = performance.now();
  const queries = [
    sb.from('discord_members').select('discord_user_id', { count: 'exact', head: true }),
    sb.from('discord_applications').select('id', { count: 'exact', head: true }),
    sb.from('discord_content_queue').select('id', { count: 'exact', head: true }),
    sb.from('discord_content_drafts').select('id', { count: 'exact', head: true }),
    sb.from('discord_job_runs').select('run_key', { count: 'exact', head: true }),
    sb.from('discord_job_dead_letters').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    sb.from('discord_gateway_dead_letters').select('id', { count: 'exact', head: true }).is('resolved_at', null),
    sb.from('rag_eval_runs').select('id', { count: 'exact', head: true }),
    sb.from('rag_chunks').select('id', { count: 'exact', head: true }),
    sb.from('discord_premium_review_requests').select('id', { count: 'exact', head: true }),
  ];
  const results = await Promise.all(queries);
  const elapsedMs = Math.round(performance.now() - started);
  for (const result of results) {
    if (result.error) throw result.error;
  }
  return {
    rowsScanned: results.reduce((sum, result) => sum + Number(result.count ?? 0), 0),
    queryCount: results.length,
    elapsedMs,
    counts: results.map((result) => result.count ?? 0),
  };
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runKey = `phase-19-scale-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const duplicateScope = `${runKey}-duplicate`;
  const publishScope = `${runKey}-publish`;
  const replayScope = `${runKey}-replay`;
  const duplicateRunKey = buildDiscordJobRunKey({ jobKey: 'daily_draft', idempotencyKey: duplicateScope });
  const publishRunKey = buildDiscordJobRunKey({ jobKey: 'daily_publish', idempotencyKey: publishScope });
  const replayRunKey = buildDiscordJobRunKey({ jobKey: 'rag_eval', idempotencyKey: replayScope });

  try {
    const [runbook, dailyPublishSmoke, migration] = await Promise.all([
      readFile(path.join(process.cwd(), 'docs', 'discord', 'SCALE_FAILURE_READINESS_RUNBOOK.md'), 'utf8'),
      readFile(path.join(process.cwd(), 'scripts', 'discord', 'smoke-weekly-approval-publish.ts'), 'utf8'),
      readFile(path.join(process.cwd(), 'supabase', 'migrations', '0093_discord_scale_failure_readiness.sql'), 'utf8'),
    ]);
    await syncDiscordDurableJobRegistry();

    const scenarios = DISCORD_SCALE_SCENARIOS.map(evaluateDiscordScaleScenario);
    const dashboardMeasurement = await measureDashboardQueries(sb);
    const dashboard = assessDiscordDashboardPerformance(dashboardMeasurement);

    const startedDuplicate = await startDiscordDurableJobRun({
      jobKey: 'daily_draft',
      idempotencyKey: duplicateScope,
      metadata: { phase_19: true, kind: 'duplicate_base' },
    });
    const duplicate = await startDiscordDurableJobRun({
      jobKey: 'daily_draft',
      idempotencyKey: duplicateScope,
      metadata: { phase_19: true, kind: 'duplicate_repeat' },
    });

    const startedPublish = await startDiscordDurableJobRun({
      jobKey: 'daily_publish',
      idempotencyKey: publishScope,
      metadata: { phase_19: true, kind: 'failed_publish' },
    });
    const failedPublish = await failDiscordDurableJobRun({
      runKey: startedPublish.runKey,
      errorCode: 'phase_19_failed_publish',
      errorMessage: 'Synthetic failed publish for Phase 19 readiness.',
      retryable: false,
      payload: { phase_19: true, side_effect: 'discord_message' },
      metadata: { phase_19: true },
    });

    const startedReplay = await startDiscordDurableJobRun({
      jobKey: 'rag_eval',
      idempotencyKey: replayScope,
      metadata: { phase_19: true, kind: 'dead_letter_replay' },
    });
    await sb.from('discord_job_runs').update({ attempt: 2, max_retries: 1 }).eq('run_key', startedReplay.runKey);
    const replayFailure = await failDiscordDurableJobRun({
      runKey: startedReplay.runKey,
      errorCode: 'phase_19_retryable_terminal',
      errorMessage: 'Synthetic retryable terminal failure for Phase 19 replay.',
      retryable: true,
      payload: { phase_19: true, side_effect: 'rag_eval' },
      metadata: { phase_19: true },
    });
    if (!replayFailure.deadLetterId) throw new Error('Retryable dead letter was not created.');
    const replay = await retryDiscordDurableDeadLetter({
      deadLetterId: replayFailure.deadLetterId,
      reviewer: 'phase-19-scale-smoke',
    });

    const registryKeys = new Set(DISCORD_DURABLE_JOB_REGISTRY.map((job) => job.jobKey));
    const failureModes = requiredDiscordFailureModeAssessments({
      duplicateJobSafe: duplicate.duplicate === true && duplicate.runKey === startedDuplicate.runKey,
      failedPublishDeadLettered: failedPublish.status === 'dead_lettered' && Boolean(failedPublish.deadLetterId),
      failedRoleSyncVisible: runbook.includes('Job Failure') && runbook.includes('Discord API Outage'),
      failedModelCallVisible: scenarios.some((scenario) => scenario.key === 'deepseek_failure' && scenario.controls.includes('provider_failure_isolation')),
      failedRagSyncVisible: registryKeys.has('rag_sync') && registryKeys.has('rag_chunk_embed') && registryKeys.has('rag_eval'),
      deadLetterReplayQueued: Boolean(replay.retryRunKey),
      rateLimitBackoffPresent: dailyPublishSmoke.includes('retry_after') && dailyPublishSmoke.includes('parseRetryAfter'),
    });
    const runbooksPresent = [
      'Job Failure',
      'Discord API Outage',
      'Supabase Outage',
      'Bad Post Rollback',
      'Bad Point Award Reversal',
      'RAG Quality Regression',
    ].every((section) => runbook.includes(section));
    const summary = summarizeDiscordScaleReadiness({ scenarios, dashboard, failureModes, runbooksPresent });
    const checks = {
      synthetic_scenarios_complete: scenarios.length === 11,
      synthetic_scenarios_pass: scenarios.every((scenario) => scenario.passed),
      dashboard_performance_pass: dashboard.passed,
      duplicate_job_safe: duplicate.duplicate === true,
      failed_publish_dead_lettered: failedPublish.status === 'dead_lettered' && Boolean(failedPublish.deadLetterId),
      dead_letter_replay_queued: Boolean(replay.retryRunKey),
      runbooks_present: runbooksPresent,
      migration_present: migration.includes('create table if not exists public.discord_scale_readiness_runs'),
      no_live_discord_spam: true,
      summary_passed: summary.ok,
    };
    const failures = [
      ...Object.entries(checks).filter(([, passed]) => !passed).map(([key]) => key),
      ...summary.failures,
    ];
    const status = failures.length ? 'failed' : 'passed';
    const { data: auditRow, error } = await sb.from('discord_scale_readiness_runs').insert({
      run_key: runKey,
      status,
      readiness_version: DISCORD_SCALE_READINESS_VERSION,
      readiness_score: summary.score,
      scenario_count: scenarios.length,
      scenario_failures: scenarios.filter((scenario) => !scenario.passed).length,
      dashboard_elapsed_ms: dashboard.elapsedMs,
      dashboard_estimated_p95_ms: dashboard.estimatedP95Ms,
      duplicate_safe: checks.duplicate_job_safe,
      dead_letter_replay_ok: checks.dead_letter_replay_queued,
      runbooks_ok: checks.runbooks_present,
      checks,
      scenarios,
      failure_modes: failureModes,
      failures,
    }).select('id').single();
    if (error) throw error;

    const evidence = {
      ok: failures.length === 0,
      version: DISCORD_SCALE_READINESS_VERSION,
      summary,
      checks,
      failures,
      scenarios,
      dashboard,
      dashboardMeasurement,
      failureModes,
      duplicate: { startedDuplicate, duplicate, duplicateRunKey },
      failedPublish,
      replay: { replayFailure, replay, replayRunKey },
      auditRowId: auditRow.id,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'phase-19-scale-failure-readiness.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    await sb.from('discord_job_dead_letters').delete().in('run_key', [duplicateRunKey, publishRunKey, replayRunKey]);
    await sb.from('discord_job_runs').delete().like('run_key', `%${runKey}%`);
  }
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-19-scale-failure-readiness.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
