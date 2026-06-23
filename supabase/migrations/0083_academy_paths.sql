-- Academy content foundation (4/5): saved learning paths (build-your-own-path).
-- Per-learner state, fully RLS-scoped to the user (read + insert + update via
-- the RLS client), exactly like academy_progress (0074). The app keeps one path
-- per learner in code (lookup-then-update/insert; no DB upsert/onConflict).
-- course_slugs is a jsonb array of course slug strings.

create table if not exists public.academy_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My path',
  course_slugs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_paths_user_updated_idx
  on public.academy_paths (user_id, updated_at desc);

alter table public.academy_paths enable row level security;

drop policy if exists academy_paths_own_select on public.academy_paths;
create policy academy_paths_own_select on public.academy_paths
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists academy_paths_own_insert on public.academy_paths;
create policy academy_paths_own_insert on public.academy_paths
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists academy_paths_own_update on public.academy_paths;
create policy academy_paths_own_update on public.academy_paths
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
