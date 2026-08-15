-- Two-sided referral: a stable code per learner + one attributed referral per invitee.
-- Rewards (XP + freezes) granted once per conversion; all writes are service-role only.

create table if not exists academy_referral_codes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists academy_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  invitee_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  status text not null default 'pending' check (status in ('pending', 'converted')),
  reward_granted boolean not null default false,
  created_at timestamptz not null default now(),
  converted_at timestamptz,
  unique (invitee_id)              -- an invitee can be attributed to exactly one referrer
);
create index if not exists academy_referrals_referrer_idx on academy_referrals(referrer_id, status);

alter table academy_referral_codes enable row level security;
alter table academy_referrals enable row level security;

-- Own-row reads; no INSERT/UPDATE policies → only the service role mutates.
drop policy if exists academy_referral_codes_own_read on academy_referral_codes;
create policy academy_referral_codes_own_read on academy_referral_codes
  for select to authenticated using (user_id = auth.uid());

-- The referrer sees their referrals; the invitee sees their own attribution.
drop policy if exists academy_referrals_party_read on academy_referrals;
create policy academy_referrals_party_read on academy_referrals
  for select to authenticated using (referrer_id = auth.uid() or invitee_id = auth.uid());
