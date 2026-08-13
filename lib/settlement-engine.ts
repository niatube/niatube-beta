import { authorizePayment } from "@/lib/payment-authorization";
import {
  routePayout,
  type PayoutProviderId,
} from "@/lib/payout-provider-router";
import { recordCreatorWalletEntry } from "@/lib/creator-wallet-engine";
import { recordPlatformRevenue } from "@/lib/platform-treasury";
import {
  convertToReportingCurrency,
  REPORTING_CURRENCY,
} from "@/lib/fx-engine";

import { postJournalEntry } from "@/lib/journal-engine";

import {
  ACCOUNTING_EVENT_TYPES,
  buildCreatorMonetizationJournalLines,
} from "@/lib/accounting-rules";

export enum SettlementStatus {
  INITIATED = "INITIATED",
  AUTHORIZATION_PENDING = "AUTHORIZATION_PENDING",
  AUTHORIZED = "AUTHORIZED",
  CAPTURE_PENDING = "CAPTURE_PENDING",
  CAPTURED = "CAPTURED",
  SETTLEMENT_PENDING = "SETTLEMENT_PENDING",
  SETTLED = "SETTLED",
  AVAILABLE = "AVAILABLE",
  WITHDRAWAL_REQUESTED =
  "WITHDRAWAL_REQUESTED",
   PAYOUT_QUEUED =
  "PAYOUT_QUEUED",
  PAYOUT_PROCESSING = "PAYOUT_PROCESSING",
  PAID_OUT = "PAID_OUT",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  REVERSED = "REVERSED",
}

const ALLOWED_SETTLEMENT_TRANSITIONS:
  Partial<
    Record<
      SettlementStatus,
      readonly SettlementStatus[]
    >
  > = {
  [SettlementStatus.AUTHORIZED]: [
    SettlementStatus.CAPTURED,
  ],

  [SettlementStatus.CAPTURED]: [
    SettlementStatus.SETTLEMENT_PENDING,
  ],

  [SettlementStatus.SETTLEMENT_PENDING]: [
    SettlementStatus.SETTLED,
  ],

  [SettlementStatus.SETTLED]: [
    SettlementStatus.AVAILABLE,
  ],

  [SettlementStatus.AVAILABLE]: [
  SettlementStatus.WITHDRAWAL_REQUESTED,
],

[SettlementStatus.WITHDRAWAL_REQUESTED]: [
  SettlementStatus.PAYOUT_QUEUED,
],

  [SettlementStatus.PAYOUT_QUEUED]: [
    SettlementStatus.PAYOUT_PROCESSING,
  ],

  [SettlementStatus.PAYOUT_PROCESSING]: [
    SettlementStatus.PAID_OUT,
  ],

  [SettlementStatus.PAID_OUT]: [],

[SettlementStatus.INITIATED]: [
  SettlementStatus.AUTHORIZATION_PENDING,
],

[SettlementStatus.AUTHORIZATION_PENDING]: [
  SettlementStatus.AUTHORIZED,
  SettlementStatus.FAILED,
],

[SettlementStatus.CAPTURE_PENDING]: [
  SettlementStatus.CAPTURED,
  SettlementStatus.FAILED,
],

[SettlementStatus.FAILED]: [],

[SettlementStatus.REFUNDED]: [],

[SettlementStatus.REVERSED]: [],
} as const;

function assertValidSettlementTransition(
  currentStatus: SettlementStatus,
  nextStatus: SettlementStatus,
) {
  const allowedTransitions =
  ALLOWED_SETTLEMENT_TRANSITIONS[
    currentStatus
  ] ?? [];
  if (
    !allowedTransitions.includes(
      nextStatus,
    )
  ) {
    throw new Error(
      `Invalid settlement transition: ${currentStatus} -> ${nextStatus}`,
    );
  }
}

export type SettlementRequest = {
  viewerId: string;
  creatorId: string;

  creatorName: string;

  country: string;

  currencyCode: string;

  paymentMethod: string;

  amount: number;

  sourceType: string;

  referenceId?: string;
};

export type RecordMonetizationAllocationRequest = {
  supabaseAdmin: any;

  creatorName: string;
  referenceId: string;

  currencyCode: string;
  country: string;

  grossAmount: number;
  platformFee: number;
  creatorNetAmount: number;

  walletTransactionType: string;
  treasuryTransactionType: string;

  status: string;
  treasuryNotes?: string | null;
};

