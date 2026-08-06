-- ==========================================================
-- NiaTube Beta
-- International Monetization Presets
-- Migration: 20260806
--
-- Seeds default Super Support pricing for CAD and AUD.
-- Safe to re-run because of ON CONFLICT.
-- ==========================================================

begin;

insert into public.monetization_presets (
  currency_code,
  tier,
  amount,
  display_order,
  is_active
)
values
  -- Canada
  ('CAD', 'Support', 5, 1, true),
  ('CAD', 'Champion', 20, 2, true),
  ('CAD', 'Legend', 100, 3, true),

  -- Australia
  ('AUD', 'Support', 5, 1, true),
  ('AUD', 'Champion', 20, 2, true),
  ('AUD', 'Legend', 100, 3, true)

on conflict (currency_code, tier)
do update set
  amount = excluded.amount,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

commit;