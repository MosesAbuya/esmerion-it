import { prisma } from "@/auth";

export default async function EditorialPage({ params }: { params: Promise<{ orgId: string }> }) {
  const orgId = (await params).orgId;
  const articles = await prisma.article.findMany({
    where: { organizationId: orgId },
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editorial Pipeline</h1>
        <button className="bg-black text-white px-4 py-2 rounded text-sm">New Article</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Author</th>
              <th className="p-4 font-semibold">Publish Date</th>
              <th className="p-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {articles.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No articles found.</td></tr>
            ) : articles.map(article => (
              <tr key={article.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{article.title}</td>
                <td className="p-4 text-gray-600">{article.author?.name || article.author?.email || 'Unassigned'}</td>
                <td className="p-4 text-gray-600">{article.publishDate ? article.publishDate.toLocaleDateString() : 'TBD'}</td>
                <td className="p-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    article.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                    article.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {article.status}
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
