export type RevenueWorkerJobKind =
  | 'lead_source'
  | 'website_audit'
  | 'enrichment'
  | 'job_source'
  | 'inbox_sync';

export type RevenueWorkerJob = {
  id: string;
  kind: RevenueWorkerJobKind;
  target: string;
  priority: number;
  requestedUnits: number;
  rateLimitPerMinute: number;
  attemptsRemaining: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  nextRunAt: string;
  lockedBy?: string | null;
  leaseExpiresAt?: string | null;
  attemptNumber?: number;
  completedAt?: string | null;
  failedAt?: string | null;
  deadLetteredAt?: string | null;
  lastError?: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
  result?: Record<string, unknown>;
};

export type RevenueWorkerBatch = {
  runKey: string;
  concurrency: number;
  jobs: RevenueWorkerJob[];
  executionLanes: RevenueWorkerJob[][];
  createdAt: string;
};

export type RevenueWorkerAttemptStatus = 'completed' | 'failed';

export type RevenueWorkerAttempt = {
  jobId: string;
  workerId: string | null;
  attemptNumber: number;
  status: RevenueWorkerAttemptStatus;
  startedAt: string | null;
  finishedAt: string;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
  result: Record<string, unknown>;
};

export type RevenueWorkerDeadLetter = {
  jobId: string;
  jobKind: RevenueWorkerJobKind;
  target: string;
  errorCode: string;
  errorMessage: string;
  failedAt: string;
  attemptsUsed: number;
  retryable: boolean;
};

function addSeconds(iso: string, seconds: number) {
  return new Date(new Date(iso).getTime() + seconds * 1000).toISOString();
}

function durationMs(startedAt: string | null | undefined, finishedAt: string) {
  if (!startedAt) return null;
  return Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime());
}

function attemptNumber(job: RevenueWorkerJob) {
  return Math.max(1, job.attemptNumber ?? 1);
}

export function buildConnectorWorkerBatch(input: {
  runKey: string;
  concurrency: number;
  now?: string;
  jobs: Array<{
    kind: RevenueWorkerJobKind;
    target: string;
    priority: number;
    requestedUnits: number;
    rateLimitPerMinute: number;
    retries?: number;
  }>;
}): RevenueWorkerBatch {
  const createdAt = input.now ?? new Date().toISOString();
  const concurrency = Math.max(1, Math.min(10, Math.round(input.concurrency)));
  const jobs = input.jobs
    .map((job, index): RevenueWorkerJob => {
      const spacingSeconds = job.rateLimitPerMinute > 0
        ? Math.ceil((job.requestedUnits / job.rateLimitPerMinute) * 60)
        : 60;
      return {
        id: `${input.runKey}-${job.kind}-${index + 1}`,
        kind: job.kind,
        target: job.target,
        priority: Math.max(0, Math.min(100, Math.round(job.priority))),
        requestedUnits: Math.max(0, Math.round(job.requestedUnits)),
        rateLimitPerMinute: Math.max(1, Math.round(job.rateLimitPerMinute)),
        attemptsRemaining: job.retries ?? 3,
        status: 'queued',
        nextRunAt: index === 0 ? createdAt : addSeconds(createdAt, Math.min(900, spacingSeconds * index)),
      };
    })
    .sort((a, b) => b.priority - a.priority);
  const executionLanes = Array.from({ length: concurrency }, () => [] as RevenueWorkerJob[]);
  jobs.forEach((job, index) => executionLanes[index % concurrency].push(job));

  return { runKey: input.runKey, concurrency, jobs, executionLanes, createdAt };
}

export function claimDueWorkerJobs(input: {
  now?: string;
  workerId: string;
  leaseSeconds: number;
  maxJobs: number;
  jobs: RevenueWorkerJob[];
}): {
  claimed: RevenueWorkerJob[];
  remaining: RevenueWorkerJob[];
} {
  const now = input.now ?? new Date().toISOString();
  const maxJobs = Math.max(1, Math.min(100, Math.round(input.maxJobs)));
  const leaseSeconds = Math.max(15, Math.min(3600, Math.round(input.leaseSeconds)));
  const dueQueued = input.jobs
    .filter((job) => job.status === 'queued' && job.nextRunAt <= now && job.attemptsRemaining > 0)
    .sort((a, b) => b.priority - a.priority || a.nextRunAt.localeCompare(b.nextRunAt))
    .slice(0, maxJobs);
  const dueIds = new Set(dueQueued.map((job) => job.id));
  const claimed = dueQueued.map((job) => ({
    ...job,
    status: 'running' as const,
    lockedBy: input.workerId,
    leaseExpiresAt: addSeconds(now, leaseSeconds),
    attemptNumber: attemptNumber(job),
  }));
  const claimedById = new Map(claimed.map((job) => [job.id, job]));
  const remaining = input.jobs.map((job) => (dueIds.has(job.id) ? claimedById.get(job.id) ?? job : job));

  return { claimed, remaining };
}

