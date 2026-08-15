import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const outputPath = path.join(evidenceDir, 'knowledge-base-e2e-latest.json');
const allowMutation = process.env.SAGE_ALLOW_KNOWLEDGE_BASE_E2E === 'approved';

const specs = [
  'tests/e2e/admin/discord-knowledge-candidates.spec.ts',
  'tests/e2e/admin/discord-rag-corpus.spec.ts',
  'tests/e2e/admin/discord-rag-health.spec.ts',
];

function runCommand(command, args) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
  });
  return {
    command: [command, ...args].join(' '),
    startedAt,
    finishedAt: new Date().toISOString(),
    exitCode: result.status,
    signal: result.signal,
    stdoutTail: result.stdout.slice(-8000),
    stderrTail: result.stderr.slice(-8000),
    ok: result.status === 0,
  };
}

async function writeEvidence(evidence) {
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
}

async function main() {
  const baseEvidence = {
    version: 'knowledge-base-e2e-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: allowMutation ? 'temporary_supabase_e2e_rows_with_cleanup' : 'blocked_without_explicit_approval',
    releaseMeaning: allowMutation
      ? 'This E2E runner executes targeted Playwright admin Discord knowledge-base specs that create temporary Supabase rows, click admin workflows, verify RAG promotion/sync/task creation, and clean up test rows. It does not mutate live Discord, Stripe, deployments, or Git remotes.'
      : 'This E2E runner is guarded. It does not run Playwright or mutate Supabase unless SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved is set for this command.',
    requiredApprovalEnv: 'SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved',
    specs,
  };

  if (!allowMutation) {
    const evidence = {
      ok: false,
      ...baseEvidence,
      status: 'approval_required',
      failures: ['missing_explicit_knowledge_base_e2e_approval'],
      nextActions: [
        'If you want live Supabase E2E proof, run SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved npm run discord:knowledge-base-e2e.',
        'Confirm the target Supabase environment is acceptable for temporary E2E rows before running.',
      ],
    };
    await writeEvidence(evidence);
    console.error(JSON.stringify({ ...evidence, evidencePath: path.relative(root, outputPath) }, null, 2));
    process.exit(1);
  }

  const command = runCommand('npx', [
    'playwright',
    'test',
    '--config=playwright.e2e.config.ts',
    '--project=chromium',
    ...specs,
  ]);
  const evidence = {
    ok: command.ok,
    ...baseEvidence,
    status: command.ok ? 'passed' : 'failed',
    command,
    cleanupContract: [
      'Each spec uses a unique run id.',
      'Each spec deletes temporary content queue, message, RAG source/document/eval/task/event rows in finally blocks.',
      'The runner does not post to Discord or publish public assets.',
    ],
    failures: command.ok ? [] : [`playwright_failed:${command.exitCode ?? command.signal ?? 'unknown'}`],
  };
  await writeEvidence(evidence);
  console.log(JSON.stringify({ ...evidence, evidencePath: path.relative(root, outputPath) }, null, 2));
  if (!command.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    version: 'knowledge-base-e2e-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only_after_exception',
    status: 'runner_exception',
    error: error instanceof Error ? error.message : String(error),
  };
  await writeEvidence(evidence);
  console.error(JSON.stringify({ ...evidence, evidencePath: path.relative(root, outputPath) }, null, 2));
  process.exit(1);
});
