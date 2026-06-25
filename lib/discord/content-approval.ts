import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/server';
import { evaluateAndPersistDiscordContentDraft, latestPassingContentDraftEvaluation } from './content-quality';

export type DiscordContentDraftStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'archived';

export type DiscordContentDraftInput = {
  contentQueueId?: string | null;
  sourceMessageId?: string | null;
  draftType: 'daily_signal' | 'quiz' | 'challenge' | 'resource_drop' | 'weekly_recap' | 'social_post' | 'lesson' | 'announcement';
  targetChannelBaseName: string;
  title?: string | null;
  body: string;
  citations?: unknown[];
  model?: string | null;
  promptVersion?: string | null;
  qualityScore?: number;
  status?: DiscordContentDraftStatus;
  metadata?: Record<string, unknown>;
};

export const DISCORD_CONTENT_DRAFT_MIN_PUBLIC_SCORE = 80;

export function normalizeDiscordContentDraft(input: DiscordContentDraftInput) {
  const body = input.body.replace(/\\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!body) throw new Error('Draft body is required.');
  const targetChannelBaseName = input.targetChannelBaseName.trim() || 'daily-signal';
  const row = {
    content_queue_id: input.contentQueueId ?? null,
    source_message_id: input.sourceMessageId ?? null,
    draft_type: input.draftType,
    target_channel_base_name: targetChannelBaseName,
    title: cleanOptional(input.title),
    body,
    citations: input.citations ?? [],
    model: cleanOptional(input.model),
    prompt_version: cleanOptional(input.promptVersion),
    quality_score: Math.max(0, Math.min(100, Math.round(input.qualityScore ?? 0))),
    status: input.status ?? 'pending_approval',
    metadata: input.metadata ?? {},
    updated_at: new Date().toISOString(),
  };
  assertPublicDraftMeetsQualityGate(row);
  return row;
}

export async function createDiscordContentDraft(
  input: DiscordContentDraftInput,
  sb: SupabaseClient<any> = supabaseAdmin(),
): Promise<{ id: string }> {
  const { data, error } = await sb
    .from('discord_content_drafts')
    .insert(normalizeDiscordContentDraft(input))
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  return { id: String(data.id) };
}

export async function reviewDiscordContentDraft(input: {
  draftId: string;
  status: Extract<DiscordContentDraftStatus, 'approved' | 'rejected' | 'archived'>;
  reviewerUserId?: string | null;
  reviewerEmail?: string | null;
  note?: string | null;
}): Promise<void> {
  if (input.status === 'approved') {
    const hasPassingEval = await latestPassingContentDraftEvaluation(input.draftId);
    if (!hasPassingEval) {
      const evaluation = await evaluateAndPersistDiscordContentDraft(input.draftId);
      if (!evaluation.passed) {
        throw new Error(`Content draft failed quality evaluation: ${evaluation.reasons.join('; ') || `score ${evaluation.score}`}`);
      }
    }
  }

  const { error } = await supabaseAdmin()
    .from('discord_content_drafts')
    .update({
      status: input.status,
      reviewer_user_id: input.reviewerUserId ?? null,
      reviewer_email: input.reviewerEmail ?? null,
      review_note: cleanOptional(input.note),
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.draftId)
    .in('status', ['draft', 'pending_approval', 'approved', 'rejected']);
  if (error) throw new Error(error.message);
}

function cleanOptional(value?: string | null): string | null {
  const cleaned = String(value ?? '').trim();
  return cleaned ? cleaned : null;
}

function assertPublicDraftMeetsQualityGate(row: {
  draft_type: DiscordContentDraftInput['draftType'];
  status: DiscordContentDraftStatus;
  quality_score: number;
  metadata: Record<string, unknown>;
}) {
  if (!isPublicReviewStatus(row.status) || !isPublicGeneratedDraftType(row.draft_type)) return;
  const policyPassed = row.metadata.policy_passed;
  if (row.quality_score < DISCORD_CONTENT_DRAFT_MIN_PUBLIC_SCORE) {
    throw new Error(`Content draft blocked by quality gate: score ${row.quality_score} is below ${DISCORD_CONTENT_DRAFT_MIN_PUBLIC_SCORE}.`);
  }
  if (policyPassed === false) {
    throw new Error('Content draft blocked by policy gate.');
  }
}

function isPublicReviewStatus(status: DiscordContentDraftStatus): boolean {
  return ['pending_approval', 'approved', 'published'].includes(status);
}

function isPublicGeneratedDraftType(draftType: DiscordContentDraftInput['draftType']): boolean {
  return ['daily_signal', 'quiz', 'challenge', 'resource_drop', 'weekly_recap', 'social_post', 'lesson', 'announcement'].includes(draftType);
}
