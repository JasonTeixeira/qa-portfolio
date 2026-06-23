-- Academy content foundation (5/5): all-access membership (the paywall table).
-- Written by the Stripe webhook (service role) via upsertAcademyMembershipFromSubscription
-- / cancelAcademyMembership; read by getActiveMembership via the RLS client (own rows).
-- Dual keying: user_id (uuid, NULLABLE — Stripe metadata may lack it) drives the
-- RLS read path; email (always present) is the durable learner key on write.
-- stripe_subscription_id is the idempotency/onConflict key. status is left as
-- free text on purpose (Stripe statuses evolve); the app checks active/trialing/past_due.

create table if not exists public.academy_allaccess_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text,
  status text not null,
  plan_interval text not null check (plan_interval in ('monthly', 'yearly')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  price_amount integer,
  price_currency text not null default 'usd',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_allaccess_user_period_idx
  on public.academy_allaccess_subscriptions (user_id, current_period_end desc);
create index if not exists academy_allaccess_email_idx
  on public.academy_allaccess_subscriptions (lower(email));

alter table public.academy_allaccess_subscriptions enable row level security;

-- Own-row read for the logged-in learner. All writes are service-role (Stripe
-- webhook) → no insert/update policy. Rows with user_id IS NULL are invisible to
-- RLS by design (reachable only by the service role; email-keyed access falls
-- back to academy_enrollments in access.ts).
drop policy if exists academy_allaccess_own_select on public.academy_allaccess_subscriptions;
create policy academy_allaccess_own_select on public.academy_allaccess_subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);
