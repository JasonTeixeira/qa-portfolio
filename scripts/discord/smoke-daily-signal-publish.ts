import { createClient } from '@supabase/supabase-js';
import { publishApprovedDailySignalDraft } from '../../lib/discord/daily-planner';

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
  const date = new Date('2099-01-04T12:00:00.000Z');
  const dateKey = date.toISOString().slice(0, 10);
  const runKey = `daily-signal-${dateKey}`;
  await sb.from('discord_content_drafts').delete().eq('draft_type', 'daily_signal').contains('metadata', { planner_date: dateKey });
  await sb.from('discord_scheduled_runs').delete().eq('run_key', runKey);

  const { data: draft, error } = await sb.from('discord_content_drafts').insert({
    draft_type: 'daily_signal',
    target_channel_base_name: 'daily-signal',
    title: `Smoke Daily Signal - ${dateKey}`,
    body: [
      '# Daily Signal',
      '**Theme:** Smoke test',
      '**Build prompt:** Verify the scheduler can publish an approved draft exactly once.',
      '**AI/tool pattern:** Approval gates keep generated posts out of public channels until reviewed.',
      '**Question:** What should never auto-post without approval?',
      '**Quiz:** What protects quality?',
      'Options: Approval gate / Random posting / No logs / Longer prompt',
      '**Challenge:** Scheduler proof',
      'Deliverable: Confirm the approved draft publishes once and the second run skips.',
    ].join('\n'),
    citations: [],
    model: 'smoke',
    prompt_version: 'smoke-daily-signal-publish',
    quality_score: 100,
    status: 'approved',
    metadata: {
      planner_date: dateKey,
      smoke: true,
      source: 'smoke-daily-signal-publish',
    },
  }).select('id').single();
  if (error) throw new Error(error.message);

  const first = await publishApprovedDailySignalDraft({ date, source: 'smoke-daily-signal-publish' });
  const second = await publishApprovedDailySignalDraft({ date, source: 'smoke-daily-signal-publish' });
  const channelId = await findChannelId('daily-signal');
  if (first.messageId) {
    await discordApi(`/channels/${channelId}/messages/${first.messageId}`, { method: 'DELETE' });
  }
  await sb.from('discord_content_drafts').delete().eq('id', draft.id);
  await sb.from('discord_scheduled_runs').delete().eq('run_key', runKey);
  await sb.from('discord_events').delete().eq('command_name', 'smoke-daily-signal-publish');

  const ok = first.ok
    && first.posted
    && Boolean(first.messageId)
    && second.ok
    && second.skipped
    && second.reason === 'already_published'
    && second.messageId === first.messageId;

  console.log(JSON.stringify({ ok, cleanedUp: true, first, second, draftId: draft.id }, null, 2));
  if (!ok) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
