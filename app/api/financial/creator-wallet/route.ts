import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    const creatorName = searchParams.get("creator");
    const transactionType = searchParams.get("type");
    const currencyCode = searchParams.get("currency");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("creator_wallet_ledger")
      .select("*")
      .order("created_at", { ascending: false });

    if (creatorName) {
      query = query.ilike(
        "creator_name",
        `%${creatorName.trim()}%`,
      );
    }

    if (transactionType) {
      query = query.eq(
        "transaction_type",
        transactionType,
      );
    }

    if (currencyCode) {
      query = query.eq(
        "currency_code",
        currencyCode.trim().toUpperCase(),
      );
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "Creator Wallet Ledger load error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to load Creator Wallet Ledger.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    console.error(
      "Creator Wallet Ledger API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load Creator Wallet Ledger.",
      },
      { status: 500 },
    );
  }
}