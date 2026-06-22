-- Allow the public discovery-call booking kind alongside the existing client meeting kinds.
alter table public.bookings drop constraint if exists bookings_meeting_kind_check;
alter table public.bookings add constraint bookings_meeting_kind_check
  check (meeting_kind in ('kickoff', 'review', 'status', 'adhoc', 'discovery'));
