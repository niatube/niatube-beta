import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

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
      .select("code, code_name, active, expires_at, redirect_path")
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

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionExpiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString();

    const { error: sessionError } = await supabaseAdmin
      .from("admin_sessions")
      .insert([
        {
          session_token: sessionToken,
          code_name: data.code_name || "Admin",
          redirect_path: data.redirect_path || "/admin",
          expires_at: sessionExpiresAt,
        },
      ]);

    if (sessionError) {
      return NextResponse.json(
        { success: false, error: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectPath: data.redirect_path || "/admin",
      sessionToken,
      expiresAt: sessionExpiresAt,
      codeName: data.code_name || "Admin",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}