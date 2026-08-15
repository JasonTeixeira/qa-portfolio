import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { promoteKnowledgeCandidateForRag } from '../../lib/discord/knowledge-candidates';
import { recordDiscordMessageCreate } from '../../lib/discord/gateway-ingestion';

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
  const messageId = `knowledge-capture-smoke-${Date.now()}`;
  const sourceKey = `discord_content_queue:`;

  let queueId: string | null = null;
  let ragSourceKey: string | null = null;
  try {
    const message = await recordDiscordMessageCreate({
      id: messageId,
      guild_id: 'knowledge-capture-smoke',
      channel_id: 'knowledge-capture-smoke-channel',
      author: { id: 'knowledge-capture-user', username: 'knowledge-capture' },
      content: 'Here is a resource checklist for turning Discord questions into a reusable lesson and RAG source: capture the question, approve the answer, cite the source, and create one action step.',
      timestamp: startedAt,
      attachments: [],
    }, '📚resources');
    if (!message) throw new Error('Expected non-bot message capture.');

    const { data: classification, error: classificationError } = await sb
      .from('discord_message_classifications')
      .select('category, recommended_action, confidence, quality_score')
      .eq('discord_message_id', messageId)
      .single();
    if (classificationError) throw classificationError;

    const { data: queue, error: queueError } = await sb
      .from('discord_content_queue')
      .select('id, status, source, source_message_id')
      .eq('source_message_id', messageId)
      .single();
    if (queueError) throw queueError;
    queueId = String(queue.id);

    const promotion = await promoteKnowledgeCandidateForRag(sb, {
      queueId: String(queue.id),
      decision: 'resource',
      reviewer: 'phase-9-smoke',
    });
    ragSourceKey = `${sourceKey}${queueId}`;

    const { data: ragSource, error: ragSourceError } = await sb
      .from('rag_sources')
      .select('source_key, source_type, source_table, source_record_id')
      .eq('source_key', ragSourceKey)
      .maybeSingle();
    if (ragSourceError) throw ragSourceError;

    const evidence = {
      ok: Boolean(classification && queue && promotion.ok && ragSource?.source_key === ragSourceKey),
      messageId,
      queueId,
      classification,
      promotion: {
        ok: promotion.ok,
        decision: promotion.decision,
        sourceType: promotion.sourceType,
        ragRunKey: promotion.ragSync?.runKey ?? null,
        documentsUpserted: promotion.ragSync?.stats.documentsUpserted ?? null,
      },
      ragSource,
      cleanedUp: true,
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(evidence);
    console.log(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'knowledge-capture-smoke.json') }, null, 2));
    if (!evidence.ok) process.exit(1);
  } finally {
    if (ragSourceKey) await sb.from('rag_sources').delete().eq('source_key', ragSourceKey);
    if (queueId) await sb.from('discord_content_queue').delete().eq('id', queueId);
    await sb.from('discord_messages').delete().eq('discord_message_id', messageId);
    await sb.from('discord_gateway_events').delete().eq('discord_message_id', messageId);
    await sb.from('discord_gateway_dead_letters').delete().contains('payload', { discord_message_id: messageId });
  }
}

async function writeEvidence(evidence: unknown) {
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(path.join(evidenceDir, 'knowledge-capture-smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await writeEvidence(evidence);
  console.error(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'knowledge-capture-smoke.json') }, null, 2));
  process.exit(1);
});
