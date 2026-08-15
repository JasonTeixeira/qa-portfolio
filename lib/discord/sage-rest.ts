import { sageLevelOptions, sagePathOptions, type SageLevelKey, type SagePathKey } from './sage-content';
import { planDiscordRoleRouting, type DiscordRoleRoutingInput, type DiscordRoleRoutingPlan } from './role-routing';
import { buildSageContentEmbed, type DiscordMessagePayload } from './message-formatting';

const DISCORD_API = 'https://discord.com/api/v10';

type DiscordRole = { id: string; name: string };
type DiscordChannel = { id: string; name: string; type: number };

function cleanEnv(value: string | undefined): string | undefined {
  return value?.replace(/\\n/g, '').trim();
}

function botToken(): string {
  const token = cleanEnv(process.env.DISCORD_BOT_TOKEN);
  if (!token) throw new Error('DISCORD_BOT_TOKEN missing');
  return token;
}

function guildId(): string {
  const id = cleanEnv(process.env.DISCORD_GUILD_ID);
  if (!id) throw new Error('DISCORD_GUILD_ID missing');
  return id;
}

export function baseDiscordName(name: string): string {
  const categories = [
    'START HERE',
    'DAILY SIGNAL',
    'LEARNING PATHS',
    'BUILD LAB',
    'LIVE EDUCATION',
    'CONTENT ENGINE',
    'RESOURCES',
    'PREMIUM MEMBERS',
    'TEAM OPS',
  ];
  const category = categories.find((candidate) => name.endsWith(candidate));
  if (category) return category;
  return name.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '');
}

export async function discordApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    ...init,
    headers: {
      authorization: `Bot ${botToken()}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path} ${response.status}: ${text}`);
  }
  return body as T;
}

export async function getGuildRoles(): Promise<DiscordRole[]> {
  return discordApi<DiscordRole[]>(`/guilds/${guildId()}/roles`);
}

export async function getGuildChannels(): Promise<DiscordChannel[]> {
  return discordApi<DiscordChannel[]>(`/guilds/${guildId()}/channels`);
}

export async function findRoleIdByName(name: string): Promise<string | null> {
  const roles = await getGuildRoles();
  return roles.find((role) => role.name === name)?.id ?? null;
}

export async function roleIdsByName(names: string[]): Promise<Set<string>> {
  const roleNames = new Set(names);
  const roles = await getGuildRoles();
  return new Set(roles.filter((role) => roleNames.has(role.name)).map((role) => role.id));
}

export async function findChannelIdByBaseName(name: string): Promise<string | null> {
  const channels = await getGuildChannels();
  return channels.find((channel) => baseDiscordName(channel.name) === name)?.id ?? null;
}

export async function assignRole(userId: string, roleName: string): Promise<boolean> {
  const roleId = await findRoleIdByName(roleName);
  if (!roleId) return false;
  await discordApi(`/guilds/${guildId()}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    body: '{}',
  });
  return true;
}

export async function removeRole(userId: string, roleName: string): Promise<boolean> {
  const roleId = await findRoleIdByName(roleName);
  if (!roleId) return false;
  await discordApi(`/guilds/${guildId()}/members/${userId}/roles/${roleId}`, {
    method: 'DELETE',
  });
  return true;
}

export async function assignPathRole(userId: string, key: SagePathKey): Promise<string | null> {
  const path = sagePathOptions.find((option) => option.key === key);
  if (!path) return null;
  await assignRole(userId, path.role);
  await assignRole(userId, 'Academy Member');
  return path.channel;
}

export async function assignLevelRole(userId: string, key: SageLevelKey): Promise<string | null> {
  const level = sageLevelOptions.find((option) => option.key === key);
  if (!level) return null;
  await assignRole(userId, level.role);
  await assignRole(userId, 'Academy Member');
  return level.role;
}

export async function applyDiscordRoleRouting(
  userId: string,
  input: DiscordRoleRoutingInput,
): Promise<DiscordRoleRoutingPlan> {
  const plan = planDiscordRoleRouting(input);
  for (const role of plan.rolesToRemove) {
    await removeRole(userId, role);
  }
  for (const role of plan.rolesToAdd) {
    await assignRole(userId, role);
  }
  return plan;
}

export async function postMessageToChannelByBaseName(name: string, payload: DiscordMessagePayload): Promise<string | null> {
  const channelId = await findChannelIdByBaseName(name);
  if (!channelId) return null;
  const message = await discordApi<{ id: string }>(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return message.id;
}

export async function postToChannelByBaseName(
  name: string,
  content: string,
  options: { embed?: boolean; title?: string | null; variant?: 'sage' | 'signal' | 'answer' | 'win' | 'warning'; footer?: string | null } = {},
): Promise<string | null> {
  if (options.embed) {
    return postMessageToChannelByBaseName(name, buildSageContentEmbed({
      title: options.title,
      body: content,
      variant: options.variant,
      footer: options.footer,
    }));
  }
  return postMessageToChannelByBaseName(name, { content: content.slice(0, 2000) });
}

export async function getRecentChannelMessages(
  channelBaseName: string,
  limit = 25,
): Promise<Array<{ id: string; content: string; timestamp: string; author?: { bot?: boolean; username?: string } }>> {
  const channelId = await findChannelIdByBaseName(channelBaseName);
  if (!channelId) return [];
  return discordApi(`/channels/${channelId}/messages?limit=${limit}`);
}
