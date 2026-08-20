import {
  PAYMENT_RAILS,
  PaymentRailId,
  RegistryStatus,
} from "@/lib/global-registry";
import {
  requireCurrency,
} from "@/lib/currency-registry";

export type PayoutProviderId =
  | "BETA"
  | "STRIPE"
  | "FLUTTERWAVE"
  | "PAYSTACK"
  | "PAPSS"
  | "TERRAPAY"
  | "THUNES"
  | "ONAFRIQ"
  | "CELLULANT";
export type PayoutRequest = {
  settlementId: string;
  creatorId: string;

  amount: number;
  currency: string;

  country?: string | null;

  payoutRail?: PaymentRailId | null;

  provider?: PayoutProviderId | null;

  destinationReference?: string | null;

  metadata?: Record<string, unknown>;
};

export type PayoutProviderResult = {
  accepted: boolean;

  provider: PayoutProviderId;

  providerReference: string | null;

  payoutRail: PaymentRailId | null;

  status:
    | "QUEUED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

  message: string;

  raw?: unknown;
};

export interface PayoutProviderAdapter {
  readonly id: PayoutProviderId;

  createPayout(
    request: PayoutRequest,
  ): Promise<PayoutProviderResult>;
}

/**
 * Temporary internal adapter used while real
 * financial-provider integrations are being connected.
 *
 * This keeps the Phase 2 lifecycle test capability,
 * but routes it through the same provider abstraction
 * that production providers will use.
 */
const betaPayoutAdapter: PayoutProviderAdapter = {
  id: "BETA",

  async createPayout(
    request: PayoutRequest,
  ): Promise<PayoutProviderResult> {
    const providerReference =
      `BETA-${request.settlementId}-${Date.now()}`;

    return {
      accepted: true,
      provider: "BETA",
      providerReference,
      payoutRail:
        request.payoutRail ?? null,
      status: "QUEUED",
      message:
        "Payout accepted by the NiaTube beta payout adapter.",
    };
  },
};

const flutterwavePayoutAdapter: PayoutProviderAdapter = {
  id: "FLUTTERWAVE",

  async createPayout(
    request: PayoutRequest,
  ): Promise<PayoutProviderResult> {
    const payoutsEnabled =
      String(
        process.env.FLUTTERWAVE_PAYOUTS_ENABLED ||
          "false",
      )
        .trim()
        .toLowerCase() === "true";

    if (!payoutsEnabled) {
      throw new Error(
        "Flutterwave payouts are disabled.",
      );
    }

    const secretKey =
      String(
        process.env.FLUTTERWAVE_SECRET_KEY || "",
      ).trim();

    const baseUrl =
      String(
        process.env.FLUTTERWAVE_BASE_URL || "",
      ).trim();

    if (!secretKey) {
      throw new Error(
        "FLUTTERWAVE_SECRET_KEY is not configured.",
      );
    }

    if (!baseUrl) {
  throw new Error(
    "FLUTTERWAVE_BASE_URL is not configured.",
  );
}

const currency =
  requireCurrency(request.currency);

const smallestUnitAmount =
  Math.round(
    request.amount *
      10 ** currency.decimals,
  );

if (smallestUnitAmount <= 0) {
  throw new Error(
    "Flutterwave payout amount must be greater than zero in the smallest currency unit.",
  );
}

const recipientId =
  String(
    request.destinationReference || "",
  ).trim();

if (!recipientId) {
  throw new Error(
    "Flutterwave recipient ID is required for payout.",
  );
}

const transferReference =
  `NT-${request.settlementId}`;
const transferPayload = {
  action: "instant",
  reference: transferReference,
  narration:
    "NiaTube creator payout",
  payment_instruction: {
    source_currency:
      currency.code,
    amount: {
      value:
        smallestUnitAmount,
      applies_to:
        "destination_currency",
    },
    recipient_id:
      recipientId,
  },
};

const response = await fetch(
  `${baseUrl.replace(/\/+$/, "")}/direct-transfers`,
  {
    method: "POST",

  headers: {
  accept: "application/json",
  "content-type": "application/json",
  Authorization: `Bearer ${secretKey}`,
  "X-Trace-Id":
    `trace-${request.settlementId}`,
  "X-Idempotency-Key":
    `payout-${request.settlementId}`,
},

    body: JSON.stringify(
      transferPayload,
    ),
  },
);

const responseBody: unknown =
  await response.json().catch(() => null);

if (!response.ok) {
  const providerMessage =
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody &&
    typeof responseBody.message === "string"
      ? responseBody.message
      : `HTTP ${response.status}`;

  throw new Error(
    `Flutterwave payout request failed: ${providerMessage}`,
  );
}

const flutterwaveResponse =
  responseBody as {
    status?: string;
    message?: string;
    data?: {
      id?: string;
      reference?: string;
      status?: string;
    };
  };

const providerReference =
  String(
    flutterwaveResponse.data?.id ||
      flutterwaveResponse.data?.reference ||
      transferReference,
  ).trim();

return {
  accepted: true,
  provider: "FLUTTERWAVE",
  providerReference,
  payoutRail:
    request.payoutRail ?? null,
  status: "QUEUED",
  message:
    flutterwaveResponse.message ||
    "Flutterwave payout accepted.",
};
  },
};

