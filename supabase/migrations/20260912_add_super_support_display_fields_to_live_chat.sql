alter table public.live_chat
  add column if not exists amount numeric,
  add column if not exists currency_code text;
