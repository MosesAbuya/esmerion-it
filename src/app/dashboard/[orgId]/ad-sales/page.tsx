import { prisma } from "@/auth";

export default async function AdSalesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const campaigns = await prisma.adCampaign.findMany({
    where: { organizationId: orgId },
    include: { client: true, placements: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ad Sales Pipeline</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">New Campaign</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Campaign Name</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Budget</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No active campaigns.</td></tr>
            ) : campaigns.map(camp => (
              <tr key={camp.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{camp.campaignName}</td>
                <td className="p-4 text-gray-600">{camp.client.name}</td>
                <td className="p-4 text-gray-600">{camp.budget ? Number(camp.budget).toLocaleString() : '-'}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    camp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    camp.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {camp.status}
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
