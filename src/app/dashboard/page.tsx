import { auth, prisma } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createOrganization } from "@/app/actions/organization";

export default async function DashboardIndex() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id! },
    include: { organization: true }
  });

  const createTestOrg = async (formData: FormData) => {
    "use server";
    const name = formData.get("name") as string;
    const slug = name.toLowerCase().replace(/\\s+/g, '-');
    const org = await createOrganization(name, slug, "KES");
    const session = await auth();
    await prisma.membership.create({
      data: {
        userId: session!.user.id!,
        organizationId: org.id,
        role: "OWNER"
      }
    });
    redirect(`/dashboard/${org.id}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Select Organization</h1>
      
      {memberships.length > 0 ? (
        <div className="grid gap-4 mb-8">
          {memberships.map(m => (
            <Link key={m.id} href={`/dashboard/${m.organizationId}`} className="block p-6 bg-white border rounded shadow hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{m.organization.name}</h2>
              <p className="text-gray-500 text-sm">Role: {m.role}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mb-8 text-gray-500">You are not a member of any organizations yet.</p>
      )}

      <div className="p-6 bg-gray-50 rounded">
        <h2 className="text-lg font-bold mb-4">Create Test Organization</h2>
        <form action={createTestOrg} className="flex gap-4">
          <input name="name" required placeholder="Organization Name" className="border p-2 rounded flex-1" />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded">Create & Seed</button>
        </form>
      </div>
    </div>
  );
}
