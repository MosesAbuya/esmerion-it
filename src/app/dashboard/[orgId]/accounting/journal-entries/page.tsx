import { prisma } from "@/auth";
import Link from "next/link";

export default async function JournalEntriesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const entries = await prisma.journalEntry.findMany({
    where: { organizationId: (await params).orgId },
    orderBy: { date: 'desc' },
    include: {
      lines: {
        include: { account: true }
      }
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Journal Entries</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">New Entry</button>
      </div>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <p className="text-gray-500">No journal entries yet.</p>
        ) : entries.map(entry => (
          <div key={entry.id} className="bg-white border rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <div>
                <span className="font-semibold">#{entry.id.slice(-6)}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span>{new Date(entry.date).toLocaleDateString()}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-gray-600">{entry.description}</span>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium">Currency: {entry.currency} (@{Number(entry.exchangeRate).toFixed(2)})</span>
                <span className={\`px-2 py-1 rounded text-xs \${entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                  {entry.status}
                </span>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2 font-semibold">Account</th>
                  <th className="p-2 font-semibold">Description</th>
                  <th className="p-2 font-semibold text-right">Debit</th>
                  <th className="p-2 font-semibold text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entry.lines.map(line => (
                  <tr key={line.id} className="hover:bg-gray-50">
                    <td className="p-2">{line.account.code} - {line.account.name}</td>
                    <td className="p-2 text-gray-500">{line.description}</td>
                    <td className="p-2 text-right">{Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : '-'}</td>
                    <td className="p-2 text-right">{Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
