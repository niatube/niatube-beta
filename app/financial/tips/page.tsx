"use client";

import { useEffect, useState } from "react";

type Tip = {
  id: string;
  created_at: string;
  creator_name: string;
  viewer_id?: string | null;
  gross_amount?: number | null;
platform_fee?: number | null;
net_amount?: number | null;
  currency_code: string;
  status?: string | null;
};

export default function TipsLedgerPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTips() {
      try {
        const sessionRaw = sessionStorage.getItem(
          "niatube_admin_access",
        );

        if (!sessionRaw) {
          setError("Administrator session not found.");
          setLoading(false);
          return;
        }

        const session = JSON.parse(sessionRaw);

        const authRes = await fetch(
          "/api/admin/session/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionToken: session.sessionToken,
              requestedPath: "/financial/tips",
            }),
          },
        );

        const auth = await authRes.json();

        if (!auth.allowed) {
          setError("You are not authorized to access this ledger.");
          setLoading(false);
          return;
        }

        setAuthorized(true);

        const res = await fetch("/api/tips");

        if (!res.ok) {
          throw new Error("Failed to load Tip ledger.");
        }

        const data = await res.json();

        setTips(data ?? []);
      } catch (err: any) {
        setError(err.message || "Unexpected error.");
      } finally {
        setLoading(false);
      }
    }

    loadTips();
  }, []);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-4xl font-bold">
        Tips Ledger
      </h1>

      <p className="mt-3 text-gray-600">
        Review all completed Tip transactions,
        creator earnings, and platform revenue.
      </p>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading Tip ledger...
        </p>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading && authorized && !error && (
        <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Creator</th>
                <th className="px-4 py-3 text-left">Supporter</th>
                <th className="px-4 py-3 text-right">Gross Tip</th>
                <th className="px-4 py-3 text-right">Platform Fee</th>
                <th className="px-4 py-3 text-right">Creator Net</th>
                <th className="px-4 py-3 text-center">Currency</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {tips.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No Tip transactions available.
                  </td>
                </tr>
              ) : (
                tips.map((tip) => (
                  <tr
                    key={tip.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {new Date(
                        tip.created_at,
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      {tip.creator_name}
                    </td>

                    <td className="px-4 py-3">
                      {tip.viewer_id ??
                        "Anonymous"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {Number(tip.gross_amount || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {Number(tip.platform_fee || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {Number(tip.net_amount || 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {tip.currency_code}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {tip.status ??
                        "Completed"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}