import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { answerDailyQuiz, getDailyQuizFromStore, getMemberPoints, quizAttemptActionKey } from '@/lib/discord/engagement';

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
  const now = new Date('2099-01-06T12:00:00.000Z');
  const discordUserId = 'smoke-quiz-pass3';
  const username = 'quiz-pass3-smoke';
  const quiz = await getDailyQuizFromStore(now);
  const actionKey = quizAttemptActionKey(quiz.key, discordUserId);

  await cleanup(sb, discordUserId, quiz.key, actionKey);

  const first = await answerDailyQuiz({
    discordUserId,
    username,
    answer: quiz.correctAnswer,
    now,
  });
  const second = await answerDailyQuiz({
    discordUserId,
    username,
    answer: quiz.options.find((option) => option.toLowerCase() !== quiz.correctAnswer.toLowerCase()) ?? 'wrong answer',
    now,
  });

  const [{ data: attempts }, { data: ledger }, { data: streak }, { data: onboarding }, points] = await Promise.all([
    sb.from('discord_quiz_attempts').select('quiz_key, discord_user_id, correct, points_awarded').eq('discord_user_id', discordUserId).eq('quiz_key', quiz.key),
    sb.from('discord_points_ledger').select('points, reason, source, action_key, metadata').eq('discord_user_id', discordUserId).eq('source', 'quiz'),
    sb.from('discord_member_streaks').select('current_streak, longest_streak, last_activity_date').eq('discord_user_id', discordUserId).maybeSingle(),
    sb.from('discord_member_onboarding_steps').select('step_key, metadata').eq('discord_user_id', discordUserId).eq('step_key', 'daily').maybeSingle(),
    getMemberPoints(discordUserId),
  ]);

  const ok = first.correct
    && first.points === 10
    && !first.alreadyAttempted
    && second.points === 0
    && second.alreadyAttempted
    && (attempts ?? []).length === 1
    && (ledger ?? []).length === 1
    && Number(ledger?.[0]?.points ?? 0) === 10
    && ledger?.[0]?.action_key === actionKey
    && Number(streak?.current_streak ?? 0) === 1
    && Number(streak?.longest_streak ?? 0) === 1
    && onboarding?.step_key === 'daily'
    && points.total === 10;

  await cleanup(sb, discordUserId, quiz.key, actionKey);

  const evidence = {
    ok,
    cleanedUp: true,
    quizKey: quiz.key,
    actionKey,
    first,
    second,
    attemptsCount: attempts?.length ?? 0,
    ledgerCount: ledger?.length ?? 0,
    streak,
    onboarding,
    points,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'quiz-scoring-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

async function cleanup(sb: SupabaseClient, discordUserId: string, quizKey: string, actionKey: string) {
  await Promise.all([
    sb.from('discord_quiz_attempts').delete().eq('discord_user_id', discordUserId).eq('quiz_key', quizKey),
    sb.from('discord_points_ledger').delete().eq('action_key', actionKey),
    sb.from('discord_member_streaks').delete().eq('discord_user_id', discordUserId),
    sb.from('discord_member_onboarding_steps').delete().eq('discord_user_id', discordUserId).eq('step_key', 'daily'),
  ]);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'quiz-scoring-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
