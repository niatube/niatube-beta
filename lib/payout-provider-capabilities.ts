import type { PaymentRailId } from "@/lib/global-registry";
import type { PayoutProviderId } from "@/lib/payout-provider-router";

export type PayoutProviderCapability = {
  provider: PayoutProviderId;

  countryCode: string;
  currencyCode: string;

  payoutRail: PaymentRailId;

  enabled: boolean;

  priority: number;

  supportsFx: boolean;

  minimumAmount?: number | null;
  maximumAmount?: number | null;

  notes?: string | null;
};

/**
 * Provider capability registry.
 *
 * IMPORTANT:
 * A capability should only be enabled after
 * NiaTube has commercially and technically
 * verified that the provider supports the
 * specified corridor.
 *
 * Providers under qualification can be listed
 * with enabled: false.
 */
export const PAYOUT_PROVIDER_CAPABILITIES:
  PayoutProviderCapability[] = [];

/**
 * Returns enabled providers capable of executing
 * a specific payout corridor.
 *
 * Matching is based on:
 * country + currency + payout rail.
 *
 * Lower priority numbers are preferred.
 */
export function getEligiblePayoutProviders(input: {
  countryCode: string;
  currencyCode: string;
  payoutRail: PaymentRailId;
}): PayoutProviderCapability[] {
  const countryCode =
    String(input.countryCode || "")
      .trim()
      .toUpperCase();

  const currencyCode =
    String(input.currencyCode || "")
      .trim()
      .toUpperCase();

  return PAYOUT_PROVIDER_CAPABILITIES
    .filter(
      (capability) =>
        capability.enabled &&
        capability.countryCode.toUpperCase() ===
          countryCode &&
        capability.currencyCode.toUpperCase() ===
          currencyCode &&
        capability.payoutRail ===
          input.payoutRail,
    )
    .sort(
      (a, b) =>
        a.priority - b.priority,
    );
}