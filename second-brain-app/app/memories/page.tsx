import { getMemoryFiles, readFile } from "@/lib/workspace";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default function MemoriesPage() {
  const memories = getMemoryFiles();
  const longTermMemory = readFile("MEMORY.md") || "";

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">🧠 Memories</h1>
      <p className="text-zinc-500 mb-8">Everything Steve remembers</p>

      {/* Long-term Memory */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-amber-400">📌 Long-Term Memory (MEMORY.md)</h2>
        <div
          className="prose text-zinc-300 text-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: marked.parse(longTermMemory) as string }}
        />
      </div>

      {/* Daily Memories */}
      <h2 className="text-lg font-semibold mb-4">📅 Daily Memory Files</h2>
      <div className="space-y-4">
        {memories.map(m => (
          <details key={m.name} className="bg-zinc-900 rounded-xl border border-zinc-800">
            <summary className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors rounded-xl">
              <span className="font-medium">{m.date}</span>
              <span className="text-zinc-500 text-sm ml-3">
                {m.content.split("\n").filter(l => l.startsWith("## ")).map(l => l.replace("## ", "")).join(" • ")}
              </span>
            </summary>
            <div className="px-6 pb-6">
              <div
                className="prose text-zinc-300 text-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(m.content) as string }}
              />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
