import {
  dailyAiTools,
  dailyBuildPrompts,
  dailyQuestions,
  pickDaily,
  sageLevelOptions,
  sagePathOptions,
  weeklyCadence,
  type SageLevelKey,
  type SagePathKey,
} from './sage-content';
import {
  assignLevelRole,
  assignPathRole,
  getRecentChannelMessages,
  postToChannelByBaseName,
} from './sage-rest';
import { createDiscordPremiumCheckout } from './premium';
import { recordDiscordEvent, recordDiscordScheduledRun, upsertDiscordMember } from './analytics';

const RESPONSE_TYPE_CHANNEL_MESSAGE = 4;
const RESPONSE_TYPE_UPDATE_MESSAGE = 7;
const EPHEMERAL_FLAG = 64;

type DiscordOption = {
  name: string;
  value?: string;
  options?: DiscordOption[];
};

export type DiscordInteractionPayload = {
  type?: number;
  data?: {
    name?: string;
    custom_id?: string;
    values?: string[];
    options?: DiscordOption[];
  };
  member?: {
    user?: { id: string; username?: string };
  };
  user?: { id: string; username?: string };
  channel_id?: string;
};

type InteractionResponse = {
  type: number;
  data?: Record<string, unknown>;
};

function optionValue(payload: DiscordInteractionPayload, name: string): string {
  const option = payload.data?.options?.find((item) => item.name === name);
  return String(option?.value ?? '').trim();
}

function userId(payload: DiscordInteractionPayload): string | null {
  return payload.member?.user?.id ?? payload.user?.id ?? null;
}

function username(payload: DiscordInteractionPayload): string {
  return payload.member?.user?.username ?? payload.user?.username ?? 'member';
}

function ephemeral(content: string, extra?: Record<string, unknown>): InteractionResponse {
  return {
    type: RESPONSE_TYPE_CHANNEL_MESSAGE,
    data: {
      content,
      flags: EPHEMERAL_FLAG,
      ...(extra ?? {}),
    },
  };
}

function publicMessage(content: string): InteractionResponse {
  return {
    type: RESPONSE_TYPE_CHANNEL_MESSAGE,
    data: { content },
  };
}

export const sageCommandDefinitions = [
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
        choices: sagePathOptions.map((option) => ({ name: option.label, value: option.key })),
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
          { name: 'Design', value: 'design' },
          { name: 'Code', value: 'code' },
          { name: 'AI workflow', value: 'ai' },
          { name: 'Architecture', value: 'architecture' },
          { name: 'SEO/content', value: 'seo' },
          { name: 'Cloud/devops', value: 'cloud' },
        ],
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

function onboardingComponents() {
  return [
    {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: 'sage_onboard_path',
          placeholder: 'Choose your primary path',
          min_values: 1,
          max_values: 1,
          options: sagePathOptions.map((option) => ({
            label: option.label,
            value: option.key,
            description: option.description.slice(0, 100),
          })),
        },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: 'sage_onboard_level',
          placeholder: 'Choose your current level',
          min_values: 1,
          max_values: 1,
          options: sageLevelOptions.map((option) => ({
            label: option.label,
            value: option.key,
            description: option.description.slice(0, 100),
          })),
        },
      ],
    },
  ];
}

async function handleOnboard(): Promise<InteractionResponse> {
  return ephemeral(
    [
      '**Sage Ideas Academy Onboarding**',
      'Choose your primary path and current level below. SageBot will assign your role and point you to the right starting lane.',
      '',
      'After that, post in `🙋-introduce-yourself` with your first project and blocker.',
    ].join('\n'),
    { components: onboardingComponents() },
  );
}

async function handleChoosePath(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const id = userId(payload);
  const pathKey = optionValue(payload, 'path') as SagePathKey;
  const path = sagePathOptions.find((option) => option.key === pathKey);
  if (!id || !path) return ephemeral('I could not resolve that path. Try `/onboard`.');
  await assignPathRole(id, path.key);
  await upsertDiscordMember({ discordUserId: id, username: username(payload), pathKey: path.key });
  return ephemeral(`Path set to **${path.label}**. Start in \`${path.channel}\`, then post your first project in \`project-specs\`.`);
}

async function handleSubmitProject(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const title = optionValue(payload, 'title');
  const path = optionValue(payload, 'path');
  const goal = optionValue(payload, 'goal');
  const link = optionValue(payload, 'link');
  const content = [
    `# New project submission: ${title}`,
    `**Builder:** ${username(payload)}`,
    `**Path:** ${path}`,
    `**Goal:** ${goal}`,
    link ? `**Link:** ${link}` : null,
    '',
    '**Next step:** turn this into acceptance criteria, then route review requests to design/code/AI/architecture as needed.',
  ]
    .filter(Boolean)
    .join('\n');
  await postToChannelByBaseName('project-specs', content);
  return ephemeral('Project submitted to `project-specs`. Next: add acceptance criteria and first milestone.');
}

