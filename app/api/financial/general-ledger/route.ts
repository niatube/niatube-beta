import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JournalEntryRelation = {
  id: string;
  entry_number: string;
  entry_date: string;
  source_type: string;
  source_id: string | null;
  description: string;
  status: string;
  currency_code: string;

  transaction_currency: string | null;
  transaction_amount:
    | number
    | string
    | null;

  reporting_currency: string | null;
  reporting_amount:
    | number
    | string
    | null;

  exchange_rate:
    | number
    | string
    | null;

  fx_rate_id: string | null;
  fx_rate_source: string | null;
  fx_rate_timestamp: string | null;
};

type FinancialAccountRelation = {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
};

type JournalLineRow = {
  id: string;
  journal_entry_id: string;
  line_description: string | null;

  debit_amount:
    | number
    | string
    | null;

  credit_amount:
    | number
    | string
    | null;

  currency_code: string;
  created_at: string;

  journal_entries:
    | JournalEntryRelation
    | JournalEntryRelation[]
    | null;

  financial_accounts:
    | FinancialAccountRelation
    | FinancialAccountRelation[]
    | null;
};
function firstRelation<T>(
  relation: T | T[] | null,
): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("journal_entry_lines")
      .select(`
        id,
        journal_entry_id,
        line_description,
        debit_amount,
        credit_amount,
        currency_code,
        created_at,
        journal_entries!inner (
          id,
          entry_number,
          entry_date,
          source_type,
          source_id,
          description,
          status,
currency_code,
transaction_currency,
transaction_amount,
reporting_currency,
reporting_amount,
exchange_rate,
fx_rate_id,
fx_rate_source,
fx_rate_timestamp
        ),
        financial_accounts!inner (
          id,
          account_code,
          account_name,
          account_type,
          normal_balance
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "General Ledger load error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Failed to load the General Ledger.",
        },
        {
          status: 500,
        },
      );
    }

    const rows = (
      (data ?? []) as unknown as JournalLineRow[]
    ).map((line) => {
      const journalEntry = firstRelation(
        line.journal_entries,
      );

      const financialAccount = firstRelation(
        line.financial_accounts,
      );

      return {
        line_id: line.id,
        journal_entry_id:
          line.journal_entry_id,

        entry_number:
          journalEntry?.entry_number ?? "",

        entry_date:
          journalEntry?.entry_date ??
          line.created_at,

        source_type:
          journalEntry?.source_type ??
          "UNKNOWN",

        source_id:
          journalEntry?.source_id ?? null,

        description:
          journalEntry?.description ?? "",

        status:
          journalEntry?.status ?? "DRAFT",

        currency_code:
          line.currency_code ||
          journalEntry?.currency_code ||
          "USD",
          transaction_currency:
  journalEntry?.transaction_currency ??
  journalEntry?.currency_code ??
  "USD",

transaction_amount:
  Number(
    journalEntry?.transaction_amount ||
      0,
  ),

reporting_currency:
  journalEntry?.reporting_currency ??
  journalEntry?.currency_code ??
  "USD",

reporting_amount:
  Number(
    journalEntry?.reporting_amount ||
      0,
  ),

exchange_rate:
  Number(
    journalEntry?.exchange_rate ||
      1,
  ),

fx_rate_id:
  journalEntry?.fx_rate_id ??
  null,

fx_rate_source:
  journalEntry?.fx_rate_source ??
  null,

fx_rate_timestamp:
  journalEntry?.fx_rate_timestamp ??
  null,

        account_code:
          financialAccount?.account_code ??
          "",

        account_name:
          financialAccount?.account_name ??
          "",

        account_type:
          financialAccount?.account_type ??
          "",

        normal_balance:
          financialAccount?.normal_balance ??
          "",

        line_description:
          line.line_description,

        debit_amount:
          Number(line.debit_amount || 0),

        credit_amount:
          Number(line.credit_amount || 0),
      };
    });

    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error(
      "General Ledger API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load the General Ledger.",
      },
      {
        status: 500,
      },
    );
  }
}