const PROVIDER_ADAPTERS:
Partial<
  Record<
    PayoutProviderId,
    PayoutProviderAdapter
  >
> = {
  BETA: betaPayoutAdapter,
  FLUTTERWAVE: flutterwavePayoutAdapter,
};
function normalizeProvider(
  value?: string | null,
): PayoutProviderId {
  const normalized =
    String(value || "BETA")
      .trim()
      .toUpperCase();

    switch (normalized) {
    case "STRIPE":
    case "FLUTTERWAVE":
    case "PAYSTACK":
    case "PAPSS":
    case "TERRAPAY":
    case "THUNES":
    case "ONAFRIQ":
    case "CELLULANT":
    case "BETA":
      return normalized;

    default:
      throw new Error(
        `Unsupported payout provider: ${normalized}.`,
      );
  }
}

function validatePayoutRequest(
  request: PayoutRequest,
) {
  if (!request.settlementId) {
    throw new Error(
      "Settlement transaction ID is required for payout.",
    );
  }

  if (!request.creatorId) {
    throw new Error(
      "Creator ID is required for payout.",
    );
  }

  if (
    !Number.isFinite(request.amount) ||
    request.amount <= 0
  ) {
    throw new Error(
      "Payout amount must be greater than zero.",
    );
  }

  if (!request.currency) {
    throw new Error(
      "Payout currency is required.",
    );
  }

  if (request.payoutRail) {
    const rail =
      PAYMENT_RAILS[request.payoutRail];

    if (!rail) {
      throw new Error(
        `Unknown payout rail: ${request.payoutRail}.`,
      );
    }

    if (
      rail.status ===
      RegistryStatus.PLANNED &&
      request.provider !== "BETA"
    ) {
      throw new Error(
        `Payout rail ${request.payoutRail} is not live yet.`,
      );
    }

    if (
      !rail.apiReady &&
      request.provider !== "BETA"
    ) {
      throw new Error(
        `Payout rail ${request.payoutRail} is not API-ready yet.`,
      );
    }
  }
}

export async function routePayout(
  request: PayoutRequest,
): Promise<PayoutProviderResult> {
  validatePayoutRequest(request);

  const provider =
    normalizeProvider(request.provider);

  const adapter =
    PROVIDER_ADAPTERS[provider];

  if (!adapter) {
    throw new Error(
      `Payout provider ${provider} has no active adapter.`,
    );
  }

  return adapter.createPayout({
    ...request,
    provider,
  });
}