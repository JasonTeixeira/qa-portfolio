-- Discord content engine source data: seed quizzes/challenges and add a managed calendar.

create table if not exists public.discord_content_calendar (
  id uuid primary key default gen_random_uuid(),
  calendar_date date not null unique,
  theme text,
  daily_prompt text,
  quiz_key text,
  challenge_key text,
  resource_prompt text,
  status text not null default 'planned' check (status in ('planned', 'posted', 'skipped', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.discord_content_calendar enable row level security;

drop policy if exists "discord_content_calendar_admin_all" on public.discord_content_calendar;
create policy "discord_content_calendar_admin_all" on public.discord_content_calendar
  for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

insert into public.discord_quizzes (quiz_key, prompt, options, correct_answer, explanation, difficulty, active)
values
  (
    'structured-output-v1',
    'What makes an AI feature easier to trust in production?',
    '["Longer prompts", "Validated structured output", "More temperature", "No logs"]'::jsonb,
    'validated structured output',
    'Schemas, validation, and clear failure states make AI output usable inside real product workflows.',
    'foundation',
    true
  ),
  (
    'landing-page-proof-v1',
    'Which section most directly reduces buyer doubt on a premium service page?',
    '["Generic hero copy", "Proof with concrete outcomes", "More gradients", "A longer nav"]'::jsonb,
    'proof with concrete outcomes',
    'Specific proof beats claims because it gives the reader evidence to evaluate.',
    'foundation',
    true
  ),
  (
    'automation-boundary-v1',
    'What should require human approval in an automation?',
    '["Reading public data", "Formatting text", "Sending or charging", "Counting rows"]'::jsonb,
    'sending or charging',
    'External, irreversible, paid, or reputation-affecting actions need approval gates.',
    'foundation',
    true
  ),
  (
    'project-scope-v1',
    'What belongs in a first project spec before code?',
    '["User, goal, acceptance criteria", "Logo ideas only", "A vague feature list", "A launch tweet"]'::jsonb,
    'user, goal, acceptance criteria',
    'A useful spec defines the user, outcome, scope, and testable acceptance criteria.',
    'foundation',
    true
  ),
  (
    'content-engine-v1',
    'What is the best source for useful daily content?',
    '["Random trends", "Real questions and shipped work", "Generic quotes", "Engagement bait"]'::jsonb,
    'real questions and shipped work',
    'Community questions, decisions, wins, and critique create content with proof behind it.',
    'foundation',
    true
  )
on conflict (quiz_key) do update set
  prompt = excluded.prompt,
  options = excluded.options,
  correct_answer = excluded.correct_answer,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  active = excluded.active;

insert into public.discord_challenges (challenge_key, title, prompt, deliverable, points, active)
values
  (
    'one-screen-ai-tool',
    'One-screen AI tool',
    'Build or spec one AI tool that turns messy input into structured output.',
    'Post the input, output schema, screenshot/link, and one failure case.',
    25,
    true
  ),
  (
    'premium-section-redesign',
    'Premium section redesign',
    'Pick one weak page section and redesign it around hierarchy, proof, and one clear action.',
    'Post before/after screenshots and explain the tradeoff.',
    25,
    true
  ),
  (
    'automation-map',
    'Automation map',
    'Map a repeated workflow with trigger, inputs, tools, approval gate, and failure path.',
    'Post the workflow map and name the riskiest step.',
    20,
    true
  ),
  (
    'content-repurpose',
    'Question to content',
    'Turn one useful question into a short answer, one post idea, and one resource gap.',
    'Post the question, answer, post angle, and resource needed.',
    20,
    true
  ),
  (
    'project-acceptance',
    'Acceptance criteria pass',
    'Write acceptance criteria for a project you are building this week.',
    'Post the project, three acceptance criteria, and what is out of scope.',
    15,
    true
  )
on conflict (challenge_key) do update set
  title = excluded.title,
  prompt = excluded.prompt,
  deliverable = excluded.deliverable,
  points = excluded.points,
  active = excluded.active;

insert into public.discord_content_calendar (
  calendar_date,
  theme,
  daily_prompt,
  quiz_key,
  challenge_key,
  resource_prompt,
  status
)
select
  current_date + offset_days,
  theme,
  prompt,
  quiz_key,
  challenge_key,
  resource_prompt,
  'planned'
from (
  values
    (0, 'Approval gates', 'Map one workflow where the bot should stop and ask for human approval.', 'automation-boundary-v1', 'automation-map', 'Approval boundary checklist'),
    (1, 'Structured output', 'Turn one messy input into a schema and write one validation rule.', 'structured-output-v1', 'one-screen-ai-tool', 'Structured output examples'),
    (2, 'Proof-first pages', 'Rewrite one page section so the proof comes before the claim.', 'landing-page-proof-v1', 'premium-section-redesign', 'Premium page proof teardown'),
    (3, 'Project scope', 'Write a one-screen spec with user, goal, acceptance criteria, and out-of-scope items.', 'project-scope-v1', 'project-acceptance', 'First project spec template'),
    (4, 'Question capture', 'Turn one real question into an answer, resource gap, and post angle.', 'content-engine-v1', 'content-repurpose', 'Question-to-content workflow'),
    (5, 'Ship review', 'Post one artifact and ask for one specific critique.', 'project-scope-v1', 'project-acceptance', 'Review request template'),
    (6, 'Weekly synthesis', 'Extract one reusable lesson from this week and add it to the content queue.', 'content-engine-v1', 'content-repurpose', 'Weekly recap template')
) as seed(offset_days, theme, prompt, quiz_key, challenge_key, resource_prompt)
on conflict (calendar_date) do update set
  theme = excluded.theme,
  daily_prompt = excluded.daily_prompt,
  quiz_key = excluded.quiz_key,
  challenge_key = excluded.challenge_key,
  resource_prompt = excluded.resource_prompt,
  updated_at = now();
