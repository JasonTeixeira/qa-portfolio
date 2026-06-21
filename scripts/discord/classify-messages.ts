import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { classifyDiscordMessage } from '../../lib/discord/message-classifier';

type SupabaseClient = ReturnType<typeof createClient<any>>;

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function argValue(name: string): string | null {
  const prefix = `--${name}=`;
  const item = process.argv.find((arg) => arg.startsWith(prefix));
  return item ? item.slice(prefix.length).trim() : null;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const limit = Math.max(1, Math.min(1000, Number(argValue('limit') ?? 250)));
  const messageId = argValue('message-id');
  const dryRun = process.argv.includes('--dry-run');

  const messages = await loadMessages(sb, { limit, messageId });
  const classifications = messages.map((message: any) => classifyDiscordMessage({
    discordMessageId: String(message.discord_message_id),
    channelBaseName: message.channel_base_name ? String(message.channel_base_name) : null,
    authorBot: Boolean(message.author_bot),
    content: String(message.content ?? ''),
    detectedKind: message.detected_kind ? String(message.detected_kind) : null,
    linkCount: Number(message.link_count ?? 0),
    attachmentCount: Number(message.attachment_count ?? 0),
    referencedMessageId: message.referenced_message_id ? String(message.referenced_message_id) : null,
  }));

  if (classifications.length && !dryRun) {
    const { error } = await sb
      .from('discord_message_classifications')
      .upsert(classifications, { onConflict: 'discord_message_id' });
    if (error) throw error;
  }

  const summary = summarize(classifications);
  const evidence = {
    ok: true,
    dryRun,
    messageId,
    limit,
    messagesSeen: messages.length,
    classificationsUpserted: dryRun ? 0 : classifications.length,
    summary,
    sample: classifications.slice(0, 10),
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'message-classifier-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
}

async function loadMessages(sb: SupabaseClient, input: { limit: number; messageId: string | null }) {
  let query = sb
    .from('discord_messages')
    .select('discord_message_id, channel_base_name, author_bot, content, detected_kind, link_count, attachment_count, referenced_message_id, captured_at')
    .is('deleted_at', null)
    .neq('content', '')
    .order('captured_at', { ascending: false })
    .limit(input.limit);
  if (input.messageId) query = query.eq('discord_message_id', input.messageId);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

function summarize(classifications: ReturnType<typeof classifyDiscordMessage>[]) {
  return classifications.reduce((acc, item) => {
    acc.byCategory[item.category] = (acc.byCategory[item.category] ?? 0) + 1;
    acc.byAction[item.recommended_action] = (acc.byAction[item.recommended_action] ?? 0) + 1;
    acc.avgQuality = Math.round(((acc.avgQuality * acc.count) + item.quality_score) / (acc.count + 1));
    acc.avgContentValue = Math.round(((acc.avgContentValue * acc.count) + item.content_value_score) / (acc.count + 1));
    acc.count += 1;
    return acc;
  }, {
    count: 0,
    byCategory: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    avgQuality: 0,
    avgContentValue: 0,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
