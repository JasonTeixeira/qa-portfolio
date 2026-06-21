#!/usr/bin/env node

const API = 'https://discord.com/api/v10';
const TEXT_CHANNEL = 0;
const VIEW_CHANNEL = 1n << 10n;
const SEND_MESSAGES = 1n << 11n;
const READ_MESSAGE_HISTORY = 1n << 16n;
const MANAGE_MESSAGES = 1n << 13n;

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

const channelPlan = [
  { name: 'start-here', topic: 'Welcome, rules, onboarding instructions, and first action.', readOnly: true },
  { name: 'daily-signal', topic: 'Daily build prompt, AI pattern, and community question.' },
  { name: 'questions', topic: 'Main Q&A room for structured questions, useful answers, helpful marks, and unanswered-question tracking.' },
  { name: 'build-lab', topic: 'Project specs, shipping updates, technical questions, and build help.' },
  { name: 'review-queue', topic: 'Design, code, AI, SEO, cloud, and architecture review requests.' },
  { name: 'resources', topic: 'Templates, stack guides, reading list, prompts, tools, and resource drops.', readOnly: true },
  { name: 'wins', topic: 'Ships, wins, proof screenshots, launches, and weekly recap.' },
  { name: 'premium', topic: 'Premium critique, advanced drops, replays, and deeper help.', premiumOnly: true },
  { name: 'team-ops', topic: 'Private moderation, reports, analytics review, and admin operations.', opsOnly: true },
];

const startHereMessage = [
  '# Welcome to Sage Ideas Academy',
  '',
  'This community is for people building real AI apps, websites, automations, content systems, cloud systems, and product foundations. The standard is simple: ship useful work, ask specific questions, show your thinking, and help others move faster.',
  '',
  '## Start here',
  '1. Read the quality bar below.',
  '2. Run `/apply`.',
  '3. Answer the application questions and confirm rules acceptance.',
  '4. Wait for manual approval.',
  '5. After approval, run `/onboard`.',
  '6. Post your intro in `questions` with the template below.',
  '7. Submit your first project with `/submit-project`.',
  '8. Ask for focused critique with `/request-review`.',
  '',
  '## Quality bar',
  '- Ask with context: goal, current attempt, blocker, and link/screenshot when possible.',
  '- Share work in progress. Do not wait until it is polished.',
  '- No spam, vague self-promo, fake urgency, low-effort AI dumps, or financial/legal/medical advice.',
  '- Respect critique. The goal is stronger work, not softer feedback.',
  '- Keep threads useful enough that a future member can learn from them.',
  '',
  '## Intro template',
  '```text',
  'Name:',
  'Path:',
  'Current level:',
  'What I am building:',
  'What I want to get better at:',
  'Current blocker:',
  'One link or screenshot, if useful:',
  '```',
].join('\n');

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

function permissionOverwrites({ everyoneId, premiumRoleId, academyRoleId, readOnly, premiumOnly, opsOnly }) {
  if (opsOnly) {
    return [
      {
        id: everyoneId,
        type: 0,
        deny: String(VIEW_CHANNEL),
      },
    ];
  }

  if (premiumOnly) {
    const overwrites = [
      {
        id: everyoneId,
        type: 0,
        deny: String(VIEW_CHANNEL),
      },
    ];
    if (premiumRoleId) {
      overwrites.push({
        id: premiumRoleId,
        type: 0,
        allow: String(VIEW_CHANNEL | SEND_MESSAGES | READ_MESSAGE_HISTORY),
      });
    }
    return overwrites;
  }

  if (readOnly) {
    const overwrites = [
      {
        id: everyoneId,
        type: 0,
        deny: String(SEND_MESSAGES),
      },
    ];
    if (academyRoleId) {
      overwrites.push({
        id: academyRoleId,
        type: 0,
        allow: String(VIEW_CHANNEL | READ_MESSAGE_HISTORY),
        deny: String(SEND_MESSAGES),
      });
    }
    return overwrites;
  }

  return [];
}

const [roles, channels] = await Promise.all([
  discordApi(`/guilds/${guildId}/roles`),
  discordApi(`/guilds/${guildId}/channels`),
]);

const roleByName = new Map(roles.map((role) => [role.name, role]));
const missingRoles = requiredRoles.filter((role) => !roleByName.has(role));
if (missingRoles.length) {
  console.error(`Missing roles: ${missingRoles.join(', ')}`);
  process.exit(2);
}

const existingByBaseName = new Map(channels.map((channel) => [baseDiscordName(channel.name), channel]));
const created = [];
const existing = [];

for (const [position, channel] of channelPlan.entries()) {
  const current = existingByBaseName.get(channel.name);
  if (current) {
    existing.push(channel.name);
    continue;
  }

  const payload = {
    name: channel.name,
    type: TEXT_CHANNEL,
    topic: channel.topic,
    position,
    permission_overwrites: permissionOverwrites({
      everyoneId: guildId,
      premiumRoleId: roleByName.get('Premium Member')?.id,
      academyRoleId: roleByName.get('Academy Member')?.id,
      readOnly: channel.readOnly,
      premiumOnly: channel.premiumOnly,
      opsOnly: channel.opsOnly,
    }),
  };

  const createdChannel = await discordApi(`/guilds/${guildId}/channels`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  created.push(createdChannel.name);
  existingByBaseName.set(channel.name, createdChannel);
}

const startHere = existingByBaseName.get('start-here');
if (startHere) {
  const messages = await discordApi(`/channels/${startHere.id}/messages?limit=20`);
  const alreadyPosted = messages.some((message) => message.author?.bot && message.content.includes('Run `/apply`'));
  if (!alreadyPosted) {
    await discordApi(`/channels/${startHere.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: startHereMessage }),
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  created,
  existing,
  startHerePosted: Boolean(startHere),
  note: 'Provisioned lean Sage Ideas Discord channels. Existing channels were left untouched.',
}, null, 2));
