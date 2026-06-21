#!/usr/bin/env node

const API = 'https://discord.com/api/v10';
const VIEW_CHANNEL = 1n << 10n;
const SEND_MESSAGES = 1n << 11n;
const READ_MESSAGE_HISTORY = 1n << 16n;

const layout = [
  {
    name: '01 START',
    channels: ['start-here'],
  },
  {
    name: '02 BUILD',
    channels: ['daily-signal', 'questions', 'build-lab', 'review-queue'],
  },
  {
    name: '03 CONTENT',
    channels: ['content-lab', 'resources', 'wins-showcase'],
  },
  {
    name: '04 LIVE',
    channels: ['live-room'],
  },
  {
    name: '05 PRIVATE',
    channels: ['premium', 'team-ops'],
  },
];

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
  if (channelName === '01 START') {
    return [
      {
        id: ids.everyone,
        type: 0,
        allow: String(VIEW_CHANNEL | READ_MESSAGE_HISTORY),
        deny: String(SEND_MESSAGES),
      },
    ];
  }
  if (channelName === '05 PRIVATE') {
    return [
      { id: ids.everyone, type: 0, deny: String(VIEW_CHANNEL) },
      { id: ids.founder, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
      { id: ids.admin, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
      { id: ids.moderator, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
      { id: ids.premium, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
    ].filter((item) => item.id);
  }
  return [
    { id: ids.everyone, type: 0, deny: String(VIEW_CHANNEL) },
    { id: ids.academy, type: 0, allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY) },
  ].filter((item) => item.id);
}

const [roles, initialChannels] = await Promise.all([
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

const categoryIds = new Map();
let channels = initialChannels;

for (const category of layout) {
  let existing = channels.find((channel) => channel.type === 4 && channel.name === category.name);
  if (!existing) {
    existing = await discordApi(`/guilds/${guildId}/channels`, {
      method: 'POST',
      body: JSON.stringify({
        name: category.name,
        type: 4,
        permission_overwrites: overwritesFor(category.name, ids),
      }),
    });
    channels = await discordApi(`/guilds/${guildId}/channels`);
  } else {
    await discordApi(`/channels/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ permission_overwrites: overwritesFor(category.name, ids) }),
    });
  }
  categoryIds.set(category.name, existing.id);
}

const moved = [];
let position = 0;
for (const category of layout) {
  for (const baseName of category.channels) {
    const channel = channels.find((item) => item.type !== 4 && baseDiscordName(item.name) === baseName);
    if (!channel) {
      console.error(`Missing channel: ${baseName}`);
      process.exit(2);
    }
    await discordApi(`/channels/${channel.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        parent_id: categoryIds.get(category.name),
        position,
      }),
    });
    moved.push(`${baseName} -> ${category.name}`);
    position += 1;
  }
}

console.log(JSON.stringify({
  ok: true,
  categories: [...categoryIds.keys()],
  moved,
  note: 'Lean 11-channel model categorized. No text channels were added.',
}, null, 2));
