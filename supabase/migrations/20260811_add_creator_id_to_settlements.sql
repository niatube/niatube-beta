alter table public.settlement_transactions
  add column if not exists creator_id text;


create index if not exists
  settlement_transactions_creator_id_idx
on public.settlement_transactions(creator_id);