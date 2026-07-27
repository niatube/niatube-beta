import { normalizeCurrencyCode } from "@/lib/creator-economy";

type SupabaseAdminClient = any;

export type RecordPlatformRevenueInput = {
  supabaseAdmin: SupabaseAdminClient;
  creatorName: string;
  transactionType: string;
  referenceId?: string | null;
  currencyCode: string;
  grossAmount: number;
  platformFee: number;
  country?: string | null;
  status?: string;
  notes?: string | null;
};

export async function recordPlatformRevenue({
  supabaseAdmin,
  creatorName,
  transactionType,
  referenceId = null,
  currencyCode,
  grossAmount,
  platformFee,
  country = null,
  status = "COMPLETED",
  notes = null,
}: RecordPlatformRevenueInput) {
  const safeGrossAmount = Number(grossAmount || 0);
  const safePlatformFee = Number(platformFee || 0);

  if (!creatorName) {
    throw new Error("Creator name is required.");
  }

  if (!transactionType) {
    throw new Error("Transaction type is required.");
  }

  if (safeGrossAmount <= 0) {
    throw new Error("Gross amount must be greater than zero.");
  }

  if (safePlatformFee < 0) {
    throw new Error("Platform fee cannot be negative.");
  }

  if (referenceId) {
    const { data: existingEntry, error: existingEntryError } =
      await supabaseAdmin
        .from("platform_treasury")
        .select("*")
        .eq("transaction_type", transactionType)
        .eq("reference_id", referenceId)
        .maybeSingle();

    if (existingEntryError) {
      throw new Error(
        existingEntryError.message ||
          "Failed to check existing treasury entry."
      );
    }

    if (existingEntry) {
      return existingEntry;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("platform_treasury")
    .insert([
      {
        creator_name: creatorName,
        transaction_type: transactionType,
        reference_id: referenceId,
        gross_amount: safeGrossAmount,
        platform_fee: safePlatformFee,
        currency_code: normalizeCurrencyCode(currencyCode),
        country,
        status,
        notes,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message || "Failed to record platform revenue."
    );
  }

  return data;
}