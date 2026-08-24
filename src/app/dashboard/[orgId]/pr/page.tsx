import { prisma } from "@/auth";

export default async function PRPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const releases = await prisma.pressRelease.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' }
  });
  
  const contacts = await prisma.mediaContact.count({
    where: { organizationId: orgId }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Secretariat & PR</h1>
          <p className="text-sm text-gray-500">Managing {contacts} media contacts.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-50">Contacts</button>
          <button className="bg-black text-white px-4 py-2 rounded text-sm">New Press Release</button>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Distribution List</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {releases.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No press releases.</td></tr>
            ) : releases.map(release => (
              <tr key={release.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{release.title}</td>
                <td className="p-4 text-gray-600">{release.distributionList || 'None'}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    release.status === 'DISTRIBUTED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {release.status}
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
