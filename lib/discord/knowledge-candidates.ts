import type { SupabaseClient } from '@supabase/supabase-js';
import { runApprovedDiscordRagSourceSync, type RagSourceSyncResult } from '@/lib/rag/discord-source-sync';
import { buildContentQueueCandidate } from './content-queue-automation';
import { classifyDiscordMessage, type DiscordMessageClassification } from './message-classifier';
import type { NormalizedDiscordMessage } from './gateway-ingestion';

export type KnowledgeCandidateDecision = 'question' | 'answer' | 'resource' | 'content' | 'review' | 'win' | 'reject';

export type KnowledgeCandidateCaptureResult = {
  classification: DiscordMessageClassification;
  queued: boolean;
  queueId: string | null;
  reason: string | null;
};

export type KnowledgeCandidatePromotionResult = {
  ok: boolean;
  decision: KnowledgeCandidateDecision;
  queueId: string;
  sourceId: string | null;
  sourceType: 'discord_question' | 'discord_answer' | 'discord_content_queue' | null;
  ragSync: RagSourceSyncResult | null;
  reason?: string;
};

export async function captureDiscordKnowledgeCandidateFromMessage(
  sb: SupabaseClient<any>,
  message: NormalizedDiscordMessage,
): Promise<KnowledgeCandidateCaptureResult> {
  const classification = classifyDiscordMessage({
    discordMessageId: message.discordMessageId,
    channelBaseName: message.channelBaseName,
    authorBot: message.authorBot,
    content: message.content,
    detectedKind: message.detectedKind,
    linkCount: message.linkCount,
    attachmentCount: message.attachmentCount,
    referencedMessageId: message.referencedMessageId,
  });

  const { error: classError } = await sb
    .from('discord_message_classifications')
    .upsert(classification, { onConflict: 'discord_message_id' });
  if (classError) throw classError;

  const candidate = buildContentQueueCandidate({
    discord_message_id: message.discordMessageId,
    channel_base_name: message.channelBaseName,
    author_user_id: message.authorUserId,
    author_username: message.authorUsername,
    content: message.content,
    category: classification.category,
    recommended_action: classification.recommended_action,
    confidence: classification.confidence,
    quality_score: classification.quality_score,
    content_value_score: classification.content_value_score,
    signals: classification.signals,
    rationale: classification.rationale,
  });
  if (!candidate) {
    return {
      classification,
      queued: false,
      queueId: null,
      reason: `Classification action ${classification.recommended_action} is not queueable.`,
    };
  }

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
    return { classification, queued: true, queueId: existing.id, reason: 'updated_existing_candidate' };
  }

  const { data, error } = await sb
    .from('discord_content_queue')
    .insert(candidate)
    .select('id')
    .single();
  if (error) throw error;
  return { classification, queued: true, queueId: data.id, reason: 'created_candidate' };
}

export async function promoteKnowledgeCandidateForRag(
  sb: SupabaseClient<any>,
  input: {
    queueId: string;
    decision: KnowledgeCandidateDecision;
    reviewer: string;
  },
): Promise<KnowledgeCandidatePromotionResult> {
  const { data: queue, error } = await sb
    .from('discord_content_queue')
    .select('id, source_message_id, discord_user_id, discord_username, channel_base_name, idea, angle, status, metadata')
    .eq('id', input.queueId)
    .single();
  if (error) throw error;
  if (!queue) throw new Error('Knowledge candidate not found.');

  if (input.decision === 'reject') {
    await updateQueueDecision(sb, queue, input, { status: 'archived' });
    return {
      ok: true,
      decision: input.decision,
      queueId: input.queueId,
      sourceId: null,
      sourceType: null,
      ragSync: null,
      reason: 'candidate_rejected',
    };
  }

  if (input.decision === 'question') {
    const sourceId = await promoteAsQuestion(sb, queue, input.reviewer);
    const ragSync = await runApprovedDiscordRagSourceSync(sb, { trigger: 'admin_candidate_approval' });
    return { ok: true, decision: input.decision, queueId: input.queueId, sourceId, sourceType: 'discord_question', ragSync };
  }

  if (input.decision === 'answer') {
    const sourceId = await promoteAsAnswer(sb, queue, input.reviewer);
    const ragSync = await runApprovedDiscordRagSourceSync(sb, { trigger: 'admin_candidate_approval' });
    return { ok: true, decision: input.decision, queueId: input.queueId, sourceId, sourceType: 'discord_answer', ragSync };
  }

  const sourceId = await promoteAsPublishedQueueItem(sb, queue, input);
  const ragSync = await runApprovedDiscordRagSourceSync(sb, { trigger: 'admin_candidate_approval' });
  return { ok: true, decision: input.decision, queueId: input.queueId, sourceId, sourceType: 'discord_content_queue', ragSync };
}

