/**
 * ==========================================================
 * NiaTube Global Registry
 * ----------------------------------------------------------
 * Single source of truth for:
 * - Countries
 * - Currencies
 * - Payment Rails
 * - Payout Rails
 * - Settlement Rules
 * - Reporting Currency
 * - FX Configuration
 * ==========================================================
 */

import {
  CURRENCY_REGISTRY,
  type CurrencyDefinition,
} from "@/lib/currency-registry";

export const REGISTRY_VERSION = "1.0.0";

export const REPORTING_CURRENCY = "USD";

export enum Region {
  AFRICA = "Africa",
  EUROPE = "Europe",
  NORTH_AMERICA = "North America",
  SOUTH_AMERICA = "South America",
  ASIA = "Asia",
  MIDDLE_EAST = "Middle East",
  OCEANIA = "Oceania",
}

export enum AfricanRegion {
  NORTH = "North Africa",
  WEST = "West Africa",
  EAST = "East Africa",
  CENTRAL = "Central Africa",
  SOUTH = "Southern Africa",
  INDIAN_OCEAN = "Indian Ocean",
}

export enum PaymentRailType {
  CARD = "CARD",
  MOBILE_MONEY = "MOBILE_MONEY",
  BANK_TRANSFER = "BANK_TRANSFER",
  PAPSS = "PAPSS",
  WALLET = "WALLET",
}

export enum RegistryStatus {
  LIVE = "LIVE",
  BETA = "BETA",
  PLANNED = "PLANNED",
}


export interface PaymentRail {
  id: string;
  name: string;
  type: PaymentRailType;

  supportedCountries: string[];

  supportedCurrencies: string[];

  status: RegistryStatus;

  apiReady: boolean;
}

export interface CountryDefinition {
  isoCode: string;

  country: string;

  region: Region;

  africanRegion?: AfricanRegion;

  currency: CurrencyDefinition;

  languages: string[];

  /**
 * Payment rails commercially available
 * in this country.
 */
marketAvailableRails: PaymentRailId[];

/**
 * Payment rails currently enabled
 * inside NiaTube.
 */
enabledPaymentRails: PaymentRailId[];

/**
 * Payout rails currently enabled
 * for creators.
 */
enabledPayoutRails: PaymentRailId[];

  papssSupported: boolean;

  cardSupported: boolean;

  bankTransferSupported: boolean;

  mobileMoneySupported: boolean;

digitalWalletSupported: boolean;

  reportingCurrency: string;

  settlementCurrency: string;

  defaultSettlementRail: string | null;

defaultPayoutRail: string | null;

  fxSupported: boolean;

  kycRequired: boolean;

creatorMonetizationEnabled: boolean;

viewerPaymentsEnabled: boolean;

  status: RegistryStatus;
}

export type CreateCountryInput = {
  isoCode: string;
  country: string;

  region: Region;
  africanRegion?: AfricanRegion;

  currencyCode: string;

  languages: string[];

 marketAvailableRails?: PaymentRailId[];

enabledPaymentRails?: PaymentRailId[];

enabledPayoutRails?: PaymentRailId[];

  papssSupported?: boolean;

  cardSupported?: boolean;
  bankTransferSupported?: boolean;
  mobileMoneySupported?: boolean;
  digitalWalletSupported?: boolean;

  reportingCurrency?: string;
  settlementCurrency?: string;

  defaultSettlementRail?: string | null;
  defaultPayoutRail?: string | null;

  fxSupported?: boolean;
  kycRequired?: boolean;

  creatorMonetizationEnabled?: boolean;
  viewerPaymentsEnabled?: boolean;

  status?: RegistryStatus;
};

