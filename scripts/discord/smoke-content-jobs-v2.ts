import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { reviewDiscordContentDraft } from '@/lib/discord/content-approval';
import { createDiscordContentJobDraftV2, publishApprovedDiscordContentDraft } from '@/lib/discord/content-jobs-v2';

const API = 'https://discord.com/api/v10';
const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

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

async function main() {
  const startedAt = new Date().toISOString();
  const runId = `phase10-content-jobs-${Date.now()}`;
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  let queueId: string | null = null;
  let draftId: string | null = null;
  let messageId: string | null = null;

  try {
    const { data: queue, error: queueError } = await sb.from('discord_content_queue').insert({
      source: 'phase10_smoke',
      discord_username: 'phase10-smoke',
      channel_base_name: 'resources',
      idea: 'Turn one approved Discord knowledge candidate into a reusable resource drop.',
      angle: 'Explain the approval boundary: capture useful member questions, review them, approve only source-grounded material, then turn the source into a concrete action.',
      status: 'published',
      priority: 96,
      metadata: {
        smoke: true,
        run_id: runId,
        source_content_preview: 'A useful Discord content engine captures real questions, queues them for review, approves source-grounded knowledge, and turns the approved source into one action a builder can complete today.',
      },
    }).select('id').single();
    if (queueError) throw new Error(queueError.message);
    queueId = queue.id;

    const generated = await createDiscordContentJobDraftV2({
      jobType: 'resource_drop',
      topic: 'approval-gated Discord knowledge capture',
      maxSources: 6,
      sourceIds: [`discord_content_queue:${queueId}`],
      metadata: { smoke: true, run_id: runId },
    });
    draftId = generated.draftId;

    await reviewDiscordContentDraft({
      draftId,
      status: 'approved',
      reviewerEmail: 'phase10-smoke@test.local',
      note: 'Phase 10 content jobs v2 smoke approval.',
    });

    const firstPublish = await publishApprovedDiscordContentDraft({
      draftId,
      source: 'phase10_content_jobs_v2_smoke',
    });
    messageId = firstPublish.messageId;
    const secondPublish = await publishApprovedDiscordContentDraft({
      draftId,
      source: 'phase10_content_jobs_v2_smoke',
    });

    const { data: draft, error: draftError } = await sb
      .from('discord_content_drafts')
      .select('id, status, draft_type, target_channel_base_name, title, quality_score, published_message_id, metadata')
      .eq('id', draftId)
      .single();
    if (draftError) throw new Error(draftError.message);

    if (messageId) {
      const channelId = await findChannelId(String(draft.target_channel_base_name));
      await discordApi(`/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' });
    }

    const ok = Boolean(
      generated.ok
      && generated.sourceIds.includes(`discord_content_queue:${queueId}`)
      && draft?.status === 'published'
      && Number(draft?.quality_score ?? 0) >= 80
      && firstPublish.posted
      && firstPublish.messageId
      && secondPublish.skipped
      && secondPublish.reason === 'already_published'
      && draft?.metadata?.source_ids?.includes(`discord_content_queue:${queueId}`)
    );

    const evidence = {
      ok,
      runId,
      queueId,
      draftId,
      generated,
      draft,
      firstPublish,
      secondPublish,
      cleanedUp: true,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(evidence);
    console.log(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'content-jobs-v2-smoke.json') }, null, 2));
    if (!ok) process.exit(1);
  } finally {
    if (draftId) await sb.from('discord_content_draft_evaluations').delete().eq('draft_id', draftId);
    if (draftId) await sb.from('discord_content_drafts').delete().eq('id', draftId);
    if (queueId) await sb.from('discord_content_queue').delete().eq('id', queueId);
    await sb.from('discord_events').delete().contains('metadata', { run_id: runId });
    if (draftId) await sb.from('discord_events').delete().contains('metadata', { draft_id: draftId });
  }
}

async function writeEvidence(evidence: unknown) {
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(path.join(evidenceDir, 'content-jobs-v2-smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await writeEvidence(evidence);
  console.error(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'content-jobs-v2-smoke.json') }, null, 2));
  process.exit(1);
});
