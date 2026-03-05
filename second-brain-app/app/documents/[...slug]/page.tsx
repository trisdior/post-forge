import { readFile } from "@/lib/workspace";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default async function DocViewPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const filePath = slug.join("/");
  const content = readFile(decodeURIComponent(filePath));

  if (!content) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-zinc-400">File not found: {filePath}</p>
      </div>
    );
  }

  const isMarkdown = filePath.endsWith(".md");
  const isHtml = filePath.endsWith(".html");

  return (
    <div>
      <div className="mb-6">
        <a href="/documents" className="text-amber-400 text-sm hover:underline">← Back to Documents</a>
        <h1 className="text-2xl font-bold mt-2">{filePath.split("/").pop()}</h1>
        <p className="text-xs text-zinc-500">{filePath}</p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        {isMarkdown ? (
          <div
            className="prose text-zinc-300 text-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
          />
        ) : isHtml ? (
          <iframe
            srcDoc={content}
            className="w-full h-[600px] rounded-lg bg-white"
            sandbox=""
          />
        ) : (
          <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono overflow-auto">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
