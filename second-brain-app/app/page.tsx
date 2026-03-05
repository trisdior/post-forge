import { getStats, getMemoryFiles } from "@/lib/workspace";
import { getIdeas, CATEGORIES } from "@/lib/ideas";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const stats = getStats();
  const recentMemories = getMemoryFiles().slice(0, 5);
  const ideas = getIdeas();
  const activeIdeas = ideas.filter(i => !["done", "archived"].includes(i.status));
  const highPriority = ideas.filter(i => i.priority === "high" && !["done", "archived"].includes(i.status));

  // Category breakdown
  const catCounts: Record<string, number> = {};
  for (const idea of activeIdeas) {
    catCounts[idea.category] = (catCounts[idea.category] || 0) + 1;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">Dashboard</h1>
      <p className="text-zinc-500 mb-8">Your brain at a glance</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Active Ideas" value={activeIdeas.length} icon="💡" color="text-amber-400" />
        <StatCard label="High Priority" value={highPriority.length} icon="🔴" color="text-red-400" />
        <StatCard label="Memory Files" value={stats.memoryFiles} icon="🧠" />
        <StatCard label="Documents" value={stats.documents} icon="📄" />
        <StatCard label="Pending Tasks" value={stats.pendingTasks} icon="⚡" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High Priority Ideas */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">🔴 High Priority Ideas</h2>
          <div className="space-y-3">
            {highPriority.slice(0, 6).map(idea => {
              const cat = CATEGORIES[idea.category] || CATEGORIES.other;
              return (
                <a key={idea.id} href="/ideas" className="block p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                  <div className="font-medium text-sm">{idea.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${cat.color}`}>{cat.icon} {cat.label}</span>
                    <span className="text-xs text-zinc-600">•</span>
                    <span className="text-xs text-zinc-500">{idea.status}</span>
                  </div>
                </a>
              );
            })}
            {highPriority.length === 0 && <p className="text-sm text-zinc-500">No high priority items 🎉</p>}
          </div>
        </div>

        {/* Ideas by Category */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">📁 Ideas by Category</h2>
          <div className="space-y-3">
            {Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
              const c = CATEGORIES[cat] || CATEGORIES.other;
              return (
                <div key={cat} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  <span className={`text-sm ${c.color}`}>{c.icon} {c.label}</span>
                  <span className="font-mono text-sm text-zinc-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Memories */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">🕐 Recent Memories</h2>
          <div className="space-y-3">
            {recentMemories.map(m => (
              <a key={m.name} href="/memories" className="block p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                <div className="font-medium text-sm">{m.date}</div>
                <div className="text-xs text-zinc-500 mt-1 line-clamp-2">
                  {m.content.split("\n").filter(l => l.startsWith("## ")).map(l => l.replace("## ", "")).join(" • ") || "No sections"}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Brain Stats */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Brain Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total ideas tracked</span>
              <span className="font-mono text-amber-400">{ideas.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Completed ideas</span>
              <span className="font-mono text-emerald-400">{ideas.filter(i => i.status === "done").length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Words in MEMORY.md</span>
              <span className="font-mono text-blue-400">{stats.memoryWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Days of memory</span>
              <span className="font-mono text-purple-400">{stats.memoryFiles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Task completion</span>
              <span className="font-mono text-emerald-400">
                {stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-zinc-100" }: {
  label: string; value: number; icon: string; color?: string;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}
