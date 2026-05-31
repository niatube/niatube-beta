"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase-browser";

type Tip = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  gross_amount?: number;
  platform_fee?: number;
  net_amount?: number;
  fee_rate?: number;
  message?: string;
  created_at?: string;
};

type PayoutRequest = {
  id: string;
  creator_name: string;
  amount: number;
  currency_code?: string;
  status?: string;
  created_at?: string;
};

type FxRate = {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  updated_at?: string;
  source?: string | null;
};

type CurrencyTotals = {
  currency: string;
  gross: number;
  fees: number;
  net: number;
  count: number;
};

function formatAmount(value: number) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fxRates: FxRate[]
) {
  if (fromCurrency === toCurrency) return amount;

  const rateRow = fxRates.find(
    (rate) =>
      rate.base_currency === fromCurrency &&
      rate.target_currency === toCurrency
  );

  if (!rateRow) return 0;

  return amount * Number(rateRow.rate || 0);
}

export default function AdminFinancePage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [fxRates, setFxRates] = useState<FxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [reportPeriod, setReportPeriod] = useState<
    "all" | "monthly" | "quarterly" | "semiannual" | "annual"
  >("all");

  const [reportingCurrency, setReportingCurrency] =
    useState<"USD" | "EUR">("USD");

  async function loadFinanceData() {
    setLoading(true);
    setMessage("");

    const { data: tipsData, error: tipsError } = await supabase
      .from("tips")
      .select("*")
      .order("created_at", { ascending: false });

    if (tipsError) {
      console.error(tipsError);
      setMessage("Could not load tips finance data.");
      setLoading(false);
      return;
    }

    const { data: payoutData, error: payoutError } = await supabase
      .from("payout_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (payoutError) {
      console.error(payoutError);
      setMessage("Could not load payout request data.");
      setLoading(false);
      return;
    }

    const { data: fxData, error: fxError } = await supabase
      .from("fx_rates")
      .select("*");

    if (fxError) {
      console.error(fxError);
      setMessage("Finance loaded, but FX rates could not be loaded.");
    }

    setTips((tipsData || []) as Tip[]);
    setPayouts((payoutData || []) as PayoutRequest[]);
    setFxRates((fxData || []) as FxRate[]);
    setLoading(false);
  }

  useEffect(() => {
    loadFinanceData();
  }, []);

  const filteredTips = useMemo(() => {
    const now = new Date();

    return tips.filter((tip) => {
      if (reportPeriod === "all") return true;
      if (!tip.created_at) return false;

      const tipDate = new Date(tip.created_at);

      switch (reportPeriod) {
        case "monthly":
          return (
            tipDate.getMonth() === now.getMonth() &&
            tipDate.getFullYear() === now.getFullYear()
          );

        case "quarterly": {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const tipQuarter = Math.floor(tipDate.getMonth() / 3);

          return (
            tipQuarter === currentQuarter &&
            tipDate.getFullYear() === now.getFullYear()
          );
        }

        case "semiannual": {
          const currentHalf = now.getMonth() < 6 ? 1 : 2;
          const tipHalf = tipDate.getMonth() < 6 ? 1 : 2;

          return (
            currentHalf === tipHalf &&
            tipDate.getFullYear() === now.getFullYear()
          );
        }

        case "annual":
          return tipDate.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }, [tips, reportPeriod]);

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, CurrencyTotals> = {};

    filteredTips.forEach((tip) => {
      const currency = tip.currency_code || "UNKNOWN";
      const gross = Number(tip.gross_amount ?? tip.amount ?? 0);
      const fees = Number(tip.platform_fee ?? 0);
      const net = Number(tip.net_amount ?? tip.amount ?? 0);

      if (!totals[currency]) {
        totals[currency] = {
          currency,
          gross: 0,
          fees: 0,
          net: 0,
          count: 0,
        };
      }

      totals[currency].gross += gross;
      totals[currency].fees += fees;
      totals[currency].net += net;
      totals[currency].count += 1;
    });

    return Object.values(totals).sort((a, b) =>
      a.currency.localeCompare(b.currency)
    );
  }, [filteredTips]);

  const unifiedTotals = useMemo(() => {
    return totalsByCurrency.reduce(
      (sum, item) => {
        return {
          gross:
            sum.gross +
            convertAmount(
              item.gross,
              item.currency,
              reportingCurrency,
              fxRates
            ),
          fees:
            sum.fees +
            convertAmount(
              item.fees,
              item.currency,
              reportingCurrency,
              fxRates
            ),
          net:
            sum.net +
            convertAmount(item.net, item.currency, reportingCurrency, fxRates),
        };
      },
      { gross: 0, fees: 0, net: 0 }
    );
  }, [totalsByCurrency, reportingCurrency, fxRates]);

  const pendingPayouts = payouts.filter(
    (payout) => (payout.status || "pending") === "pending"
  );

  const pendingPayoutsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};

    pendingPayouts.forEach((payout) => {
      const currency = payout.currency_code || "UNKNOWN";
      totals[currency] =
        (totals[currency] || 0) + Number(payout.amount || 0);
    });

    return Object.entries(totals)
      .map(([currency, amount]) => ({ currency, amount }))
      .sort((a, b) => a.currency.localeCompare(b.currency));
  }, [pendingPayouts]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-black uppercase tracking-wide text-yellow-600">
          Admin Finance
        </p>

        <h1 className="mt-2 text-4xl font-black text-gray-900">
          NiaTube Finance Report v1
        </h1>

        <p className="mt-3 max-w-4xl text-gray-600">
          Platform finance overview for multi-currency tips, NiaTube platform
          fees, creator net earnings, and pending payout obligations.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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

          <label className="text-sm font-bold text-gray-700">
            Reporting Currency
          </label>

          <select
            value={reportingCurrency}
            onChange={(e) =>
              setReportingCurrency(e.target.value as "USD" | "EUR")
            }
            className="rounded-xl border px-4 py-2 text-sm font-bold"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {message && (
          <p className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm font-bold text-yellow-800">
            {message}
          </p>
        )}
         <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
  <h2 className="text-xl font-black text-gray-900">
    FX Status
  </h2>

  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <div>
      <p className="text-xs font-bold uppercase text-gray-500">
        Source
      </p>
      <p className="mt-1 text-lg font-black">
        {fxRates[0]?.source || "Unknown"}
      </p>
    </div>

    <div>
      <p className="text-xs font-bold uppercase text-gray-500">
        Base Currency
      </p>
      <p className="mt-1 text-lg font-black">USD</p>
    </div>

    <div>
      <p className="text-xs font-bold uppercase text-gray-500">
        Rates Loaded
      </p>
      <p className="mt-1 text-lg font-black">
        {fxRates.length}
      </p>
    </div>

    <div>
      <p className="text-xs font-bold uppercase text-gray-500">
        Last Updated
      </p>
      <p className="mt-1 text-sm font-bold">
        {fxRates[0]?.updated_at
          ? new Date(
              fxRates[0].updated_at
            ).toLocaleString()
          : "Not available"}
      </p>
    </div>

    <div>
      <p className="text-xs font-bold uppercase text-gray-500">
        Status
      </p>
      <p className="mt-1 text-lg font-black text-green-700">
        Healthy
      </p>
    </div>
  </div>
