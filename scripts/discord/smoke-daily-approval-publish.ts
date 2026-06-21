import { createClient } from '@supabase/supabase-js';
import { publishApprovedDailySignalDraft } from '@/lib/discord/daily-planner';
import { reviewDiscordContentDraft } from '@/lib/discord/content-approval';

const API = 'https://discord.com/api/v10';

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function baseDiscordName(name: string): string {
  return name.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '');
}

async function discordApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bot ${requireEnv('DISCORD_BOT_TOKEN')}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} ${response.status}: ${text}`);
  return (text ? JSON.parse(text) : null) as T;
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
  const date = new Date('2099-01-05T12:00:00.000Z');
  const dateKey = date.toISOString().slice(0, 10);
  const runKey = `daily-signal-${dateKey}`;
  const source = 'smoke-daily-approval-publish';

  await sb.from('discord_content_drafts').delete().eq('draft_type', 'daily_signal').contains('metadata', { planner_date: dateKey });
  await sb.from('discord_scheduled_runs').delete().eq('run_key', runKey);
  await sb.from('discord_events').delete().eq('command_name', source);

  const body = [
    '# Daily Signal',
    '**Theme:** Approval proof',
    '**Build prompt:** Build a small approval gate that prevents generated content from posting until reviewed.',
    '**AI/tool pattern:** Evaluate the draft, approve it through the review path, then publish only the approved row.',
    '**News-to-action:** No approved news item today.',
    '**Question:** Where should a generated post stop before it becomes public?',
    '**Quiz:** What protects public channel quality?',
    'Options: Manual approval / Blind autoposting / Deleted logs / Random prompts',
    '**Challenge:** Approval path proof',
    'Deliverable: Document the pending draft, approval review, publish result, and cleanup result.',
  ].join('\n');

  const { data: draft, error } = await sb.from('discord_content_drafts').insert({
    draft_type: 'daily_signal',
    target_channel_base_name: 'daily-signal',
    title: `Smoke Approval Daily Signal - ${dateKey}`,
    body,
    citations: [],
    model: 'smoke',
    prompt_version: source,
    quality_score: 0,
    status: 'pending_approval',
    metadata: {
      planner_date: dateKey,
      smoke: true,
      source,
    },
  }).select('id, status').single();
  if (error) throw new Error(error.message);

  await reviewDiscordContentDraft({
    draftId: draft.id,
    status: 'approved',
    reviewerEmail: 'smoke@test.local',
    note: 'Smoke approval for daily signal publish proof.',
  });

  const { data: approved, error: readError } = await sb
    .from('discord_content_drafts')
    .select('id, status, quality_score, reviewer_email')
    .eq('id', draft.id)
    .single();
  if (readError) throw new Error(readError.message);
  if (approved.status !== 'approved') throw new Error(`Expected approved draft, got ${approved.status}`);

  const first = await publishApprovedDailySignalDraft({ date, source });
  const second = await publishApprovedDailySignalDraft({ date, source });
  const channelId = await findChannelId('daily-signal');
  if (first.messageId) {
    await discordApi(`/channels/${channelId}/messages/${first.messageId}`, { method: 'DELETE' });
  }

  await sb.from('discord_content_draft_evaluations').delete().eq('draft_id', draft.id);
  await sb.from('discord_content_drafts').delete().eq('id', draft.id);
  await sb.from('discord_scheduled_runs').delete().eq('run_key', runKey);
  await sb.from('discord_events').delete().eq('command_name', source);

  const ok = first.ok
    && first.posted
    && Boolean(first.messageId)
    && second.ok
    && second.skipped
    && second.reason === 'already_published'
    && approved.reviewer_email === 'smoke@test.local'
    && Number(approved.quality_score) >= 80;

  console.log(JSON.stringify({
    ok,
    cleanedUp: true,
    draftId: draft.id,
    approved,
    first,
    second,
  }, null, 2));
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
