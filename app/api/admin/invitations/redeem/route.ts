// app/api/admin/invitations/redeem/route.ts

import { NextResponse } from "next/server";

import {
  isAdminInvitationExpired,
  verifyAdminInvitationCode,
} from "@/lib/admin-invitations";

import {
  ADMIN_ROLE_LABELS,
  isAdminRole,
} from "@/lib/admin-rbac";

import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RedemptionRequestBody = {
  email?: string;
  code?: string;
};

type InvitationRow = {
  id: string;
  admin_user_id: string;
  email: string;
  role: string;
  code_hash: string;
  code_prefix: string;
  status: string;
  expires_at: string;
  redeemed_at: string | null;
  revoked_at: string | null;
  created_by: string | null;
};

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function normalizeCode(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toUpperCase()
    : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getClientIpAddress(
  request: Request,
): string | null {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      ?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

export async function POST(request: Request) {
  try {
    let body: RedemptionRequestBody;

    try {
      body =
        (await request.json()) as RedemptionRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid invitation redemption request is required.",
        },
        {
          status: 400,
        },
      );
    }

    const email =
      normalizeEmail(body.email);

    const code =
      normalizeCode(body.code);

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator email is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Enter a valid administrator email address.",
        },
        {
          status: 400,
        },
      );
    }

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The one-time invitation code is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    /*
     * Retrieve pending invitations for this email.
     * We verify the submitted code against each stored hash.
     */
    const {
      data: invitationData,
      error: invitationLookupError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .select(
        "id, admin_user_id, email, role, code_hash, code_prefix, status, expires_at, redeemed_at, revoked_at, created_by",
      )
      .ilike("email", email)
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (invitationLookupError) {
      console.error(
        "Invitation redemption lookup failed:",
        invitationLookupError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The administrator invitation could not be verified.",
        },
        {
          status: 500,
        },
      );
    }

    const invitations =
      (invitationData || []) as unknown as InvitationRow[];

    if (invitations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No pending administrator invitation was found for this email.",
        },
        {
          status: 401,
        },
      );
    }

    let invitation: InvitationRow | null =
      null;

    for (const candidate of invitations) {
      if (
        verifyAdminInvitationCode(
          code,
          candidate.code_hash,
        )
      ) {
        invitation = candidate;
        break;
      }
    }

    if (!invitation) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The invitation code is invalid.",
        },
        {
          status: 401,
        },
      );
    }

    if (invitation.revoked_at) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator invitation has been revoked.",
        },
        {
          status: 410,
        },
      );
    }

    if (
      isAdminInvitationExpired(
        invitation.expires_at,
      )
    ) {
      const now =
        new Date().toISOString();

      await supabaseAdmin
        .from("admin_invitations")
        .update({
          status: "expired",
          updated_at: now,
        })
        .eq("id", invitation.id)
        .eq("status", "pending");

      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator invitation has expired.",
        },
        {
          status: 410,
        },
      );
    }

    if (!isAdminRole(invitation.role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This invitation contains an invalid administrator role.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: adminData,
      error: adminLookupError,
    } = await supabaseAdmin
      .from("admin_users")
      .select(
        "id, email, full_name, role, status",
      )
      .eq(
        "id",
        invitation.admin_user_id,
      )
      .maybeSingle();

    if (
      adminLookupError ||
      !adminData
    ) {
      console.error(
        "Invited Admin lookup failed:",
        adminLookupError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The invited administrator record could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const admin =
      adminData as unknown as AdminUserRow;

    if (
      admin.email.toLowerCase() !== email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The invitation email does not match the administrator record.",
        },
        {
          status: 403,
        },
      );
    }

    if (admin.status === "active") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator account has already been activated.",
        },
        {
          status: 409,
        },
      );
    }

    if (admin.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator account is suspended and cannot be activated through an invitation.",
        },
        {
          status: 403,
        },
      );
    }

    if (admin.status === "revoked") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator account has been revoked.",
        },
        {
          status: 403,
        },
      );
    }

    const now =
      new Date().toISOString();

    /*
     * Consume the invitation only if it is still pending.
     * The status condition protects against reuse.
     */
    const {
      data: redeemedInvitationData,
      error: invitationUpdateError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .update({
        status: "redeemed",
        redeemed_at: now,
        updated_at: now,
      })
      .eq("id", invitation.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (
      invitationUpdateError ||
      !redeemedInvitationData
    ) {
      console.error(
        "Invitation consumption failed:",
        invitationUpdateError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "This invitation may already have been used. Please request a new invitation.",
        },
        {
          status: 409,
        },
      );
    }

    const {
      error: adminActivationError,
    } = await supabaseAdmin
      .from("admin_users")
      .update({
        role: invitation.role,
        status: "active",
        invitation_redeemed_at: now,
        suspended_at: null,
        revoked_at: null,
        updated_at: now,
      })
      .eq("id", admin.id)
      .eq("status", "invited");

    if (adminActivationError) {
      console.error(
        "Invited Admin activation failed:",
        adminActivationError,
      );

      /*
       * Restore the invitation to pending because activation
       * did not complete.
       */
      await supabaseAdmin
        .from("admin_invitations")
        .update({
          status: "pending",
          redeemed_at: null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", invitation.id)
        .eq("status", "redeemed");

      return NextResponse.json(
        {
          success: false,
          error:
            "The administrator account could not be activated.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * Revoke any other pending invitation for the same Admin.
     */
    const {
      error: revokeRemainingError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .update({
        status: "revoked",
        revoked_at: now,
        updated_at: now,
      })
      .eq(
        "admin_user_id",
        admin.id,
      )
      .eq("status", "pending")
      .neq("id", invitation.id);

    if (revokeRemainingError) {
      console.error(
        "Remaining invitation revocation failed:",
        revokeRemainingError,
      );
    }

    const ipAddress =
      getClientIpAddress(request);

    const userAgent =
      request.headers.get("user-agent");

    const {
      error: auditError,
    } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert({
        actor_admin_id:
          admin.id,

        target_admin_id:
          admin.id,

        action:
          "ADMIN_INVITATION_REDEEMED",

        resource_type:
          "admin_invitation",

        resource_id:
          invitation.id,

        details: {
          admin_email:
            email,

          admin_name:
            admin.full_name,

          assigned_role:
            invitation.role,

          assigned_role_label:
            ADMIN_ROLE_LABELS[
              invitation.role
            ],

          code_prefix:
            invitation.code_prefix,

          invited_by:
            invitation.created_by,

          redeemed_at:
            now,
        },

        ip_address:
          ipAddress,

        user_agent:
          userAgent,

        created_at:
          now,
      });

    if (auditError) {
      console.error(
        "Invitation redemption audit failed:",
        auditError,
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Your NiaTube administrator account has been activated.",

      administrator: {
        id:
          admin.id,

        email,

        fullName:
          admin.full_name,

        role:
          invitation.role,

        roleLabel:
          ADMIN_ROLE_LABELS[
            invitation.role
          ],

        status:
          "active",

        activatedAt:
          now,
      },

      nextPath:
        "/admin/access",
    });
  } catch (error: unknown) {
    console.error(
      "Unexpected invitation redemption error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected administrator invitation redemption error.",
      },
      {
        status: 500,
      },
    );
  }
}