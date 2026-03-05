import { getDocuments, readFile } from "@/lib/workspace";

export const dynamic = "force-dynamic";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIcon(name: string): string {
  if (name.endsWith(".md")) return "📝";
  if (name.endsWith(".html")) return "🌐";
  if (name.endsWith(".json")) return "📊";
  if (name.endsWith(".py")) return "🐍";
  if (name.endsWith(".ps1")) return "⚡";
  if (name.endsWith(".xlsx") || name.endsWith(".csv")) return "📈";
  if (name.endsWith(".txt")) return "📄";
  return "📎";
}

export default function DocumentsPage() {
  const docs = getDocuments();

  // Group by directory
  const grouped: Record<string, typeof docs> = {};
  for (const doc of docs) {
    const dir = doc.path.includes("/") ? doc.path.split("/")[0] : "root";
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(doc);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">📄 Documents</h1>
      <p className="text-zinc-500 mb-8">{docs.length} files in workspace</p>

      {Object.entries(grouped).map(([dir, files]) => (
        <div key={dir} className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            📁 {dir === "root" ? "Workspace Root" : dir}
          </h2>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
            {files.map(doc => (
              <a
                key={doc.path}
                href={`/documents/${encodeURIComponent(doc.path)}`}
                className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getIcon(doc.name)}</span>
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-zinc-500">{doc.path}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">{formatSize(doc.size)}</div>
                  <div className="text-xs text-zinc-600">{doc.modified.toLocaleDateString()}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
