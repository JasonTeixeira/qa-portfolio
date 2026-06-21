export type SagePathKey =
  | 'ai_apps'
  | 'full_stack'
  | 'web_design'
  | 'cloud_devops'
  | 'agents_automation'
  | 'seo_content'
  | 'ads_growth'
  | 'architecture';

export type SageLevelKey = 'starting' | 'learning' | 'shipping' | 'architecting' | 'mentoring';

export const sagePathOptions: Array<{
  key: SagePathKey;
  label: string;
  description: string;
  role: string;
  channel: string;
}> = [
  {
    key: 'ai_apps',
    label: 'AI Apps',
    description: 'Build AI-native apps and SaaS products.',
    role: 'AI Engineer',
    channel: 'build-lab',
  },
  {
    key: 'full_stack',
    label: 'Full-Stack Development',
    description: 'Ship real apps with auth, data, APIs, tests, and deployment.',
    role: 'Builder',
    channel: 'build-lab',
  },
  {
    key: 'web_design',
    label: 'Websites + Design',
    description: 'Build premium sites, UI systems, and conversion pages.',
    role: 'Web Builder',
    channel: 'build-lab',
  },
  {
    key: 'cloud_devops',
    label: 'Cloud + DevOps',
    description: 'Deploy, monitor, and operate reliable systems.',
    role: 'Cloud Builder',
    channel: 'build-lab',
  },
  {
    key: 'agents_automation',
    label: 'AI Agents + Automation',
    description: 'Build workflow automations, agents, and internal systems.',
    role: 'AI Engineer',
    channel: 'build-lab',
  },
  {
    key: 'seo_content',
    label: 'SEO + Content Engine',
    description: 'Build search, publishing, newsletter, and content systems.',
    role: 'Content Builder',
    channel: 'questions',
  },
  {
    key: 'ads_growth',
    label: 'Ads + Growth',
    description: 'Build offers, funnels, landing pages, and acquisition loops.',
    role: 'Growth Builder',
    channel: 'questions',
  },
  {
    key: 'architecture',
    label: 'Architecture + Systems',
    description: 'Design APIs, data models, auth, reliability, and tradeoffs.',
    role: 'Builder',
    channel: 'build-lab',
  },
];

export const leanDiscordChannels = [
  {
    name: 'start-here',
    purpose: 'Read-only welcome, rules, onboarding instructions, and first action.',
  },
  {
    name: 'daily-signal',
    purpose: 'Bot-posted daily build prompt, AI pattern, and discussion question.',
  },
  {
    name: 'questions',
    purpose: 'Main member questions, answers, accepted/helpful replies, and unanswered-question tracking.',
  },
  {
    name: 'build-lab',
    purpose: 'Project specs, shipping updates, technical questions, and general build work.',
  },
  {
    name: 'review-queue',
    purpose: 'Design, code, AI, SEO, cloud, and architecture review requests.',
  },
  {
    name: 'content-lab',
    purpose: 'Captured questions, lessons, content ideas, resource gaps, and growth work.',
  },
  {
    name: 'live-room',
    purpose: 'Office-hours queue, live session notes, and replay follow-up.',
  },
  {
    name: 'resources',
    purpose: 'Templates, stack guides, reading lists, prompts, and useful tools.',
  },
  {
    name: 'wins-showcase',
    purpose: 'Finished ships, member wins, proof screenshots, and weekly recap inputs.',
  },
  {
    name: 'premium',
    purpose: 'Premium member critique, advanced drops, replays, and deeper help.',
  },
  {
    name: 'team-ops',
    purpose: 'Private moderation, reports, analytics review, and admin operations.',
  },
];

export const sageLevelOptions: Array<{
  key: SageLevelKey;
  label: string;
  description: string;
  role: string;
}> = [
  {
    key: 'starting',
    label: 'Starting',
    description: 'I need foundations and guided projects.',
    role: 'Beginner',
  },
  {
    key: 'learning',
    label: 'Learning',
    description: 'I can follow tutorials but need structure.',
    role: 'Academy Member',
  },
  {
    key: 'shipping',
    label: 'Shipping',
    description: 'I can build but need review and polish.',
    role: 'Builder',
  },
  {
    key: 'architecting',
    label: 'Architecting',
    description: 'I need scale, systems, quality, and advanced patterns.',
    role: 'Contributor',
  },
  {
    key: 'mentoring',
    label: 'Mentoring',
    description: 'I can help others and want sharper systems.',
    role: 'Mentor',
  },
];

export const dailyBuildPrompts = [
  'Pick one repeated manual task in your life or work. Write the first 3-step automation spec before touching code.',
  'Build a one-screen AI tool that takes messy input and returns structured output. Save the input/output pair.',
  'Redesign one hero section from a site you like. Explain the visual hierarchy decisions.',
  'Take one project idea and write the user story, acceptance criteria, and out-of-scope list.',
  'Create a tiny content engine: one question, one answer, one social post, one newsletter angle.',
  'Map the architecture for a small SaaS: user, auth, database, API, background job, deployment, monitoring.',
  'Improve a project README so a stranger can understand the problem, stack, and demo in 60 seconds.',
  'Build a landing page section for a premium offer: outcome, proof, process, CTA.',
  'Write an eval checklist for one AI workflow. Define what bad output looks like.',
  'Ship one visible improvement to an existing project and post a before/after screenshot.',
];

export const dailyAiTools = [
  'Structured outputs: use schemas so AI returns data your app can validate.',
  'Prompt versioning: save prompt name, version, inputs, output, and result quality.',
  'Human approval gates: require approval before AI sends, deletes, charges, or posts anything.',
  'Retrieval basics: chunk source material, cite source IDs, and reject unsupported answers.',
  'Cost controls: cap tokens, retries, model choices, and daily spend per workflow.',
  'Agent tool boundaries: every tool needs a name, input schema, permission model, and failure path.',
  'AI UX: show what the AI is doing, what it needs, and how users can correct it.',
];

export const dailyQuestions = [
  'What are you trying to ship this week, and what is the smallest useful version?',
  'Where is AI genuinely useful in your current project, and where would it add risk?',
  'What would make your portfolio project feel more credible to a buyer or hiring manager?',
  'Which part of your build is unclear: user, data, design, architecture, or distribution?',
  'What is one project decision you made this week and the tradeoff behind it?',
];

export const weeklyCadence = [
  'Monday: Build brief and weekly project target.',
  'Tuesday: Tool teardown and implementation pattern.',
  'Wednesday: Office-hours question collection.',
  'Thursday: Review day for code, design, AI, SEO, and architecture.',
  'Friday: Ship showcase and portfolio proof.',
  'Saturday: Content engine challenge.',
  'Sunday: Weekly recap and next-week planning.',
];

export function pickDaily<T>(items: T[], now = new Date()): T {
  const dayKey = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86_400_000);
  return items[dayKey % items.length];
}
