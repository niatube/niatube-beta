import { getSupabaseAdmin } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

import {
  calculateNetAmount,
  calculatePlatformFee,
  normalizeCurrencyCode,
  SOURCE_TYPES,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";

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

    const platformFee = calculatePlatformFee(amount);
const netAmount = calculateNetAmount(amount);

    const { data: tipData, error: tipError } = await supabaseAdmin
      .from("tips")
      .insert([
        {
          creator_name: creatorName,
          video_id: videoId,
          amount,
          currency_code: currencyCode,
          gross_amount: amount,
          platform_fee: platformFee,
          net_amount: netAmount,
          message,
        },
      ])
      .select()
      .single();

    if (tipError) {
      console.error("Tip insert error:", tipError);
      return NextResponse.json({ error: tipError.message }, { status: 500 });
    }

    const { error: ledgerError } = await supabaseAdmin
      .from("creator_wallet_ledger")
      .insert([
        {
          creator_name: creatorName,
          transaction_type:  "tip",
          reference_id: tipData.id,
          currency_code: currencyCode,
          amount: netAmount,
          status: TRANSACTION_STATUS.COMPLETED,
        },
      ]);

    if (ledgerError) {
      console.error("Creator wallet ledger insert error:", ledgerError);
      return NextResponse.json(
        { error: ledgerError.message },
        { status: 500 }
      );
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