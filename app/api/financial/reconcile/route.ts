import { NextResponse } from "next/server";

import {
  authorizeCronRequest,
  unauthorizedCronResponse,
} from "@/lib/cron-auth";

import { getSupabaseAdmin } from "@/lib/supabase-server";

import {
  ACCOUNTING_EVENT_TYPES,
} from "@/lib/accounting-rules";

import {
  SOURCE_TYPES,
} from "@/lib/creator-economy";

import {
  settlementEngine,
} from "@/lib/settlement-engine";

import {
  prepareSuperSupport,
} from "@/lib/super-support-engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReconciliationItem = {
  sourceType: string;
  sourceId: string;
  creatorName: string;
  currencyCode: string;
  grossAmount: number;
  creatorNetAmount: number;
  status:
    | "missing"
    | "already_journaled"
    | "repaired"
    | "failed";
  error?: string | null;
};

type ReconciliationSummary = {
  scanned: number;
  missing: number;
  repaired: number;
  alreadyJournaled: number;
  failed: number;
  items: ReconciliationItem[];
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(
    error ||
      "Unknown reconciliation error.",
  );
}

async function reconcileFinancialRecords({
  request,
  repair,
}: {
  request: Request;
  repair: boolean;
}) {
  const authorization =
    authorizeCronRequest(request);

  if (!authorization.success) {
    return unauthorizedCronResponse(
      authorization.error ||
        "Unauthorized reconciliation request.",
    );
  }

  const { searchParams } =
  new URL(request.url);

const sourceId =
  searchParams.get("sourceId");

const sourceType =
  searchParams.get("sourceType");

  const supabaseAdmin =
    getSupabaseAdmin();

  const summary: ReconciliationSummary = {
    scanned: 0,
    missing: 0,
    repaired: 0,
    alreadyJournaled: 0,
    failed: 0,
    items: [],
  };

  /*
   * --------------------------------------------------------
   * TIPS
   * --------------------------------------------------------
   */

 let tipsQuery =
  supabaseAdmin
    .from("tips")
    .select(`
      id,
      creator_name,
      amount,
      gross_amount,
      platform_fee,
      net_amount,
      currency_code,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(500);

if (
  sourceId &&
  (!sourceType ||
    sourceType === SOURCE_TYPES.VIDEO_TIP)
) {
  tipsQuery =
    tipsQuery.eq(
      "id",
      sourceId,
    );
}

const {
  data: tips,
  error: tipsError,
} = await tipsQuery;

  if (tipsError) {
    throw new Error(
      tipsError.message ||
        "Failed to load Tips for reconciliation.",
    );
  }

  if (
  !sourceType ||
  sourceType === SOURCE_TYPES.VIDEO_TIP
) {
  for (const tip of tips || []) {
    summary.scanned += 1;

    const sourceId =
      String(tip.id);

    const {
      data: existingJournal,
      error: journalLookupError,
    } = await supabaseAdmin
      .from("journal_entries")
      .select("id")
     .eq(
  "source_type",
  SOURCE_TYPES.VIDEO_TIP.toUpperCase(),
)
      .eq(
        "source_id",
        sourceId,
      )
      .maybeSingle();

    if (journalLookupError) {
      summary.failed += 1;

      summary.items.push({
        sourceType:
          SOURCE_TYPES.VIDEO_TIP,

        sourceId,

        creatorName:
          String(
            tip.creator_name || "",
          ),

        currencyCode:
          String(
            tip.currency_code || "",
          ),

        grossAmount:
          Number(
            tip.gross_amount ??
              tip.amount ??
              0,
          ),

        creatorNetAmount:
          Number(
            tip.net_amount || 0,
          ),

        status:
          "failed",

        error:
          journalLookupError.message,
      });

      continue;
    }

    if (existingJournal) {
      summary.alreadyJournaled += 1;

      summary.items.push({
        sourceType:
          SOURCE_TYPES.VIDEO_TIP,

        sourceId,

        creatorName:
          String(
            tip.creator_name || "",
          ),

        currencyCode:
          String(
            tip.currency_code || "",
          ),

        grossAmount:
          Number(
            tip.gross_amount ??
              tip.amount ??
              0,
          ),

        creatorNetAmount:
          Number(
            tip.net_amount || 0,
          ),

        status:
          "already_journaled",
      });

      continue;
    }

    summary.missing += 1;

    const creatorName =
      String(
        tip.creator_name || "",
      );

    const currencyCode =
      String(
        tip.currency_code || "USD",
      )
        .trim()
        .toUpperCase();

    const grossAmount =
      Number(
        tip.gross_amount ??
          tip.amount ??
          0,
      );

    const creatorNetAmount =
      Number(
        tip.net_amount || 0,
      );

    const reconciliationItem:
      ReconciliationItem = {
        sourceType:
          SOURCE_TYPES.VIDEO_TIP,

        sourceId,

        creatorName,

        currencyCode,

        grossAmount,

        creatorNetAmount,

        status:
          "missing",
      };

    if (!repair) {
      summary.items.push(
        reconciliationItem,
      );

      continue;
    }

    try {
      await settlementEngine
        .recordMonetizationJournal({
          supabaseAdmin,

          sourceType:
            SOURCE_TYPES.VIDEO_TIP,

          sourceId,

          eventType:
            ACCOUNTING_EVENT_TYPES.TIP,

          creatorName,

          transactionCurrency:
            currencyCode,

          grossAmount,

          creatorNetAmount,

          descriptionPrefix:
            "Reconciled viewer tip received for",
        });

      summary.repaired += 1;

      summary.items.push({
        ...reconciliationItem,
        status:
          "repaired",
      });
    } catch (error) {
      summary.failed += 1;

      summary.items.push({
        ...reconciliationItem,
        status:
          "failed",
        error:
          getErrorMessage(error),
      });
      }
}
}

/*
 * --------------------------------------------------------
 * SUPER SUPPORT
   */

 let superSupportQuery =
  supabaseAdmin
    .from(
      "super_support_transactions",
    )
    .select(`
      id,
      creator_name,
      amount,
      currency_code,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })
    .limit(500);

