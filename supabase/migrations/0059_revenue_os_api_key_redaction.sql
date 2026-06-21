-- Phase 59 — Revenue OS API key redaction repair
-- Workspace members should never read key_hash directly. Admin/service flows can
-- still use the base table; member-facing reads go through a redacted view.

drop policy if exists "revenue_api_keys_member_select" on public.revenue_api_keys;

create or replace view public.revenue_api_keys_redacted
with (security_invoker = true) as
select
  id,
  workspace_id,
  tenant_key,
  name,
  key_prefix,
  last_four,
  scopes,
  status,
  expires_at,
  last_used_at,
  revoked_at,
  metadata,
  created_by,
  created_at,
  updated_at
from public.revenue_api_keys
where public.is_admin((select auth.uid()))
   or public.revenue_os_is_workspace_member(tenant_key);

grant select on public.revenue_api_keys_redacted to authenticated;
