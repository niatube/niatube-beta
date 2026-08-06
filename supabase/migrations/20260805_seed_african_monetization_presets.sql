-- ==========================================================
-- NiaTube Beta
-- African Monetization Presets
-- Migration: 20260805
--
-- Seeds default Super Support pricing for African currencies.
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
  -- Morocco
  ('MAD', 'Support', 20, 1, true),
  ('MAD', 'Champion', 100, 2, true),
  ('MAD', 'Legend', 500, 3, true),

  -- Algeria
  ('DZD', 'Support', 500, 1, true),
  ('DZD', 'Champion', 2500, 2, true),
  ('DZD', 'Legend', 10000, 3, true),

  -- Tunisia
  ('TND', 'Support', 5, 1, true),
  ('TND', 'Champion', 25, 2, true),
  ('TND', 'Legend', 100, 3, true),

  -- Egypt
  ('EGP', 'Support', 250, 1, true),
  ('EGP', 'Champion', 1000, 2, true),
  ('EGP', 'Legend', 5000, 3, true),

  -- Libya
  ('LYD', 'Support', 5, 1, true),
  ('LYD', 'Champion', 25, 2, true),
  ('LYD', 'Legend', 100, 3, true),

  -- Mauritania
  ('MRU', 'Support', 200, 1, true),
  ('MRU', 'Champion', 1000, 2, true),
  ('MRU', 'Legend', 5000, 3, true),

    -- Cabo Verde
  ('CVE', 'Support', 200, 1, true),
  ('CVE', 'Champion', 1000, 2, true),
  ('CVE', 'Legend', 5000, 3, true),

  -- Gambia
  ('GMD', 'Support', 200, 1, true),
  ('GMD', 'Champion', 1000, 2, true),
  ('GMD', 'Legend', 5000, 3, true),

  -- Guinea
  ('GNF', 'Support', 2500, 1, true),
  ('GNF', 'Champion', 10000, 2, true),
  ('GNF', 'Legend', 50000, 3, true),

  -- Liberia
  ('LRD', 'Support', 100, 1, true),
  ('LRD', 'Champion', 500, 2, true),
  ('LRD', 'Legend', 2000, 3, true),

  -- Sierra Leone
  ('SLE', 'Support', 200, 1, true),
  ('SLE', 'Champion', 1000, 2, true),
  ('SLE', 'Legend', 5000, 3, true),

    -- Burundi
  ('BIF', 'Support', 2000, 1, true),
  ('BIF', 'Champion', 10000, 2, true),
  ('BIF', 'Legend', 50000, 3, true),

  -- Djibouti
  ('DJF', 'Support', 1000, 1, true),
  ('DJF', 'Champion', 5000, 2, true),
  ('DJF', 'Legend', 25000, 3, true),

  -- Eritrea
  ('ERN', 'Support', 100, 1, true),
  ('ERN', 'Champion', 500, 2, true),
  ('ERN', 'Legend', 2500, 3, true),

  -- Ethiopia
  ('ETB', 'Support', 250, 1, true),
  ('ETB', 'Champion', 1000, 2, true),
  ('ETB', 'Legend', 5000, 3, true),

  -- Somalia
  ('SOS', 'Support', 10000, 1, true),
  ('SOS', 'Champion', 50000, 2, true),
  ('SOS', 'Legend', 250000, 3, true),

  -- South Sudan
  ('SSP', 'Support', 500, 1, true),
  ('SSP', 'Champion', 2500, 2, true),
  ('SSP', 'Legend', 10000, 3, true),

  -- Comoros
  ('KMF', 'Support', 1000, 1, true),
  ('KMF', 'Champion', 5000, 2, true),
  ('KMF', 'Legend', 25000, 3, true),

  -- Madagascar
  ('MGA', 'Support', 5000, 1, true),
  ('MGA', 'Champion', 25000, 2, true),
  ('MGA', 'Legend', 100000, 3, true),

  -- Mauritius
  ('MUR', 'Support', 100, 1, true),
  ('MUR', 'Champion', 500, 2, true),
  ('MUR', 'Legend', 2000, 3, true),

  -- Seychelles
  ('SCR', 'Support', 100, 1, true),
  ('SCR', 'Champion', 500, 2, true),
  ('SCR', 'Legend', 2000, 3, true),

    -- Angola
  ('AOA', 'Support', 1000, 1, true),
  ('AOA', 'Champion', 5000, 2, true),
  ('AOA', 'Legend', 25000, 3, true),

  -- Democratic Republic of the Congo
  ('CDF', 'Support', 5000, 1, true),
  ('CDF', 'Champion', 25000, 2, true),
  ('CDF', 'Legend', 100000, 3, true),

  -- Sao Tome and Principe
  ('STN', 'Support', 100, 1, true),
  ('STN', 'Champion', 500, 2, true),
  ('STN', 'Legend', 2000, 3, true),

    -- Botswana
  ('BWP', 'Support', 100, 1, true),
  ('BWP', 'Champion', 500, 2, true),
  ('BWP', 'Legend', 2000, 3, true),

  -- Lesotho
  ('LSL', 'Support', 100, 1, true),
  ('LSL', 'Champion', 500, 2, true),
  ('LSL', 'Legend', 2000, 3, true),

  -- Malawi
  ('MWK', 'Support', 2000, 1, true),
  ('MWK', 'Champion', 10000, 2, true),
  ('MWK', 'Legend', 50000, 3, true),

  -- Mozambique
  ('MZN', 'Support', 100, 1, true),
  ('MZN', 'Champion', 500, 2, true),
  ('MZN', 'Legend', 2000, 3, true),

  -- Namibia
  ('NAD', 'Support', 100, 1, true),
  ('NAD', 'Champion', 500, 2, true),
  ('NAD', 'Legend', 2000, 3, true),

  -- Eswatini
  ('SZL', 'Support', 100, 1, true),
  ('SZL', 'Champion', 500, 2, true),
  ('SZL', 'Legend', 2000, 3, true),

  -- Zambia
  ('ZMW', 'Support', 100, 1, true),
  ('ZMW', 'Champion', 500, 2, true),
  ('ZMW', 'Legend', 2000, 3, true),

  -- Zimbabwe
  ('ZWG', 'Support', 20, 1, true),
  ('ZWG', 'Champion', 100, 2, true),
  ('ZWG', 'Legend', 500, 3, true),

  -- Sudan
  ('SDG', 'Support', 1000, 1, true),
  ('SDG', 'Champion', 5000, 2, true),
  ('SDG', 'Legend', 25000, 3, true)

on conflict (currency_code, tier)
do update set
  amount = excluded.amount,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

commit;