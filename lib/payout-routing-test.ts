import {
  resolvePayoutRailsForMethod,
} from "@/lib/payout-rail-resolver";

export function getPayoutRoutingTestCases() {
  return {
    rwandaMobileMoney:
      resolvePayoutRailsForMethod({
        countryCode: "RW",
        payoutMethod: "MOBILE_MONEY",
      }),

    kenyaMobileMoney:
      resolvePayoutRailsForMethod({
        countryCode: "KE",
        payoutMethod: "MOBILE_MONEY",
      }),

    rwandaBank:
      resolvePayoutRailsForMethod({
        countryCode: "RW",
        payoutMethod: "BANK_ACCOUNT",
      }),

    ghanaMobileMoney:
      resolvePayoutRailsForMethod({
        countryCode: "GH",
        payoutMethod: "MOBILE_MONEY",
      }),
  };
}