export type RecordMonetizationJournalRequest = {
  supabaseAdmin: any;

  sourceType: string;
  sourceId: string;

  eventType:
    | typeof ACCOUNTING_EVENT_TYPES.TIP
    | typeof ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT;

  creatorName: string;

  transactionCurrency: string;

  grossAmount: number;
  creatorNetAmount: number;

  descriptionPrefix: string;
};

export type CreateSettlementRecordRequest = {
  supabaseAdmin: any;

  sourceType: string;
  sourceId: string;

  creatorId?: string | null;
  creatorName?: string | null;

  currencyCode: string;
grossAmount: number;
creatorNetAmount?: number | null;

paymentProvider?: string | null;
  providerReference?: string | null;
};

export type TransitionSettlementRequest = {
  supabaseAdmin: any;

  settlementId: string;

  nextStatus: SettlementStatus;

  transitionReason?: string | null;

  paymentProvider?: string | null;
  providerReference?: string | null;

  metadata?: Record<string, unknown>;
};

export class SettlementEngine {
  async authorize(
    request: SettlementRequest
  ) {
    return authorizePayment({
      viewerId: request.viewerId,
      creatorId: request.creatorId,
      country: request.country,
      currency: request.currencyCode,
      paymentMethod: request.paymentMethod,
      amount: request.amount,
    });
  }

async createAuthorizedSettlement(
  request: CreateSettlementRecordRequest,
) {
  const grossAmount =
    Number(request.grossAmount || 0);

  if (grossAmount <= 0) {
    throw new Error(
      "Settlement gross amount must be greater than zero.",
    );
  }

  const sourceType =
    String(request.sourceType || "")
      .trim()
      .toUpperCase();

  const sourceId =
    String(request.sourceId || "")
      .trim();

  const currencyCode =
    String(request.currencyCode || "")
      .trim()
      .toUpperCase();

  if (!sourceType) {
    throw new Error(
      "Settlement source type is required.",
    );
  }

  if (!sourceId) {
    throw new Error(
      "Settlement source ID is required.",
    );
  }

  if (!currencyCode) {
    throw new Error(
      "Settlement currency code is required.",
    );
  }

  const now =
    new Date().toISOString();

  const {
    data: existingSettlement,
    error: existingSettlementError,
  } = await request.supabaseAdmin
    .from("settlement_transactions")
    .select("*")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (existingSettlementError) {
    throw new Error(
      existingSettlementError.message ||
        "Failed to check existing settlement record.",
    );
  }

  if (existingSettlement) {
    return existingSettlement;
  }

  const {
    data: settlementTransaction,
    error: settlementTransactionError,
  } = await request.supabaseAdmin
    .from("settlement_transactions")
    .insert([
      {
        source_type:
          sourceType,

        source_id:
          sourceId,

creator_id:
  request.creatorId ?? null,

creator_name:
  request.creatorName ?? null,

currency_code:
  currencyCode,

       gross_amount:
  grossAmount,

creator_net_amount:
  request.creatorNetAmount ?? null,

current_status:
  SettlementStatus.AUTHORIZED,

        payment_provider:
          request.paymentProvider ?? null,

        provider_reference:
          request.providerReference ?? null,

        authorized_at:
          now,

        updated_at:
          now,
      },
    ])
    .select()
    .single();

  if (settlementTransactionError) {
    throw new Error(
      settlementTransactionError.message ||
        "Failed to create settlement record.",
    );
  }

  const {
    error: historyError,
  } = await request.supabaseAdmin
    .from("settlement_status_history")
    .insert([
      {
        settlement_transaction_id:
          settlementTransaction.id,

        from_status:
          null,

        to_status:
          SettlementStatus.AUTHORIZED,

        transition_reason:
          "Payment authorization approved.",

        payment_provider:
          request.paymentProvider ?? null,

        provider_reference:
          request.providerReference ?? null,

        metadata:
          {},
      },
    ]);

  if (historyError) {
    throw new Error(
      historyError.message ||
        "Failed to create settlement history record.",
    );
  }

  return settlementTransaction;
}

async transitionSettlement(
  request: TransitionSettlementRequest,
) {
  const settlementId =
    String(request.settlementId || "")
      .trim();

  if (!settlementId) {
    throw new Error(
      "Settlement transaction ID is required.",
    );
  }

  const {
    data: settlementTransaction,
    error: settlementLookupError,
  } = await request.supabaseAdmin
    .from("settlement_transactions")
    .select("*")
    .eq("id", settlementId)
    .single();

  if (settlementLookupError) {
    throw new Error(
      settlementLookupError.message ||
        "Failed to load settlement transaction.",
    );
  }

  const currentStatus =
    String(
      settlementTransaction.current_status || "",
    ) as SettlementStatus;

  const nextStatus =
    request.nextStatus;

  assertValidSettlementTransition(
    currentStatus,
    nextStatus,
  );

  const now =
    new Date().toISOString();

  const timestampUpdates:
    Record<string, string> = {};

  switch (nextStatus) {
    case SettlementStatus.AUTHORIZED:
      timestampUpdates.authorized_at =
        now;
      break;

    case SettlementStatus.CAPTURED:
      timestampUpdates.captured_at =
        now;
      break;

    case SettlementStatus.SETTLEMENT_PENDING:
      timestampUpdates.settlement_pending_at =
        now;
      break;

    case SettlementStatus.SETTLED:
      timestampUpdates.settled_at =
        now;
      break;

    case SettlementStatus.AVAILABLE:
  timestampUpdates.available_at =
    now;
  break;

case SettlementStatus.WITHDRAWAL_REQUESTED:
  timestampUpdates.withdrawal_requested_at =
    now;
  break;

case SettlementStatus.PAYOUT_QUEUED:

    case SettlementStatus.PAYOUT_QUEUED:
      timestampUpdates.payout_queued_at =
        now;
      break;

    case SettlementStatus.PAYOUT_PROCESSING:
      timestampUpdates.payout_processing_at =
        now;
      break;

    case SettlementStatus.PAID_OUT:
      timestampUpdates.paid_out_at =
        now;
      break;
  }

  const {
    data: updatedSettlement,
    error: settlementUpdateError,
  } = await request.supabaseAdmin
    .from("settlement_transactions")
    .update({
      current_status:
        nextStatus,

      updated_at:
        now,

      payment_provider:
        request.paymentProvider ??
        settlementTransaction.payment_provider ??
        null,

      provider_reference:
        request.providerReference ??
        settlementTransaction.provider_reference ??
        null,

      ...timestampUpdates,
    })
    .eq("id", settlementId)
    .select()
    .single();

  if (settlementUpdateError) {
    throw new Error(
      settlementUpdateError.message ||
        "Failed to update settlement transaction.",
    );
  }

  const {
    error: historyError,
  } = await request.supabaseAdmin
    .from("settlement_status_history")
    .insert([
      {
        settlement_transaction_id:
          settlementId,

        from_status:
          currentStatus,

        to_status:
          nextStatus,

        transition_reason:
          request.transitionReason ??
          null,

        payment_provider:
          request.paymentProvider ??
          updatedSettlement.payment_provider ??
          null,

        provider_reference:
          request.providerReference ??
          updatedSettlement.provider_reference ??
          null,

        metadata:
          request.metadata ?? {},
      },
    ]);

  if (historyError) {
    throw new Error(
      historyError.message ||
        "Failed to record settlement transition history.",
    );
  }

  return updatedSettlement;
}

