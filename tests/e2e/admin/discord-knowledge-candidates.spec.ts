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

test.describe('Admin Discord knowledge candidates', () => {
  test('admin promotes a captured Discord message candidate into RAG', async ({ adminPage }) => {
    const sb = adminClient();
    const runId = `e2e-knowledge-candidate-${Date.now()}`;
    let queueId: string | null = null;
    let ragSourceKey: string | null = null;

    try {
      const { error: messageError } = await sb.from('discord_messages').upsert({
        discord_message_id: runId,
        guild_id: 'e2e-knowledge-candidate',
        channel_id: 'e2e-knowledge-candidate',
        channel_base_name: 'content-queue',
        author_user_id: runId,
        author_username: 'e2e-knowledge-candidate',
        author_bot: false,
        content: `Phase 9 candidate proof ${runId}: turn this member resource into a reusable RAG source with a clear action step.`,
        detected_kind: 'resource',
        link_count: 0,
        attachment_count: 0,
        captured_at: new Date().toISOString(),
        raw: { e2e: true },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'discord_message_id' });
      expect(messageError).toBeNull();

      const { error: classificationError } = await sb.from('discord_message_classifications').upsert({
        discord_message_id: runId,
        category: 'resource',
        recommended_action: 'candidate_resource',
        confidence: 0.92,
        quality_score: 86,
        content_value_score: 91,
        spam_score: 0,
        signals: { shares_resource: true },
        rationale: 'resource -> candidate_resource because shares resource',
        classifier_version: 'e2e-phase-9',
        classified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'discord_message_id' });
      expect(classificationError).toBeNull();

      const { data: queue, error: queueError } = await sb.from('discord_content_queue').insert({
        source: 'discord_message_classifier',
        source_message_id: runId,
        source_classification_action: 'candidate_resource',
        source_classification_category: 'resource',
        discord_user_id: runId,
        discord_username: 'e2e-knowledge-candidate',
        channel_base_name: 'content-queue',
        idea: `Phase 9 candidate proof ${runId}`,
        angle: 'Admin should promote this captured message as a resource and sync it into RAG.',
        status: 'captured',
        priority: 92,
        metadata: {
          source_content_preview: `Phase 9 candidate proof ${runId}: turn this member resource into a reusable RAG source with a clear action step.`,
        },
      }).select('id').single();
      expect(queueError).toBeNull();
      queueId = queue!.id;
      ragSourceKey = `discord_content_queue:${queueId}`;

      await adminPage.goto('/admin/discord', { waitUntil: 'networkidle' });
      await expect(adminPage.getByTestId(`content-queue-row-${queueId}`)).toBeVisible();
      await adminPage.getByTestId(`knowledge-candidate-resource-${queueId}`).click();

      await expect.poll(async () => {
        const { data } = await sb.from('rag_sources').select('source_key').eq('source_key', ragSourceKey).maybeSingle();
        return data?.source_key ?? null;
      }, { timeout: 30_000 }).toBe(ragSourceKey);

      const { data: updatedQueue } = await sb.from('discord_content_queue').select('status, metadata').eq('id', queueId).single();
      expect(updatedQueue?.status).toBe('published');
      expect(updatedQueue?.metadata?.knowledge_candidate?.decision).toBe('resource');
    } finally {
      if (ragSourceKey) await sb.from('rag_sources').delete().eq('source_key', ragSourceKey);
      if (queueId) await sb.from('discord_content_queue').delete().eq('id', queueId);
      await sb.from('discord_messages').delete().eq('discord_message_id', runId);
      if (queueId) await sb.from('discord_events').delete().contains('metadata', { queue_id: queueId });
    }
  });
});
