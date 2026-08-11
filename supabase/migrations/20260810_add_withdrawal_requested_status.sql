alter table public.settlement_transactions
  drop constraint if exists settlement_transactions_status_check;

alter table public.settlement_transactions
  add constraint settlement_transactions_status_check
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
      'WITHDRAWAL_REQUESTED',
      'PAYOUT_QUEUED',
      'PAYOUT_PROCESSING',
      'PAID_OUT',
      'FAILED',
      'REFUNDED',
      'REVERSED'
    )
  );


alter table public.settlement_status_history
  drop constraint if exists settlement_status_history_from_status_check;

alter table public.settlement_status_history
  add constraint settlement_status_history_from_status_check
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
      'WITHDRAWAL_REQUESTED',
      'PAYOUT_QUEUED',
      'PAYOUT_PROCESSING',
      'PAID_OUT',
      'FAILED',
      'REFUNDED',
      'REVERSED'
    )
  );


alter table public.settlement_status_history
  drop constraint if exists settlement_status_history_to_status_check;

alter table public.settlement_status_history
  add constraint settlement_status_history_to_status_check
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
      'WITHDRAWAL_REQUESTED',
      'PAYOUT_QUEUED',
      'PAYOUT_PROCESSING',
      'PAID_OUT',
      'FAILED',
      'REFUNDED',
      'REVERSED'
    )
  );