#!/usr/bin/env node

const API = 'https://discord.com/api/v10';

const nonMentionableRoles = new Set([
  'Moderator',
  'Mentor',
  'AI Engineer',
  'Builder',
  'Web Builder',
  'Cloud Builder',
  'Content Builder',
  'Growth Builder',
  'Beginner',
  'Academy Member',
  'Contributor',
  'Premium Member',
]);

const roleColors = new Map([
  ['Founder', 0xf8fafc],
  ['Admin', 0x38bdf8],
  ['Moderator', 0xa78bfa],
  ['Mentor', 0xf59e0b],
  ['Premium Member', 0xfacc15],
  ['Academy Member', 0x22c55e],
  ['Contributor', 0x14b8a6],
  ['AI Engineer', 0x60a5fa],
  ['Builder', 0x94a3b8],
  ['Web Builder', 0xfb7185],
  ['Cloud Builder', 0x818cf8],
  ['Content Builder', 0x34d399],
  ['Growth Builder', 0xf97316],
  ['Beginner', 0xa3a3a3],
]);

function cleanEnv(value) {
  return value?.replace(/\\n/g, '').trim();
}

const token = cleanEnv(process.env.DISCORD_BOT_TOKEN);
const guildId = cleanEnv(process.env.DISCORD_GUILD_ID);

if (!token || !guildId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID.');
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
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const guild = await discordApi(`/guilds/${guildId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    verification_level: 1,
    default_message_notifications: 1,
    explicit_content_filter: 2,
  }),
});

const roles = await discordApi(`/guilds/${guildId}/roles`);
const updatedRoles = [];
for (const role of roles) {
  if (role.managed) continue;
  const patch = {};
  if (nonMentionableRoles.has(role.name) && role.mentionable !== false) patch.mentionable = false;
  if (roleColors.has(role.name) && role.color !== roleColors.get(role.name)) patch.color = roleColors.get(role.name);
  if (Object.keys(patch).length === 0) continue;
  await discordApi(`/guilds/${guildId}/roles/${role.id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  updatedRoles.push(role.name);
}

console.log(JSON.stringify({
  ok: true,
  guild: {
    verification_level: guild.verification_level,
    default_message_notifications: guild.default_message_notifications,
    explicit_content_filter: guild.explicit_content_filter,
  },
  updatedRoles,
  note: 'Guild hardened for a gated builder community: email verification, mentions-only default notifications, all-member media filtering, non-mentionable member roles, and consistent role colors.',
}, null, 2));
