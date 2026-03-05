import { getTasks } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  const tasks = getTasks();
  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-400 mb-2">✅ Tasks</h1>
      <p className="text-zinc-500 mb-8">
        {pending.length} pending • {completed.length} completed
      </p>

      {/* Pending */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-amber-400">⚡ Pending ({pending.length})</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {pending.length === 0 ? (
            <p className="p-4 text-zinc-500 text-sm">All clear! 🎉</p>
          ) : (
            pending.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <span className="text-zinc-600 mt-0.5">☐</span>
                <div>
                  <div className="text-sm">{t.text}</div>
                  <div className="text-xs text-zinc-600 mt-1">Source: {t.source}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-emerald-400">✅ Completed ({completed.length})</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {completed.map((t, i) => (
            <div key={i} className="flex items-start gap-3 p-4 opacity-60">
              <span className="text-emerald-500 mt-0.5">☑</span>
              <div>
                <div className="text-sm line-through">{t.text}</div>
                <div className="text-xs text-zinc-600 mt-1">Source: {t.source}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
