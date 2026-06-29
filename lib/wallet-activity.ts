/**
 * ==========================================================
 * NiaTube Creator Economy™ (NCE)
 * Wallet Activity Engine
 * ==========================================================
 */

export type WalletLedgerEntry = {
  id?: string;
  created_at?: string;
  transaction_type?: string | null;
  reference_id?: string | null;
  currency_code?: string | null;
  amount?: number | string | null;
  status?: string | null;
};

export interface WalletActivityItem {
  id?: string;
  createdAt: string;
  source: string;
  sourceLabel: string;
  description: string;
  currencyCode: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: string;
}

export const WALLET_ACTIVITY_SOURCE_LABELS: Record<string, string> = {
  tip: "🎬 Video Tip",
  video_tip: "🎬 Video Tip",
  super_support: "❤️ Super Support",
  live_super_support: "🔴 Live Super Support",
  advertising: "📢 Advertising",
  membership: "💎 Membership",
  creator_bonus: "🎁 Creator Bonus",
  licensing: "📄 Licensing",
  course: "🎓 Course",
  merchandise: "🛍 Merchandise",
  brand_partnership: "🤝 Brand Partnership",
};

export function getWalletActivitySourceLabel(source: string) {
  return WALLET_ACTIVITY_SOURCE_LABELS[source] ?? "💰 Wallet Transaction";
}

export function buildWalletActivity(
  ledgerEntries: WalletLedgerEntry[]
): WalletActivityItem[] {
  const activity = (ledgerEntries || []).map((entry) => {
    const source = String(entry.transaction_type || "wallet_transaction");
    const netAmount = Number(entry.amount || 0);

    return {
      id: entry.id,
      createdAt: entry.created_at || "",
      source,
      sourceLabel: getWalletActivitySourceLabel(source),
      description:
        source === "tip" || source === "video_tip"
          ? "Regular video tip"
          : source === "super_support"
          ? "Creator Super Support"
          : source === "live_super_support"
          ? "Live Super Support"
          : "Wallet transaction",
      currencyCode: String(entry.currency_code || "UNKNOWN").toUpperCase(),
      grossAmount: 0,
      platformFee: 0,
      netAmount,
      status: String(entry.status || "completed"),
    };
  });

  return sortWalletActivity(activity);
}

export function sortWalletActivity(activity: WalletActivityItem[]) {
  return [...activity].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}