-- Engagement-tier leagues: weekly-XP competition with promotion/relegation.
-- Writes are service-role only (anti-cheat); reads are scoped to your own league.

create table if not exists academy_leagues (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  tier smallint not null,
  instance smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (week_start, tier, instance)
);

create table if not exists academy_league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references academy_leagues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  weekly_xp integer not null default 0,
  joined_at timestamptz not null default now(),
  unique (league_id, user_id),
  unique (week_start, user_id)
);

create index if not exists academy_league_members_league_idx on academy_league_members(league_id);
create index if not exists academy_league_members_user_idx on academy_league_members(user_id);

alter table academy_leagues enable row level security;
alter table academy_league_members enable row level security;

-- You can read a league only if you are a member of it.
drop policy if exists academy_leagues_member_read on academy_leagues;
create policy academy_leagues_member_read on academy_leagues
  for select to authenticated
  using (exists (
    select 1 from academy_league_members m
    where m.league_id = academy_leagues.id and m.user_id = auth.uid()
  ));

-- You can read every member row in any league you belong to (the leaderboard).
drop policy if exists academy_league_members_co_read on academy_league_members;
create policy academy_league_members_co_read on academy_league_members
  for select to authenticated
  using (league_id in (
    select m.league_id from academy_league_members m where m.user_id = auth.uid()
  ));

-- No INSERT/UPDATE/DELETE policies → only the service role mutates standings.
