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
  'discord:career-content-harness': 'tsx scripts/discord/write-career-content-harness.ts',
  'discord:sage-kernel-content-harness': 'tsx scripts/discord/write-sage-kernel-content-harness.ts',
  'discord:knowledge-base-e2e': 'node scripts/discord/run-knowledge-base-e2e.mjs',
  'discord:knowledge-base-e2e-readiness': 'node scripts/discord/write-knowledge-base-e2e-readiness.mjs',
  'discord:knowledge-base-harness': 'tsx scripts/discord/write-knowledge-base-engineering-harness.ts',
  'loop:knowledge-base': 'node tools/engineering-loop/run-knowledge-base-loop.mjs',
  'loop:knowledge-base:once': 'node tools/engineering-loop/run-knowledge-base-loop.mjs --once',
	  'loop:knowledge-base:dry-run': 'node tools/engineering-loop/run-knowledge-base-loop.mjs --once --dry-run',
	  'loop:knowledge-base:full': 'node tools/engineering-loop/run-knowledge-base-loop.mjs --once --quality-gate',
	  'loop:sageforge:human': 'npm run discord:smoke-ask-sage && npm run discord:human-appeal-harness',
	  'discord:human-appeal-harness': 'tsx scripts/discord/write-human-appeal-harness.ts',
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
	  const sageForgeRunnerScript = await readText('tools/engineering-loop/run-sageforge-institutional-loop.mjs');
	  const knowledgeRunnerScript = await readText('tools/engineering-loop/run-knowledge-base-loop.mjs');
	  const humanAppealHarnessScript = await readText('scripts/discord/write-human-appeal-harness.ts');
	  const humanAppealHarnessLib = await readText('lib/discord/human-appeal-harness.ts');
	  const knowledgeBaseE2eRunner = await readText('scripts/discord/run-knowledge-base-e2e.mjs');
  const knowledgeBaseE2eReadiness = await readText('scripts/discord/write-knowledge-base-e2e-readiness.mjs');
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
  if (!auditScript.includes('npm run discord:career-content-harness')) failures.push('audit_state_missing_career_content_harness_command');
  if (!auditScript.includes('npm run discord:sage-kernel-content-harness')) failures.push('audit_state_missing_sage_kernel_content_harness_command');
  if (!auditScript.includes('npm run discord:knowledge-base-e2e-readiness')) failures.push('audit_state_missing_knowledge_base_e2e_readiness_command');
  if (!auditScript.includes('npm run discord:knowledge-base-harness')) failures.push('audit_state_missing_knowledge_base_harness_command');

  if (!runnerScript.includes('FORBIDDEN_COMMAND_PATTERNS')) failures.push('runner_missing_forbidden_command_patterns');
  if (!runnerScript.includes('external_approval_or_live_proof_required')) failures.push('runner_missing_external_boundary_stop');
  if (!runnerScript.includes('blocked_fingerprint_repeated')) failures.push('runner_missing_repeated_fingerprint_stop');
  if (!runnerScript.includes('discord:release-local')) failures.push('runner_missing_release_local_command');
  if (!runnerScript.includes('discord:career-content-harness')) failures.push('runner_missing_career_content_harness_command');
  if (!runnerScript.includes('discord:sage-kernel-content-harness')) failures.push('runner_missing_sage_kernel_content_harness_command');
  if (!runnerScript.includes('discord:knowledge-base-e2e-readiness')) failures.push('runner_missing_knowledge_base_e2e_readiness_command');
	  if (!runnerScript.includes('discord:knowledge-base-harness')) failures.push('runner_missing_knowledge_base_harness_command');
	  if (!sageForgeRunnerScript.includes('discord:human-appeal-harness')) failures.push('sageforge_runner_missing_human_appeal_harness_command');
	  if (!sageForgeRunnerScript.includes('discord:smoke-ask-sage')) failures.push('sageforge_runner_missing_ask_sage_smoke_command');
	  if (runnerScript.includes('SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing') && !runnerScript.includes('/SAGE_ALLOW_/')) {
	    failures.push('runner_embeds_approval_command_without_refusal_pattern');
	  }
	  if (!humanAppealHarnessScript.includes('sagebot-human-appeal-harness-latest.json')) failures.push('human_appeal_script_missing_evidence_json');
	  if (!humanAppealHarnessLib.includes('SAGEBOT_HUMAN_APPEAL_HARNESS_VERSION')) failures.push('human_appeal_lib_missing_version');
	  if (!humanAppealHarnessLib.includes('live_visual_embed_proof_exists')) failures.push('human_appeal_lib_missing_live_visual_proof_gate');
	  if (!humanAppealHarnessLib.includes('smoke_script_blocks_markdown_regression')) failures.push('human_appeal_lib_missing_markdown_regression_gate');

  if (!verifierScript.includes('forbiddenScriptReferences')) failures.push('verifier_missing_forbidden_script_references');
  if (!verifierScript.includes('loop:knowledge-base:full')) failures.push('verifier_missing_knowledge_base_full_loop_script');
  if (!knowledgeRunnerScript.includes('discord:knowledge-base-e2e-readiness')) failures.push('knowledge_runner_missing_e2e_readiness_command');
  if (knowledgeRunnerScript.includes('SAGE_ALLOW_KNOWLEDGE_BASE_E2E=approved')) failures.push('knowledge_runner_embeds_live_e2e_approval_command');
  if (!knowledgeBaseE2eRunner.includes("SAGE_ALLOW_KNOWLEDGE_BASE_E2E === 'approved'")) failures.push('knowledge_base_e2e_runner_missing_env_guard');
  if (!knowledgeBaseE2eRunner.includes('temporary_supabase_e2e_rows_with_cleanup')) failures.push('knowledge_base_e2e_runner_missing_mutation_disclosure');
  if (!knowledgeBaseE2eReadiness.includes('local_file_evidence_only')) failures.push('knowledge_base_e2e_readiness_not_local_only');
  if (!knowledgeBaseE2eReadiness.includes('finally cleanup paths')) failures.push('knowledge_base_e2e_readiness_missing_cleanup_contract');

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
	      'tools/engineering-loop/run-sageforge-institutional-loop.mjs',
	      'tools/engineering-loop/verify-harness.mjs',
	      'scripts/discord/write-human-appeal-harness.ts',
	      'lib/discord/human-appeal-harness.ts',
	      'scripts/discord/write-career-content-harness.ts',
      'lib/discord/career-content-harness.ts',
      'scripts/discord/write-sage-kernel-content-harness.ts',
      'lib/discord/sage-kernel-content-harness.ts',
      'scripts/discord/run-knowledge-base-e2e.mjs',
      'scripts/discord/write-knowledge-base-e2e-readiness.mjs',
      'scripts/discord/write-knowledge-base-engineering-harness.ts',
      'lib/discord/knowledge-base-engineering-harness.ts',
      'tools/engineering-loop/run-knowledge-base-loop.mjs',
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
