-- Academy content foundation (3/5): certificates.
-- Awarded by maybeAwardCertificate (service role) on verified full completion:
-- one per learner per course (onConflict: 'user_id,course_slug', ignoreDuplicates).
-- The dashboard reads own rows via the RLS client; the public shareable cert
-- page fetches by cert_code via the service role (so RLS stays own-only).
-- issued_at is never set on insert by the app → the DB default is load-bearing.

create table if not exists public.academy_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_slug text not null,
  cert_code text not null unique,
  recipient_name text,
  issued_at timestamptz not null default now(),
  unique (user_id, course_slug)
);

create index if not exists academy_certificates_user_issued_idx
  on public.academy_certificates (user_id, issued_at desc);

alter table public.academy_certificates enable row level security;

-- Own-row read for the dashboard/evidence. The public cert page uses the
-- service role (bypasses RLS) — intentionally NO anon policy here.
drop policy if exists academy_certificates_own_select on public.academy_certificates;
create policy academy_certificates_own_select on public.academy_certificates
  for select to authenticated
  using ((select auth.uid()) = user_id);
