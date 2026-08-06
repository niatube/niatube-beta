/**
 * NiaTube Monetary Registry
 *
 * Version: 1.0
 *
 * Authoritative application registry for currencies used by:
 * - Creator onboarding
 * - Viewer payments
 * - FX conversion
 * - Platform treasury
 * - Creator payouts
 * - Accounting
 * - Financial reporting
 *
 * Important:
 * - Registry presence does not guarantee an active payment or payout rail.
 * - Provider support must be verified separately.
 * - Symbols use ASCII-safe forms where practical to avoid encoding corruption.
 */

export type MonetaryRegion =
  | "North Africa"
  | "West Africa"
  | "Central Africa"
  | "East Africa"
  | "Southern Africa"
  | "Indian Ocean"
  | "North America"
  | "Europe"
  | "Oceania"
  | "Middle East"
  | "Other";

export type CurrencyTier =
  | "CORE_AFRICA"
  | "CORE_INTERNATIONAL"
  | "EXPANSION";

export type CurrencyDefinition = {
  code: string;
  isoNumeric?: string;

  name: string;
  symbol: string;
  decimals: number;

  region: MonetaryRegion;
  tier: CurrencyTier;

  countries: string[];

  monetaryUnion?: string | null;
  centralBank?: string | null;

  paymentSupported: boolean;
  payoutSupported: boolean;
  settlementSupported: boolean;
  fxSupported: boolean;
  reportingSupported: boolean;

  active: boolean;

  notes?: string | null;
};

export const CURRENCY_REGISTRY: Record<
  string,
  CurrencyDefinition
