"use client";

import { useEffect, useMemo, useState } from "react";

type GeneralLedgerRow = {
  line_id: string;
  journal_entry_id: string;
  entry_number: string;
  entry_date: string;
  source_type: string;
  source_id?: string | null;
  description: string;
  status: string;
  currency_code: string;
  account_code: string;
  account_name: string;
  account_type: string;
  line_description?: string | null;
  debit_amount: number | string | null;
  credit_amount: number | string | null;
};

function formatAmount(value: number | string | null) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function GeneralLedgerPage() {
  const [rows, setRows] = useState<GeneralLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [accountTypeFilter, setAccountTypeFilter] =
    useState("ALL");

  useEffect(() => {
    async function loadGeneralLedger() {
      try {
        const sessionRaw = sessionStorage.getItem(
          "niatube_admin_access",
        );

        if (!sessionRaw) {
          window.location.assign("/financial/access");
          return;
        }

        const session = JSON.parse(sessionRaw);

        const authResponse = await fetch(
          "/api/admin/session/check",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionToken: session.sessionToken,
              requestedPath: "/financial/general-ledger",
            }),
          },
        );

        const authResult = await authResponse.json();

        if (
          !authResponse.ok ||
          !authResult.allowed
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

        const response = await fetch(
          "/api/financial/general-ledger",
          {
            cache: "no-store",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Failed to load the General Ledger.",
          );
        }

        setRows(
          Array.isArray(result) ? result : [],
        );
      } catch (error: unknown) {
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while loading the General Ledger.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadGeneralLedger();
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !query ||
        row.entry_number
          ?.toLowerCase()
          .includes(query) ||
        row.description
          ?.toLowerCase()
          .includes(query) ||
        row.account_code
          ?.toLowerCase()
          .includes(query) ||
        row.account_name
          ?.toLowerCase()
          .includes(query) ||
        row.source_type
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        row.status === statusFilter;

      const matchesAccountType =
        accountTypeFilter === "ALL" ||
        row.account_type === accountTypeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAccountType
      );
    });
  }, [
    rows,
    searchTerm,
    statusFilter,
    accountTypeFilter,
  ]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (accumulator, row) => {
        accumulator.debits += Number(
          row.debit_amount || 0,
        );

        accumulator.credits += Number(
          row.credit_amount || 0,
        );

        return accumulator;
      },
      {
        debits: 0,
        credits: 0,
      },
    );
  }, [filteredRows]);

  return (
    <main className="mx-auto max-w-7xl p-8">
      <h1 className="text-4xl font-bold">
        General Ledger
      </h1>

      <p className="mt-3 max-w-4xl text-gray-600">
        Review posted accounting activity across
        NiaTube financial accounts, journal
        entries, monetization events, treasury
        movements, and creator payouts.
      </p>

      {loading && (
        <p className="mt-8 text-gray-500">
          Loading General Ledger...
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
          <>
            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Ledger Lines
                </p>

                <p className="mt-2 text-3xl font-black">
                  {filteredRows.length}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Total Debits
                </p>

                <p className="mt-2 text-3xl font-black">
                  {formatAmount(totals.debits)}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Total Credits
                </p>

                <p className="mt-2 text-3xl font-black">
                  {formatAmount(totals.credits)}
                </p>
              </div>
            </section>

            <section className="mt-8 grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-3">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search entry, account, description, or source"
                className="rounded-xl border px-4 py-3 text-sm"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value,
                  )
                }
                className="rounded-xl border px-4 py-3 text-sm font-bold"
              >
                <option value="ALL">
                  All Statuses
                </option>
                <option value="DRAFT">
                  Draft
                </option>
                <option value="POSTED">
                  Posted
                </option>
                <option value="VOID">
                  Void
                </option>
              </select>

              <select
                value={accountTypeFilter}
                onChange={(event) =>
                  setAccountTypeFilter(
                    event.target.value,
                  )
                }
                className="rounded-xl border px-4 py-3 text-sm font-bold"
              >
                <option value="ALL">
                  All Account Types
                </option>
                <option value="ASSET">
                  Asset
                </option>
                <option value="LIABILITY">
                  Liability
                </option>
                <option value="EQUITY">
                  Equity
                </option>
                <option value="REVENUE">
                  Revenue
                </option>
                <option value="EXPENSE">
                  Expense
                </option>
              </select>
            </section>

            <div className="mt-8 overflow-x-auto rounded-xl border bg-white shadow-sm">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left">
                      Entry
                    </th>
                    <th className="px-4 py-3 text-left">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right">
                      Credit
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
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        No General Ledger entries
                        are available.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.line_id}
                        className="border-t"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          {new Date(
                            row.entry_date,
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-bold">
                          {row.entry_number}
                        </td>

                        <td className="px-4 py-3">
                          {row.source_type}
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold">
                            {row.account_code}
                          </span>
                          <span className="ml-2 text-gray-600">
                            {row.account_name}
                          </span>
                        </td>

                        <td className="max-w-md px-4 py-3">
                          {row.line_description ||
                            row.description}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatAmount(
                            row.debit_amount,
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatAmount(
                            row.credit_amount,
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {row.currency_code}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {row.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
    </main>
  );
}