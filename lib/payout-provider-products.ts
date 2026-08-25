import type { PayoutProviderId } from "@/lib/payout-provider-router";

export type StripePayoutProduct =
  | "CONNECT"
  | "GLOBAL_PAYOUTS";

export type PayoutProviderProduct =
  | StripePayoutProduct;

export function normalizePayoutProviderProduct(
  provider: PayoutProviderId,
  product?: string | null,
): PayoutProviderProduct | null {
  if (provider !== "STRIPE") {
    return null;
  }

  const normalized = String(product || "")
    .trim()
    .toUpperCase();

  switch (normalized) {
    case "CONNECT":
    case "GLOBAL_PAYOUTS":
      return normalized;

    default:
      throw new Error(
        `Unsupported Stripe payout product: ${normalized || "EMPTY"}.`,
      );
  }
}