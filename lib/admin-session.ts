// lib/admin-session.ts

import { getSupabaseAdmin } from "@/lib/supabase-server";

import {
  adminHasPermission,
  isAdminRole,
  type AdminPermission,
  type AdminRole,
} from "@/lib/admin-rbac";

export type ValidatedAdminSession = {
  sessionToken: string;

  adminId: string;
  adminEmail: string;
  adminName: string;
  adminRole: AdminRole;

  codeName: string;
  redirectPath: string;

  expiresAt: string;
  lastSeenAt: string | null;
};

export type AdminSessionErrorCode =
  | "MISSING_SESSION"
  | "INVALID_SESSION"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "UNIDENTIFIED_SESSION"
  | "ADMIN_NOT_FOUND"
  | "ADMIN_INACTIVE"
  | "INVALID_ADMIN_ROLE"
  | "SESSION_UPDATE_FAILED";

export type AdminSessionValidationResult =
  | {
      success: true;
      session: ValidatedAdminSession;
    }
  | {
      success: false;
      status: number;
      error: string;
      code: AdminSessionErrorCode;
    };

export type AdminPermissionResult =
  | {
      success: true;
      session: ValidatedAdminSession;
    }
  | {
      success: false;
      status: number;
      error: string;
      code:
        | AdminSessionErrorCode
        | "PERMISSION_DENIED";
    };

type AdminSessionRow = {
  session_token: string;
  admin_user_id: string | null;
  admin_email: string | null;
  admin_role: string | null;
  code_name: string | null;
  redirect_path: string | null;
  expires_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
};

type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
};

function normalizeSessionToken(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function isExpired(expiresAt: string): boolean {
  const expirationTime = new Date(
    expiresAt,
  ).getTime();

  return (
    Number.isNaN(expirationTime) ||
    expirationTime <= Date.now()
  );
}

export function getAdminSessionTokenFromRequest(
  request: Request,
): string {
  const authorizationHeader =
    request.headers.get("authorization");

  if (
    authorizationHeader &&
    authorizationHeader
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return normalizeSessionToken(
      authorizationHeader.slice(7),
    );
  }

  return normalizeSessionToken(
    request.headers.get("x-admin-session"),
  );
}

export async function validateAdminSession(
  sessionTokenInput: unknown,
): Promise<AdminSessionValidationResult> {
  const sessionToken = normalizeSessionToken(
    sessionTokenInput,
  );

  if (!sessionToken) {
    return {
      success: false,
      status: 400,
      error: "Missing admin session.",
      code: "MISSING_SESSION",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const {
    data: sessionData,
    error: sessionError,
  } = await supabaseAdmin
    .from("admin_sessions")
    .select(
      "session_token, admin_user_id, admin_email, admin_role, code_name, redirect_path, expires_at, last_seen_at, revoked_at",
    )
    .eq("session_token", sessionToken)
    .maybeSingle();

  if (sessionError || !sessionData) {
    return {
      success: false,
      status: 401,
      error: "Invalid admin session.",
      code: "INVALID_SESSION",
    };
  }

  const session =
    sessionData as unknown as AdminSessionRow;

  if (session.revoked_at) {
    return {
      success: false,
      status: 401,
      error: "Admin session has been revoked.",
      code: "SESSION_REVOKED",
    };
  }

  if (isExpired(session.expires_at)) {
    return {
      success: false,
      status: 401,
      error: "Admin session expired.",
      code: "SESSION_EXPIRED",
    };
  }

  if (!session.admin_user_id) {
    return {
      success: false,
      status: 401,
      error:
        "This legacy session is not linked to an administrator. Please sign in again.",
      code: "UNIDENTIFIED_SESSION",
    };
  }

  const {
    data: adminData,
    error: adminError,
  } = await supabaseAdmin
    .from("admin_users")
    .select(
      "id, email, full_name, role, status",
    )
    .eq("id", session.admin_user_id)
    .maybeSingle();

  if (adminError || !adminData) {
    return {
      success: false,
      status: 401,
      error:
        "The administrator linked to this session could not be found.",
      code: "ADMIN_NOT_FOUND",
    };
  }

  const admin =
    adminData as unknown as AdminUserRow;

  if (admin.status !== "active") {
    return {
      success: false,
      status: 403,
      error:
        "This administrator account is not active.",
      code: "ADMIN_INACTIVE",
    };
  }

  if (!isAdminRole(admin.role)) {
    return {
      success: false,
      status: 403,
      error:
        "This administrator has an invalid role assignment.",
      code: "INVALID_ADMIN_ROLE",
    };
  }

  const now = new Date().toISOString();

  const { error: updateError } =
    await supabaseAdmin
      .from("admin_sessions")
      .update({
        admin_email: admin.email.toLowerCase(),
        admin_role: admin.role,
        last_seen_at: now,
      })
      .eq("session_token", sessionToken);

  if (updateError) {
    console.error(
      "Admin session last-seen update failed:",
      updateError,
    );

    return {
      success: false,
      status: 500,
      error:
        "The administrator session could not be refreshed.",
      code: "SESSION_UPDATE_FAILED",
    };
  }

  return {
    success: true,
    session: {
      sessionToken,

      adminId: admin.id,
      adminEmail: admin.email.toLowerCase(),
      adminName: admin.full_name,
      adminRole: admin.role,

      codeName:
        session.code_name || "Admin",

      redirectPath:
        session.redirect_path || "/admin",

      expiresAt: session.expires_at,
      lastSeenAt: now,
    },
  };
}

export async function validateAdminRequest(
  request: Request,
): Promise<AdminSessionValidationResult> {
  const sessionToken =
    getAdminSessionTokenFromRequest(request);

  return validateAdminSession(
    sessionToken,
  );
}

export async function requireAdminPermission(
  sessionTokenInput: unknown,
  permission: AdminPermission,
): Promise<AdminPermissionResult> {
  const validation =
    await validateAdminSession(
      sessionTokenInput,
    );

  if (!validation.success) {
    return {
      success: false,
      status: validation.status,
      error: validation.error,
      code: validation.code,
    };
  }

  if (
    !adminHasPermission(
      validation.session.adminRole,
      permission,
    )
  ) {
    return {
      success: false,
      status: 403,
      error:
        "You do not have permission to perform this administrator action.",
      code: "PERMISSION_DENIED",
    };
  }

  return {
    success: true,
    session: validation.session,
  };
}

export async function requireAdminRequestPermission(
  request: Request,
  permission: AdminPermission,
): Promise<AdminPermissionResult> {
  const sessionToken =
    getAdminSessionTokenFromRequest(request);

  return requireAdminPermission(
    sessionToken,
    permission,
  );
}

export async function revokeAdminSession(
  sessionTokenInput: unknown,
): Promise<{
  success: boolean;
  error?: string;
}> {
  const sessionToken = normalizeSessionToken(
    sessionTokenInput,
  );

  if (!sessionToken) {
    return {
      success: false,
      error: "Missing admin session.",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { error } = await supabaseAdmin
    .from("admin_sessions")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("session_token", sessionToken)
    .is("revoked_at", null);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}