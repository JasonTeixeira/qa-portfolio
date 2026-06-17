-- Phase 25: Supabase Auth migration — profiles + admin approval gate.
-- Apply via Supabase Dashboard → SQL Editor or `supabase db push` if linked.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  company text,
  role_in_company text,
  avatar_url text,
  app_role text not null default 'pending'
    check (app_role in ('pending', 'client', 'collaborator', 'admin')),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "admins all access" on public.profiles;
create policy "admins all access" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.app_role = 'admin'
    )
  );

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.auto_admin_for_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.email = 'sage@sageideas.org' or new.email = 'sage@sageideas.dev' then
    new.app_role = 'admin';
    new.approval_status = 'approved';
    new.approved_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_auto_admin on public.profiles;
create trigger profiles_auto_admin
  before insert on public.profiles
  for each row execute function public.auto_admin_for_owner();
