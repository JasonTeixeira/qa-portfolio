import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildContentQueueCandidate } from '../../lib/discord/content-queue-automation';

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

  const rows = await loadClassifiedMessages(sb, { limit, messageId });
  const candidates = rows.map(buildContentQueueCandidate).filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (candidates.length && !dryRun) {
    for (const candidate of candidates) {
      await upsertContentQueueCandidate(sb, candidate);
    }
  }

  const evidence = {
    ok: true,
    dryRun,
    messageId,
    limit,
    classifiedMessagesSeen: rows.length,
    candidatesBuilt: candidates.length,
    queueRowsUpserted: dryRun ? 0 : candidates.length,
    byAction: summarize(candidates, 'source_classification_action'),
    byCategory: summarize(candidates, 'source_classification_category'),
    sample: candidates.slice(0, 10),
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'content-queue-automation-run.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
}

async function loadClassifiedMessages(sb: SupabaseClient, input: { limit: number; messageId: string | null }) {
  let query = sb
    .from('discord_message_classifications')
    .select(`
      discord_message_id,
      category,
      recommended_action,
      confidence,
      quality_score,
      content_value_score,
      signals,
      rationale,
      discord_messages!inner(
        channel_base_name,
        author_user_id,
        author_username,
        content,
        deleted_at
      )
    `)
    .in('recommended_action', ['track_question', 'track_answer', 'candidate_content', 'candidate_resource', 'candidate_review', 'candidate_win'])
    .order('classified_at', { ascending: false })
    .limit(input.limit);
  if (input.messageId) query = query.eq('discord_message_id', input.messageId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? [])
    .filter((row: any) => !row.discord_messages?.deleted_at)
    .map((row: any) => ({
      discord_message_id: String(row.discord_message_id),
      channel_base_name: row.discord_messages.channel_base_name ? String(row.discord_messages.channel_base_name) : null,
      author_user_id: row.discord_messages.author_user_id ? String(row.discord_messages.author_user_id) : null,
      author_username: row.discord_messages.author_username ? String(row.discord_messages.author_username) : null,
      content: String(row.discord_messages.content ?? ''),
      category: String(row.category),
      recommended_action: String(row.recommended_action),
      confidence: Number(row.confidence ?? 0),
      quality_score: Number(row.quality_score ?? 0),
      content_value_score: Number(row.content_value_score ?? 0),
      signals: typeof row.signals === 'object' && row.signals ? row.signals : {},
      rationale: String(row.rationale ?? ''),
    }));
}

function summarize<T extends Record<string, unknown>>(items: T[], key: keyof T): Record<string, number> {
  return items.reduce((acc, item) => {
    const value = String(item[key] ?? 'unknown');
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

async function upsertContentQueueCandidate(sb: SupabaseClient, candidate: Record<string, unknown>) {
  const { data: existing, error: existingError } = await sb
    .from('discord_content_queue')
    .select('id')
    .eq('source_message_id', candidate.source_message_id)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error } = await sb
      .from('discord_content_queue')
      .update({ ...candidate, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await sb.from('discord_content_queue').insert(candidate);
  if (error) throw error;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
