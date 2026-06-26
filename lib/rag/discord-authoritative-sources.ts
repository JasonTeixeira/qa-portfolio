import type { RagSourceInput, RagSourceType } from './source-normalizer';

export const DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION = 'discord-authoritative-rag-sync-v1';

type SupabaseLike = {
  from(table: string): any;
};

export type DiscordAuthoritativeSyncStats = {
  questionsSeen: number;
  questionsApproved: number;
  answersSeen: number;
  answersApproved: number;
  contentQueueSeen: number;
  contentQueueApproved: number;
  contentDraftsSeen: number;
  contentDraftsApproved: number;
};

export async function collectApprovedDiscordRagInputs(sb: SupabaseLike): Promise<{ inputs: RagSourceInput[]; stats: DiscordAuthoritativeSyncStats }> {
  const [questions, answers, queue, drafts] = await Promise.all([
    approvedDiscordQuestionInputs(sb),
    approvedDiscordAnswerInputs(sb),
    approvedDiscordContentQueueInputs(sb),
    approvedDiscordContentDraftInputs(sb),
  ]);
  return {
    inputs: [...questions.inputs, ...answers.inputs, ...queue.inputs, ...drafts.inputs],
    stats: {
      questionsSeen: questions.seen,
      questionsApproved: questions.inputs.length,
      answersSeen: answers.seen,
      answersApproved: answers.inputs.length,
      contentQueueSeen: queue.seen,
      contentQueueApproved: queue.inputs.length,
      contentDraftsSeen: drafts.seen,
      contentDraftsApproved: drafts.inputs.length,
    },
  };
}

export function isApprovedDiscordQuestion(row: { status?: string | null }): boolean {
  return ['answered', 'closed'].includes(String(row.status ?? '').toLowerCase());
}

export function isApprovedDiscordAnswer(row: { helpful?: boolean | null }): boolean {
  return row.helpful === true;
}

export function isApprovedDiscordContentQueue(row: { status?: string | null }): boolean {
  return String(row.status ?? '').toLowerCase() === 'published';
}

