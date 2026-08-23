import { prisma } from "@/auth";

export default async function OrgDashboard({ params }: { params: { orgId: string } }) {
  const accountCount = await prisma.ledgerAccount.count({ where: { organizationId: params.orgId } });
  const journalCount = await prisma.journalEntry.count({ where: { organizationId: params.orgId } });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">Total Accounts</div>
          <div className="text-3xl font-light">{accountCount}</div>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">Journal Entries</div>
          <div className="text-3xl font-light">{journalCount}</div>
        </div>
      </div>
    </div>
  );
}