  async recordMonetizationAllocation(
  request: RecordMonetizationAllocationRequest,
) {
  const grossAmount = Number(
    request.grossAmount || 0,
  );

  const platformFee = Number(
    request.platformFee || 0,
  );

  const creatorNetAmount = Number(
    request.creatorNetAmount || 0,
  );

  if (grossAmount <= 0) {
    throw new Error(
      "Settlement gross amount must be greater than zero.",
    );
  }

  if (platformFee < 0) {
    throw new Error(
      "Settlement platform fee cannot be negative.",
    );
  }

  if (creatorNetAmount <= 0) {
    throw new Error(
      "Settlement creator net amount must be greater than zero.",
    );
  }

  const calculatedTotal =
    platformFee + creatorNetAmount;

  if (
    Math.abs(
      calculatedTotal - grossAmount,
    ) > 0.01
  ) {
    throw new Error(
      "Settlement allocation does not balance to the gross amount.",
    );
  }

  const creatorWalletEntry =
    await recordCreatorWalletEntry({
      supabaseAdmin:
        request.supabaseAdmin,

      creatorName:
        request.creatorName,

      transactionType:
        request.walletTransactionType,

      referenceId:
        request.referenceId,

      currencyCode:
        request.currencyCode,

      amount:
        creatorNetAmount,

      status:
        request.status,
    });

  const platformTreasuryEntry =
    await recordPlatformRevenue({
      supabaseAdmin:
        request.supabaseAdmin,

      creatorName:
        request.creatorName,

      transactionType:
        request.treasuryTransactionType,

      referenceId:
        request.referenceId,

      currencyCode:
        request.currencyCode,

      grossAmount,
      platformFee,

      country:
        request.country,

      status:
        request.status,

      notes:
        request.treasuryNotes ?? null,
    });

  return {
    creatorWalletEntry,
    platformTreasuryEntry,
    grossAmount,
    platformFee,
    creatorNetAmount,
  };
}

async recordMonetizationJournal(
  request: RecordMonetizationJournalRequest,
) {
  const grossFx =
    await convertToReportingCurrency({
      supabaseAdmin:
        request.supabaseAdmin,

      amount:
        request.grossAmount,

      transactionCurrency:
        request.transactionCurrency,
    });

  const reportingGrossAmount =
    grossFx.reportingAmount;

  const reportingCreatorNetAmount =
    Number(
      (
        request.creatorNetAmount *
        grossFx.exchangeRate
      ).toFixed(2),
    );

  const reportingPlatformFee =
    Number(
      (
        reportingGrossAmount -
        reportingCreatorNetAmount
      ).toFixed(2),
    );

  const journalResult =
    await postJournalEntry({
      supabaseAdmin:
        request.supabaseAdmin,

      sourceType:
        request.sourceType,

      sourceId:
        request.sourceId,

      description:
        `${request.descriptionPrefix} ${request.creatorName} — ` +
        `${request.transactionCurrency} ` +
        `${request.grossAmount.toFixed(2)} converted to ` +
        `${REPORTING_CURRENCY} ` +
        `${reportingGrossAmount.toFixed(2)} ` +
        `at FX rate ${grossFx.exchangeRate}`,

      currencyCode:
        REPORTING_CURRENCY,

      createdBy:
        "SYSTEM",

      fxMetadata: {
        transactionCurrency:
          grossFx.transactionCurrency,

        transactionAmount:
          grossFx.transactionAmount,

        reportingCurrency:
          grossFx.reportingCurrency,

        reportingAmount:
          grossFx.reportingAmount,

        exchangeRate:
          grossFx.exchangeRate,

        fxRateId:
          grossFx.fxRateId,

        fxRateSource:
          grossFx.rateSource,

        fxRateTimestamp:
          grossFx.rateTimestamp,
      },

      lines:
        buildCreatorMonetizationJournalLines({
          eventType:
            request.eventType,

          grossAmount:
            reportingGrossAmount,

          creatorNetAmount:
            reportingCreatorNetAmount,

          platformFee:
            reportingPlatformFee,

          creatorName:
            request.creatorName,
        }),
    });

  return {
    journalResult,
    grossFx,
    reportingGrossAmount,
    reportingCreatorNetAmount,
    reportingPlatformFee,
  };
}

async capture(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.CAPTURED,

    transitionReason:
      request.transitionReason ??
      "Payment captured.",
  });
}

  async settle(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.SETTLEMENT_PENDING,

    transitionReason:
      request.transitionReason ??
      "Payment moved to settlement pending.",
  });
}

  async confirmSettlement(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.SETTLED,

    transitionReason:
      request.transitionReason ??
      "Provider settlement confirmed.",
  });
}

