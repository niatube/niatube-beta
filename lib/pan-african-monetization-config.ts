/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Pan-African Monetization Configuration Engine (PMCE)
 * ==========================================================
 */
import { getCountryByIsoCode } from "@/lib/country-registry";

export type NiaRegion =
  | "North Africa"
  | "West Africa"
  | "Central Africa"
  | "East Africa"
  | "Southern Africa"
  | "Diaspora";

export type SuperSupportPricing = {
  Support: number;
  Champion: number;
  Legend: number;
};

export type PricingProfile = {
  code: string;
  currencyCode: string;
  currencyName: string;
  membershipPrice: number;
  superSupport: SuperSupportPricing;
};

export type MonetizationCountryProfile = {
  isoCode: string;
  country: string;
  region: NiaRegion;
  currencyCode: string;
  currencyName: string;
  monetizationProfileCode: string;
  pricingProfileCode: string;
};

export const PRICING_PROFILES: Record<string, PricingProfile> = {
  US_USD: {
    code: "US_USD",
    currencyCode: "USD",
    currencyName: "US Dollar",
    membershipPrice: 5,
    superSupport: {
      Support: 5,
      Champion: 20,
      Legend: 100,
    },
  },

  UK_GBP: {
    code: "UK_GBP",
    currencyCode: "GBP",
    currencyName: "British Pound",
    membershipPrice: 5,
    superSupport: {
      Support: 5,
      Champion: 20,
      Legend: 100,
    },
  },

  EU_EUR: {
    code: "EU_EUR",
    currencyCode: "EUR",
    currencyName: "Euro",
    membershipPrice: 5,
    superSupport: {
      Support: 5,
      Champion: 20,
      Legend: 100,
    },
  },

  WA_XOF: {
    code: "WA_XOF",
    currencyCode: "XOF",
    currencyName: "West African CFA Franc",
    membershipPrice: 2500,
    superSupport: {
      Support: 2500,
      Champion: 10000,
      Legend: 50000,
    },
  },

  CA_XAF: {
    code: "CA_XAF",
    currencyCode: "XAF",
    currencyName: "Central African CFA Franc",
    membershipPrice: 2500,
    superSupport: {
      Support: 2500,
      Champion: 10000,
      Legend: 50000,
    },
  },

  NG_NGN: {
    code: "NG_NGN",
    currencyCode: "NGN",
    currencyName: "Nigerian Naira",
    membershipPrice: 1500,
    superSupport: {
      Support: 1500,
      Champion: 7500,
      Legend: 30000,
    },
  },

  GH_GHS: {
    code: "GH_GHS",
    currencyCode: "GHS",
    currencyName: "Ghanaian Cedi",
    membershipPrice: 20,
    superSupport: {
      Support: 20,
      Champion: 100,
      Legend: 500,
    },
  },

  KE_KES: {
    code: "KE_KES",
    currencyCode: "KES",
    currencyName: "Kenyan Shilling",
    membershipPrice: 150,
    superSupport: {
      Support: 150,
      Champion: 750,
      Legend: 3000,
    },
  },

  RW_RWF: {
    code: "RW_RWF",
    currencyCode: "RWF",
    currencyName: "Rwandan Franc",
    membershipPrice: 2000,
    superSupport: {
      Support: 2000,
      Champion: 10000,
      Legend: 50000,
    },
  },

    UG_UGX: {
    code: "UG_UGX",
    currencyCode: "UGX",
    currencyName: "Ugandan Shilling",
    membershipPrice: 7500,
    superSupport: {
      Support: 7500,
      Champion: 37500,
      Legend: 150000,
    },
  },

  TZ_TZS: {
    code: "TZ_TZS",
    currencyCode: "TZS",
    currencyName: "Tanzanian Shilling",
    membershipPrice: 12000,
    superSupport: {
      Support: 12000,
      Champion: 60000,
      Legend: 240000,
    },
  },

    AO_AOA: {
    code: "AO_AOA",
    currencyCode: "AOA",
    currencyName: "Angolan Kwanza",
    membershipPrice: 4500,
    superSupport: {
      Support: 4500,
      Champion: 22500,
      Legend: 90000,
    },
  },

  CD_CDF: {
    code: "CD_CDF",
    currencyCode: "CDF",
    currencyName: "Congolese Franc",
    membershipPrice: 14000,
    superSupport: {
      Support: 14000,
      Champion: 70000,
      Legend: 280000,
    },
  },

    // ---------- North Africa ----------
  DZ_DZD: {
    code: "DZ_DZD",
    currencyCode: "DZD",
    currencyName: "Algerian Dinar",
    membershipPrice: 675,
    superSupport: { Support: 675, Champion: 2700, Legend: 13500 },
  },

  EG_EGP: {
    code: "EG_EGP",
    currencyCode: "EGP",
    currencyName: "Egyptian Pound",
    membershipPrice: 250,
    superSupport: { Support: 250, Champion: 1000, Legend: 5000 },
  },

  LY_LYD: {
    code: "LY_LYD",
    currencyCode: "LYD",
    currencyName: "Libyan Dinar",
    membershipPrice: 25,
    superSupport: { Support: 25, Champion: 100, Legend: 500 },
  },

  MA_MAD: {
    code: "MA_MAD",
    currencyCode: "MAD",
    currencyName: "Moroccan Dirham",
    membershipPrice: 50,
    superSupport: { Support: 50, Champion: 200, Legend: 1000 },
  },

  SD_SDG: {
    code: "SD_SDG",
    currencyCode: "SDG",
    currencyName: "Sudanese Pound",
    membershipPrice: 3000,
    superSupport: { Support: 3000, Champion: 12000, Legend: 60000 },
  },

  TN_TND: {
    code: "TN_TND",
    currencyCode: "TND",
    currencyName: "Tunisian Dinar",
    membershipPrice: 16,
    superSupport: { Support: 16, Champion: 65, Legend: 320 },
  },

  // ---------- West Africa ----------
  CV_CVE: {
    code: "CV_CVE",
    currencyCode: "CVE",
    currencyName: "Cape Verdean Escudo",
    membershipPrice: 550,
    superSupport: { Support: 550, Champion: 2200, Legend: 11000 },
  },

  GM_GMD: {
    code: "GM_GMD",
    currencyCode: "GMD",
    currencyName: "Gambian Dalasi",
    membershipPrice: 350,
    superSupport: { Support: 350, Champion: 1400, Legend: 7000 },
  },

  GN_GNF: {
    code: "GN_GNF",
    currencyCode: "GNF",
    currencyName: "Guinean Franc",
    membershipPrice: 43000,
    superSupport: { Support: 43000, Champion: 172000, Legend: 860000 },
  },

  LR_LRD: {
    code: "LR_LRD",
    currencyCode: "LRD",
    currencyName: "Liberian Dollar",
    membershipPrice: 1000,
    superSupport: { Support: 1000, Champion: 4000, Legend: 20000 },
  },

  SL_SLE: {
    code: "SL_SLE",
    currencyCode: "SLE",
    currencyName: "Sierra Leonean Leone",
    membershipPrice: 115,
    superSupport: { Support: 115, Champion: 460, Legend: 2300 },
  },

  // ---------- East Africa ----------
  BI_BIF: {
    code: "BI_BIF",
    currencyCode: "BIF",
    currencyName: "Burundian Franc",
    membershipPrice: 15000,
    superSupport: { Support: 15000, Champion: 60000, Legend: 300000 },
  },

  DJ_DJF: {
    code: "DJ_DJF",
    currencyCode: "DJF",
    currencyName: "Djiboutian Franc",
    membershipPrice: 900,
    superSupport: { Support: 900, Champion: 3600, Legend: 18000 },
  },

  ER_ERN: {
    code: "ER_ERN",
    currencyCode: "ERN",
    currencyName: "Eritrean Nakfa",
    membershipPrice: 75,
    superSupport: { Support: 75, Champion: 300, Legend: 1500 },
  },

  ET_ETB: {
    code: "ET_ETB",
    currencyCode: "ETB",
    currencyName: "Ethiopian Birr",
    membershipPrice: 600,
    superSupport: { Support: 600, Champion: 2400, Legend: 12000 },
  },

  SO_SOS: {
    code: "SO_SOS",
    currencyCode: "SOS",
    currencyName: "Somali Shilling",
    membershipPrice: 2850,
    superSupport: { Support: 2850, Champion: 11400, Legend: 57000 },
  },

  SS_SSP: {
    code: "SS_SSP",
    currencyCode: "SSP",
    currencyName: "South Sudanese Pound",
    membershipPrice: 6500,
    superSupport: { Support: 6500, Champion: 26000, Legend: 130000 },
  },

  KM_KMF: {
    code: "KM_KMF",
    currencyCode: "KMF",
    currencyName: "Comorian Franc",
    membershipPrice: 2250,
    superSupport: { Support: 2250, Champion: 9000, Legend: 45000 },
  },

  MU_MUR: {
    code: "MU_MUR",
    currencyCode: "MUR",
    currencyName: "Mauritian Rupee",
    membershipPrice: 230,
    superSupport: { Support: 230, Champion: 920, Legend: 4600 },
  },

  SC_SCR: {
    code: "SC_SCR",
    currencyCode: "SCR",
    currencyName: "Seychellois Rupee",
    membershipPrice: 70,
    superSupport: { Support: 70, Champion: 280, Legend: 1400 },
  },

  // ---------- Central Africa ----------
  ST_STN: {
    code: "ST_STN",
    currencyCode: "STN",
    currencyName: "São Tomé and Príncipe Dobra",
    membershipPrice: 115,
    superSupport: { Support: 115, Champion: 460, Legend: 2300 },
  },

  // ---------- Southern Africa ----------
  BW_BWP: {
    code: "BW_BWP",
    currencyCode: "BWP",
    currencyName: "Botswana Pula",
    membershipPrice: 70,
    superSupport: { Support: 70, Champion: 280, Legend: 1400 },
  },

  LS_LSL: {
    code: "LS_LSL",
    currencyCode: "LSL",
    currencyName: "Lesotho Loti",
    membershipPrice: 90,
    superSupport: { Support: 90, Champion: 360, Legend: 1800 },
  },

  MG_MGA: {
    code: "MG_MGA",
    currencyCode: "MGA",
    currencyName: "Malagasy Ariary",
    membershipPrice: 22500,
    superSupport: { Support: 22500, Champion: 90000, Legend: 450000 },
  },

  MW_MWK: {
    code: "MW_MWK",
    currencyCode: "MWK",
    currencyName: "Malawian Kwacha",
    membershipPrice: 8700,
    superSupport: { Support: 8700, Champion: 34800, Legend: 174000 },
  },

  MZ_MZN: {
    code: "MZ_MZN",
    currencyCode: "MZN",
    currencyName: "Mozambican Metical",
    membershipPrice: 320,
    superSupport: { Support: 320, Champion: 1280, Legend: 6400 },
  },

  NA_NAD: {
    code: "NA_NAD",
    currencyCode: "NAD",
    currencyName: "Namibian Dollar",
    membershipPrice: 90,
    superSupport: { Support: 90, Champion: 360, Legend: 1800 },
  },

  ZA_ZAR: {
    code: "ZA_ZAR",
    currencyCode: "ZAR",
    currencyName: "South African Rand",
    membershipPrice: 90,
    superSupport: { Support: 90, Champion: 360, Legend: 1800 },
  },

  SZ_SZL: {
    code: "SZ_SZL",
    currencyCode: "SZL",
    currencyName: "Swazi Lilangeni",
    membershipPrice: 90,
    superSupport: { Support: 90, Champion: 360, Legend: 1800 },
  },

  ZM_ZMW: {
    code: "ZM_ZMW",
    currencyCode: "ZMW",
    currencyName: "Zambian Kwacha",
    membershipPrice: 130,
    superSupport: { Support: 130, Champion: 520, Legend: 2600 },
  },

  ZW_ZWG: {
    code: "ZW_ZWG",
    currencyCode: "ZWG",
    currencyName: "Zimbabwe Gold",
    membershipPrice: 70,
    superSupport: { Support: 70, Champion: 280, Legend: 1400 },
  },
};

