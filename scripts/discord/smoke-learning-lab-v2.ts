import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  answerDailyQuiz,
  challengeSubmissionActionKey,
  getMemberPoints,
  quizAttemptActionKey,
  reviewChallengeSubmission,
  submitDailyChallenge,
} from '@/lib/discord/engagement';
import {
  cleanupLearningLabV2Items,
  createLearningLabV2Items,
} from '@/lib/discord/learning-lab-v2';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');
const phaseEvidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord-ai-os');

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function dateForRotationIndex(index: number, length: number): Date {
  const start = new Date(Date.UTC(2099, 0, 8, 12, 0, 0));
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
  if (index < 0) throw new Error(`${table} row was not active: ${key}`);
  return dateForRotationIndex(index, rows.length);
}

async function cleanup(
  sb: SupabaseClient,
  input: {
    sourceUserId: string;
    quizKey?: string;
    challengeKey?: string;
    discordUserId: string;
  },
) {
  const deletes: Array<PromiseLike<unknown>> = [
    sb.from('discord_content_queue').delete().eq('discord_user_id', input.sourceUserId),
    sb.from('discord_points_ledger').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_member_streaks').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_member_onboarding_steps').delete().eq('discord_user_id', input.discordUserId),
    sb.from('discord_challenge_submissions').delete().eq('discord_user_id', input.discordUserId),
  ];
  if (input.quizKey) {
    deletes.push(sb.from('discord_quiz_attempts').delete().eq('discord_user_id', input.discordUserId).eq('quiz_key', input.quizKey));
    deletes.push(sb.from('discord_quizzes').delete().eq('quiz_key', input.quizKey));
  }
  if (input.challengeKey) {
    deletes.push(sb.from('discord_challenges').delete().eq('challenge_key', input.challengeKey));
  }
  await Promise.all(deletes);
}