</div>

        {loading ? (
          <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
            Loading finance report...
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Total Tip Transactions
                </p>
                <p className="mt-2 text-3xl font-black">
                  {filteredTips.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Currencies Active
                </p>
                <p className="mt-2 text-3xl font-black">
                  {totalsByCurrency.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Pending Payout Requests
                </p>
                <p className="mt-2 text-3xl font-black">
                  {pendingPayouts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-gray-500">
                  Reporting Currency
                </p>
                <p className="mt-2 text-3xl font-black">
                  {reportingCurrency}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Unified Reporting View
              </h2>

              <p className="mt-1 text-sm text-gray-700">
                This converts multi-currency finance activity into{" "}
                {reportingCurrency} for investor, board, audit, and grant
                reporting. Creator wallets remain in local currencies.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-500">
                    Gross Tips
                  </p>
                  <p className="mt-2 text-3xl font-black text-gray-900">
                    {reportingCurrency} {formatAmount(unifiedTotals.gross)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-500">
                    NiaTube Fees
                  </p>
                  <p className="mt-2 text-3xl font-black text-green-700">
                    {reportingCurrency} {formatAmount(unifiedTotals.fees)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-500">
                    Creator Net Earnings
                  </p>
                  <p className="mt-2 text-3xl font-black text-gray-900">
                    {reportingCurrency} {formatAmount(unifiedTotals.net)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-gray-600">
                Missing FX rates are treated as zero until added in the FX
                manager.
              </p>
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Tip Revenue by Currency
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Amounts are grouped by original currency. NiaTube does not
                combine currencies until an approved FX/NiaCredit conversion is
                applied.
              </p>

              {totalsByCurrency.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No tip transactions recorded yet.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Transactions</th>
                        <th className="px-4 py-3">Gross Tips</th>
                        <th className="px-4 py-3">NiaTube Fees</th>
                        <th className="px-4 py-3">Creator Net Earnings</th>
                      </tr>
                    </thead>

                    <tbody>
                      {totalsByCurrency.map((item) => (
                        <tr key={item.currency} className="border-b">
                          <td className="px-4 py-3 font-black">
                            {item.currency}
                          </td>
                          <td className="px-4 py-3">{item.count}</td>
                          <td className="px-4 py-3">
                            {formatAmount(item.gross)}
                          </td>
                          <td className="px-4 py-3 font-bold text-green-700">
                            {formatAmount(item.fees)}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {formatAmount(item.net)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Pending Payout Obligations
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                These are pending payout requests grouped by currency.
              </p>

              {pendingPayoutsByCurrency.length === 0 ? (
                <p className="mt-4 text-gray-500">
                  No pending payout obligations.
                </p>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {pendingPayoutsByCurrency.map((item) => (
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
                        Pending payout balance
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900">
                Recent Tip Transactions
              </h2>

              {filteredTips.length === 0 ? (
                <p className="mt-4 text-gray-500">No recent tips.</p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Creator</th>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Gross</th>
                        <th className="px-4 py-3">Fee</th>
                        <th className="px-4 py-3">Net</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredTips.slice(0, 25).map((tip) => (
                        <tr key={tip.id} className="border-b">
                          <td className="px-4 py-3 text-gray-500">
                            {tip.created_at
                              ? new Date(tip.created_at).toLocaleString()
                              : "Not available"}
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {tip.creator_name}
                          </td>
                          <td className="px-4 py-3">
                            {tip.currency_code || "UNKNOWN"}
                          </td>
                          <td className="px-4 py-3">
                            {formatAmount(
                              Number(tip.gross_amount ?? tip.amount ?? 0)
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-green-700">
                            {formatAmount(Number(tip.platform_fee ?? 0))}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            {formatAmount(
                              Number(tip.net_amount ?? tip.amount ?? 0)
                            )}
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