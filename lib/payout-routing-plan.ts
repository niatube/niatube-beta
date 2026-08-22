import type { CreatorPayoutMethod } from "@/lib/creator-payout-preferences";

import type { PaymentRailId } from "@/lib/global-registry";

import { resolvePayoutRailsForMethod } from "@/lib/payout-rail-resolver";

import {
  getEligiblePayoutProviders,
  type PayoutProviderCapability,
} from "@/lib/payout-provider-capabilities";

import { isPayoutProviderProductionQualified } from "@/lib/payout-provider-qualifications";

export type PayoutRouteCandidate = {
  payoutRail: PaymentRailId;
  providerCapability: PayoutProviderCapability;
};
export type PayoutRoutingPlan = {
  countryCode: string;
  currencyCode: string;
  payoutMethod: CreatorPayoutMethod;

  candidateRoutes: PayoutRouteCandidate[];
};

/**
 * Builds a dry-run routing plan.
 *
 * This function does NOT initiate a payout.
 * It only resolves:
 *
 * creator payout method
 * -> concrete local rails
 * -> eligible provider capabilities
 */
export function buildPayoutRoutingPlan(input: {
  countryCode: string;
  currencyCode: string;
  payoutMethod: CreatorPayoutMethod;
}): PayoutRoutingPlan {
  const countryCode = String(input.countryCode || "")
    .trim()
    .toUpperCase();

  const currencyCode = String(input.currencyCode || "")
    .trim()
    .toUpperCase();

  const payoutRails = resolvePayoutRailsForMethod({
    countryCode,
    payoutMethod: input.payoutMethod,
  });

  const candidateRoutes = payoutRails.flatMap((payoutRail) =>
    getEligiblePayoutProviders({
      countryCode,
      currencyCode,
      payoutRail,
    })
      .filter((providerCapability) =>
        isPayoutProviderProductionQualified({
          provider: providerCapability.provider,
          countryCode,
          currencyCode,
        }),
      )
      .map((providerCapability) => ({
        payoutRail,
        providerCapability,
      })),
  );

  return {
    countryCode,
    currencyCode,
    payoutMethod: input.payoutMethod,
    candidateRoutes,
  };
}
