import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateAdminCode() {
  const part1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(2).toString("hex").toUpperCase();

  return `NIA-${part1}-${part2}-${part3}`;
}

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

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const newCodes = [
      {
        code_name: "Community Admin",
        code: generateAdminCode(),
        redirect_path: "/admin/niacircle",
      },
      {
        code_name: "Finance Admin",
        code: generateAdminCode(),
        redirect_path: "/admin/finance",
      },
      {
        code_name: "Payout Admin",
        code: generateAdminCode(),
        redirect_path: "/admin/finance/payouts",
      },
     
 
{
  code_name: "Advertising Intake Admin",
  code: generateAdminCode(),
  redirect_path: "/admin/advertising",
},
{
  code_name: "Advertising Campaign Admin",
  code: generateAdminCode(),
  redirect_path: "/admin/advertising/assign",
},
];


    for (const item of newCodes) {
      await supabaseAdmin
        .from("admin_access_codes")
        .update({ active: false })
        .eq("code_name", item.code_name);

      const { error } = await supabaseAdmin
        .from("admin_access_codes")
        .insert({
          code_name: item.code_name,
          code: item.code,
          active: true,
          redirect_path: item.redirect_path,
          expires_at: expiresAt,
          last_rotated_at: new Date().toISOString(),
        });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      expiresAt,
      codes: newCodes,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unexpected error.",
      },
      { status: 500 }
    );
  }
}