alter table public.creator_payout_profiles
  add column if not exists payout_country_code text;

alter table public.creator_payout_profiles
  add column if not exists preferred_payout_method text;

alter table public.creator_payout_profiles
  add column if not exists fallback_payout_method text;

alter table public.creator_payout_profiles
  add column if not exists payout_preference_enabled boolean
  not null
  default true;

create index if not exists
  creator_payout_profiles_country_currency_idx
on public.creator_payout_profiles(
  payout_country_code,
  payout_currency
);

create index if not exists
  creator_payout_profiles_preferred_method_idx
on public.creator_payout_profiles(
  preferred_payout_method
);