#!/usr/bin/env node

const API = 'https://discord.com/api/v10';

const posts = {
  'start-here': {
    topic: 'Start here: complete the Discord application, wait for approval, then run /onboard.',
    title: 'Start Here',
    body: [
      '**Welcome to Sage Ideas Academy.**',
      '',
      'This is a build-first room for people learning AI apps, websites, automation, cloud, content engines, and product systems by shipping useful work.',
      '',
      '**How to get access**',
      '1. Read the quality bar.',
      '2. Complete the Discord application.',
      '3. Tell us what you are building or trying to learn.',
      '4. Wait for manual approval. Before approval, this is the only channel you should see.',
      '5. After approval, run `/onboard` and `/checklist`.',
      '',
      '**Quality bar**',
      '- Bring context: goal, current attempt, blocker, and artifact when useful.',
      '- Share work in progress. Specific rough drafts beat polished vagueness.',
      '- Help with care. Critique should make the artifact stronger.',
      '- No spam, low-effort AI dumps, fake urgency, vague self-promo, or advice outside your lane.',
      '',
      '**Simple rule**',
      'If it helps someone build, understand, ship, or improve, it belongs here.',
    ],
  },
  'academy-roadmap': {
    topic: 'Read-only Academy map: paths, levels, projects, points, premium, and weekly rhythm.',
    title: 'Academy Roadmap',
    body: [
      '**This is the operating map after approval.**',
      '',
      'The server is intentionally small. Each room has a job, and SageBot turns the best activity into points, resources, challenges, and future lessons.',
      '',
      '**Core loop**',
      '1. Run `/onboard` and choose your path and level.',
      '2. Check `daily-signal` for the prompt, quiz, and challenge.',
      '3. Ask human questions in `questions` or source-backed bot questions in `ask-sage`.',
      '4. Build in `build-lab`.',
      '5. Submit finished artifacts in `project-submissions`.',
      '6. Request focused critique in `review-queue`.',
      '7. Post proof in `wins-showcase`.',
      '',
      '**Tag families**',
      '`ai-apps` `full-stack` `web-design` `cloud` `automation` `seo-content` `growth` `architecture`',
      '`question` `blocker` `review` `resource` `win` `project` `challenge`',
      '`beginner` `builder` `shipping` `advanced`',
      '',
      '**Progress counts when it is useful**',
      'Quizzes, approved challenges, helpful answers, project submissions, strong resources, and real wins all feed the leaderboard.',
    ],
  },
  introductions: {
    topic: 'Approved-member intros: goal, current build, level, and first help request.',
    title: 'Introductions',
    body: [
      '**Post a real intro after approval.**',
      '',
      'The goal is not a biography. The goal is to help other builders understand what you are working on and where they can help.',
      '',
      '**Intro format**',
      '```text',
      'Name: What should people call you?',
      'Path: ai-apps / web-design / cloud / automation / etc.',
      'Level: beginner / builder / shipping / advanced',
      'Building: What are you trying to make?',
      'Improving: What skill are you here to sharpen?',
      'Blocker: What would help first?',
      'Tags: ai-apps, beginner, project',
      '```',
      '',
      'After posting, run `/complete-step step:intro`.',
    ],
  },
  announcements: {
    topic: 'Read-only Academy updates, challenge launches, live sessions, releases, and important operating notices.',
    title: 'Announcements',
    body: [
      'This channel is for important Academy updates only.',
      '',
      '**What appears here**',
      '- New lesson or resource drops.',
      '- Challenge launches and winners.',
      '- Office-hours schedule changes.',
      '- Major SageBot, RAG, or content engine updates.',
      '- Server operations that members need to know.',
      '',
      'Keep conversation in `questions`, `lesson-discussion`, `build-lab`, or `live-room` so this channel stays clean.',
    ],
  },
  'daily-signal': {
    topic: 'Daily useful prompt, quiz, build challenge, streaks, and points.',
    title: 'Daily Signal',
    body: [
      '**This is the daily build rhythm.**',
      '',
      'Each day should create a small artifact: a decision, teardown, spec, prompt, test, screenshot, checklist, diagram, or before/after.',
      '',
      '**Command flow**',
      '`/daily` shows today\'s signal and marks the daily step complete.',
      '`/quiz` checks understanding and awards points.',
      '`/challenge` gives the build prompt.',
      '`/submit-challenge` sends the artifact for review.',
      '`/points` shows rank, streak, and progress.',
      '',
      '**Tag examples**',
      '`tags: daily, ai-apps, beginner`',
      '`tags: challenge, web-design, shipping`',
    ],
  },
  questions: {
    topic: 'Main Q&A room for structured questions, useful answers, helpful marks, and unanswered-question tracking.',
    title: 'Questions',
    body: [
      '**Use this room when you need a human answer, a second set of eyes, or a thread worth turning into a resource.**',
      '',
      'Good questions are specific. The better the context, the better the answer and the more useful the thread becomes for everyone else.',
      '',
      '**Tag line**',
      '`tags: ai-apps, blocker, beginner`',
      '',
      '**Strong question format**',
      '```text',
      'Question: What is the exact thing I need help with?',
      'Goal: What am I trying to build or decide?',
      'Tried: What have I already attempted?',
      'Artifact: Link, screenshot, code, prompt, page, or repo',
      'Tags: ai-apps, blocker, beginner',
      'Useful answer: What would unblock me?',
      '```',
      '',
      '**Command flow**',
      '`/ask` creates a tracked question and awards 5 points.',
      '`/answer` records a useful answer and awards 10 points.',
      '`/mark-helpful` gives a quality bonus when an answer is genuinely useful.',
      '`/weekly-winners` shows helpers, leaders, and open questions.',
      '',
      '**Routing**',
      'Use `/ask-sage` for private RAG-backed SageBot help.',
      'Use `/capture-content` when a thread should become a resource, lesson, post, or future challenge.',
    ],
  },
  'ask-sage': {
    topic: 'Dedicated SageBot and RAG question lane.',
    title: 'Ask Sage',
    body: [
      '**Use this room when you want SageBot to answer from approved knowledge.**',
      '',
      'Good bot questions are still specific. Tell SageBot what you are building, what decision you need to make, and what context matters.',
      '',
      '**Best prompt format**',
      '```text',
      'Question: What should SageBot answer?',
      'Building: What project or system is this for?',
      'Context: What have you already tried or read?',
      'Decision: What do you need to do next?',
      'Tags: rag, ai-apps, architecture',
      '```',
      '',
      'Use `questions` when you want human discussion. Use `/capture-content` if the answer should become a reusable resource.',
    ],
  },
  'lesson-discussion': {
    topic: 'Discussion and questions tied to lessons, modules, walkthroughs, and Academy material.',
    title: 'Lesson Discussion',
    body: [
      '**Use this room for lesson-specific discussion.**',
      '',
      'If your question is tied to a module, walkthrough, assignment, or resource, keep it here so future members can find it.',
      '',
      '**Post format**',
      '```text',
      'Lesson/module: What are you working through?',
      'Understood: What makes sense so far?',
      'Stuck: Where did it break down?',
      'Artifact: Screenshot, code, link, or notes',
      'Tags: lesson, ai-apps, beginner',
      '```',
      '',
      'Use `questions` for general help. Use `build-lab` when the question is mostly about your own project artifact.',
    ],
  },
  'build-lab': {
    topic: 'Project specs, shipping updates, technical questions, and build help.',
    title: 'Build Lab',
    body: [
      '**Use this room to turn ideas into artifacts.**',
      '',
      'This is the workshop: specs, shipping updates, blocked builds, technical decisions, screenshots, prototypes, and before/after passes.',
      '',
      '**First project template**',
      '```text',
      'Project: What are you building?',
      'User/problem: Who is it for and what hurts?',
      'Smallest useful version: What ships first?',
      'Stack: Tools, framework, APIs, database',
      'Acceptance criteria: What proves it works?',
      'Out of scope: What are you not doing yet?',
      'Review needed: Design, code, AI flow, SEO, cloud, architecture',
      'Tags: project, web-design, builder',
      '```',
      '',
      'Use `/submit-project` to route the project into the build pipeline.',
    ],
  },
  'project-submissions': {
    topic: 'Structured project submissions for review, points, showcase candidates, and member progress tracking.',
    title: 'Project Submissions',
    body: [
      '**Use this room for review-ready work, finished artifacts, and shipped progress.**',
      '',
      'This is the clean project ledger. Drafting, debugging, and loose discussion belong in `build-lab` first.',
      '',
      '**Tag line**',
      '`tags: web-design, review, shipping`',
      '',
      '**Strong submission format**',
      '```text',
      'Project: Name of the build',
      'Path/level: web-design / beginner',
      'Artifact: Demo, repo, screenshot, page, doc, or Loom',
      'Changed: What is new since the last version?',
      'Review needed: Design, code, AI flow, SEO, cloud, or architecture',
      'Tags: web-design, review, shipping',
      'Next ship: What will improve in the next pass?',
      '```',
      '',
      '**Command flow**',
      '`/submit-project` tracks the project for review, points, RAG/content candidates, and showcase consideration.',
      '',
      '**Quality bar**',
      'A strong submission includes proof of work: a link, screenshot, repo, demo, or concrete before/after.',
    ],
  },
  'review-queue': {
    topic: 'Focused design, code, AI, SEO, cloud, and architecture review requests.',
    title: 'Review Queue',
    body: [
      '**Ask for critique when there is something concrete to inspect.**',
      '',
      'Good review requests are narrow. A strong review has an artifact, a decision, and a clear definition of what feedback should improve.',
      '',
      '**Useful review format**',
      '```text',
      'Type: design/code/AI/architecture/SEO/cloud',
      'Artifact: Link, screenshot, repo, page, prompt, or doc',
      'Review target: What should be inspected?',
      'Tried: What have I already changed?',
      'Decision: What am I stuck on?',
      'Tags: review, code, blocker',
      '```',
      '',
      'Use `/request-review`. Premium members get priority/deeper teardown when queue volume is high.',
    ],
  },
  'content-queue': {
    topic: 'Captured questions, content ideas, resource gaps, and approved draft inputs.',
    title: 'Content Queue',
    body: [
      '**This is the content factory intake lane.**',
      '',
      'Questions, reviews, wins, mistakes, teardowns, and repeated blockers become resources only after they are captured and reviewed.',
      '',
      '**Content loop**',
      '1. A real question, review, win, or blocker appears.',
      '2. Capture it with `/capture-content`.',
      '3. Admin reviews it in the content queue.',
      '4. It becomes a resource, article, lesson, prompt, challenge, or RAG source.',
      '',
      '**Strong input examples**',
      '`tags: resource, ai-apps, prompt`',
      '`tags: lesson, web-design, conversion`',
      '`tags: win, project, shipping`',
    ],
  },
  'live-room': {
    topic: 'Office-hours queue, live session notes, and replay follow-up.',
    title: 'Live Room',
    body: [
      '**This is the live education lane.**',
      '',
      'Use it for office-hours questions, live-session notes, replay follow-up, and decisions that are easier to work through together.',
      '',
      '**Office-hours question format**',
      '```text',
      'Project/context: What are we looking at?',
      'Blocker: What is stuck?',
      'Tried: What did you already attempt?',
      'Artifact: Link, screenshot, repo, page, or doc',
      'Decision: What should we decide live?',
      'Tags: office-hours, blocker, architecture',
      '```',
      '',
      'Use `/office-hours` to submit the question. Strong repeated questions become content and resources.',
    ],
  },
  'office-hours': {
    topic: 'Office-hours schedule, agenda, submitted questions, session notes, and replay links.',
    title: 'Office Hours',
    body: [
      'This channel keeps the live education cadence organized.',
      '',
      '**Use it for**',
      '- Upcoming office-hours schedule.',
      '- Agenda collection.',
      '- Questions that should be answered live.',
      '- Session notes and replay links.',
      '',
      '**Question format**',
      '```text',
      'Project/context:',
      'Blocker:',
      'What I tried:',
      'Link/screenshot:',
      'What answer would be useful live:',
      '```',
    ],
  },
  accountability: {
    topic: 'Weekly goals, check-ins, shipping commitments, and progress nudges.',
    title: 'Accountability',
    body: [
      'This room is for weekly goals and visible progress.',
      '',
      '**Weekly check-in**',
      '```text',
      'This week I will ship:',
      'Smallest useful deliverable:',
      'Blocker/risk:',
      'What help I may need:',
      'Proof I will post when done:',
      '```',
      '',
      'Good accountability is concrete. A screenshot, link, diff, checklist, or before/after is better than a vague update.',
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
  'wins-showcase': {
    topic: 'Ships, wins, proof screenshots, launches, and weekly recap inputs.',
    title: 'Wins Showcase',
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
  'premium-reviews': {
    topic: 'Premium-only structured reviews, deeper teardowns, and priority critique queue.',
    title: 'Premium Reviews',
    body: [
      'This is the premium review lane for deeper critique.',
      '',
      '**Review request format**',
      '```text',
      'Artifact:',
      'Review type: design/code/AI/SEO/cloud/architecture/content',
      'Business/user goal:',
      'What I already tried:',
      'What decision I need help making:',
      'Deadline/context:',
      '```',
      '',
      'Use `/premium-review` when possible so the request is tracked, prioritized, and connected to the admin dashboard.',
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

  const title = `# ${post.title}`;
  const recent = await discordApi(`/channels/${channel.id}/messages?limit=50`);
  const existing = recent.find((message) => (
    message.author?.bot
    && message.content?.startsWith(title)
  ));
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
