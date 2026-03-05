import { readFile } from "@/lib/workspace";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export default function NotesPage() {
  const soul = readFile("SOUL.md") || "";
  const user = readFile("USER.md") || "";
  const identity = readFile("IDENTITY.md") || "";
  const tools = readFile("TOOLS.md") || "";
  const agents = readFile("AGENTS.md") || "";

  const files = [
    { name: "SOUL.md", icon: "👻", desc: "Who Steve is", content: soul },
    { name: "IDENTITY.md", icon: "🪪", desc: "Steve's identity", content: identity },
    { name: "USER.md", icon: "👤", desc: "About Tris", content: user },
    { name: "AGENTS.md", icon: "🤖", desc: "Agent operating manual", content: agents },
    { name: "TOOLS.md", icon: "🔧", desc: "Tool configurations", content: tools },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">📝 Quick Notes</h1>
      <p className="text-zinc-500 mb-8">Core workspace files</p>

      <div className="space-y-4">
        {files.map(f => (
          <details key={f.name} className="bg-zinc-900 rounded-xl border border-zinc-800">
            <summary className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors rounded-xl">
              <span className="text-lg mr-2">{f.icon}</span>
              <span className="font-medium">{f.name}</span>
              <span className="text-zinc-500 text-sm ml-3">{f.desc}</span>
            </summary>
            <div className="px-6 pb-6">
              <div
                className="prose text-zinc-300 text-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: marked.parse(f.content) as string }}
              />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
