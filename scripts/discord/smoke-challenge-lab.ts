import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  challengeSubmissionActionKey,
  getDailyChallengeFromStore,
  getMemberPoints,
  reviewChallengeSubmission,
  submitDailyChallenge,
  submitProjectToBuildLab,
} from '@/lib/discord/engagement';

const API = 'https://discord.com/api/v10';
const evidenceDir = path.join(process.cwd(), 'docs', 'evidence', 'discord');

function requireEnv(name: string): string {
  const value = process.env[name]?.replace(/\\n/g, '').trim();
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function baseDiscordName(name: string): string {
  return name.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '');
}

async function discordApi<T>(pathName: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${pathName}`, {
    ...init,
    headers: {
      authorization: `Bot ${requireEnv('DISCORD_BOT_TOKEN')}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${pathName} ${response.status}: ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function findChannelId(baseName: string): Promise<string> {
  const channels = await discordApi<Array<{ id: string; name: string }>>(`/guilds/${requireEnv('DISCORD_GUILD_ID')}/channels`);
  const channel = channels.find((item) => baseDiscordName(item.name) === baseName);
  if (!channel) throw new Error(`Channel not found: ${baseName}`);
  return channel.id;
}

async function main() {
  const sb = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
  const startedAt = new Date().toISOString();
  const now = new Date('2099-01-07T12:00:00.000Z');
  const discordUserId = 'smoke-challenge-pass4';
  const username = 'challenge-pass4-smoke';
  const challenge = await getDailyChallengeFromStore(now);
  const actionKey = challengeSubmissionActionKey(challenge.key, discordUserId);
  let featuredMessageId: string | null = null;

  await cleanup(sb, discordUserId, actionKey);

  const first = await submitDailyChallenge({
    discordUserId,
    username,
    summary: 'Built a working approval-gated automation map with trigger, input, human decision point, and failure path proof.',
    link: 'https://example.com/pass4-challenge-proof',
    now,
  });
  const duplicate = await submitDailyChallenge({
    discordUserId,
    username,
    summary: 'Trying to submit the same challenge a second time should not create another scored submission.',
    link: 'https://example.com/pass4-duplicate',
    now,
  });
  if (!first.id) throw new Error('Expected first challenge submission id.');

  const approved = await reviewChallengeSubmission({
    submissionId: first.id,
    status: 'approved',
    reviewerDiscordUserId: 'smoke-admin',
    reviewerUsername: 'smoke-admin@test.local',
    note: 'Smoke approval should award points exactly once.',
  });
  const featured = await reviewChallengeSubmission({
    submissionId: first.id,
    status: 'featured',
    reviewerDiscordUserId: 'smoke-admin',
    reviewerUsername: 'smoke-admin@test.local',
    note: 'Smoke feature should not award duplicate points.',
  });
  if (!featured.ok || !featured.submission) throw new Error(`Feature failed: ${featured.reason ?? 'unknown'}`);

  const winsChannelId = await findChannelId('wins-showcase');
  featuredMessageId = await postFeaturedSmokeMessage(featured.submission.summary);
  await sb
    .from('discord_challenge_submissions')
    .update({ featured_message_id: featuredMessageId, updated_at: new Date().toISOString() })
    .eq('id', first.id);

  const project = await submitProjectToBuildLab({
    discordUserId,
    username,
    title: 'Pass 4 Build Lab Proof',
    pathKey: 'ai_apps',
    goal: 'Create a structured project record with a build-lab artifact, content queue source, and onboarding proof target.',
    link: 'https://example.com/pass4-project-proof',
  });

  const [{ data: submissions }, { data: ledger }, { data: projectRows }, { data: queueRows }, { data: onboarding }, points] = await Promise.all([
    sb.from('discord_challenge_submissions').select('id, status, points_awarded, featured_message_id').eq('discord_user_id', discordUserId),
    sb.from('discord_points_ledger').select('points, source, action_key').eq('action_key', actionKey),
    sb.from('discord_project_submissions').select('id, content_queue_id, status').eq('id', project.id),
    sb.from('discord_content_queue').select('id, source, idea').eq('discord_user_id', discordUserId),
    sb.from('discord_member_onboarding_steps').select('step_key').eq('discord_user_id', discordUserId),
    getMemberPoints(discordUserId),
  ]);

  const ok = first.status === 'pending'
    && !first.alreadySubmitted
    && duplicate.alreadySubmitted
    && duplicate.points === 0
    && approved.ok
    && approved.pointsAwarded === challenge.points
    && featured.ok
    && featured.pointsAwarded === challenge.points
    && (submissions ?? []).length === 1
    && submissions?.[0]?.status === 'featured'
    && submissions?.[0]?.featured_message_id === featuredMessageId
    && (ledger ?? []).length === 1
    && Number(ledger?.[0]?.points ?? 0) === challenge.points
    && projectRows?.[0]?.content_queue_id === project.contentQueueId
    && (queueRows ?? []).some((row) => row.source === 'project_submission')
    && (onboarding ?? []).some((row) => row.step_key === 'challenge')
    && (onboarding ?? []).some((row) => row.step_key === 'project')
    && points.total === challenge.points;

  if (featuredMessageId) {
    await discordApi(`/channels/${winsChannelId}/messages/${featuredMessageId}`, { method: 'DELETE' });
  }
  await cleanup(sb, discordUserId, actionKey);

  const evidence = {
    ok,
    cleanedUp: true,
    challengeKey: challenge.key,
    challengePoints: challenge.points,
    first,
    duplicate,
    approved,
    featured,
    featuredMessageId,
    project,
    submissionsCount: submissions?.length ?? 0,
    ledgerCount: ledger?.length ?? 0,
    queueCount: queueRows?.length ?? 0,
    onboardingSteps: (onboarding ?? []).map((row) => row.step_key),
    points,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'challenge-lab-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  if (!ok) process.exit(1);
}

async function postFeaturedSmokeMessage(summary: string): Promise<string> {
  const channelId = await findChannelId('wins-showcase');
  const response = await discordApi<{ id: string }>(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      content: [
        '# Featured challenge submission smoke',
        '**Member:** challenge-pass4-smoke',
        `**Summary:** ${summary}`,
        '',
        'This test message is deleted by the smoke script.',
      ].join('\n'),
    }),
  });
  return response.id;
}

async function cleanup(sb: SupabaseClient, discordUserId: string, actionKey: string) {
  await Promise.all([
    sb.from('discord_challenge_submissions').delete().eq('discord_user_id', discordUserId),
    sb.from('discord_points_ledger').delete().eq('action_key', actionKey),
    sb.from('discord_member_streaks').delete().eq('discord_user_id', discordUserId),
    sb.from('discord_member_onboarding_steps').delete().eq('discord_user_id', discordUserId),
    sb.from('discord_content_queue').delete().eq('discord_user_id', discordUserId),
    sb.from('discord_project_submissions').delete().eq('discord_user_id', discordUserId),
  ]);
}

main().catch(async (error) => {
  const evidence = {
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    finishedAt: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, 'challenge-lab-smoke.json');
  await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
  console.error(JSON.stringify({ ...evidence, evidencePath }, null, 2));
  process.exit(1);
});
