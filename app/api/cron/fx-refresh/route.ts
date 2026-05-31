import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

const DEFAULT_RATES = [
  { base_currency: "USD", target_currency: "NGN", rate: 1420 },
  { base_currency: "USD", target_currency: "KES", rate: 129 },
  { base_currency: "USD", target_currency: "GHS", rate: 15 },
  { base_currency: "USD", target_currency: "ZAR", rate: 18 },
  { base_currency: "USD", target_currency: "RWF", rate: 1300 },
];

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const rows = DEFAULT_RATES.map((item) => ({
      ...item,
      source: "manual_seed_v1",
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from("fx_rates")
      .upsert(rows, {
  onConflict: "base_currency, target_currency",
})
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "FX rates refreshed successfully.",
      count: data?.length ?? 0,
      rates: data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "FX refresh failed." },
      { status: 500 }
    );
  }
}