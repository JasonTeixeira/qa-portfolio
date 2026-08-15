-- Academy content foundation (2/5): lessons.
-- The lesson player + course overview read published lessons via the RLS client;
-- the admin studio + certificate completion counts use the service role.
-- Natural key is (course_slug, slug) — the exact onConflict target in saveLesson;
-- evidence.ts builds a composite "course_slug:slug" map precisely because slug
-- alone is not unique. Modules are denormalized as module_title/module_sort
-- columns (there is no modules table). `blocks` is the LessonBlock[] union
-- (data/academy/sample-course.ts) stored opaque as jsonb.

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.academy_courses (slug) on delete cascade,
  slug text not null,
  title text not null,
  eyebrow text,
  module_title text not null default 'Module 1',
  module_sort integer not null default 0,
  sort integer not null default 0,
  est_minutes integer not null default 5,
  is_free_preview boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published')),
  intensity text not null default 'standard'
    check (intensity in ('micro', 'standard', 'deep', 'capstone')),
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_slug, slug)
);

-- Covers the dominant ordered read and the exact-count queries:
-- .eq(course_slug).eq(status,'published').order(module_sort).order(sort)
create index if not exists academy_lessons_course_status_order_idx
  on public.academy_lessons (course_slug, status, module_sort, sort);

alter table public.academy_lessons enable row level security;

-- Public read of published lessons (free-preview lessons must render for
-- logged-out visitors; the free/Pro gate is enforced in app code, not RLS).
-- Writes are service-role only.
drop policy if exists academy_lessons_public_read on public.academy_lessons;
create policy academy_lessons_public_read on public.academy_lessons
  for select to anon, authenticated
  using (status = 'published');
