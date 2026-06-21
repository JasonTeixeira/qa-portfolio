#!/usr/bin/env node

const API = 'https://discord.com/api/v10';
const VIEW_CHANNEL = 1n << 10n;
const SEND_MESSAGES = 1n << 11n;
const READ_MESSAGE_HISTORY = 1n << 16n;

const memberChannels = [
  'daily-signal',
  'questions',
  'build-lab',
  'review-queue',
  'resources',
  'wins',
];

const requiredChannels = ['start-here', ...memberChannels, 'premium', 'team-ops'];

function cleanEnv(value) {
  return value?.replace(/\\n/g, '').trim();
}

const token = cleanEnv(process.env.DISCORD_BOT_TOKEN);
const guildId = cleanEnv(process.env.DISCORD_GUILD_ID);

if (!token || !guildId) {
  console.error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID.');
  process.exit(1);
}

function baseDiscordName(name) {
  return name.replace(/^[^a-z0-9]+/i, '').replace(/^[-|｜・]+/, '');
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

function roleId(roles, name) {
  return roles.find((role) => role.name === name)?.id;
}

function overwritesFor(channelName, ids) {
  if (channelName === 'start-here') {
    return [
      {
        id: ids.everyone,
        type: 0,
        allow: String(VIEW_CHANNEL | READ_MESSAGE_HISTORY),
        deny: String(SEND_MESSAGES),
      },
    ];
  }

  if (channelName === 'premium') {
    return [
      { id: ids.everyone, type: 0, deny: String(VIEW_CHANNEL) },
      { id: ids.premium, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
    ].filter((item) => item.id);
  }

  if (channelName === 'team-ops') {
    return [
      { id: ids.everyone, type: 0, deny: String(VIEW_CHANNEL) },
      { id: ids.founder, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
      { id: ids.admin, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
      { id: ids.moderator, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
    ].filter((item) => item.id);
  }

  return [
    { id: ids.everyone, type: 0, deny: String(VIEW_CHANNEL) },
    { id: ids.academy, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
  ].filter((item) => item.id);
}

const [roles, channels] = await Promise.all([
  discordApi(`/guilds/${guildId}/roles`),
  discordApi(`/guilds/${guildId}/channels`),
]);

const ids = {
  everyone: guildId,
  academy: roleId(roles, 'Academy Member'),
  premium: roleId(roles, 'Premium Member'),
  founder: roleId(roles, 'Founder'),
  admin: roleId(roles, 'Admin'),
  moderator: roleId(roles, 'Moderator'),
};

if (!ids.academy || !ids.premium) {
  console.error('Missing Academy Member or Premium Member role.');
  process.exit(2);
}

const updated = [];
for (const channelName of requiredChannels) {
  const channel = channels.find((item) => baseDiscordName(item.name) === channelName);
  if (!channel) {
    console.error(`Missing channel: ${channelName}`);
    process.exit(3);
  }
  await discordApi(`/channels/${channel.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ permission_overwrites: overwritesFor(channelName, ids) }),
  });
  updated.push(channelName);
}

console.log(JSON.stringify({
  ok: true,
  updated,
  note: 'Approval gate enforced. Unapproved members can only see start-here.',
}, null, 2));
