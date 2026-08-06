export const ACCOUNT_CODES = {
  CASH_AND_PROCESSOR_CLEARING: "1000",
  CREATOR_PAYOUT_CLEARING: "1100",

  CREATOR_EARNINGS_PAYABLE: "2000",
  PAYOUTS_PAYABLE: "2100",
  REFUNDS_AND_CHARGEBACKS_PAYABLE: "2200",

  FOUNDER_AND_SHAREHOLDER_EQUITY: "3000",

  PLATFORM_FEE_REVENUE: "4000",
  ADVERTISING_REVENUE: "4100",
  SUBSCRIPTION_REVENUE: "4200",
  BRANDCONNECT_REVENUE: "4300",

  PAYMENT_PROCESSING_FEES: "5000",
  PAYOUT_PROVIDER_FEES: "5100",
  FOREIGN_EXCHANGE_EXPENSE: "5200",
} as const;

export const ACCOUNTING_EVENT_TYPES = {
  TIP: "TIP",
  SUPER_SUPPORT: "SUPER_SUPPORT",

  MEMBERSHIP: "MEMBERSHIP",
  ADVERTISING: "ADVERTISING",
  BRANDCONNECT: "BRANDCONNECT",

  PAYOUT_APPROVED: "PAYOUT_APPROVED",
  PAYOUT_SETTLED: "PAYOUT_SETTLED",
  PAYOUT_FAILED: "PAYOUT_FAILED",

  REFUND: "REFUND",
  CHARGEBACK: "CHARGEBACK",
  TREASURY_ADJUSTMENT: "TREASURY_ADJUSTMENT",
} as const;

export type AccountingEventType =
  (typeof ACCOUNTING_EVENT_TYPES)[keyof typeof ACCOUNTING_EVENT_TYPES];

export type AccountingJournalLine = {
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
};

export type CreatorMonetizationRuleInput = {
  eventType:
    | typeof ACCOUNTING_EVENT_TYPES.TIP
    | typeof ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT;

  grossAmount: number;
  creatorNetAmount: number;
  platformFee: number;

  creatorName?: string | null;
};

function roundMoney(value: number) {
  return Number(
    Number(value || 0).toFixed(2),
  );
}

export function buildCreatorMonetizationJournalLines({
  eventType,
  grossAmount,
  creatorNetAmount,
  platformFee,
  creatorName = null,
}: CreatorMonetizationRuleInput): AccountingJournalLine[] {
  const safeGrossAmount =
    roundMoney(grossAmount);

  const safeCreatorNetAmount =
    roundMoney(creatorNetAmount);

  const safePlatformFee =
    roundMoney(platformFee);

  if (safeGrossAmount <= 0) {
    throw new Error(
      "Gross monetization amount must be greater than zero.",
    );
  }

  if (safeCreatorNetAmount < 0) {
    throw new Error(
      "Creator net amount cannot be negative.",
    );
  }

  if (safePlatformFee < 0) {
    throw new Error(
      "Platform fee cannot be negative.",
    );
  }

  const totalCredits = roundMoney(
    safeCreatorNetAmount +
      safePlatformFee,
  );

  if (safeGrossAmount !== totalCredits) {
    throw new Error(
      `Accounting rule is not balanced. Gross amount: ${safeGrossAmount.toFixed(
        2,
      )}; Creator net plus platform fee: ${totalCredits.toFixed(
        2,
      )}.`,
    );
  }

  const creatorLabel =
    creatorName?.trim() ||
    "creator";

  switch (eventType) {
    case ACCOUNTING_EVENT_TYPES.TIP:
      return [
        {
          accountCode:
            ACCOUNT_CODES.CASH_AND_PROCESSOR_CLEARING,

          debit:
            safeGrossAmount,

          credit:
            0,

          description:
            "Tip payment received through payment processor",
        },
        {
          accountCode:
            ACCOUNT_CODES.CREATOR_EARNINGS_PAYABLE,

          debit:
            0,

          credit:
            safeCreatorNetAmount,

          description:
            `Tip earnings payable to ${creatorLabel}`,
        },
        {
          accountCode:
            ACCOUNT_CODES.PLATFORM_FEE_REVENUE,

          debit:
            0,

          credit:
            safePlatformFee,

          description:
            "Platform fee revenue from viewer tip",
        },
      ];

    case ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT:
      return [
        {
          accountCode:
            ACCOUNT_CODES.CASH_AND_PROCESSOR_CLEARING,

          debit:
            safeGrossAmount,

          credit:
            0,

          description:
            "Super Support payment received through payment processor",
        },
        {
          accountCode:
            ACCOUNT_CODES.CREATOR_EARNINGS_PAYABLE,

          debit:
            0,

          credit:
            safeCreatorNetAmount,

          description:
            `Super Support earnings payable to ${creatorLabel}`,
        },
        {
          accountCode:
            ACCOUNT_CODES.PLATFORM_FEE_REVENUE,

          debit:
            0,

          credit:
            safePlatformFee,

          description:
            "Platform fee revenue from Super Support",
        },
      ];

    default:
      throw new Error(
        `No creator monetization accounting rule exists for ${eventType}.`,
      );
  }
}