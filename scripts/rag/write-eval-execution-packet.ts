import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const evidenceDir = path.join(root, 'docs', 'evidence', 'rag');
const coverageReadinessPath = path.join(evidenceDir, 'eval-coverage-readiness.json');
const missingPlanPath = path.join(evidenceDir, 'eval-missing-plan.json');
const outputPath = path.join(evidenceDir, 'eval-execution-packet.json');

async function readJson(filePath: string): Promise<any> {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

async function main() {
  const startedAt = new Date().toISOString();
  const [coverageReadiness, missingPlan] = await Promise.all([
    readJson(coverageReadinessPath),
    readJson(missingPlanPath),
  ]);

  const missingEvalKeys = unique([
    ...(Array.isArray(coverageReadiness.missingEvalKeys) ? coverageReadiness.missingEvalKeys : []),
    ...(Array.isArray(missingPlan.selectedKeys) ? missingPlan.selectedKeys : []),
  ]).sort();
  const selectedKeys = Array.isArray(missingPlan.selectedKeys) ? missingPlan.selectedKeys.map(String).sort() : [];
  const selectedMatchesCoverage = missingEvalKeys.length === selectedKeys.length
    && missingEvalKeys.every((key) => selectedKeys.includes(key));
  const coverageStillBlocked = coverageReadiness.releaseReady !== true && missingEvalKeys.length > 0;

  const approvedCommand = selectedKeys.length
    ? `SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:missing && npm run rag:evaluate:coverage-readiness && npm run discord:smoke-final-scorecard && npm run verify:local:evidence`
    : 'npm run rag:evaluate:coverage-readiness && npm run discord:smoke-final-scorecard && npm run verify:local:evidence';
  const dryRunCommand = 'npm run rag:evaluate:missing-plan && npm run rag:evaluate:coverage-readiness';

  const evidence = {
    ok: true,
    version: 'rag-eval-execution-packet-v1',
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This packet plans the approved RAG eval coverage run. It does not seed Supabase, call DeepSeek, run retrieval, write eval results, or satisfy eval coverage.',
    sourceEvidence: {
      coverageReadiness: path.relative(root, coverageReadinessPath),
      missingPlan: path.relative(root, missingPlanPath),
    },
    status: coverageStillBlocked ? 'approval_required' : 'not_required',
    coverageStillBlocked,
    selectedMatchesCoverage,
    expectedQuestionCount: Number(coverageReadiness.expectedQuestionCount ?? 0),
    evaluatedQuestionCount: Number(coverageReadiness.evaluatedQuestionCount ?? 0),
    missingEvalKeys,
    selectedKeys,
    commandPlan: {
      dryRunCommand,
      approvedCommand,
      mutationWarning: selectedKeys.length
        ? 'Approved command can call DeepSeek, run retrieval, upsert rag_eval_questions, insert rag_eval_runs/results, and update local eval evidence.'
        : 'No missing keys selected; only readiness refresh is needed.',
      requiresExplicitApproval: selectedKeys.length > 0,
    },
    preRunChecks: [
      'Confirm NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are present in .env.local.',
      'Confirm DEEPSEEK_API_KEY is present before any non-dry-run eval command.',
      'Confirm SAGE_ALLOW_NON_DRY_RAG_EVAL=approved is set only after explicit approval for this eval run.',
      'Run npm run rag:evaluate:missing-plan and confirm selectedKeys exactly match missingEvalKeys.',
      'Do not run from a dirty staged state unless the staged files are intentionally part of the eval pass.',
      'Confirm this is an eval coverage run, not a content-generation or public-posting action.',
    ],
    postRunChecks: [
      'docs/evidence/rag/eval-latest.json has seededQuestionCount >= expectedQuestionCount.',
      'docs/evidence/rag/eval-latest.json has evaluatedQuestionCount >= expectedQuestionCount.',
      'docs/evidence/rag/eval-coverage-readiness.json has releaseReady=true and missingEvalKeys=[].',
      'npm run discord:smoke-final-scorecard no longer fails rag_eval_latest or rag_eval_coverage_readiness if quality thresholds pass.',
      'npm run verify:local:evidence passes after refreshed evidence is written.',
    ],
    failureHandling: [
      'If any missing eval fails below threshold, do not loosen the threshold; inspect missingSources and missingRequiredTerms.',
      'If retrieval misses sources, fix source metadata, chunking, or reranking before rerunning the failed keys.',
      'If DeepSeek or Supabase fails transiently, rerun only missing or failed keys after confirming no duplicate run is being claimed as release proof.',
      'If eval-latest is partially updated, keep eval-coverage-readiness releaseReady=false until every seeded key is represented.',
    ],
    antiFakeRules: [
      'Dry-run, seed-only, smoke-only, or plan-only outputs do not satisfy eval coverage.',
      'A local packet without rag_eval_results rows does not satisfy eval coverage.',
      'Passing 50/50 old evals does not satisfy the 65-question gate.',
      'A scorecard may not claim world-class while rag_eval_latest or rag_eval_coverage_readiness gates fail.',
    ],
    startedAt,
    finishedAt: new Date().toISOString(),
  };

  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath: outputPath }, null, 2));
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    version: 'rag-eval-execution-packet-v1',
    mutationMode: 'local_file_evidence_only',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath: outputPath }, null, 2));
  process.exit(1);
});
