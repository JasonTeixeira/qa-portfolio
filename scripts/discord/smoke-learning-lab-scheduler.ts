import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { answerDailyQuiz, submitDailyChallenge } from '@/lib/discord/engagement';
import {
  createScheduledLearningLabDraft,
  learningLabRunKey,
  publishApprovedLearningLabItems,
  reviewScheduledLearningLabItems,
} from '@/lib/discord/learning-lab-scheduler';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');
const phaseEvidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function dateForRotationIndex(index: number, length: number): Date {
  const start = new Date(Date.UTC(2099, 0, 15, 12, 0, 0));
  for (let offset = 0; offset < 370; offset += 1) {
    const candidate = new Date(start);
    candidate.setUTCDate(start.getUTCDate() + offset);
    const dayKey = Math.floor(Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth(), candidate.getUTCDate()) / 86_400_000);
    if (dayKey % length === index) return candidate;
  }
  throw new Error(`Unable to find rotation date for index ${index} length ${length}`);
}

async function findRotationDate(
  sb: SupabaseClient,
  table: 'discord_quizzes' | 'discord_challenges',
  keyColumn: 'quiz_key' | 'challenge_key',
  key: string,
): Promise<Date> {
  const { data, error } = await sb
    .from(table)
    .select(keyColumn)
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const index = rows.findIndex((row) => String((row as Record<string, unknown>)[keyColumn]) === key);
  if (index < 0) throw new Error(`${table} row was not active after publish: ${key}`);
  return dateForRotationIndex(index, rows.length);
}

async function seedApprovedSource(sb: SupabaseClient, sourceUserId: string): Promise<string> {
  await sb.from('discord_content_queue').delete().eq('discord_user_id', sourceUserId);
  const { data, error } = await sb.from('discord_content_queue').insert({
    source: 'phase_12_scheduler_smoke_source',
    discord_user_id: sourceUserId,
    discord_username: 'phase12-source',
    channel_base_name: 'build-lab',
    idea: 'Daily learning jobs should create approval-gated quizzes and challenges from approved community knowledge.',
    angle: 'Teach members to convert one approved source into a short quiz and a buildable challenge with reviewable proof.',
    status: 'published',
    priority: 97,
    metadata: {
      phase: 12,
      smoke: true,
      source_content_preview: 'A strong scheduled learning job should generate inactive learning items first, wait for admin review, then publish them as active only after approval. Duplicate runs should not create farming paths.',
    },
  }).select('id').single();
  if (error) throw new Error(error.message);
  return `discord_content_queue:${data.id}`;
}

