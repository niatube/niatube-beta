import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sessionToken, requestedPath } = await req.json();

    if (!sessionToken || !requestedPath) {
      return NextResponse.json(
        { allowed: false, error: "Missing session token or path." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("admin_sessions")
      .select(
  "session_token, code_name, redirect_path, expires_at, admin_role",
)
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { allowed: false, error: "Invalid admin session." },
        { status: 401 }
      );
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json(
        { allowed: false, error: "Admin session expired." },
        { status: 401 }
      );
    }

const isFinancialPath =
  requestedPath === "/financial" ||
  requestedPath.startsWith("/financial/");

const isAdminFinancePath =
  requestedPath === "/admin/finance" ||
  requestedPath.startsWith("/admin/finance/");

const hasRedirectPathAccess =
  requestedPath === data.redirect_path ||
  requestedPath.startsWith(
    `${data.redirect_path}/`,
  );

const allowed =
  data.admin_role === "super_admin" ||
  (data.admin_role === "finance_admin" &&
    (isFinancialPath ||
      isAdminFinancePath)) ||
  hasRedirectPathAccess;
    return NextResponse.json({
      allowed,
      codeName: data.code_name,
      redirectPath: data.redirect_path,
      expiresAt: data.expires_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { allowed: false, error: error?.message || "Unexpected error." },
      { status: 500 }
    );
  }
}