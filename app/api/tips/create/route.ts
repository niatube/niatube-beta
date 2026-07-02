import { authorizePayment } from "@/lib/payment-authorization";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REPORTING_CURRENCY = "USD";

function inferCountryFromCurrency(currency: string) {
  const map: Record<string, string> = {
    USD: "United States",
    EUR: "France",
    GHS: "Ghana",
    KES: "Kenya",
    NGN: "Nigeria",
    RWF: "Rwanda",
  };

  return map[currency] || "United States";
}

function inferPaymentMethodFromCurrency(currency: string) {
  const mobileMoneyCurrencies = ["GHS", "KES", "RWF"];

  return mobileMoneyCurrencies.includes(currency)
    ? "MOBILE_MONEY"
    : "CARD";
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();

    const creatorName = body.creator_name || body.creatorName;
    const creatorId = body.creator_id || body.creatorId || creatorName;
    const viewerId =
      body.viewer_id ||
      body.viewerId ||
      body.from_user ||
      body.fromUser ||
      "anonymous-viewer";

    const videoId = body.video_id || body.videoId || null;
    const amount = Number(body.amount || 0);
    const currency = String(
      body.currency || body.currency_code || "USD"
    ).toUpperCase();

    const country =
      body.country ||
      body.country_name ||
      body.countryName ||
      inferCountryFromCurrency(currency);

    const paymentMethod = String(
      body.payment_method ||
        body.paymentMethod ||
        inferPaymentMethodFromCurrency(currency)
    ).toUpperCase();

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

    const authorization = await authorizePayment({
      viewerId,
      creatorId,
      country,
      currency,
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

    let fxRateUsed = 1;
    let fxSource = "same_currency_v1";
    let fxTimestamp = new Date().toISOString();

    if (currency !== REPORTING_CURRENCY) {
      const { data: fxRate, error: fxError } = await supabaseAdmin
        .from("fx_rates")
        .select("rate, source, updated_at")
        .eq("base_currency", REPORTING_CURRENCY)
        .eq("target_currency", currency)
        .single();

      if (fxError || !fxRate?.rate) {
        return NextResponse.json(
          {
            error: `Missing FX rate for ${REPORTING_CURRENCY} to ${currency}. Please refresh FX rates first.`,
          },
          { status: 400 }
        );
      }

      fxRateUsed = Number(fxRate.rate);
      fxSource = fxRate.source || "fx_rates_table";
      fxTimestamp = fxRate.updated_at || fxTimestamp;
    }

    const convertedAmount =
      currency === REPORTING_CURRENCY ? amount : amount / fxRateUsed;

    const { data, error } = await supabaseAdmin
      .from("tips")
      .insert([
        {
          creator_name: creatorName,
          video_id: videoId,
          amount,
          currency,
          currency_code: currency,
          from_user: body.from_user || body.fromUser || "Anonymous",

          original_amount: amount,
          original_currency: currency,
          reporting_currency: REPORTING_CURRENCY,
          fx_rate_used: fxRateUsed,
          converted_amount: convertedAmount,
          fx_source: fxSource,
          fx_timestamp: fxTimestamp,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Tip create insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        ...data,
        payment_authorization: {
          approved: authorization.approved,
          message: authorization.message,
          risk_score: authorization.riskScore,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Tip create API error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create tip." },
      { status: 500 }
    );
  }
}