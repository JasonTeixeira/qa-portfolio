import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_RAG_EVAL_THRESHOLDS,
  RAG_EVAL_QUESTION_SEEDS,
  ragEvalSummaryPassed,
  scoreRagEvalAnswer,
  summarizeRagEvalScores,
  type RagEvalQuestionSeed,
} from '../../lib/rag/evals';
import { answerRagQuestion } from '../../lib/rag/retrieval';
import { SAGEBOT_PROMPT_VERSIONS } from '../../lib/discord/sagebot-personality';
import { assertNonDryRunRagEvalApproved } from '../../lib/rag/eval-approval';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');
const latestEvalPath = path.join(evidenceDir, 'eval-latest.json');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function arg(name: string): string | null {
  const prefix = `--${name}=`;
  const match = process.argv.find((value) => value.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function listArg(name: string): string[] {
  return (arg(name) ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildRunKey(smoke: boolean): string {
  return `${smoke ? 'smoke' : 'full'}-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`;
}

async function seedEvalQuestions(sb: any) {
  const records = RAG_EVAL_QUESTION_SEEDS.map((seed) => ({
    eval_key: seed.eval_key,
    question: seed.question,
    expected_sources: seed.expected_sources,
    expected_answer_notes: seed.expected_answer_notes,
    tags: seed.tags,
    status: 'active',
    metadata: seed.metadata,
    updated_at: new Date().toISOString(),
  }));
  const { data, error } = await (sb as any)
    .from('rag_eval_questions')
    .upsert(records, { onConflict: 'eval_key' })
    .select('id, eval_key, question, expected_sources, expected_answer_notes, tags, metadata');
  if (error) throw error;
  return data ?? [];
}

async function readLatestEvalEvidence(): Promise<any | null> {
  try {
    return JSON.parse(await readFile(latestEvalPath, 'utf8'));
  } catch {
    return null;
  }
}

function seedFromRow(row: any): RagEvalQuestionSeed {
  return {
    eval_key: row.eval_key,
    question: row.question,
    expected_sources: row.expected_sources ?? [],
    expected_answer_notes: row.expected_answer_notes ?? '',
    tags: row.tags ?? [],
    metadata: {
      category: row.metadata?.category ?? 'rag_ai_build',
      required_terms: Array.isArray(row.metadata?.required_terms) ? row.metadata.required_terms : [],
      refusal_expected: Boolean(row.metadata?.refusal_expected),
    },
  };
}

async function main() {
  const smoke = hasFlag('smoke');
  const seedOnly = hasFlag('seed-only');
  const dryRun = hasFlag('dry-run');
  const missingFromLatest = hasFlag('missing-from-latest');
  const mergeLatest = hasFlag('merge-latest');
  const planOnly = hasFlag('plan-only');
  assertNonDryRunRagEvalApproved({ dryRun });
  const requestedKeys = listArg('keys');
  const limit = Number(arg('limit') ?? (smoke ? 3 : RAG_EVAL_QUESTION_SEEDS.length));
  const runKey = arg('run-key') ?? buildRunKey(smoke);
  const startedAt = new Date().toISOString();
  const sb = createClient<any>(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const seededRows = dryRun
    ? RAG_EVAL_QUESTION_SEEDS.map((seed) => ({
      id: seed.eval_key,
      eval_key: seed.eval_key,
      question: seed.question,
      expected_sources: seed.expected_sources,
      expected_answer_notes: seed.expected_answer_notes,
      tags: seed.tags,
      metadata: seed.metadata,
    }))
    : await seedEvalQuestions(sb);
  const latestEvalEvidence = (missingFromLatest || mergeLatest) ? await readLatestEvalEvidence() : null;
  const latestEvaluatedKeys = new Set(
    Array.isArray(latestEvalEvidence?.results)
      ? latestEvalEvidence.results.map((result: any) => String(result?.evalKey ?? '')).filter(Boolean)
      : [],
  );
  const missingKeys = missingFromLatest
    ? RAG_EVAL_QUESTION_SEEDS.map((seed) => seed.eval_key).filter((evalKey) => !latestEvaluatedKeys.has(evalKey))
    : [];
  const hasConstrainedSelection = requestedKeys.length > 0 || missingFromLatest;
  const keyFilter = requestedKeys.length ? requestedKeys : missingKeys;
  const seededKeys = new Set(seededRows.map((row: any) => String(row.eval_key)));
  const unknownKeys = keyFilter.filter((evalKey) => !seededKeys.has(evalKey));
  if (unknownKeys.length) {
    throw new Error(`Unknown RAG eval key(s): ${unknownKeys.join(', ')}`);
  }
  const selectedRows = seededRows
    .filter((row: any) => {
      if (keyFilter.length) return keyFilter.includes(String(row.eval_key));
      return !hasConstrainedSelection;
    })
    .sort((a: any, b: any) => String(a.eval_key).localeCompare(String(b.eval_key)))
    .slice(0, Math.max(1, Math.min(limit, seededRows.length)));

  if (planOnly) {
    const evidence = {
      ok: true,
      runKey,
      mutationMode: 'local_file_evidence_only',
      dryRun,
      missingFromLatest,
      mergeLatest,
      requestedKeys,
      seededQuestionCount: seededRows.length,
      selectedQuestionCount: selectedRows.length,
      latestEvaluatedQuestionCount: latestEvaluatedKeys.size,
      missingKeys,
      selectedKeys: selectedRows.map((row: any) => String(row.eval_key)),
      releaseMeaning: 'This is a local selection plan only. It does not call DeepSeek, run retrieval, seed Supabase, write eval results, or satisfy eval coverage.',
      approvedCommand: 'SAGE_ALLOW_NON_DRY_RAG_EVAL=approved npm run rag:evaluate:approved-missing',
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence('eval-missing-plan.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    return;
  }

  if ((missingFromLatest || requestedKeys.length) && selectedRows.length === 0) {
    const evidence = {
      ok: missingFromLatest,
      runKey,
      dryRun,
      missingFromLatest,
      mergeLatest,
      requestedKeys,
      seededQuestionCount: seededRows.length,
      evaluatedQuestionCount: 0,
      missingKeys,
      message: missingFromLatest ? 'Latest RAG eval evidence already covers every seeded eval key.' : 'No requested eval keys selected.',
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence('eval-latest-selection.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!evidence.ok) process.exit(1);
    return;
  }

  if (seedOnly) {
    const evidence = {
      ok: seededRows.length === RAG_EVAL_QUESTION_SEEDS.length,
      dryRun,
      seeded: seededRows.length,
      expected: RAG_EVAL_QUESTION_SEEDS.length,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(dryRun ? 'eval-seed-dry-run.json' : smoke ? 'eval-smoke.json' : 'eval-latest.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!evidence.ok) process.exit(1);
    return;
  }

  const run = dryRun
    ? { id: null, run_key: `${runKey}-dry-run` }
    : await createEvalRun(sb, {
      runKey,
      smoke,
      totalQuestions: selectedRows.length,
    });

  const scores = [];
  const results = [];
  try {
    for (const row of selectedRows) {
      const seed = seedFromRow(row);
      const retrievalLimit = 1;
      const answer = await answerRagQuestion(sb, seed.question, { limit: retrievalLimit, persist: !dryRun });
      const score = scoreRagEvalAnswer(seed, answer);
      const metadata = {
        eval_key: seed.eval_key,
        tags: seed.tags,
        expected_sources: seed.expected_sources,
        retrieval_limit: retrievalLimit,
        missing_sources: score.missingSources,
        missing_required_terms: score.missingRequiredTerms,
        observability: answer.observability,
        metrics: {
          retrieval_hit_rate: score.retrievalHitRate,
          context_precision: score.contextPrecision,
          groundedness: score.groundedness,
          answer_usefulness: score.answerUsefulness,
          refusal_correctness: score.refusalCorrectness,
        },
      };
      if (!dryRun) {
        const { error: resultError } = await sb.from('rag_eval_results').insert({
          eval_run_id: run.id,
          eval_question_id: row.id,
          answer_id: answer.answerId,
          retrieval_log_id: answer.retrievalLogId,
          passed: score.passed,
          score: score.score,
          citation_coverage: score.citationCoverage,
          faithfulness: score.faithfulness,
          notes: score.notes,
          metadata,
        });
        if (resultError) throw resultError;
      }
      scores.push(score);
      results.push({
        evalKey: seed.eval_key,
        question: seed.question,
        passed: score.passed,
        score: score.score,
        retrievalHitRate: score.retrievalHitRate,
        citationCoverage: score.citationCoverage,
        contextPrecision: score.contextPrecision,
        faithfulness: score.faithfulness,
        groundedness: score.groundedness,
        answerUsefulness: score.answerUsefulness,
        answerId: answer.answerId,
        retrievalLogId: answer.retrievalLogId,
        traceId: answer.observability.traceId,
        missingSources: score.missingSources,
        missingRequiredTerms: score.missingRequiredTerms,
      });
    }

    const mergedResults = mergeLatest && latestEvalEvidence?.results
      ? mergeEvalResults(latestEvalEvidence.results, results)
      : results;
    const summary = mergeLatest
      ? summarizeRagEvalScores(mergedResults.map(scoreFromEvalResult))
      : summarizeRagEvalScores(scores);
    const ok = ragEvalSummaryPassed(summary);
    const finishedAt = new Date().toISOString();
    if (!dryRun) {
      await sb.from('rag_eval_runs').update({
        status: ok ? 'completed' : 'failed',
        model: results.length ? 'deepseek' : null,
        passed: summary.passed,
        failed: summary.failed,
        metrics: {
          ...summary,
          thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
        },
        error: ok ? null : 'RAG eval run failed configured deterministic thresholds.',
        finished_at: finishedAt,
      }).eq('id', run.id);
    }

    const evidence = {
      ok,
      runId: run.id,
      runKey: run.run_key,
      smoke,
      dryRun,
      missingFromLatest,
      mergeLatest,
      requestedKeys,
      missingKeysAtStart: missingKeys,
      seededQuestionCount: seededRows.length,
      evaluatedQuestionCount: mergedResults.length,
      partialEvaluatedQuestionCount: selectedRows.length,
      mergedPreviousResultCount: mergeLatest && latestEvalEvidence?.results ? latestEvalEvidence.results.length : 0,
      summary,
      thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
      results: mergedResults,
      startedAt,
      finishedAt,
    };
    await writeEvidence(smoke ? 'eval-smoke.json' : 'eval-latest.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!ok) process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!dryRun) {
      await sb.from('rag_eval_runs').update({
        status: 'failed',
        error: message,
        finished_at: new Date().toISOString(),
      }).eq('id', run.id);
    }
    throw error;
  }
}

function mergeEvalResults(previousResults: any[], currentResults: any[]) {
  const byKey = new Map<string, any>();
  for (const result of previousResults) {
    const evalKey = String(result?.evalKey ?? '');
    if (evalKey) byKey.set(evalKey, result);
  }
  for (const result of currentResults) {
    const evalKey = String(result?.evalKey ?? '');
    if (evalKey) byKey.set(evalKey, result);
  }
  return [...byKey.values()].sort((a, b) => String(a.evalKey).localeCompare(String(b.evalKey)));
}

function scoreFromEvalResult(result: any) {
  const retrievalHitRate = Number(result?.retrievalHitRate ?? 0);
  return {
    passed: Boolean(result?.passed),
    score: Number(result?.score ?? 0),
    retrievalHit: retrievalHitRate >= 1,
    retrievalHitRate,
    citationCoverage: Number(result?.citationCoverage ?? 0),
    contextPrecision: Number(result?.contextPrecision ?? 0),
    faithfulness: Number(result?.faithfulness ?? 0),
    groundedness: Number(result?.groundedness ?? 0),
    answerUsefulness: Number(result?.answerUsefulness ?? 0),
    refusalCorrectness: null,
    missingSources: Array.isArray(result?.missingSources) ? result.missingSources : [],
    missingRequiredTerms: Array.isArray(result?.missingRequiredTerms) ? result.missingRequiredTerms : [],
    notes: String(result?.notes ?? ''),
  };
}

async function createEvalRun(
  sb: any,
  input: { runKey: string; smoke: boolean; totalQuestions: number },
): Promise<{ id: string; run_key: string }> {
  const { data: run, error: runError } = await sb.from('rag_eval_runs').insert({
    run_key: input.runKey,
    status: 'running',
    retrieval_config: {
      limit: 'adaptive_expected_source_count',
      mode: input.smoke ? 'smoke' : 'full',
      deterministic_grader: true,
      thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
    },
    prompt_version: SAGEBOT_PROMPT_VERSIONS.answer,
    total_questions: input.totalQuestions,
  }).select('id, run_key').single();
  if (runError) throw runError;
  return run;
}

async function writeEvidence(fileName: string, evidence: unknown) {
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(path.join(evidenceDir, fileName), `${JSON.stringify(evidence, null, 2)}\n`);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await writeEvidence('eval-error.json', evidence);
  console.error(JSON.stringify(evidence, null, 2));
  process.exit(1);
});
