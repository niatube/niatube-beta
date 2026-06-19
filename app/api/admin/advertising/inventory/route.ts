import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("advertising_inventory")
      .select("*")
      .order("location", { ascending: true })
      .order("slot_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      inventory: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Could not load advertising inventory." },
      { status: 500 }
    );
  }
}