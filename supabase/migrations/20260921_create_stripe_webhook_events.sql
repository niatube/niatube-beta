begin;

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),

  stripe_event_id text not null,
  event_type text not null,

  livemode boolean not null default false,
  api_version text,

  processing_status text not null default 'RECEIVED',

  processing_error text,

  received_at timestamptz not null default now(),
  processed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stripe_webhook_events_event_id_unique
    unique (stripe_event_id),

  constraint stripe_webhook_events_processing_status_check
    check (
      processing_status in (
        'RECEIVED',
        'PROCESSING',
        'PROCESSED',
        'FAILED',
        'IGNORED'
      )
    )
);

create index if not exists
  stripe_webhook_events_event_type_idx
on public.stripe_webhook_events(event_type);

create index if not exists
  stripe_webhook_events_processing_status_idx
on public.stripe_webhook_events(processing_status);

create index if not exists
  stripe_webhook_events_received_at_idx
on public.stripe_webhook_events(received_at);

alter table public.stripe_webhook_events
  enable row level security;

commit;
