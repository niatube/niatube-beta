// app/api/admin/access/route.ts

import crypto from "node:crypto";
import { NextResponse } from "next/server";

import {
  isAdminRole,
  type AdminRole,
} from "@/lib/admin-rbac";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
};

type AdminAccessCodeRow = {
  code: string;
  code_name: string | null;
  active: boolean;
  expires_at: string | null;
  redirect_path: string | null;
};

const ROLE_ALLOWED_PATHS: Record<
  AdminRole,
  readonly string[]
> = {
  super_admin: [
    "/admin",
    "/admin/governance",
    "/admin/niacircle",
    "/admin/finance",
    "/admin/finance/payouts",
    "/admin/advertising",
    "/admin/advertising/assign",

    "/financial",
    "/financial/tips",
    "/financial/creator-wallet",
    "/financial/treasury",
  ],

  governance_admin: [
    "/admin/governance",
  ],

  finance_admin: [
    "/admin/finance",
    "/admin/finance/payouts",

    "/financial",
    "/financial/tips",
    "/financial/creator-wallet",
    "/financial/treasury",
  ],

  advertising_admin: [
    "/admin/advertising",
    "/admin/advertising/assign",
  ],

  moderation_admin: [
    "/admin/governance",
  ],

  support_admin: [
    "/admin/niacircle",
  ],

  analytics_admin: [],
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function normalizeCode(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isExpired(
  expiresAt: string | null,
): boolean {
  if (!expiresAt) {
    return false;
  }

  const expirationTime =
    new Date(expiresAt).getTime();

  return (
    Number.isNaN(expirationTime) ||
    expirationTime <= Date.now()
  );
}

function roleCanAccessPath(
  role: AdminRole,
  redirectPath: string,
): boolean {
  return ROLE_ALLOWED_PATHS[role].includes(
    redirectPath,
  );
}

function getClientIpAddress(
  request: Request,
): string | null {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim() || null
    );
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = normalizeEmail(
      body?.email,
    );

    const code = normalizeCode(
      body?.code,
    );

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
            "Monthly administrator code is required.",
        },
        {
          status: 400,
        },
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: adminData,
      error: adminError,
    } = await supabaseAdmin
      .from("admin_users")
      .select(
        "id, email, full_name, role, status",
      )
      .eq("email", email)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Admin registry lookup failed:",
        adminError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator access could not be verified.",
        },
        {
          status: 500,
        },
      );
    }

    if (!adminData) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This email is not registered as a NiaTube administrator.",
        },
        {
          status: 401,
        },
      );
    }

    const admin =
      adminData as unknown as AdminUserRow;

    if (admin.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator account is not active.",
        },
        {
          status: 403,
        },
      );
    }

    if (!isAdminRole(admin.role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This administrator has an invalid role assignment.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: accessCodeData,
      error: accessCodeError,
    } = await supabaseAdmin
      .from("admin_access_codes")
      .select(
        "code, code_name, active, expires_at, redirect_path",
      )
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    if (
      accessCodeError ||
      !accessCodeData
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid administrator access code.",
        },
        {
          status: 401,
        },
      );
    }

    const accessCode =
      accessCodeData as unknown as AdminAccessCodeRow;

    if (
      !accessCode.active ||
      isExpired(accessCode.expires_at)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator access code has expired.",
        },
        {
          status: 401,
        },
      );
    }

    const redirectPath =
      accessCode.redirect_path || "/admin";

    if (
      !roleCanAccessPath(
        admin.role,
        redirectPath,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This operational code is not authorized for your administrator role.",
        },
        {
          status: 403,
        },
      );
    }

    const sessionToken =
      crypto
        .randomBytes(32)
        .toString("hex");

    const now =
      new Date().toISOString();

    const sessionExpiresAt =
      new Date(
        Date.now() +
          30 * 60 * 1000,
      ).toISOString();

    const ipAddress =
      getClientIpAddress(request);

    const userAgent =
      request.headers.get("user-agent");

    const {
      error: sessionError,
    } = await supabaseAdmin
      .from("admin_sessions")
      .insert([
        {
          session_token: sessionToken,

          admin_user_id: admin.id,
          admin_email:
            admin.email.toLowerCase(),
          admin_role: admin.role,

          code_name:
            accessCode.code_name ||
            "Admin",

          redirect_path:
            redirectPath,

          expires_at:
            sessionExpiresAt,

          last_seen_at:
            now,

          revoked_at:
            null,

          ip_address:
            ipAddress,

          user_agent:
            userAgent,
        },
      ]);

    if (sessionError) {
      console.error(
        "Admin session creation failed:",
        sessionError,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator session could not be created.",
        },
        {
          status: 500,
        },
      );
    }

    const {
      error: loginUpdateError,
    } = await supabaseAdmin
      .from("admin_users")
      .update({
        last_login_at: now,
      })
      .eq("id", admin.id);

    if (loginUpdateError) {
      console.error(
        "Admin last-login update failed:",
        loginUpdateError,
      );
    }

    const {
      error: auditError,
    } = await supabaseAdmin
      .from("admin_audit_logs")
      .insert([
        {
          actor_admin_id:
            admin.id,

          target_admin_id:
            admin.id,

          action:
            "ADMIN_LOGIN",

          resource_type:
            "admin_session",

          resource_id:
            sessionToken.slice(0, 12),

          details: {
            admin_email:
              admin.email.toLowerCase(),

            admin_role:
              admin.role,

            code_name:
              accessCode.code_name ||
              "Admin",

            redirect_path:
              redirectPath,

            session_expires_at:
              sessionExpiresAt,
          },

          ip_address:
            ipAddress,

          user_agent:
            userAgent,
        },
      ]);

    if (auditError) {
      console.error(
        "Admin login audit failed:",
        auditError,
      );
    }

    return NextResponse.json({
      success: true,

      sessionToken,

      adminId:
        admin.id,

      adminEmail:
        admin.email.toLowerCase(),

      adminName:
        admin.full_name,

      adminRole:
        admin.role,

      codeName:
        accessCode.code_name ||
        "Admin",

      redirectPath,

      expiresAt:
        sessionExpiresAt,
    });
  } catch (error: unknown) {
    console.error(
      "Unexpected Admin access error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected administrator access error.",
      },
      {
        status: 500,
      },
    );
  }
}