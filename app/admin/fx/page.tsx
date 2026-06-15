"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type FxRate = {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  updated_at?: string;
};

export default function AdminFxPage() {
  const [rates, setRates] = useState<FxRate[]>([]);
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [targetCurrency, setTargetCurrency] = useState("NGN");
  const [rate, setRate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  async function loadRates() {
    setLoading(true);

    const { data, error } = await supabase
      .from("fx_rates")
      .select("*")
      .order("base_currency", { ascending: true })
      .order("target_currency", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Could not load FX rates.");
      setLoading(false);
      return;
    }

    setRates((data || []) as FxRate[]);
    setLoading(false);
  }

  useEffect(() => {
  async function checkFxAccess() {
    const rawAccess = sessionStorage.getItem("niatube_admin_access");

    if (!rawAccess) {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
      return;
    }

    try {
      const access = JSON.parse(rawAccess);

      const response = await fetch("/api/admin/session/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionToken: access.sessionToken,
          requestedPath: "/admin/fx",
        }),
      });

      const result = await response.json();

      if (!result.allowed) {
        setHasAccess(false);
        setAccessChecked(true);
        setLoading(false);
        return;
      }

      setHasAccess(true);
      setAccessChecked(true);
      await loadRates();
    } catch {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
    }
  }

  checkFxAccess();
}, []);

  async function saveRate(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const cleanBase = baseCurrency.trim().toUpperCase();
    const cleanTarget = targetCurrency.trim().toUpperCase();
    const numericRate = Number(rate);

    if (!cleanBase || !cleanTarget || !numericRate || numericRate <= 0) {
      setMessage("Please enter a valid base, target, and rate.");
      return;
    }

    const existing = rates.find(
      (item) =>
        item.base_currency === cleanBase &&
        item.target_currency === cleanTarget
    );

    if (existing) {
      const { error } = await supabase
        .from("fx_rates")
        .update({
          rate: numericRate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error(error);
        setMessage("FX rate update failed.");
        return;
      }

      setMessage(`Updated ${cleanBase} → ${cleanTarget}.`);
    } else {
      const { error } = await supabase.from("fx_rates").insert([
        {
          base_currency: cleanBase,
          target_currency: cleanTarget,
          rate: numericRate,
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error(error);
        setMessage("FX rate creation failed.");
        return;
      }

      setMessage(`Added ${cleanBase} → ${cleanTarget}.`);
    }

    setRate("");
    await loadRates();
  }

  async function deleteRate(id: string) {
    const confirmed = window.confirm("Delete this FX rate?");
    if (!confirmed) return;

    const { error } = await supabase.from("fx_rates").delete().eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Could not delete FX rate.");
      return;
    }

    setMessage("FX rate deleted.");
    await loadRates();
  }


  if (!accessChecked) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <p className="text-sm font-bold text-gray-600">
        Checking FX admin access...
      </p>
    </main>
  );
}

if (!hasAccess) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">
          FX Admin Access Required
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Please enter the Super Admin code before opening FX Management.
        </p>

        <a
          href="/admin/access"
          className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
        >
          Enter Admin Code
        </a>
      </section>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin FX Control Room
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          FX Rates Manager
        </h1>

        <p className="mt-3 max-w-3xl text-gray-600">
          Manage exchange rates used for future wallet balances, NiaCredit
          conversion, payout estimates, and cross-currency creator monetization.
        </p>

        <form
          onSubmit={saveRate}
          className="mt-8 grid gap-4 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-4"
        >
          <input
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            placeholder="Base e.g. USD"
            className="rounded-xl border px-4 py-3 text-sm font-bold uppercase"
          />

          <input
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            placeholder="Target e.g. NGN"
            className="rounded-xl border px-4 py-3 text-sm font-bold uppercase"
          />

          <input
            type="number"
            step="0.000001"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Rate"
            className="rounded-xl border px-4 py-3 text-sm"
          />

          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-black text-white hover:bg-gray-800"
          >
            Save FX Rate
          </button>
        </form>

        {message && (
          <p className="mt-5 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-gray-800">
            {message}
          </p>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900">
            Current FX Rates
          </h2>

          {loading ? (
            <p className="mt-4 text-gray-500">Loading FX rates...</p>
          ) : rates.length === 0 ? (
            <p className="mt-4 text-gray-500">No FX rates saved yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3">Base</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {rates.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="px-4 py-3 font-black">
                        {item.base_currency}
                      </td>
                      <td className="px-4 py-3 font-black">
                        {item.target_currency}
                      </td>
                      <td className="px-4 py-3">{item.rate}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {item.updated_at
                          ? new Date(item.updated_at).toLocaleString()
                          : "Not available"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteRate(item.id)}
                          className="rounded-lg border border-red-500 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}