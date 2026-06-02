import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REPORTING_CURRENCY = "USD";

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();

    const creatorName = body.creator_name || body.creatorName;
    const videoId = body.video_id || body.videoId || null;
    const amount = Number(body.amount || 0);
    const currency = String(
      body.currency || body.currency_code || "USD"
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
          from_user: "Anonymous",

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

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Tip create API error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to create tip." },
      { status: 500 }
    );
  }
}