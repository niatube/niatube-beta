import {
  TRANSACTION_STATUS,
  normalizeCurrencyCode,
} from "@/lib/creator-economy";

type SupabaseAdminClient = any;

export type RecordCreatorWalletEntryInput = {
  supabaseAdmin: SupabaseAdminClient;
  creatorName: string;
  transactionType: string;
  referenceId?: string | null;
  currencyCode: string;
  amount: number;
  status?: string;
};

export async function recordCreatorWalletEntry({
  supabaseAdmin,
  creatorName,
  transactionType,
  referenceId = null,
  currencyCode,
  amount,
  status = TRANSACTION_STATUS.COMPLETED,
}: RecordCreatorWalletEntryInput) {
  const safeAmount = Number(amount || 0);

  if (!creatorName) {
    throw new Error("Creator name is required for wallet entry.");
  }

  if (!transactionType) {
    throw new Error("Transaction type is required for wallet entry.");
  }

  if (!safeAmount || safeAmount <= 0) {
    throw new Error("Wallet entry amount must be greater than zero.");
  }

  const { data, error } = await supabaseAdmin
    .from("creator_wallet_ledger")
    .insert([
      {
        creator_name: creatorName,
        transaction_type: transactionType,
        reference_id: referenceId,
        currency_code: normalizeCurrencyCode(currencyCode),
        amount: safeAmount,
        status,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Creator wallet ledger insert error:", error);
    throw new Error(error.message || "Failed to record creator wallet entry.");
  }

  return data;
}