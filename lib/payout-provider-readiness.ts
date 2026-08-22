import type { PayoutProviderId } from "@/lib/payout-provider-router";

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

      checks: [
        {
          requirement:
            "COMMERCIAL_QUALIFICATION",
          complete: true,
          notes:
            "Stripe confirmed NiaTube can onboard at its current pre-launch stage and provided written market guidance on 2026-08-21.",
        },

        {
          requirement:
            "PRODUCTION_CREDENTIALS",
          complete: false,
          notes:
            "Production Stripe credentials have not yet been configured for the NiaTube integration.",
        },

        {
          requirement:
            "CREATOR_ONBOARDING",
          complete: false,
          notes:
            "Stripe Connect creator onboarding has not yet been implemented. Embedded onboarding is the preferred NiaTube direction pending integration.",
        },

        {
          requirement:
            "PAYMENT_FLOW",
          complete: false,
          notes:
            "Stripe Connect Direct Charges with the NiaTube 5% application fee have not yet been implemented or tested.",
        },

        {
          requirement:
            "PAYOUT_FLOW",
          complete: false,
          notes:
            "Stripe creator payout and/or Global Payouts execution has not yet been implemented or tested.",
        },

        {
          requirement:
            "WEBHOOKS",
          complete: false,
          notes:
            "Stripe webhook signature verification and settlement-event mapping have not yet been implemented.",
        },

        {
          requirement:
            "RECONCILIATION",
          complete: false,
          notes:
            "Stripe transaction, application-fee, payout, and NiaTube ledger reconciliation has not yet been validated.",
        },

        {
          requirement:
            "SANDBOX_TEST",
          complete: false,
          notes:
            "End-to-end Stripe sandbox testing has not yet been completed.",
        },

        {
          requirement:
            "PRODUCTION_APPROVAL",
          complete: false,
          notes:
            "NiaTube has not yet completed final production activation review for Stripe.",
        },
      ],

      notes:
        "Stripe must remain fail-closed until every required readiness check is complete.",
    },
  ];

/**
 * Return readiness information for a provider.
 */
export function getPayoutProviderReadiness(
  provider: PayoutProviderId,
): PayoutProviderReadiness | null {
  return (
    PAYOUT_PROVIDER_READINESS.find(
      (entry) =>
        entry.provider === provider,
    ) ?? null
  );
}

/**
 * A provider is activation-ready only when
 * every required readiness check is complete.
 *
 * Missing readiness configuration fails closed.
 */
export function isPayoutProviderActivationReady(
  provider: PayoutProviderId,
): boolean {
  const readiness =
    getPayoutProviderReadiness(provider);

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
 * Returns incomplete activation requirements.
 *
 * Useful for future finance/admin readiness
 * dashboards and deployment reviews.
 */
export function getIncompleteProviderReadinessChecks(
  provider: PayoutProviderId,
): ProviderReadinessCheck[] {
  const readiness =
    getPayoutProviderReadiness(provider);

  if (!readiness) {
    return [];
  }

  return readiness.checks.filter(
    (check) => !check.complete,
  );
}