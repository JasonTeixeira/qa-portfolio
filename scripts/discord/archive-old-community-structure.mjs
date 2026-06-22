#!/usr/bin/env node

const API = 'https://discord.com/api/v10';
const VIEW_CHANNEL = 1n << 10n;

const leanChannels = new Set([
  'start-here',
  'introductions',
  'daily-signal',
  'questions',
  'build-lab',
  'review-queue',
  'content-lab',
  'live-room',
  'resources',
  'wins-showcase',
  'premium',
  'team-ops',
  '01 START',
  '02 BUILD',
  '03 CONTENT',
  '04 LIVE',
  '05 PRIVATE',
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

function hiddenOverwrites(channel) {
  const overwrites = channel.permission_overwrites ?? [];
  const next = overwrites.filter((item) => item.id !== guildId);
  next.push({
    id: guildId,
    type: 0,
    deny: String(VIEW_CHANNEL),
  });
  return next;
}

const channels = await discordApi(`/guilds/${guildId}/channels`);
const archived = [];
const skipped = [];

for (const channel of channels) {
  const baseName = baseDiscordName(channel.name);
  if (leanChannels.has(baseName)) {
    skipped.push(channel.name);
    continue;
  }

  await discordApi(`/channels/${channel.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      permission_overwrites: hiddenOverwrites(channel),
    }),
  });
  archived.push(channel.name);
}

console.log(JSON.stringify({
  ok: true,
  archivedCount: archived.length,
  skippedLeanCount: skipped.length,
  archived,
  skipped,
  note: 'Archived by denying @everyone view access. No channels were deleted.',
}, null, 2));
