import { createClient } from '@supabase/supabase-js';
import { submitMemberApplication, reviewMemberApplication } from '@/lib/discord/engagement';
import { approveDiscordMember } from '@/lib/discord/onboarding';
import { upsertDiscordMember } from '@/lib/discord/analytics';
import { applyDiscordRoleRouting } from '@/lib/discord/sage-rest';
import { planDiscordRoleRouting } from '@/lib/discord/role-routing';

const API = 'https://discord.com/api/v10';
const controlledRoles = [
  'AI Engineer',
  'Builder',
  'Web Builder',
  'Cloud Builder',
  'Content Builder',
  'Growth Builder',
  'Beginner',
  'Academy Member',
  'Contributor',
  'Mentor',
  'Premium Member',
];
const privilegedRoles = new Set(['Founder', 'Admin', 'Administrator', 'Moderator']);

function cleanEnv(value: string | undefined): string | undefined {
  return value?.replace(/\\n/g, '').trim();
}

function env(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} missing`);
  return value;
}

const token = env('DISCORD_BOT_TOKEN');
const guildId = env('DISCORD_GUILD_ID');
const supabase = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});
const headless = process.argv.includes('--headless') || process.env.DISCORD_PROOF_MODE === 'headless';

async function discordApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bot ${token}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} ${response.status}: ${text}`);
  return (text ? JSON.parse(text) : null) as T;
}

type DiscordRole = { id: string; name: string };
type DiscordMember = { user: { id: string; username: string; bot?: boolean }; roles: string[] };

function roleNames(member: DiscordMember, rolesById: Map<string, DiscordRole>): string[] {
  return member.roles.map((id) => rolesById.get(id)?.name).filter(Boolean) as string[];
}

async function getMember(userId: string): Promise<DiscordMember> {
  return discordApi<DiscordMember>(`/guilds/${guildId}/members/${userId}`);
}

function isPrivileged(member: DiscordMember, ownerId: string, rolesById: Map<string, DiscordRole>): boolean {
  if (member.user.bot) return true;
  if (member.user.id === ownerId) return true;
  return roleNames(member, rolesById).some((role) => privilegedRoles.has(role));
}

async function findTargetMember(): Promise<{
  member: DiscordMember | null;
  ownerId: string;
  roles: DiscordRole[];
  rolesById: Map<string, DiscordRole>;
}> {
  const [guild, roles, members] = await Promise.all([
    discordApi<{ owner_id: string }>(`/guilds/${guildId}`),
    discordApi<DiscordRole[]>(`/guilds/${guildId}/roles`),
    discordApi<DiscordMember[]>(`/guilds/${guildId}/members?limit=1000`),
  ]);
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  const requested = cleanEnv(process.env.DISCORD_TEST_MEMBER_ID);
  const member = requested
    ? members.find((item) => item.user.id === requested) ?? null
    : members.find((item) => !isPrivileged(item, guild.owner_id, rolesById)) ?? null;
  return { member, ownerId: guild.owner_id, roles, rolesById };
}

async function deleteExistingRows(discordUserId: string): Promise<void> {
  await supabase.from('discord_member_applications').delete().eq('discord_user_id', discordUserId);
  await supabase.from('discord_members').delete().eq('discord_user_id', discordUserId);
  await supabase.from('discord_onboarding_steps').delete().eq('discord_user_id', discordUserId);
}

