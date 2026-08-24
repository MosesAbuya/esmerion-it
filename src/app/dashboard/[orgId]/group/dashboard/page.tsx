import { prisma } from "@/auth";
import { redirect } from "next/navigation";

export default async function GroupDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { childOrganizations: true }
  });

  if (!org || org.childOrganizations.length === 0) {
    return <div className="p-8">Only parent organizations can view the group dashboard.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consolidated Group Dashboard</h1>
        <div className="text-sm text-gray-500">Base Currency: {org.baseCurrency}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white border rounded p-6 shadow-sm">
          <h2 className="font-semibold text-gray-500 text-sm uppercase">Total Group Revenue</h2>
          <p className="text-3xl font-bold mt-2">KES 0.00</p>
        </div>
        <div className="bg-white border rounded p-6 shadow-sm">
          <h2 className="font-semibold text-gray-500 text-sm uppercase">Total Group Expenses</h2>
          <p className="text-3xl font-bold mt-2">KES 0.00</p>
        </div>
        <div className="bg-white border rounded p-6 shadow-sm">
          <h2 className="font-semibold text-gray-500 text-sm uppercase">Consolidated Net Profit</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">KES 0.00</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white border rounded shadow-sm overflow-hidden p-6">
        <h2 className="font-semibold text-lg mb-4">Subsidiary Performance</h2>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Entity</th>
              <th className="p-4 font-semibold text-right">Revenue</th>
              <th className="p-4 font-semibold text-right">Expenses</th>
              <th className="p-4 font-semibold text-right">Net Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="p-4 font-medium">{org.name} (Parent)</td>
              <td className="p-4 text-right">0.00</td>
              <td className="p-4 text-right">0.00</td>
              <td className="p-4 text-right">0.00</td>
            </tr>
            {org.childOrganizations.map(child => (
              <tr key={child.id}>
                <td className="p-4 font-medium">{child.name}</td>
                <td className="p-4 text-right">0.00</td>
                <td className="p-4 text-right">0.00</td>
                <td className="p-4 text-right">0.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