async function handleRequestReview(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const type = optionValue(payload, 'type');
  const summary = optionValue(payload, 'summary');
  const link = optionValue(payload, 'link');
  const route: Record<string, string> = {
    design: 'design-review',
    code: 'code-help',
    ai: 'ai-help',
    architecture: 'architecture-review',
    seo: 'path-seo-content-engine',
    cloud: 'path-cloud-devops',
  };
  const target = route[type] ?? 'project-specs';
  await postToChannelByBaseName(
    target,
    [`# Review request: ${type}`, `**Member:** ${username(payload)}`, `**Summary:** ${summary}`, link ? `**Link:** ${link}` : null]
      .filter(Boolean)
      .join('\n'),
  );
  return ephemeral(`Review request routed to \`${target}\`.`);
}

async function handleCaptureContent(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const idea = optionValue(payload, 'idea');
  const source = optionValue(payload, 'source');
  await postToChannelByBaseName(
    'questions-to-content',
    [`# Captured content idea`, `**Captured by:** ${username(payload)}`, `**Idea:** ${idea}`, source ? `**Source:** ${source}` : null]
      .filter(Boolean)
      .join('\n'),
  );
  return ephemeral('Captured in `questions-to-content` for the content engine.');
}

async function handleDailyPrompt(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const mode = optionValue(payload, 'mode') || 'preview';
  const content = buildDailySignalContent(new Date());
  if (mode === 'post') {
    await postDailySignal('slash-command');
    return ephemeral('Posted today’s Daily Signal to `daily-build-prompt`.');
  }
  return ephemeral(content);
}

async function handleWeeklyRecap(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const mode = optionValue(payload, 'mode') || 'preview';
  const content = await buildWeeklyRecapContent();
  if (mode === 'post') {
    await postWeeklyRecap('slash-command');
    return ephemeral('Posted the weekly recap to `weekly-schedule`.');
  }
  return ephemeral(content);
}

export function buildDailySignalContent(now = new Date()): string {
  return [
    '# Daily Signal',
    `**Build prompt:** ${pickDaily(dailyBuildPrompts, now)}`,
    `**AI tool/pattern:** ${pickDaily(dailyAiTools, now)}`,
    `**Question:** ${pickDaily(dailyQuestions, now)}`,
  ].join('\n');
}

export async function buildWeeklyRecapContent(): Promise<string> {
  const [ships, wins, contentIdeas] = await Promise.all([
    getRecentChannelMessages('ship-showcase', 10),
    getRecentChannelMessages('member-wins', 10),
    getRecentChannelMessages('questions-to-content', 10),
  ]);
  return [
    '# Weekly Recap',
    '**Cadence**',
    ...weeklyCadence.map((item) => `- ${item}`),
    '',
    `**Signals captured:** ${contentIdeas.filter((message) => !message.author?.bot).length}`,
    `**Ships posted:** ${ships.filter((message) => !message.author?.bot).length}`,
    `**Wins posted:** ${wins.filter((message) => !message.author?.bot).length}`,
    '',
    '**Next action:** pick one project to spec, one artifact to ship, and one lesson to capture into content.',
  ].join('\n');
}

export async function postDailySignal(source: string): Promise<string | null> {
  const content = buildDailySignalContent(new Date());
  const messageId = await postToChannelByBaseName('daily-build-prompt', content);
  await recordDiscordScheduledRun({
    runKey: `daily-signal-${new Date().toISOString().slice(0, 10)}`,
    kind: 'daily_signal',
    status: messageId ? 'posted' : 'failed',
    messageId,
    metadata: { source },
  });
  await recordDiscordEvent({
    eventType: 'daily_signal_posted',
    commandName: source,
    channelBaseName: 'daily-build-prompt',
    metadata: { message_id: messageId },
  });
  return messageId;
}

export async function postWeeklyRecap(source: string): Promise<string | null> {
  const content = await buildWeeklyRecapContent();
  const messageId = await postToChannelByBaseName('weekly-schedule', content);
  await recordDiscordScheduledRun({
    runKey: `weekly-recap-${weekKey(new Date())}`,
    kind: 'weekly_recap',
    status: messageId ? 'posted' : 'failed',
    messageId,
    metadata: { source },
  });
  await recordDiscordEvent({
    eventType: 'weekly_recap_posted',
    commandName: source,
    channelBaseName: 'weekly-schedule',
    metadata: { message_id: messageId },
  });
  return messageId;
}

function weekKey(now: Date): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