async releaseFunds(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.AVAILABLE,

    transitionReason:
      request.transitionReason ??
      "Settled funds released to creator availability.",
  });
}

async requestWithdrawal(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.WITHDRAWAL_REQUESTED,

    transitionReason:
      request.transitionReason ??
      "Creator withdrawal requested.",
  });
}

 async queuePayout(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  const {
    data: settlementTransaction,
    error: settlementLookupError,
  } = await request.supabaseAdmin
    .from("settlement_transactions")
    .select("*")
    .eq("id", request.settlementId)
    .single();

  if (settlementLookupError) {
    throw new Error(
      settlementLookupError.message ||
        "Failed to load settlement transaction for payout.",
    );
  }

  const creatorId = String(
    settlementTransaction.creator_id || "",
  ).trim();

  if (!creatorId) {
    throw new Error(
      "Settlement transaction does not have a creator ID.",
    );
  }

  const creatorNetAmount = Number(
    settlementTransaction.creator_net_amount || 0,
  );

  if (creatorNetAmount <= 0) {
    throw new Error(
      "Settlement transaction does not have a valid creator net payout amount.",
    );
  }

  const currencyCode = String(
    settlementTransaction.currency_code || "",
  )
    .trim()
    .toUpperCase();

  if (!currencyCode) {
    throw new Error(
      "Settlement transaction does not have a payout currency.",
    );
  }

  const provider = String(
  request.paymentProvider ||
    settlementTransaction.payment_provider ||
    "BETA",
)
  .trim()
  .toUpperCase() as PayoutProviderId;

let destinationReference: string | null = null;

if (provider !== "BETA") {
  const {
    data: payoutProfile,
    error: payoutProfileError,
  } = await request.supabaseAdmin
    .from("creator_payout_profiles")
    .select(
      "creator_id, payout_provider, provider_recipient_id, provider_recipient_type, payout_currency, payout_method, country",
    )
    .eq("creator_id", creatorId)
    .maybeSingle();

  if (payoutProfileError) {
    throw new Error(
      payoutProfileError.message ||
        "Failed to load creator payout profile.",
    );
  }

  if (!payoutProfile) {
    throw new Error(
      "Creator does not have a payout profile configured.",
    );
  }

  const configuredProvider = String(
    payoutProfile.payout_provider || "",
  )
    .trim()
    .toUpperCase();

  if (configuredProvider !== provider) {
    throw new Error(
      `Creator payout profile is not configured for ${provider}.`,
    );
  }

  const payoutCurrency = String(
    payoutProfile.payout_currency || "",
  )
    .trim()
    .toUpperCase();

  if (
    payoutCurrency &&
    payoutCurrency !== currencyCode
  ) {
    throw new Error(
      `Creator payout profile currency ${payoutCurrency} does not match settlement currency ${currencyCode}.`,
    );
  }

  destinationReference = String(
    payoutProfile.provider_recipient_id || "",
  ).trim();

  if (!destinationReference) {
    throw new Error(
      `${provider} recipient ID is not configured for this creator.`,
    );
  }
}

const payoutResult = await routePayout({
    settlementId:
      request.settlementId,

    creatorId,

    amount:
      creatorNetAmount,

    currency:
      currencyCode,

    provider,

destinationReference,

metadata: {
      sourceType:
        settlementTransaction.source_type,

      sourceId:
        settlementTransaction.source_id,

      grossAmount:
        Number(
          settlementTransaction.gross_amount || 0,
        ),

      creatorNetAmount,
    },
  });

  if (!payoutResult.accepted) {
    throw new Error(
      payoutResult.message ||
        "Payout provider rejected the payout request.",
    );
  }

  return this.transitionSettlement({
    ...request,

    paymentProvider:
      payoutResult.provider,

    providerReference:
      payoutResult.providerReference,

    metadata: {
      ...(request.metadata ?? {}),

      payoutProviderStatus:
        payoutResult.status,

      payoutRail:
        payoutResult.payoutRail,

      creatorNetAmount,

      currencyCode,
    },

    nextStatus:
      SettlementStatus.PAYOUT_QUEUED,

    transitionReason:
      request.transitionReason ??
      "Creator payout accepted by payout provider and queued.",
  });
}

async processPayout(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.PAYOUT_PROCESSING,

    transitionReason:
      request.transitionReason ??
      "Creator payout processing started.",
  });
}
  async completePayout(
  request: Omit<
    TransitionSettlementRequest,
    "nextStatus"
  >,
) {
  return this.transitionSettlement({
    ...request,

    nextStatus:
      SettlementStatus.PAID_OUT,

    transitionReason:
      request.transitionReason ??
      "Creator payout completed successfully.",
    });
}
}

export const settlementEngine =
  new SettlementEngine();