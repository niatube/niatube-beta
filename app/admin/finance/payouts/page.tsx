"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type PayoutRequest = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  status?: string;
  created_at?: string;
};

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export default function AdminFinancePayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
const [accessChecked, setAccessChecked] = useState(false);
const [hasAccess, setHasAccess] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<
  "all" | "monthly" | "quarterly" | "semiannual" | "annual"
>("all");

  async function loadPayouts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payout_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Could not load payout requests.");
      setLoading(false);
      return;
    }

    setPayouts((data || []) as PayoutRequest[]);
    setLoading(false);
  }

 useEffect(() => {
  async function checkPayoutAccess() {
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
          requestedPath: "/admin/finance/payouts",
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
      await loadPayouts();
    } catch {
      setHasAccess(false);
      setAccessChecked(true);
      setLoading(false);
    }
  }

  checkPayoutAccess();
}, []);
  const filteredPayouts = useMemo(() => {
  const now = new Date();

  return payouts.filter((payout) => {
    if (!payout.created_at) return false;

    const payoutDate = new Date(payout.created_at);

    switch (reportPeriod) {
      case "monthly":
       if (!accessChecked) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <p className="text-sm font-bold text-gray-600">
        Checking payout admin access...
      </p>
    </main>
  );
}

if (!hasAccess) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <section className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-black text-gray-900">
          Payout Admin Access Required
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Please enter a valid payout admin code before opening the Payout Dashboard.
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
          payoutDate.getMonth() === now.getMonth() &&
          payoutDate.getFullYear() === now.getFullYear()
        );

      case "quarterly": {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const payoutQuarter = Math.floor(
          payoutDate.getMonth() / 3
        );

        return (
          payoutQuarter === currentQuarter &&
          payoutDate.getFullYear() === now.getFullYear()
        );
      }

      case "semiannual": {
        const currentHalf = now.getMonth() < 6 ? 1 : 2;
        const payoutHalf = payoutDate.getMonth() < 6 ? 1 : 2;

        return (
          currentHalf === payoutHalf &&
          payoutDate.getFullYear() === now.getFullYear()
        );
      }

      case "annual":
        return (
          payoutDate.getFullYear() === now.getFullYear()
        );

      default:
        return true;
    }
  });
}, [payouts, reportPeriod]);

  const pendingPayouts = filteredPayouts.filter(
    (p) => (p.status || "pending") === "pending"
  );

  const approvedPayouts = filteredPayouts.filter(
    (p) => p.status === "approved"
  );

  const paidPayouts = filteredPayouts.filter(
    (p) => p.status === "paid"
  );

  const rejectedPayouts = filteredPayouts.filter(
    (p) => p.status === "rejected"
  );

  const liabilitiesByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};

    pendingPayouts.forEach((payout) => {
      const currency = payout.currency_code || "UNKNOWN";

      totals[currency] =
        (totals[currency] || 0) +
        Number(payout.amount || 0);
    });

    return Object.entries(totals)
      .map(([currency, amount]) => ({
        currency,
        amount,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [pendingPayouts]);

  const disbursedByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};

    paidPayouts.forEach((payout) => {
      const currency = payout.currency_code || "UNKNOWN";

      totals[currency] =
        (totals[currency] || 0) +
        Number(payout.amount || 0);
    });

    return Object.entries(totals)
      .map(([currency, amount]) => ({
        currency,
        amount,
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [paidPayouts]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Finance
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          Payout & Disbursement Dashboard
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Monitor creator payout obligations, approved requests,
          completed disbursements, and settlement liabilities.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
  <label className="text-sm font-bold text-gray-700">
    Report Period
  </label>

  <select
    value={reportPeriod}
    onChange={(e) =>
      setReportPeriod(
        e.target.value as
          | "all"
          | "monthly"
          | "quarterly"
          | "semiannual"
          | "annual"
      )
    }
    className="rounded-xl border px-4 py-2 text-sm font-bold"
  >
    <option value="all">All Time</option>
    <option value="monthly">Monthly</option>
    <option value="quarterly">Quarterly</option>
    <option value="semiannual">Semi-Annual</option>
    <option value="annual">Annual</option>
  </select>
</div>

        {message && (
          <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
            {message}
          </p>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading payout report...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Pending Requests
                </p>
                <p className="mt-2 text-3xl font-black">
                  {pendingPayouts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Approved Requests
                </p>
                <p className="mt-2 text-3xl font-black">
                  {approvedPayouts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Paid Disbursements
                </p>
                <p className="mt-2 text-3xl font-black">
                  {paidPayouts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Rejected Requests
                </p>
                <p className="mt-2 text-3xl font-black">
                  {rejectedPayouts.length}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Outstanding Liabilities by Currency
              </h2>

              {liabilitiesByCurrency.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No outstanding liabilities.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {liabilitiesByCurrency.map((item) => (
                    <div
                      key={item.currency}
                      className="rounded-2xl border bg-gray-50 p-5"
                    >
                      <p className="text-sm font-bold text-gray-500">
                        {item.currency}
                      </p>

                      <p className="mt-2 text-3xl font-black text-gray-900">
                        {formatAmount(item.amount)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Pending settlement obligation
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Total Disbursed by Currency
              </h2>

              {disbursedByCurrency.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No completed disbursements yet.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {disbursedByCurrency.map((item) => (
                    <div
                      key={item.currency}
                      className="rounded-2xl border bg-green-50 p-5"
                    >
                      <p className="text-sm font-bold text-gray-500">
                        {item.currency}
                      </p>

                      <p className="mt-2 text-3xl font-black text-green-700">
                        {formatAmount(item.amount)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Paid to creators
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Recent Payout Activity
              </h2>

              {payouts.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No payout activity yet.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Creator</th>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {payouts.slice(0, 50).map((payout) => (
                        <tr key={payout.id} className="border-b">
                          <td className="px-4 py-3 text-gray-500">
                            {payout.created_at
                              ? new Date(
                                  payout.created_at
                                ).toLocaleString()
                              : "Not available"}
                          </td>

                          <td className="px-4 py-3 font-bold">
                            {payout.creator_name}
                          </td>

                          <td className="px-4 py-3">
                            {payout.currency_code || "UNKNOWN"}
                          </td>

                          <td className="px-4 py-3">
                            {formatAmount(payout.amount)}
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">
                              {payout.status || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}