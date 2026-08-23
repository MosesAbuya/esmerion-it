import { prisma } from "@/auth";

export default async function ChartOfAccountsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const accounts = await prisma.ledgerAccount.findMany({
    where: { organizationId: (await params).orgId },
    orderBy: { code: 'asc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Chart of Accounts</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">Add Account</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold">Currency</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600">{acc.code}</td>
                <td className="p-4 font-medium">{acc.name}</td>
                <td className="p-4 text-gray-500">{acc.type}</td>
                <td className="p-4 text-gray-500">{acc.currency || "Any"}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs \${acc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {acc.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
