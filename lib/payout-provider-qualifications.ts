import type { PayoutProviderId } from "@/lib/payout-provider-router";
import { isPayoutProviderActivationReady } from "@/lib/payout-provider-readiness";

export type ProviderCommercialStatus =
  | "QUALIFIED"
  | "BETA"
  | "UNAVAILABLE"
  | "PENDING_CONFIRMATION"
  | "PENDING_QUALIFICATION";

export type ProviderTechnicalStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "READY";

export type PayoutProviderQualification = {
  provider: PayoutProviderId;

  countryCode: string;
  currencyCode: string;

  commercialStatus: ProviderCommercialStatus;
  technicalStatus: ProviderTechnicalStatus;

  productionEnabled: boolean;

  source: string;

  notes?: string | null;
};

/**
 * Provider qualification registry.
 *
 * This registry answers a different question from
 * PAYOUT_PROVIDER_CAPABILITIES.
 *
 * Capability:
 * "Does the provider document support for this corridor?"
 *
 * Qualification:
 * "Can NiaTube commercially and technically use this
 * corridor in production?"
 *
 * A corridor must never be treated as production-ready
 * merely because public provider documentation lists it.
 */
export const PAYOUT_PROVIDER_QUALIFICATIONS:
  PayoutProviderQualification[] = [
    /*
     * ======================================================
     * STRIPE
     *
     * Source:
     * Stripe meeting + written recap from Adil Arif
     * received 2026-08-21.
     *
     * All productionEnabled values remain false until
     * NiaTube completes the applicable Stripe integration,
     * credentials, onboarding, webhook validation, and
     * production testing.
     * ======================================================
     */

    {
      provider: "STRIPE",
      countryCode: "EG",
      currencyCode: "EGP",
      commercialStatus: "QUALIFIED",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Egypt as an active Global Payouts market available from NiaTube's US master account.",
    },

    {
      provider: "STRIPE",
      countryCode: "KE",
      currencyCode: "KES",
      commercialStatus: "QUALIFIED",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Kenya as an active Global Payouts market available from NiaTube's US master account.",
    },

    {
      provider: "STRIPE",
      countryCode: "MA",
      currencyCode: "MAD",
      commercialStatus: "QUALIFIED",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Morocco as an active Global Payouts market available from NiaTube's US master account.",
    },

    {
      provider: "STRIPE",
      countryCode: "ZA",
      currencyCode: "ZAR",
      commercialStatus: "QUALIFIED",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies South Africa as an active Global Payouts market available from NiaTube's US master account.",
    },

    {
      provider: "STRIPE",
      countryCode: "CI",
      currencyCode: "XOF",
      commercialStatus: "QUALIFIED",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Ivory Coast as an active Global Payouts market available from NiaTube's US master account.",
    },

    {
      provider: "STRIPE",
      countryCode: "NG",
      currencyCode: "NGN",
      commercialStatus: "UNAVAILABLE",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Nigeria as unsupported for the proposed native Connect payout/mobile-money strategy. Alternative regional payout rail required.",
    },

    {
      provider: "STRIPE",
      countryCode: "UG",
      currencyCode: "UGX",
      commercialStatus: "UNAVAILABLE",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Uganda as unsupported for the proposed native Connect payout/mobile-money strategy. Alternative regional payout rail required.",
    },

    {
      provider: "STRIPE",
      countryCode: "TZ",
      currencyCode: "TZS",
      commercialStatus: "UNAVAILABLE",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Tanzania as unsupported for the proposed native Connect payout/mobile-money strategy. Alternative regional payout rail required.",
    },

    {
      provider: "STRIPE",
      countryCode: "GH",
      currencyCode: "GHS",
      commercialStatus: "UNAVAILABLE",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Ghana as unsupported for the proposed native Connect payout/mobile-money strategy. Alternative regional payout rail required.",
    },

    {
      provider: "STRIPE",
      countryCode: "CM",
      currencyCode: "XAF",
      commercialStatus: "UNAVAILABLE",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Stripe written recap identifies Cameroon as unsupported for the proposed native Connect payout/mobile-money strategy. Alternative regional payout rail required.",
    },

    {
      provider: "STRIPE",
      countryCode: "SN",
      currencyCode: "XOF",
      commercialStatus: "BETA",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_MEETING_2026_08_21",
      notes:
        "Stripe verbally identified Senegal as Beta during the 2026-08-21 meeting. Written confirmation has been requested and is still pending.",
    },

    {
      provider: "STRIPE",
      countryCode: "RW",
      currencyCode: "RWF",
      commercialStatus: "PENDING_CONFIRMATION",
      technicalStatus: "NOT_STARTED",
      productionEnabled: false,
      source: "STRIPE_EMAIL_2026_08_21",
      notes:
        "Rwanda was not listed among the five active Global Payouts markets in Stripe's written recap and was not listed among the five unsupported priority markets. Explicit confirmation is still required.",
    },
  ];

/**
 * Return a provider qualification for an exact
 * provider + country + currency combination.
 */
export function getPayoutProviderQualification(input: {
  provider: PayoutProviderId;
  countryCode: string;
  currencyCode: string;
}): PayoutProviderQualification | null {
  const countryCode = String(input.countryCode || "")
    .trim()
    .toUpperCase();

  const currencyCode = String(input.currencyCode || "")
    .trim()
    .toUpperCase();

  return (
    PAYOUT_PROVIDER_QUALIFICATIONS.find(
      (qualification) =>
        qualification.provider === input.provider &&
        qualification.countryCode === countryCode &&
        qualification.currencyCode === currencyCode,
    ) ?? null
  );
}

/**
 * A provider corridor is production-qualified only when:
 *
 * 1. commercial qualification is complete,
 * 2. technical integration is READY, and
 * 3. productionEnabled has explicitly been turned on.
 *
 * This is deliberately fail-closed.
 */
export function isPayoutProviderProductionQualified(input: {
  provider: PayoutProviderId;
  countryCode: string;
  currencyCode: string;
}): boolean {
  const qualification =
    getPayoutProviderQualification(input);

  if (!qualification) {
    return false;
  }

  return (
    qualification.commercialStatus === "QUALIFIED" &&
    qualification.technicalStatus === "READY" &&
    qualification.productionEnabled === true &&
    isPayoutProviderActivationReady(input.provider)
  );
}