export const PAN_AFRICAN_MONETIZATION_CONFIG: MonetizationCountryProfile[] = [
     // ---------- North Africa ----------
  {
    isoCode: "DZ",
    country: "Algeria",
    region: "North Africa",
    currencyCode: "DZD",
    currencyName: "Algerian Dinar",
    monetizationProfileCode: "DZ_DZD",
    pricingProfileCode: "DZ_DZD",
  },
  {
    isoCode: "EG",
    country: "Egypt",
    region: "North Africa",
    currencyCode: "EGP",
    currencyName: "Egyptian Pound",
    monetizationProfileCode: "EG_EGP",
    pricingProfileCode: "EG_EGP",
  },
  {
    isoCode: "LY",
    country: "Libya",
    region: "North Africa",
    currencyCode: "LYD",
    currencyName: "Libyan Dinar",
    monetizationProfileCode: "LY_LYD",
    pricingProfileCode: "LY_LYD",
  },
  {
    isoCode: "MA",
    country: "Morocco",
    region: "North Africa",
    currencyCode: "MAD",
    currencyName: "Moroccan Dirham",
    monetizationProfileCode: "MA_MAD",
    pricingProfileCode: "MA_MAD",
  },
  {
    isoCode: "SD",
    country: "Sudan",
    region: "North Africa",
    currencyCode: "SDG",
    currencyName: "Sudanese Pound",
    monetizationProfileCode: "SD_SDG",
    pricingProfileCode: "SD_SDG",
  },
  {
    isoCode: "TN",
    country: "Tunisia",
    region: "North Africa",
    currencyCode: "TND",
    currencyName: "Tunisian Dinar",
    monetizationProfileCode: "TN_TND",
    pricingProfileCode: "TN_TND",
  },
  // ---------- West Africa ----------
{
  isoCode: "BJ",
  country: "Benin",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
 monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "BF",
  country: "Burkina Faso",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
  monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "CI",
  country: "Côte d'Ivoire",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
  monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "GW",
  country: "Guinea-Bissau",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
  monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "ML",
  country: "Mali",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
 monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "NE",
  country: "Niger",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
 monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "SN",
  country: "Senegal",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
  monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "TG",
  country: "Togo",
  region: "West Africa",
  currencyCode: "XOF",
  currencyName: "West African CFA Franc",
 monetizationProfileCode: "WA_XOF",
  pricingProfileCode: "WA_XOF",
},
{
  isoCode: "NG",
  country: "Nigeria",
  region: "West Africa",
  currencyCode: "NGN",
  currencyName: "Nigerian Naira",
  monetizationProfileCode: "NG_NGN",
  pricingProfileCode: "NG_NGN",
},
{
  isoCode: "GH",
  country: "Ghana",
  region: "West Africa",
  currencyCode: "GHS",
  currencyName: "Ghanaian Cedi",
  monetizationProfileCode: "GH_GHS",
  pricingProfileCode: "GH_GHS",
},
  
{
  isoCode: "CV",
  country: "Cabo Verde",
  region: "West Africa",
  currencyCode: "CVE",
  currencyName: "Cape Verdean Escudo",
  monetizationProfileCode: "CV_CVE",
  pricingProfileCode: "CV_CVE",
},
{
  isoCode: "GM",
  country: "Gambia",
  region: "West Africa",
  currencyCode: "GMD",
  currencyName: "Gambian Dalasi",
  monetizationProfileCode: "GM_GMD",
  pricingProfileCode: "GM_GMD",
},
{
  isoCode: "GN",
  country: "Guinea",
  region: "West Africa",
  currencyCode: "GNF",
  currencyName: "Guinean Franc",
  monetizationProfileCode: "GN_GNF",
  pricingProfileCode: "GN_GNF",
},
{
  isoCode: "LR",
  country: "Liberia",
  region: "West Africa",
  currencyCode: "LRD",
  currencyName: "Liberian Dollar",
  monetizationProfileCode: "LR_LRD",
  pricingProfileCode: "LR_LRD",
},
{
  isoCode: "SL",
  country: "Sierra Leone",
  region: "West Africa",
  currencyCode: "SLE",
  currencyName: "Sierra Leonean Leone",
  monetizationProfileCode: "SL_SLE",
  pricingProfileCode: "SL_SLE",
},

// ---------- Central Africa ----------
{
  isoCode: "CM",
  country: "Cameroon",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "CF",
  country: "Central African Republic",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "TD",
  country: "Chad",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "CG",
  country: "Republic of the Congo",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "GQ",
  country: "Equatorial Guinea",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "GA",
  country: "Gabon",
  region: "Central Africa",
  currencyCode: "XAF",
  currencyName: "Central African CFA Franc",
  monetizationProfileCode: "CA_XAF",
  pricingProfileCode: "CA_XAF",
},
{
  isoCode: "AO",
  country: "Angola",
  region: "Central Africa",
  currencyCode: "AOA",
  currencyName: "Angolan Kwanza",
  monetizationProfileCode: "AO_AOA",
  pricingProfileCode: "AO_AOA",
},
{
  isoCode: "CD",
  country: "Democratic Republic of the Congo",
  region: "Central Africa",
  currencyCode: "CDF",
  currencyName: "Congolese Franc",
  monetizationProfileCode: "CD_CDF",
  pricingProfileCode: "CD_CDF",
},
  // ---------- East Africa ----------
{
  isoCode: "BI",
  country: "Burundi",
  region: "East Africa",
  currencyCode: "BIF",
  currencyName: "Burundian Franc",
  monetizationProfileCode: "BI_BIF",
  pricingProfileCode: "BI_BIF",
},
{
  isoCode: "DJ",
  country: "Djibouti",
  region: "East Africa",
  currencyCode: "DJF",
  currencyName: "Djiboutian Franc",
  monetizationProfileCode: "DJ_DJF",
  pricingProfileCode: "DJ_DJF",
},
{
  isoCode: "ER",
  country: "Eritrea",
  region: "East Africa",
  currencyCode: "ERN",
  currencyName: "Eritrean Nakfa",
  monetizationProfileCode: "ER_ERN",
  pricingProfileCode: "ER_ERN",
},
{
  isoCode: "ET",
  country: "Ethiopia",
  region: "East Africa",
  currencyCode: "ETB",
  currencyName: "Ethiopian Birr",
  monetizationProfileCode: "ET_ETB",
  pricingProfileCode: "ET_ETB",
},
{
  isoCode: "KE",
  country: "Kenya",
  region: "East Africa",
  currencyCode: "KES",
  currencyName: "Kenyan Shilling",
  monetizationProfileCode: "KE_KES",
  pricingProfileCode: "KE_KES",
},
{
  isoCode: "RW",
  country: "Rwanda",
  region: "East Africa",
  currencyCode: "RWF",
  currencyName: "Rwandan Franc",
  monetizationProfileCode: "RW_RWF",
  pricingProfileCode: "RW_RWF",
},
{
  isoCode: "SO",
  country: "Somalia",
  region: "East Africa",
  currencyCode: "SOS",
  currencyName: "Somali Shilling",
  monetizationProfileCode: "SO_SOS",
  pricingProfileCode: "SO_SOS",
},
{
  isoCode: "SS",
  country: "South Sudan",
  region: "East Africa",
  currencyCode: "SSP",
  currencyName: "South Sudanese Pound",
  monetizationProfileCode: "SS_SSP",
  pricingProfileCode: "SS_SSP",
},
{
  isoCode: "TZ",
  country: "Tanzania",
  region: "East Africa",
  currencyCode: "TZS",
  currencyName: "Tanzanian Shilling",
  monetizationProfileCode: "TZ_TZS",
  pricingProfileCode: "TZ_TZS",
},
{
  isoCode: "UG",
  country: "Uganda",
  region: "East Africa",
  currencyCode: "UGX",
  currencyName: "Ugandan Shilling",
  monetizationProfileCode: "UG_UGX",
  pricingProfileCode: "UG_UGX",
},

// ---------- Southern Africa ----------
{
  isoCode: "BW",
  country: "Botswana",
  region: "Southern Africa",
  currencyCode: "BWP",
  currencyName: "Botswana Pula",
  monetizationProfileCode: "BW_BWP",
  pricingProfileCode: "BW_BWP",
},
{
  isoCode: "LS",
  country: "Lesotho",
  region: "Southern Africa",
  currencyCode: "LSL",
  currencyName: "Lesotho Loti",
  monetizationProfileCode: "LS_LSL",
  pricingProfileCode: "LS_LSL",
},
{
  isoCode: "MG",
  country: "Madagascar",
  region: "Southern Africa",
  currencyCode: "MGA",
  currencyName: "Malagasy Ariary",
  monetizationProfileCode: "MG_MGA",
  pricingProfileCode: "MG_MGA",
},
{
  isoCode: "MW",
  country: "Malawi",
  region: "Southern Africa",
  currencyCode: "MWK",
  currencyName: "Malawian Kwacha",
  monetizationProfileCode: "MW_MWK",
  pricingProfileCode: "MW_MWK",
},
{
  isoCode: "MZ",
  country: "Mozambique",
  region: "Southern Africa",
  currencyCode: "MZN",
  currencyName: "Mozambican Metical",
  monetizationProfileCode: "MZ_MZN",
  pricingProfileCode: "MZ_MZN",
},
{
  isoCode: "NA",
  country: "Namibia",
  region: "Southern Africa",
  currencyCode: "NAD",
  currencyName: "Namibian Dollar",
  monetizationProfileCode: "NA_NAD",
  pricingProfileCode: "NA_NAD",
},
{
  isoCode: "ZA",
  country: "South Africa",
  region: "Southern Africa",
  currencyCode: "ZAR",
  currencyName: "South African Rand",
  monetizationProfileCode: "ZA_ZAR",
  pricingProfileCode: "ZA_ZAR",
},
{
  isoCode: "SZ",
  country: "Eswatini",
  region: "Southern Africa",
  currencyCode: "SZL",
  currencyName: "Swazi Lilangeni",
  monetizationProfileCode: "SZ_SZL",
  pricingProfileCode: "SZ_SZL",
},
{
  isoCode: "ZM",
  country: "Zambia",
  region: "Southern Africa",
  currencyCode: "ZMW",
  currencyName: "Zambian Kwacha",
  monetizationProfileCode: "ZM_ZMW",
  pricingProfileCode: "ZM_ZMW",
},
{
  isoCode: "ZW",
  country: "Zimbabwe",
  region: "Southern Africa",
  currencyCode: "ZWG",
  currencyName: "Zimbabwe Gold",
  monetizationProfileCode: "ZW_ZWG",
  pricingProfileCode: "ZW_ZWG",
},

  // ---------- Diaspora ----------
  {
    isoCode: "US",
    country: "United States",
    region: "Diaspora",
    currencyCode: "USD",
    currencyName: "US Dollar",
    monetizationProfileCode: "US_USD",
    pricingProfileCode: "US_USD",
  },
  {
    isoCode: "GB",
    country: "United Kingdom",
    region: "Diaspora",
    currencyCode: "GBP",
    currencyName: "British Pound",
    monetizationProfileCode: "UK_GBP",
    pricingProfileCode: "UK_GBP",
  },
  {
    isoCode: "FR",
    country: "France",
    region: "Diaspora",
    currencyCode: "EUR",
    currencyName: "Euro",
    monetizationProfileCode: "EU_EUR",
    pricingProfileCode: "EU_EUR",
  },
];

