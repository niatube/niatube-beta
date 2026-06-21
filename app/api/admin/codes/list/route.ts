import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: "Missing admin session." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("admin_sessions")
      .select("session_token, redirect_path, expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: "Invalid admin session." },
        { status: 401 }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, error: "Admin session expired." },
        { status: 401 }
      );
    }

    if (session.redirect_path !== "/admin") {
      return NextResponse.json(
        { success: false, error: "Super Admin access required." },
        { status: 403 }
      );
    }

    const { data: codes, error: codesError } = await supabaseAdmin
      .from("admin_access_codes")
      .select(
        "code_name, code, active, redirect_path, expires_at, last_rotated_at"
      )
      .eq("active", true)
      .order("code_name", { ascending: true });

    if (codesError) {
      return NextResponse.json(
        { success: false, error: codesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      codes: codes || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}