async function cleanup(
  sb: SupabaseClient,
  input: {
    runKey: string;
    sourceUserId: string;
    discordUserId: string;
    quizKey?: string | null;
    challengeKey?: string | null;
  },
) {
  const deletes: Array<PromiseLike<unknown>> = [
    sb.from('discord_content_queue').delete().eq('discord_user_id', input.sourceUserId),
    sb.from('discord_scheduled_runs').delete().eq('run_key', input.runKey),
    sb.from('discord_events').delete().contains('metadata', { run_key: input.runKey }),
    sb.from('discord_points_ledger').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_member_streaks').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_quiz_attempts').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_challenge_submissions').delete().eq('discord_user_id', input.discordUserId),
  ];
  if (input.quizKey) deletes.push(sb.from('discord_quizzes').delete().eq('quiz_key', input.quizKey));
  if (input.challengeKey) deletes.push(sb.from('discord_challenges').delete().eq('challenge_key', input.challengeKey));
  if (input.quizKey) deletes.push(sb.from('discord_events').delete().contains('metadata', { quiz_key: input.quizKey }));
  if (input.challengeKey) deletes.push(sb.from('discord_events').delete().contains('metadata', { challenge_key: input.challengeKey }));
  await Promise.all(deletes);
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const date = new Date('2099-01-15T12:00:00.000Z');
  const runKey = learningLabRunKey({ cadence: 'daily', date });
  const sourceUserId = 'phase-12-learning-source';
  const discordUserId = 'phase-12-learning-member';
  const username = 'phase-12-learning-smoke';
  let quizKey: string | null = null;
  let challengeKey: string | null = null;

  try {
    await cleanup(sb, { runKey, sourceUserId, discordUserId });
    const sourceId = await seedApprovedSource(sb, sourceUserId);
    const draft = await createScheduledLearningLabDraft({
      cadence: 'daily',
      date,
      topic: 'approval-gated scheduled learning job',
      sourceIds: [sourceId],
      force: true,
      metadata: { smoke: true },
    });
    quizKey = draft.quizKey;
    challengeKey = draft.challengeKey;
    if (!quizKey || !challengeKey) throw new Error('Scheduled learning lab did not return quiz/challenge keys.');

    const duplicateDraft = await createScheduledLearningLabDraft({
      cadence: 'daily',
      date,
      topic: 'approval-gated scheduled learning job',
      sourceIds: [sourceId],
      force: false,
      metadata: { smoke: true },
    });

    const { data: pendingQuiz } = await sb.from('discord_quizzes').select('active, metadata').eq('quiz_key', quizKey).single();
    const { data: pendingChallenge } = await sb.from('discord_challenges').select('active, metadata').eq('challenge_key', challengeKey).single();
    const blockedPublish = await publishApprovedLearningLabItems({
      cadence: 'daily',
      date,
      source: 'phase-12-smoke-before-approval',
    });
    const reviewed = await reviewScheduledLearningLabItems({
      runKey,
      status: 'approved',
      reviewer: 'phase12-smoke@test.local',
      note: 'Approve scheduled learning items for Phase 12 proof.',
    });
    const published = await publishApprovedLearningLabItems({
      cadence: 'daily',
      date,
      source: 'phase-12-smoke-publish',
    });
    const duplicatePublish = await publishApprovedLearningLabItems({
      cadence: 'daily',
      date,
      source: 'phase-12-smoke-publish',
    });

    const { data: publishedQuiz } = await sb.from('discord_quizzes').select('active, metadata, correct_answer, options').eq('quiz_key', quizKey).single();
    const { data: publishedChallenge } = await sb.from('discord_challenges').select('active, metadata').eq('challenge_key', challengeKey).single();
    const quizDate = await findRotationDate(sb, 'discord_quizzes', 'quiz_key', quizKey);
    const challengeDate = await findRotationDate(sb, 'discord_challenges', 'challenge_key', challengeKey);
    const quizAttempt = await answerDailyQuiz({
      discordUserId,
      username,
      answer: String(publishedQuiz?.correct_answer ?? ''),
      now: quizDate,
    });
    const challengeSubmission = await submitDailyChallenge({
      discordUserId,
      username,
      summary: 'Submitted a scheduled learning challenge proof with artifact link, review checklist, and one concrete test result.',
      link: 'https://example.com/phase-12-scheduled-learning-proof',
      now: challengeDate,
    });
    const { data: run } = await sb
      .from('discord_scheduled_runs')
      .select('run_key, kind, status, metadata')
      .eq('run_key', runKey)
      .maybeSingle();

    const ok = draft.ok
      && !draft.skipped
      && duplicateDraft.skipped
      && pendingQuiz?.active === false
      && pendingChallenge?.active === false
      && pendingQuiz?.metadata?.workflow_status === 'pending_approval'
      && pendingChallenge?.metadata?.workflow_status === 'pending_approval'
      && blockedPublish.skipped
      && blockedPublish.reason === 'no_approved_learning_lab_items'
      && reviewed.ok
      && published.ok
      && published.published
      && duplicatePublish.skipped
      && duplicatePublish.reason === 'already_published'
      && publishedQuiz?.active === true
      && publishedChallenge?.active === true
      && publishedQuiz?.metadata?.workflow_status === 'published'
      && publishedChallenge?.metadata?.workflow_status === 'published'
      && quizAttempt.quiz.key === quizKey
      && quizAttempt.correct
      && quizAttempt.points === 10
      && challengeSubmission.challenge.key === challengeKey
      && !challengeSubmission.alreadySubmitted
      && run?.kind === 'learning_lab'
      && run?.status === 'skipped'
      && run?.metadata?.reason === 'already_published';

    const evidence = {
      ok,
      cleanedUp: true,
      runKey,
      sourceId,
      draft,
      duplicateDraft,
      blockedPublish,
      reviewed,
      published,
      duplicatePublish,
      pending: {
        quizActive: pendingQuiz?.active,
        quizStatus: pendingQuiz?.metadata?.workflow_status,
        challengeActive: pendingChallenge?.active,
        challengeStatus: pendingChallenge?.metadata?.workflow_status,
      },
      afterPublish: {
        quizActive: publishedQuiz?.active,
        quizStatus: publishedQuiz?.metadata?.workflow_status,
        challengeActive: publishedChallenge?.active,
        challengeStatus: publishedChallenge?.metadata?.workflow_status,
      },
      quizDate: quizDate.toISOString(),
      challengeDate: challengeDate.toISOString(),
      quizAttempt,
      challengeSubmission,
      run,
      startedAt,
      finishedAt: new Date().toISOString(),
    };

    await cleanup(sb, { runKey, sourceUserId, discordUserId, quizKey, challengeKey });
    await writeEvidence(evidence);
    console.log(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'learning-lab-scheduler-smoke.json') }, null, 2));
    if (!ok) process.exit(1);
  } catch (error) {
    await cleanup(sb, { runKey, sourceUserId, discordUserId, quizKey, challengeKey }).catch(() => undefined);
    const evidence = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(evidence);
    console.error(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'learning-lab-scheduler-smoke.json') }, null, 2));
    process.exit(1);
  }
}

async function writeEvidence(evidence: Record<string, unknown>) {
  await Promise.all([
    mkdir(evidenceDir, { recursive: true }),
    mkdir(phaseEvidenceDir, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(evidenceDir, 'learning-lab-scheduler-smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`),
    writeFile(path.join(phaseEvidenceDir, 'phase-12-learning-lab-scheduler-proof.json'), `${JSON.stringify(evidence, null, 2)}\n`),
  ]);
}

main();
