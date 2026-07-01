/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Support Context Resolver
 * ==========================================================
 */

import {
  getDefaultSupportProfile,
  getSupportProfileByCountry,
} from "./support-profiles";

import { getCountryByIsoCode } from "./country-registry";

export type SupportContext = {
  country: string;
  profileCode: string;
  currencyCode: string;
  confidence: "high" | "medium" | "low";
  manuallySelected: boolean;
};

export function resolveSupportContext(
  country?: string
): SupportContext {
  const profile =
    (country && getSupportProfileByCountry(country)) ??
    getDefaultSupportProfile();

  if (!profile) {
    return {
      country: "United States",
      profileCode: "US_USD",
      currencyCode: "USD",
      confidence: "low",
      manuallySelected: false,
    };
  }

  return {
    country: country || profile.countries[0],
    profileCode: profile.profileCode,
    currencyCode: profile.currencyCode,
    confidence: country ? "high" : "low",
    manuallySelected: Boolean(country),
  };
}
/**
 * Resolve a browser locale (for example "en-KE")
 * into a country using the Country Registry.
 */
export function getCountryFromBrowserLocale(
  locale: string
): string | null {
  const region = locale.split("-")[1]?.toUpperCase();

  if (!region) {
    return null;
  }

  const country = getCountryByIsoCode(region);

  return country?.country ?? null;
}