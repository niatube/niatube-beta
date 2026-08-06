import { NextResponse } from "next/server";

import {
  authorizeCronRequest,
  unauthorizedCronResponse,
} from "@/lib/cron-auth";

import {
  getFxCurrencies,
} from "@/lib/currency-registry";

import {
  getSupabaseAdmin,
} from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProviderRatesResponse = {
  base?: string;
  baseCurrency?: string;

  rates?: Record<
    string,
    number | string
  >;

  timestamp?: number | string;
  effectiveDate?: string;
  date?: string;
};

type FxRateUpsertRow = {
  base_currency: string;
  target_currency: string;
  rate: number;

  source: string;
  provider: string;

  approved: boolean;

  effective_date: string;
  updated_at: string;
};

function normalizeCurrencyCode(
  value: string,
): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function parsePositiveRate(
  value: number | string,
  currencyCode: string,
): number {
  const rate = Number(value);

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    throw new Error(
      `FX provider returned an invalid rate for ${currencyCode}.`,
    );
  }

  return rate;
}

function resolveEffectiveDate(
  response: ProviderRatesResponse,
): string {
  if (response.effectiveDate) {
    const effectiveDate =
      new Date(response.effectiveDate);

    if (
      !Number.isNaN(
        effectiveDate.getTime(),
      )
    ) {
      return effectiveDate.toISOString();
    }
  }

  if (response.date) {
    const date =
      new Date(response.date);

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date.toISOString();
    }
  }

  if (response.timestamp) {
    const numericTimestamp =
      Number(response.timestamp);

    if (
      Number.isFinite(
        numericTimestamp,
      )
    ) {
      const milliseconds =
        numericTimestamp >
        10_000_000_000
          ? numericTimestamp
          : numericTimestamp * 1000;

      const timestampDate =
        new Date(milliseconds);

      if (
        !Number.isNaN(
          timestampDate.getTime(),
        )
      ) {
        return timestampDate.toISOString();
      }
    }

    const stringTimestamp =
      new Date(
        String(response.timestamp),
      );

    if (
      !Number.isNaN(
        stringTimestamp.getTime(),
      )
    ) {
      return stringTimestamp.toISOString();
    }
  }

  return new Date().toISOString();
}

async function fetchConfiguredProviderRates() {
  const providerName =
    String(
      process.env.FX_PROVIDER || "",
    )
      .trim()
      .toLowerCase();

  const providerUrl =
    String(
      process.env.FX_PROVIDER_URL || "",
    ).trim();

  const providerApiKey =
    String(
      process.env.FX_PROVIDER_API_KEY ||
        "",
    ).trim();

  if (!providerName) {
    throw new Error(
      "FX_PROVIDER environment variable is not configured.",
    );
  }

  if (!providerUrl) {
    throw new Error(
      "FX_PROVIDER_URL environment variable is not configured.",
    );
  }

  if (!providerApiKey) {
    throw new Error(
      "FX_PROVIDER_API_KEY environment variable is not configured.",
    );
  }

  /*
   * Provider-neutral HTTP contract:
   *
   * The configured endpoint must return a JSON object
   * containing:
   *
   * {
   *   "base": "USD",
   *   "rates": {
   *     "KES": 129.5,
   *     "NGN": 1420
   *   },
   *   "timestamp": 1785700000
   * }
   *
   * A future provider adapter can normalize a vendor's
   * response into this contract without changing the
   * synchronization or accounting layers.
   */
  const requestUrl =
  `${providerUrl}?app_id=${providerApiKey}`;

const response =
  await fetch(requestUrl, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },

    cache: "no-store",
  });

  const responseText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `FX provider request failed with status ${response.status}: ${responseText.slice(
        0,
        500,
      )}`,
    );
  }

  let result:
    ProviderRatesResponse;

  try {
    result = JSON.parse(
      responseText,
    ) as ProviderRatesResponse;
  } catch {
    throw new Error(
      "FX provider returned invalid JSON.",
    );
  }

  const baseCurrency =
    normalizeCurrencyCode(
      result.base ||
        result.baseCurrency ||
        "USD",
    );

  if (
    baseCurrency !== "USD"
  ) {
    throw new Error(
      `FX provider response must use USD as its base currency. Received ${baseCurrency}.`,
    );
  }

  if (
    !result.rates ||
    typeof result.rates !== "object"
  ) {
    throw new Error(
      "FX provider response does not contain a rates object.",
    );
  }

  return {
    providerName,
    baseCurrency,
    rates: result.rates,
    effectiveDate:
      resolveEffectiveDate(
        result,
      ),
  };
}

