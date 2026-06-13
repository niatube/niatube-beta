import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPermissions(role: string | null) {
  if (role === "super_admin") {
    return {
      canAccessAdmin: true,
      canReviewUploads: true,
      canReviewMigrations: true,
      canReviewNiaCircle: true,
      canReviewNiaMall: true,
      canAccessFinance: true,
      canReviewPayouts: true,
      canManageFx: true,
      canManageAdmins: true,
    };
  }

  if (role === "finance_admin") {
    return {
      canAccessAdmin: true,
      canReviewUploads: false,
      canReviewMigrations: false,
      canReviewNiaCircle: false,
      canReviewNiaMall: false,
      canAccessFinance: true,
      canReviewPayouts: true,
      canManageFx: true,
      canManageAdmins: false,
    };
  }

  if (role === "content_admin") {
    return {
      canAccessAdmin: true,
      canReviewUploads: true,
      canReviewMigrations: false,
      canReviewNiaCircle: false,
      canReviewNiaMall: false,
      canAccessFinance: false,
      canReviewPayouts: false,
      canManageFx: false,
      canManageAdmins: false,
    };
  }

  if (role === "community_admin") {
    return {
      canAccessAdmin: true,
      canReviewUploads: false,
      canReviewMigrations: true,
      canReviewNiaCircle: true,
      canReviewNiaMall: true,
      canAccessFinance: false,
      canReviewPayouts: false,
      canManageFx: false,
      canManageAdmins: false,
    };
  }

  return {
    canAccessAdmin: false,
    canReviewUploads: false,
    canReviewMigrations: false,
    canReviewNiaCircle: false,
    canReviewNiaMall: false,
    canAccessFinance: false,
    canReviewPayouts: false,
    canManageFx: false,
    canManageAdmins: false,
  };
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        {
          isAdmin: false,
          role: null,
          permissions: getPermissions(null),
          error: "Missing email.",
        },
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
        {
          isAdmin: false,
          role: null,
          permissions: getPermissions(null),
          error: error.message,
        },
        { status: 500 }
      );
    }

    const role = data?.role || null;
    const permissions = getPermissions(role);

    return NextResponse.json({
      isAdmin: Boolean(data),
      role,
      permissions,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        isAdmin: false,
        role: null,
        permissions: getPermissions(null),
        error: error?.message || "Unexpected error.",
      },
      { status: 500 }
    );
  }
}