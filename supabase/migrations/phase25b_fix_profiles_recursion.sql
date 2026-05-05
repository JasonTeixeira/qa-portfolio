-- Phase 25b: Fix recursive RLS on profiles by introducing SECURITY DEFINER helpers.
-- Applied via Supabase MCP on 2026-05-05.

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = uid and app_role = 'admin');
$$;
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, service_role;

create or replace function public.current_role_app()
returns text language sql stable security definer set search_path = public as $$
  select app_role from public.profiles where id = auth.uid();
$$;
revoke all on function public.current_role_app() from public;
grant execute on function public.current_role_app() to authenticated, service_role;

drop policy if exists "admins all access" on public.profiles;
create policy "admins all access" on public.profiles for all to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