export function getMonetizationProfileByCountry(countryName: string) {
  return PAN_AFRICAN_MONETIZATION_CONFIG.find(
    (profile) =>
      profile.country.toLowerCase() === String(countryName || "").trim().toLowerCase()
  );
}

export function getMonetizationProfileByIsoCode(isoCode: string) {
  return PAN_AFRICAN_MONETIZATION_CONFIG.find(
    (profile) =>
      profile.isoCode.toUpperCase() === String(isoCode || "").trim().toUpperCase()
  );
}

export function getPricingProfile(pricingProfileCode: string) {
  return PRICING_PROFILES[pricingProfileCode];
}

export function hasPricingProfile(pricingProfileCode: string) {
  return Object.prototype.hasOwnProperty.call(
    PRICING_PROFILES,
    pricingProfileCode
  );
}

export function getPricingProfileForCountry(countryOrIso: string) {
  let countryProfile =
    getMonetizationProfileByCountry(countryOrIso) ||
    getMonetizationProfileByIsoCode(countryOrIso);

  if (!countryProfile) {
    const registryCountry = getCountryByIsoCode(countryOrIso);

    if (registryCountry) {
      countryProfile = getMonetizationProfileByCountry(
        registryCountry.country
      );
    }
  }

  if (!countryProfile) {
    return null;
  }

  return getPricingProfile(countryProfile.pricingProfileCode) || null;
}
export function getMembershipPriceForCountry(countryName: string) {
  return getPricingProfileForCountry(countryName)?.membershipPrice || 5;
}

export function getSuperSupportPricingForCountry(countryName: string) {
  return getPricingProfileForCountry(countryName)?.superSupport || null;
}