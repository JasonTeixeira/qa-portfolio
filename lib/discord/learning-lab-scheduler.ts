import { supabaseAdmin } from '@/lib/supabase/server';
import { recordDiscordEvent, recordDiscordScheduledRun } from './analytics';
import { createLearningLabV2Items, type CreateLearningLabV2Result } from './learning-lab-v2';

export const DISCORD_LEARNING_LAB_SCHEDULER_VERSION = 'discord-learning-lab-scheduler-v1';

export type LearningLabCadence = 'daily' | 'weekly';

export type ScheduledLearningLabDraftResult = {
  ok: boolean;
  skipped: boolean;
  reason?: 'already_exists';
  runKey: string;
  cadence: LearningLabCadence;
  dateKey: string;
  quizKey: string | null;
  challengeKey: string | null;
  quizId: string | null;
  challengeId: string | null;
  qualityScore: number | null;
  sourceIds: string[];
  model: string | null;
};

export type ScheduledLearningLabReviewResult = {
  ok: boolean;
  runKey: string;
  cadence: LearningLabCadence;
  quizKey: string;
  challengeKey: string;
  status: 'approved' | 'rejected';
};

export type ScheduledLearningLabPublishResult = {
  ok: boolean;
  published: boolean;
  skipped: boolean;
  reason?: 'already_published' | 'no_approved_learning_lab_items';
  runKey: string;
  cadence: LearningLabCadence;
  dateKey: string;
  quizKey: string | null;
  challengeKey: string | null;
};

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function learningLabRunKey(input: { cadence: LearningLabCadence; date: Date }): string {
  return `learning-lab-${input.cadence}-${dateKey(input.date)}`;
}

function defaultTopic(cadence: LearningLabCadence): string {
  return cadence === 'weekly'
    ? 'weekly build challenge and skill review'
    : 'daily practical builder quiz and challenge';
}

function workflowMetadata(input: {
  runKey: string;
  cadence: LearningLabCadence;
  workflowStatus: 'pending_approval' | 'approved' | 'rejected' | 'published';
  reviewedBy?: string | null;
  reviewNote?: string | null;
}) {
  return {
    scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
    scheduler_run_key: input.runKey,
    cadence: input.cadence,
    workflow_status: input.workflowStatus,
    reviewed_by: input.reviewedBy ?? null,
    review_note: input.reviewNote ?? null,
  };
}

async function findScheduledItems(runKey: string): Promise<{
  quiz: ScheduledItem | null;
  challenge: ScheduledItem | null;
}> {
  const sb = supabaseAdmin();
  const [quizRes, challengeRes] = await Promise.all([
    sb.from('discord_quizzes')
      .select('id, quiz_key, active, metadata')
      .contains('metadata', { scheduler_run_key: runKey })
      .order('created_at', { ascending: false })
      .limit(1),
    sb.from('discord_challenges')
      .select('id, challenge_key, active, metadata')
      .contains('metadata', { scheduler_run_key: runKey })
      .order('created_at', { ascending: false })
      .limit(1),
  ]);
  if (quizRes.error) throw new Error(quizRes.error.message);
  if (challengeRes.error) throw new Error(challengeRes.error.message);
  return {
    quiz: (quizRes.data?.[0] as ScheduledItem | undefined) ?? null,
    challenge: (challengeRes.data?.[0] as ScheduledItem | undefined) ?? null,
  };
}

type ScheduledItem = {
  id: string;
  quiz_key?: string;
  challenge_key?: string;
  active: boolean;
  metadata: Record<string, unknown> | null;
};

function itemStatus(item: ScheduledItem | null): string | null {
  return typeof item?.metadata?.workflow_status === 'string' ? item.metadata.workflow_status : null;
}

function itemKey(item: ScheduledItem | null): string | null {
  return item?.quiz_key ?? item?.challenge_key ?? null;
}

async function updateItemMetadata(input: {
  table: 'discord_quizzes' | 'discord_challenges';
  id: string;
  metadata: Record<string, unknown>;
  active?: boolean;
}) {
  const patch: Record<string, unknown> = {
    metadata: input.metadata,
  };
  if (input.active !== undefined) patch.active = input.active;
  const { error } = await supabaseAdmin().from(input.table).update(patch).eq('id', input.id);
  if (error) throw new Error(error.message);
}

