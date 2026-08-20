import {
  getCountry,
  PAYMENT_RAILS,
  PaymentRailId,
  PaymentRailType,
} from "@/lib/global-registry";

import type {
  CreatorPayoutMethod,
} from "@/lib/creator-payout-preferences";

function getRailTypeForPayoutMethod(
  method: CreatorPayoutMethod,
): PaymentRailType {
  switch (method) {
    case "BANK_ACCOUNT":
      return PaymentRailType.BANK_TRANSFER;

    case "MOBILE_MONEY":
      return PaymentRailType.MOBILE_MONEY;

    case "DIGITAL_WALLET":
      return PaymentRailType.WALLET;

    default: {
      const exhaustiveCheck: never = method;

      throw new Error(
        `Unsupported creator payout method: ${exhaustiveCheck}`,
      );
    }
  }
}

/**
 * Resolve a creator-facing payout method into
 * the concrete payout rails available in that
 * creator's country.
 *
 * Example:
 *
 * RW + MOBILE_MONEY
 * -> MTN_MOMO
 * -> AIRTEL_MONEY
 *
 * KE + MOBILE_MONEY
 * -> MPESA
 * -> AIRTEL_MONEY
 *
 * The provider is deliberately NOT selected here.
 */
export function resolvePayoutRailsForMethod(input: {
  countryCode: string;
  payoutMethod: CreatorPayoutMethod;
}): PaymentRailId[] {
  const countryCode =
    String(input.countryCode || "")
      .trim()
      .toUpperCase();

  const country =
    getCountry(countryCode);

  if (!country) {
    throw new Error(
      `Payout country ${countryCode} is not registered.`,
    );
  }

  const requiredRailType =
    getRailTypeForPayoutMethod(
      input.payoutMethod,
    );

  return country.marketAvailableRails.filter(
    (railId) => {
      const rail =
        PAYMENT_RAILS[railId];

      return (
        rail?.type ===
        requiredRailType
      );
    },
  );
}