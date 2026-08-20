export type CreatorPayoutMethod =
  | "BANK_ACCOUNT"
  | "MOBILE_MONEY"
  | "DIGITAL_WALLET";

export type CreatorPayoutPreference = {
  creatorId: string;

  countryCode: string;
  currencyCode: string;

  preferredPayoutMethod: CreatorPayoutMethod;

  fallbackPayoutMethod?: CreatorPayoutMethod | null;

  enabled: boolean;
};

/**
 * Creator payout preferences are provider-neutral
 * and rail-neutral.
 *
 * Creators choose:
 * - payout country
 * - payout currency
 * - preferred payout method
 *
 * NiaTube later resolves:
 *
 * payout method
 * -> eligible local payout rail
 * -> eligible providers
 * -> selected provider
 */
export function normalizeCreatorPayoutPreference(
  preference: CreatorPayoutPreference,
): CreatorPayoutPreference {
  return {
    ...preference,

    creatorId:
      String(preference.creatorId || "").trim(),

    countryCode:
      String(preference.countryCode || "")
        .trim()
        .toUpperCase(),

    currencyCode:
      String(preference.currencyCode || "")
        .trim()
        .toUpperCase(),

    enabled:
      Boolean(preference.enabled),
  };
}