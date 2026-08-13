alter table public.settlement_transactions
  add column if not exists creator_net_amount numeric(18,2);


alter table public.settlement_transactions
  add constraint settlement_transactions_creator_net_amount_check
  check (
    creator_net_amount is null
    or creator_net_amount >= 0
  );