export type WalletLedgerEntry = {
  currency_code: string;
  amount: number;
  status?: string | null;
};

export type FxRate = {
  base_currency: string;
  target_currency: string;
  rate: number;
};

export type CurrencyHolding = {
  currency: string;
  balance: number;
  usdEquivalent: number;
};

export type CreatorSettlementSummary = {
  holdings: CurrencyHolding[];
  totalSettlementUSD: number;
  settlementCurrency: string;
  availableWalletBalance: number;
};

export function convertSettlementAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  fxRates: FxRate[]
) {
  if (!amount) return 0;
  if (fromCurrency === toCurrency) return amount;

  const directRate = fxRates.find(
    (rate) =>
      rate.base_currency === fromCurrency &&
      rate.target_currency === toCurrency
  );

  if (directRate) {
    return amount * Number(directRate.rate || 0);
  }

  const inverseRate = fxRates.find(
    (rate) =>
      rate.base_currency === toCurrency &&
      rate.target_currency === fromCurrency
  );

  if (inverseRate) {
    return amount / Number(inverseRate.rate || 1);
  }

  return 0;
}

export function buildCreatorSettlementSummary(
  ledgerEntries: WalletLedgerEntry[],
  fxRates: FxRate[],
  settlementCurrency: string
): CreatorSettlementSummary {
  const completedEntries = ledgerEntries.filter(
    (entry) => !entry.status || entry.status === "completed"
  );

  const balancesByCurrency = completedEntries.reduce<Record<string, number>>(
    (totals, entry) => {
      const currency = entry.currency_code || "UNKNOWN";
      totals[currency] = (totals[currency] || 0) + Number(entry.amount || 0);
      return totals;
    },
    {}
  );

  const holdings = Object.entries(balancesByCurrency).map(
    ([currency, balance]) => ({
      currency,
      balance,
      usdEquivalent: convertSettlementAmount(
        balance,
        currency,
        "USD",
        fxRates
      ),
    })
  );

  const totalSettlementUSD = holdings.reduce(
    (sum, holding) => sum + holding.usdEquivalent,
    0
  );

  const availableWalletBalance = convertSettlementAmount(
    totalSettlementUSD,
    "USD",
    settlementCurrency,
    fxRates
  );

  return {
    holdings,
    totalSettlementUSD,
    settlementCurrency,
    availableWalletBalance,
  };
}