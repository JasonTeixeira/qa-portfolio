#!/usr/bin/env node

const API = 'https://discord.com/api/v10';

const posts = {
  'start-here': {
    topic: 'Start here: read the rules, apply with /apply, wait for approval, then run /onboard.',
    title: 'Start Here',
    body: [
      'Sage Ideas Academy is for builders learning AI apps, websites, automation, cloud, content engines, and product systems by shipping useful work.',
      '',
      '**How to get access**',
      '1. Read the rules and quality bar below.',
      '2. Run `/apply` with your goal, experience, first build, and rules accepted.',
      '3. Wait for manual approval. Unapproved members only see this channel.',
      '4. After approval, run `/onboard`, then `/checklist`.',
      '',
      '**Quality bar**',
      '- Ask with context: goal, current attempt, blocker, link/screenshot when useful.',
      '- Share work in progress. Specific drafts beat polished vagueness.',
      '- No spam, low-effort AI dumps, fake urgency, vague self-promo, or advice outside your lane.',
      '- Critique should make the artifact stronger.',
      '',
      'Premium is optional. Use `/premium` after you have seen the room and want priority critique/deeper review.',
    ],
  },
  'daily-signal': {
    topic: 'Daily useful prompt, quiz, build challenge, streaks, and points.',
    title: 'Daily Signal',
    body: [
      'This is the daily engagement loop: one useful prompt, one quiz, one build challenge.',
      '',
      '**Use these commands**',
      '- `/daily` - see the full daily signal and mark the daily step complete.',
      '- `/quiz` - answer the quiz and earn points.',
      '- `/challenge` - see the challenge.',
      '- `/submit-challenge` - submit the artifact and earn challenge points.',
      '- `/points` - see points, rank, and streak.',
      '',
      'A good daily response produces an artifact: spec, screenshot, test, teardown, checklist, diagram, or before/after.',
    ],
  },
  questions: {
    topic: 'Main Q&A room for structured questions, useful answers, helpful marks, and unanswered-question tracking.',
    title: 'Questions',
    body: [
      'This is the main interaction room. Ask specific questions, answer other members, and turn useful threads into resources.',
      '',
      '**Question format**',
      '```text',
      'Question:',
      'Goal/context:',
      'What I tried:',
      'Link/screenshot:',
      'What answer would help:',
      '```',
      '',
      '**Use these commands**',
      '- `/ask` - post a structured question and earn 5 points.',
      '- `/answer` - answer a tracked question and earn 10 points.',
      '- `/mark-helpful` - moderator/admin marks a useful answer and gives a 15 point bonus.',
      '- `/weekly-winners` - see helpers, leaders, and open questions.',
      '',
      'Intro posts can also go here. After posting an intro, run `/complete-step step:intro`.',
    ],
  },
  'build-lab': {
    topic: 'Project specs, shipping updates, technical questions, and build help.',
    title: 'Build Lab',
    body: [
      'Use this for real projects, not abstract ideas. The goal is to move from idea to artifact.',
      '',
      '**First project template**',
      '```text',
      'Project:',
      'User/problem:',
      'Smallest useful version:',
      'Stack:',
      'Acceptance criteria:',
      'What is out of scope:',
      'What I need reviewed:',
      'Link/screenshot:',
      '```',
      '',
      'Use `/submit-project` to route the project into the build pipeline.',
    ],
  },
  'review-queue': {
    topic: 'Focused design, code, AI, SEO, cloud, and architecture review requests.',
    title: 'Review Queue',
    body: [
      'Ask for critique when there is an artifact to inspect. Good review requests are narrow.',
      '',
      '**Useful review format**',
      '```text',
      'Type: design/code/AI/architecture/SEO/cloud',
      'Artifact link or screenshot:',
      'What I want reviewed:',
      'What I already tried:',
      'Decision I am stuck on:',
      'Deadline/context:',
      '```',
      '',
      'Use `/request-review`. Premium members get priority/deeper teardown when queue volume is high.',
    ],
  },
  resources: {
    topic: 'Templates, stack guides, prompts, reading lists, tools, and resource drops.',
    title: 'Resource Index',
    body: [
      'This is the clean library. Keep discussion in other channels; resources here should be reusable.',
      '',
      '**Resource types**',
      '- Project spec templates.',
      '- Review templates.',
      '- AI workflow/eval checklists.',
      '- Landing page/proof templates.',
      '- Content engine workflows.',
      '- Cloud/deploy checklists.',
      '',
      'If a resource is missing, ask in `questions` or capture the gap with `/capture-content`.',
    ],
  },
  wins: {
    topic: 'Ships, wins, proof screenshots, launches, and weekly recap inputs.',
    title: 'Wins',
    body: [
      'Post visible progress here. Wins do not need to be huge; they need to be concrete.',
      '',
      '**Good wins**',
      '- Shipped a feature, page, workflow, article, automation, or deploy.',
      '- Fixed a bug with before/after evidence.',
      '- Finished a review cycle and improved the artifact.',
      '- Learned a reusable lesson from a failed attempt.',
      '',
      'Weekly recap pulls from this channel, build-lab, questions, challenge submissions, and leaderboard data.',
    ],
  },
  premium: {
    topic: 'Premium critique, priority review, advanced drops, replays, and deeper builder support.',
    title: 'Premium Promise',
    body: [
      'Premium is for members who want tighter feedback and deeper build support.',
      '',
      '**Premium member promise**',
      '- Private premium room access.',
      '- Priority challenge/review flow.',
      '- Deeper teardown posts and advanced drops.',
      '- Weekly office-hours priority when sessions run.',
      '- Premium replays/notes when available.',
      '- Early access to templates/checklists before public release.',
      '',
      'Use `/premium` for checkout. Current founding price: $29/month.',
    ],
  },
  'team-ops': {
    topic: 'Private moderation, reports, approval queue, analytics review, and admin operations.',
    title: 'Team Ops Runbook',
    body: [
      'This is the admin operating room.',
      '',
      '**Daily**',
      '- Review `/pending` applications or use the admin dashboard.',
      '- Approve only people with a clear build/learning goal and accepted rules.',
      '- Route reports/spam quickly.',
      '',
      '**Weekly**',
      '- Post weekly recap.',
      '- Review leaderboard and challenge submissions.',
      '- Promote top questions into resources/content.',
      '- Feature useful wins and strong review threads.',
      '',
      '**Reject/remove**',
      'Spam, vague self-promo, harassment, low-effort AI dumping, repeated off-topic posting, and anything that lowers trust.',
    ],
  },
};

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

