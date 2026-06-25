-- Community / relatedness: friendships (+ friend streaks) and cohorts.

create table if not exists academy_friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  friend_streak integer not null default 0,
  last_both_active date,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
create index if not exists academy_friendships_addressee_idx on academy_friendships(addressee_id, status);
create index if not exists academy_friendships_requester_idx on academy_friendships(requester_id, status);

create table if not exists academy_cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  starts_on date,
  created_at timestamptz not null default now()
);

create table if not exists academy_cohort_members (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references academy_cohorts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (cohort_id, user_id)
);
create index if not exists academy_cohort_members_user_idx on academy_cohort_members(user_id);
create index if not exists academy_cohort_members_cohort_idx on academy_cohort_members(cohort_id);

alter table academy_friendships enable row level security;
alter table academy_cohorts enable row level security;
alter table academy_cohort_members enable row level security;

-- Friendships: either party reads; writes service-role only.
drop policy if exists academy_friendships_party_read on academy_friendships;
create policy academy_friendships_party_read on academy_friendships
  for select to authenticated using (requester_id = auth.uid() or addressee_id = auth.uid());

-- Cohorts are publicly browsable.
drop policy if exists academy_cohorts_read on academy_cohorts;
create policy academy_cohorts_read on academy_cohorts for select using (true);

-- Cohort members: you read rosters of cohorts you belong to (+ your own rows).
drop policy if exists academy_cohort_members_co_read on academy_cohort_members;
create policy academy_cohort_members_co_read on academy_cohort_members
  for select to authenticated using (
    user_id = auth.uid()
    or cohort_id in (select m.cohort_id from academy_cohort_members m where m.user_id = auth.uid())
  );

-- Seed one real cohort so the surface isn't empty pre-launch.
insert into academy_cohorts (slug, name, description, starts_on)
values ('all-access', 'All-Access Cohort', 'Every Sage Academy learner building in public, together.', current_date)
on conflict (slug) do nothing;
