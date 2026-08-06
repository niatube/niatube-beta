"use client";

import { useEffect, useState } from "react";

type TreasuryEntry = {
  id: string;
  created_at: string;
  creator_name: string;
  transaction_type: string;
  reference_id?: string | null;
  gross_amount?: number | null;
  platform_fee?: number | null;
  currency_code: string;
  country?: string | null;
  status?: string | null;
  notes?: string | null;
};

export default function PlatformTreasuryPage() {
  const [treasuryEntries, setTreasuryEntries] = useState<
    TreasuryEntry[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlatformTreasury() {
      try {
        const sessionRaw = sessionStorage.getItem(
          "niatube_admin_access",
        );

        if (!sessionRaw) {
          window.location.assign(
            "/financial/access",
          );
          return;
        }

        const session = JSON.parse(
          sessionRaw,
        );

        const authRes = await fetch(
          "/api/admin/session/check",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              sessionToken:
                session.sessionToken,
              requestedPath:
                "/financial/treasury",
            }),
          },
        );

        const auth =
          await authRes.json();

        if (
          !authRes.ok ||
          !auth.allowed
        ) {
          sessionStorage.removeItem(
            "niatube_admin_access",
          );

          window.location.assign(
            "/financial/access",
          );

          return;
        }

        setAuthorized(true);

        const res = await fetch(
          "/api/financial/treasury",
          {
            cache: "no-store",
          },
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to load Platform Treasury.",
          );
        }

        setTreasuryEntries(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading Platform Treasury.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlatformTreasury();
  }, []);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-4xl font-bold">
        Platform Treasury
      </h1>

      <p className="mt-3 max-w-4xl text-gray-600">
        Review NiaTube platform revenue,
        transaction gross amounts, platform
        fees, currencies, countries, and
        settlement statuses.
      </p>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading Platform Treasury...
        </p>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        authorized &&
        !error && (
          <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left">
                    Creator
                  </th>

                  <th className="px-4 py-3 text-left">
                    Transaction Type
                  </th>

                  <th className="px-4 py-3 text-left">
                    Reference ID
                  </th>

                  <th className="px-4 py-3 text-right">
                    Gross Amount
                  </th>

                  <th className="px-4 py-3 text-right">
                    Platform Fee
                  </th>

                  <th className="px-4 py-3 text-center">
                    Currency
                  </th>

                  <th className="px-4 py-3 text-left">
                    Country
                  </th>

                  <th className="px-4 py-3 text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {treasuryEntries.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No Platform Treasury
                      entries are available.
                    </td>
                  </tr>
                ) : (
                  treasuryEntries.map(
                    (entry) => (
                      <tr
                        key={entry.id}
                        className="border-t"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(
                            entry.created_at,
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          {entry.creator_name}
                        </td>

                        <td className="px-4 py-3">
                          {
                            entry.transaction_type
                          }
                        </td>

                        <td className="max-w-xs break-all px-4 py-3 text-sm text-gray-600">
                          {entry.reference_id ??
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {Number(
                            entry.gross_amount ||
                              0,
                          ).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {Number(
                            entry.platform_fee ||
                              0,
                          ).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {entry.currency_code}
                        </td>

                        <td className="px-4 py-3">
                          {entry.country ??
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {entry.status ??
                            "COMPLETED"}
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}