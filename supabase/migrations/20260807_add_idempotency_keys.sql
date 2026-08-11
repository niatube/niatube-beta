begin;

alter table public.super_support_transactions
add column if not exists idempotency_key text;

create unique index if not exists
super_support_transactions_idempotency_key_idx
on public.super_support_transactions(idempotency_key);

commit;