async function promoteAsQuestion(sb: SupabaseClient<any>, queue: any, reviewer: string): Promise<string> {
  const existing = await findExistingByMessage(sb, 'discord_questions', queue.source_message_id);
  if (existing) return existing.id;
  const { data, error } = await sb
    .from('discord_questions')
    .insert({
      discord_user_id: queue.discord_user_id ?? 'unknown',
      discord_username: queue.discord_username ?? 'unknown',
      question: sourceBody(queue),
      context: `Promoted from Discord capture candidate ${queue.id}.`,
      status: 'closed',
      channel_base_name: queue.channel_base_name ?? 'content-queue',
      message_id: queue.source_message_id,
    })
    .select('id')
    .single();
  if (error) throw error;
  await updateQueueDecision(sb, queue, { queueId: queue.id, decision: 'question', reviewer }, { status: 'triaged', sourceId: data.id });
  return data.id;
}

async function promoteAsAnswer(sb: SupabaseClient<any>, queue: any, reviewer: string): Promise<string> {
  const existing = await findExistingByMessage(sb, 'discord_answers', queue.source_message_id);
  if (existing) return existing.id;

  const { data: question, error: questionError } = await sb
    .from('discord_questions')
    .insert({
      discord_user_id: queue.discord_user_id ?? 'unknown',
      discord_username: queue.discord_username ?? 'unknown',
      question: `Context for approved Discord answer from ${queue.discord_username ?? queue.discord_user_id ?? 'member'}`,
      context: `Auto-created so this approved answer can enter authoritative RAG. Candidate: ${queue.id}.`,
      status: 'answered',
      channel_base_name: queue.channel_base_name ?? 'content-queue',
      message_id: `context:${queue.source_message_id ?? queue.id}`,
    })
    .select('id')
    .single();
  if (questionError) throw questionError;

  const { data, error } = await sb
    .from('discord_answers')
    .insert({
      question_id: question.id,
      discord_user_id: queue.discord_user_id ?? 'unknown',
      discord_username: queue.discord_username ?? 'unknown',
      answer: sourceBody(queue),
      helpful: true,
      helpful_by_discord_username: reviewer,
      points_awarded: 0,
      message_id: queue.source_message_id,
    })
    .select('id')
    .single();
  if (error) throw error;
  await updateQueueDecision(sb, queue, { queueId: queue.id, decision: 'answer', reviewer }, { status: 'triaged', sourceId: data.id });
  return data.id;
}

async function promoteAsPublishedQueueItem(sb: SupabaseClient<any>, queue: any, input: { decision: KnowledgeCandidateDecision; reviewer: string }): Promise<string> {
  await updateQueueDecision(sb, queue, { queueId: queue.id, decision: input.decision, reviewer: input.reviewer }, { status: 'published', sourceId: queue.id });
  return queue.id;
}

async function findExistingByMessage(sb: SupabaseClient<any>, table: 'discord_questions' | 'discord_answers', messageId: string | null): Promise<{ id: string } | null> {
  if (!messageId) return null;
  const { data, error } = await sb.from(table).select('id').eq('message_id', messageId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

async function updateQueueDecision(
  sb: SupabaseClient<any>,
  queue: any,
  input: { queueId: string; decision: KnowledgeCandidateDecision; reviewer: string },
  patch: { status: 'captured' | 'triaged' | 'drafted' | 'published' | 'archived'; sourceId?: string | null },
): Promise<void> {
  const metadata = {
    ...(typeof queue.metadata === 'object' && queue.metadata ? queue.metadata : {}),
    knowledge_candidate: {
      decision: input.decision,
      reviewer: input.reviewer,
      reviewed_at: new Date().toISOString(),
      promoted_source_id: patch.sourceId ?? null,
    },
  };
  const { error } = await sb
    .from('discord_content_queue')
    .update({ status: patch.status, metadata, updated_at: new Date().toISOString() })
    .eq('id', input.queueId);
  if (error) throw error;
}

function sourceBody(queue: any): string {
  const preview = typeof queue.metadata?.source_content_preview === 'string' ? queue.metadata.source_content_preview : '';
  return preview || [queue.idea, queue.angle].filter(Boolean).join('\n\n').trim();
}
