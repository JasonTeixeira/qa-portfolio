#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const API = 'https://discord.com/api/v10';
const ADMINISTRATOR = 1n << 3n;
const MANAGE_GUILD = 1n << 5n;

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

const privilegedRoleNames = new Set(['Founder', 'Admin', 'Administrator', 'Moderator']);

function cleanEnv(value) {
  return value?.replace(/\\n/g, '').trim();
}

const token = cleanEnv(process.env.DISCORD_BOT_TOKEN);
const guildId = cleanEnv(process.env.DISCORD_GUILD_ID);
const supabaseUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const enforce = process.argv.includes('--enforce');

if (!token || !guildId || !supabaseUrl || !supabaseKey) {
  console.error('Missing DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

async function discordApi(path, init = {}) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bot ${token}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`${init.method ?? 'GET'} ${path} ${response.status}: ${text}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function listMembers() {
  const members = [];
  let after = '0';
  for (;;) {
    const page = await discordApi(`/guilds/${guildId}/members?limit=1000&after=${after}`);
    if (!Array.isArray(page) || page.length === 0) break;
    members.push(...page);
    after = page[page.length - 1].user.id;
    if (page.length < 1000) break;
  }
  return members;
}

function roleMap(roles) {
  return new Map(roles.map((role) => [role.id, role]));
}

function roleIdByName(roles, name) {
  return roles.find((role) => role.name === name)?.id ?? null;
}

function roleHierarchyStatus(roles, botUserId) {
  const botRole = roles.find((role) => role.tags?.bot_id === botUserId) ?? roles.find((role) => role.tags?.bot_id);
  const managed = controlledRoles
    .map((name) => roles.find((role) => role.name === name))
    .filter(Boolean);
  const highestManaged = managed.reduce((highest, role) => Math.max(highest, Number(role.position ?? 0)), 0);
  return {
    botRole: botRole?.name ?? null,
    botRolePosition: botRole ? Number(botRole.position ?? 0) : null,
    highestManagedRolePosition: highestManaged,
    canManageControlledRoles: Boolean(botRole && Number(botRole.position ?? 0) > highestManaged),
    fix: botRole && Number(botRole.position ?? 0) <= highestManaged
      ? 'Discord Server Settings -> Roles -> drag the SageBot/Sage Ideas bot role above Academy Member, Premium Member, and all path/level roles.'
      : null,
  };
}

function hasPrivilegedRole(member, rolesById) {
  return member.roles.some((roleId) => {
    const role = rolesById.get(roleId);
    if (!role) return false;
    if (privilegedRoleNames.has(role.name)) return true;
    const permissions = BigInt(role.permissions ?? '0');
    return Boolean(permissions & ADMINISTRATOR) || Boolean(permissions & MANAGE_GUILD);
  });
}

function memberLabel(member) {
  const user = member.user ?? {};
  const name = user.global_name || user.username || user.id;
  return `${name} (${user.id})`;
}

async function getApprovedDiscordUserIds(sb) {
  const approved = new Set();

  const { data: members, error: memberError } = await sb
    .from('discord_members')
    .select('discord_user_id')
    .eq('academy_member', true);
  if (memberError) throw new Error(`discord_members read failed: ${memberError.message}`);
  for (const row of members ?? []) approved.add(String(row.discord_user_id));

  const { data: applications, error: appError } = await sb
    .from('discord_member_applications')
    .select('discord_user_id')
    .eq('status', 'approved');
  if (appError) throw new Error(`discord_member_applications read failed: ${appError.message}`);
  for (const row of applications ?? []) approved.add(String(row.discord_user_id));

  return approved;
}

async function getPendingApplications(sb) {
  const { data, error } = await sb
    .from('discord_member_applications')
    .select('discord_user_id, discord_username, submitted_at')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
    .limit(100);
  if (error) throw new Error(`pending application read failed: ${error.message}`);
  return data ?? [];
}

async function postTeamOps(content) {
  const channels = await discordApi(`/guilds/${guildId}/channels`);
  const teamOps = channels.find((channel) => channel.name?.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '') === 'team-ops');
  if (!teamOps) return null;
  const message = await discordApi(`/channels/${teamOps.id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: content.slice(0, 2000) }),
  });
  return message.id;
}

