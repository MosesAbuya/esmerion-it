import { auth } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-2">Welcome to Esmerion IT. Select an organization from the top bar to get started.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white text-zinc-950 shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Organizations</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{(session?.user as any)?.memberships?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
