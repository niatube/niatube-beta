// app/api/admin/codes/rotate/route.ts

import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  getAdminSessionTokenFromRequest,
  requireAdminPermission,
} from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RotationRequestBody = {
  sessionToken?: string;
};

function generateAdminCode(): string {
  const part1 = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

  const part2 = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

  const part3 = crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase();

  return `NIA-${part1}-${part2}-${part3}`;
}

export async function POST(request: Request) {
  try {
    let body: RotationRequestBody = {};

    try {
      body =
        (await request.json()) as RotationRequestBody;
    } catch {
      // A session token may instead be supplied through a header.
    }

    const headerSessionToken =
      getAdminSessionTokenFromRequest(request);

    const sessionToken =
      headerSessionToken ||
      String(body.sessionToken || "").trim();

    const authorization =
      await requireAdminPermission(
        sessionToken,
        "governance.codes.rotate",
      );

    if (!authorization.success) {
      return NextResponse.json(
        {
          success: false,
          error: authorization.error,
          code: authorization.code,
        },
        {
          status: authorization.status,
        },
      );
    }

    const currentAdmin =
      authorization.session;

    const supabaseAdmin =
      getSupabaseAdmin();

    const now =
      new Date().toISOString();

    const expiresAt =
      new Date(
        Date.now() +
          30 * 24 * 60 * 60 * 1000,
      ).toISOString();

    const newCodes = [
      {
        code_name: "Super Admin",
        code: generateAdminCode(),
        redirect_path: "/admin",
      },
      {
        code_name:
          "Creator Governance & Trust",
        code: generateAdminCode(),
        redirect_path: "/admin/governance",
      },
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
        redirect_path:
          "/admin/finance/payouts",
      },
      {
        code_name:
          "Advertising Intake Admin",
        code: generateAdminCode(),
        redirect_path:
          "/admin/advertising",
      },
      {
        code_name:
          "Advertising Campaign Admin",
        code: generateAdminCode(),
        redirect_path:
          "/admin/advertising/assign",
      },
    ];

    for (const item of newCodes) {
      const {
        error: deactivateError,
      } = await supabaseAdmin
        .from("admin_access_codes")
        .update({
          active: false,
        })
        .eq("code_name", item.code_name);

      if (deactivateError) {
        console.error(
          "Old Admin code deactivation failed:",
          deactivateError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "An existing administrator code could not be deactivated.",
          },
          {
            status: 500,
          },
        );
      }

      const {
        error: insertError,
      } = await supabaseAdmin
        .from("admin_access_codes")
        .insert({
          code_name: item.code_name,
          code: item.code,
          active: true,
          redirect_path:
            item.redirect_path,
          expires_at: expiresAt,
          last_rotated_at: now,
        });

      if (insertError) {
        console.error(
          "New Admin code creation failed:",
          insertError,
        );

        return NextResponse.json(
          {
            success: false,
            error: insertError.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    const {
      error: auditError,
    } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert({
        actor_admin_id:
          currentAdmin.adminId,

        target_admin_id:
          currentAdmin.adminId,

        action:
          "MONTHLY_CODES_ROTATED",

        resource_type:
          "admin_access_codes",

        details: {
          rotated_by_email:
            currentAdmin.adminEmail,

          rotated_by_name:
            currentAdmin.adminName,

          rotated_by_role:
            currentAdmin.adminRole,

          code_count:
            newCodes.length,

          code_names:
            newCodes.map(
              (item) => item.code_name,
            ),

          expires_at:
            expiresAt,
        },

        created_at:
          now,
      });

    if (auditError) {
      console.error(
        "Admin code rotation audit failed:",
        auditError,
      );
    }

    return NextResponse.json({
      success: true,
      expiresAt,
      codes: newCodes,
      rotatedBy: {
        adminId:
          currentAdmin.adminId,

        adminName:
          currentAdmin.adminName,

        adminEmail:
          currentAdmin.adminEmail,

        adminRole:
          currentAdmin.adminRole,
      },
    });
  } catch (error: unknown) {
    console.error(
      "Unexpected Admin code rotation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected administrator code rotation error.",
      },
      {
        status: 500,
      },
    );
  }
}