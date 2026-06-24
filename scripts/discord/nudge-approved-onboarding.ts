import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  buildApprovedMemberOnboardingNudgeContent,
  planApprovedMemberOnboardingNudges,
  type ApprovedMemberOnboardingNudgeMember,
} from '../../lib/discord/onboarding-nudge';
import { postToChannelByBaseName } from '../../lib/discord/sage-rest';

function cleanEnv(value: string | undefined): string {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

function requireEnv(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} missing`);
  return value;
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const send = process.argv.includes('--send');
const force = process.argv.includes('--force');
const sinceHoursArg = process.argv.find((arg) => arg.startsWith('--since-hours='));
const sinceHours = sinceHoursArg ? Number(sinceHoursArg.split('=')[1]) : 24;
if (!Number.isFinite(sinceHours) || sinceHours < 0) throw new Error('--since-hours must be a non-negative number');

const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function readApprovedMembers(): Promise<ApprovedMemberOnboardingNudgeMember[]> {
  const { data, error } = await sb
    .from('discord_members')
    .select('discord_user_id, username, academy_member, path_key, level_key')
    .eq('academy_member', true)
    .order('username', { ascending: true, nullsFirst: false });

  if (error) throw new Error(`discord_members read failed: ${error.message}`);

  return (data ?? []).map((row) => ({
    discordUserId: String(row.discord_user_id),
    username: row.username ? String(row.username) : null,
    academyMember: row.academy_member === true,
    pathKey: row.path_key ? String(row.path_key) : null,
    levelKey: row.level_key ? String(row.level_key) : null,
  }));
}

async function readRecentlyNudgedUserIds(): Promise<Set<string>> {
  if (force) return new Set();
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await sb
    .from('discord_events')
    .select('discord_user_id')
    .eq('event_type', 'approved_member_onboarding_nudge')
    .gte('created_at', since);

  if (error) throw new Error(`discord_events read failed: ${error.message}`);
  return new Set((data ?? []).map((row) => String(row.discord_user_id)).filter(Boolean));
}

async function recordNudgeEvents(input: {
  messageId: string | null;
  targets: ApprovedMemberOnboardingNudgeMember[];
}): Promise<void> {
  if (!input.targets.length) return;
  const now = new Date().toISOString();
  const rows = input.targets.map((target) => ({
    event_type: 'approved_member_onboarding_nudge',
    command_name: 'onboarding-nudge',
    discord_user_id: target.discordUserId,
    discord_username: target.username,
    channel_base_name: 'questions',
    metadata: {
      message_id: input.messageId,
      reason: 'approved_default_route',
      sent_at: now,
    },
  }));

  const { error } = await sb.from('discord_events').insert(rows);
  if (error) throw new Error(`discord_events insert failed: ${error.message}`);
}

async function writeEvidence(result: Record<string, unknown>): Promise<void> {
  const dir = path.resolve('docs/evidence/discord');
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, 'phase-1-approved-member-nudge.json'),
    `${JSON.stringify(result, null, 2)}\n`,
    'utf8',
  );
}

async function main() {
  const [members, recentlyNudged] = await Promise.all([
    readApprovedMembers(),
    readRecentlyNudgedUserIds(),
  ]);
  const plan = planApprovedMemberOnboardingNudges(members, recentlyNudged);
  let messageId: string | null = null;

  if (send && plan.targets.length > 0) {
    const content = buildApprovedMemberOnboardingNudgeContent(plan.targets);
    messageId = await postToChannelByBaseName('questions', content);
    if (!messageId) throw new Error('questions channel was not found or Discord post failed');
    await recordNudgeEvents({ messageId, targets: plan.targets });
  }

  const result = {
    ok: true,
    sent: send,
    force,
    sinceHours,
    messageId,
    scannedApprovedMembers: members.length,
    actionableCount: plan.targets.length,
    actionable: plan.targets.map((target) => ({
      discordUserId: target.discordUserId,
      username: target.username,
      pathKey: target.pathKey,
      levelKey: target.levelKey,
      reason: target.reason,
    })),
    skipped: plan.skipped.reduce<Record<string, number>>((counts, item) => {
      counts[item.reason] = (counts[item.reason] ?? 0) + 1;
      return counts;
    }, {}),
    nextStep: send
      ? 'Wait for nudged approved members to run /onboard, then run npm run discord:prove-onboarding.'
      : 'Dry run only. Run npm run discord:onboarding-nudge:send to post the nudge in questions.',
  };

  await writeEvidence(result);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
