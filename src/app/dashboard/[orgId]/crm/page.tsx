import { prisma } from "@/auth";

export default async function CRMPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const clients = await prisma.client.findMany({
    where: { organizationId: orgId },
    include: { contacts: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CRM: Clients & Leads</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">Add Client</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Industry</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Contacts</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No clients yet.</td></tr>
            ) : clients.map(client => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{client.name}</td>
                <td className="p-4 text-gray-600">{client.industry || '-'}</td>
                <td className="p-4">
                  <span className={\`px-2 py-1 rounded text-xs \${client.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-right text-gray-500">{client.contacts.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
