create table if not exists
public.creator_payment_provider_accounts (
  id uuid primary key default gen_random_uuid(),

  creator_id uuid not null,

  payment_provider text not null,

  provider_account_id text not null,

  provider_account_type text,

  onboarding_status text not null
    default 'NOT_STARTED',

  details_submitted boolean not null
    default false,

  charges_enabled boolean not null
    default false,

  payouts_enabled boolean not null
    default false,

  is_active boolean not null
    default true,

  provider_metadata jsonb not null
    default '{}'::jsonb,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  unique (
    creator_id,
    payment_provider
  ),

  unique (
    payment_provider,
    provider_account_id
  )
);

create index if not exists
  creator_payment_provider_accounts_creator_idx
on public.creator_payment_provider_accounts(
  creator_id
);

create index if not exists
  creator_payment_provider_accounts_provider_idx
on public.creator_payment_provider_accounts(
  payment_provider,
  provider_account_id
);

create index if not exists
  creator_payment_provider_accounts_status_idx
on public.creator_payment_provider_accounts(
  payment_provider,
  onboarding_status,
  is_active
);