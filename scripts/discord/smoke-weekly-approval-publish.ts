import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { reviewDiscordContentDraft } from '@/lib/discord/content-approval';
import { createWeeklyRecapDraft, discordWeekKey, publishApprovedWeeklyRecapDraft } from '@/lib/discord/weekly-automation';

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

async function discordApi<T>(pathName: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${pathName}`, {
    ...init,
    headers: {
      authorization: `Bot ${requireEnv('DISCORD_BOT_TOKEN')}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (response.status === 429) {
    const retryAfter = parseRetryAfter(text);
    await new Promise((resolve) => setTimeout(resolve, retryAfter));
    return discordApi<T>(pathName, init);
  }
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${pathName} ${response.status}: ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

function parseRetryAfter(body: string): number {
  try {
    const parsed = JSON.parse(body) as { retry_after?: number };
    return Math.ceil((Number(parsed.retry_after) || 5) * 1000) + 500;
  } catch {
    return 5500;
  }
}

async function findChannelId(baseName: string): Promise<string> {
  const channels = await discordApi<Array<{ id: string; name: string }>>(`/guilds/${requireEnv('DISCORD_GUILD_ID')}/channels`);
  const channel = channels.find((item) => baseDiscordName(item.name) === baseName);
  if (!channel) throw new Error(`Channel not found: ${baseName}`);
  return channel.id;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const now = new Date('2099-01-28T12:00:00.000Z');
  const weekKey = discordWeekKey(now);
  const source = 'smoke-weekly-approval-publish';
  let messageDeleted = false;

  await cleanup(sb, weekKey, source);

  const draft = await createWeeklyRecapDraft({
    now,
    metadata: { smoke: true, source, week_key: weekKey },
  });
  await reviewDiscordContentDraft({
    draftId: draft.draftId,
    status: 'approved',
    reviewerEmail: 'smoke@test.local',
    note: 'Smoke approval for weekly recap publish proof.',
  });
  const first = await publishApprovedWeeklyRecapDraft({ now, source });
  const second = await publishApprovedWeeklyRecapDraft({ now, source });

  const [{ data: draftRow }, { data: runRow }, { data: eventRows }, { data: snapshotRow }] = await Promise.all([
    sb.from('discord_content_drafts').select('id, status, target_channel_base_name, published_message_id, reviewer_email, metadata').eq('id', draft.draftId).maybeSingle(),
    sb.from('discord_scheduled_runs').select('run_key, kind, status, message_id, metadata').eq('run_key', `weekly-recap-${weekKey}`).maybeSingle(),
    sb.from('discord_events').select('id, event_type, command_name').eq('command_name', source),
    sb.from('discord_leaderboard_snapshots').select('id, period_key').eq('id', draft.leaderboardSnapshotId).maybeSingle(),
  ]);

  if (first.messageId) {
    const channelId = await findChannelId('wins-showcase');
    await discordApi(`/channels/${channelId}/messages/${first.messageId}`, { method: 'DELETE' });
    messageDeleted = true;
  }

  const ok = draft.ok
    && first.ok
    && first.posted
    && Boolean(first.messageId)
    && second.ok
    && second.skipped
    && second.reason === 'already_published'
    && draftRow?.status === 'published'
    && draftRow?.target_channel_base_name === 'wins-showcase'
    && draftRow?.published_message_id === first.messageId
    && draftRow?.reviewer_email === 'smoke@test.local'
    && runRow?.kind === 'weekly_recap'
    && runRow?.status === 'skipped'
    && (eventRows ?? []).some((row) => row.event_type === 'weekly_recap_posted')
    && snapshotRow?.period_key === weekKey
    && messageDeleted;

  await cleanup(sb, weekKey, source, draft.draftId, draft.leaderboardSnapshotId);

  const evidence = {
    ok,
    cleanedUp: true,
    messageDeleted,
    weekKey,
    draft,
    first,
    second,
    draftRow,
    runRow,
    eventCount: eventRows?.length ?? 0,
    snapshotRow,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'weekly-approval-publish-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

async function cleanup(sb: SupabaseClient, weekKey: string, source: string, draftId?: string, snapshotId?: string) {
  await Promise.all([
    draftId
      ? sb.from('discord_content_drafts').delete().eq('id', draftId)
      : sb.from('discord_content_drafts').delete().contains('metadata', { source }),
    snapshotId
      ? sb.from('discord_leaderboard_snapshots').delete().eq('id', snapshotId)
      : sb.from('discord_leaderboard_snapshots').delete().eq('period_key', weekKey),
    sb.from('discord_scheduled_runs').delete().eq('run_key', `weekly-recap-${weekKey}`),
    sb.from('discord_events').delete().eq('command_name', source),
  ]);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'weekly-approval-publish-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
