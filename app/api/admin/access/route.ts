import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const cleanCode = String(code || "").trim();

    if (!cleanCode) {
      return NextResponse.json(
        { success: false, error: "Missing admin code." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("admin_access_codes")
      .select("code, active, expires_at, redirect_path")
      .eq("code", cleanCode)
      .eq("active", true)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Invalid admin access code." },
        { status: 401 }
      );
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Admin access code expired." },
        { status: 401 }
      );
    }

    return NextResponse.json({
  success: true,
  redirectPath: data.redirect_path || "/admin",
});
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}