import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DEFAULT_RAG_EVAL_THRESHOLDS,
  RAG_EVAL_QUESTION_SEEDS,
  ragEvalSummaryPassed,
} from '../../lib/rag/evals';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');
const latestEvalPath = path.join(evidenceDir, 'eval-latest.json');
const outputPath = path.join(evidenceDir, 'eval-coverage-readiness.json');

async function readLatestEval(): Promise<any> {
  return JSON.parse(await readFile(latestEvalPath, 'utf8'));
}

async function main() {
  const startedAt = new Date().toISOString();
  const latest = await readLatestEval();
  const expectedKeys = RAG_EVAL_QUESTION_SEEDS.map((seed) => seed.eval_key).sort();
  const evaluatedKeys = Array.isArray(latest.results)
    ? latest.results.map((result: any) => String(result?.evalKey ?? '')).filter(Boolean).sort()
    : [];
  const evaluatedKeySet = new Set(evaluatedKeys);
  const missingEvalKeys = expectedKeys.filter((key: string) => !evaluatedKeySet.has(key));
  const unexpectedEvalKeys = evaluatedKeys.filter((key: string) => !expectedKeys.includes(key));
  const seededQuestionCount = Number(latest.seededQuestionCount ?? latest.seeded ?? 0);
  const evaluatedQuestionCount = Number(latest.evaluatedQuestionCount ?? latest.summary?.total ?? 0);
  const latestSummaryPasses = latest.ok === true
    && latest.summary
    && ragEvalSummaryPassed(latest.summary);
  const releaseReady = latestSummaryPasses === true
    && seededQuestionCount >= RAG_EVAL_QUESTION_SEEDS.length
    && evaluatedQuestionCount >= RAG_EVAL_QUESTION_SEEDS.length
    && missingEvalKeys.length === 0
    && unexpectedEvalKeys.length === 0;
  const blockers = [
    seededQuestionCount < RAG_EVAL_QUESTION_SEEDS.length
      ? `latest_seeded_eval_count_below_target:${seededQuestionCount}/${RAG_EVAL_QUESTION_SEEDS.length}`
      : null,
    evaluatedQuestionCount < RAG_EVAL_QUESTION_SEEDS.length
      ? `latest_evaluated_eval_count_below_target:${evaluatedQuestionCount}/${RAG_EVAL_QUESTION_SEEDS.length}`
      : null,
    missingEvalKeys.length
      ? `missing_eval_keys:${missingEvalKeys.join(',')}`
      : null,
    unexpectedEvalKeys.length
      ? `unexpected_eval_keys:${unexpectedEvalKeys.join(',')}`
      : null,
    latestSummaryPasses !== true
      ? 'latest_eval_summary_below_threshold'
      : null,
  ].filter(Boolean);

  const evidence = {
    ok: true,
    version: 'rag-eval-coverage-readiness-v1',
    mutationMode: 'local_file_evidence_only',
    releaseMeaning: 'This artifact reads the latest local RAG eval evidence and writes local readiness evidence only. It does not seed Supabase, call DeepSeek, run retrieval, or satisfy the full eval release gate.',
    latestEvalPath: path.relative(process.cwd(), latestEvalPath),
    expectedQuestionCount: RAG_EVAL_QUESTION_SEEDS.length,
    seededQuestionCount,
    evaluatedQuestionCount,
    evaluatedKeyCount: evaluatedKeys.length,
    missingEvalKeys,
    unexpectedEvalKeys,
    summary: latest.summary ?? null,
    thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
    releaseReady,
    blockers,
    nextActions: releaseReady
      ? ['No eval coverage action needed before the next scorecard run.']
      : [
        'Run the full RAG eval only with explicit approval because it writes Supabase eval rows and can call DeepSeek.',
        'Expected command after approval: npm run rag:evaluate && npm run discord:smoke-final-scorecard',
        'Keep dry-run release gates blocked until eval-latest covers every seeded eval question.',
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
    version: 'rag-eval-coverage-readiness-v1',
    mutationMode: 'local_file_evidence_only',
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath: outputPath }, null, 2));
  process.exit(1);
});
