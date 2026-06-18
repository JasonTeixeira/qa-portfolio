-- Program 9 — Academy commerce fulfillment.
-- Stripe checkout creates access records through the service-role webhook.
-- No anonymous writes are allowed.

create table if not exists public.academy_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  track_slug text not null,
  product_name text not null,
  email text not null,
  name text,
  status text not null default 'active'
    check (status in ('active', 'refunded', 'revoked')),
  amount_cents integer,
  currency text not null default 'usd',
  stripe_checkout_session_id text not null unique,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  access_starts_at timestamptz not null default now(),
  access_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.academy_enrollments enable row level security;

drop policy if exists academy_enrollments_admin_read on public.academy_enrollments;
create policy academy_enrollments_admin_read on public.academy_enrollments
  for select
  to authenticated
  using (
    exists (
      select 1 from app_users au
      where au.id = (select auth.uid())
        and au.role = any (array['admin'::text, 'owner'::text])
    )
  );

create index if not exists academy_enrollments_email_idx
  on public.academy_enrollments (lower(email));

create index if not exists academy_enrollments_track_status_idx
  on public.academy_enrollments (track_slug, status, created_at desc);
