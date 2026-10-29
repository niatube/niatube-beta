import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authorization = await validateAdminRequest(request);

  if (!authorization.success) {
    return NextResponse.json(
      {
        success: false,
        error: authorization.error,
      },
      { status: authorization.status }
    );
  }

  if (authorization.session.adminRole !== "super_admin") {
    return NextResponse.json(
      {
        success: false,
        error: "Super Admin access is required.",
      },
      { status: 403 }
    );
  }

    const { id } = await context.params;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid creator ID.",
      },
      { status: 400 }
    );
  }

    const supabaseAdmin = getSupabaseAdmin();

  const { data: creator, error: creatorError } = await supabaseAdmin
    .from("creator_profiles")
    .select("id, creator_name, email")
    .eq("id", id)
    .maybeSingle();

  if (creatorError) {
    console.error("Failed to retrieve creator profile:", creatorError);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve creator profile.",
      },
      { status: 500 }
    );
  }

  if (!creator) {
    return NextResponse.json(
      {
        success: false,
        error: "Creator profile not found.",
      },
      { status: 404 }
    );
  }

    const { error: auditError } = await supabaseAdmin
    .from("admin_audit_logs")
    .insert([
      {
        actor_admin_id: authorization.session.adminId,
        action: "CREATOR_DASHBOARD_VIEWED",
        resource_type: "creator_profile",
        resource_id: id,
        details: {
          access_type: "read_only",
          creator_id: id,
        },
      },
    ]);

  if (auditError) {
    console.error("Failed to record creator dashboard access:", auditError);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to record access audit. Access denied.",
      },
      { status: 500 }
    );
  }

    return NextResponse.json({
    success: true,
    creatorId: id,
    creator,
  });
}
