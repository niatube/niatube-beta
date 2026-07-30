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
    const country = searchParams.get("country");
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("platform_treasury")
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
        transactionType.trim(),
      );
    }

    if (currencyCode) {
      query = query.eq(
        "currency_code",
        currencyCode.trim().toUpperCase(),
      );
    }

    if (country) {
      query = query.ilike(
        "country",
        `%${country.trim()}%`,
      );
    }

    if (status) {
      query = query.eq(
        "status",
        status.trim(),
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "Platform Treasury load error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to load Platform Treasury.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error: unknown) {
    console.error(
      "Platform Treasury API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load Platform Treasury.",
      },
      { status: 500 },
    );
  }
}