// lib/admin-rbac.ts

export const ADMIN_ROLES = [
  "super_admin",
  "governance_admin",
  "finance_admin",
  "advertising_admin",
  "moderation_admin",
  "support_admin",
  "analytics_admin",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_STATUSES = [
  "invited",
  "active",
  "suspended",
  "revoked",
] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const ADMIN_INVITATION_STATUSES = [
  "pending",
  "redeemed",
  "expired",
  "revoked",
] as const;

export type AdminInvitationStatus =
  (typeof ADMIN_INVITATION_STATUSES)[number];

export const ADMIN_PERMISSIONS = [
  "admin.registry.read",
  "admin.invitation.create",
  "admin.invitation.revoke",
  "admin.role.update",
  "admin.status.update",

  "governance.read",
  "governance.manage",
  "governance.audit.read",
  "governance.codes.rotate",

  "finance.read",
  "finance.manage",
  "finance.payout.approve",

  "advertising.read",
  "advertising.manage",

  "moderation.read",
  "moderation.manage",

  "support.read",
  "support.manage",

  "analytics.read",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  governance_admin: "Governance Admin",
  finance_admin: "Finance Admin",
  advertising_admin: "Advertising Admin",
  moderation_admin: "Moderation Admin",
  support_admin: "Support Admin",
  analytics_admin: "Analytics Admin",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin:
    "Full platform administration, governance, finance, security, and operational authority.",

  governance_admin:
    "Manages administrator onboarding, governance records, access codes, and audit oversight.",

  finance_admin:
    "Manages creator payouts, settlements, liabilities, and financial operations.",

  advertising_admin:
    "Manages advertisers, campaigns, ad inventory, and advertising analytics.",

  moderation_admin:
    "Manages content moderation, creator enforcement, reports, and platform safety actions.",

  support_admin:
    "Handles creator and viewer support workflows without access to sensitive governance or finance controls.",

  analytics_admin:
    "Read-only access to platform, finance, advertising, creator, and operational analytics.",
};

export const ADMIN_ROLE_PERMISSIONS: Record<
  AdminRole,
  readonly AdminPermission[]
> = {
  super_admin: ADMIN_PERMISSIONS,

  governance_admin: [
    "admin.registry.read",
    "admin.invitation.create",
    "admin.invitation.revoke",
    "admin.role.update",
    "admin.status.update",
    "governance.read",
    "governance.manage",
    "governance.audit.read",
    "governance.codes.rotate",
    "analytics.read",
  ],

  finance_admin: [
    "finance.read",
    "finance.manage",
    "finance.payout.approve",
    "analytics.read",
  ],

  advertising_admin: [
    "advertising.read",
    "advertising.manage",
    "analytics.read",
  ],

  moderation_admin: [
    "moderation.read",
    "moderation.manage",
    "analytics.read",
  ],

  support_admin: [
    "support.read",
    "support.manage",
  ],

  analytics_admin: [
    "governance.read",
    "finance.read",
    "advertising.read",
    "moderation.read",
    "support.read",
    "analytics.read",
  ],
};

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    ADMIN_ROLES.includes(value as AdminRole)
  );
}

export function isAdminStatus(value: unknown): value is AdminStatus {
  return (
    typeof value === "string" &&
    ADMIN_STATUSES.includes(value as AdminStatus)
  );
}

export function isAdminInvitationStatus(
  value: unknown,
): value is AdminInvitationStatus {
  return (
    typeof value === "string" &&
    ADMIN_INVITATION_STATUSES.includes(
      value as AdminInvitationStatus,
    )
  );
}

export function adminHasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ADMIN_ROLE_PERMISSIONS[role].includes(permission);
}

export function adminHasAnyPermission(
  role: AdminRole,
  permissions: readonly AdminPermission[],
): boolean {
  return permissions.some((permission) =>
    adminHasPermission(role, permission),
  );
}

export function adminHasAllPermissions(
  role: AdminRole,
  permissions: readonly AdminPermission[],
): boolean {
  return permissions.every((permission) =>
    adminHasPermission(role, permission),
  );
}