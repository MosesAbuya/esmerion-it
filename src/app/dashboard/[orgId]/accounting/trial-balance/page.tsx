import { prisma } from "@/auth";

export default async function TrialBalancePage({ params }: { params: { orgId: string } }) {
  // Fetch all accounts with their lines
  const accounts = await prisma.ledgerAccount.findMany({
    where: { organizationId: params.orgId },
    include: {
      journalLines: {
        where: {
          journalEntry: { status: 'POSTED' }
        },
        select: { debit: true, credit: true }
      }
    },
    orderBy: { code: 'asc' }
  });

  let totalDebit = 0;
  let totalCredit = 0;

  const tbRows = accounts.map(acc => {
    const dr = acc.journalLines.reduce((sum, line) => sum + Number(line.debit), 0);
    const cr = acc.journalLines.reduce((sum, line) => sum + Number(line.credit), 0);
    
    // Normally Asset/Expense have normal debit balances
    // Liability/Equity/Revenue have normal credit balances
    const net = dr - cr;
    const finalDr = net > 0 ? net : 0;
    const finalCr = net < 0 ? Math.abs(net) : 0;

    totalDebit += finalDr;
    totalCredit += finalCr;

    return { ...acc, dr: finalDr, cr: finalCr };
  }).filter(acc => acc.dr !== 0 || acc.cr !== 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trial Balance</h1>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Account</th>
              <th className="p-4 font-semibold text-right">Debit</th>
              <th className="p-4 font-semibold text-right">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tbRows.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No transactions yet.</td></tr>
            ) : tbRows.map(acc => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="p-4">{acc.code} - {acc.name}</td>
                <td className="p-4 text-right">{acc.dr > 0 ? acc.dr.toFixed(2) : '-'}</td>
                <td className="p-4 text-right">{acc.cr > 0 ? acc.cr.toFixed(2) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t font-bold">
            <tr>
              <td className="p-4">Totals</td>
              <td className="p-4 text-right border-t-2 border-black">{totalDebit.toFixed(2)}</td>
              <td className="p-4 text-right border-t-2 border-black">{totalCredit.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
