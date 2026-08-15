#!/usr/bin/env node

const API = 'https://discord.com/api/v10';

const requiredRoles = [
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

const requiredChannels = [
  'start-here',
  'academy-roadmap',
  'introductions',
  'announcements',
  'daily-signal',
  'questions',
  'ask-sage',
  'lesson-discussion',
  'build-lab',
  'project-submissions',
  'review-queue',
  'content-queue',
  'live-room',
  'office-hours',
  'accountability',
  'resources',
  'wins-showcase',
  'premium',
  'premium-reviews',
  'team-ops',
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

async function discordApi(path) {
  const response = await fetch(`${API}${path}`, {
    headers: {
      authorization: `Bot ${token}`,
      'content-type': 'application/json',
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`GET ${path} ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const [roles, channels] = await Promise.all([
  discordApi(`/guilds/${guildId}/roles`),
  discordApi(`/guilds/${guildId}/channels`),
]);

const roleNames = new Set(roles.map((role) => role.name));
const channelNames = new Set(channels.map((channel) => baseDiscordName(channel.name)));
const missingRoles = requiredRoles.filter((role) => !roleNames.has(role));
const missingChannels = requiredChannels.filter((channel) => !channelNames.has(channel));

console.log(JSON.stringify({
  ok: missingRoles.length === 0 && missingChannels.length === 0,
  required: {
    roles: requiredRoles.length,
    channels: requiredChannels.length,
  },
  missingRoles,
  missingChannels,
}, null, 2));

if (missingRoles.length || missingChannels.length) process.exit(2);
