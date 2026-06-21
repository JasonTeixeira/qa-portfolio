import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { classifyDiscordMessage } from '../../lib/discord/message-classifier';
import { buildContentQueueCandidate } from '../../lib/discord/content-queue-automation';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const messageId = `content-queue-smoke-${Date.now()}`;
  const content = 'How do I turn a Discord question into a daily post, a mini lesson, and a reusable resource for beginners?';

  await sb.from('discord_messages').upsert({
    discord_message_id: messageId,
    guild_id: 'content-queue-smoke',
    channel_id: 'content-queue-smoke',
    channel_base_name: 'questions-to-content',
    author_user_id: 'content-queue-smoke-user',
    author_username: 'content-queue-smoke',
    author_bot: false,
    content,
    detected_kind: 'question',
    link_count: 0,
    attachment_count: 0,
    captured_at: startedAt,
    raw: { smoke: true },
    updated_at: startedAt,
  }, { onConflict: 'discord_message_id' });

  const classification = classifyDiscordMessage({
    discordMessageId: messageId,
    channelBaseName: 'questions-to-content',
    authorBot: false,
    content,
    detectedKind: 'question',
  });
  await sb.from('discord_message_classifications').upsert(classification, { onConflict: 'discord_message_id' });

  const candidate = buildContentQueueCandidate({
    discord_message_id: messageId,
    channel_base_name: 'questions-to-content',
    author_user_id: 'content-queue-smoke-user',
    author_username: 'content-queue-smoke',
    content,
    category: classification.category,
    recommended_action: classification.recommended_action,
    confidence: classification.confidence,
    quality_score: classification.quality_score,
    content_value_score: classification.content_value_score,
    signals: classification.signals,
    rationale: classification.rationale,
  });
  if (!candidate) throw new Error('Expected content queue candidate');

  const { error: queueError } = await sb
    .from('discord_content_queue')
    .insert(candidate);
  if (queueError) throw queueError;

  const { data, error } = await sb
    .from('discord_content_queue')
    .select('*')
    .eq('source_message_id', messageId)
    .single();
  if (error) throw error;

  await sb.from('discord_messages').delete().eq('discord_message_id', messageId);

  const evidence = {
    ok: data.source === 'discord_message_classifier' && data.status === 'captured' && Number(data.priority) > 0,
    messageId,
    queueItem: data,
    cleanedUp: true,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'content-queue-automation-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const serializedError = error instanceof Error
    ? error.message
    : typeof error === 'object' && error
      ? JSON.stringify(error)
      : String(error);
  const evidence = {
    ok: false,
    error: serializedError,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'content-queue-automation-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
