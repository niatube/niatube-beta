import {
  COUNTRY_REGISTRY,
  getCountryByIsoCode,
  getCountryByName,
} from "@/lib/country-registry";

export type PaymentRiskScore = "LOW" | "MEDIUM" | "HIGH";

export type PaymentAuthorizationResult = {
  approved: boolean;
  code: string | null;
  reason: string | null;
  message: string;
  riskScore: PaymentRiskScore;
};

export type PaymentAuthorizationRequest = {
  viewerId?: string | null;
  creatorId?: string | null;
  country: string;
  currency: string;
  paymentMethod: string;
  amount: number;

  viewerSuspended?: boolean;
  creatorSuspended?: boolean;
  walletFrozen?: boolean;
  maintenanceMode?: boolean;
};

const SUPPORTED_PAYMENT_METHODS = [
  "CARD",
  "APPLE_PAY",
  "GOOGLE_PAY",
  "MOBILE_MONEY",
  "BANK_TRANSFER",
  "NIACREDIT",
];

const DAILY_LIMIT = 2000;

function normalizeValue(value: string) {
  return value.trim().toUpperCase();
}

function findCountry(countryInput: string) {
  const cleaned = countryInput.trim();

  return (
    getCountryByIsoCode(cleaned) ||
    getCountryByName(cleaned)
  );
}

export async function authorizePayment(
  request: PaymentAuthorizationRequest
): Promise<PaymentAuthorizationResult> {
  if (request.maintenanceMode) {
    return deny(
      "PAYMENTS_DISABLED",
      "Platform maintenance",
      "Payments are temporarily unavailable."
    );
  }

  if (!request.viewerId) {
    return deny(
      "NOT_AUTHENTICATED",
      "Viewer not authenticated",
      "Please sign in before making a payment."
    );
  }

  if (!request.creatorId) {
    return deny(
      "CREATOR_NOT_FOUND",
      "Missing creator",
      "The selected creator could not be found."
    );
  }

  if (request.viewerSuspended) {
    return deny(
      "VIEWER_SUSPENDED",
      "Viewer suspended",
      "Your account is currently restricted."
    );
  }

  if (request.creatorSuspended) {
    return deny(
      "CREATOR_SUSPENDED",
      "Creator suspended",
      "This creator cannot currently receive payments."
    );
  }

  if (request.walletFrozen) {
    return deny(
      "WALLET_FROZEN",
      "Wallet frozen",
      "This wallet is temporarily unavailable."
    );
  }

  const countryRecord = findCountry(request.country);

  if (!countryRecord) {
    return deny(
      "UNSUPPORTED_COUNTRY",
      "Country not supported",
      "Payments are not yet available in your country."
    );
  }

  const requestedCurrency = normalizeValue(request.currency);

  const supportedCurrencies = COUNTRY_REGISTRY.map(
    (country) => country.currencyCode
  );

  if (!supportedCurrencies.includes(requestedCurrency)) {
    return deny(
      "UNSUPPORTED_CURRENCY",
      "Currency not supported",
      "This currency is not currently supported."
    );
  }

  if (countryRecord.currencyCode !== requestedCurrency) {
    return deny(
      "COUNTRY_CURRENCY_MISMATCH",
      "Country and currency mismatch",
      `Payments from ${countryRecord.country} must use ${countryRecord.currencyCode}.`
    );
  }

  const requestedPaymentMethod = normalizeValue(request.paymentMethod);

  if (!SUPPORTED_PAYMENT_METHODS.includes(requestedPaymentMethod)) {
    return deny(
      "UNSUPPORTED_PAYMENT_METHOD",
      "Payment method not supported",
      "Please choose another payment method."
    );
  }

  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    return deny(
      "INVALID_AMOUNT",
      "Invalid amount",
      "Payment amount must be greater than zero."
    );
  }

  if (request.amount > DAILY_LIMIT) {
    return deny(
      "DAILY_LIMIT_EXCEEDED",
      "Daily limit exceeded",
      "This payment exceeds the current transaction limit."
    );
  }

  const riskScore: PaymentRiskScore =
    request.amount > 1000 ? "MEDIUM" : "LOW";

  return {
    approved: true,
    code: null,
    reason: null,
    message: "Payment authorized.",
    riskScore,
  };
}

function deny(
  code: string,
  reason: string,
  message: string
): PaymentAuthorizationResult {
  return {
    approved: false,
    code,
    reason,
    message,
    riskScore: "HIGH",
  };
}