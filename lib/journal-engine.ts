import crypto from "node:crypto";

import {
  normalizeCurrencyCode,
} from "@/lib/creator-economy";

type SupabaseAdminClient = any;

export type JournalLineInput = {
  accountCode: string;
  debit?: number;
  credit?: number;
  description?: string | null;
};

export type PostJournalEntryInput = {
  supabaseAdmin: SupabaseAdminClient;

  sourceType: string;
  sourceId?: string | null;

  description: string;
  currencyCode: string;

  createdBy?: string | null;
  entryDate?: string | null;

  lines: JournalLineInput[];
};

type FinancialAccountRow = {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  is_active: boolean;
};

function roundMoney(value: number) {
  return Number(Number(value || 0).toFixed(2));
}

function generateEntryNumber() {
  const timestamp = Date.now();

  const randomSuffix = crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();

  return `JE-${timestamp}-${randomSuffix}`;
}

export async function postJournalEntry({
  supabaseAdmin,
  sourceType,
  sourceId = null,
  description,
  currencyCode,
  createdBy = null,
  entryDate = null,
  lines,
}: PostJournalEntryInput) {
  const normalizedSourceType = String(
    sourceType || "",
  )
    .trim()
    .toUpperCase();

  const normalizedDescription = String(
    description || "",
  ).trim();

  const normalizedCurrency =
    normalizeCurrencyCode(currencyCode);

  if (!supabaseAdmin) {
    throw new Error(
      "Supabase administrator client is required.",
    );
  }

  if (!normalizedSourceType) {
    throw new Error(
      "Journal source type is required.",
    );
  }

  if (!normalizedDescription) {
    throw new Error(
      "Journal description is required.",
    );
  }

  if (!Array.isArray(lines) || lines.length < 2) {
    throw new Error(
      "A journal entry requires at least two lines.",
    );
  }

  const normalizedLines = lines.map(
    (line, index) => {
      const accountCode = String(
        line.accountCode || "",
      ).trim();

      const debit = roundMoney(
        Number(line.debit || 0),
      );

      const credit = roundMoney(
        Number(line.credit || 0),
      );

      if (!accountCode) {
        throw new Error(
          `Account code is required for journal line ${
            index + 1
          }.`,
        );
      }

      if (debit < 0 || credit < 0) {
        throw new Error(
          `Journal line ${
            index + 1
          } cannot contain a negative amount.`,
        );
      }

      if (debit > 0 && credit > 0) {
        throw new Error(
          `Journal line ${
            index + 1
          } cannot contain both a debit and a credit.`,
        );
      }

      if (debit === 0 && credit === 0) {
        throw new Error(
          `Journal line ${
            index + 1
          } must contain either a debit or a credit.`,
        );
      }

      return {
        accountCode,
        debit,
        credit,
        description:
          line.description?.trim() ||
          normalizedDescription,
      };
    },
  );

  const totalDebits = roundMoney(
    normalizedLines.reduce(
      (total, line) => total + line.debit,
      0,
    ),
  );

  const totalCredits = roundMoney(
    normalizedLines.reduce(
      (total, line) => total + line.credit,
      0,
    ),
  );

  if (totalDebits <= 0 || totalCredits <= 0) {
    throw new Error(
      "Journal entry totals must be greater than zero.",
    );
  }

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Journal entry is not balanced. Debits: ${totalDebits.toFixed(
        2,
      )}; Credits: ${totalCredits.toFixed(2)}.`,
    );
  }

  /*
   * Idempotency protection:
   * If the same source transaction has already
   * produced a journal entry, return that entry.
   */
  if (sourceId) {
    const {
      data: existingEntry,
      error: existingEntryError,
    } = await supabaseAdmin
      .from("journal_entries")
      .select("*")
      .eq(
        "source_type",
        normalizedSourceType,
      )
      .eq("source_id", sourceId)
      .maybeSingle();

    if (existingEntryError) {
      throw new Error(
        existingEntryError.message ||
          "Failed to check for an existing journal entry.",
      );
    }

    if (existingEntry) {
      const {
        data: existingLines,
        error: existingLinesError,
      } = await supabaseAdmin
        .from("journal_entry_lines")
        .select("*")
        .eq(
          "journal_entry_id",
          existingEntry.id,
        )
        .order("created_at", {
          ascending: true,
        });

      if (existingLinesError) {
        throw new Error(
          existingLinesError.message ||
            "Failed to load existing journal lines.",
        );
      }

      return {
        entry: existingEntry,
        lines: existingLines ?? [],
        alreadyExisted: true,
      };
    }
  }

  const accountCodes = [
    ...new Set(
      normalizedLines.map(
        (line) => line.accountCode,
      ),
    ),
  ];

  const {
    data: accountData,
    error: accountError,
  } = await supabaseAdmin
    .from("financial_accounts")
    .select(
      "id, account_code, account_name, account_type, normal_balance, is_active",
    )
    .in("account_code", accountCodes);

  if (accountError) {
    throw new Error(
      accountError.message ||
        "Failed to validate financial accounts.",
    );
  }

  const financialAccounts =
    (accountData ?? []) as FinancialAccountRow[];

  const accountMap = new Map(
    financialAccounts.map((account) => [
      account.account_code,
      account,
    ]),
  );

  for (const accountCode of accountCodes) {
    const account = accountMap.get(
      accountCode,
    );

    if (!account) {
      throw new Error(
        `Financial account ${accountCode} does not exist.`,
      );
    }

    if (!account.is_active) {
      throw new Error(
        `Financial account ${accountCode} is inactive.`,
      );
    }
  }

  const entryNumber =
    generateEntryNumber();

  const {
    data: journalEntry,
    error: journalEntryError,
  } = await supabaseAdmin
    .from("journal_entries")
    .insert([
      {
        entry_number: entryNumber,
        entry_date:
          entryDate ||
          new Date().toISOString(),

        source_type:
          normalizedSourceType,

        source_id: sourceId,

        description:
          normalizedDescription,

        status: "POSTED",

        currency_code:
          normalizedCurrency,

        created_by:
          createdBy,

        posted_at:
          new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (journalEntryError) {
    throw new Error(
      journalEntryError.message ||
        "Failed to create journal entry.",
    );
  }

  const journalLines =
    normalizedLines.map((line) => {
      const account = accountMap.get(
        line.accountCode,
      );

      if (!account) {
        throw new Error(
          `Financial account ${line.accountCode} could not be resolved.`,
        );
      }

      return {
        journal_entry_id:
          journalEntry.id,

        financial_account_id:
          account.id,

        line_description:
          line.description,

        debit_amount:
          line.debit,

        credit_amount:
          line.credit,

        currency_code:
          normalizedCurrency,
      };
    });

  const {
    data: insertedLines,
    error: linesError,
  } = await supabaseAdmin
    .from("journal_entry_lines")
    .insert(journalLines)
    .select();

  if (linesError) {
    /*
     * The foreign key uses ON DELETE CASCADE,
     * so deleting the header also removes any
     * lines that may have been partially inserted.
     */
    const { error: cleanupError } =
      await supabaseAdmin
        .from("journal_entries")
        .delete()
        .eq("id", journalEntry.id);

    if (cleanupError) {
      console.error(
        "Journal cleanup error:",
        cleanupError,
      );
    }

    throw new Error(
      linesError.message ||
        "Failed to create journal entry lines.",
    );
  }

  return {
    entry: journalEntry,
    lines: insertedLines ?? [],
    alreadyExisted: false,
    totals: {
      debits: totalDebits,
      credits: totalCredits,
    },
  };
}