async function seedApprovedSource(sb: SupabaseClient, sourceUserId: string): Promise<string> {
  await sb.from('discord_content_queue').delete().eq('discord_user_id', sourceUserId);
  const { data, error } = await sb.from('discord_content_queue').insert({
    source: 'phase_11_smoke_source',
    discord_user_id: sourceUserId,
    discord_username: 'phase11-source',
    channel_base_name: 'build-lab',
    idea: 'Approval-gated AI automations need a human decision point before external sends, charges, or public posts.',
    angle: 'Teach members to map trigger, input, approval owner, failure path, and proof artifact before they ship an automation.',
    status: 'published',
    priority: 96,
    metadata: {
      phase: 11,
      smoke: true,
      source_content_preview: 'A useful automation spec names the trigger, data input, irreversible action, human approval owner, and failure path. The review artifact should include a diagram or checklist plus one test case.',
    },
  }).select('id').single();
  if (error) throw new Error(error.message);
  return `discord_content_queue:${data.id}`;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const sourceUserId = 'phase-11-learning-source';
  const discordUserId = 'phase-11-learning-member';
  const username = 'phase-11-learning-smoke';
  let generated: Awaited<ReturnType<typeof createLearningLabV2Items>> | null = null;

  try {
    await cleanup(sb, { sourceUserId, discordUserId });
    const sourceId = await seedApprovedSource(sb, sourceUserId);
    generated = await createLearningLabV2Items({
      topic: 'approval-gated AI automation',
      date: new Date('2099-01-08T12:00:00.000Z'),
      sourceIds: [sourceId],
      force: true,
      metadata: { smoke: true },
    });

    const quizDate = await findRotationDate(sb, 'discord_quizzes', 'quiz_key', generated.quizKey);
    const challengeDate = await findRotationDate(sb, 'discord_challenges', 'challenge_key', generated.challengeKey);
    const { data: quizRow } = await sb
      .from('discord_quizzes')
      .select('quiz_key, correct_answer, options, metadata')
      .eq('quiz_key', generated.quizKey)
      .single();
    const { data: challengeRow } = await sb
      .from('discord_challenges')
      .select('challenge_key, points, metadata')
      .eq('challenge_key', generated.challengeKey)
      .single();
    if (!quizRow || !challengeRow) throw new Error('Generated quiz/challenge rows were not found.');

    const firstQuiz = await answerDailyQuiz({
      discordUserId,
      username,
      answer: String(quizRow.correct_answer),
      now: quizDate,
    });
    const secondQuiz = await answerDailyQuiz({
      discordUserId,
      username,
      answer: String((quizRow.options as string[]).find((option) => option !== quizRow.correct_answer) ?? 'wrong answer'),
      now: quizDate,
    });

    const firstSubmission = await submitDailyChallenge({
      discordUserId,
      username,
      summary: 'Built an approval-gated automation spec with trigger, input, human decision point, failure path, artifact link, and test case proof.',
      link: 'https://example.com/phase-11-learning-lab-proof',
      now: challengeDate,
    });
    const duplicateSubmission = await submitDailyChallenge({
      discordUserId,
      username,
      summary: 'Duplicate submission should not create more points or another row for this generated challenge.',
      link: 'https://example.com/phase-11-learning-lab-duplicate',
      now: challengeDate,
    });
    if (!firstSubmission.id) throw new Error('Generated challenge submission did not return an id.');
    const approved = await reviewChallengeSubmission({
      submissionId: firstSubmission.id,
      status: 'approved',
      reviewerDiscordUserId: 'phase-11-admin',
      reviewerUsername: 'phase-11-admin',
      note: 'Phase 11 smoke approval should award generated challenge points exactly once.',
    });
    const featured = await reviewChallengeSubmission({
      submissionId: firstSubmission.id,
      status: 'featured',
      reviewerDiscordUserId: 'phase-11-admin',
      reviewerUsername: 'phase-11-admin',
      note: 'Phase 11 smoke feature should not award duplicate generated challenge points.',
    });

    const [attemptsRes, quizLedgerRes, challengeLedgerRes, submissionsRes, points] = await Promise.all([
      sb.from('discord_quiz_attempts').select('id, points_awarded').eq('discord_user_id', discordUserId).eq('quiz_key', generated.quizKey),
      sb.from('discord_points_ledger').select('id, points, action_key').eq('action_key', quizAttemptActionKey(generated.quizKey, discordUserId)),
      sb.from('discord_points_ledger').select('id, points, action_key').eq('action_key', challengeSubmissionActionKey(generated.challengeKey, discordUserId)),
      sb.from('discord_challenge_submissions').select('id, status, points_awarded').eq('discord_user_id', discordUserId).eq('challenge_key', generated.challengeKey),
      getMemberPoints(discordUserId),
    ]);

    const quizMetadata = quizRow.metadata as Record<string, unknown>;
    const challengeMetadata = challengeRow.metadata as Record<string, unknown>;
    const expectedChallengePoints = Number(challengeRow.points ?? 0);
    const expectedTotal = 10 + expectedChallengePoints;
    const ok = generated.ok
      && generated.qualityScore >= 80
      && Array.isArray(quizMetadata.source_ids)
      && quizMetadata.source_ids.includes(sourceId)
      && Array.isArray(challengeMetadata.source_ids)
      && challengeMetadata.source_ids.includes(sourceId)
      && firstQuiz.quiz.key === generated.quizKey
      && firstQuiz.correct
      && firstQuiz.points === 10
      && secondQuiz.alreadyAttempted
      && secondQuiz.points === 0
      && firstSubmission.challenge.key === generated.challengeKey
      && !firstSubmission.alreadySubmitted
      && duplicateSubmission.alreadySubmitted
      && approved.ok
      && approved.pointsAwarded === expectedChallengePoints
      && featured.ok
      && featured.pointsAwarded === expectedChallengePoints
      && (attemptsRes.data ?? []).length === 1
      && (quizLedgerRes.data ?? []).length === 1
      && (challengeLedgerRes.data ?? []).length === 1
      && (submissionsRes.data ?? []).length === 1
      && submissionsRes.data?.[0]?.status === 'featured'
      && points.total === expectedTotal;

    const evidence = {
      ok,
      cleanedUp: true,
      generated,
      sourceId,
      quizDate: quizDate.toISOString(),
      challengeDate: challengeDate.toISOString(),
      firstQuiz,
      secondQuiz,
      firstSubmission,
      duplicateSubmission,
      approved,
      featured,
      attemptsCount: attemptsRes.data?.length ?? 0,
      quizLedgerCount: quizLedgerRes.data?.length ?? 0,
      challengeLedgerCount: challengeLedgerRes.data?.length ?? 0,
      submissionsCount: submissionsRes.data?.length ?? 0,
      points,
      startedAt,
      finishedAt: new Date().toISOString(),
    };

    await cleanupLearningLabV2Items({ quizKey: generated.quizKey, challengeKey: generated.challengeKey }, sb);
    await cleanup(sb, { sourceUserId, discordUserId, quizKey: generated.quizKey, challengeKey: generated.challengeKey });
    await writeEvidence(evidence);
    console.log(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'learning-lab-v2-smoke.json') }, null, 2));
    if (!ok) process.exit(1);
  } catch (error) {
    if (generated) {
      await cleanup(sb, {
        sourceUserId,
        discordUserId,
        quizKey: generated.quizKey,
        challengeKey: generated.challengeKey,
      }).catch(() => undefined);
    } else {
      await cleanup(sb, { sourceUserId, discordUserId }).catch(() => undefined);
    }
    const evidence = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      startedAt,
      finishedAt: new Date().toISOString(),
    };
    await writeEvidence(evidence);
    console.error(JSON.stringify({ ...evidence, evidencePath: path.join(evidenceDir, 'learning-lab-v2-smoke.json') }, null, 2));
    process.exit(1);
  }
}

async function writeEvidence(evidence: Record<string, unknown>) {
  await Promise.all([
    mkdir(evidenceDir, { recursive: true }),
    mkdir(phaseEvidenceDir, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(evidenceDir, 'learning-lab-v2-smoke.json'), `${JSON.stringify(evidence, null, 2)}\n`),
    writeFile(path.join(phaseEvidenceDir, 'phase-11-learning-lab-v2-proof.json'), `${JSON.stringify(evidence, null, 2)}\n`),
  ]);
}

main();
