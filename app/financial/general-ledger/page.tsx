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
  transaction_currency: string | null;
transaction_amount: number | string | null;

reporting_currency: string | null;
reporting_amount: number | string | null;

exchange_rate: number | string | null;

fx_rate_id: string | null;
fx_rate_source: string | null;
fx_rate_timestamp: string | null;
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

    const journalEntries = useMemo(() => {
    const grouped = new Map<
      string,
      {
        header: GeneralLedgerRow;
        lines: GeneralLedgerRow[];
        totalDebits: number;
        totalCredits: number;
      }
    >();

    for (const row of filteredRows) {
      let entry = grouped.get(
        row.journal_entry_id,
      );

      if (!entry) {
        entry = {
          header: row,
          lines: [],
          totalDebits: 0,
          totalCredits: 0,
        };

        grouped.set(
          row.journal_entry_id,
          entry,
        );
      }

      entry.lines.push(row);

      entry.totalDebits += Number(
        row.debit_amount || 0,
      );

      entry.totalCredits += Number(
        row.credit_amount || 0,
      );
    }

    return Array.from(
      grouped.values(),
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

            <div className="mt-8 space-y-8">
  {journalEntries.length === 0 ? (
    <div className="rounded-xl border bg-white px-4 py-10 text-center text-gray-500 shadow-sm">
      No General Ledger entries are available.
    </div>
  ) : (
    journalEntries.map((entry) => {
      const totalDebits = Number(
        entry.totalDebits.toFixed(2),
      );

      const totalCredits = Number(
        entry.totalCredits.toFixed(2),
      );

      const isBalanced =
        totalDebits === totalCredits;

      const transactionCurrency =
        entry.header.transaction_currency ||
        entry.header.currency_code ||
        "USD";

      const reportingCurrency =
        entry.header.reporting_currency ||
        entry.header.currency_code ||
        "USD";

      const transactionAmount = Number(
        entry.header.transaction_amount ||
          0,
      );

      const reportingAmount = Number(
        entry.header.reporting_amount ||
          totalDebits,
      );

      const exchangeRate = Number(
        entry.header.exchange_rate || 1,
      );

      const hasFxConversion =
        transactionCurrency !==
        reportingCurrency;

      return (
        <section
          key={
            entry.header.journal_entry_id
          }
          className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm"
        >
          <header className="border-b bg-gray-50 px-6 py-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Journal Entry
                </p>

                <p className="mt-1 text-lg font-black text-gray-950">
                  {entry.header.entry_number}
                </p>

                <p className="mt-3 text-sm text-gray-600">
                  {new Date(
                    entry.header.entry_date,
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Source
                </p>

                <p className="mt-1 font-black text-gray-950">
                  {entry.header.source_type}
                </p>

                {entry.header.source_id && (
                  <p className="mt-2 break-all text-xs text-gray-500">
                    Reference:{" "}
                    {entry.header.source_id}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Status
                </p>

                <span className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">
                  {entry.header.status}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Description
              </p>

              <p className="mt-2 font-medium leading-6 text-gray-900">
                {entry.header.description}
              </p>
            </div>

            <div className="mt-5 grid gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs font-bold uppercase text-blue-700">
                  Original Amount
                </p>

                <p className="mt-1 font-black text-gray-950">
                  {formatAmount(
                    transactionAmount,
                  )}{" "}
                  {transactionCurrency}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-blue-700">
                  Reporting Amount
                </p>

                <p className="mt-1 font-black text-gray-950">
                  {formatAmount(
                    reportingAmount,
                  )}{" "}
                  {reportingCurrency}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-blue-700">
                  Exchange Rate
                </p>

                <p className="mt-1 font-black text-gray-950">
                  {hasFxConversion
                    ? exchangeRate.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits:
                            2,
                          maximumFractionDigits:
                            10,
                        },
                      )
                    : "1.00"}
                </p>

                {hasFxConversion && (
                  <p className="mt-1 text-xs text-gray-600">
                    1 {transactionCurrency}
                    {" = "}
                    {exchangeRate.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits:
                          10,
                      },
                    )}{" "}
                    {reportingCurrency}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-blue-700">
                  FX Source
                </p>

                <p className="mt-1 font-black text-gray-950">
                  {entry.header
                    .fx_rate_source ||
                    (hasFxConversion
                      ? "Not recorded"
                      : "IDENTITY")}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase text-blue-700">
                  FX Effective Time
                </p>

                <p className="mt-1 text-sm font-bold text-gray-950">
                  {entry.header
                    .fx_rate_timestamp
                    ? new Date(
                        entry.header
                          .fx_rate_timestamp,
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </header>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left">
                    Account
                  </th>

                  <th className="px-5 py-3 text-left">
                    Accounting Description
                  </th>

                  <th className="px-5 py-3 text-right">
                    Debit
                  </th>

                  <th className="px-5 py-3 text-right">
                    Credit
                  </th>

                  <th className="px-5 py-3 text-center">
                    Reporting Currency
                  </th>
                </tr>
              </thead>

              <tbody>
                {entry.lines.map(
                  (line) => {
                    const debit = Number(
                      line.debit_amount ||
                        0,
                    );

                    const credit = Number(
                      line.credit_amount ||
                        0,
                    );

                    return (
                      <tr
                        key={line.line_id}
                        className="border-t"
                      >
                        <td className="px-5 py-4">
                          <span className="font-black text-gray-950">
                            {
                              line.account_code
                            }
                          </span>

                          <span className="ml-2 text-gray-700">
                            {
                              line.account_name
                            }
                          </span>
                        </td>

                        <td className="max-w-xl px-5 py-4 leading-6 text-gray-700">
                          {line.line_description ||
                            line.description}
                        </td>

                        <td className="px-5 py-4 text-right font-black text-black">
                          {debit > 0
                            ? formatAmount(
                                debit,
                              )
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-right font-black text-green-700">
                          {credit > 0
                            ? formatAmount(
                                credit,
                              )
                            : "—"}
                        </td>

                        <td className="px-5 py-4 text-center font-bold">
                          {
                            reportingCurrency
                          }
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>

              <tfoot className="border-t-2 border-gray-400 bg-gray-50">
                <tr>
                  <td
                    colSpan={2}
                    className="px-5 py-4 text-right font-black"
                  >
                    Journal Totals
                  </td>

                  <td className="px-5 py-4 text-right font-black text-black">
                    {formatAmount(
                      totalDebits,
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-black text-green-700">
                    {formatAmount(
                      totalCredits,
                    )}
                  </td>

                  <td className="px-5 py-4 text-center font-black">
                    {reportingCurrency}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-600">
              <strong>
                Accounting effect:
              </strong>{" "}
              {entry.lines.filter(
                (line) =>
                  Number(
                    line.debit_amount ||
                      0,
                  ) > 0,
              ).length}{" "}
              debit line(s),{" "}
              {entry.lines.filter(
                (line) =>
                  Number(
                    line.credit_amount ||
                      0,
                  ) > 0,
              ).length}{" "}
              credit line(s).
            </div>

            <span
              className={
                isBalanced
                  ? "rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-800"
                  : "rounded-full bg-red-100 px-4 py-2 text-xs font-black text-red-800"
              }
            >
              {isBalanced
                ? "BALANCED"
                : "OUT OF BALANCE"}
            </span>
          </footer>
        </section>
      );
    })
  )}
</div>
          </>
        )}
    </main>
  );
}