async function handleResource(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const need = optionValue(payload, 'need').toLowerCase();
  const target = need.includes('prompt')
    ? 'prompts'
    : need.includes('stack') || need.includes('tool')
      ? 'stack-guides'
      : need.includes('read')
        ? 'reading-list'
        : need.includes('template')
          ? 'templates'
          : 'tools';
  return ephemeral(`Start in \`${target}\`. If you do not find it, capture the gap in \`content-ideas\` so it becomes a resource drop.`);
}

async function handleOfficeHours(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const question = optionValue(payload, 'question');
  if (question) {
    await postToChannelByBaseName('office-hours', `# Office-hours question\n**Member:** ${username(payload)}\n**Question:** ${question}`);
    return ephemeral('Question added to `office-hours`.');
  }
  return ephemeral('Use `office-hours` for the schedule and question queue. Strong questions include context, project, blocker, link/screenshot, and desired feedback.');
}

async function handleReport(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const issue = optionValue(payload, 'issue');
  await postToChannelByBaseName('moderation', `# Member report\n**Reporter:** ${username(payload)}\n**Issue:** ${issue}`);
  return ephemeral('Report sent to the moderation queue. Thank you for keeping the room useful.');
}

async function handlePremium(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const id = userId(payload);
  if (!id) return ephemeral('I could not resolve your Discord user. Try again inside the server.');
  const checkout = await createDiscordPremiumCheckout({ discordUserId: id, username: username(payload) });
  if (!checkout.ok) {
    return ephemeral('Premium checkout is not configured yet. Missing Stripe secret or premium price id.');
  }
  return ephemeral('Premium membership checkout is ready.', {
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'Open checkout',
            url: checkout.url,
          },
        ],
      },
    ],
  });
}

export async function handleSageCommand(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const name = payload.data?.name;
  try {
    await recordDiscordEvent({
      eventType: 'command_invoked',
      commandName: name ?? null,
      discordUserId: userId(payload),
      discordUsername: username(payload),
      metadata: { channel_id: payload.channel_id ?? null },
    });
    switch (name) {
      case 'onboard':
        return handleOnboard();
      case 'choose-path':
        return handleChoosePath(payload);
      case 'submit-project':
        return handleSubmitProject(payload);
      case 'request-review':
        return handleRequestReview(payload);
      case 'capture-content':
        return handleCaptureContent(payload);
      case 'daily-prompt':
        return handleDailyPrompt(payload);
      case 'weekly-recap':
        return handleWeeklyRecap(payload);
      case 'resource':
        return handleResource(payload);
      case 'office-hours':
        return handleOfficeHours(payload);
      case 'report':
        return handleReport(payload);
      case 'premium':
        return handlePremium(payload);
      default:
        return ephemeral('Unknown SageBot command.');
    }
  } catch (err) {
    await recordDiscordEvent({
      eventType: 'command_failed',
      commandName: name ?? null,
      discordUserId: userId(payload),
      discordUsername: username(payload),
      metadata: { error: err instanceof Error ? err.message : String(err) },
    });
    throw err;
  }
}

export async function handleSageComponent(payload: DiscordInteractionPayload): Promise<InteractionResponse> {
  const id = userId(payload);
  const customId = payload.data?.custom_id;
  const value = payload.data?.values?.[0];
  if (!id || !customId || !value) return ephemeral('I could not read that selection.');

  if (customId === 'sage_onboard_path') {
    const channel = await assignPathRole(id, value as SagePathKey);
    const path = sagePathOptions.find((option) => option.key === value);
    await upsertDiscordMember({ discordUserId: id, username: username(payload), pathKey: value });
    await recordDiscordEvent({
      eventType: 'onboarding_path_selected',
      commandName: 'onboard',
      discordUserId: id,
      discordUsername: username(payload),
      metadata: { path_key: value },
    });
    return {
      type: RESPONSE_TYPE_UPDATE_MESSAGE,
      data: {
        content: `Path saved: **${path?.label ?? value}**. Start in \`${channel ?? 'your path channel'}\` and post your first project.`,
        components: onboardingComponents(),
      },
    };
  }

  if (customId === 'sage_onboard_level') {
    const role = await assignLevelRole(id, value as SageLevelKey);
    const level = sageLevelOptions.find((option) => option.key === value);
    await upsertDiscordMember({ discordUserId: id, username: username(payload), levelKey: value });
    await recordDiscordEvent({
      eventType: 'onboarding_level_selected',
      commandName: 'onboard',
      discordUserId: id,
      discordUsername: username(payload),
      metadata: { level_key: value, role },
    });
    return {
      type: RESPONSE_TYPE_UPDATE_MESSAGE,
      data: {
        content: `Level saved: **${level?.label ?? value}**. Role assigned: **${role ?? 'Academy Member'}**.`,
        components: onboardingComponents(),
      },
    };
  }

  return publicMessage('Selection received.');
}
