import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";


import {
  ACCOUNTING_EVENT_TYPES,
} from "@/lib/accounting-rules";
import {
  calculateNetAmount,
  calculatePlatformFee,
  normalizeCurrencyCode,
  SOURCE_TYPES,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";
import { settlementEngine } from "@/lib/settlement-engine";



export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const creatorName = searchParams.get("creator");

    let query = supabaseAdmin
      .from("tips")
      .select("*")
      .order("created_at", { ascending: false });

    if (creatorName) {
      query = query.ilike("creator_name", creatorName);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase tips error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error("Tips API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load tips." },
      { status: 500 }
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

    const creatorName = body.creator_name || body.creatorName;
    const videoId = body.video_id || body.videoId || null;
    const amount = Number(body.amount || 0);
   const currencyCode = normalizeCurrencyCode(
  body.currency_code || body.currency
);

    const message = body.message || null;


  if (!creatorName) {
  return NextResponse.json(
    { error: "Creator name is required." },
    { status: 400 }
  );
}

const creatorId =
  body.creator_id ||
  body.creatorId ||
  null;

if (!creatorId) {
  return NextResponse.json(
    { error: "Creator ID is required." },
    { status: 400 }
  );
}
    const viewerId =
      body.viewer_id ||
      body.viewerId ||
      body.from_user ||
      body.fromUser ||
      "anonymous-viewer";

    const country =
      body.country ||
      body.country_name ||
      body.countryName ||
      "United States";

    const paymentMethod = String(
      body.payment_method || body.paymentMethod || "CARD"
    ).toUpperCase();
    if (!idempotencyKey) {
  return NextResponse.json(
    { error: "Idempotency key is required." },
    { status: 400 }
  );
}

const {
  data: existingTip,
  error: existingTipError,
} = await supabaseAdmin
  .from("tips")
  .select("*")
  .eq("idempotency_key", idempotencyKey)
  .maybeSingle();

if (existingTipError) {
  console.error(
    "Tip idempotency lookup error:",
    existingTipError
  );

  return NextResponse.json(
    {
      error:
        existingTipError.message ||
        "Failed to verify Tip request.",
    },
    { status: 500 }
  );
}

if (existingTip) {
  return NextResponse.json(
    {
      ...existingTip,
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
  sourceType: SOURCE_TYPES.VIDEO_TIP,
});

    if (!authorization.approved) {
      return NextResponse.json(
        {
          error: authorization.message,
          authorization_code: authorization.code,
          authorization_reason: authorization.reason,
          risk_score: authorization.riskScore,
        },
        { status: 403 }
      );
    }

    const platformFee = calculatePlatformFee(amount);
const netAmount = calculateNetAmount(amount);

    const { data: tipData, error: tipError } = await supabaseAdmin
  .from("tips")
  .insert([
    {
      creator_name: creatorName,
      video_id: videoId,
      amount,
      gross_amount: amount,
      platform_fee: platformFee,
      net_amount: netAmount,
      fee_rate: amount > 0 ? platformFee / amount : 0,
      currency_code: currencyCode,
      currency: currencyCode,
      message,
      fx_rate_used: 1,
      reporting_currency: currencyCode,
      converted_amount: amount,
      idempotency_key: idempotencyKey,
    },
  ])
  .select()
  .single();
    if (tipError) {
  if (tipError.code === "23505") {
    const {
      data: existingTip,
      error: lookupError,
    } = await supabaseAdmin
      .from("tips")
      .select("*")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();

    if (!lookupError && existingTip) {
      return NextResponse.json(
        {
          ...existingTip,
          duplicate: true,
          idempotency_key: idempotencyKey,
        },
        { status: 200 }
      );
    }
  }

  console.error(
    "Tip insert error:",
    tipError
  );

  return NextResponse.json(
    {
      error:
        tipError.message ||
        "Failed to create Tip transaction.",
    },
    { status: 500 }
  );
}

await settlementEngine.createAuthorizedSettlement({
  supabaseAdmin,

  sourceType:
    SOURCE_TYPES.VIDEO_TIP,

  sourceId:
    String(tipData.id),

  creatorId,
creatorName,

  currencyCode,

grossAmount:
  amount,

creatorNetAmount:
  netAmount,

paymentProvider:
  "BETA",

  providerReference:
    null,
});
   try {
  await settlementEngine.recordMonetizationAllocation({
  supabaseAdmin,
  creatorName,
  referenceId: String(tipData.id),

  currencyCode,
  country,

  grossAmount: amount,
  platformFee,
  creatorNetAmount: netAmount,

  walletTransactionType: "tip",
  treasuryTransactionType: "TIP_FEE",

  status: TRANSACTION_STATUS.COMPLETED,
  treasuryNotes: "Platform fee from viewer tip",
});

 await settlementEngine.recordMonetizationJournal({
  supabaseAdmin,

  sourceType:
    SOURCE_TYPES.VIDEO_TIP,

  sourceId:
    String(tipData.id),

  eventType:
    ACCOUNTING_EVENT_TYPES.TIP,

  creatorName,

  transactionCurrency:
    currencyCode,

  grossAmount:
    amount,

  creatorNetAmount:
    netAmount,

  descriptionPrefix:
    "Viewer tip received for",
});
} catch (error: any) {
  console.error(
  "Tip financial integration error:",
  error,
);

  return NextResponse.json(
    {
      error: error?.message,
      details: error,
    },
    { status: 500 }
  );
}

const { error: notificationError } = await supabaseAdmin
  .from("notifications")
  .insert([
    {
      creator_name: creatorName,
      type: "tip",
      title: "New tip received",
      message: `You received a tip of ${currencyCode} ${amount}.`,
    },
  ]);

if (notificationError) {
  console.error("Tip notification error:", notificationError);
}
    return NextResponse.json(tipData, { status: 201 });
  } catch (error: any) {
    console.error("Tips POST API error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create tip." },
      { status: 500 }
    );
  }
}
