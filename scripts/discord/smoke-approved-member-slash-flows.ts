import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { handleSageCommand, type DiscordInteractionPayload } from '@/lib/discord/sage-commands';
import { getDailyChallengeFromStore, getDailyQuizFromStore } from '@/lib/discord/engagement';
import { discordApi, findChannelIdByBaseName, getRecentChannelMessages } from '@/lib/discord/sage-rest';

const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function option(name: string, value: string | boolean) {
  return { name, value };
}

function payload(userId: string, username: string, name: string, options: Array<{ name: string; value: string | boolean }> = []): DiscordInteractionPayload {
  return {
    type: 2,
    application_id: 'smoke-approved-member-slash-flows',
    token: 'smoke-token',
    data: { name, options },
    member: {
      user: { id: userId, username },
      roles: [],
    },
    channel_id: 'smoke-channel',
  };
}

function responseContent(response: Awaited<ReturnType<typeof handleSageCommand>>): string {
  const content = response.data?.content;
  return typeof content === 'string' ? content : '';
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const userId = 'smoke-approved-slash-member';
  const username = 'approved-slash-smoke';
  const marker = `slash-smoke-${Date.now()}`;
  const quiz = await getDailyQuizFromStore();
  const challenge = await getDailyChallengeFromStore();
  let discordMessagesDeleted = 0;

  await cleanup(sb, userId);
  await sb.from('discord_members').upsert({
    discord_user_id: userId,
    username,
    academy_member: true,
    path_key: 'full_stack',
    level_key: 'shipping',
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'discord_user_id' });

  const quizResult = await handleSageCommand(payload(userId, username, 'quiz', [
    option('answer', quiz.correctAnswer),
  ]));
  const duplicateQuiz = await handleSageCommand(payload(userId, username, 'quiz', [
    option('answer', quiz.correctAnswer),
  ]));
  const challengeResult = await handleSageCommand(payload(userId, username, 'submit-challenge', [
    option('summary', `Slash smoke proof artifact ${marker} with clear acceptance criteria, validation notes, and content reuse angle.`),
    option('link', `https://example.com/slash-challenge-proof?marker=${marker}`),
  ]));
  const projectResult = await handleSageCommand(payload(userId, username, 'submit-project', [
    option('title', `Slash Smoke Project ${marker}`),
    option('path', 'ai_apps'),
    option('goal', `Build a project submission from the slash command handler with queue linkage and onboarding proof. Marker: ${marker}`),
    option('link', `https://example.com/slash-project-proof?marker=${marker}`),
  ]));

  const [{ data: member }, { data: attempts }, { data: challengeRows }, { data: projectRows }, { data: queueRows }, { data: onboarding }, { data: ledger }] = await Promise.all([
    sb.from('discord_members').select('path_key, level_key, academy_member').eq('discord_user_id', userId).maybeSingle(),
    sb.from('discord_quiz_attempts').select('id, quiz_key, points_awarded').eq('discord_user_id', userId),
    sb.from('discord_challenge_submissions').select('id, challenge_key, status, points_awarded').eq('discord_user_id', userId),
    sb.from('discord_project_submissions').select('id, content_queue_id, status').eq('discord_user_id', userId),
    sb.from('discord_content_queue').select('id, source').eq('discord_user_id', userId),
    sb.from('discord_member_onboarding_steps').select('step_key').eq('discord_user_id', userId),
    sb.from('discord_points_ledger').select('points, source').eq('discord_user_id', userId),
  ]);

  discordMessagesDeleted = await cleanupDiscordSmokeMessages(marker);
  const responses = {
    quiz: responseContent(quizResult),
    duplicateQuiz: responseContent(duplicateQuiz),
    challenge: responseContent(challengeResult),
    project: responseContent(projectResult),
  };

  const ok = responses.quiz.includes('Points awarded: **10**')
    && responses.duplicateQuiz.includes('Points awarded: **0**')
    && responses.challenge.includes('Challenge submitted for review')
    && responses.project.includes('Project submitted')
    && member?.academy_member === true
    && member?.path_key === 'full_stack'
    && (attempts ?? []).length === 1
    && Number(attempts?.[0]?.points_awarded ?? 0) === 10
    && (challengeRows ?? []).length === 1
    && challengeRows?.[0]?.challenge_key === challenge.key
    && challengeRows?.[0]?.status === 'pending'
    && Number(challengeRows?.[0]?.points_awarded ?? -1) === 0
    && (projectRows ?? []).length === 1
    && Boolean(projectRows?.[0]?.content_queue_id)
    && (queueRows ?? []).some((row) => row.source === 'project_submission')
    && (onboarding ?? []).some((row) => row.step_key === 'daily')
    && (onboarding ?? []).some((row) => row.step_key === 'challenge')
    && (onboarding ?? []).some((row) => row.step_key === 'project')
    && (ledger ?? []).some((row) => row.source === 'quiz' && Number(row.points) === 10)
    && discordMessagesDeleted >= 2;

  await cleanup(sb, userId);

  const evidence = {
    ok,
    cleanedUp: true,
    discordMessagesDeleted,
    userId,
    marker,
    quizKey: quiz.key,
    challengeKey: challenge.key,
    scope: 'approved-member handler proof for quiz, submit-challenge, and submit-project. Real Discord role routing still requires a real guild member.',
    responses,
    counts: {
      attempts: attempts?.length ?? 0,
      challenges: challengeRows?.length ?? 0,
      projects: projectRows?.length ?? 0,
      queue: queueRows?.length ?? 0,
      onboarding: onboarding?.length ?? 0,
      ledger: ledger?.length ?? 0,
    },
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'approved-member-slash-flows-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

async function cleanup(sb: SupabaseClient, userId: string) {
  await Promise.all([
    sb.from('discord_quiz_attempts').delete().eq('discord_user_id', userId),
    sb.from('discord_challenge_submissions').delete().eq('discord_user_id', userId),
    sb.from('discord_project_submissions').delete().eq('discord_user_id', userId),
    sb.from('discord_content_queue').delete().eq('discord_user_id', userId),
    sb.from('discord_member_onboarding_steps').delete().eq('discord_user_id', userId),
    sb.from('discord_points_ledger').delete().eq('discord_user_id', userId),
    sb.from('discord_member_streaks').delete().eq('discord_user_id', userId),
    sb.from('discord_events').delete().eq('discord_user_id', userId),
    sb.from('discord_members').delete().eq('discord_user_id', userId),
  ]);
}

async function cleanupDiscordSmokeMessages(marker: string): Promise<number> {
  const channelId = await findChannelIdByBaseName('build-lab');
  if (!channelId) return 0;
  const recent = await getRecentChannelMessages('build-lab', 20);
  const smokeMessages = recent.filter((message) => message.content.includes(marker));
  let deleted = 0;
  for (const message of smokeMessages) {
    await discordApi(`/channels/${channelId}/messages/${message.id}`, { method: 'DELETE' });
    deleted += 1;
  }
  return deleted;
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'approved-member-slash-flows-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
