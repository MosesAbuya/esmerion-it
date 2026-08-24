import { prisma } from "@/auth";

export default async function SubscribersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const subscribers = await prisma.subscriber.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriber Management</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">Add Subscriber</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold">Tier</th>
              <th className="p-4 font-semibold">Expires</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscribers.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No subscribers found.</td></tr>
            ) : subscribers.map(sub => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{sub.name}</td>
                <td className="p-4 text-gray-600">{sub.email}</td>
                <td className="p-4 text-gray-600">{sub.subscriptionTier}</td>
                <td className="p-4 text-gray-600">{sub.expiresAt ? sub.expiresAt.toLocaleDateString() : 'Never'}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    sub.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sub.status}
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
