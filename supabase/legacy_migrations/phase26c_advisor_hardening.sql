-- Phase 26c — security advisor hardening. Applied via Supabase MCP on 2026-05-05.

revoke execute on function public.is_admin(uuid) from public, anon;
revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.can_access_engagement(uuid) from public, anon;
revoke execute on function public.current_role_app() from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.auto_admin_for_owner() from public, anon, authenticated;
revoke execute on function public.handle_new_profile_prefs() from public, anon, authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

alter table if exists public.sage_after_dark_now_status enable row level security;
alter table if exists public.sage_after_dark_rotation_items enable row level security;
alter table if exists public.sage_after_dark_featured_posts enable row level security;