export function completeWorkerJob(job: RevenueWorkerJob, input: {
  now?: string;
  result?: Record<string, unknown>;
}): {
  job: RevenueWorkerJob;
  attempt: RevenueWorkerAttempt;
} {
  const finishedAt = input.now ?? new Date().toISOString();
  const result = input.result ?? {};
  const completedJob: RevenueWorkerJob = {
    ...job,
    status: 'completed',
    lockedBy: null,
    leaseExpiresAt: null,
    completedAt: finishedAt,
    lastError: null,
    result,
  };

  return {
    job: completedJob,
    attempt: {
      jobId: job.id,
      workerId: job.lockedBy ?? null,
      attemptNumber: attemptNumber(job),
      status: 'completed',
      startedAt: job.nextRunAt,
      finishedAt,
      durationMs: durationMs(job.nextRunAt, finishedAt),
      errorCode: null,
      errorMessage: null,
      result,
    },
  };
}

export function failWorkerJob(job: RevenueWorkerJob, input: {
  now?: string;
  errorCode: string;
  errorMessage: string;
  retryable: boolean;
  backoffSeconds?: number;
}): {
  job: RevenueWorkerJob;
  attempt: RevenueWorkerAttempt;
  deadLetter: RevenueWorkerDeadLetter | null;
} {
  const failedAt = input.now ?? new Date().toISOString();
  const attemptsRemaining = Math.max(0, job.attemptsRemaining - 1);
  const shouldRetry = input.retryable && attemptsRemaining > 0;
  const lastError = {
    code: input.errorCode,
    message: input.errorMessage,
    retryable: input.retryable,
  };
  const nextJob: RevenueWorkerJob = {
    ...job,
    status: shouldRetry ? 'queued' : 'failed',
    attemptsRemaining,
    lockedBy: null,
    leaseExpiresAt: null,
    failedAt,
    deadLetteredAt: shouldRetry ? null : failedAt,
    lastError,
    nextRunAt: shouldRetry ? addSeconds(failedAt, input.backoffSeconds ?? 300) : job.nextRunAt,
  };
  const deadLetter = shouldRetry
    ? null
    : {
        jobId: job.id,
        jobKind: job.kind,
        target: job.target,
        errorCode: input.errorCode,
        errorMessage: input.errorMessage,
        failedAt,
        attemptsUsed: attemptNumber(job),
        retryable: input.retryable,
      };

  return {
    job: nextJob,
    attempt: {
      jobId: job.id,
      workerId: job.lockedBy ?? null,
      attemptNumber: attemptNumber(job),
      status: 'failed',
      startedAt: job.nextRunAt,
      finishedAt: failedAt,
      durationMs: durationMs(job.nextRunAt, failedAt),
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      result: {},
    },
    deadLetter,
  };
}

export function summarizeWorkerBatch(batch: RevenueWorkerBatch) {
  return {
    totalQueued: batch.jobs.filter((job) => job.status === 'queued').length,
    totalRequestedUnits: batch.jobs.reduce((sum, job) => sum + job.requestedUnits, 0),
    laneCount: batch.executionLanes.length,
    highestPriorityKind: batch.jobs[0]?.kind ?? null,
    retryCapacity: batch.jobs.reduce((sum, job) => sum + job.attemptsRemaining, 0),
  };
}

export function buildWorkerOperationsSummary(jobs: RevenueWorkerJob[]) {
  return {
    queued: jobs.filter((job) => job.status === 'queued').length,
    running: jobs.filter((job) => job.status === 'running').length,
    completed: jobs.filter((job) => job.status === 'completed').length,
    failed: jobs.filter((job) => job.status === 'failed').length,
    deadLettered: jobs.filter((job) => Boolean(job.deadLetteredAt)).length,
    retryCapacity: jobs.reduce((sum, job) => sum + job.attemptsRemaining, 0),
    locked: jobs.filter((job) => Boolean(job.lockedBy)).length,
  };
}
