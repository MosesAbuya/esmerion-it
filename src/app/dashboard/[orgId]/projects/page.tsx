import { prisma } from "@/auth";
import Link from "next/link";

export default async function ProjectsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const projects = await prisma.project.findMany({
    where: { organizationId: orgId },
    include: { client: true, tasks: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Design & Web Projects</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">New Project</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <p className="text-gray-500 col-span-3">No active projects.</p>
        ) : projects.map(proj => (
          <div key={proj.id} className="bg-white border rounded p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-semibold text-lg">{proj.name}</h2>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{proj.status}</span>
            </div>
            <p className="text-sm text-gray-500 flex-1">{proj.description || "No description provided."}</p>
            <div className="mt-4 pt-4 border-t text-sm flex justify-between text-gray-500">
              <span>{proj.client?.name || "Internal"}</span>
              <span>{proj.tasks.length} Tasks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
