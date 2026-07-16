// app/api/admin/invitations/list/route.ts

import { NextResponse } from "next/server";

import {
  getAdminSessionTokenFromRequest,
  requireAdminPermission,
} from "@/lib/admin-session";

import {
  ADMIN_ROLE_LABELS,
  isAdminRole,
} from "@/lib/admin-rbac";

import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminInvitationRow = {
  id: string;
  admin_user_id: string;
  email: string;
  role: string;
  code_prefix: string;
  status: string;
  expires_at: string;
  redeemed_at: string | null;
  revoked_at: string | null;
  created_at: string;
  created_by: string | null;
};

type AdminUserRow = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
};

function isInvitationExpired(
  expiresAt: string,
): boolean {
  const expirationTime =
    new Date(expiresAt).getTime();

  return (
    !Number.isNaN(expirationTime) &&
    expirationTime <= Date.now()
  );
}

export async function GET(request: Request) {
  try {
    const sessionToken =
      getAdminSessionTokenFromRequest(request);

    const authorization =
      await requireAdminPermission(
        sessionToken,
        "admin.registry.read",
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

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: invitationData,
      error: invitationError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .select(
        "id, admin_user_id, email, role, code_prefix, status, expires_at, redeemed_at, revoked_at, created_at, created_by",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(200);

    if (invitationError) {
      console.error(
        "Admin invitation list failed:",
        invitationError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator invitations could not be loaded.",
        },
        {
          status: 500,
        },
      );
    }

    const invitations =
      (invitationData || []) as unknown as AdminInvitationRow[];

    const adminIds = Array.from(
      new Set(
        invitations.flatMap((invitation) => [
          invitation.admin_user_id,
          ...(invitation.created_by
            ? [invitation.created_by]
            : []),
        ]),
      ),
    );

    let adminMap =
      new Map<string, AdminUserRow>();

    if (adminIds.length > 0) {
      const {
        data: adminData,
        error: adminError,
      } = await supabaseAdmin
        .from("admin_users")
        .select(
          "id, full_name, email, role, status",
        )
        .in("id", adminIds);

      if (adminError) {
        console.error(
          "Invitation Admin details failed:",
          adminError,
        );
      } else {
        adminMap = new Map(
          (
            (adminData || []) as unknown as AdminUserRow[]
          ).map((admin) => [
            admin.id,
            admin,
          ]),
        );
      }
    }

    /*
     * Mark expired pending invitations in the response.
     * The database status will be synchronized below.
     */
    const expiredInvitationIds =
      invitations
        .filter(
          (invitation) =>
            invitation.status === "pending" &&
            isInvitationExpired(
              invitation.expires_at,
            ),
        )
        .map(
          (invitation) => invitation.id,
        );

    if (expiredInvitationIds.length > 0) {
      const now =
        new Date().toISOString();

      const {
        error: expirationUpdateError,
      } = await supabaseAdmin
        .from("admin_invitations")
        .update({
          status: "expired",
          updated_at: now,
        })
        .in(
          "id",
          expiredInvitationIds,
        );

      if (expirationUpdateError) {
        console.error(
          "Invitation expiration synchronization failed:",
          expirationUpdateError,
        );
      }
    }

    const responseInvitations =
      invitations.map((invitation) => {
        const invitedAdmin =
          adminMap.get(
            invitation.admin_user_id,
          );

        const creator =
          invitation.created_by
            ? adminMap.get(
                invitation.created_by,
              )
            : null;

        const effectiveStatus =
          invitation.status === "pending" &&
          isInvitationExpired(
            invitation.expires_at,
          )
            ? "expired"
            : invitation.status;

        const roleLabel =
          isAdminRole(invitation.role)
            ? ADMIN_ROLE_LABELS[
                invitation.role
              ]
            : invitation.role;

        return {
          id:
            invitation.id,

          adminUserId:
            invitation.admin_user_id,

          email:
            invitation.email,

          fullName:
            invitedAdmin?.full_name ||
            "Unknown administrator",

          role:
            invitation.role,

          roleLabel,

          adminStatus:
            invitedAdmin?.status ||
            "unknown",

          codePrefix:
            invitation.code_prefix,

          status:
            effectiveStatus,

          expiresAt:
            invitation.expires_at,

          redeemedAt:
            invitation.redeemed_at,

          revokedAt:
            invitation.revoked_at,

          createdAt:
            invitation.created_at,

          createdBy: creator
            ? {
                id:
                  creator.id,

                fullName:
                  creator.full_name,

                email:
                  creator.email,

                role:
                  creator.role,
              }
            : null,
        };
      });

    return NextResponse.json({
      success: true,

      invitations:
        responseInvitations,

      total:
        responseInvitations.length,
    });
  } catch (error: unknown) {
    console.error(
      "Unexpected invitation list error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected administrator invitation list error.",
      },
      {
        status: 500,
      },
    );
  }
}