function contentFor(channelName, post) {
  return [
    `<!-- SAGEBOT_OPERATING_POST:${channelName}:v1 -->`,
    `# ${post.title}`,
    '',
    ...post.body,
  ].join('\n').slice(0, 2000);
}

const channels = await discordApi(`/guilds/${guildId}/channels`);
const results = [];

for (const [channelName, post] of Object.entries(posts)) {
  const channel = channels.find((item) => item.type !== 4 && baseDiscordName(item.name) === channelName);
  if (!channel) {
    results.push({ channel: channelName, ok: false, reason: 'missing_channel' });
    continue;
  }

  await discordApi(`/channels/${channel.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ topic: post.topic }),
  });

  const marker = `SAGEBOT_OPERATING_POST:${channelName}:v1`;
  const recent = await discordApi(`/channels/${channel.id}/messages?limit=50`);
  const existing = recent.find((message) => message.author?.bot && message.content?.includes(marker));
  const content = contentFor(channelName, post);
  const message = existing
    ? await discordApi(`/channels/${channel.id}/messages/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    })
    : await discordApi(`/channels/${channel.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

  await discordApi(`/channels/${channel.id}/pins/${message.id}`, { method: 'PUT' });
  results.push({ channel: channelName, ok: true, messageId: message.id, pinned: true });
}

console.log(JSON.stringify({ ok: results.every((item) => item.ok), results }, null, 2));
