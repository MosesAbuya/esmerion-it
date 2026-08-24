import { prisma } from "@/auth";

export default async function TendersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const tenders = await prisma.tender.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tendering Pipeline</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">New Tender</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Authority</th>
              <th className="p-4 font-semibold">Deadline</th>
              <th className="p-4 font-semibold">Est. Value</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenders.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No tenders in pipeline.</td></tr>
            ) : tenders.map(tender => (
              <tr key={tender.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{tender.title}</td>
                <td className="p-4 text-gray-600">{tender.issuingAuthority}</td>
                <td className="p-4 text-gray-600">{tender.submissionDeadline ? tender.submissionDeadline.toLocaleDateString() : 'TBD'}</td>
                <td className="p-4 font-mono">{tender.estimatedValue ? Number(tender.estimatedValue).toLocaleString() : '-'}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs \${
                    tender.status === 'WON' ? 'bg-green-100 text-green-800' :
                    tender.status === 'LOST' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tender.status}
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
