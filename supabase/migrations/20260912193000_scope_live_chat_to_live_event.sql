alter table public.live_chat
  add column if not exists live_video_id text;

create index if not exists live_chat_live_video_id_created_at_idx
  on public.live_chat (live_video_id, created_at);
