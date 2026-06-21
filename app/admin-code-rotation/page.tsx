"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

type AdminCode = {
  code_name: string | null;
  code: string;
  active: boolean;
  redirect_path: string;
  expires_at: string | null;
  last_rotated_at: string | null;
};

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AdminCode[]>([]);
  const [newCodes, setNewCodes] = useState<AdminCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [message, setMessage] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  async function loadCodes() {
    setLoading(true);
    setMessage("");

    try {
      const rawAccess = sessionStorage.getItem("niatube_admin_access");

      if (!rawAccess) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const access = JSON.parse(rawAccess);

      const response = await fetch("/api/admin/codes/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken: access.sessionToken,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setHasAccess(false);
        setMessage(result.error || "Super Admin access required.");
        setLoading(false);
        return;
      }

      setHasAccess(true);
      setCodes(result.codes || []);
      setLoading(false);
    } catch {
      setHasAccess(false);
      setMessage("Could not check Super Admin access.");
      setLoading(false);
    }
  }

  async function rotateCodes() {
    const confirmed = window.confirm(
      "Generate new monthly admin codes?"
    );

    if (!confirmed) return;

    setRotating(true);
    setMessage("");
    setNewCodes([]);

    try {
      const rawAccess = sessionStorage.getItem("niatube_admin_access");

      if (!rawAccess) {
        setMessage("Admin session not found.");
        setRotating(false);
        return;
      }

      const access = JSON.parse(rawAccess);

      const response = await fetch("/api/admin/codes/rotate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken: access.sessionToken,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setMessage(result.error || "Could not rotate admin codes.");
        setRotating(false);
        return;
      }

      setNewCodes(result.codes || []);
      setMessage("New monthly admin codes generated successfully.");
      setRotating(false);
      await loadCodes();
    } catch {
      setMessage("Could not rotate admin codes.");
      setRotating(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setMessage("Code copied.");
  }

  useEffect(() => {
    loadCodes();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-sm font-bold text-gray-600">
            Checking Super Admin access...
          </p>
        </section>
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <section className="mx-auto max-w-md px-6 py-16">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-black text-gray-900">
              Super Admin Access Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Please enter the Super Admin code before managing admin code rotation.
            </p>

            {message && (
              <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
                {message}
              </p>
            )}

            <a
              href="/admin/access"
              className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
            >
              Enter Super Admin Code
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Super Admin
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Admin Code Rotation
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Generate and manage monthly random access codes for NiaTube admin roles.
        </p>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-black text-gray-900">
              Current Active Codes
            </h2>

            <button
              onClick={rotateCodes}
              disabled={rotating}
              className="rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {rotating ? "Generating..." : "Generate New Monthly Codes"}
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {codes.map((item) => (
                  <tr key={item.code} className="border-b">
                    <td className="px-4 py-3 font-black">
                      {item.code_name || "Admin"}
                    </td>

                    <td className="px-4 py-3 font-mono text-xs">
                      {item.code}
                    </td>

                    <td className="px-4 py-3">
                      {item.redirect_path}
                    </td>

                    <td className="px-4 py-3">
                      {item.expires_at
                        ? new Date(item.expires_at).toLocaleString()
                        : "Not available"}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyCode(item.code)}
                        className="rounded-lg border px-3 py-1 text-xs font-bold hover:bg-gray-50"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {newCodes.length > 0 && (
          <div className="mt-8 rounded-3xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-2xl font-black text-green-900">
              Newly Generated Codes
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {newCodes.map((item) => (
                <div key={item.code} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-gray-900">
                    {item.code_name || "Admin"}
                  </p>

                  <p className="mt-3 break-all font-mono text-sm">
                    {item.code}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Opens: {item.redirect_path}
                  </p>

                  <button
                    onClick={() => copyCode(item.code)}
                    className="mt-4 rounded-lg bg-black px-3 py-2 text-xs font-bold text-white hover:bg-gray-800"
                  >
                    Copy Code
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}