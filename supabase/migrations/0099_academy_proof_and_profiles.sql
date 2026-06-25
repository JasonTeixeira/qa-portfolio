-- Phase 2: pre/post assessments (Hake's g), public profiles + handles, proof-of-work artifacts.

create table if not exists academy_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  kind text not null check (kind in ('pretest', 'posttest')),
  score integer not null check (score >= 0 and score <= 100),
  taken_at timestamptz not null default now(),
  unique (user_id, course_slug, kind)
);
create index if not exists academy_assessments_course_idx on academy_assessments(course_slug, kind);

create table if not exists academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text,
  bio text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists academy_profiles_public_idx on academy_profiles(is_public) where is_public;

create table if not exists academy_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text,
  lesson_slug text,
  title text not null,
  repo_url text,
  demo_url text,
  created_at timestamptz not null default now()
);
create index if not exists academy_artifacts_user_idx on academy_artifacts(user_id, created_at desc);

alter table academy_assessments enable row level security;
alter table academy_profiles enable row level security;
alter table academy_artifacts enable row level security;

-- Assessments: the learner reads + records their own.
drop policy if exists academy_assessments_own_read on academy_assessments;
create policy academy_assessments_own_read on academy_assessments
  for select to authenticated using (user_id = auth.uid());
drop policy if exists academy_assessments_own_write on academy_assessments;
create policy academy_assessments_own_write on academy_assessments
  for insert to authenticated with check (user_id = auth.uid());

-- Profiles: anyone may read a PUBLIC profile; you always read + write your own.
drop policy if exists academy_profiles_public_read on academy_profiles;
create policy academy_profiles_public_read on academy_profiles
  for select using (is_public or user_id = auth.uid());
drop policy if exists academy_profiles_own_upsert on academy_profiles;
create policy academy_profiles_own_upsert on academy_profiles
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academy_profiles_own_update on academy_profiles;
create policy academy_profiles_own_update on academy_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Artifacts: readable when the owner's profile is public (or it's yours); you write your own.
drop policy if exists academy_artifacts_read on academy_artifacts;
create policy academy_artifacts_read on academy_artifacts
  for select using (
    user_id = auth.uid()
    or user_id in (select p.user_id from academy_profiles p where p.is_public)
  );
drop policy if exists academy_artifacts_own_write on academy_artifacts;
create policy academy_artifacts_own_write on academy_artifacts
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists academy_artifacts_own_delete on academy_artifacts;
create policy academy_artifacts_own_delete on academy_artifacts
  for delete to authenticated using (user_id = auth.uid());
