"use client";

import { useState } from "react";
import Link from "next/link";

type ActivatedAdministrator = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roleLabel: string;
  status: string;
  activatedAt: string;
};

export default function AdminInvitationRedemptionPage() {
  const [email, setEmail] =
    useState("");

  const [code, setCode] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    activatedAdministrator,
    setActivatedAdministrator,
  ] = useState<ActivatedAdministrator | null>(
    null,
  );

  async function redeemInvitation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setActivatedAdministrator(null);

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanCode =
      code.trim().toUpperCase();

    if (!cleanEmail) {
      setMessage(
        "Enter the email address used for your administrator invitation.",
      );
      return;
    }

    if (!cleanCode) {
      setMessage(
        "Enter your one-time administrator invitation code.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/admin/invitations/redeem",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              cleanEmail,

            code:
              cleanCode,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.error ||
            "The administrator invitation could not be redeemed.",
        );

        return;
      }

      setActivatedAdministrator(
        result.administrator as ActivatedAdministrator,
      );

      setCode("");
    } catch (error) {
      console.error(
        "Invitation redemption request failed:",
        error,
      );

      setMessage(
        "The invitation redemption request could not be completed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (activatedAdministrator) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <section className="mx-auto max-w-lg rounded-3xl border-2 border-green-300 bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-green-700">
            Activation Successful
          </p>

          <h1 className="mt-2 text-3xl font-black text-gray-900">
            Welcome to NiaTube Administration
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your administrator identity is now active.
            You may enter the Admin Control Center using
            your registered email and the current monthly
            operational code for your assigned area.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl border border-green-200 bg-green-50 p-5">
            <ActivationDetail
              label="Administrator"
              value={
                activatedAdministrator.fullName
              }
            />

            <ActivationDetail
              label="Email"
              value={
                activatedAdministrator.email
              }
            />

            <ActivationDetail
              label="Assigned Role"
              value={
                activatedAdministrator.roleLabel
              }
            />

            <ActivationDetail
              label="Status"
              value="Active"
            />
          </div>

          <Link
            href="/admin/access"
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
          >
            Continue to Admin Access
          </Link>

          <p className="mt-5 text-xs font-semibold leading-5 text-gray-500">
            Your one-time invitation code has been
            permanently consumed and cannot be used again.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-indigo-700">
          Administrator Onboarding
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Redeem Admin Invitation
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter the email address assigned to your
          invitation and the secure one-time code supplied
          by an authorized NiaTube administrator.
        </p>

        <div className="mt-5 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-bold leading-6 text-yellow-900">
            Invitation codes are single-use and expire
            automatically. Do not share your code.
          </p>
        </div>

        <form
          onSubmit={redeemInvitation}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="redemption-email"
              className="mb-2 block text-sm font-black text-gray-800"
            >
              Invited Administrator Email
            </label>

            <input
              id="redemption-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={submitting}
              placeholder="newadmin@niatube.africa"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="redemption-code"
              className="mb-2 block text-sm font-black text-gray-800"
            >
              One-Time Invitation Code
            </label>

            <input
              id="redemption-code"
              type="password"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              disabled={submitting}
              placeholder="NTA-XXXX-XXXX-XXXX"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm uppercase outline-none focus:border-black focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitting
              ? "Activating Administrator..."
              : "Activate Administrator Account"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-800">
            {message}
          </p>
        )}

        <div className="mt-6 border-t border-gray-200 pt-5">
          <p className="text-xs font-semibold leading-5 text-gray-500">
            Already activated?
          </p>

          <Link
            href="/admin/access"
            className="mt-2 inline-flex text-sm font-black text-indigo-700 hover:text-indigo-900"
          >
            Go to Admin Access
          </Link>
        </div>
      </section>
    </main>
  );
}

function ActivationDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}