export const PaymentRailId = {
  VISA: "VISA",
  MASTERCARD: "MASTERCARD",
  PAYPAL: "PAYPAL",

  MTN_MOMO: "MTN_MOMO",
  ORANGE_MONEY: "ORANGE_MONEY",
  WAVE: "WAVE",
  MPESA: "MPESA",
  AIRTEL_MONEY: "AIRTEL_MONEY",

  PAPSS: "PAPSS",

  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentRailId =
  (typeof PaymentRailId)[keyof typeof PaymentRailId];


export const PAYMENT_RAILS: Record<
  string,
  PaymentRail
> = {
  VISA: {
    id: "VISA",
    name: "Visa",
    type: PaymentRailType.CARD,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  MASTERCARD: {
    id: "MASTERCARD",
    name: "Mastercard",
    type: PaymentRailType.CARD,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  PAYPAL: {
    id: "PAYPAL",
    name: "PayPal",
    type: PaymentRailType.WALLET,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  MTN_MOMO: {
    id: "MTN_MOMO",
    name: "MTN Mobile Money",
    type: PaymentRailType.MOBILE_MONEY,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  ORANGE_MONEY: {
    id: "ORANGE_MONEY",
    name: "Orange Money",
    type: PaymentRailType.MOBILE_MONEY,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  WAVE: {
    id: "WAVE",
    name: "Wave",
    type: PaymentRailType.MOBILE_MONEY,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  MPESA: {
    id: "MPESA",
    name: "M-Pesa",
    type: PaymentRailType.MOBILE_MONEY,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  AIRTEL_MONEY: {
    id: "AIRTEL_MONEY",
    name: "Airtel Money",
    type: PaymentRailType.MOBILE_MONEY,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  PAPSS: {
    id: "PAPSS",
    name: "Pan-African Payment and Settlement System",
    type: PaymentRailType.PAPSS,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },

  BANK_TRANSFER: {
    id: "BANK_TRANSFER",
    name: "Bank Transfer",
    type: PaymentRailType.BANK_TRANSFER,
    supportedCountries: [],
    supportedCurrencies: [],
    status: RegistryStatus.PLANNED,
    apiReady: false,
  },
};

function requireRegistryCurrency(
  currencyCode: string,
): CurrencyDefinition {
  const normalizedCode = String(
    currencyCode || "",
  )
    .trim()
    .toUpperCase();

  const currency =
    CURRENCY_REGISTRY[normalizedCode];

  if (!currency) {
    throw new Error(
      `Currency ${normalizedCode} is not registered in the NiaTube Monetary Registry.`,
    );
  }

  return currency;
}

function createCountry({
  isoCode,
  country,
  region,
  africanRegion,
  currencyCode,
  languages,

  marketAvailableRails = [],
  enabledPaymentRails = [],
  enabledPayoutRails = [],

  papssSupported = false,

  cardSupported = false,
  bankTransferSupported = false,
  mobileMoneySupported = false,
  digitalWalletSupported = false,

  reportingCurrency =
    REPORTING_CURRENCY,

  settlementCurrency,

  defaultSettlementRail = null,
  defaultPayoutRail = null,

  fxSupported = true,
  kycRequired = true,

  creatorMonetizationEnabled = true,
  viewerPaymentsEnabled = true,

  status = RegistryStatus.BETA,
}: CreateCountryInput): CountryDefinition {
  const normalizedIsoCode = String(
    isoCode || "",
  )
    .trim()
    .toUpperCase();

  const normalizedCurrencyCode = String(
    currencyCode || "",
  )
    .trim()
    .toUpperCase();

  if (!normalizedIsoCode) {
    throw new Error(
      "Country ISO code is required.",
    );
  }

  if (!String(country || "").trim()) {
    throw new Error(
      `Country name is required for ${normalizedIsoCode}.`,
    );
  }

  const currency =
    requireRegistryCurrency(
      normalizedCurrencyCode,
    );

  return {
    isoCode:
      normalizedIsoCode,

    country:
      String(country).trim(),

    region,
    africanRegion,

    currency,

    languages:
      [...new Set(languages)],

    marketAvailableRails:
      [...new Set(
        marketAvailableRails,
      )],

    enabledPaymentRails:
      [...new Set(
        enabledPaymentRails,
      )],

    enabledPayoutRails:
      [...new Set(
        enabledPayoutRails,
      )],

    papssSupported,

    cardSupported,
    bankTransferSupported,
    mobileMoneySupported,
    digitalWalletSupported,

    reportingCurrency:
      reportingCurrency
        .trim()
        .toUpperCase(),

    settlementCurrency:
      String(
        settlementCurrency ||
          normalizedCurrencyCode,
      )
        .trim()
        .toUpperCase(),

    defaultSettlementRail,
    defaultPayoutRail,

    fxSupported,
    kycRequired,

    creatorMonetizationEnabled,
    viewerPaymentsEnabled,

    status,
  };
}

export const COUNTRY_REGISTRY: Record<
  string,
  CountryDefinition
> = {

   DZ: createCountry({
    isoCode: "DZ",
    country: "Algeria",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currencyCode: "DZD",

    languages: [
      "Arabic",
      "Tamazight",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  EG: createCountry({
    isoCode: "EG",
    country: "Egypt",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currencyCode: "EGP",

    languages: [
      "Arabic",
      "English",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  LY: createCountry({
    isoCode: "LY",
    country: "Libya",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currencyCode: "LYD",

    languages: [
      "Arabic",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  SD: createCountry({
    isoCode: "SD",
    country: "Sudan",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currencyCode: "SDG",

    languages: [
      "Arabic",
      "English",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  TN: createCountry({
    isoCode: "TN",
    country: "Tunisia",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currencyCode: "TND",

    languages: [
      "Arabic",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

    
  MA: {
    isoCode: "MA",
    country: "Morocco",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.NORTH,

    currency:
      requireRegistryCurrency("MAD"),

    languages: [
      "Arabic",
      "Amazigh",
      "French",
    ],

    marketAvailableRails: [
  PaymentRailId.VISA,
  PaymentRailId.MASTERCARD,
  PaymentRailId.ORANGE_MONEY,
  PaymentRailId.BANK_TRANSFER,
],

    enabledPaymentRails: [],
    enabledPayoutRails: [],

    papssSupported: false,

    cardSupported: true,
    bankTransferSupported: true,
    mobileMoneySupported: true,
    digitalWalletSupported: false,

    reportingCurrency:
      REPORTING_CURRENCY,

    settlementCurrency: "MAD",

    defaultSettlementRail: null,
    defaultPayoutRail: null,

    fxSupported: true,
    kycRequired: true,

    creatorMonetizationEnabled: true,
    viewerPaymentsEnabled: true,

    status: RegistryStatus.BETA,
  },

  BJ: createCountry({
    isoCode: "BJ",
    country: "Benin",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  BF: createCountry({
    isoCode: "BF",
    country: "Burkina Faso",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  CV: createCountry({
    isoCode: "CV",
    country: "Cabo Verde",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "CVE",

    languages: [
      "Portuguese",
      "Cape Verdean Creole",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  CI: createCountry({
    isoCode: "CI",
    country: "Côte d'Ivoire",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.ORANGE_MONEY,
      PaymentRailId.WAVE,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),

  GM: createCountry({
    isoCode: "GM",
    country: "Gambia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "GMD",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  GN: createCountry({
    isoCode: "GN",
    country: "Guinea",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "GNF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.ORANGE_MONEY,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),

  GW: createCountry({
    isoCode: "GW",
    country: "Guinea-Bissau",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["Portuguese"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  LR: createCountry({
    isoCode: "LR",
    country: "Liberia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "LRD",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),


    ML: createCountry({
    isoCode: "ML",
    country: "Mali",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.ORANGE_MONEY,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,
  }),

  MR: createCountry({
    isoCode: "MR",
    country: "Mauritania",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "MRU",

    languages: [
      "Arabic",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,
  }),

  NE: createCountry({
    isoCode: "NE",
    country: "Niger",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,
  }),

  SN: createCountry({
    isoCode: "SN",
    country: "Senegal",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.WAVE,
      PaymentRailId.ORANGE_MONEY,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,
  }),

  SL: createCountry({
    isoCode: "SL",
    country: "Sierra Leone",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "SLE",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,
  }),

  TG: createCountry({
    isoCode: "TG",
    country: "Togo",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.WEST,

    currencyCode: "XOF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.ORANGE_MONEY,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,
  }),


  GH: {
    isoCode: "GH",
    country: "Ghana",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.WEST,

    currency:
      requireRegistryCurrency("GHS"),

    languages: [
      "English",
    ],

    marketAvailableRails: [
  PaymentRailId.VISA,
  PaymentRailId.MASTERCARD,
  PaymentRailId.MTN_MOMO,
  PaymentRailId.BANK_TRANSFER,
],

    enabledPaymentRails: [],
    enabledPayoutRails: [],

    papssSupported: false,

    cardSupported: true,
    bankTransferSupported: true,
    mobileMoneySupported: true,
    digitalWalletSupported: false,

    reportingCurrency:
      REPORTING_CURRENCY,

    settlementCurrency: "GHS",

    defaultSettlementRail: null,
    defaultPayoutRail: null,

    fxSupported: true,
    kycRequired: true,

    creatorMonetizationEnabled: true,
    viewerPaymentsEnabled: true,

    status: RegistryStatus.BETA,
  },


  AO: createCountry({
    isoCode: "AO",
    country: "Angola",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "AOA",

    languages: ["Portuguese"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  CM: createCountry({
    isoCode: "CM",
    country: "Cameroon",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: [
      "French",
      "English",
    ],

    marketAvailableRails: [
      PaymentRailId.ORANGE_MONEY,
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),

  CF: createCountry({
    isoCode: "CF",
    country: "Central African Republic",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  TD: createCountry({
    isoCode: "TD",
    country: "Chad",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: [
      "French",
      "Arabic",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  CG: createCountry({
    isoCode: "CG",
    country: "Republic of the Congo",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  CD: createCountry({
    isoCode: "CD",
    country: "Democratic Republic of the Congo",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "CDF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  GQ: createCountry({
    isoCode: "GQ",
    country: "Equatorial Guinea",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: [
      "Spanish",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  GA: createCountry({
    isoCode: "GA",
    country: "Gabon",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "XAF",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  ST: createCountry({
    isoCode: "ST",
    country: "Sao Tome and Principe",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.CENTRAL,

    currencyCode: "STN",

    languages: ["Portuguese"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

    BI: createCountry({
    isoCode: "BI",
    country: "Burundi",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "BIF",

    languages: ["Kirundi", "French", "English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  DJ: createCountry({
    isoCode: "DJ",
    country: "Djibouti",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "DJF",

    languages: ["French", "Arabic"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  ER: createCountry({
    isoCode: "ER",
    country: "Eritrea",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "ERN",

    languages: ["Tigrinya", "Arabic", "English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  ET: createCountry({
    isoCode: "ET",
    country: "Ethiopia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "ETB",

    languages: ["Amharic"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  SO: createCountry({
    isoCode: "SO",
    country: "Somalia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "SOS",

    languages: ["Somali", "Arabic"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  SS: createCountry({
    isoCode: "SS",
    country: "South Sudan",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "SSP",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.PLANNED,
  }),

  TZ: createCountry({
    isoCode: "TZ",
    country: "Tanzania",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "TZS",

    languages: ["Swahili", "English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
      PaymentRailId.AIRTEL_MONEY,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),

  UG: createCountry({
    isoCode: "UG",
    country: "Uganda",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "UGX",

    languages: ["English", "Swahili"],

    marketAvailableRails: [
      PaymentRailId.MTN_MOMO,
      PaymentRailId.AIRTEL_MONEY,
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),


    KM: createCountry({
    isoCode: "KM",
    country: "Comoros",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "KMF",

    languages: [
      "Comorian",
      "French",
      "Arabic",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  

  MU: createCountry({
    isoCode: "MU",
    country: "Mauritius",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "MUR",

    languages: [
      "English",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  SC: createCountry({
    isoCode: "SC",
    country: "Seychelles",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.EAST,

    currencyCode: "SCR",

    languages: [
      "English",
      "French",
      "Seychellois Creole",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

    RW: createCountry({
    isoCode: "RW",
    country: "Rwanda",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.EAST,

    currencyCode: "RWF",

    languages: [
      "Kinyarwanda",
      "English",
      "French",
      "Swahili",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.MTN_MOMO,
      PaymentRailId.AIRTEL_MONEY,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    mobileMoneySupported: true,

    status: RegistryStatus.BETA,
  }),

  KE: createCountry({
    isoCode: "KE",
    country: "Kenya",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.EAST,

    currencyCode: "KES",

    languages: [
      "English",
      "Swahili",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.MPESA,
      PaymentRailId.AIRTEL_MONEY,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    mobileMoneySupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),
  NG: {
    isoCode: "NG",
    country: "Nigeria",

    region: Region.AFRICA,
    africanRegion:
      AfricanRegion.WEST,

    currency:
      requireRegistryCurrency("NGN"),

    languages: [
      "English",
    ],

    marketAvailableRails: [
  PaymentRailId.VISA,
  PaymentRailId.MASTERCARD,
  PaymentRailId.MTN_MOMO,
  PaymentRailId.BANK_TRANSFER,
],

    enabledPaymentRails: [],
    enabledPayoutRails: [],

    papssSupported: false,

    cardSupported: true,
    bankTransferSupported: true,
    mobileMoneySupported: true,
    digitalWalletSupported: false,

    reportingCurrency:
      REPORTING_CURRENCY,

    settlementCurrency: "NGN",

    defaultSettlementRail: null,
    defaultPayoutRail: null,

    fxSupported: true,
    kycRequired: true,

    creatorMonetizationEnabled: true,
    viewerPaymentsEnabled: true,

    status: RegistryStatus.BETA,
  },
  BW: createCountry({
    isoCode: "BW",
    country: "Botswana",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "BWP",

    languages: ["English", "Setswana"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  LS: createCountry({
    isoCode: "LS",
    country: "Lesotho",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "LSL",

    languages: ["Sesotho", "English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  MG: createCountry({
    isoCode: "MG",
    country: "Madagascar",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "MGA",

    languages: ["Malagasy", "French"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  MW: createCountry({
    isoCode: "MW",
    country: "Malawi",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "MWK",

    languages: ["English", "Chichewa"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  MZ: createCountry({
    isoCode: "MZ",
    country: "Mozambique",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "MZN",

    languages: ["Portuguese"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  NA: createCountry({
    isoCode: "NA",
    country: "Namibia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "NAD",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  ZA: createCountry({
    isoCode: "ZA",
    country: "South Africa",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "ZAR",

    languages: [
      "English",
      "Zulu",
      "Xhosa",
      "Afrikaans",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  SZ: createCountry({
    isoCode: "SZ",
    country: "Eswatini",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "SZL",

    languages: ["English", "Swati"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  ZM: createCountry({
    isoCode: "ZM",
    country: "Zambia",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "ZMW",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  ZW: createCountry({
    isoCode: "ZW",
    country: "Zimbabwe",

    region: Region.AFRICA,
    africanRegion: AfricanRegion.SOUTH,

    currencyCode: "ZWG",

    languages: [
      "English",
      "Shona",
      "Ndebele",
    ],

    marketAvailableRails: [
      PaymentRailId.BANK_TRANSFER,
    ],

    bankTransferSupported: true,

    status: RegistryStatus.BETA,
  }),

  /*
   * ========================================================
   * INTERNATIONAL AND DIASPORA MARKETS
   * ========================================================
   */

  US: createCountry({
    isoCode: "US",
    country: "United States",

    region: Region.NORTH_AMERICA,
    currencyCode: "USD",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  CA: createCountry({
    isoCode: "CA",
    country: "Canada",

    region: Region.NORTH_AMERICA,
    currencyCode: "CAD",

    languages: [
      "English",
      "French",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  GB: createCountry({
    isoCode: "GB",
    country: "United Kingdom",

    region: Region.EUROPE,
    currencyCode: "GBP",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  AU: createCountry({
    isoCode: "AU",
    country: "Australia",

    region: Region.OCEANIA,
    currencyCode: "AUD",

    languages: ["English"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  BE: createCountry({
    isoCode: "BE",
    country: "Belgium",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: [
      "Dutch",
      "French",
      "German",
    ],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  FR: createCountry({
    isoCode: "FR",
    country: "France",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: ["French"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  DE: createCountry({
    isoCode: "DE",
    country: "Germany",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: ["German"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  IT: createCountry({
    isoCode: "IT",
    country: "Italy",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: ["Italian"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  PT: createCountry({
    isoCode: "PT",
    country: "Portugal",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: ["Portuguese"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),

  ES: createCountry({
    isoCode: "ES",
    country: "Spain",

    region: Region.EUROPE,
    currencyCode: "EUR",

    languages: ["Spanish"],

    marketAvailableRails: [
      PaymentRailId.VISA,
      PaymentRailId.MASTERCARD,
      PaymentRailId.PAYPAL,
      PaymentRailId.BANK_TRANSFER,
    ],

    cardSupported: true,
    bankTransferSupported: true,
    digitalWalletSupported: true,

    status: RegistryStatus.BETA,
  }),
  
};

export function getCountry(
  countryCode: string,
): CountryDefinition | null {
  const normalizedCode = String(
    countryCode || "",
  )
    .trim()
    .toUpperCase();

  return (
    COUNTRY_REGISTRY[
      normalizedCode
    ] ?? null
  );
}
export function getCountryByName(
  countryName: string,
): CountryDefinition | null {
  const normalizedName = String(
    countryName || "",
  )
    .trim()
    .toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return (
    Object.values(
      COUNTRY_REGISTRY,
    ).find(
      (country) =>
        country.country
          .trim()
          .toLowerCase() ===
        normalizedName,
    ) ?? null
  );
}

export function getPaymentRail(
  railId: string,
): PaymentRail | null {
  const normalizedRailId = String(
    railId || "",
  )
    .trim()
    .toUpperCase();

  return (
    PAYMENT_RAILS[
      normalizedRailId
    ] ?? null
  );
}



export function getPaymentRailsForCountry(
  countryCode: string,
): PaymentRail[] {
  const country =
    getCountry(countryCode);

  if (!country) {
    return [];
  }

  return country.marketAvailableRails
    .map((railId) =>
      getPaymentRail(railId),
    )
    .filter(
      (
        rail,
      ): rail is PaymentRail =>
        rail !== null,
    );
}

export function getEnabledPaymentRailsForCountry(
  countryCode: string,
): PaymentRail[] {
  const country =
    getCountry(countryCode);

  if (!country) {
    return [];
  }

  return country.enabledPaymentRails
    .map((railId) =>
      getPaymentRail(railId),
    )
    .filter(
      (
        rail,
      ): rail is PaymentRail =>
        rail !== null,
    );
}

export function getEnabledPayoutRailsForCountry(
  countryCode: string,
): PaymentRail[] {
  const country =
    getCountry(countryCode);

  if (!country) {
    return [];
  }

  return country.enabledPayoutRails
    .map((railId) =>
      getPaymentRail(railId),
    )
    .filter(
      (
        rail,
      ): rail is PaymentRail =>
        rail !== null,
    );
}

export {
  CURRENCY_REGISTRY,
};

export function getCurrency(
  currencyCode: string,
): CurrencyDefinition | null {
  const normalizedCode = String(
    currencyCode || "",
  )
    .trim()
    .toUpperCase();

  return (
    CURRENCY_REGISTRY[
      normalizedCode
    ] ?? null
  );
}