import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outputPath = path.join(root, 'docs', 'evidence', 'engineering-loop', 'durable-jobs-readiness-latest.json');

const paths = {
  durableJobs: 'lib/discord/durable-jobs.ts',
  durableSmoke: 'scripts/discord/smoke-durable-jobs.ts',
  durableProof: 'docs/evidence/discord-ai-os/phase-14-durable-jobs-proof.json',
  scaleFailureProof: 'docs/evidence/discord-ai-os/phase-19-scale-failure-readiness.json',
  migration: 'supabase/migrations/0088_discord_durable_jobs.sql',
  adminActions: 'app/admin/discord/actions.ts',
  adminPage: 'app/admin/discord/page.tsx',
  packageJson: 'package.json',
};

const requiredJobKeys = [
  'daily_draft',
  'daily_publish',
  'news_ingestion',
  'quiz_generation',
  'challenge_generation',
  'weekly_leaderboard',
  'weekly_recap',
  'member_intelligence_rebuild',
  'rag_sync',
  'rag_chunk_embed',
  'rag_eval',
  'content_queue_enrichment',
];

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesAll(text, patterns) {
  return patterns.every((pattern) => text.includes(pattern));
}

async function main() {
  const [
    durableJobs,
    durableSmoke,
    durableProofRaw,
    scaleFailureProofRaw,
    migration,
    adminActions,
    adminPage,
    packageRaw,
  ] = await Promise.all([
    read(paths.durableJobs),
    read(paths.durableSmoke),
    read(paths.durableProof),
    read(paths.scaleFailureProof),
    read(paths.migration),
    read(paths.adminActions),
    read(paths.adminPage),
    read(paths.packageJson),
  ]);
  const durableProof = JSON.parse(durableProofRaw);
  const scaleFailureProof = JSON.parse(scaleFailureProofRaw);
  const packageJson = JSON.parse(packageRaw);
  const proofChecks = durableProof.checks ?? {};

  const checks = [
    {
      name: 'durable_registry_covers_core_discord_jobs',
      passed: includesAll(durableJobs, [
        'DISCORD_DURABLE_JOB_REGISTRY',
        ...requiredJobKeys.map((jobKey) => `jobKey: '${jobKey}'`),
      ]),
      evidence: paths.durableJobs,
    },
    {
      name: 'idempotency_retry_backoff_and_dead_letter_paths_wired',
      passed: includesAll(durableJobs, [
        'buildDiscordJobRunKey',
        'normalizeDiscordJobKey',
        'calculateDiscordJobBackoffSeconds',
        'startDiscordDurableJobRun',
        'completeDiscordDurableJobRun',
        'failDiscordDurableJobRun',
        'retryDiscordDurableDeadLetter',
        'discord_job_runs',
        'discord_job_dead_letters',
        'duplicate: true',
        "canRetry ? 'failed' : 'dead_lettered'",
      ]),
      evidence: paths.durableJobs,
    },
    {
      name: 'durable_smoke_proves_duplicate_retry_dead_letter_and_cleanup',
      passed: durableProof.ok === true
        && proofChecks.registry_complete === true
        && proofChecks.idempotency_duplicate_detected === true
        && proofChecks.retryable_failed_not_dead_lettered === true
        && proofChecks.dead_letter_created === true
        && proofChecks.retry_queued === true
        && proofChecks.dead_letter_resolved === true
        && proofChecks.backoff_bounded === true
        && durableSmoke.includes("sb.from('discord_job_dead_letters').delete()")
        && durableSmoke.includes("sb.from('discord_job_runs').delete()"),
      evidence: `${paths.durableSmoke}, ${paths.durableProof}`,
    },
    {
      name: 'database_schema_indexes_and_rls_wired',
      passed: includesAll(migration, [
        'create table if not exists public.discord_job_registry',
        'create table if not exists public.discord_job_runs',
        'create table if not exists public.discord_job_dead_letters',
        'discord_job_runs_idempotency_idx',
        'discord_job_runs_status_idx',
        'discord_job_dead_letters_open_idx',
        'alter table public.discord_job_registry enable row level security',
        'alter table public.discord_job_runs enable row level security',
        'alter table public.discord_job_dead_letters enable row level security',
      ]),
      evidence: paths.migration,
    },
    {
      name: 'admin_job_dashboard_and_dead_letter_actions_wired',
      passed: includesAll(adminActions, [
        'retryDiscordJobDeadLetterAction',
        'resolveDiscordJobDeadLetterAction',
        'retryDiscordDurableDeadLetter',
        'requireAdmin',
      ]) && includesAll(adminPage, [
        'data-testid="discord-durable-jobs"',
        'Durable job control',
        'Job dead letters',
        'discord_job_registry',
        'discord_job_runs',
        'discord_job_dead_letters',
        'retryDiscordJobDeadLetterAction',
        'resolveDiscordJobDeadLetterAction',
      ]),
      evidence: `${paths.adminActions}, ${paths.adminPage}`,
    },
    {
      name: 'scale_failure_readiness_covers_job_failure_modes',
      passed: scaleFailureProof.ok === true
        && JSON.stringify(scaleFailureProof).includes('duplicate_job')
        && JSON.stringify(scaleFailureProof).includes('failed_publish')
        && JSON.stringify(scaleFailureProof).includes('dead_letter_replay')
        && JSON.stringify(scaleFailureProof).includes('Discord 429 retry_after')
        && JSON.stringify(scaleFailureProof).includes('idempotent_job_runs')
        && JSON.stringify(scaleFailureProof).includes('retry_backoff_and_dead_letters'),
      evidence: paths.scaleFailureProof,
    },
    {
      name: 'local_smoke_command_available',
      passed: packageJson.scripts?.['discord:smoke-durable-jobs'] === 'tsx --env-file=.env.local scripts/discord/smoke-durable-jobs.ts'
        && packageJson.scripts?.['discord:durable-jobs-readiness'] === 'node scripts/discord/write-durable-jobs-readiness.mjs',
      evidence: paths.packageJson,
    },
  ];

  const failures = checks.filter((check) => check.passed !== true).map((check) => check.name);
  const evidence = {
    ok: failures.length === 0,
    version: 'durable-jobs-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    sourceEvidence: paths,
    checks,
    proofSummary: {
      requiredJobCount: requiredJobKeys.length,
      smokeProofOk: durableProof.ok === true,
      registrySynced: Number(durableProof.registry?.synced ?? 0),
      duplicateDetected: proofChecks.idempotency_duplicate_detected === true,
      deadLetterCreated: proofChecks.dead_letter_created === true,
      deadLetterRetryQueued: proofChecks.retry_queued === true,
      deadLetterResolved: proofChecks.dead_letter_resolved === true,
      adminSurface: checks.find((check) => check.name === 'admin_job_dashboard_and_dead_letter_actions_wired')?.passed === true,
    },
    antiFakeRules: [
      'Do not count smoke-created and cleaned-up job rows as live production job health.',
      'Do not count registered jobs as reliable unless idempotency, retry, and dead-letter paths are proven.',
      'Do not treat an empty dead-letter table as proof unless jobs are actively running and observable.',
      'Do not publish from scheduled jobs unless the draft is approved and the job run is idempotent.',
    ],
    nextOperatingProofRequired: [
      'Run scheduled daily and weekly jobs in production long enough to observe real run rows.',
      'Review open dead letters every operating day and resolve or retry them from the admin dashboard.',
      'Confirm duplicate scheduled invocations do not create duplicate posts, points, or RAG sync rows.',
      'Track job success rate and dead-letter count in the admin dashboard during each operating cycle.',
    ],
    failures,
    releaseMeaning: 'Durable jobs readiness proves local registry, idempotency, retry, dead-letter, admin, migration, and smoke-proof wiring. It does not mutate Supabase, run jobs, publish Discord posts, or prove production scheduled job health.',
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  if (!evidence.ok) {
    console.error(JSON.stringify(evidence, null, 2));
    process.exit(1);
  }
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
