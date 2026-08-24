import { auth, prisma } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const org = await prisma.organization.findUnique({
    where: { id: (await params).orgId }
  });

  if (!org) redirect("/dashboard");

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-sm h-full flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-bold truncate">{org.name}</h1>
          <p className="text-xs text-gray-500">Base: {org.baseCurrency}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href={`/dashboard/${org.id}`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Overview</Link>
          <div className="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Accounting</div>
          <Link href={`/dashboard/${org.id}/accounting/chart-of-accounts`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Chart of Accounts</Link>
          <Link href={`/dashboard/${org.id}/accounting/journal-entries`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Journal Entries</Link>
          <Link href={`/dashboard/${org.id}/accounting/trial-balance`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Trial Balance</Link>
        
          <div className="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Operations</div>
          <Link href={`/dashboard/${org.id}/crm`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">CRM</Link>
          <Link href={`/dashboard/${org.id}/projects`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Projects</Link>
          <Link href={`/dashboard/${org.id}/tenders`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Tenders</Link>
          <Link href={`/dashboard/${org.id}/assets`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Assets</Link>
        
          <div className="pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">TurningPoint</div>
          <Link href={`/dashboard/${org.id}/editorial`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Editorial</Link>
          <Link href={`/dashboard/${org.id}/pr`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Secretariat & PR</Link>
          <Link href={`/dashboard/${org.id}/ad-sales`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Ad Sales</Link>
          <Link href={`/dashboard/${org.id}/subscribers`} className="block px-4 py-2 text-sm rounded hover:bg-gray-50">Subscribers</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
