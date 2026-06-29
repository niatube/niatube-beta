/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Super Support Engine
 * ==========================================================
 */

import {
  calculatePlatformFee,
  calculateNetAmount,
  normalizeCurrencyCode,
  TRANSACTION_STATUS,
} from "@/lib/creator-economy";

import { recordCreatorWalletEntry } from "@/lib/creator-wallet-engine";

type SupabaseAdminClient = any;

export interface ProcessSuperSupportInput {
  supabaseAdmin: SupabaseAdminClient;

  creatorName: string;

  amount: number;

  currencyCode: string;

  referenceId?: string | null;
}

export interface ProcessSuperSupportResult {
  grossAmount: number;

  platformFee: number;

  netAmount: number;

  currencyCode: string;

  status: string;
}

export async function processSuperSupport({
  supabaseAdmin,
  creatorName,
  amount,
  currencyCode,
  referenceId = null,
}: ProcessSuperSupportInput): Promise<ProcessSuperSupportResult> {
  if (!creatorName) {
    throw new Error("Creator name is required.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Support amount must be greater than zero.");
  }

  const normalizedCurrency = normalizeCurrencyCode(currencyCode);

  const platformFee = calculatePlatformFee(amount);

  const netAmount = calculateNetAmount(amount);

  await recordCreatorWalletEntry({
    supabaseAdmin,
    creatorName,
    transactionType: "super_support",
    referenceId,
    currencyCode: normalizedCurrency,
    amount: netAmount,
    status: TRANSACTION_STATUS.COMPLETED,
  });

  return {
    grossAmount: amount,
    platformFee,
    netAmount,
    currencyCode: normalizedCurrency,
    status: TRANSACTION_STATUS.COMPLETED,
  };
}