if (
  sourceId &&
  (!sourceType ||
    sourceType ===
      ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT)
) {
  superSupportQuery =
    superSupportQuery.eq(
      "id",
      sourceId,
    );
}

const {
  data: superSupportTransactions,
  error: superSupportError,
} = await superSupportQuery;
  if (superSupportError) {
    throw new Error(
      superSupportError.message ||
        "Failed to load Super Support transactions for reconciliation.",
    );
  }

 if (
  !sourceType ||
  sourceType ===
    ACCOUNTING_EVENT_TYPES.SUPER_SUPPORT
) {
  for (
    const transaction
    of superSupportTransactions || []
  ) {
    summary.scanned += 1;

    const sourceId =
      String(transaction.id);

    const sourceType =
      ACCOUNTING_EVENT_TYPES
        .SUPER_SUPPORT;

    const {
      data: existingJournal,
      error: journalLookupError,
    } = await supabaseAdmin
      .from("journal_entries")
      .select("id")
      .eq(
        "source_type",
        sourceType,
      )
      .eq(
        "source_id",
        sourceId,
      )
      .maybeSingle();

    const creatorName =
      String(
        transaction.creator_name ||
          "",
      );

    const currencyCode =
      String(
        transaction.currency_code ||
          "USD",
      )
        .trim()
        .toUpperCase();

   const grossAmount =
  Number(
    transaction.amount || 0,
  );

if (
  !Number.isFinite(grossAmount) ||
  grossAmount <= 0
) {
  summary.failed += 1;

  summary.items.push({
    sourceType,
    sourceId,
    creatorName,
    currencyCode,
    grossAmount,
    creatorNetAmount: 0,
    status: "failed",
    error:
      "Super Support amount must be greater than zero.",
  });

  continue;
}

let creatorNetAmount = 0;

try {
  const preparedSupport =
    prepareSuperSupport({
      creatorName,
      amount:
        grossAmount,
      currencyCode,
    });

  creatorNetAmount =
    Number(
      preparedSupport.netAmount ||
        0,
    );
} catch (error) {
  summary.failed += 1;

  summary.items.push({
    sourceType,
    sourceId,
    creatorName,
    currencyCode,
    grossAmount,
    creatorNetAmount: 0,
    status: "failed",
    error:
      getErrorMessage(error),
  });

  continue;
}
    if (journalLookupError) {
      summary.failed += 1;

      summary.items.push({
        sourceType,
        sourceId,
        creatorName,
        currencyCode,
        grossAmount,
        creatorNetAmount,
        status:
          "failed",
        error:
          journalLookupError.message,
      });

      continue;
    }

    if (existingJournal) {
      summary.alreadyJournaled += 1;

      summary.items.push({
        sourceType,
        sourceId,
        creatorName,
        currencyCode,
        grossAmount,
        creatorNetAmount,
        status:
          "already_journaled",
      });

      continue;
    }

    summary.missing += 1;

    const reconciliationItem:
      ReconciliationItem = {
        sourceType,
        sourceId,
        creatorName,
        currencyCode,
        grossAmount,
        creatorNetAmount,
        status:
          "missing",
      };

    if (!repair) {
      summary.items.push(
        reconciliationItem,
      );

      continue;
    }

    try {
      await settlementEngine
        .recordMonetizationJournal({
          supabaseAdmin,

          sourceType,

          sourceId,

          eventType:
            ACCOUNTING_EVENT_TYPES
              .SUPER_SUPPORT,

          creatorName,

          transactionCurrency:
            currencyCode,

          grossAmount,

          creatorNetAmount,

          descriptionPrefix:
            "Reconciled Super Support received for",
        });

      summary.repaired += 1;

      summary.items.push({
        ...reconciliationItem,
        status:
          "repaired",
      });
        } catch (error) {
      summary.failed += 1;

      summary.items.push({
        ...reconciliationItem,
        status:
          "failed",
        error:
          getErrorMessage(error),
      });
    }
  }
}

return NextResponse.json({
    success:
      summary.failed === 0,

    mode:
      repair
        ? "repair"
        : "dry_run",

    ...summary,
  });
}

/*
 * Dry run:
 * identifies missing journal entries
 * without changing financial records.
 */
export async function GET(
  request: Request,
) {
  try {
    return await reconcileFinancialRecords({
      request,
      repair: false,
    });
  } catch (error) {
    console.error(
      "Financial reconciliation dry-run error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          getErrorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}


/*
 * Repair:
 * creates ONLY missing General Ledger
 * journal entries.
 *
 * It does not modify:
 * - Tips Ledger
 * - Super Support Ledger
 * - Creator Wallet
 * - Platform Treasury
 */
export async function POST(
  request: Request,
) {
  try {
    return await reconcileFinancialRecords({
      request,
      repair: true,
    });
  } catch (error) {
    console.error(
      "Financial reconciliation repair error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          getErrorMessage(error),
      },
      {
        status: 500,
      },
    );
  }
}