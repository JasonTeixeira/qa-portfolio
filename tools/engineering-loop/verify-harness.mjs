import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'engineering-loop');
const outputPath = path.join(evidenceDir, 'autonomous-loop-harness-verification-latest.json');

const requiredScripts = {
  'loop:audit': 'node tools/engineering-loop/audit-state.mjs',
  'loop:verify': 'node tools/engineering-loop/verify-harness.mjs && npm run loop:audit && npm run loop:world-class:dry-run',
  'loop:world-class': 'node tools/engineering-loop/run-world-class-loop.mjs',
  'loop:world-class:once': 'node tools/engineering-loop/run-world-class-loop.mjs --once',
  'loop:world-class:dry-run': 'node tools/engineering-loop/run-world-class-loop.mjs --once --dry-run',
};

const forbiddenScriptReferences = [
  'git push',
  'vercel deploy',
  'railway up',
  'stripe ',
  'supabase db push',
  'npm run db:push',
  'npm run discord:operating-cycle',
  'npm run discord:operating-cycle:full',
  'npm run discord:content-factory',
  'npm run discord:content-factory:week',
  'npm run rag:evaluate',
  'npm run rag:evaluate:missing',
  'npm run rag:evaluate:approved-missing',
  'SAGE_ALLOW_',
];

async function readText(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8');
}

function includesForbidden(value) {
  return forbiddenScriptReferences.filter((item) => value.includes(item));
}

async function main() {
  const packageJson = JSON.parse(await readText('package.json'));
  const scripts = packageJson.scripts ?? {};
  const auditScript = await readText('tools/engineering-loop/audit-state.mjs');
  const runnerScript = await readText('tools/engineering-loop/run-world-class-loop.mjs');
  const verifierScript = await readText('tools/engineering-loop/verify-harness.mjs');

  const failures = [];

  for (const [name, command] of Object.entries(requiredScripts)) {
    if (scripts[name] !== command) {
      failures.push(`missing_or_changed_script:${name}`);
    }
  }

  for (const scriptName of ['loop:audit', 'loop:verify', 'loop:world-class', 'loop:world-class:once', 'loop:world-class:dry-run']) {
    const forbidden = includesForbidden(scripts[scriptName] ?? '');
    if (forbidden.length) {
      failures.push(`loop_script_contains_forbidden_reference:${scriptName}:${forbidden.join(',')}`);
    }
  }

  if (!auditScript.includes('AUTONOMOUS_LOOP_STATE.json')) failures.push('audit_state_missing_state_artifact');
  if (!auditScript.includes('mutationMode:')) failures.push('audit_state_missing_mutation_mode');
  if (!auditScript.includes('explicitApprovalRequiredFor')) failures.push('audit_state_missing_approval_boundaries');
  if (!auditScript.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing')) failures.push('audit_state_missing_guarded_rag_eval_command');
  if (!auditScript.includes('SAGE_ALLOW_DISCORD_OPERATING_CYCLE=approved npm run discord:operating-cycle')) failures.push('audit_state_missing_operating_cycle_approval_command');

  if (!runnerScript.includes('FORBIDDEN_COMMAND_PATTERNS')) failures.push('runner_missing_forbidden_command_patterns');
  if (!runnerScript.includes('external_approval_or_live_proof_required')) failures.push('runner_missing_external_boundary_stop');
  if (!runnerScript.includes('blocked_fingerprint_repeated')) failures.push('runner_missing_repeated_fingerprint_stop');
  if (!runnerScript.includes('discord:release-local')) failures.push('runner_missing_release_local_command');
  if (runnerScript.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing') && !runnerScript.includes('/SAGE_ALLOW_/')) {
    failures.push('runner_embeds_approval_command_without_refusal_pattern');
  }

  if (!verifierScript.includes('forbiddenScriptReferences')) failures.push('verifier_missing_forbidden_script_references');

  const evidence = {
    ok: failures.length === 0,
    version: 'autonomous-loop-harness-verification-v1',
    generatedAt: new Date().toISOString(),
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This verifier reads package scripts and harness source files, then writes local evidence only. It does not run the loop, push, deploy, mutate Discord, mutate Supabase, change Stripe, or run non-dry RAG eval.',
    requiredScripts,
    forbiddenScriptReferences,
    checkedFiles: [
      'package.json',
      'tools/engineering-loop/audit-state.mjs',
      'tools/engineering-loop/run-world-class-loop.mjs',
      'tools/engineering-loop/verify-harness.mjs',
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