try {
  const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const [botUser, guild, roles, approvedIds, pendingApplications] = await Promise.all([
    discordApi('/users/@me'),
    discordApi(`/guilds/${guildId}?with_counts=true`),
    discordApi(`/guilds/${guildId}/roles`),
    getApprovedDiscordUserIds(sb),
    getPendingApplications(sb),
  ]);
  const rolesById = roleMap(roles);
  const hierarchy = roleHierarchyStatus(roles, botUser.id);
  const controlledRoleIds = new Map(controlledRoles.map((name) => [name, roleIdByName(roles, name)]).filter(([, id]) => id));

  let members;
  try {
    members = await listMembers();
  } catch (err) {
    if (err.status === 403) {
      const result = {
        ok: false,
        enforce,
        blocked: 'discord_member_list_missing_access',
        memberCountEstimate: guild.approximate_member_count ?? null,
        reason: 'The bot cannot list guild members, so it cannot prove or enforce existing-member approval cleanup.',
        roleHierarchy: hierarchy,
        fix: [
          'Discord Developer Portal -> your SageBot application -> Bot -> enable Server Members Intent.',
          'Discord server -> Server Settings -> Integrations/SageBot -> confirm the bot can view members and manage roles.',
          'Make sure the SageBot role is above Academy Member, Premium Member, and path/level roles in Server Settings -> Roles.',
          'Rerun npm run discord:approval-audit, then npm run discord:approval-enforce.',
        ],
      };
      console.log(JSON.stringify(result, null, 2));
      process.exit(2);
    }
    throw err;
  }

  const skipped = [];
  const unapprovedWithAccess = [];
  const approvedMissingAccess = [];

  for (const member of members) {
    const userId = member.user?.id;
    if (!userId) continue;
    const memberControlledRoleIds = member.roles.filter((roleId) => [...controlledRoleIds.values()].includes(roleId));
    const hasControlledAccess = memberControlledRoleIds.length > 0;
    const approved = approvedIds.has(userId);
    const privileged = member.user?.bot || userId === guild.owner_id || hasPrivilegedRole(member, rolesById);

    if (privileged) {
      skipped.push({ id: userId, label: memberLabel(member), reason: member.user?.bot ? 'bot' : 'privileged' });
      continue;
    }

    if (!approved && hasControlledAccess) {
      unapprovedWithAccess.push({
        id: userId,
        label: memberLabel(member),
        roles: memberControlledRoleIds.map((roleId) => rolesById.get(roleId)?.name).filter(Boolean),
      });
    }

    if (approved && !member.roles.includes(controlledRoleIds.get('Academy Member'))) {
      approvedMissingAccess.push({ id: userId, label: memberLabel(member) });
    }
  }

  const removed = [];
  const errors = [];
  if (enforce) {
    for (const member of unapprovedWithAccess) {
      for (const roleName of member.roles) {
        const roleId = controlledRoleIds.get(roleName);
        if (!roleId) continue;
        try {
          await discordApi(`/guilds/${guildId}/members/${member.id}/roles/${roleId}`, { method: 'DELETE' });
          removed.push({ discordUserId: member.id, role: roleName });
        } catch (err) {
          errors.push({ discordUserId: member.id, role: roleName, error: err.message });
        }
      }
    }
    await postTeamOps([
      `Approval enforcement run complete. Removed ${removed.length} Sage access roles from ${unapprovedWithAccess.length} unapproved member(s).`,
      pendingApplications.length ? `${pendingApplications.length} pending application(s) are waiting for review.` : 'No pending applications found.',
      errors.length ? `${errors.length} role removal error(s) need manual review.` : null,
    ].filter(Boolean).join(' '));
  }

  const result = {
    ok: !errors.length && unapprovedWithAccess.length === 0,
    enforce,
    memberCount: members.length,
    memberCountEstimate: guild.approximate_member_count ?? null,
    roleHierarchy: hierarchy,
    roleHierarchyWarning: !hierarchy.canManageControlledRoles
      ? 'Discord returned equal role positions for the bot and managed roles. Enforcement will still attempt the API operation and report exact failures.'
      : null,
    approvedRecords: approvedIds.size,
    pendingApplications: pendingApplications.map((row) => ({
      discordUserId: String(row.discord_user_id),
      username: row.discord_username ? String(row.discord_username) : null,
      submittedAt: String(row.submitted_at),
    })),
    skipped,
    unapprovedWithAccess,
    approvedMissingAccess,
    removed,
    errors,
    nextStep: unapprovedWithAccess.length
      ? 'Run npm run discord:approval-enforce to remove Sage access roles from unapproved non-admin members.'
      : 'Approval gate is clean for currently visible guild members.',
  };

  console.log(JSON.stringify(result, null, 2));
  if (errors.length || (!enforce && unapprovedWithAccess.length)) process.exit(2);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
