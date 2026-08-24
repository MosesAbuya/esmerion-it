import { prisma } from "@/auth";

export default async function AssetsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const assets = await prisma.asset.findMany({
    where: { organizationId: orgId },
    include: { assignedTo: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Asset Inventory</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">Add Asset</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Serial No</th>
              <th className="p-4 font-semibold">Assigned To</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assets.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No assets tracked.</td></tr>
            ) : assets.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{asset.name}</td>
                <td className="p-4 text-gray-600">{asset.category}</td>
                <td className="p-4 text-gray-500 font-mono text-xs">{asset.serialNumber || '-'}</td>
                <td className="p-4 text-gray-600">{asset.assignedTo?.name || asset.assignedTo?.email || 'Unassigned'}</td>
                <td className="p-4 text-right">
                  <span className={\`px-2 py-1 rounded text-xs \${
                    asset.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    asset.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }\`}>
                    {asset.status}
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
