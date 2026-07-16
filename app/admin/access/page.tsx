"use client";

import { useState } from "react";

export default function AdminAccessPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleAccess(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setChecking(true);

    const cleanEmail = email
      .trim()
      .toLowerCase();

    const cleanCode = code.trim();

    if (!cleanEmail) {
      setMessage(
        "Please enter your administrator email address.",
      );
      setChecking(false);
      return;
    }

    if (!cleanCode) {
      setMessage(
        "Please enter your monthly administrator code.",
      );
      setChecking(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/access",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            code: cleanCode,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.error ||
            "Administrator access could not be verified.",
        );

        setChecking(false);
        return;
      }

      sessionStorage.setItem(
        "niatube_admin_access",
        JSON.stringify({
          granted: true,

          sessionToken:
            result.sessionToken,

          adminId:
            result.adminId,

          adminEmail:
            result.adminEmail,

          adminName:
            result.adminName,

          adminRole:
            result.adminRole,

          codeName:
            result.codeName,

          redirectPath:
            result.redirectPath ||
            "/admin",

          expiresAt:
            result.expiresAt,

          grantedAt:
            new Date().toISOString(),
        }),
      );

      window.location.assign(
        result.redirectPath ||
          "/admin",
      );
    } catch (error) {
      console.error(
        "Administrator access request failed:",
        error,
      );

      setMessage(
        "The administrator access request could not be completed. Please try again.",
      );

      setChecking(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          NiaTube Administration
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Admin Control Center Access
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Enter your registered administrator
          email and the current monthly
          operational code assigned to your
          administrative area.
        </p>

        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-bold leading-6 text-blue-900">
            Access requires both an active
            administrator identity and a valid
            operational code.
          </p>
        </div>

        <form
          onSubmit={handleAccess}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-black text-gray-800"
            >
              Administrator Email
            </label>

            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@niatube.africa"
              disabled={checking}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-code"
              className="mb-2 block text-sm font-black text-gray-800"
            >
              Monthly Administrator Code
            </label>

            <input
              id="admin-code"
              type="password"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              placeholder="Enter current admin code"
              disabled={checking}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {checking
              ? "Verifying Administrator..."
              : "Enter Admin Control Center"}
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-700">
            {message}
          </p>
        )}

        <p className="mt-6 text-xs font-semibold leading-5 text-gray-500">
          Administrator sessions are restricted
          to this browser tab and automatically
          expire after 30 minutes.
        </p>
      </section>
    </main>
  );
}

