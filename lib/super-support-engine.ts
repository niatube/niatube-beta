/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Super Support Engine
 * ==========================================================
 *
 * Responsibility:
 * - Validate Super Support input
 * - Normalize currency
 * - Calculate gross / fee / net
 * - Return standardized Super Support result
 *
 * This engine does NOT write to the wallet.
 * Wallet recording belongs to creator-wallet-engine.ts.
 */

import {
  calculatePlatformFee,
  calculateNetAmount,
  normalizeCurrencyCode,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";

export interface PrepareSuperSupportInput {
  creatorName: string;
  amount: number;
  currencyCode: string;
  referenceId?: string | null;
}

export interface PreparedSuperSupport {
  creatorName: string;
  referenceId?: string | null;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currencyCode: string;
  status: string;
}

export function prepareSuperSupport({
  creatorName,
  amount,
  currencyCode,
  referenceId = null,
}: PrepareSuperSupportInput): PreparedSuperSupport {
  if (!creatorName) {
    throw new Error("Creator name is required.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Support amount must be greater than zero.");
  }

  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  const grossAmount = Number(amount || 0);
  const platformFee = calculatePlatformFee(grossAmount);
  const netAmount = calculateNetAmount(grossAmount);

  return {
    creatorName,
    referenceId,
    grossAmount,
    platformFee,
    netAmount,
    currencyCode: normalizedCurrency,
    status: TRANSACTION_STATUS.COMPLETED,
  };
}