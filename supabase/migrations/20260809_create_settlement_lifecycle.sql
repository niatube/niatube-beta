create table if not exists public.settlement_transactions (
  id uuid primary key default gen_random_uuid(),

  source_type text not null,
  source_id text not null,

  creator_name text,

  currency_code text not null,
  gross_amount numeric(18,2) not null default 0,

  current_status text not null,

  payment_provider text,
  provider_reference text,

  failure_code text,
  failure_reason text,

  authorized_at timestamptz,
  captured_at timestamptz,
  settlement_pending_at timestamptz,
  settled_at timestamptz,
  available_at timestamptz,
  payout_queued_at timestamptz,
  payout_processing_at timestamptz,
  paid_out_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint settlement_transactions_source_unique
    unique (source_type, source_id),

  constraint settlement_transactions_status_check
    check (
      current_status in (
        'INITIATED',
        'AUTHORIZATION_PENDING',
        'AUTHORIZED',
        'CAPTURE_PENDING',
        'CAPTURED',
        'SETTLEMENT_PENDING',
        'SETTLED',
        'AVAILABLE',
        'PAYOUT_QUEUED',
        'PAYOUT_PROCESSING',
        'PAID_OUT',
        'FAILED',
        'REFUNDED',
        'REVERSED'
      )
    ),

  constraint settlement_transactions_gross_amount_check
    check (gross_amount >= 0)
);


create table if not exists public.settlement_status_history (
  id uuid primary key default gen_random_uuid(),

  settlement_transaction_id uuid not null
    references public.settlement_transactions(id)
    on delete cascade,

  from_status text,
  to_status text not null,

  transition_reason text,

  payment_provider text,
  provider_reference text,

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint settlement_status_history_from_status_check
    check (
      from_status is null
      or from_status in (
        'INITIATED',
        'AUTHORIZATION_PENDING',
        'AUTHORIZED',
        'CAPTURE_PENDING',
        'CAPTURED',
        'SETTLEMENT_PENDING',
        'SETTLED',
        'AVAILABLE',
        'PAYOUT_QUEUED',
        'PAYOUT_PROCESSING',
        'PAID_OUT',
        'FAILED',
        'REFUNDED',
        'REVERSED'
      )
    ),

  constraint settlement_status_history_to_status_check
    check (
      to_status in (
        'INITIATED',
        'AUTHORIZATION_PENDING',
        'AUTHORIZED',
        'CAPTURE_PENDING',
        'CAPTURED',
        'SETTLEMENT_PENDING',
        'SETTLED',
        'AVAILABLE',
        'PAYOUT_QUEUED',
        'PAYOUT_PROCESSING',
        'PAID_OUT',
        'FAILED',
        'REFUNDED',
        'REVERSED'
      )
    )
);


create index if not exists
  settlement_transactions_current_status_idx
on public.settlement_transactions(current_status);


create index if not exists
  settlement_transactions_creator_name_idx
on public.settlement_transactions(creator_name);


create index if not exists
  settlement_status_history_transaction_idx
on public.settlement_status_history(settlement_transaction_id);


create index if not exists
  settlement_status_history_created_at_idx
on public.settlement_status_history(created_at);


alter table public.settlement_transactions
  enable row level security;


alter table public.settlement_status_history
  enable row level security;