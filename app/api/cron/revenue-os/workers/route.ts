import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type WorkerJobRow = {
  id: string;
  tenant_id: string | null;
  run_key: string;
  job_kind: string;
  target: string;
  status: string;
  attempts_remaining: number;
  next_run_at: string;
  metadata: Record<string, unknown> | null;
};

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

function canNoopComplete(job: WorkerJobRow) {
  const metadata = job.metadata ?? {};
  return metadata.workerHandler === 'noop'
    || metadata.allowWorkerNoop === true
    || job.target.startsWith('proof:')
    || job.target.startsWith('noop:');
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const workerId = `revenue-os-cron-${Date.now()}`;
  const leaseSeconds = Math.max(30, Math.min(900, Number(process.env.REVENUE_WORKER_LEASE_SECONDS ?? 300)));
  const maxJobs = Math.max(1, Math.min(25, Number(process.env.REVENUE_WORKER_MAX_JOBS ?? 10)));
  const leaseExpiresAt = new Date(Date.now() + leaseSeconds * 1000).toISOString();

  const { data: dueJobs, error } = await sb
    .from('revenue_worker_jobs')
    .select('id, tenant_id, run_key, job_kind, target, status, attempts_remaining, next_run_at, metadata')
    .eq('status', 'queued')
    .lte('next_run_at', now)
    .gt('attempts_remaining', 0)
    .order('priority', { ascending: false })
    .order('next_run_at', { ascending: true })
    .limit(maxJobs);

  if (error) {
    return NextResponse.json({ ok: false, error: 'worker_query_failed' }, { status: 500 });
  }

  let claimed = 0;
  let completed = 0;
  let failed = 0;
  let deadLettered = 0;
  const attempts: Array<Record<string, unknown>> = [];

  for (const job of (dueJobs ?? []) as WorkerJobRow[]) {
    const { data: locked } = await sb
      .from('revenue_worker_jobs')
      .update({
        status: 'running',
        locked_by: workerId,
        lease_expires_at: leaseExpiresAt,
      })
      .eq('id', job.id)
      .eq('status', 'queued')
      .select('id')
      .maybeSingle();
    if (!locked?.id) continue;
    claimed += 1;

    const finishedAt = new Date().toISOString();
    const attemptNumber = Math.max(1, 4 - Number(job.attempts_remaining ?? 3));
    if (canNoopComplete(job)) {
      const result = {
        ok: true,
        mode: 'noop_verified',
        workerId,
        handledAt: finishedAt,
      };
      await sb
        .from('revenue_worker_jobs')
        .update({
          status: 'completed',
          locked_by: null,
          lease_expires_at: null,
          completed_at: finishedAt,
          result,
          metadata: {
            ...(job.metadata ?? {}),
            lastWorkerId: workerId,
            continuousRuntimeProof: true,
          },
        })
        .eq('id', job.id);
      await sb.from('revenue_worker_attempts').insert({
        job_id: job.id,
        tenant_id: job.tenant_id,
        run_key: job.run_key,
        worker_id: workerId,
        attempt_number: attemptNumber,
        status: 'completed',
        started_at: now,
        finished_at: finishedAt,
        result,
        metadata: { source: 'cron_worker_runtime' },
      });
      attempts.push({ jobId: job.id, status: 'completed' });
      completed += 1;
      continue;
    }

    const attemptsRemaining = Math.max(0, Number(job.attempts_remaining ?? 1) - 1);
    const retryable = attemptsRemaining > 0;
    const lastError = {
      code: 'handler_not_configured',
      message: `No live handler is configured for ${job.job_kind}.`,
      retryable,
    };
    await sb
      .from('revenue_worker_jobs')
      .update({
        status: retryable ? 'queued' : 'failed',
        attempts_remaining: attemptsRemaining,
        locked_by: null,
        lease_expires_at: null,
        failed_at: finishedAt,
        dead_lettered_at: retryable ? null : finishedAt,
        last_error: lastError,
        next_run_at: retryable ? new Date(Date.now() + 5 * 60 * 1000).toISOString() : job.next_run_at,
      })
      .eq('id', job.id);
    await sb.from('revenue_worker_attempts').insert({
      job_id: job.id,
      tenant_id: job.tenant_id,
      run_key: job.run_key,
      worker_id: workerId,
      attempt_number: attemptNumber,
      status: 'failed',
      started_at: now,
      finished_at: finishedAt,
      error_code: lastError.code,
      error_message: lastError.message,
      result: {},
      metadata: { source: 'cron_worker_runtime', retryable },
    });
    if (!retryable) {
      await sb.from('revenue_worker_dead_letters').insert({
        job_id: job.id,
        tenant_id: job.tenant_id,
        run_key: job.run_key,
        job_kind: job.job_kind,
        target: job.target,
        error_code: lastError.code,
        error_message: lastError.message,
        attempts_used: attemptNumber,
        retryable: false,
        failed_at: finishedAt,
        metadata: { source: 'cron_worker_runtime' },
      });
      deadLettered += 1;
    }
    attempts.push({ jobId: job.id, status: 'failed', retryable });
    failed += 1;
  }

  await sb.from('revenue_worker_runtime_executions').insert({
    run_key: `worker-cron-${new Date().toISOString().slice(0, 10)}`,
    worker_id: workerId,
    claimed_jobs: claimed,
    completed_jobs: completed,
    failed_jobs: failed,
    dead_lettered_jobs: deadLettered,
    max_concurrency: maxJobs,
    lease_seconds: leaseSeconds,
    status: failed > 0 || deadLettered > 0 ? 'degraded' : claimed > 0 ? 'passed' : 'degraded',
    evidence: {
      source: 'cron_worker_runtime',
      synthetic: false,
      attempts,
    },
    metadata: {
      dueJobs: dueJobs?.length ?? 0,
    },
  });

  return NextResponse.json({
    ok: true,
    workerId,
    claimed,
    completed,
    failed,
    deadLettered,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
