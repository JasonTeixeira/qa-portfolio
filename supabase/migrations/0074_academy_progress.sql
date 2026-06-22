-- Academy progress — per-user lesson completion + resume position.
-- Users manage their own rows (RLS). Content is keyed by course/lesson slug so
-- it's content-source agnostic (fixture today, Payload CMS later).

create table if not exists public.academy_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  last_position integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_slug)
);

alter table public.academy_progress enable row level security;

-- A learner can read only their own progress.
drop policy if exists academy_progress_own_select on public.academy_progress;
create policy academy_progress_own_select on public.academy_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- A learner can create their own progress rows.
drop policy if exists academy_progress_own_insert on public.academy_progress;
create policy academy_progress_own_insert on public.academy_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- A learner can update their own progress rows.
drop policy if exists academy_progress_own_update on public.academy_progress;
create policy academy_progress_own_update on public.academy_progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists academy_progress_user_course_idx
  on public.academy_progress (user_id, course_slug, updated_at desc);
