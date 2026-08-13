alter table public.creator_payout_profiles
  add column if not exists creator_id uuid;

alter table public.creator_payout_profiles
  add column if not exists payout_provider text;

alter table public.creator_payout_profiles
  add column if not exists provider_recipient_id text;

alter table public.creator_payout_profiles
  add column if not exists provider_recipient_type text;

create index if not exists
  creator_payout_profiles_creator_id_idx
on public.creator_payout_profiles(creator_id);

create index if not exists
  creator_payout_profiles_provider_recipient_idx
on public.creator_payout_profiles(
  payout_provider,
  provider_recipient_id
);