async function verifyDatabase(discordUserId: string) {
  const { data: application, error: applicationError } = await supabase
    .from('discord_member_applications')
    .select('status, path_key, level_key')
    .eq('discord_user_id', discordUserId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (applicationError) throw new Error(`application verification failed: ${applicationError.message}`);

  const { data: member, error: memberError } = await supabase
    .from('discord_members')
    .select('academy_member, path_key, level_key')
    .eq('discord_user_id', discordUserId)
    .maybeSingle();
  if (memberError) throw new Error(`member verification failed: ${memberError.message}`);

  return { application, member };
}

async function runHeadlessProof(): Promise<void> {
  const syntheticUserId = `proof-${Date.now()}`;
  const username = 'headless-onboarding-proof';
  await deleteExistingRows(syntheticUserId);

  const application = await submitMemberApplication({
    discordUserId: syntheticUserId,
    username,
    goal: 'Build a useful AI learning assistant for a real workflow.',
    experience: 'I can follow tutorials and have shipped small projects, but need structure and review.',
    intendedBuild: 'A one-screen AI app that turns messy notes into structured tasks.',
    pathKey: 'full_stack',
    levelKey: 'shipping',
    timezone: 'ET',
    weeklyTimeBudget: '5 hours',
    primaryGoal: 'Ship one practical app and learn the production workflow.',
    preferredSupport: 'review',
    portfolioUrl: 'https://example.com/test-project',
    referralSource: 'headless onboarding proof',
    rulesAccepted: true,
  });
  if (!application.ok) throw new Error(`headless application submit failed: ${application.reason ?? 'unknown'}`);

  const review = await reviewMemberApplication({
    discordUserId: syntheticUserId,
    status: 'approved',
    reviewerDiscordUserId: 'headless-reviewer',
    reviewerUsername: 'headless-proof',
    note: 'Automated headless onboarding proof.',
  });
  if (!review.ok) throw new Error(`headless application review failed: ${review.reason ?? 'unknown'}`);

  const approvalPlan = planDiscordRoleRouting({
    currentPathKey: null,
    currentLevelKey: null,
    nextPathKey: review.application?.pathKey,
    nextLevelKey: review.application?.levelKey,
  });
  const missingApprovalRoles = hasRoles(approvalPlan.rolesToAdd, ['Academy Member', 'Builder']);
  if (missingApprovalRoles.length) throw new Error(`headless approval plan missing roles: ${missingApprovalRoles.join(', ')}`);

  await upsertDiscordMember({
    discordUserId: syntheticUserId,
    username,
    pathKey: review.application?.pathKey ?? null,
    levelKey: review.application?.levelKey ?? null,
    timezone: review.application?.timezone ?? null,
    weeklyTimeBudget: review.application?.weeklyTimeBudget ?? null,
    primaryGoal: review.application?.primaryGoal ?? review.application?.goal ?? null,
    preferredSupport: review.application?.preferredSupport ?? null,
    portfolioUrl: review.application?.portfolioUrl ?? null,
    referralSource: review.application?.referralSource ?? null,
    onboardingCompletedAt: new Date().toISOString(),
    academyMember: true,
  });

  const reroutePlan = planDiscordRoleRouting({
    currentPathKey: 'full_stack',
    currentLevelKey: 'shipping',
    nextPathKey: 'web_design',
    nextLevelKey: 'starting',
  });
  const missingRerouteRoles = hasRoles(reroutePlan.rolesToAdd, ['Academy Member', 'Web Builder', 'Beginner']);
  if (missingRerouteRoles.length) throw new Error(`headless reroute plan missing roles: ${missingRerouteRoles.join(', ')}`);
  if (!reroutePlan.rolesToRemove.includes('Builder')) throw new Error('headless reroute did not remove stale Builder role');

  await upsertDiscordMember({
    discordUserId: syntheticUserId,
    username,
    pathKey: 'web_design',
    levelKey: 'starting',
  });

  const database = await verifyDatabase(syntheticUserId);
  if (database.application?.status !== 'approved') throw new Error('headless application row is not approved');
  if (!database.member?.academy_member) throw new Error('headless discord_members academy_member is not true');
  if (database.member.path_key !== 'web_design' || database.member.level_key !== 'starting') {
    throw new Error('headless discord_members routing row did not update after reroute');
  }

  const keepRows = process.env.DISCORD_PROOF_KEEP_ROWS === 'true';
  if (!keepRows) await deleteExistingRows(syntheticUserId);

  console.log(JSON.stringify({
    ok: true,
    mode: 'headless',
    syntheticUserId,
    cleanedUp: !keepRows,
    approvalPlan,
    reroutePlan,
    database,
    proven: [
      'pending application created in Supabase',
      'application approved in Supabase',
      'approval role-routing plan includes Academy Member and Builder',
      'reroute plan adds Academy Member, Web Builder, and Beginner',
      'reroute plan removes stale Builder',
      'discord_members and discord_member_applications verified',
    ],
    notProvenHeadlessly: [
      'Discord client join screen',
      'Discord native member screening',
      'Discord API role mutation on a real non-admin member',
    ],
  }, null, 2));
}

function hasRoles(actual: string[], expected: string[]): string[] {
  return expected.filter((role) => !actual.includes(role));
}

async function main(): Promise<void> {
  if (headless) {
    await runHeadlessProof();
    return;
  }

  const { member: target, ownerId, rolesById } = await findTargetMember();
  if (!target) {
    const result = {
      ok: false,
      blocked: 'no_non_admin_test_member',
      reason: 'The guild has no non-bot, non-Founder/Admin/Moderator member to run the live onboarding proof against.',
      nextStep: 'Join Sage Ideas with a test Discord account, then rerun npm run discord:prove-onboarding. Optionally set DISCORD_TEST_MEMBER_ID to that account id.',
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(2);
  }

  if (isPrivileged(target, ownerId, rolesById)) {
    console.log(JSON.stringify({
      ok: false,
      blocked: 'target_is_privileged',
      target: { id: target.user.id, username: target.user.username, roles: roleNames(target, rolesById) },
      reason: 'Pass 0 requires a non-admin member because privileged members bypass normal community assumptions.',
    }, null, 2));
    process.exit(2);
  }

  const initialRoles = roleNames(target, rolesById);
  const initialControlledRoles = initialRoles.filter((role) => controlledRoles.includes(role));
  if (initialControlledRoles.length) {
    console.log(JSON.stringify({
      ok: false,
      blocked: 'target_already_has_member_roles',
      target: { id: target.user.id, username: target.user.username, roles: initialRoles },
      reason: 'The test member must start unapproved with no Sage member/path/level/premium roles.',
    }, null, 2));
    process.exit(2);
  }

  await deleteExistingRows(target.user.id);

  const application = await submitMemberApplication({
    discordUserId: target.user.id,
    username: target.user.username,
    goal: 'Build a useful AI learning assistant for a real workflow.',
    experience: 'I can follow tutorials and have shipped small projects, but need structure and review.',
    intendedBuild: 'A one-screen AI app that turns messy notes into structured tasks.',
    pathKey: 'full_stack',
    levelKey: 'shipping',
    timezone: 'ET',
    weeklyTimeBudget: '5 hours',
    primaryGoal: 'Ship one practical app and learn the production workflow.',
    preferredSupport: 'review',
    portfolioUrl: 'https://example.com/test-project',
    referralSource: 'live onboarding proof',
    rulesAccepted: true,
  });
  if (!application.ok) throw new Error(`application submit failed: ${application.reason ?? 'unknown'}`);

  const review = await reviewMemberApplication({
    discordUserId: target.user.id,
    status: 'approved',
    reviewerDiscordUserId: ownerId,
    reviewerUsername: 'live-proof',
    note: 'Automated live onboarding proof.',
  });
  if (!review.ok) throw new Error(`application review failed: ${review.reason ?? 'unknown'}`);

  await approveDiscordMember({
    discordUserId: target.user.id,
    username: target.user.username,
    reviewer: 'live-proof',
    commandName: 'prove-onboarding-live',
    application: review.application,
  });

  const approvedMember = await getMember(target.user.id);
  const approvedRoles = roleNames(approvedMember, rolesById);
  const missingApprovalRoles = hasRoles(approvedRoles, ['Academy Member', 'Builder']);
  if (missingApprovalRoles.length) throw new Error(`approval roles missing: ${missingApprovalRoles.join(', ')}`);

  await applyDiscordRoleRouting(target.user.id, {
    currentPathKey: 'full_stack',
    currentLevelKey: 'shipping',
    nextPathKey: 'web_design',
    nextLevelKey: 'starting',
  });
  await upsertDiscordMember({
    discordUserId: target.user.id,
    username: target.user.username,
    pathKey: 'web_design',
    levelKey: 'starting',
  });

  const reroutedMember = await getMember(target.user.id);
  const reroutedRoles = roleNames(reroutedMember, rolesById);
  const missingRerouteRoles = hasRoles(reroutedRoles, ['Academy Member', 'Web Builder', 'Beginner']);
  if (missingRerouteRoles.length) throw new Error(`reroute roles missing: ${missingRerouteRoles.join(', ')}`);
  if (reroutedRoles.includes('Builder')) throw new Error('stale Builder role remained after path/level reroute');

  const database = await verifyDatabase(target.user.id);
  if (database.application?.status !== 'approved') throw new Error('application row is not approved');
  if (!database.member?.academy_member) throw new Error('discord_members academy_member is not true');
  if (database.member.path_key !== 'web_design' || database.member.level_key !== 'starting') {
    throw new Error('discord_members routing row did not update after reroute');
  }

  console.log(JSON.stringify({
    ok: true,
    target: { id: target.user.id, username: target.user.username },
    initialRoles,
    approvedRoles,
    reroutedRoles,
    database,
    proven: [
      'pending application created',
      'application approved',
      'Academy Member and initial role assignment applied',
      'role rerouting removed stale Builder role',
      'role rerouting kept Academy Member',
      'discord_members and discord_member_applications verified',
    ],
  }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
