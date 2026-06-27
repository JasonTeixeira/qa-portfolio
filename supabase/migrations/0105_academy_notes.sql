-- Tier 3 — learner notes/highlights. Unlike the evidence ledger (service-role,
-- append-only, anti-cheat), notes are the learner's OWN content: they read,
-- write, edit, and delete their own rows under RLS. No anti-cheat surface.

create table if not exists academy_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_notes_user_lesson_idx
  on academy_notes(user_id, course_slug, lesson_slug, updated_at desc);

alter table academy_notes enable row level security;

-- The learner owns their notes: full CRUD on their own rows only.
drop policy if exists academy_notes_own_select on academy_notes;
create policy academy_notes_own_select on academy_notes
  for select to authenticated using (user_id = auth.uid());

drop policy if exists academy_notes_own_insert on academy_notes;
create policy academy_notes_own_insert on academy_notes
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists academy_notes_own_update on academy_notes;
create policy academy_notes_own_update on academy_notes
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists academy_notes_own_delete on academy_notes;
create policy academy_notes_own_delete on academy_notes
  for delete to authenticated using (user_id = auth.uid());
