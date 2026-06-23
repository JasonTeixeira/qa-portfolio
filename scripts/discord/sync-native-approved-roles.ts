import { createClient } from '@supabase/supabase-js';
import { approveDiscordMember } from '../../lib/discord/onboarding';
import {
  planNativeApprovalSync,
  type NativeApprovalSyncMember,
} from '../../lib/discord/native-approval-sync';
import type { MemberApplicationProfile } from '../../lib/discord/engagement';

const API = 'https://discord.com/api/v10';
const ADMINISTRATOR = BigInt(1) << BigInt(3);
const MANAGE_GUILD = BigInt(1) << BigInt(5);
const privilegedRoleNames = new Set(['Founder', 'Admin', 'Administrator', 'Moderator']);

type DiscordRole = {
  id: string;
  name: string;
  permissions?: string;
};

type DiscordMember = {
  user?: {
    id?: string;
    username?: string;
    global_name?: string | null;
    bot?: boolean;
  };
  nick?: string | null;
  pending?: boolean;
  roles: string[];
};

function cleanEnv(value: string | undefined): string {
  return value?.replace(/\\n/g, '').trim() ?? '';
}

function requireEnv(name: string): string {
  const value = cleanEnv(process.env[name]);
  if (!value) throw new Error(`${name} missing`);
  return value;
}

const token = requireEnv('DISCORD_BOT_TOKEN');
const guildId = requireEnv('DISCORD_GUILD_ID');
const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
const enforce = process.argv.includes('--enforce');

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

async function listMembers(): Promise<DiscordMember[]> {
  const members: DiscordMember[] = [];
  let after = '0';
  for (;;) {
    const page = await discordApi<DiscordMember[]>(`/guilds/${guildId}/members?limit=1000&after=${after}`);
    if (!page.length) break;
    members.push(...page);
    after = page[page.length - 1]?.user?.id ?? after;
    if (page.length < 1000) break;
  }
  return members;
}

function hasPrivilegedRole(member: DiscordMember, rolesById: Map<string, DiscordRole>): boolean {
  return member.roles.some((roleId) => {
    const role = rolesById.get(roleId);
    if (!role) return false;
    if (privilegedRoleNames.has(role.name)) return true;
    const permissions = BigInt(role.permissions ?? '0');
    return Boolean(permissions & ADMINISTRATOR) || Boolean(permissions & MANAGE_GUILD);
  });
}

function mapApplication(row: Record<string, unknown>): MemberApplicationProfile {
  return {
    discordUserId: String(row.discord_user_id),
    username: row.discord_username ? String(row.discord_username) : null,
    goal: String(row.goal ?? ''),
    experience: String(row.experience ?? ''),
    intendedBuild: String(row.intended_build ?? ''),
    pathKey: row.path_key ? String(row.path_key) : null,
    levelKey: row.level_key ? String(row.level_key) : null,
    timezone: row.timezone ? String(row.timezone) : null,
    weeklyTimeBudget: row.weekly_time_budget ? String(row.weekly_time_budget) : null,
    primaryGoal: row.primary_goal ? String(row.primary_goal) : null,
    preferredSupport: row.preferred_support ? String(row.preferred_support) : null,
    portfolioUrl: row.portfolio_url ? String(row.portfolio_url) : null,
    referralSource: row.referral_source ? String(row.referral_source) : null,
    submittedAt: String(row.submitted_at ?? new Date().toISOString()),
  };
}

async function readApprovedAndPending() {
  const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const [{ data: members, error: membersError }, { data: applications, error: applicationsError }] = await Promise.all([
    sb.from('discord_members').select('discord_user_id, academy_member').eq('academy_member', true),
    sb
      .from('discord_member_applications')
      .select('discord_user_id, discord_username, goal, experience, intended_build, path_key, level_key, timezone, weekly_time_budget, primary_goal, preferred_support, portfolio_url, referral_source, submitted_at')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false }),
  ]);
  if (membersError) throw new Error(`discord_members read failed: ${membersError.message}`);
  if (applicationsError) throw new Error(`discord_member_applications read failed: ${applicationsError.message}`);

  const approved = new Set((members ?? []).map((row) => String(row.discord_user_id)));
  const pending = new Map<string, MemberApplicationProfile>();
  for (const row of applications ?? []) {
    const id = String(row.discord_user_id);
    if (!pending.has(id)) pending.set(id, mapApplication(row));
  }
  return { approved, pending };
}

async function main() {
  const [roles, members, database] = await Promise.all([
    discordApi<DiscordRole[]>(`/guilds/${guildId}/roles`),
    listMembers(),
    readApprovedAndPending(),
  ]);
  const rolesById = new Map(roles.map((role) => [role.id, role]));
  const academyRoleId = roles.find((role) => role.name === 'Academy Member')?.id ?? null;
  const snapshots: NativeApprovalSyncMember[] = members
    .filter((member) => member.user?.id)
    .map((member) => {
      const discordUserId = String(member.user?.id);
      return {
        discordUserId,
        username: member.nick ?? member.user?.global_name ?? member.user?.username ?? null,
        bot: Boolean(member.user?.bot),
        pending: member.pending ?? null,
        privileged: hasPrivilegedRole(member, rolesById),
        approvedInDatabase: database.approved.has(discordUserId),
        hasAcademyRole: academyRoleId ? member.roles.includes(academyRoleId) : false,
        pendingApplication: database.pending.get(discordUserId) ?? null,
      };
    });

  const plan = planNativeApprovalSync(snapshots);
  const actionable = plan.filter((action) => action.type !== 'skip');
  const applied = [];
  const errors = [];

  if (enforce) {
    for (const action of actionable) {
      try {
        await approveDiscordMember({
          discordUserId: action.discordUserId,
          username: action.username,
          reviewer: 'native-approval-sync',
          commandName: 'native-approval-sync',
          application: action.application,
        });
        applied.push({
          discordUserId: action.discordUserId,
          username: action.username,
          action: action.type,
          roles: [
            'Academy Member',
            action.application.pathKey,
            action.application.levelKey,
          ].filter(Boolean),
        });
      } catch (err) {
        errors.push({
          discordUserId: action.discordUserId,
          username: action.username,
          action: action.type,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  console.log(JSON.stringify({
    ok: errors.length === 0,
    enforce,
    scannedMembers: snapshots.length,
    actionableCount: actionable.length,
    actionable: actionable.map((action) => ({
      type: action.type,
      discordUserId: action.discordUserId,
      username: action.username,
      pathKey: action.application.pathKey,
      levelKey: action.application.levelKey,
    })),
    applied,
    errors,
    skipped: plan
      .filter((action) => action.type === 'skip')
      .reduce<Record<string, number>>((counts, action) => {
        counts[action.reason] = (counts[action.reason] ?? 0) + 1;
        return counts;
      }, {}),
    nextStep: enforce
      ? 'Native-approved members with missing Sage access were reconciled.'
      : 'Dry run only. Run npm run discord:role-sync:enforce to apply these role assignments.',
  }, null, 2));

  if (errors.length) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
