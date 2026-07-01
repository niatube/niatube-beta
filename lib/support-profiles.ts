/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Support Profile Registry
 * ==========================================================
 */

export type SupportLevel = {
  tier: string;
  amount: number;
};

export type SupportProfile = {
  profileCode: string;
  profileName: string;
  currencyCode: string;
  countries: string[];
  supportLevels: SupportLevel[];
};

export const SUPPORT_PROFILES: SupportProfile[] = [
  {
    profileCode: "WA_XOF",
    profileName: "West Africa CFA",
    currencyCode: "XOF",
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
    supportLevels: [
      { tier: "Support", amount: 2500 },
      { tier: "Champion", amount: 10000 },
      { tier: "Legend", amount: 50000 },
    ],
  },
  {
    profileCode: "CA_XAF",
    profileName: "Central Africa CFA",
    currencyCode: "XAF",
    countries: [
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Republic of the Congo",
      "Equatorial Guinea",
      "Gabon",
    ],
    supportLevels: [
      { tier: "Support", amount: 2500 },
      { tier: "Champion", amount: 10000 },
      { tier: "Legend", amount: 50000 },
    ],
  },
  {
    profileCode: "RW_RWF",
    profileName: "Rwanda",
    currencyCode: "RWF",
    countries: ["Rwanda"],
    supportLevels: [
      { tier: "Support", amount: 2000 },
      { tier: "Champion", amount: 10000 },
      { tier: "Legend", amount: 50000 },
    ],
  },
  {
    profileCode: "KE_KES",
    profileName: "Kenya",
    currencyCode: "KES",
    countries: ["Kenya"],
    supportLevels: [
      { tier: "Support", amount: 500 },
      { tier: "Champion", amount: 2000 },
      { tier: "Legend", amount: 10000 },
    ],
  },
  {
    profileCode: "GH_GHS",
    profileName: "Ghana",
    currencyCode: "GHS",
    countries: ["Ghana"],
    supportLevels: [
      { tier: "Support", amount: 50 },
      { tier: "Champion", amount: 200 },
      { tier: "Legend", amount: 1000 },
    ],
  },
  {
    profileCode: "NG_NGN",
    profileName: "Nigeria",
    currencyCode: "NGN",
    countries: ["Nigeria"],
    supportLevels: [
      { tier: "Support", amount: 2000 },
      { tier: "Champion", amount: 10000 },
      { tier: "Legend", amount: 50000 },
    ],
  },
  {
    profileCode: "TZ_TZS",
    profileName: "Tanzania",
    currencyCode: "TZS",
    countries: ["Tanzania"],
    supportLevels: [
      { tier: "Support", amount: 5000 },
      { tier: "Champion", amount: 20000 },
      { tier: "Legend", amount: 100000 },
    ],
  },
  {
    profileCode: "UG_UGX",
    profileName: "Uganda",
    currencyCode: "UGX",
    countries: ["Uganda"],
    supportLevels: [
      { tier: "Support", amount: 5000 },
      { tier: "Champion", amount: 20000 },
      { tier: "Legend", amount: 100000 },
    ],
  },
  {
    profileCode: "ZA_ZAR",
    profileName: "South Africa",
    currencyCode: "ZAR",
    countries: ["South Africa"],
    supportLevels: [
      { tier: "Support", amount: 100 },
      { tier: "Champion", amount: 500 },
      { tier: "Legend", amount: 2000 },
    ],
  },
  {
    profileCode: "EU_EUR",
    profileName: "Eurozone",
    currencyCode: "EUR",
    countries: ["France", "Belgium", "Germany", "Spain", "Italy", "Portugal"],
    supportLevels: [
      { tier: "Support", amount: 5 },
      { tier: "Champion", amount: 20 },
      { tier: "Legend", amount: 100 },
    ],
  },
  {
    profileCode: "UK_GBP",
    profileName: "United Kingdom",
    currencyCode: "GBP",
    countries: ["United Kingdom"],
    supportLevels: [
      { tier: "Support", amount: 5 },
      { tier: "Champion", amount: 20 },
      { tier: "Legend", amount: 100 },
    ],
  },
  {
    profileCode: "US_USD",
    profileName: "United States",
    currencyCode: "USD",
    countries: ["United States"],
    supportLevels: [
      { tier: "Support", amount: 5 },
      { tier: "Champion", amount: 20 },
      { tier: "Legend", amount: 100 },
    ],
  },
];

export function getSupportProfileByCountry(country: string) {
  return SUPPORT_PROFILES.find((profile) =>
    profile.countries.some(
      (profileCountry) =>
        profileCountry.toLowerCase() === country.trim().toLowerCase()
    )
  );
}

export function getDefaultSupportProfile() {
  return SUPPORT_PROFILES.find((profile) => profile.profileCode === "US_USD");
}