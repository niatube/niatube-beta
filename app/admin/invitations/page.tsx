"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ADMIN_ROLES,
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  type AdminRole,
} from "@/lib/admin-rbac";

type StoredAdminAccess = {
  sessionToken?: string;
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  adminRole?: AdminRole;
  codeName?: string;
  redirectPath?: string;
  expiresAt?: string;
};

type InvitationItem = {
  id: string;
  adminUserId: string;
  email: string;
  fullName: string;
  role: string;
  roleLabel: string;
  adminStatus: string;
  codePrefix: string;
  status: string;
  expiresAt: string;
  redeemedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
};

type CreatedInvitation = {
  id: string;
  adminUserId: string;
  email: string;
  fullName: string;
  role: AdminRole;
  roleLabel: string;
  code: string;
  codePrefix: string;
  status: string;
  expiresAt: string;
  createdAt: string;
};

const INVITATION_EXPIRATION_OPTIONS = [
  {
    value: 24,
    label: "24 hours",
  },
  {
    value: 48,
    label: "48 hours",
  },
  {
    value: 72,
    label: "72 hours",
  },
  {
    value: 168,
    label: "7 days",
  },
] as const;

function readStoredAdminAccess(): StoredAdminAccess | null {
  const rawAccess =
    sessionStorage.getItem("niatube_admin_access");

  if (!rawAccess) {
    return null;
  }

  try {
    return JSON.parse(rawAccess) as StoredAdminAccess;
  } catch {
    sessionStorage.removeItem("niatube_admin_access");
    return null;
  }
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  const parsedDate =
    new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return parsedDate.toLocaleString();
}