async function synchronizeFxRates() {
  const supabaseAdmin =
    getSupabaseAdmin();

  const providerResult =
    await fetchConfiguredProviderRates();

  const fxCurrencies =
    getFxCurrencies();

  const now =
    new Date().toISOString();

  const rows:
    FxRateUpsertRow[] = [];

  const skipped: {
    currency: string;
    reason: string;
  }[] = [];

  for (
    const currency
    of fxCurrencies
  ) {
    const currencyCode =
      normalizeCurrencyCode(
        currency.code,
      );

    if (
      currencyCode ===
      providerResult.baseCurrency
    ) {
      rows.push({
        base_currency: "USD",
        target_currency: "USD",
        rate: 1,

        source:
          `${providerResult.providerName}_sync`,

        provider:
          providerResult.providerName,

        approved: true,

        effective_date:
          providerResult.effectiveDate,

        updated_at: now,
      });

      continue;
    }

    const rawRate =
      providerResult.rates[
        currencyCode
      ];

    if (
      rawRate === undefined ||
      rawRate === null
    ) {
      skipped.push({
        currency:
          currencyCode,

        reason:
          "Provider did not return a rate.",
      });

      continue;
    }

    let usdToCurrencyRate:
      number;

    try {
      usdToCurrencyRate =
        parsePositiveRate(
          rawRate,
          currencyCode,
        );
    } catch (
      error: unknown
    ) {
      skipped.push({
        currency:
          currencyCode,

        reason:
          error instanceof Error
            ? error.message
            : "Invalid provider rate.",
      });

      continue;
    }

    const currencyToUsdRate =
      1 /
      usdToCurrencyRate;

    rows.push(
      {
        base_currency: "USD",
        target_currency:
          currencyCode,

        rate:
          usdToCurrencyRate,

        source:
          `${providerResult.providerName}_sync`,

        provider:
          providerResult.providerName,

        approved: true,

        effective_date:
          providerResult.effectiveDate,

        updated_at: now,
      },
      {
        base_currency:
          currencyCode,

        target_currency: "USD",

        rate:
          currencyToUsdRate,

        source:
          `${providerResult.providerName}_sync_inverse`,

        provider:
          providerResult.providerName,

        approved: true,

        effective_date:
          providerResult.effectiveDate,

        updated_at: now,
      },
    );
  }

  if (rows.length === 0) {
    throw new Error(
      "FX synchronization produced no valid rate rows.",
    );
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("fx_rates")
    .upsert(
      rows,
      {
        onConflict:
          "base_currency,target_currency",
      },
    )
    .select(
      "id, base_currency, target_currency, rate, provider, approved, effective_date, updated_at",
    );

  if (error) {
    throw new Error(
      error.message ||
        "Failed to synchronize FX rates.",
    );
  }

  return {
    provider:
      providerResult.providerName,

    baseCurrency:
      providerResult.baseCurrency,

    effectiveDate:
      providerResult.effectiveDate,

    registeredCurrencies:
      fxCurrencies.length,

    rowsPrepared:
      rows.length,

    rowsUpserted:
      data?.length ??
      rows.length,

    skippedCount:
      skipped.length,

    skipped,
  };
}

async function handleFxSync(
  request: Request,
) {
  try {
    const authorization =
      authorizeCronRequest(
        request,
      );

    if (
      !authorization.success
    ) {
      return unauthorizedCronResponse(
        authorization.error ||
          "Cron authorization failed.",
      );
    }

    const result =
      await synchronizeFxRates();

    return NextResponse.json(
      {
        success: true,

        message:
          "FX synchronization completed successfully.",

        result,
      },
      {
        status: 200,
      },
    );
  } catch (
    error: unknown
  ) {
    console.error(
      "FX synchronization error:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "FX synchronization failed.";

    const configurationError =
      message.includes(
        "environment variable",
      );

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status:
          configurationError
            ? 503
            : 500,
      },
    );
  }
}

export async function GET(
  request: Request,
) {
  return handleFxSync(
    request,
  );
}

export async function POST(
  request: Request,
) {
  return handleFxSync(
    request,
  );
}