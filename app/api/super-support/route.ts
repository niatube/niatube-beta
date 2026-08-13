import { settlementEngine } from "@/lib/settlement-engine";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  ACCOUNTING_EVENT_TYPES,
} from "@/lib/accounting-rules";

import { prepareSuperSupport } from "@/lib/super-support-engine";
import {
  SOURCE_TYPES,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";
import { NextResponse } from "next/server";

import { postJournalEntry } from "@/lib/journal-engine";



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
    const idempotencyKey = String(
  body.idempotency_key ||
    body.idempotencyKey ||
    ""
).trim();

    const liveVideoId = body.live_video_id || body.liveVideoId || null;
    const creatorName = body.creator_name || body.creatorName;
    const creatorId = body.creator_id || body.creatorId || null;
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
    if (!creatorId) {
  return NextResponse.json(
    { error: "Creator ID is required." },
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
    if (!idempotencyKey) {
  return NextResponse.json(
    { error: "Idempotency key is required." },
    { status: 400 }
  );
}

const {
  data: existingTransaction,
  error: existingTransactionError,
} = await supabaseAdmin
  .from("super_support_transactions")
  .select("*")
  .eq("idempotency_key", idempotencyKey)
  .maybeSingle();

if (existingTransactionError) {
  console.error(
    "Super Support idempotency lookup error:",
    existingTransactionError
  );

  return NextResponse.json(
    {
      error:
        existingTransactionError.message ||
        "Failed to verify Super Support request."
    },
    { status: 500 }
  );
}

if (existingTransaction) {
  return NextResponse.json(
    {
      transaction: existingTransaction,
      duplicate: true,
      idempotency_key: idempotencyKey,
    },
    { status: 200 }
  );
}

    const authorization = await settlementEngine.authorize({
  viewerId,
  creatorId,
  creatorName,
  country,
  currencyCode,
  paymentMethod,
  amount,
  sourceType: ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT,
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
            idempotency_key: idempotencyKey,
          },
        ])
        .select()
        .single();

    if (transactionError) {
  if (transactionError.code === "23505") {
    const {
      data: existingTransaction,
      error: lookupError,
    } = await supabaseAdmin
      .from("super_support_transactions")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (!lookupError && existingTransaction) {
      return NextResponse.json(
        {
          transaction: existingTransaction,
          duplicate: true,
          idempotency_key: idempotencyKey,
        },
        { status: 200 }
      );
    }
  }

  console.error(
    "Super Support transaction error:",
    transactionError
  );

  return NextResponse.json(
    {
      error:
        transactionError.message ||
        "Failed to create Super Support transaction.",
    },
    { status: 500 }
  );
}

await settlementEngine.createAuthorizedSettlement({
  supabaseAdmin,

  sourceType:
    SOURCE_TYPES.SUPER_SUPPORT,

  sourceId:
    String(transactionData.id),

  creatorId,
creatorName,

  currencyCode:
    preparedSupport.currencyCode,

  grossAmount:
  preparedSupport.grossAmount,

creatorNetAmount:
  preparedSupport.netAmount,

paymentProvider:
  "BETA",
  providerReference:
    null,
});

    try {
      await settlementEngine.recordMonetizationAllocation({
  supabaseAdmin,
  creatorName,
  referenceId: String(transactionData.id),

  currencyCode: preparedSupport.currencyCode,
  country,

  grossAmount: preparedSupport.grossAmount,
  platformFee: preparedSupport.platformFee,
  creatorNetAmount: preparedSupport.netAmount,

  walletTransactionType: "super_support",
  treasuryTransactionType: "SUPER_SUPPORT_FEE",

  status: TRANSACTION_STATUS.COMPLETED,
  treasuryNotes: "Platform fee from Super Support",
});

await settlementEngine.recordMonetizationJournal({
  supabaseAdmin,

  sourceType:
    SOURCE_TYPES.SUPER_SUPPORT,

  sourceId:
    String(transactionData.id),

  eventType:
    ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT,

  creatorName,

  transactionCurrency:
    preparedSupport.currencyCode,

  grossAmount:
    preparedSupport.grossAmount,

  creatorNetAmount:
    preparedSupport.netAmount,

  descriptionPrefix:
    "Super Support received for",
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