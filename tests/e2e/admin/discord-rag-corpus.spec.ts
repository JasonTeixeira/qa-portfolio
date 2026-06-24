import { execFileSync } from 'node:child_process';
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

test.describe('Admin Discord authoritative RAG corpus', () => {
  test('admin approves a Discord content item into authoritative RAG', async ({ adminPage }) => {
    const sb = adminClient();
    const runId = `e2e-rag-corpus-${Date.now()}`;
    let queueId: string | null = null;
    let sourceKey: string | null = null;

    try {
      const { data: inserted, error: insertError } = await sb
        .from('discord_content_queue')
        .insert({
          source: 'e2e_rag_corpus_admin',
          discord_user_id: runId,
          discord_username: 'e2e-rag-corpus',
          channel_base_name: 'content-lab',
          idea: `E2E authoritative RAG approval proof ${runId}`,
          angle: 'This item starts captured, gets published from the admin dashboard, and then syncs into RAG.',
          status: 'captured',
          priority: 91,
          metadata: { run_id: runId },
        })
        .select('id')
        .single();
      expect(insertError).toBeNull();
      queueId = inserted!.id;
      sourceKey = `discord_content_queue:${queueId}`;

      await adminPage.goto('/admin/discord', { waitUntil: 'networkidle' });
      await expect(adminPage.getByTestId('discord-rag-corpus-ops')).toBeVisible();
      const row = adminPage.getByTestId(`rag-corpus-content_queue-${queueId}`);
      await expect(row).toBeVisible();
      await expect(row).toContainText('blocked');

      await adminPage.getByTestId(`rag-approve-queue-${queueId}`).click();

      await expect.poll(async () => {
        const { data } = await sb
          .from('discord_content_queue')
          .select('status')
          .eq('id', queueId)
          .single();
        return data?.status;
      }, { timeout: 30_000 }).toBe('published');

      execFileSync('npm', ['run', 'rag:sync-sources'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: 'pipe',
        timeout: 60_000,
      });

      const { data: source, error: sourceError } = await sb
        .from('rag_sources')
        .select('id, source_key, source_type, source_table, source_record_id, metadata')
        .eq('source_key', sourceKey)
        .single();
      expect(sourceError).toBeNull();
      expect(source?.source_type).toBe('discord_content_queue');
      expect(source?.source_table).toBe('discord_content_queue');
      expect(source?.source_record_id).toBe(queueId);
      expect(source?.metadata?.approved_for_rag).toBe(true);

      const { data: document, error: documentError } = await sb
        .from('rag_documents')
        .select('document_key, source_id, body')
        .eq('document_key', `doc:${sourceKey}`)
        .single();
      expect(documentError).toBeNull();
      expect(document?.source_id).toBe(source!.id);
      expect(document?.body).toContain(runId);

      await adminPage.reload({ waitUntil: 'networkidle' });
      await expect(adminPage.getByTestId(`rag-corpus-content_queue-${queueId}`)).toContainText('synced');
    } finally {
      if (sourceKey) await sb.from('rag_sources').delete().eq('source_key', sourceKey);
      if (queueId) await sb.from('discord_content_queue').delete().eq('id', queueId);
      await sb.from('discord_events').delete().eq('discord_user_id', runId);
    }
  });
});
