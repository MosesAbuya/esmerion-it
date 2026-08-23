import { prisma } from "@/auth";

export async function seedChartOfAccounts(organizationId: string) {
  const existingAccounts = await prisma.ledgerAccount.count({
    where: { organizationId }
  });

  if (existingAccounts > 0) return; // Already seeded

  const defaultAccounts = [
    { code: '1000', name: 'Cash', type: 'ASSET' },
    { code: '1100', name: 'Bank Accounts', type: 'ASSET' },
    { code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
    { code: '2100', name: 'Taxes Payable', type: 'LIABILITY' },
    { code: '3000', name: "Owner's Equity", type: 'EQUITY' },
    { code: '3100', name: 'Retained Earnings', type: 'EQUITY' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
    { code: '4100', name: 'Service Revenue', type: 'REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
    { code: '6000', name: 'Operating Expenses', type: 'EXPENSE' },
    { code: '6100', name: 'Payroll', type: 'EXPENSE' },
    { code: '6200', name: 'Rent', type: 'EXPENSE' },
    { code: '6300', name: 'Utilities', type: 'EXPENSE' },
  ];

  await prisma.ledgerAccount.createMany({
    data: defaultAccounts.map(acc => ({
      ...acc,
      organizationId,
    }))
  });
}
