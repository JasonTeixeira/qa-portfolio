-- Discord content queue automation: link queue items back to classified source messages.

alter table public.discord_content_queue
  add column if not exists source_message_id text references public.discord_messages(discord_message_id) on delete cascade,
  add column if not exists source_classification_action text,
  add column if not exists source_classification_category text;

create unique index if not exists discord_content_queue_source_message_idx
  on public.discord_content_queue(source_message_id)
  where source_message_id is not null;

create index if not exists discord_content_queue_source_classification_idx
  on public.discord_content_queue(source_classification_action, priority desc, created_at desc)
  where source_message_id is not null;
