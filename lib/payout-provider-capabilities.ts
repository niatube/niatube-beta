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
export const PAYOUT_PROVIDER_CAPABILITIES: PayoutProviderCapability[] = [
  {
    provider: "STRIPE",
    countryCode: "RW",
    currencyCode: "RWF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Rwanda recipient payouts in RWF by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "KE",
    currencyCode: "KES",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Kenya recipient payouts in KES by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "ZA",
    currencyCode: "ZAR",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms South Africa recipient payouts in ZAR by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "CI",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Cote d'Ivoire recipient payouts in XOF through a local bank payout method. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "SN",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Senegal recipient payouts in XOF through a local bank payout method. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "MA",
    currencyCode: "MAD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Morocco recipient payouts in MAD through a local bank payout method. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "EG",
    currencyCode: "EGP",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Egypt recipient payouts in EGP by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "TZ",
    currencyCode: "TZS",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Tanzania recipient payouts in TZS by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "DZ",
    currencyCode: "DZD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Algeria recipient payouts in DZD by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "BJ",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Benin recipient payouts in XOF through a local bank payout method. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "BW",
    currencyCode: "BWP",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Botswana recipient payouts in BWP by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "ET",
    currencyCode: "ETB",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Ethiopia recipient payouts in ETB by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "GM",
    currencyCode: "GMD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Gambia recipient payouts in GMD by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "MG",
    currencyCode: "MGA",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Madagascar recipient payouts in MGA by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "MU",
    currencyCode: "MUR",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Mauritius recipient payouts in MUR by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "MZ",
    currencyCode: "MZN",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Mozambique recipient payouts in MZN by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "NA",
    currencyCode: "NAD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Namibia recipient payouts in NAD by wire. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "STRIPE",
    countryCode: "TN",
    currencyCode: "TND",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 100,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "Stripe Global Payouts documentation confirms Tunisia recipient payouts in TND through a local bank payout method. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "RW",
    currencyCode: "RWF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Rwanda bank payouts in RWF, with P2P, B2P, P2B, and B2B products and Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "RW",
    currencyCode: "RWF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Rwanda wallet payouts in RWF, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "NG",
    currencyCode: "NGN",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Nigeria bank payouts in NGN, with P2P, B2P, P2B, and B2B products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "NG",
    currencyCode: "NGN",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Nigeria wallet payouts in NGN, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GH",
    currencyCode: "GHS",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ghana bank payouts in GHS, with P2P, B2P, P2B, and B2B products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "GH",
    currencyCode: "GHS",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ghana wallet payouts in GHS, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "KE",
    currencyCode: "KES",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Kenya bank payouts in KES, with P2P, B2P, P2B, and B2B products and Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "KE",
    currencyCode: "KES",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Kenya wallet payouts in KES, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "TZ",
    currencyCode: "TZS",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Tanzania bank payouts in TZS, with P2P, B2P, P2B, and B2B products and Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "TZ",
    currencyCode: "TZS",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Tanzania wallet payouts in TZS, with P2P and B2C products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "UG",
    currencyCode: "UGX",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Uganda bank payouts in UGX, with P2P, B2P, P2B, and B2B products and Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "UG",
    currencyCode: "UGX",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Uganda wallet payouts in UGX, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "ZM",
    currencyCode: "ZMW",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Zambia bank payouts in ZMW, with P2P, B2P, P2B, and B2B products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "ZM",
    currencyCode: "ZMW",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Zambia wallet payouts in ZMW, with P2P and B2P products and Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "MA",
    currencyCode: "MAD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Morocco bank payouts in MAD for P2P, with Attijariwafa Bank Real Time and other banks T+1. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "BJ",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Benin bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "BJ",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Benin wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "BF",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Burkina Faso bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "BF",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Burkina Faso wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GM",
    currencyCode: "GMD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Gambia bank payouts in GMD for P2P, B2P, P2B, and B2B with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "GM",
    currencyCode: "GMD",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Gambia wallet payouts in GMD for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "CI",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ivory Coast bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "CI",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ivory Coast wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "ML",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Mali bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "ML",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Mali wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "NE",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Niger bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "SN",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Senegal bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "SN",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Senegal wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "TG",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Togo bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "TG",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Togo wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "CM",
    currencyCode: "XAF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Cameroon bank payouts in XAF for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "CM",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Cameroon wallet payouts in XAF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "CF",
    currencyCode: "XAF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Central African Republic bank payouts in XAF for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "CF",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Central African Republic wallet payouts in XAF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "TD",
    currencyCode: "XAF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Chad bank payouts in XAF for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "TD",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Chad wallet payouts in XAF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "CG",
    currencyCode: "XAF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Republic of the Congo bank payouts in XAF for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "CG",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Republic of the Congo wallet payouts in XAF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GQ",
    currencyCode: "XAF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Equatorial Guinea bank payouts in XAF for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "GQ",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Equatorial Guinea wallet payouts in XAF for P2P and B2P. Settlement is listed as TBD. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GA",
    currencyCode: "XAF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Gabon wallet payouts in XAF for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "CD",
    currencyCode: "USD",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Democratic Republic of the Congo wallet payouts in USD for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "AO",
    currencyCode: "AOA",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Angola wallet payouts in AOA for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GW",
    currencyCode: "XOF",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Guinea-Bissau bank payouts in XOF for P2P, B2P, P2B, and B2B with T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "GW",
    currencyCode: "XOF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Guinea-Bissau wallet payouts in XOF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "GN",
    currencyCode: "GNF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Guinea Conakry wallet payouts in GNF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "LR",
    currencyCode: "USD",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Liberia wallet payouts in USD for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "MR",
    currencyCode: "MRU",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Mauritania bank payouts in MRU for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "MR",
    currencyCode: "MRU",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Mauritania wallet payouts in MRU for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "SL",
    currencyCode: "SLE",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Sierra Leone bank payouts in SLE for P2P, B2P, P2B, and B2B with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "SL",
    currencyCode: "SLE",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Sierra Leone wallet payouts in SLE for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "BI",
    currencyCode: "BIF",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Burundi wallet payouts in BIF for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "ET",
    currencyCode: "ETB",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ethiopia bank payouts in ETB for P2P, B2P, P2B, and B2B with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "ET",
    currencyCode: "ETB",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Ethiopia wallet payouts in ETB for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "MG",
    currencyCode: "MGA",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Madagascar wallet payouts in MGA for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "MW",
    currencyCode: "MWK",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Malawi bank payouts in MWK for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "MW",
    currencyCode: "MWK",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Malawi wallet payouts in MWK for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "MZ",
    currencyCode: "MZN",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Mozambique wallet payouts in MZN for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "ZA",
    currencyCode: "ZAR",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms South Africa bank payouts in ZAR for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "SS",
    currencyCode: "SSP",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms South Sudan wallet payouts in SSP for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "ZW",
    currencyCode: "USD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Zimbabwe bank payouts in USD for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "ZW",
    currencyCode: "USD",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Zimbabwe wallet payouts in USD for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "BW",
    currencyCode: "BWP",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Botswana wallet payouts in BWP for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "LS",
    currencyCode: "LSL",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Lesotho wallet payouts in LSL for P2P and B2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "EG",
    currencyCode: "EGP",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Egypt bank payouts in EGP for P2P with Same Day/T+1 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "EG",
    currencyCode: "USD",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Egypt bank payouts in USD for P2P with Same Day/T+2 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
  {
    provider: "TERRAPAY",
    countryCode: "EG",
    currencyCode: "EGP",
    payoutRail: "MOBILE_MONEY",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Egypt wallet payouts in EGP for P2P with Real Time settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },

  {
    provider: "TERRAPAY",
    countryCode: "TN",
    currencyCode: "TND",
    payoutRail: "BANK_TRANSFER",
    enabled: false,
    priority: 90,
    supportsFx: true,
    minimumAmount: null,
    maximumAmount: null,
    notes:
      "TerraPay 2026 coverage kit confirms Tunisia bank payouts in TND for P2P with T+3 settlement. NiaTube production onboarding, credentials, and adapter are not yet active.",
  },
];
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
  const countryCode = String(input.countryCode || "")
    .trim()
    .toUpperCase();

  const currencyCode = String(input.currencyCode || "")
    .trim()
    .toUpperCase();

  return PAYOUT_PROVIDER_CAPABILITIES.filter(
    (capability) =>
      capability.enabled &&
      capability.countryCode.toUpperCase() === countryCode &&
      capability.currencyCode.toUpperCase() === currencyCode &&
      capability.payoutRail === input.payoutRail,
  ).sort((a, b) => a.priority - b.priority);
}
