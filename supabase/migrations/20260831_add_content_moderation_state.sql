alter table public.uploads
  add column if not exists moderation_status text not null default 'pending',
  add column if not exists moderation_reason text,
  add column if not exists moderation_policy_category text,
  add column if not exists moderation_confidence numeric,
  add column if not exists moderation_detector text,
  add column if not exists moderation_detector_version text,
  add column if not exists moderation_reviewed_at timestamptz,
  add column if not exists monetization_status text not null default 'disabled',
  add column if not exists monetization_disabled_reason text,
  add column if not exists moderation_updated_at timestamptz not null default now();

alter table public.uploads
  add constraint uploads_moderation_status_check
  check (
    moderation_status in (
      'pending',
      'legacy_unreviewed',
      'approved',
      'under_review',
      'blocked',
      'removed'
    )
  );

alter table public.uploads
  add constraint uploads_monetization_status_check
  check (
    monetization_status in (
      'disabled',
      'eligible',
      'enabled'
    )
  );

alter table public.uploads
  add constraint uploads_moderation_confidence_check
  check (
    moderation_confidence is null
    or (
      moderation_confidence >= 0
      and moderation_confidence <= 1
    )
  );
  update public.uploads
set
  moderation_status = 'legacy_unreviewed',
  monetization_status = 'disabled',
  moderation_reason = 'Existing content predates the automated moderation pipeline.',
  moderation_updated_at = now()
where moderation_status = 'pending';

create index if not exists uploads_moderation_status_idx
  on public.uploads (moderation_status);

create index if not exists uploads_monetization_status_idx
  on public.uploads (monetization_status);