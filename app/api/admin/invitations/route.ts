// app/api/admin/invitations/route.ts

import { NextResponse } from "next/server";

import {
  generateAdminInvitationCode,
  resolveInvitationExpiration,
} from "@/lib/admin-invitations";

import {
  getAdminSessionTokenFromRequest,
  requireAdminPermission,
} from "@/lib/admin-session";

import {
  ADMIN_ROLE_LABELS,
  isAdminRole,
  type AdminRole,
} from "@/lib/admin-rbac";

import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InvitationRequestBody = {
  sessionToken?: string;
  email?: string;
  fullName?: string;
  role?: string;
  expiresInHours?: number | string;
};

type ExistingAdminRow = {
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

function normalizeName(value: unknown): string {
  return typeof value === "string"
    ? value.trim().replace(/\s+/g, " ")
    : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    let body: InvitationRequestBody;

    try {
      body =
        (await request.json()) as InvitationRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid administrator invitation request is required.",
        },
        {
          status: 400,
        },
      );
    }

    const headerSessionToken =
      getAdminSessionTokenFromRequest(request);

    const sessionToken =
      headerSessionToken ||
      String(body.sessionToken || "").trim();

    const authorization =
      await requireAdminPermission(
        sessionToken,
        "admin.invitation.create",
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

    const email =
      normalizeEmail(body.email);

    const fullName =
      normalizeName(body.fullName);

    const requestedRole =
      typeof body.role === "string"
        ? body.role.trim()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The new administrator's email is required.",
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

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The new administrator's full name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (fullName.length > 150) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The administrator's full name is too long.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isAdminRole(requestedRole)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Select a valid administrator role.",
        },
        {
          status: 400,
        },
      );
    }

    const role: AdminRole =
      requestedRole;

    /*
     * Only a Super Admin may appoint another Super Admin.
     * Governance Admins may invite all other supported roles.
     */
    if (
      role === "super_admin" &&
      currentAdmin.adminRole !== "super_admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only a Super Admin may invite another Super Admin.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Prevent administrators from creating invitations
     * for their own currently authenticated identity.
     */
    if (
      email ===
      currentAdmin.adminEmail.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot create an invitation for your own active administrator account.",
        },
        {
          status: 409,
        },
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const now =
      new Date().toISOString();

    const {
      data: existingAdminData,
      error: existingAdminError,
    } = await supabaseAdmin
      .from("admin_users")
      .select(
        "id, email, full_name, role, status",
      )
      .ilike("email", email)
      .maybeSingle();

    if (existingAdminError) {
      console.error(
        "Admin registry lookup failed:",
        existingAdminError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The administrator registry could not be checked.",
        },
        {
          status: 500,
        },
      );
    }

    let adminUserId: string;

    if (existingAdminData) {
      const existingAdmin =
        existingAdminData as unknown as ExistingAdminRow;

      if (existingAdmin.status === "active") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This email already belongs to an active NiaTube administrator.",
          },
          {
            status: 409,
          },
        );
      }

      if (existingAdmin.status === "suspended") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This administrator is suspended. Resolve the suspension instead of issuing a new invitation.",
          },
          {
            status: 409,
          },
        );
      }

      if (existingAdmin.status === "revoked") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This administrator has been revoked. Reactivation requires a separate governance action.",
          },
          {
            status: 409,
          },
        );
      }

      adminUserId =
        existingAdmin.id;

      const {
        error: adminUpdateError,
      } = await supabaseAdmin
        .from("admin_users")
        .update({
          email,
          full_name: fullName,
          role,
          status: "invited",
          invited_by:
            currentAdmin.adminId,
          invitation_redeemed_at:
            null,
          updated_at:
            now,
        })
        .eq("id", adminUserId);

      if (adminUpdateError) {
        console.error(
          "Invited Admin update failed:",
          adminUpdateError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "The administrator invitation record could not be updated.",
          },
          {
            status: 500,
          },
        );
      }
    } else {
      const {
        data: newAdminData,
        error: newAdminError,
      } = await supabaseAdmin
        .from("admin_users")
        .insert({
          email,
          full_name: fullName,
          role,
          status: "invited",
          invited_by:
            currentAdmin.adminId,
        })
        .select("id")
        .single();

      if (
        newAdminError ||
        !newAdminData
      ) {
        console.error(
          "Invited Admin creation failed:",
          newAdminError,
        );

        return NextResponse.json(
          {
            success: false,
            error:
              newAdminError?.message ||
              "The administrator registry record could not be created.",
          },
          {
            status: 500,
          },
        );
      }

      adminUserId =
        String(newAdminData.id);
    }

    /*
     * Revoke every older pending invitation for this
     * administrator before issuing a replacement.
     */
    const {
      error: revokeOldInvitationsError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .update({
        status: "revoked",
        revoked_at: now,
        updated_at: now,
      })
      .eq("admin_user_id", adminUserId)
      .eq("status", "pending");

    if (revokeOldInvitationsError) {
      console.error(
        "Older invitation revocation failed:",
        revokeOldInvitationsError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Older pending invitations could not be revoked.",
        },
        {
          status: 500,
        },
      );
    }

    const expiresAt =
      resolveInvitationExpiration(
        body.expiresInHours,
      );

    const generatedCode =
      generateAdminInvitationCode();

    const {
      data: invitationData,
      error: invitationError,
    } = await supabaseAdmin
      .from("admin_invitations")
      .insert({
        admin_user_id:
          adminUserId,

        email,

        role,

        code_hash:
          generatedCode.codeHash,

        code_prefix:
          generatedCode.codePrefix,

        status:
          "pending",

        expires_at:
          expiresAt.toISOString(),

        created_by:
          currentAdmin.adminId,
      })
      .select(
        "id, created_at",
      )
      .single();

    if (
      invitationError ||
      !invitationData
    ) {
      console.error(
        "Admin invitation creation failed:",
        invitationError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            invitationError?.message ||
            "The administrator invitation could not be created.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error: auditError,
    } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert({
        actor_admin_id:
          currentAdmin.adminId,

        target_admin_id:
          adminUserId,

        action:
          "ADMIN_INVITATION_CREATED",

        resource_type:
          "admin_invitation",

        resource_id:
          String(invitationData.id),

        details: {
          invited_email:
            email,

          invited_name:
            fullName,

          invited_role:
            role,

          invited_role_label:
            ADMIN_ROLE_LABELS[role],

          code_prefix:
            generatedCode.codePrefix,

          expires_at:
            expiresAt.toISOString(),

          created_by_email:
            currentAdmin.adminEmail,

          created_by_name:
            currentAdmin.adminName,

          created_by_role:
            currentAdmin.adminRole,
        },

        created_at:
          now,
      });

    if (auditError) {
      console.error(
        "Admin invitation audit failed:",
        auditError,
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "The one-time administrator invitation was created successfully.",

        invitation: {
          id:
            invitationData.id,

          adminUserId,

          email,

          fullName,

          role,

          roleLabel:
            ADMIN_ROLE_LABELS[role],

          code:
            generatedCode.code,

          codePrefix:
            generatedCode.codePrefix,

          status:
            "pending",

          expiresAt:
            expiresAt.toISOString(),

          createdAt:
            invitationData.created_at,
        },

        securityNotice:
          "This is the only response that will display the complete invitation code. Store or deliver it securely.",
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error(
      "Unexpected Admin invitation error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected administrator invitation error.",
      },
      {
        status: 500,
      },
    );
  }
}