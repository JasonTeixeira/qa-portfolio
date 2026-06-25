import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  buildDiscordObservabilityQualityRollup,
  estimateDeepSeekCostUsd,
  loadDiscordObservabilityQualityRollup,
} from '@/lib/discord/observability-quality';
import { syncDiscordDurableJobRegistry } from '@/lib/discord/durable-jobs';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const runKey = `phase-17-smoke-${Date.now()}`;
  const now = new Date();
  const startedAt = new Date(now.getTime() - 60_000).toISOString();
  const rollupKey = `${runKey}:rollup`;
  let retrievalLogId: string | null = null;
  let answerId: string | null = null;
  let evalQuestionId: string | null = null;
  let evalRunId: string | null = null;
  let draftId: string | null = null;
  let reviewId: string | null = null;

  try {
    await syncDiscordDurableJobRegistry();
    const { data: member, error: memberError } = await sb.from('discord_members').upsert({
      discord_user_id: runKey,
      username: 'phase17-smoke',
      academy_member: true,
      last_seen_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'discord_user_id' }).select('discord_user_id').single();
    if (memberError) throw memberError;

    const retrieval = await sb.from('rag_retrieval_logs').insert({
      query: 'Phase 17 observability smoke',
      normalized_query: 'phase 17 observability smoke',
      result_count: 2,
      selected_chunk_ids: [],
      score_summary: { smoke: true },
      confidence: 0.9,
      latency_ms: 321,
      metadata: {
        smoke: true,
        run_key: runKey,
        ai_trace_id: 'a'.repeat(32),
        ai_observation_id: 'b'.repeat(16),
        ai_observability_provider: 'local',
      },
    }).select('id').single();
    if (retrieval.error) throw retrieval.error;
    retrievalLogId = retrieval.data.id;

    const answer = await sb.from('rag_answers').insert({
      retrieval_log_id: retrievalLogId,
      question: 'How is Phase 17 traced?',
      answer: 'Phase 17 traces command, job, RAG, and content artifacts with cost and quality rollups.',
      status: 'draft',
      confidence: 0.9,
      citations: [{ title: 'Phase 17 smoke', source_type: 'admin_note' }],
      model: 'deepseek-chat',
      prompt_version: 'phase-17-smoke',
      metadata: {
        smoke: true,
        run_key: runKey,
        usage: { prompt_tokens: 1200, completion_tokens: 400, total_tokens: 1600 },
        ai_trace_id: 'a'.repeat(32),
        ai_observation_id: 'c'.repeat(16),
        ai_observability_provider: 'local',
      },
    }).select('id').single();
    if (answer.error) throw answer.error;
    answerId = answer.data.id;

    const evalQuestion = await sb.from('rag_eval_questions').insert({
      eval_key: runKey,
      question: 'Does Phase 17 expose observability?',
      expected_sources: ['phase-17'],
      tags: ['phase_17_smoke'],
      metadata: { category: 'rag_ai_build', required_terms: ['observability'] },
    }).select('id').single();
    if (evalQuestion.error) throw evalQuestion.error;
    evalQuestionId = evalQuestion.data.id;

    const evalRun = await sb.from('rag_eval_runs').insert({
      run_key: runKey,
      status: 'completed',
      total_questions: 1,
      passed: 1,
      failed: 0,
      metrics: { avgScore: 0.92, citationCoverage: 0.9, faithfulness: 0.95 },
      started_at: startedAt,
      finished_at: now.toISOString(),
    }).select('id').single();
    if (evalRun.error) throw evalRun.error;
    evalRunId = evalRun.data.id;

    const evalResult = await sb.from('rag_eval_results').insert({
      eval_run_id: evalRunId,
      eval_question_id: evalQuestionId,
      answer_id: answerId,
      retrieval_log_id: retrievalLogId,
      passed: true,
      score: 0.92,
      citation_coverage: 0.9,
      faithfulness: 0.95,
      notes: 'Phase 17 smoke passed.',
      metadata: { smoke: true, run_key: runKey, observability: { traceId: 'a'.repeat(32) } },
    });
    if (evalResult.error) throw evalResult.error;

    const draft = await sb.from('discord_content_drafts').insert({
      draft_type: 'daily_signal',
      target_channel_base_name: 'daily-signal',
      title: 'Phase 17 observability smoke',
      body: '**Build prompt:** Add trace, cost, and quality proof to one workflow.\n\nDeliverable: one dashboard rollup and one evidence file.',
      quality_score: 92,
      status: 'pending_approval',
      metadata: {
        smoke: true,
        run_key: runKey,
        ai_trace_id: 'a'.repeat(32),
        ai_observability_provider: 'local',
      },
    }).select('id').single();
    if (draft.error) throw draft.error;
    draftId = draft.data.id;

    const draftEval = await sb.from('discord_content_draft_evaluations').insert({
      draft_id: draftId,
      evaluator_version: 'phase-17-smoke',
      score: 92,
      passed: true,
      gates: [],
      reasons: [],
      metadata: { smoke: true, run_key: runKey },
    });
    if (draftEval.error) throw draftEval.error;

    const jobRun = await sb.from('discord_job_runs').insert({
      run_key: runKey,
      job_key: 'rag_eval',
      status: 'succeeded',
      idempotency_key: runKey,
      attempt: 1,
      max_retries: 1,
      started_at: startedAt,
      finished_at: now.toISOString(),
      duration_ms: 60000,
      metadata: {
        smoke: true,
        run_key: runKey,
        ai_trace_id: 'a'.repeat(32),
        ai_observability_provider: 'local',
      },
    });
    if (jobRun.error) throw jobRun.error;

    const review = await sb.from('discord_premium_review_requests').insert({
      discord_user_id: member.discord_user_id,
      discord_username: 'phase17-smoke',
      review_type: 'ai',
      summary: 'Phase 17 premium quality smoke',
      priority: 90,
      status: 'answered',
      assigned_to: 'phase17-smoke-admin',
      response: 'Premium review completed with specific recommendation, next step, and risk.',
      sla_due_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      completed_at: now.toISOString(),
      response_quality_score: 94,
      judgment_basis: 'Based on the submitted Phase 17 smoke artifact and premium quality bar.',
      metadata: { smoke: true, run_key: runKey },
    }).select('id').single();
    if (review.error) throw review.error;
    reviewId = review.data.id;

    const deterministic = buildDiscordObservabilityQualityRollup({
      ragAnswers: [{ metadata: { usage: { prompt_tokens: 1200, completion_tokens: 400, total_tokens: 1600 }, ai_trace_id: 'a'.repeat(32), ai_observability_provider: 'local' } }],
      retrievalLogs: [{ metadata: { ai_trace_id: 'a'.repeat(32), ai_observability_provider: 'local' } }],
      jobRuns: [{ status: 'succeeded', duration_ms: 60000, metadata: { ai_trace_id: 'a'.repeat(32), ai_observability_provider: 'local' } }],
      openDeadLetters: 0,
      ragEvalRuns: [{ total_questions: 1, passed: 1, failed: 0, metrics: { avgScore: 0.92 } }],
      ragEvalResults: [{ passed: true, score: 0.92, citation_coverage: 0.9, faithfulness: 0.95 }],
      contentDrafts: [{ quality_score: 92, status: 'pending_approval', metadata: { ai_trace_id: 'a'.repeat(32), ai_observability_provider: 'local' } }],
      contentEvaluations: [{ score: 92, passed: true }],
      premiumReviews: [{ response_quality_score: 94, status: 'answered', sla_due_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(), completed_at: now.toISOString() }],
    }, { now, windowHours: 1 });

    const liveRollup = await loadDiscordObservabilityQualityRollup({
      windowHours: 1,
      persist: true,
      rollupKey,
      now,
    });

    const page = await readFile(path.join(process.cwd(), 'app', 'admin', 'discord', 'page.tsx'), 'utf8');
    const migration = await readFile(path.join(process.cwd(), 'supabase', 'migrations', '0091_discord_observability_quality_rollups.sql'), 'utf8');
    const checks = {
      deterministic_rollup_healthy: deterministic.healthScore >= 90 && deterministic.status === 'healthy',
      cost_estimate_priced: estimateDeepSeekCostUsd({ promptTokens: 1200, completionTokens: 400 }) > 0,
      live_rollup_persisted: Boolean(liveRollup.rollupId),
      live_trace_visible: liveRollup.trace.tracedArtifacts >= 4 && liveRollup.traceCoverage > 0,
      live_quality_visible: liveRollup.quality.avgContentQuality >= 80 && liveRollup.quality.avgPremiumQuality >= 80,
      admin_surface_present: page.includes('Observability, cost, and quality') && page.includes('data-testid=\"discord-observability-quality\"'),
      migration_present: migration.includes('create table if not exists public.discord_observability_rollups'),
    };
    const evidence = {
      ok: Object.values(checks).every(Boolean),
      checks,
      deterministic,
      liveRollup,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await mkdir(evidenceDir, { recursive: true });
    const evidencePath = path.join(evidenceDir, 'phase-17-observability-quality-v2.json');
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
    if (!evidence.ok) process.exitCode = 1;
  } finally {
    if (reviewId) await sb.from('discord_premium_review_requests').delete().eq('id', reviewId);
    if (draftId) await sb.from('discord_content_draft_evaluations').delete().eq('draft_id', draftId);
    if (draftId) await sb.from('discord_content_drafts').delete().eq('id', draftId);
    if (evalRunId) await sb.from('rag_eval_results').delete().eq('eval_run_id', evalRunId);
    if (evalRunId) await sb.from('rag_eval_runs').delete().eq('id', evalRunId);
    if (evalQuestionId) await sb.from('rag_eval_questions').delete().eq('id', evalQuestionId);
    if (answerId) await sb.from('rag_answers').delete().eq('id', answerId);
    if (retrievalLogId) await sb.from('rag_retrieval_logs').delete().eq('id', retrievalLogId);
    await sb.from('discord_job_runs').delete().eq('run_key', runKey);
    await sb.from('discord_observability_rollups').delete().eq('rollup_key', rollupKey);
    await sb.from('discord_members').delete().eq('discord_user_id', runKey);
  }
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'phase-17-observability-quality-v2.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
