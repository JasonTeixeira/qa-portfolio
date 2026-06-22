-- Public (unauthenticated) discovery-call bookings: capture the prospect's name + email.
-- booked_by/organization_id stay null for these; guest_email present = a public booking.
-- Applied 2026-06-22 via Supabase MCP; recorded for version control.
alter table public.bookings add column if not exists guest_name text;
alter table public.bookings add column if not exists guest_email text;
create index if not exists bookings_guest_email_idx on public.bookings (guest_email);
create index if not exists bookings_window_idx on public.bookings (status, starts_at, ends_at);
