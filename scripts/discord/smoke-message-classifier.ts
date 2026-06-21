import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { classifyDiscordMessage } from '../../lib/discord/message-classifier';

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
  const messageId = `classifier-smoke-${Date.now()}`;
  const content = 'How should I structure my first AI agent project so it has clear acceptance criteria and can become a useful community lesson?';

  await sb.from('discord_messages').upsert({
    discord_message_id: messageId,
    guild_id: 'classifier-smoke',
    channel_id: 'classifier-smoke',
    channel_base_name: 'questions',
    author_user_id: 'classifier-smoke-user',
    author_username: 'classifier-smoke',
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
    channelBaseName: 'questions',
    authorBot: false,
    content,
    detectedKind: 'question',
  });
  const { error: classError } = await sb
    .from('discord_message_classifications')
    .upsert(classification, { onConflict: 'discord_message_id' });
  if (classError) throw classError;

  const { data, error } = await sb
    .from('discord_message_classifications')
    .select('*')
    .eq('discord_message_id', messageId)
    .single();
  if (error) throw error;

  await sb.from('discord_messages').delete().eq('discord_message_id', messageId);

  const evidence = {
    ok: data.category === 'question' && data.recommended_action === 'track_question' && Number(data.quality_score) > 0,
    messageId,
    classification: data,
    cleanedUp: true,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'message-classifier-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!evidence.ok) process.exit(1);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'message-classifier-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