export function hasDiscordContentDraftProvenance(row: {
  content_queue_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  const metadata = row.metadata ?? {};
  const sourceTable = String(metadata.source_table ?? metadata.sourceTable ?? '').toLowerCase();
  return Boolean(row.content_queue_id)
    || Boolean(metadata.content_queue_id)
    || ['discord_questions', 'discord_answers', 'discord_content_queue'].includes(sourceTable);
}

export function isApprovedDiscordContentDraft(row: {
  status?: string | null;
  quality_score?: number | null;
  content_queue_id?: string | null;
  metadata?: Record<string, unknown> | null;
}): boolean {
  return ['approved', 'published'].includes(String(row.status ?? '').toLowerCase())
    && Number(row.quality_score ?? 0) >= 80
    && row.metadata?.policy_passed !== false
    && hasDiscordContentDraftProvenance(row);
}

export function sourceTypeForApprovedDiscordDraft(draftType?: string | null): RagSourceType {
  switch (String(draftType ?? '').toLowerCase()) {
    case 'lesson':
      return 'lesson';
    case 'resource_drop':
    case 'weekly_recap':
      return 'resource';
    default:
      return 'admin_note';
  }
}

async function approvedDiscordQuestionInputs(sb: SupabaseLike): Promise<{ inputs: RagSourceInput[]; seen: number }> {
  const { data, error } = await sb
    .from('discord_questions')
    .select('id, discord_user_id, discord_username, question, context, status, channel_base_name, message_id, created_at')
    .limit(1000);
  if (error) throw error;
  const rows = data ?? [];
  return {
    seen: rows.length,
    inputs: rows.filter(isApprovedDiscordQuestion).map((row: any) => ({
      sourceType: 'discord_question',
      externalId: row.id,
      title: `Approved Discord question: ${String(row.question).slice(0, 80)}`,
      body: [row.question, row.context].filter(Boolean).join('\n\nContext:\n'),
      sourceTable: 'discord_questions',
      sourceRecordId: row.id,
      authorUserId: row.discord_user_id,
      authorName: row.discord_username,
      channelBaseName: row.channel_base_name,
      sourceCreatedAt: row.created_at,
      qualityScore: row.status === 'answered' ? 80 : 75,
      metadata: {
        approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
        status: row.status,
        message_id: row.message_id,
        approved_for_rag: true,
      },
    })),
  };
}

async function approvedDiscordAnswerInputs(sb: SupabaseLike): Promise<{ inputs: RagSourceInput[]; seen: number }> {
  const { data, error } = await sb
    .from('discord_answers')
    .select('id, question_id, discord_user_id, discord_username, answer, helpful, points_awarded, message_id, created_at')
    .limit(1000);
  if (error) throw error;
  const rows = data ?? [];
  return {
    seen: rows.length,
    inputs: rows.filter(isApprovedDiscordAnswer).map((row: any) => ({
      sourceType: 'discord_answer',
      externalId: row.id,
      title: 'Helpful Discord answer',
      body: row.answer,
      sourceTable: 'discord_answers',
      sourceRecordId: row.id,
      authorUserId: row.discord_user_id,
      authorName: row.discord_username,
      sourceCreatedAt: row.created_at,
      qualityScore: 90,
      metadata: {
        approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
        question_id: row.question_id,
        helpful: row.helpful,
        points_awarded: row.points_awarded,
        message_id: row.message_id,
        approved_for_rag: true,
      },
    })),
  };
}

async function approvedDiscordContentQueueInputs(sb: SupabaseLike): Promise<{ inputs: RagSourceInput[]; seen: number }> {
  const { data, error } = await sb
    .from('discord_content_queue')
    .select('id, source, discord_user_id, discord_username, channel_base_name, idea, angle, status, priority, created_at, metadata')
    .limit(1000);
  if (error) throw error;
  const rows = data ?? [];
  return {
    seen: rows.length,
    inputs: rows.filter(isApprovedDiscordContentQueue).map((row: any) => ({
      sourceType: 'discord_content_queue',
      externalId: row.id,
      title: `Published content queue: ${String(row.idea).slice(0, 80)}`,
      body: [row.idea, row.angle].filter(Boolean).join('\n\nAngle:\n'),
      sourceTable: 'discord_content_queue',
      sourceRecordId: row.id,
      authorUserId: row.discord_user_id,
      authorName: row.discord_username,
      channelBaseName: row.channel_base_name,
      sourceCreatedAt: row.created_at,
      qualityScore: row.priority,
      metadata: {
        approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
        source: row.source,
        status: row.status,
        metadata: row.metadata,
        approved_for_rag: true,
      },
    })),
  };
}

async function approvedDiscordContentDraftInputs(sb: SupabaseLike): Promise<{ inputs: RagSourceInput[]; seen: number }> {
  const { data, error } = await sb
    .from('discord_content_drafts')
    .select('id, content_queue_id, draft_type, target_channel_base_name, title, body, citations, model, prompt_version, quality_score, status, reviewer_email, reviewed_at, published_message_id, metadata, created_at')
    .limit(1000);
  if (error) throw error;
  const rows = data ?? [];
  return {
    seen: rows.length,
    inputs: rows.filter(isApprovedDiscordContentDraft).map((row: any) => ({
      sourceType: sourceTypeForApprovedDiscordDraft(row.draft_type),
      externalId: `discord_content_draft:${row.id}`,
      title: row.title ?? `Approved Discord ${row.draft_type}`,
      body: row.body,
      sourceTable: 'discord_content_drafts',
      sourceRecordId: row.id,
      channelBaseName: row.target_channel_base_name,
      sourceCreatedAt: row.reviewed_at ?? row.created_at,
      qualityScore: row.quality_score,
      metadata: {
        approval_policy: DISCORD_AUTHORITATIVE_RAG_SYNC_VERSION,
        original_source_type: 'discord_content_draft',
        draft_type: row.draft_type,
        status: row.status,
        content_queue_id: row.content_queue_id,
        citations: row.citations,
        model: row.model,
        prompt_version: row.prompt_version,
        reviewer_email: row.reviewer_email,
        published_message_id: row.published_message_id,
        metadata: row.metadata,
        approved_for_rag: true,
      },
    })),
  };
}
