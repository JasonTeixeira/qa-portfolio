import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const outputPath = path.join(evidenceDir, 'knowledge-base-e2e-readiness-latest.json');

const runnerPath = 'scripts/discord/run-knowledge-base-e2e.mjs';
const specs = [
  'tests/e2e/admin/discord-knowledge-candidates.spec.ts',
  'tests/e2e/admin/discord-rag-corpus.spec.ts',
  'tests/e2e/admin/discord-rag-health.spec.ts',
];

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function checkSpec(relativePath, source) {
  const failures = [];
  if (!source.includes("import { createClient } from '@supabase/supabase-js'")) {
    failures.push('missing_supabase_admin_client_import');
  }
  if (!source.includes("from '../../fixtures/auth'")) {
    failures.push('missing_admin_auth_fixture');
  }
  if (!source.includes('try {') || !source.includes('finally {')) {
    failures.push('missing_try_finally_cleanup_contract');
  }
  if (!source.includes('Date.now()') || !source.includes('e2e-')) {
    failures.push('missing_unique_e2e_run_id');
  }
  if (!source.includes("await adminPage.goto('/admin/discord")) {
    failures.push('missing_admin_discord_route_visit');
  }
  if (!source.includes('expect.poll')) {
    failures.push('missing_database_effect_poll');
  }
  if (!source.includes('.delete()')) {
    failures.push('missing_cleanup_delete_calls');
  }
  return {
    path: relativePath,
    ok: failures.length === 0,
    failures,
  };
}

async function main() {
  const runner = await readText(runnerPath);
  const specSources = await Promise.all(specs.map(async (spec) => [spec, await readText(spec)]));
  const failures = [];

  if (!runner.includes("SAGE_ALLOW_KNOWLEDGE_BASE_E2E === 'approved'")) {
    failures.push('runner_missing_explicit_env_guard');
  }
  if (!runner.includes('blocked_without_explicit_approval')) {
    failures.push('runner_missing_blocked_without_approval_mode');
  }
  if (!runner.includes('temporary_supabase_e2e_rows_with_cleanup')) {
    failures.push('runner_missing_mutation_mode_disclosure');
  }
  if (!runner.includes('--config=playwright.e2e.config.ts')) {
    failures.push('runner_missing_e2e_config');
  }
  if (!runner.includes('--project=chromium')) {
    failures.push('runner_missing_chromium_project');
  }
  if (!runner.includes('It does not mutate live Discord, Stripe, deployments, or Git remotes.')) {
    failures.push('runner_missing_external_mutation_boundary');
  }
  if (!runner.includes('process.exit(1)')) {
    failures.push('runner_missing_failing_exit_on_unapproved_or_failed_run');
  }

  for (const spec of specs) {
    if (!runner.includes(spec)) failures.push(`runner_missing_spec:${spec}`);
  }

  const specChecks = specSources.map(([spec, source]) => checkSpec(spec, source));
  for (const check of specChecks) {
    for (const failure of check.failures) failures.push(`${check.path}:${failure}`);
  }

  const evidence = {
    ok: failures.length === 0,
    version: 'knowledge-base-e2e-readiness-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This readiness check verifies the guarded Playwright E2E runner and target specs without running Playwright, creating Supabase rows, posting to Discord, syncing RAG, deploying, pushing, or publishing.',
    guardedRunner: runnerPath,
    approvalEnvRequiredForLiveE2e: 'SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved',
    liveE2eCommand: 'SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved npm run discord:knowledge-base-e2e',
    specs: specChecks,
    verifiedContracts: [
      'Runner refuses to execute without explicit env approval.',
      'Runner discloses temporary Supabase row mutation and cleanup scope.',
      'Specs use admin auth fixture and unique e2e run ids.',
      'Specs click /admin/discord workflows and poll database effects.',
      'Specs include finally cleanup paths for temporary rows.',
    ],
    failures,
  };

  await mkdir(evidenceDir, { recursive: true });
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
