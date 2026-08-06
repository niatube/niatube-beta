import {
  normalizeCurrencyCode,
} from "@/lib/creator-economy";

type SupabaseAdminClient = any;

export const REPORTING_CURRENCY = "USD";

export type FxRateRecord = {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number | string;
  updated_at: string;
  source: string | null;
};

export type ConvertToReportingCurrencyInput = {
  supabaseAdmin: SupabaseAdminClient;

  amount: number;
  transactionCurrency: string;

  reportingCurrency?: string;
};

export type FxConversionResult = {
  fxRateId: string | null;

  transactionCurrency: string;
  reportingCurrency: string;

  transactionAmount: number;
  reportingAmount: number;

  exchangeRate: number;

  rateSource: string;
  rateTimestamp: string;

  rateDirection:
    | "IDENTITY"
    | "DIRECT"
    | "INVERSE";

  usedFallback: boolean;
};


function roundMoney(value: number) {
  return Number(
    Number(value || 0).toFixed(2),
  );
}

function normalizeRate(value: number | string) {
  const rate = Number(value);

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    throw new Error(
      "FX rate must be a positive number.",
    );
  }

  return rate;
}

async function findLatestDirectRate({
  supabaseAdmin,
  baseCurrency,
  targetCurrency,
}: {
  supabaseAdmin: SupabaseAdminClient;
  baseCurrency: string;
  targetCurrency: string;
}): Promise<FxRateRecord | null> {
  const { data, error } =
    await supabaseAdmin
      .from("fx_rates")
      .select(
        "id, base_currency, target_currency, rate, updated_at, source",
      )
      .eq(
        "base_currency",
        baseCurrency,
      )
      .eq(
        "target_currency",
        targetCurrency,
      )
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      error.message ||
        `Failed to load ${baseCurrency}/${targetCurrency} FX rate.`,
    );
  }

  return data as FxRateRecord | null;
}



export async function convertToReportingCurrency({
  supabaseAdmin,
  amount,
  transactionCurrency,
  reportingCurrency =
    REPORTING_CURRENCY,
}: ConvertToReportingCurrencyInput): Promise<FxConversionResult> {
  if (!supabaseAdmin) {
    throw new Error(
      "Supabase administrator client is required for FX conversion.",
    );
  }

  const safeAmount =
    Number(amount || 0);

  if (
    !Number.isFinite(safeAmount) ||
    safeAmount < 0
  ) {
    throw new Error(
      "FX conversion amount must be a non-negative number.",
    );
  }

  const normalizedTransactionCurrency =
    normalizeCurrencyCode(
      transactionCurrency,
    );

  const normalizedReportingCurrency =
    normalizeCurrencyCode(
      reportingCurrency,
    );

  if (
    normalizedTransactionCurrency ===
    normalizedReportingCurrency
  ) {
    return {
      fxRateId: null,

      transactionCurrency:
        normalizedTransactionCurrency,

      reportingCurrency:
        normalizedReportingCurrency,

      transactionAmount:
        roundMoney(safeAmount),

      reportingAmount:
        roundMoney(safeAmount),

      exchangeRate: 1,

      rateSource:
        "IDENTITY",

      rateTimestamp:
        new Date().toISOString(),

      rateDirection:
        "IDENTITY",

      usedFallback:
        false,
    };
  }

  /*
   * First preference:
   * direct transaction-currency-to-reporting-currency rate.
   *
   * Example:
   * NGN -> USD
   */
  const directRate =
    await findLatestDirectRate({
      supabaseAdmin,

      baseCurrency:
        normalizedTransactionCurrency,

      targetCurrency:
        normalizedReportingCurrency,
    });

  if (directRate) {
    const exchangeRate =
      normalizeRate(directRate.rate);

    return {
      fxRateId:
        directRate.id,

      transactionCurrency:
        normalizedTransactionCurrency,

      reportingCurrency:
        normalizedReportingCurrency,

      transactionAmount:
        roundMoney(safeAmount),

      reportingAmount:
        roundMoney(
          safeAmount *
            exchangeRate,
        ),

      exchangeRate,

      rateSource:
        directRate.source ||
        "DATABASE",

      rateTimestamp:
        directRate.updated_at,

      rateDirection:
        "DIRECT",

      usedFallback:
        false,
    };
  }

  /*
   * Second preference:
   * invert the stored reporting-to-transaction rate.
   *
   * Example:
   * Stored USD -> KES = 129
   * Required KES -> USD = 1 / 129
   */
  const inverseRate =
    await findLatestDirectRate({
      supabaseAdmin,

      baseCurrency:
        normalizedReportingCurrency,

      targetCurrency:
        normalizedTransactionCurrency,
    });

  if (inverseRate) {
    const storedRate =
      normalizeRate(inverseRate.rate);

    const exchangeRate =
      1 / storedRate;

    return {
      fxRateId:
        inverseRate.id,

      transactionCurrency:
        normalizedTransactionCurrency,

      reportingCurrency:
        normalizedReportingCurrency,

      transactionAmount:
        roundMoney(safeAmount),

      reportingAmount:
        roundMoney(
          safeAmount *
            exchangeRate,
        ),

      exchangeRate,

      rateSource:
        inverseRate.source ||
        "DATABASE_INVERSE",

      rateTimestamp:
        inverseRate.updated_at,

      rateDirection:
        "INVERSE",

      usedFallback:
        false,
    };
  }

  /*
 * No approved exchange rate exists.
 * Stop the accounting operation rather than
 * posting with an unknown or stale FX rate.
 */
throw new Error(
  `No approved FX rate is available for ${normalizedTransactionCurrency}/${normalizedReportingCurrency}.`
);
}