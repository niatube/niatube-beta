import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { isAdmin: false, error: "Missing email." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("admin_users")
      .select("email, role, active")
      .eq("email", email)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { isAdmin: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isAdmin: Boolean(data),
      role: data?.role || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        isAdmin: false,
        error: error?.message || "Unexpected error.",
      },
      { status: 500 }
    );
  }
}