import { mkdir, writeFile } from 'node:fs/promises';
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

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'rag');

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
  const limit = Number(arg('limit') ?? (smoke ? 3 : RAG_EVAL_QUESTION_SEEDS.length));
  const runKey = arg('run-key') ?? buildRunKey(smoke);
  const startedAt = new Date().toISOString();
  const sb = createClient<any>(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });

  const seededRows = await seedEvalQuestions(sb);
  const selectedRows = seededRows
    .sort((a: any, b: any) => String(a.eval_key).localeCompare(String(b.eval_key)))
    .slice(0, Math.max(1, Math.min(limit, seededRows.length)));

  if (seedOnly) {
    const evidence = {
      ok: seededRows.length === RAG_EVAL_QUESTION_SEEDS.length,
      seeded: seededRows.length,
      expected: RAG_EVAL_QUESTION_SEEDS.length,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(smoke ? 'eval-smoke.json' : 'eval-latest.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!evidence.ok) process.exit(1);
    return;
  }

  const { data: run, error: runError } = await sb.from('rag_eval_runs').insert({
    run_key: runKey,
    status: 'running',
    retrieval_config: {
      limit: 5,
      mode: smoke ? 'smoke' : 'full',
      deterministic_grader: true,
      thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
    },
    prompt_version: 'rag_answer_v1',
    total_questions: selectedRows.length,
  }).select('id, run_key').single();
  if (runError) throw runError;

  const scores = [];
  const results = [];
  try {
    for (const row of selectedRows) {
      const seed = seedFromRow(row);
      const answer = await answerRagQuestion(sb, seed.question, { limit: 5, persist: true });
      const score = scoreRagEvalAnswer(seed, answer);
      const metadata = {
        eval_key: seed.eval_key,
        tags: seed.tags,
        expected_sources: seed.expected_sources,
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

    const summary = summarizeRagEvalScores(scores);
    const ok = ragEvalSummaryPassed(summary);
    const finishedAt = new Date().toISOString();
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

    const evidence = {
      ok,
      runId: run.id,
      runKey: run.run_key,
      smoke,
      seededQuestionCount: seededRows.length,
      evaluatedQuestionCount: selectedRows.length,
      summary,
      thresholds: DEFAULT_RAG_EVAL_THRESHOLDS,
      results,
      startedAt,
      finishedAt,
    };
    await writeEvidence(smoke ? 'eval-smoke.json' : 'eval-latest.json', evidence);
    console.log(JSON.stringify(evidence, null, 2));
    if (!ok) process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sb.from('rag_eval_runs').update({
      status: 'failed',
      error: message,
      finished_at: new Date().toISOString(),
    }).eq('id', run.id);
    throw error;
  }
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
