-- Academy content foundation (1/5): courses.
-- Public catalog/course/overview read this via the RLS client (published only);
-- the admin authoring studio writes via the service role (bypasses RLS).
-- Columns mirror exactly what lib/academy/{content,admin}.ts and
-- app/academy-admin/_actions.ts read and upsert. The slug is the natural key
-- (onConflict: 'slug'); `lessons` is a denormalized counter maintained by
-- saveLesson, so it must default to 0 (saveCourse never sets it on insert).

create table if not exists public.academy_courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text,
  topic text not null,
  level text not null default 'Beginner',
  lessons integer not null default 0,
  hours integer not null default 0,
  sort integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_courses_status_sort_idx
  on public.academy_courses (status, sort);

alter table public.academy_courses enable row level security;

-- Public, anon-readable catalog — but only published courses. Writes are
-- service-role only (no insert/update policy → default-deny for anon/auth).
drop policy if exists academy_courses_public_read on public.academy_courses;
create policy academy_courses_public_read on public.academy_courses
  for select to anon, authenticated
  using (status = 'published');
