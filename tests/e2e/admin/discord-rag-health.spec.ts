import { createClient } from '@supabase/supabase-js';
import { test, expect } from '../../fixtures/auth';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error('Missing SUPABASE env');
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

test.describe('Admin Discord RAG health and eval drilldown', () => {
  test('admin sees failed eval details and creates a knowledge task', async ({ adminPage }) => {
    const sb = adminClient();
    const runId = `e2e-rag-health-${Date.now()}`;
    const evalKey = `rag_health_${Date.now()}`;
    let questionId: string | null = null;
    let runPk: string | null = null;
    let resultId: string | null = null;

    try {
      const { data: question, error: questionError } = await sb
        .from('rag_eval_questions')
        .insert({
          eval_key: evalKey,
          question: `E2E failed eval drilldown proof ${runId}`,
          expected_sources: ['missing-source.md'],
          tags: ['e2e', 'phase-8'],
          status: 'active',
          metadata: { required_terms: ['approval'], category: 'e2e' },
        })
        .select('id')
        .single();
      expect(questionError).toBeNull();
      questionId = question!.id;

      const { data: run, error: runError } = await sb
        .from('rag_eval_runs')
        .insert({
          run_key: runId,
          status: 'failed',
          total_questions: 1,
          passed: 0,
          failed: 1,
          metrics: { passRate: 0 },
          finished_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      expect(runError).toBeNull();
      runPk = run!.id;

      const { data: result, error: resultError } = await sb
        .from('rag_eval_results')
        .insert({
          eval_run_id: runPk,
          eval_question_id: questionId,
          passed: false,
          score: 0.25,
          citation_coverage: 0,
          faithfulness: 0.35,
          notes: 'E2E failed eval proof.',
          metadata: {
            eval_key: evalKey,
            missing_sources: ['missing-source.md'],
            missing_required_terms: ['approval'],
            metrics: { retrieval_hit_rate: 0 },
            observability: { traceId: runId },
          },
        })
        .select('id')
        .single();
      expect(resultError).toBeNull();
      resultId = result!.id;

      await adminPage.goto('/admin/discord', { waitUntil: 'networkidle' });
      await expect(adminPage.getByTestId('rag-health-eval-drilldown')).toBeVisible();
      await expect(adminPage.getByTestId(`rag-eval-row-${evalKey}`)).toContainText('missing-source.md');
      await adminPage.getByTestId(`rag-eval-create-task-${evalKey}`).click();

      await expect.poll(async () => {
        const { data } = await sb
          .from('discord_content_queue')
          .select('id, idea, metadata')
          .eq('source', 'rag_eval_failure')
          .contains('metadata', { rag_eval_result_id: resultId })
          .maybeSingle();
        return data?.idea ?? null;
      }, { timeout: 30_000 }).toContain(evalKey);
    } finally {
      if (resultId) {
        await sb.from('discord_content_queue').delete().eq('source', 'rag_eval_failure').contains('metadata', { rag_eval_result_id: resultId });
        await sb.from('discord_events').delete().eq('event_type', 'rag_eval_knowledge_task_created').contains('metadata', { rag_eval_result_id: resultId });
        await sb.from('rag_eval_results').delete().eq('id', resultId);
      }
      if (runPk) await sb.from('rag_eval_runs').delete().eq('id', runPk);
      if (questionId) await sb.from('rag_eval_questions').delete().eq('id', questionId);
    }
  });
});
