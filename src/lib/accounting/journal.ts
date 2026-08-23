import { prisma } from "@/auth";

export type JournalLineInput = {
  accountId: string;
  txDebit?: number;
  txCredit?: number;
  description?: string;
};

export type PostJournalInput = {
  organizationId: string;
  date: Date;
  description: string;
  sourceType: string;
  sourceId?: string;
  currency?: string;
  exchangeRate?: number;
  createdById?: string;
  lines: JournalLineInput[];
};

export async function postJournalEntry(input: PostJournalInput) {
  const {
    organizationId,
    date,
    description,
    sourceType,
    sourceId,
    currency = "KES",
    exchangeRate = 1.0,
    createdById,
    lines,
  } = input;

  if (lines.length < 2) {
    throw new Error("A journal entry must have at least two lines.");
  }

  // Calculate base amounts and check balance
  let totalBaseDebit = 0;
  let totalBaseCredit = 0;
  let totalTxDebit = 0;
  let totalTxCredit = 0;

  const processedLines = [];

  for (const line of lines) {
    const txDebit = line.txDebit || 0;
    const txCredit = line.txCredit || 0;

    if (txDebit < 0 || txCredit < 0) {
      throw new Error("Amounts cannot be negative.");
    }
    if (txDebit > 0 && txCredit > 0) {
      throw new Error("A single line cannot have both a debit and a credit.");
    }
    if (txDebit === 0 && txCredit === 0) {
      throw new Error("A journal line must have a non-zero amount.");
    }

    const baseDebit = txDebit * exchangeRate;
    const baseCredit = txCredit * exchangeRate;

    totalTxDebit += txDebit;
    totalTxCredit += txCredit;
    totalBaseDebit += baseDebit;
    totalBaseCredit += baseCredit;

    // Verify tenant isolation
    const account = await prisma.ledgerAccount.findUnique({
      where: { id: line.accountId },
    });

    if (!account) {
      throw new Error(`Account ${line.accountId} not found.`);
    }
    if (account.organizationId !== organizationId) {
      throw new Error(`Account ${line.accountId} does not belong to organization ${organizationId}.`);
    }

    processedLines.push({
      accountId: line.accountId,
      organizationId,
      txDebit,
      txCredit,
      debit: baseDebit,
      credit: baseCredit,
      description: line.description,
    });
  }

  // Allow for tiny floating point errors in JavaScript, but reject real imbalances
  if (Math.abs(totalBaseDebit - totalBaseCredit) > 0.001) {
    throw new Error(`Journal entry is not balanced. Debits: ${totalBaseDebit}, Credits: ${totalBaseCredit}`);
  }

  // Create the entry atomically
  const entry = await prisma.journalEntry.create({
    data: {
      organizationId,
      date,
      description,
      sourceType,
      sourceId,
      currency,
      exchangeRate,
      status: "POSTED",
      createdById,
      postedById: createdById,
      postedAt: new Date(),
      lines: {
        create: processedLines,
      },
    },
    include: {
      lines: true,
    },
  });

  return entry;
}

export async function voidJournalEntry(journalEntryId: string, voidedById: string, reason: string) {
  const original = await prisma.journalEntry.findUnique({
    where: { id: journalEntryId },
    include: { lines: true },
  });

  if (!original) throw new Error("Journal entry not found");
  if (original.status !== "POSTED") throw new Error("Only POSTED entries can be voided");

  // Create reversing entry
  const reversingLines = original.lines.map((line) => ({
    accountId: line.accountId,
    organizationId: line.organizationId,
    // Swap debits and credits
    txDebit: Number(line.txCredit),
    txCredit: Number(line.txDebit),
    debit: Number(line.credit),
    credit: Number(line.debit),
    description: `Reversal: ${reason}`,
  }));

  const result = await prisma.$transaction([
    // Mark original as voided
    prisma.journalEntry.update({
      where: { id: original.id },
      data: { status: "VOIDED" },
    }),
    // Create the new reversing entry
    prisma.journalEntry.create({
      data: {
        organizationId: original.organizationId,
        date: new Date(),
        description: `Reversal of entry ${original.id}: ${reason}`,
        sourceType: original.sourceType,
        sourceId: original.sourceId,
        currency: original.currency,
        exchangeRate: original.exchangeRate,
        status: "POSTED",
        reversalOfId: original.id,
        createdById: voidedById,
        postedById: voidedById,
        postedAt: new Date(),
        lines: {
          create: reversingLines,
        },
      },
    }),
  ]);

  return result[1];
}
