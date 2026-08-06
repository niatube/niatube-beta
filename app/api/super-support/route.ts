import { authorizePayment } from "@/lib/payment-authorization";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { recordCreatorWalletEntry } from "@/lib/creator-wallet-engine";
import { prepareSuperSupport } from "@/lib/super-support-engine";
import { TRANSACTION_STATUS } from "@/lib/creator-economy";
import { NextResponse } from "next/server";
import { recordPlatformRevenue } from "@/lib/platform-treasury";
import { postJournalEntry } from "@/lib/journal-engine";

import {
  ACCOUNTING_EVENT_TYPES,
  buildCreatorMonetizationJournalLines,
} from "@/lib/accounting-rules";

import {
  convertToReportingCurrency,
  REPORTING_CURRENCY,
} from "@/lib/fx-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const creatorName = searchParams.get("creator");

    let query = supabaseAdmin
      .from("super_support_transactions")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (creatorName) {
      query = query.ilike(
        "creator_name",
        creatorName,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "Super Support ledger error:",
        error,
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      data ?? [],
    );
  } catch (error: unknown) {
    console.error(
      "Super Support GET API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load Super Support transactions.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    const liveVideoId = body.live_video_id || body.liveVideoId || null;
    const creatorName = body.creator_name || body.creatorName;
    const creatorId = body.creator_id || body.creatorId || creatorName;
    const supporterName =
      body.supporter_name || body.supporterName || "Viewer";
    const viewerId =
      body.viewer_id || body.viewerId || body.supporter_id || supporterName;

    const tier = body.tier || "Support";
const message = body.message || "";
const amount = Number(body.amount || 0);

const country = String(
  body.country || body.country_name || body.countryName || "United States"
).trim();

const rawCurrencyCode = String(
  body.currency_code || body.currencyCode || body.currency || "USD"
)
  .trim()
  .toUpperCase();

let currencyCode = rawCurrencyCode;

if (
  rawCurrencyCode.includes("XOF") ||
  rawCurrencyCode.includes("FCFA") ||
  rawCurrencyCode.includes("CFA") ||
  rawCurrencyCode === "OTHER"
) {
  currencyCode = "XOF";
}
const paymentMethod = String(
  body.payment_method || body.paymentMethod || "CARD"
).toUpperCase();

    if (!creatorName) {
      return NextResponse.json(
        { error: "Creator name is required." },
        { status: 400 }
      );
    }

    if (!liveVideoId) {
      return NextResponse.json(
        { error: "Live video ID is required." },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Super Support amount must be greater than zero." },
        { status: 400 }
      );
    }

    const authorization = await authorizePayment({
      viewerId,
      creatorId,
      country,
      currency: currencyCode,
      paymentMethod,
      amount,
    });

    if (!authorization.approved) {
  return NextResponse.json(
    {
      error: authorization.message,
      authorization_code: authorization.code,
      authorization_reason: authorization.reason,
      risk_score: authorization.riskScore,
      received_currency: currencyCode,
      raw_currency: rawCurrencyCode,
    },
    { status: 403 }
  );
}

    const preparedSupport = prepareSuperSupport({
      creatorName,
      amount,
      currencyCode,
    });

    const { data: transactionData, error: transactionError } =
      await supabaseAdmin
        .from("super_support_transactions")
        .insert([
          {
            live_video_id: liveVideoId,
            supporter_name: supporterName,
            creator_name: creatorName,
            currency_code: preparedSupport.currencyCode,
            amount: preparedSupport.grossAmount,
            tier,
            message,
            payment_status: "completed",
          },
        ])
        .select()
        .single();

    if (transactionError) {
      console.error("Super Support transaction error:", transactionError);
      return NextResponse.json(
        { error: transactionError.message },
        { status: 500 }
      );
    }

    try {
      await recordCreatorWalletEntry({
        supabaseAdmin,
        creatorName,
        transactionType: "super_support",
        referenceId: transactionData.id,
        currencyCode: preparedSupport.currencyCode,
        amount: preparedSupport.netAmount,
        status: TRANSACTION_STATUS.COMPLETED,
      });
      await recordPlatformRevenue({
  supabaseAdmin,
  creatorName,
  transactionType: "SUPER_SUPPORT_FEE",
  referenceId: transactionData.id,
  currencyCode: preparedSupport.currencyCode,
  grossAmount: preparedSupport.grossAmount,
  platformFee: preparedSupport.platformFee,
  country,
  status: TRANSACTION_STATUS.COMPLETED,
  notes: "Platform fee from Super Support",
});

const grossFx =
  await convertToReportingCurrency({
    supabaseAdmin,

    amount:
      preparedSupport.grossAmount,

    transactionCurrency:
      preparedSupport.currencyCode,
  });

const reportingGrossAmount =
  grossFx.reportingAmount;

const reportingCreatorNetAmount =
  Number(
    (
      preparedSupport.netAmount *
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

await postJournalEntry({
  supabaseAdmin,

  sourceType:
    ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT,

  sourceId:
    String(transactionData.id),

  description:
    `Super Support received for ${creatorName} — ` +
    `${preparedSupport.currencyCode} ` +
    `${preparedSupport.grossAmount.toFixed(2)} converted to ` +
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
        ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT,

      grossAmount:
        reportingGrossAmount,

      creatorNetAmount:
        reportingCreatorNetAmount,

      platformFee:
        reportingPlatformFee,

      creatorName,
    }),
});
    } catch (error: any) {
      console.error(
  "Super Support financial integration error:",
  error,
);

      return NextResponse.json(
        {
          error:
            error?.message ||
  "Failed to complete Super Support financial integration."
        },
        { status: 500 }
      );
    }

   const { error: notificationError } = await supabaseAdmin
  .from("notifications")
  .insert([
    {
      creator_name: creatorName,
      type: "super_support",
      title: "New Super Support received",
      message: `You received ${preparedSupport.currencyCode} ${preparedSupport.grossAmount} Super Support from ${supporterName}.`,
    },
  ]);

if (notificationError) {
  console.error(
    "Super Support notification error:",
    notificationError
  );
}

    return NextResponse.json(
      {
        transaction: transactionData,
        payment_authorization: {
          approved: authorization.approved,
          message: authorization.message,
          risk_score: authorization.riskScore,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Super Support API error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create Super Support." },
      { status: 500 }
    );
  }
}