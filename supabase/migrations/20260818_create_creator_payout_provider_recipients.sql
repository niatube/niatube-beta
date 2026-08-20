create table if not exists
public.creator_payout_provider_recipients (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null,

  payout_provider text not null,

  provider_recipient_id text not null,

  provider_recipient_type text,

  country_code text not null,

  currency_code text not null,

  payout_rail text not null,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  unique (
    creator_id,
    payout_provider,
    country_code,
    currency_code,
    payout_rail
  )
);

create index if not exists
  creator_payout_provider_recipients_creator_idx
on public.creator_payout_provider_recipients(
  creator_id
);

create index if not exists
  creator_payout_provider_recipients_lookup_idx
on public.creator_payout_provider_recipients(
  creator_id,
  payout_provider,
  country_code,
  currency_code,
  payout_rail,
  is_active
);