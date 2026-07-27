"use client";

import { useEffect, useState } from "react";

import {
  calculateNetAmount,
  calculatePlatformFee,
} from "@/lib/creator-economy";

type SuperSupportTransaction = {
  id: string;
  created_at: string;
  creator_name: string;
  supporter_name: string | null;
  amount: number | string;
  currency_code: string;
  payment_status: string | null;
  tier?: string | null;
  message?: string | null;
  live_video_id?: string | null;
};

export default function SuperSupportLedgerPage() {
  const [transactions, setTransactions] = useState<
    SuperSupportTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const sessionRaw = sessionStorage.getItem(
          "niatube_admin_access",
        );

        if (!sessionRaw) {
          setError(
            "Administrator session not found. Please sign in through the Admin Control Center.",
          );
          return;
        }

        let session: {
          sessionToken?: string;
        };

        try {
          session = JSON.parse(sessionRaw);
        } catch {
          setError(
            "The administrator session is invalid. Please sign in again.",
          );
          return;
        }

        if (!session.sessionToken) {
          setError(
            "Administrator session token not found. Please sign in again.",
          );
          return;
        }

        const authResponse = await fetch(
          "/api/admin/session/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionToken: session.sessionToken,
              requestedPath:
                "/financial/super-support",
            }),
          },
        );

        const authResult = await authResponse.json();

        if (
          !authResponse.ok ||
          !authResult.allowed
        ) {
          setError(
            authResult.error ||
              "You are not authorized to access the Super Support Ledger.",
          );
          return;
        }

        setAuthorized(true);

        const ledgerResponse = await fetch(
          "/api/super-support",
          {
            cache: "no-store",
          },
        );

        const ledgerResult =
          await ledgerResponse.json();

        if (!ledgerResponse.ok) {
          throw new Error(
            ledgerResult.error ||
              "Failed to load Super Support transactions.",
          );
        }

        setTransactions(
          Array.isArray(ledgerResult)
            ? ledgerResult
            : [],
        );
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading the Super Support Ledger.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-4xl font-bold">
        Super Support Ledger
      </h1>

      <p className="mt-3 text-gray-600">
        Review all completed Super Support
        transactions, creator earnings, and
        platform revenue.
      </p>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading Super Support ledger...
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
                    Supporter
                  </th>

                  <th className="px-4 py-3 text-right">
                    Gross Support
                  </th>

                  <th className="px-4 py-3 text-right">
                    Platform Fee
                  </th>

                  <th className="px-4 py-3 text-right">
                    Creator Net
                  </th>

                  <th className="px-4 py-3 text-center">
                    Currency
                  </th>

                  <th className="px-4 py-3 text-center">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No Super Support
                      transactions available.
                    </td>
                  </tr>
                ) : (
                  transactions.map(
                    (transaction) => {
                      const grossAmount =
                        Number(
                          transaction.amount ||
                            0,
                        );

                      const platformFee =
                        calculatePlatformFee(
                          grossAmount,
                        );

                      const creatorNet =
                        calculateNetAmount(
                          grossAmount,
                        );

                      return (
                        <tr
                          key={transaction.id}
                          className="border-t"
                        >
                          <td className="whitespace-nowrap px-4 py-3">
                            {new Date(
                              transaction.created_at,
                            ).toLocaleString()}
                          </td>

                          <td className="px-4 py-3">
                            {transaction.creator_name}
                          </td>

                          <td className="px-4 py-3">
                            {transaction.supporter_name ||
                              "Viewer"}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {grossAmount.toFixed(
                              2,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {platformFee.toFixed(
                              2,
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {creatorNet.toFixed(
                              2,
                            )}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {transaction.currency_code ||
                              "USD"}
                          </td>

                          <td className="px-4 py-3 text-center capitalize">
                            {transaction.payment_status ||
                              "completed"}
                          </td>
                        </tr>
                      );
                    },
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
    </main>
  );
}