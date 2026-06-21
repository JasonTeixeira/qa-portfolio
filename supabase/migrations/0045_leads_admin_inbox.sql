-- Program E: admin leads inbox fields.
-- Keeps visitor writes server-side only; admins review and qualify leads here.

alter table public.leads
  add column if not exists status text not null default 'new'
    check (status in ('new', 'reviewed', 'qualified', 'nurture', 'won', 'lost', 'spam'));

alter table public.leads
  add column if not exists score integer not null default 0;

alter table public.leads
  add column if not exists owner_notes text;

alter table public.leads
  add column if not exists updated_at timestamptz not null default now();

update public.leads
set score = (metadata->>'lead_score')::integer
where score = 0
  and metadata ? 'lead_score'
  and (metadata->>'lead_score') ~ '^[0-9]+$';

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();

create index if not exists leads_status_created_at_idx on public.leads (status, created_at desc);
create index if not exists leads_score_created_at_idx on public.leads (score desc, created_at desc);
