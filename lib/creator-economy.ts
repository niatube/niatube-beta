/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Shared Economic Types & Constants
 * ==========================================================
 */

export const PLATFORM_FEE_RATE = 0.05;

export const SOURCE_TYPES = {
  VIDEO_TIP: "video_tip",
  SUPER_SUPPORT: "super_support",
  LIVE_SUPER_SUPPORT: "live_super_support",
  ADVERTISING: "advertising",
  MEMBERSHIP: "membership",
  CREATOR_BONUS: "creator_bonus",
  LICENSING: "licensing",
  COURSE: "course",
  MERCHANDISE: "merchandise",
  BRAND_PARTNERSHIP: "brand_partnership",
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

export const TRANSACTION_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  REVERSED: "reversed",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

export interface CreatorEconomyTransaction {
  creator_name: string;
  supporter_name?: string | null;
  source_type: SourceType;
  source_reference?: string | null;
  currency_code: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  status: TransactionStatus;
  created_at?: string;
}

export function calculatePlatformFee(grossAmount: number) {
  return Number((Number(grossAmount || 0) * PLATFORM_FEE_RATE).toFixed(2));
}

export function calculateNetAmount(grossAmount: number) {
  const safeGrossAmount = Number(grossAmount || 0);

  return Number(
    (safeGrossAmount - calculatePlatformFee(safeGrossAmount)).toFixed(2)
  );
}

export function normalizeCurrencyCode(currencyCode?: string | null) {
  return String(currencyCode || "USD").trim().toUpperCase();
}