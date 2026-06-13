"use client";

import { useState } from "react";


export default function AdminAccessPage() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setChecking(true);

    const cleanCode = code.trim();

    if (!cleanCode) {
      setMessage("Please enter your admin access code.");
      setChecking(false);
      return;
    }

   const response = await fetch("/api/admin/access", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    code: cleanCode,
  }),
});

const result = await response.json();

setChecking(false);

if (!result.success) {
  setMessage(result.error || "Invalid admin access code.");
  return;
}

    sessionStorage.setItem("niatube_admin_access", "granted");
    window.location.href = result.redirectPath || "/admin";
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Access
        </p>

        <h1 className="mt-2 text-3xl font-black text-gray-900">
          Enter Admin Access Code
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          This area is restricted to authorized NiaTube administrators.
        </p>

        <form onSubmit={handleAccess} className="mt-6 space-y-4">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter admin code"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />

          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800 disabled:bg-gray-400"
          >
            {checking ? "Checking..." : "Enter Admin Control Center"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}