function mergeWorkflowStatus(
  item: ScheduledItem,
  workflow: ReturnType<typeof workflowMetadata>,
): Record<string, unknown> {
  return {
    ...(item.metadata ?? {}),
    ...workflow,
  };
}

export async function createScheduledLearningLabDraft(input: {
  cadence: LearningLabCadence;
  date?: Date;
  topic?: string | null;
  sourceIds?: string[];
  force?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<ScheduledLearningLabDraftResult> {
  const date = input.date ?? new Date();
  const key = dateKey(date);
  const runKey = learningLabRunKey({ cadence: input.cadence, date });
  const existing = await findScheduledItems(runKey);
  if (!input.force && existing.quiz && existing.challenge) {
    await recordDiscordScheduledRun({
      runKey,
      kind: 'learning_lab',
      status: 'skipped',
      metadata: {
        source: 'learning_lab_scheduler',
        reason: 'already_exists',
        cadence: input.cadence,
        scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
      },
    });
    return {
      ok: true,
      skipped: true,
      reason: 'already_exists',
      runKey,
      cadence: input.cadence,
      dateKey: key,
      quizKey: itemKey(existing.quiz),
      challengeKey: itemKey(existing.challenge),
      quizId: existing.quiz.id,
      challengeId: existing.challenge.id,
      qualityScore: Number(existing.quiz.metadata?.quality_score ?? existing.challenge.metadata?.quality_score ?? 0) || null,
      sourceIds: Array.isArray(existing.quiz.metadata?.source_ids) ? existing.quiz.metadata.source_ids.map(String) : [],
      model: typeof existing.quiz.metadata?.model === 'string' ? existing.quiz.metadata.model : null,
    };
  }

  const result: CreateLearningLabV2Result = await createLearningLabV2Items({
    date,
    topic: input.topic ?? defaultTopic(input.cadence),
    sourceIds: input.sourceIds,
    force: input.force,
    active: false,
    metadata: {
      ...workflowMetadata({ runKey, cadence: input.cadence, workflowStatus: 'pending_approval' }),
      ...(input.metadata ?? {}),
    },
  });

  await recordDiscordScheduledRun({
    runKey,
    kind: 'learning_lab',
    status: 'drafted',
    metadata: {
      source: 'learning_lab_scheduler',
      cadence: input.cadence,
      quiz_key: result.quizKey,
      challenge_key: result.challengeKey,
      quality_score: result.qualityScore,
      source_ids: result.sourceIds,
      scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
    },
  });
  await recordDiscordEvent({
    eventType: 'learning_lab_scheduled_draft_created',
    commandName: 'learning_lab_scheduler',
    channelBaseName: 'daily-signal',
    metadata: {
      run_key: runKey,
      cadence: input.cadence,
      quiz_key: result.quizKey,
      challenge_key: result.challengeKey,
    },
  });

  return {
    ok: true,
    skipped: false,
    runKey,
    cadence: input.cadence,
    dateKey: key,
    quizKey: result.quizKey,
    challengeKey: result.challengeKey,
    quizId: result.quizId,
    challengeId: result.challengeId,
    qualityScore: result.qualityScore,
    sourceIds: result.sourceIds,
    model: result.model,
  };
}

export async function reviewScheduledLearningLabItems(input: {
  runKey: string;
  status: 'approved' | 'rejected';
  reviewer: string;
  note?: string | null;
}): Promise<ScheduledLearningLabReviewResult> {
  const items = await findScheduledItems(input.runKey);
  if (!items.quiz || !items.challenge) throw new Error('Scheduled learning lab items not found.');
  const cadence = String(items.quiz.metadata?.cadence ?? items.challenge.metadata?.cadence ?? 'daily') === 'weekly' ? 'weekly' : 'daily';
  const workflow = workflowMetadata({
    runKey: input.runKey,
    cadence,
    workflowStatus: input.status,
    reviewedBy: input.reviewer,
    reviewNote: input.note ?? null,
  });
  await Promise.all([
    updateItemMetadata({
      table: 'discord_quizzes',
      id: items.quiz.id,
      metadata: mergeWorkflowStatus(items.quiz, workflow),
      active: false,
    }),
    updateItemMetadata({
      table: 'discord_challenges',
      id: items.challenge.id,
      metadata: mergeWorkflowStatus(items.challenge, workflow),
      active: false,
    }),
  ]);
  await recordDiscordEvent({
    eventType: 'learning_lab_scheduled_items_reviewed',
    commandName: 'learning_lab_scheduler',
    metadata: {
      run_key: input.runKey,
      status: input.status,
      reviewer: input.reviewer,
    },
  });
  return {
    ok: true,
    runKey: input.runKey,
    cadence,
    quizKey: String(items.quiz.quiz_key),
    challengeKey: String(items.challenge.challenge_key),
    status: input.status,
  };
}

export async function publishApprovedLearningLabItems(input: {
  cadence: LearningLabCadence;
  date?: Date;
  source: string;
}): Promise<ScheduledLearningLabPublishResult> {
  const date = input.date ?? new Date();
  const key = dateKey(date);
  const runKey = learningLabRunKey({ cadence: input.cadence, date });
  const items = await findScheduledItems(runKey);
  if (!items.quiz || !items.challenge) {
    await recordDiscordScheduledRun({
      runKey,
      kind: 'learning_lab',
      status: 'skipped',
      metadata: {
        source: input.source,
        reason: 'no_approved_learning_lab_items',
        cadence: input.cadence,
        scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
      },
    });
    return {
      ok: false,
      published: false,
      skipped: true,
      reason: 'no_approved_learning_lab_items',
      runKey,
      cadence: input.cadence,
      dateKey: key,
      quizKey: null,
      challengeKey: null,
    };
  }
  if (items.quiz.active && items.challenge.active && itemStatus(items.quiz) === 'published' && itemStatus(items.challenge) === 'published') {
    await recordDiscordScheduledRun({
      runKey,
      kind: 'learning_lab',
      status: 'skipped',
      metadata: {
        source: input.source,
        reason: 'already_published',
        cadence: input.cadence,
        scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
      },
    });
    return {
      ok: true,
      published: false,
      skipped: true,
      reason: 'already_published',
      runKey,
      cadence: input.cadence,
      dateKey: key,
      quizKey: String(items.quiz.quiz_key),
      challengeKey: String(items.challenge.challenge_key),
    };
  }
  if (itemStatus(items.quiz) !== 'approved' || itemStatus(items.challenge) !== 'approved') {
    await recordDiscordScheduledRun({
      runKey,
      kind: 'learning_lab',
      status: 'skipped',
      metadata: {
        source: input.source,
        reason: 'no_approved_learning_lab_items',
        cadence: input.cadence,
        quiz_status: itemStatus(items.quiz),
        challenge_status: itemStatus(items.challenge),
        scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
      },
    });
    return {
      ok: false,
      published: false,
      skipped: true,
      reason: 'no_approved_learning_lab_items',
      runKey,
      cadence: input.cadence,
      dateKey: key,
      quizKey: String(items.quiz.quiz_key),
      challengeKey: String(items.challenge.challenge_key),
    };
  }

  const workflow = workflowMetadata({
    runKey,
    cadence: input.cadence,
    workflowStatus: 'published',
  });
  const publishedAt = new Date().toISOString();
  await Promise.all([
    updateItemMetadata({
      table: 'discord_quizzes',
      id: items.quiz.id,
      metadata: { ...mergeWorkflowStatus(items.quiz, workflow), published_at: publishedAt },
      active: true,
    }),
    updateItemMetadata({
      table: 'discord_challenges',
      id: items.challenge.id,
      metadata: { ...mergeWorkflowStatus(items.challenge, workflow), published_at: publishedAt },
      active: true,
    }),
  ]);
  await recordDiscordScheduledRun({
    runKey,
    kind: 'learning_lab',
    status: 'published',
    metadata: {
      source: input.source,
      cadence: input.cadence,
      quiz_key: items.quiz.quiz_key,
      challenge_key: items.challenge.challenge_key,
      scheduler_version: DISCORD_LEARNING_LAB_SCHEDULER_VERSION,
    },
  });
  await recordDiscordEvent({
    eventType: 'learning_lab_scheduled_items_published',
    commandName: input.source,
    channelBaseName: 'daily-signal',
    metadata: {
      run_key: runKey,
      cadence: input.cadence,
      quiz_key: items.quiz.quiz_key,
      challenge_key: items.challenge.challenge_key,
    },
  });

  return {
    ok: true,
    published: true,
    skipped: false,
    runKey,
    cadence: input.cadence,
    dateKey: key,
    quizKey: String(items.quiz.quiz_key),
    challengeKey: String(items.challenge.challenge_key),
  };
}