> = {
  /*
   * NORTH AFRICA
   */

  DZD: {
    code: "DZD",
    isoNumeric: "012",
    name: "Algerian Dinar",
    symbol: "DA",
    decimals: 2,
    region: "North Africa",
    tier: "CORE_AFRICA",
    countries: ["Algeria"],
    centralBank: "Bank of Algeria",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  EGP: {
    code: "EGP",
    isoNumeric: "818",
    name: "Egyptian Pound",
    symbol: "E£",
    decimals: 2,
    region: "North Africa",
    tier: "CORE_AFRICA",
    countries: ["Egypt"],
    centralBank: "Central Bank of Egypt",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  LYD: {
    code: "LYD",
    isoNumeric: "434",
    name: "Libyan Dinar",
    symbol: "LD",
    decimals: 3,
    region: "North Africa",
    tier: "CORE_AFRICA",
    countries: ["Libya"],
    centralBank: "Central Bank of Libya",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  MAD: {
    code: "MAD",
    isoNumeric: "504",
    name: "Moroccan Dirham",
    symbol: "DH",
    decimals: 2,
    region: "North Africa",
    tier: "CORE_AFRICA",
    countries: ["Morocco"],
    centralBank: "Bank Al-Maghrib",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  TND: {
    code: "TND",
    isoNumeric: "788",
    name: "Tunisian Dinar",
    symbol: "DT",
    decimals: 3,
    region: "North Africa",
    tier: "CORE_AFRICA",
    countries: ["Tunisia"],
    centralBank: "Central Bank of Tunisia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  /*
   * WEST AFRICA
   */

  CVE: {
    code: "CVE",
    isoNumeric: "132",
    name: "Cape Verdean Escudo",
    symbol: "Esc",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Cabo Verde"],
    centralBank: "Bank of Cabo Verde",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  GMD: {
    code: "GMD",
    isoNumeric: "270",
    name: "Gambian Dalasi",
    symbol: "D",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["The Gambia"],
    centralBank: "Central Bank of The Gambia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  GHS: {
    code: "GHS",
    isoNumeric: "936",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Ghana"],
    centralBank: "Bank of Ghana",
    paymentSupported: true,
    payoutSupported: true,
    settlementSupported: true,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  GNF: {
    code: "GNF",
    isoNumeric: "324",
    name: "Guinean Franc",
    symbol: "FG",
    decimals: 0,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Guinea"],
    centralBank: "Central Bank of the Republic of Guinea",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  LRD: {
    code: "LRD",
    isoNumeric: "430",
    name: "Liberian Dollar",
    symbol: "L$",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Liberia"],
    centralBank: "Central Bank of Liberia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
    notes: "USD also circulates widely in Liberia.",
  },

  MRU: {
    code: "MRU",
    isoNumeric: "929",
    name: "Mauritanian Ouguiya",
    symbol: "UM",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Mauritania"],
    centralBank: "Central Bank of Mauritania",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  NGN: {
    code: "NGN",
    isoNumeric: "566",
    name: "Nigerian Naira",
    symbol: "NGN",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Nigeria"],
    centralBank: "Central Bank of Nigeria",
    paymentSupported: true,
    payoutSupported: true,
    settlementSupported: true,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  SLE: {
    code: "SLE",
    isoNumeric: "925",
    name: "Sierra Leonean Leone",
    symbol: "Le",
    decimals: 2,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: ["Sierra Leone"],
    centralBank: "Bank of Sierra Leone",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  XOF: {
    code: "XOF",
    isoNumeric: "952",
    name: "West African CFA Franc",
    symbol: "CFA",
    decimals: 0,
    region: "West Africa",
    tier: "CORE_AFRICA",
    countries: [
      "Benin",
      "Burkina Faso",
      "Côte d'Ivoire",
      "Guinea-Bissau",
      "Mali",
      "Niger",
      "Senegal",
      "Togo",
    ],
    monetaryUnion: "WAEMU",
    centralBank: "Central Bank of West African States",
    paymentSupported: true,
    payoutSupported: true,
    settlementSupported: true,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  /*
   * CENTRAL AFRICA
   */

  AOA: {
    code: "AOA",
    isoNumeric: "973",
    name: "Angolan Kwanza",
    symbol: "Kz",
    decimals: 2,
    region: "Central Africa",
    tier: "CORE_AFRICA",
    countries: ["Angola"],
    centralBank: "National Bank of Angola",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  CDF: {
    code: "CDF",
    isoNumeric: "976",
    name: "Congolese Franc",
    symbol: "FC",
    decimals: 2,
    region: "Central Africa",
    tier: "CORE_AFRICA",
    countries: ["Democratic Republic of the Congo"],
    centralBank: "Central Bank of the Congo",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  STN: {
    code: "STN",
    isoNumeric: "930",
    name: "São Tomé and Príncipe Dobra",
    symbol: "Db",
    decimals: 2,
    region: "Central Africa",
    tier: "CORE_AFRICA",
    countries: ["São Tomé and Príncipe"],
    centralBank: "Central Bank of São Tomé and Príncipe",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  XAF: {
    code: "XAF",
    isoNumeric: "950",
    name: "Central African CFA Franc",
    symbol: "FCFA",
    decimals: 0,
    region: "Central Africa",
    tier: "CORE_AFRICA",
    countries: [
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Republic of the Congo",
      "Equatorial Guinea",
      "Gabon",
    ],
    monetaryUnion: "CEMAC",
    centralBank: "Bank of Central African States",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  /*
   * EAST AFRICA
   */

  BIF: {
    code: "BIF",
    isoNumeric: "108",
    name: "Burundian Franc",
    symbol: "FBu",
    decimals: 0,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Burundi"],
    centralBank: "Bank of the Republic of Burundi",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  DJF: {
    code: "DJF",
    isoNumeric: "262",
    name: "Djiboutian Franc",
    symbol: "Fdj",
    decimals: 0,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Djibouti"],
    centralBank: "Central Bank of Djibouti",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  ERN: {
    code: "ERN",
    isoNumeric: "232",
    name: "Eritrean Nakfa",
    symbol: "Nfk",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Eritrea"],
    centralBank: "Bank of Eritrea",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  ETB: {
    code: "ETB",
    isoNumeric: "230",
    name: "Ethiopian Birr",
    symbol: "Br",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Ethiopia"],
    centralBank: "National Bank of Ethiopia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  KES: {
    code: "KES",
    isoNumeric: "404",
    name: "Kenyan Shilling",
    symbol: "KSh",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Kenya"],
    centralBank: "Central Bank of Kenya",
    paymentSupported: true,
    payoutSupported: true,
    settlementSupported: true,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  RWF: {
    code: "RWF",
    isoNumeric: "646",
    name: "Rwandan Franc",
    symbol: "FRw",
    decimals: 0,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Rwanda"],
    centralBank: "National Bank of Rwanda",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  SOS: {
    code: "SOS",
    isoNumeric: "706",
    name: "Somali Shilling",
    symbol: "Sh.So.",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Somalia"],
    centralBank: "Central Bank of Somalia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  SSP: {
    code: "SSP",
    isoNumeric: "728",
    name: "South Sudanese Pound",
    symbol: "SSP",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["South Sudan"],
    centralBank: "Bank of South Sudan",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  SDG: {
    code: "SDG",
    isoNumeric: "938",
    name: "Sudanese Pound",
    symbol: "SDG",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Sudan"],
    centralBank: "Central Bank of Sudan",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  TZS: {
    code: "TZS",
    isoNumeric: "834",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    decimals: 2,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Tanzania"],
    centralBank: "Bank of Tanzania",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  UGX: {
    code: "UGX",
    isoNumeric: "800",
    name: "Ugandan Shilling",
    symbol: "USh",
    decimals: 0,
    region: "East Africa",
    tier: "CORE_AFRICA",
    countries: ["Uganda"],
    centralBank: "Bank of Uganda",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

   
  /*
   * SOUTHERN AFRICA
   */

  BWP: {
    code: "BWP",
    isoNumeric: "072",
    name: "Botswana Pula",
    symbol: "P",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Botswana"],
    centralBank: "Bank of Botswana",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  LSL: {
    code: "LSL",
    isoNumeric: "426",
    name: "Lesotho Loti",
    symbol: "L",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Lesotho"],
    centralBank: "Central Bank of Lesotho",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
    notes: "The South African rand is also legal tender.",
  },

  MWK: {
    code: "MWK",
    isoNumeric: "454",
    name: "Malawian Kwacha",
    symbol: "MK",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Malawi"],
    centralBank: "Reserve Bank of Malawi",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  MZN: {
    code: "MZN",
    isoNumeric: "943",
    name: "Mozambican Metical",
    symbol: "MT",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Mozambique"],
    centralBank: "Bank of Mozambique",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  NAD: {
    code: "NAD",
    isoNumeric: "516",
    name: "Namibian Dollar",
    symbol: "N$",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Namibia"],
    centralBank: "Bank of Namibia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
    notes: "The South African rand is also legal tender.",
  },

  SZL: {
    code: "SZL",
    isoNumeric: "748",
    name: "Swazi Lilangeni",
    symbol: "L",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Eswatini"],
    centralBank: "Central Bank of Eswatini",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
    notes: "The South African rand also circulates.",
  },

  ZAR: {
    code: "ZAR",
    isoNumeric: "710",
    name: "South African Rand",
    symbol: "R",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: [
      "South Africa",
      "Lesotho",
      "Namibia",
      "Eswatini",
    ],
    monetaryUnion: "Common Monetary Area",
    centralBank: "South African Reserve Bank",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  ZMW: {
    code: "ZMW",
    isoNumeric: "967",
    name: "Zambian Kwacha",
    symbol: "ZK",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Zambia"],
    centralBank: "Bank of Zambia",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  ZWG: {
    code: "ZWG",
    isoNumeric: "924",
    name: "Zimbabwe Gold",
    symbol: "ZiG",
    decimals: 2,
    region: "Southern Africa",
    tier: "CORE_AFRICA",
    countries: ["Zimbabwe"],
    centralBank: "Reserve Bank of Zimbabwe",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
    notes:
      "Provider and ISO support should be reconfirmed before production activation. Foreign currencies, including USD, also circulate.",
  },

  /*
   * INDIAN OCEAN AND AFRICAN ISLAND STATES
   */

  KMF: {
    code: "KMF",
    isoNumeric: "174",
    name: "Comorian Franc",
    symbol: "CF",
    decimals: 0,
    region: "Indian Ocean",
    tier: "CORE_AFRICA",
    countries: ["Comoros"],
    centralBank: "Central Bank of the Comoros",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  MGA: {
    code: "MGA",
    isoNumeric: "969",
    name: "Malagasy Ariary",
    symbol: "Ar",
    decimals: 2,
    region: "Indian Ocean",
    tier: "CORE_AFRICA",
    countries: ["Madagascar"],
    centralBank: "Central Bank of Madagascar",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  MUR: {
    code: "MUR",
    isoNumeric: "480",
    name: "Mauritian Rupee",
    symbol: "Rs",
    decimals: 2,
    region: "Indian Ocean",
    tier: "CORE_AFRICA",
    countries: ["Mauritius"],
    centralBank: "Bank of Mauritius",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  SCR: {
    code: "SCR",
    isoNumeric: "690",
    name: "Seychellois Rupee",
    symbol: "SR",
    decimals: 2,
    region: "Indian Ocean",
    tier: "CORE_AFRICA",
    countries: ["Seychelles"],
    centralBank: "Central Bank of Seychelles",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  /*
   * CORE INTERNATIONAL AND DIASPORA CURRENCIES
   */

  USD: {
    code: "USD",
    isoNumeric: "840",
    name: "US Dollar",
    symbol: "$",
    decimals: 2,
    region: "North America",
    tier: "CORE_INTERNATIONAL",
    countries: ["United States"],
    centralBank: "Federal Reserve System",
    paymentSupported: true,
    payoutSupported: true,
    settlementSupported: true,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  EUR: {
    code: "EUR",
    isoNumeric: "978",
    name: "Euro",
    symbol: "EUR",
    decimals: 2,
    region: "Europe",
    tier: "CORE_INTERNATIONAL",
    countries: ["Euro Area"],
    monetaryUnion: "Eurozone",
    centralBank: "European Central Bank",
    paymentSupported: true,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  GBP: {
    code: "GBP",
    isoNumeric: "826",
    name: "Pound Sterling",
    symbol: "GBP",
    decimals: 2,
    region: "Europe",
    tier: "CORE_INTERNATIONAL",
    countries: ["United Kingdom"],
    centralBank: "Bank of England",
    paymentSupported: true,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  CAD: {
    code: "CAD",
    isoNumeric: "124",
    name: "Canadian Dollar",
    symbol: "C$",
    decimals: 2,
    region: "North America",
    tier: "CORE_INTERNATIONAL",
    countries: ["Canada"],
    centralBank: "Bank of Canada",
    paymentSupported: true,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  AUD: {
    code: "AUD",
    isoNumeric: "036",
    name: "Australian Dollar",
    symbol: "A$",
    decimals: 2,
    region: "Oceania",
    tier: "CORE_INTERNATIONAL",
    countries: ["Australia"],
    centralBank: "Reserve Bank of Australia",
    paymentSupported: true,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },

  AED: {
    code: "AED",
    isoNumeric: "784",
    name: "UAE Dirham",
    symbol: "AED",
    decimals: 2,
    region: "Middle East",
    tier: "EXPANSION",
    countries: ["United Arab Emirates"],
    centralBank: "Central Bank of the United Arab Emirates",
    paymentSupported: false,
    payoutSupported: false,
    settlementSupported: false,
    fxSupported: true,
    reportingSupported: true,
    active: true,
  },
};

export function normalizeRegistryCurrencyCode(
  value: string,
): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

export function getCurrency(
  code: string,
): CurrencyDefinition | null {
  const normalizedCode =
    normalizeRegistryCurrencyCode(code);

  return CURRENCY_REGISTRY[normalizedCode] ?? null;
}

export function requireCurrency(
  code: string,
): CurrencyDefinition {
  const currency = getCurrency(code);

  if (!currency) {
    throw new Error(
      `Currency ${normalizeRegistryCurrencyCode(
        code,
      )} is not registered in the NiaTube Monetary Registry.`,
    );
  }

  return currency;
}

export function isSupportedCurrency(
  code: string,
): boolean {
  return Boolean(getCurrency(code)?.active);
}

export function isAfricanCurrency(
  code: string,
): boolean {
  return (
    getCurrency(code)?.tier === "CORE_AFRICA"
  );
}

export function supportsPayments(
  code: string,
): boolean {
  return Boolean(
    getCurrency(code)?.paymentSupported,
  );
}

export function supportsPayouts(
  code: string,
): boolean {
  return Boolean(
    getCurrency(code)?.payoutSupported,
  );
}

export function supportsSettlement(
  code: string,
): boolean {
  return Boolean(
    getCurrency(code)?.settlementSupported,
  );
}

export function supportsFX(
  code: string,
): boolean {
  return Boolean(
    getCurrency(code)?.fxSupported,
  );
}

export function supportsReporting(
  code: string,
): boolean {
  return Boolean(
    getCurrency(code)?.reportingSupported,
  );
}

export function getCurrenciesByRegion(
  region: MonetaryRegion,
): CurrencyDefinition[] {
  return Object.values(
    CURRENCY_REGISTRY,
  ).filter(
    (currency) =>
      currency.region === region &&
      currency.active,
  );
}

export function getCurrenciesByTier(
  tier: CurrencyTier,
): CurrencyDefinition[] {
  return Object.values(
    CURRENCY_REGISTRY,
  ).filter(
    (currency) =>
      currency.tier === tier &&
      currency.active,
  );
}

export function getAfricanCurrencies(): CurrencyDefinition[] {
  return getCurrenciesByTier(
    "CORE_AFRICA",
  );
}

export function getPayoutCurrencies(): CurrencyDefinition[] {
  return Object.values(
    CURRENCY_REGISTRY,
  ).filter(
    (currency) =>
      currency.active &&
      currency.payoutSupported,
  );
}

export function getFxCurrencies(): CurrencyDefinition[] {
  return Object.values(
    CURRENCY_REGISTRY,
  ).filter(
    (currency) =>
      currency.active &&
      currency.fxSupported,
  );
}

export function getActiveCurrencyCodes(): string[] {
  return Object.values(
    CURRENCY_REGISTRY,
  )
    .filter(
      (currency) => currency.active,
    )
    .map(
      (currency) => currency.code,
    )
    .sort();
}