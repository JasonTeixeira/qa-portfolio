import { createClient } from '@supabase/supabase-js';
import { test, expect } from '../../fixtures/auth';

const API = 'https://discord.com/api/v10';

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error('Missing SUPABASE env');
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function baseDiscordName(name: string): string {
  return name.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '');
}

async function discordApi<T>(apiPath: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${apiPath}`, {
    ...init,
    headers: {
      authorization: `Bot ${requireEnv('DISCORD_BOT_TOKEN')}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${apiPath} ${response.status}: ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function findChannelId(baseName: string): Promise<string> {
  const channels = await discordApi<Array<{ id: string; name: string }>>(`/guilds/${requireEnv('DISCORD_GUILD_ID')}/channels`);
  const channel = channels.find((item) => baseDiscordName(item.name) === baseName);
  if (!channel) throw new Error(`Channel not found: ${baseName}`);
  return channel.id;
}

test.describe('Admin Discord content jobs v2', () => {
  test('admin publishes an approved content job draft and duplicate publish is blocked by state', async ({ adminPage }) => {
    const sb = adminClient();
    const runId = `e2e-content-jobs-v2-${Date.now()}`;
    let draftId: string | null = null;
    let messageId: string | null = null;

    try {
      const { data: draft, error } = await sb.from('discord_content_drafts').insert({
        draft_type: 'resource_drop',
        target_channel_base_name: 'resources',
        title: `Phase 10 E2E content job ${runId}`,
        body: [
          '# Resource Drop',
          '**Source:** Approved Discord knowledge candidate [S1].',
          '**Use it for:** Turn one captured question into a reusable checklist.',
          '**Next action:** Pick one real member question, write the answer, add the source marker, and approve it before it enters RAG.',
          'Deliverable: one short checklist with source provenance and one action a builder can complete today.',
        ].join('\n'),
        citations: [{ source_id: 'S1', label: 'E2E approved candidate' }],
        model: 'e2e-seeded',
        prompt_version: 'sagebot_content_jobs_v2',
        quality_score: 96,
        status: 'approved',
        metadata: {
          phase: 10,
          source: 'discord-content-jobs-v2-e2e',
          job_type: 'resource_drop',
          source_ids: ['discord_content_queue:e2e-seeded'],
          policy_passed: true,
          run_id: runId,
        },
      }).select('id').single();
      expect(error).toBeNull();
      draftId = draft!.id;

      await adminPage.goto('/admin/discord', { waitUntil: 'networkidle' });
      await expect(adminPage.getByTestId(`content-draft-publish-${draftId}`)).toBeVisible();
      await adminPage.getByTestId(`content-draft-publish-${draftId}`).click();

      await expect.poll(async () => {
        const { data } = await sb
          .from('discord_content_drafts')
          .select('status, published_message_id')
          .eq('id', draftId)
          .single();
        messageId = data?.published_message_id ?? null;
        return data?.status;
      }, { timeout: 30_000 }).toBe('published');

      expect(messageId).toBeTruthy();
    } finally {
      if (messageId) {
        const channelId = await findChannelId('resources');
        await discordApi(`/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' });
      }
      if (draftId) await sb.from('discord_content_draft_evaluations').delete().eq('draft_id', draftId);
      if (draftId) await sb.from('discord_content_drafts').delete().eq('id', draftId);
      if (draftId) await sb.from('discord_events').delete().contains('metadata', { draft_id: draftId });
    }
  });
});