export default function AdminInvitationsPage() {
  const [accessChecked, setAccessChecked] =
    useState(false);

  const [hasAccess, setHasAccess] =
    useState(false);

  const [sessionToken, setSessionToken] =
    useState("");

  const [currentAdminRole, setCurrentAdminRole] =
    useState<AdminRole | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState<AdminRole>("support_admin");

  const [expiresInHours, setExpiresInHours] =
    useState(48);

  const [creating, setCreating] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [loadError, setLoadError] =
    useState("");

  const [
    createdInvitation,
    setCreatedInvitation,
  ] = useState<CreatedInvitation | null>(
    null,
  );

  const [invitations, setInvitations] =
    useState<InvitationItem[]>([]);

  useEffect(() => {
    const access =
      readStoredAdminAccess();

    if (
      !access?.sessionToken ||
      !access.expiresAt ||
      new Date(access.expiresAt) <= new Date()
    ) {
      sessionStorage.removeItem(
        "niatube_admin_access",
      );

      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
      return;
    }

    if (
      access.adminRole !== "super_admin" &&
      access.adminRole !== "governance_admin"
    ) {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
      return;
    }

    setSessionToken(access.sessionToken);
    setCurrentAdminRole(access.adminRole);
    setHasAccess(true);
    setAccessChecked(true);
  }, []);

  const loadInvitations =
    useCallback(async () => {
      if (!sessionToken) {
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          "/api/admin/invitations/list",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${sessionToken}`,
            },

            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (!response.ok || !result.success) {
          setLoadError(
            result.error ||
              "Administrator invitations could not be loaded.",
          );

          setLoading(false);
          return;
        }

        setInvitations(
          Array.isArray(result.invitations)
            ? result.invitations
            : [],
        );
      } catch (error) {
        console.error(
          "Invitation list request failed:",
          error,
        );

        setLoadError(
          "The invitation registry request could not be completed.",
        );
      } finally {
        setLoading(false);
      }
    }, [sessionToken]);

  useEffect(() => {
    if (!hasAccess || !sessionToken) {
      return;
    }

    void loadInvitations();
  }, [
    hasAccess,
    sessionToken,
    loadInvitations,
  ]);

  const invitationCounts =
    useMemo(() => {
      return invitations.reduce(
        (counts, invitation) => {
          const status =
            invitation.status.toLowerCase();

          if (
            status in counts
          ) {
            counts[
              status as keyof typeof counts
            ] += 1;
          }

          return counts;
        },
        {
          pending: 0,
          redeemed: 0,
          expired: 0,
          revoked: 0,
        },
      );
    }, [invitations]);

  async function createInvitation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setCreatedInvitation(null);

    const cleanName =
      fullName.trim().replace(/\s+/g, " ");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName) {
      setMessage(
        "Enter the new administrator's full name.",
      );
      return;
    }

    if (!cleanEmail) {
      setMessage(
        "Enter the new administrator's email address.",
      );
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        "/api/admin/invitations",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${sessionToken}`,
          },

          body: JSON.stringify({
            fullName:
              cleanName,

            email:
              cleanEmail,

            role,

            expiresInHours,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.error ||
            "The administrator invitation could not be created.",
        );

        setCreating(false);
        return;
      }

      setCreatedInvitation(
        result.invitation as CreatedInvitation,
      );

      setFullName("");
      setEmail("");
      setRole("support_admin");
      setExpiresInHours(48);

      await loadInvitations();
    } catch (error) {
      console.error(
        "Invitation creation request failed:",
        error,
      );

      setMessage(
        "The invitation request could not be completed.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function copyInvitationCode() {
    if (!createdInvitation?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        createdInvitation.code,
      );

      setMessage(
        "The one-time invitation code was copied.",
      );
    } catch (error) {
      console.error(
        "Invitation code copy failed:",
        error,
      );

      setMessage(
        "The code could not be copied automatically. Select and copy it manually.",
      );
    }
  }

  if (!accessChecked) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <p className="text-sm font-bold text-gray-600">
          Checking administrator permissions...
        </p>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <section className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-gray-900">
            Invitation Management Access Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            This area is restricted to active Super
            Admin and Governance Admin accounts.
          </p>

          <Link
            href="/admin/access"
            className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
          >
            Enter Admin Access
          </Link>
        </section>
      </main>
    );
  }

  const selectableRoles =
    currentAdminRole === "super_admin"
      ? ADMIN_ROLES
      : ADMIN_ROLES.filter(
          (adminRole) =>
            adminRole !== "super_admin",
        );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-purple-700">
              Administration Governance
            </p>

            <h1 className="mt-2 text-4xl font-black text-gray-900">
              Admin Invitation Management
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-gray-600">
              Create secure one-time administrator
              invitations, assign role-based access,
              and review the invitation lifecycle.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-100"
          >
            ← Admin Control Center
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Pending"
            value={invitationCounts.pending}
            description="Awaiting redemption"
          />

          <MetricCard
            title="Redeemed"
            value={invitationCounts.redeemed}
            description="Successfully activated"
          />

          <MetricCard
            title="Expired"
            value={invitationCounts.expired}
            description="No longer usable"
          />

          <MetricCard
            title="Revoked"
            value={invitationCounts.revoked}
            description="Withdrawn invitations"
          />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900">
              Create Admin Invitation
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              The complete invitation code will be
              displayed only once after creation.
            </p>

            <form
              onSubmit={createInvitation}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="invite-full-name"
                  className="mb-2 block text-sm font-black text-gray-800"
                >
                  Full Name
                </label>

                <input
                  id="invite-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  disabled={creating}
                  placeholder="Administrator's full name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-email"
                  className="mb-2 block text-sm font-black text-gray-800"
                >
                  Administrator Email
                </label>

                <input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={creating}
                  placeholder="newadmin@niatube.africa"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="invite-role"
                  className="mb-2 block text-sm font-black text-gray-800"
                >
                  Administrator Role
                </label>

                <select
                  id="invite-role"
                  value={role}
                  onChange={(event) =>
                    setRole(
                      event.target.value as AdminRole,
                    )
                  }
                  disabled={creating}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                >
                  {selectableRoles.map(
                    (adminRole) => (
                      <option
                        key={adminRole}
                        value={adminRole}
                      >
                        {
                          ADMIN_ROLE_LABELS[
                            adminRole
                          ]
                        }
                      </option>
                    ),
                  )}
                </select>

                <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">
                  {
                    ADMIN_ROLE_DESCRIPTIONS[
                      role
                    ]
                  }
                </p>
              </div>

              <div>
                <label
                  htmlFor="invite-expiration"
                  className="mb-2 block text-sm font-black text-gray-800"
                >
                  Invitation Expiration
                </label>

                <select
                  id="invite-expiration"
                  value={expiresInHours}
                  onChange={(event) =>
                    setExpiresInHours(
                      Number(event.target.value),
                    )
                  }
                  disabled={creating}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
                >
                  {INVITATION_EXPIRATION_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {creating
                  ? "Creating Invitation..."
                  : "Generate One-Time Invitation"}
              </button>
            </form>

            {message && (
              <p className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold leading-6 text-blue-900">
                {message}
              </p>
            )}
          </section>

          <section>
            {createdInvitation ? (
              <div className="rounded-3xl border-2 border-green-300 bg-green-50 p-7 shadow-sm">
                <p className="text-sm font-black uppercase tracking-wide text-green-800">
                  Invitation Created
                </p>

                <h2 className="mt-2 text-2xl font-black text-gray-900">
                  Save This Code Now
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-700">
                  This is the only time the complete
                  invitation code will be displayed.
                </p>

                <div className="mt-6 rounded-2xl border border-green-300 bg-white p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-500">
                    One-Time Invitation Code
                  </p>

                  <p className="mt-2 break-all font-mono text-2xl font-black tracking-wider text-gray-900">
                    {createdInvitation.code}
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Administrator"
                    value={createdInvitation.fullName}
                  />

                  <DetailItem
                    label="Email"
                    value={createdInvitation.email}
                  />

                  <DetailItem
                    label="Role"
                    value={createdInvitation.roleLabel}
                  />

                  <DetailItem
                    label="Expires"
                    value={formatDate(
                      createdInvitation.expiresAt,
                    )}
                  />
                </div>

                <button
                  type="button"
                  onClick={copyInvitationCode}
                  className="mt-6 rounded-xl bg-green-700 px-5 py-3 text-sm font-black text-white hover:bg-green-800"
                >
                  Copy Invitation Code
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <h2 className="text-2xl font-black text-gray-900">
                  No New Invitation Generated
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Complete the invitation form to
                  generate a secure one-time code.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Invitation Registry
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Review pending, redeemed, expired,
                and revoked administrator invitations.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadInvitations()
              }
              disabled={loading}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Registry"}
            </button>
          </div>

          {loadError && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
              {loadError}
            </p>
          )}

          {loading ? (
            <p className="mt-6 font-bold text-gray-600">
              Loading administrator invitations...
            </p>
          ) : invitations.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
              No administrator invitations have been
              created.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-3 pr-4">
                      Administrator
                    </th>

                    <th className="py-3 pr-4">
                      Role
                    </th>

                    <th className="py-3 pr-4">
                      Status
                    </th>

                    <th className="py-3 pr-4">
                      Code Prefix
                    </th>

                    <th className="py-3 pr-4">
                      Created By
                    </th>

                    <th className="py-3 pr-4">
                      Created
                    </th>

                    <th className="py-3 pr-4">
                      Expires
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {invitations.map(
                    (invitation) => (
                      <tr
                        key={invitation.id}
                        className="border-b align-top last:border-b-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-black text-gray-900">
                            {invitation.fullName}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-gray-500">
                            {invitation.email}
                          </p>
                        </td>

                        <td className="py-4 pr-4 font-bold text-gray-700">
                          {invitation.roleLabel}
                        </td>

                        <td className="py-4 pr-4">
                          <InvitationStatusBadge
                            status={invitation.status}
                          />
                        </td>

                        <td className="py-4 pr-4 font-mono font-bold text-gray-700">
                          {invitation.codePrefix}
                        </td>

                        <td className="py-4 pr-4 text-gray-700">
                          {invitation.createdBy
                            ?.fullName ||
                            "System"}
                        </td>

                        <td className="py-4 pr-4 text-gray-700">
                          {formatDate(
                            invitation.createdAt,
                          )}
                        </td>

                        <td className="py-4 pr-4 text-gray-700">
                          {formatDate(
                            invitation.expiresAt,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-black text-gray-900">
        {value.toLocaleString()}
      </p>

      <p className="mt-2 text-xs font-semibold text-gray-500">
        {description}
      </p>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-green-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function InvitationStatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    String(status || "unknown")
      .toLowerCase()
      .trim();

  const classes =
    normalized === "redeemed"
      ? "bg-green-100 text-green-800"
      : normalized === "expired"
        ? "bg-orange-100 text-orange-800"
        : normalized === "revoked"
          ? "bg-red-100 text-red-800"
          : "bg-blue-100 text-blue-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black capitalize ${classes}`}
    >
      {normalized.replace(/_/g, " ")}
    </span>
  );
}