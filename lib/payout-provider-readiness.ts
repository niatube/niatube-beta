import type { PayoutProviderId } from "@/lib/payout-provider-router";
import type { PayoutProviderProduct } from "@/lib/payout-provider-products";

export type ProviderReadinessRequirement =
  | "COMMERCIAL_QUALIFICATION"
  | "PRODUCTION_CREDENTIALS"
  | "CREATOR_ONBOARDING"
  | "PAYMENT_FLOW"
  | "PAYOUT_FLOW"
  | "WEBHOOKS"
  | "RECONCILIATION"
  | "SANDBOX_TEST"
  | "PRODUCTION_APPROVAL";

export type ProviderReadinessCheck = {
  requirement: ProviderReadinessRequirement;
  complete: boolean;
  notes?: string | null;
};

export type PayoutProviderReadiness = {
  provider: PayoutProviderId;
  product?: PayoutProviderProduct | null;

  checks: ProviderReadinessCheck[];
  notes?: string | null;
};

/**
 * Provider activation readiness.
 *
 * This registry answers:
 *
 * "Has NiaTube completed all operational and
 * technical requirements needed before a provider
 * may be considered production-ready?"
 *
 * This is intentionally separate from:
 *
 * - provider capability
 * - commercial qualification
 * - production routing activation
 *
 * A provider should not become technically READY
 * merely because API credentials exist.
 */
export const PAYOUT_PROVIDER_READINESS:
  PayoutProviderReadiness[] = [
        {
      provider: "STRIPE",
      product: "CONNECT",

      checks: [
        {
          requirement:
            "COMMERCIAL_QUALIFICATION",
          complete: true,
          notes:
            "Stripe confirmed NiaTube can onboard at its current pre-launch stage and recommended Connect Direct Charges for supported connected-account markets.",
        },

        {
          requirement:
            "PRODUCTION_CREDENTIALS",
          complete: false,
          notes:
            "Production Stripe credentials have not yet been configured for the NiaTube Connect integration.",
        },

        {
          requirement:
            "CREATOR_ONBOARDING",
          complete: false,
          notes:
            "Stripe Connect creator onboarding has not yet been completed. Stripe-hosted onboarding is the current preferred NiaTube beta direction.",
        },

        {
          requirement:
            "PAYMENT_FLOW",
          complete: false,
          notes:
            "Stripe Connect Direct Charges with the NiaTube application fee have not yet been implemented or tested end-to-end.",
        },

        {
          requirement:
            "PAYOUT_FLOW",
          complete: false,
          notes:
            "Connected-account payout behavior has not yet been validated for the NiaTube Connect rail.",
        },

        {
          requirement:
            "WEBHOOKS",
          complete: false,
          notes:
            "Stripe Connect webhook signature verification and settlement-event mapping have not yet been implemented.",
        },

        {
          requirement:
            "RECONCILIATION",
          complete: false,
          notes:
            "Stripe Connect transaction, application-fee, connected-account balance, payout, and NiaTube ledger reconciliation has not yet been validated.",
        },

        {
          requirement:
            "SANDBOX_TEST",
          complete: false,
          notes:
            "End-to-end Stripe Connect sandbox testing has not yet been completed.",
        },

        {
          requirement:
            "PRODUCTION_APPROVAL",
          complete: false,
          notes:
            "NiaTube has not yet completed final production activation review for Stripe Connect.",
        },
      ],

      notes:
        "Stripe Connect must remain fail-closed until every required readiness check for the Connect product is complete.",
    },

    {
      provider: "STRIPE",
      product: "GLOBAL_PAYOUTS",

      checks: [
        {
          requirement:
            "COMMERCIAL_QUALIFICATION",
          complete: true,
          notes:
            "Stripe provided written Global Payouts market guidance for NiaTube's US master account on 2026-08-21.",
        },

        {
          requirement:
            "PRODUCTION_CREDENTIALS",
          complete: false,
          notes:
            "Production Stripe credentials for Global Payouts have not yet been configured.",
        },

        {
          requirement:
            "CREATOR_ONBOARDING",
          complete: false,
          notes:
            "Stripe Global Payouts recipient creation and recipient onboarding have not yet been implemented.",
        },

        {
          requirement:
            "PAYMENT_FLOW",
          complete: true,
          notes:
            "Global Payouts is a payout-only product; inbound viewer payment processing is intentionally outside this product's readiness scope.",
        },

        {
          requirement:
            "PAYOUT_FLOW",
          complete: false,
          notes:
            "Global Payouts FinancialAccount, recipient PayoutMethod, and OutboundPayment execution have not yet been implemented or tested.",
        },

        {
          requirement:
            "WEBHOOKS",
          complete: false,
          notes:
            "Global Payouts event handling and settlement-status mapping have not yet been implemented.",
        },

        {
          requirement:
            "RECONCILIATION",
          complete: false,
          notes:
            "Global Payouts OutboundPayment, Stripe balance, funding, and NiaTube settlement-ledger reconciliation has not yet been validated.",
        },

        {
          requirement:
            "SANDBOX_TEST",
          complete: false,
          notes:
            "End-to-end Stripe Global Payouts sandbox testing has not yet been completed.",
        },

        {
          requirement:
            "PRODUCTION_APPROVAL",
          complete: false,
          notes:
            "NiaTube has not yet completed final production activation review for Stripe Global Payouts.",
        },
      ],

      notes:
        "Stripe Global Payouts must remain fail-closed until every required readiness check for the Global Payouts product is complete.",
    },
  ];

/**
 * Return readiness information for an exact
 * provider + product combination.
 *
 * Product-aware lookup prevents one provider product
 * from inheriting the readiness state of another.
 */
export function getPayoutProviderReadiness(input: {
  provider: PayoutProviderId;
  product?: PayoutProviderProduct | null;
}): PayoutProviderReadiness | null {
  const product = input.product ?? null;

  return (
    PAYOUT_PROVIDER_READINESS.find(
      (entry) =>
        entry.provider === input.provider &&
        (entry.product ?? null) === product,
    ) ?? null
  );
}

/**
 * A provider product is activation-ready only when
 * every required readiness check is complete.
 *
 * Missing readiness configuration fails closed.
 */
export function isPayoutProviderActivationReady(input: {
  provider: PayoutProviderId;
  product?: PayoutProviderProduct | null;
}): boolean {
  const readiness =
    getPayoutProviderReadiness({
      provider: input.provider,
      product: input.product ?? null,
    });

  if (!readiness) {
    return false;
  }

  return (
    readiness.checks.length > 0 &&
    readiness.checks.every(
      (check) => check.complete,
    )
  );
}

/**
 * Returns incomplete activation requirements
 * for an exact provider + product combination.
 *
 * Useful for future finance/admin readiness
 * dashboards and deployment reviews.
 */
export function getIncompleteProviderReadinessChecks(input: {
  provider: PayoutProviderId;
  product?: PayoutProviderProduct | null;
}): ProviderReadinessCheck[] {
  const readiness =
    getPayoutProviderReadiness({
      provider: input.provider,
      product: input.product ?? null,
    });

  if (!readiness) {
    return [];
  }

  return readiness.checks.filter(
    (check) => !check.complete,
  );
}