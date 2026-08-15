-- Daily variable-reward claim ledger. One row per learner per UTC day, written
-- the moment the deterministic daily bonus (lib/academy/quest-logic.ts dailyBonus)
-- is actually EARNED (qualifying activity met) and its XP credited. This makes the
-- "+N XP banked" claim true, not theatre, and makes the award idempotent: the PK
-- (user_id, claim_date) + an ignore-duplicates upsert guarantees the bonus is paid
-- at most once per day even under concurrent activity events.
--
-- SECURITY (anti-cheat parity with the evidence spine): the learner READS their own
-- claim (so the panel can show the real banked state); they CANNOT write — the claim
-- + the XP credit happen only via the service role after server-side re-derivation of
-- dailyBonus(userId, today) against the learner's REAL activity snapshot. A learner
-- can never self-claim a bonus or inflate the payout.

create table if not exists academy_daily_bonus_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_date date not null,
  awarded_xp integer not null check (awarded_xp >= 0),
  bonus_kind text not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, claim_date)
);

alter table academy_daily_bonus_claims enable row level security;

drop policy if exists academy_daily_bonus_claims_own_read on academy_daily_bonus_claims;
create policy academy_daily_bonus_claims_own_read on academy_daily_bonus_claims
  for select to authenticated using (user_id = auth.uid());

-- Writes via service role only (structural denial, not just an absent policy).
revoke insert, update, delete on academy_daily_bonus_claims from authenticated, anon;
