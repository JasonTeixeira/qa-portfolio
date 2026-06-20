-- Sage Academy founding waitlist with referral attribution.
-- Written via the service role only (RLS denies anon). Position is computed at
-- read time: chronological rank improved by a fixed boost per referral.

create table if not exists public.academy_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  ref_code text unique not null,
  referred_by text,
  created_at timestamptz not null default now()
);

create index if not exists academy_waitlist_referred_by_idx on public.academy_waitlist(referred_by);
create index if not exists academy_waitlist_created_at_idx on public.academy_waitlist(created_at);

alter table public.academy_waitlist enable row level security;

comment on table public.academy_waitlist is
  'Sage Academy founding waitlist with referral attribution. Written via service role only (RLS denies anon).';
