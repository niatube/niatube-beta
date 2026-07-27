import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { recordCreatorWalletEntry } from "@/lib/creator-wallet-engine";
import { recordPlatformRevenue } from "@/lib/platform-treasury";

import {
  calculateNetAmount,
  calculatePlatformFee,
  normalizeCurrencyCode,
  SOURCE_TYPES,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";
import { authorizePayment } from "@/lib/payment-authorization";

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

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Tip amount must be greater than zero." },
        { status: 400 }
      );
    }

        const creatorId = body.creator_id || body.creatorId || creatorName;
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
    },
  ])
  .select()
  .single();
    if (tipError) {
      console.error("Tip insert error:", tipError);
      return NextResponse.json({ error: tipError.message }, { status: 500 });
    }

   try {
  await recordCreatorWalletEntry({
    supabaseAdmin,
    creatorName,
    transactionType: "tip", // Keep "tip" for beta compatibility
    referenceId: tipData.id,
    currencyCode,
    amount: netAmount,
    status: TRANSACTION_STATUS.COMPLETED,
  });
  await recordPlatformRevenue({
    supabaseAdmin,
    creatorName,
    transactionType: "TIP_FEE",
    referenceId: tipData.id,
    currencyCode,
    grossAmount: amount,
    platformFee,
    country,
    status: TRANSACTION_STATUS.COMPLETED,
    notes: "Platform fee from viewer tip",
  });

} catch (error: any) {
  console.error("Treasury integration error:", error);

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