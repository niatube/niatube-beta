/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Country Registry
 * ==========================================================
 */

export type CountryRecord = {
  isoCode: string;
  country: string;
  region:
    | "North Africa"
    | "West Africa"
    | "Central Africa"
    | "East Africa"
    | "Southern Africa"
    | "Diaspora";
  currencyCode: string;
  supportProfileCode: string;
};

export const COUNTRY_REGISTRY: CountryRecord[] = [
  // ---------- West Africa ----------
  {
    isoCode: "BJ",
    country: "Benin",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "BF",
    country: "Burkina Faso",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "CI",
    country: "Côte d'Ivoire",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "GW",
    country: "Guinea-Bissau",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "ML",
    country: "Mali",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "NE",
    country: "Niger",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "SN",
    country: "Senegal",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },
  {
    isoCode: "TG",
    country: "Togo",
    region: "West Africa",
    currencyCode: "XOF",
    supportProfileCode: "WA_XOF",
  },

  // ---------- Central Africa ----------
  {
    isoCode: "CM",
    country: "Cameroon",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },
  {
    isoCode: "CF",
    country: "Central African Republic",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },
  {
    isoCode: "TD",
    country: "Chad",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },
  {
    isoCode: "CG",
    country: "Republic of the Congo",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },
  {
    isoCode: "GQ",
    country: "Equatorial Guinea",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },
  {
    isoCode: "GA",
    country: "Gabon",
    region: "Central Africa",
    currencyCode: "XAF",
    supportProfileCode: "CA_XAF",
  },

  // ---------- East Africa ----------
  {
    isoCode: "RW",
    country: "Rwanda",
    region: "East Africa",
    currencyCode: "RWF",
    supportProfileCode: "RW_RWF",
  },
  {
    isoCode: "KE",
    country: "Kenya",
    region: "East Africa",
    currencyCode: "KES",
    supportProfileCode: "KE_KES",
  },
  {
    isoCode: "UG",
    country: "Uganda",
    region: "East Africa",
    currencyCode: "UGX",
    supportProfileCode: "UG_UGX",
  },
  {
    isoCode: "TZ",
    country: "Tanzania",
    region: "East Africa",
    currencyCode: "TZS",
    supportProfileCode: "TZ_TZS",
  },

  // ---------- West Africa ----------
  {
    isoCode: "GH",
    country: "Ghana",
    region: "West Africa",
    currencyCode: "GHS",
    supportProfileCode: "GH_GHS",
  },
  {
    isoCode: "NG",
    country: "Nigeria",
    region: "West Africa",
    currencyCode: "NGN",
    supportProfileCode: "NG_NGN",
  },

  // ---------- Southern Africa ----------
  {
    isoCode: "ZA",
    country: "South Africa",
    region: "Southern Africa",
    currencyCode: "ZAR",
    supportProfileCode: "ZA_ZAR",
  },

  // ---------- Diaspora ----------
  {
    isoCode: "US",
    country: "United States",
    region: "Diaspora",
    currencyCode: "USD",
    supportProfileCode: "US_USD",
  },
  {
    isoCode: "GB",
    country: "United Kingdom",
    region: "Diaspora",
    currencyCode: "GBP",
    supportProfileCode: "UK_GBP",
  },
  {
    isoCode: "FR",
    country: "France",
    region: "Diaspora",
    currencyCode: "EUR",
    supportProfileCode: "EU_EUR",
  },
];

export function getCountryByIsoCode(isoCode: string) {
  return COUNTRY_REGISTRY.find(
    (country) => country.isoCode === isoCode.toUpperCase()
  );
}

export function getCountryByName(name: string) {
  return COUNTRY_REGISTRY.find(
    (country) =>
      country.country.toLowerCase() === name.trim().toLowerCase()
  );
}