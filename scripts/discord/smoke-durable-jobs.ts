import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  buildDiscordJobRunKey,
  calculateDiscordJobBackoffSeconds,
  DISCORD_DURABLE_JOB_REGISTRY,
  failDiscordDurableJobRun,
  retryDiscordDurableDeadLetter,
  startDiscordDurableJobRun,
  syncDiscordDurableJobRegistry,
} from '@/lib/discord/durable-jobs';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runId = `smoke-${Date.now()}`;
  const retryableScope = `${runId}-retryable`;
  const deadScope = `${runId}-dead`;
  const retryableRunKey = buildDiscordJobRunKey({ jobKey: 'member_intelligence_rebuild', idempotencyKey: retryableScope });
  const deadRunKey = buildDiscordJobRunKey({ jobKey: 'rag_eval', idempotencyKey: deadScope });
  const startedAt = new Date().toISOString();

  try {
    const registry = await syncDiscordDurableJobRegistry();
    const startedRetryable = await startDiscordDurableJobRun({
      jobKey: 'member_intelligence_rebuild',
      idempotencyKey: retryableScope,
      metadata: { smoke: true },
    });
    const duplicate = await startDiscordDurableJobRun({
      jobKey: 'member_intelligence_rebuild',
      idempotencyKey: retryableScope,
      metadata: { smoke: true, duplicate: true },
    });
    const retryableFailure = await failDiscordDurableJobRun({
      runKey: startedRetryable.runKey,
      errorCode: 'smoke_retryable',
      errorMessage: 'Synthetic retryable failure for durable job smoke.',
      retryable: true,
      payload: { smoke: true, kind: 'retryable' },
      metadata: { smoke: true },
      now: new Date('2026-06-24T12:00:00.000Z'),
    });

    const startedDead = await startDiscordDurableJobRun({
      jobKey: 'rag_eval',
      idempotencyKey: deadScope,
      metadata: { smoke: true },
      now: new Date('2026-06-24T12:10:00.000Z'),
    });
    const deadFailure = await failDiscordDurableJobRun({
      runKey: startedDead.runKey,
      errorCode: 'smoke_dead_letter',
      errorMessage: 'Synthetic terminal failure for durable job smoke.',
      retryable: false,
      payload: { smoke: true, kind: 'dead_letter' },
      metadata: { smoke: true },
      now: new Date('2026-06-24T12:11:00.000Z'),
    });

    const { data: deadLetter } = await sb
      .from('discord_job_dead_letters')
      .select('id, run_key, job_key, retryable, reason, resolved_at')
      .eq('run_key', deadRunKey)
      .maybeSingle();
    if (!deadLetter?.id) throw new Error('Dead letter was not created.');
    await sb.from('discord_job_dead_letters').update({ retryable: true }).eq('id', deadLetter.id);
    const retry = await retryDiscordDurableDeadLetter({
      deadLetterId: String(deadLetter.id),
      reviewer: 'durable-job-smoke',
      now: new Date('2026-06-24T12:12:00.000Z'),
    });

    const [runsRes, retryRunRes, resolvedDeadLetterRes] = await Promise.all([
      sb
        .from('discord_job_runs')
        .select('run_key, job_key, status, next_retry_at, error_code, error_message')
        .in('run_key', [retryableRunKey, deadRunKey]),
      sb.from('discord_job_runs').select('run_key, status, metadata').eq('run_key', retry.retryRunKey).maybeSingle(),
      sb.from('discord_job_dead_letters').select('id, resolved_at, retry_run_key').eq('id', deadLetter.id).maybeSingle(),
    ]);
    for (const result of [runsRes, retryRunRes, resolvedDeadLetterRes]) {
      if (result.error) throw result.error;
    }
    const retryableRun = (runsRes.data ?? []).find((run) => run.run_key === retryableRunKey);
    const deadRun = (runsRes.data ?? []).find((run) => run.run_key === deadRunKey);
    const checks = {
      registry_complete: registry.synced === DISCORD_DURABLE_JOB_REGISTRY.length && registry.synced >= 12,
      idempotency_duplicate_detected: duplicate.duplicate === true,
      retryable_failed_not_dead_lettered: retryableFailure.status === 'failed' && Boolean(retryableFailure.nextRetryAt),
      dead_letter_created: deadFailure.status === 'dead_lettered' && Boolean(deadFailure.deadLetterId),
      retry_queued: retryRunRes.data?.status === 'queued',
      dead_letter_resolved: Boolean(resolvedDeadLetterRes.data?.resolved_at) && resolvedDeadLetterRes.data?.retry_run_key === retry.retryRunKey,
      backoff_bounded: calculateDiscordJobBackoffSeconds(1) === 60 && calculateDiscordJobBackoffSeconds(20) === 3600,
    };
    const evidence = {
      ok: Object.values(checks).every(Boolean),
      checks,
      registry,
      startedRetryable,
      duplicate,
      retryableFailure,
      deadFailure,
      retry,
      runs: runsRes.data ?? [],
      retryRun: retryRunRes.data,
      resolvedDeadLetter: resolvedDeadLetterRes.data,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'phase-14-durable-jobs-proof.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    await sb.from('discord_job_dead_letters').delete().in('run_key', [retryableRunKey, deadRunKey]);
    await sb.from('discord_job_runs').delete().like('run_key', `%${runId}%`);
  }
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-14-durable-jobs-proof.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
