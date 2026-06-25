#!/usr/bin/env node

const API = 'https://discord.com/api/v10';
const TEXT_CHANNEL = 0;
const VIEW_CHANNEL = 1n << 10n;
const SEND_MESSAGES = 1n << 11n;
const READ_MESSAGE_HISTORY = 1n << 16n;

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
  { name: 'start-here', displayName: '✦｜start-here', topic: 'Welcome, rules, onboarding instructions, and first action.', readOnly: true },
  { name: 'academy-roadmap', displayName: '✥｜academy-roadmap', topic: 'Read-only Academy map: how paths, levels, projects, points, premium, and weekly rhythm work.', readOnly: true },
  { name: 'introductions', displayName: '◇｜introductions', topic: 'Approved-member intros: goal, current build, level, and first help request.' },
  { name: 'announcements', displayName: '✶｜announcements', topic: 'Read-only Academy updates, challenge launches, live sessions, releases, and important operating notices.', readOnly: true },
  { name: 'daily-signal', displayName: '◆｜daily-signal', topic: 'Daily build prompt, AI pattern, and community question.' },
  { name: 'questions', displayName: '⌕｜questions', topic: 'Main Q&A room for structured questions, useful answers, helpful marks, and unanswered-question tracking.' },
  { name: 'ask-sage', displayName: '◈｜ask-sage', topic: 'Dedicated SageBot and RAG question lane.' },
  { name: 'lesson-discussion', displayName: '⎋｜lesson-discussion', topic: 'Discussion and questions tied to lessons, modules, walkthroughs, and Academy material.' },
  { name: 'build-lab', displayName: '▣｜build-lab', topic: 'Project specs, shipping updates, technical questions, and build help.' },
  { name: 'project-submissions', displayName: '▤｜project-submissions', topic: 'Structured project submissions for review, points, showcase candidates, and member progress tracking.' },
  { name: 'review-queue', displayName: '◎｜review-queue', topic: 'Design, code, AI, SEO, cloud, and architecture review requests.' },
  { name: 'content-queue', displayName: '▱｜content-queue', topic: 'Captured questions, content ideas, resource gaps, and approved draft inputs.' },
  { name: 'live-room', displayName: '◐｜live-room', topic: 'Office-hours queue, live session notes, and replay follow-up.' },
  { name: 'office-hours', displayName: '◑｜office-hours', topic: 'Office-hours schedule, agenda, submitted questions, session notes, and replay links.' },
  { name: 'accountability', displayName: '◍｜accountability', topic: 'Weekly goals, check-ins, shipping commitments, and progress nudges.' },
  { name: 'resources', displayName: '◌｜resources', topic: 'Templates, stack guides, reading list, prompts, tools, and resource drops.', readOnly: true },
  { name: 'wins-showcase', displayName: '★｜wins-showcase', topic: 'Ships, wins, proof screenshots, launches, and weekly recap.' },
  { name: 'premium', displayName: '✧｜premium', topic: 'Premium critique, advanced drops, replays, and deeper help.', premiumOnly: true },
  { name: 'premium-reviews', displayName: '✩｜premium-reviews', topic: 'Premium-only structured reviews, deeper teardowns, and priority critique queue.', premiumOnly: true },
  { name: 'team-ops', displayName: '■｜team-ops', topic: 'Private moderation, reports, analytics review, and admin operations.', opsOnly: true },
];

const startHereMessage = [
  '# Welcome to Sage Ideas Academy',
  '',
  'This community is for people building real AI apps, websites, automations, content systems, cloud systems, and product foundations. The standard is simple: ship useful work, ask specific questions, show your thinking, and help others move faster.',
  '',
  '## Start here',
  '1. Read the quality bar below.',
  '2. Complete the Discord application questions.',
  '3. Confirm rules acceptance in the application.',
  '4. Wait for manual approval.',
  '5. After approval, run `/onboard`.',
  '6. Post your intro in `introductions` with the template below.',
  '7. Submit your first project with `/submit-project`.',
  '8. Ask for focused critique with `/request-review`.',
  '9. Use `questions` for help, `ask-sage` for bot/RAG help, `content-queue` for reusable ideas, `resources` for approved assets, and `live-room` for office-hours questions.',
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
const updated = [];

for (const [position, channel] of channelPlan.entries()) {
  const current = existingByBaseName.get(channel.name);
  if (current) {
    existing.push(channel.name);
    await discordApi(`/channels/${current.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: channel.displayName,
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
      }),
    });
    updated.push(channel.name);
    continue;
  }

  const payload = {
    name: channel.displayName,
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
  const alreadyPosted = messages.some((message) => message.author?.bot && message.content.includes('# Welcome to Sage Ideas Academy'));
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
  updated,
  startHerePosted: Boolean(startHere),
  note: 'Provisioned lean 20-channel Sage Ideas Academy layout with restrained symbol prefixes.',
}, null, 2));
