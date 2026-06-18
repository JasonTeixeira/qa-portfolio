#!/usr/bin/env node

const API = 'https://discord.com/api/v10';

const commands = [
  {
    name: 'onboard',
    description: 'Start Sage Ideas Academy onboarding with path and level selectors.',
  },
  {
    name: 'choose-path',
    description: 'Choose or update your Sage Ideas Academy learning path.',
    options: [
      {
        name: 'path',
        description: 'Primary learning path',
        type: 3,
        required: true,
        choices: [
          ['AI Apps', 'ai_apps'],
          ['Full-Stack Development', 'full_stack'],
          ['Websites + Design', 'web_design'],
          ['Cloud + DevOps', 'cloud_devops'],
          ['AI Agents + Automation', 'agents_automation'],
          ['SEO + Content Engine', 'seo_content'],
          ['Ads + Growth', 'ads_growth'],
          ['Architecture + Systems', 'architecture'],
        ].map(([name, value]) => ({ name, value })),
      },
    ],
  },
  {
    name: 'submit-project',
    description: 'Submit a project into the Build Lab pipeline.',
    options: [
      { name: 'title', description: 'Project title', type: 3, required: true },
      { name: 'path', description: 'Learning path', type: 3, required: true },
      { name: 'goal', description: 'What this project should accomplish', type: 3, required: true },
      { name: 'link', description: 'Optional repo, demo, screenshot, or doc link', type: 3, required: false },
    ],
  },
  {
    name: 'request-review',
    description: 'Request code, design, AI, SEO, cloud, or architecture review.',
    options: [
      {
        name: 'type',
        description: 'Review type',
        type: 3,
        required: true,
        choices: [
          ['Design', 'design'],
          ['Code', 'code'],
          ['AI workflow', 'ai'],
          ['Architecture', 'architecture'],
          ['SEO/content', 'seo'],
          ['Cloud/devops', 'cloud'],
        ].map(([name, value]) => ({ name, value })),
      },
      { name: 'summary', description: 'What should be reviewed?', type: 3, required: true },
      { name: 'link', description: 'Optional link or screenshot', type: 3, required: false },
    ],
  },
  {
    name: 'capture-content',
    description: 'Capture a question, lesson, win, or project moment into the content engine.',
    options: [
      { name: 'idea', description: 'Content-worthy question, lesson, win, or angle', type: 3, required: true },
      { name: 'source', description: 'Optional source/context', type: 3, required: false },
    ],
  },
  {
    name: 'daily-prompt',
    description: 'Post or preview today’s build prompt, AI tool, and discussion question.',
    options: [
      {
        name: 'mode',
        description: 'Preview privately or post publicly',
        type: 3,
        required: false,
        choices: [
          { name: 'Preview', value: 'preview' },
          { name: 'Post', value: 'post' },
        ],
      },
    ],
  },
  {
    name: 'weekly-recap',
    description: 'Generate a lightweight weekly recap from showcase, wins, and content channels.',
    options: [
      {
        name: 'mode',
        description: 'Preview privately or post to weekly schedule',
        type: 3,
        required: false,
        choices: [
          { name: 'Preview', value: 'preview' },
          { name: 'Post', value: 'post' },
        ],
      },
    ],
  },
  {
    name: 'resource',
    description: 'Get the right Sage Ideas resource channel for a need.',
    options: [{ name: 'need', description: 'What do you need help finding?', type: 3, required: true }],
  },
  {
    name: 'office-hours',
    description: 'Get the office-hours format and submit a question.',
    options: [{ name: 'question', description: 'Optional office-hours question', type: 3, required: false }],
  },
  {
    name: 'report',
    description: 'Privately route a moderation, spam, safety, or quality issue to Team Ops.',
    options: [{ name: 'issue', description: 'What should moderators review?', type: 3, required: true }],
  },
  {
    name: 'premium',
    description: 'Get the premium membership checkout link and unlock Premium Member access.',
  },
];

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !appId || !guildId) {
  console.error('Missing DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, or DISCORD_GUILD_ID.');
  process.exit(1);
}

const response = await fetch(`${API}/applications/${appId}/guilds/${guildId}/commands`, {
  method: 'PUT',
  headers: {
    authorization: `Bot ${token}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify(commands),
});

const body = await response.text();
if (!response.ok) {
  console.error(body);
  process.exit(1);
}

const registered = JSON.parse(body);
console.log(`Registered ${registered.length} SageBot commands.`);
