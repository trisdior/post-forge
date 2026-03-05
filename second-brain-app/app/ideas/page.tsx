"use client";

import { useEffect, useState } from "react";

interface Idea {
  id: number;
  title: string;
  category: string;
  content: string;
  status: string;
  priority: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  "all": { label: "All Ideas", icon: "🧠", color: "text-white" },
  "valencia": { label: "Valencia Construction", icon: "🏗️", color: "text-amber-400" },
  "ai-agency": { label: "AI Agency", icon: "🤖", color: "text-purple-400" },
  "investing": { label: "Investing / Crypto", icon: "💰", color: "text-green-400" },
  "personal-goals": { label: "Personal Goals", icon: "🎯", color: "text-blue-400" },
  "tech": { label: "Tech / Projects", icon: "💻", color: "text-cyan-400" },
  "content": { label: "Content / YouTube", icon: "🎬", color: "text-pink-400" },
  "other": { label: "Other", icon: "💡", color: "text-zinc-400" },
};

const STATUSES: Record<string, { label: string; color: string }> = {
  "active": { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  "in-progress": { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  "planning": { label: "Planning", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  "planned": { label: "Planned", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  "blocked": { label: "Blocked", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  "done": { label: "Done", color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" },
  "archived": { label: "Archived", color: "bg-zinc-700/20 text-zinc-500 border-zinc-700/30" },
};

const PRIORITIES: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "", content: "", category: "other", status: "planning", priority: "medium", tags: "",
  });

  useEffect(() => { fetchIdeas(); }, []);

  async function fetchIdeas() {
    const res = await fetch("/api/ideas");
    setIdeas(await res.json());
  }

  async function handleAdd() {
    await fetch("/api/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
    });
    setForm({ title: "", content: "", category: "other", status: "planning", priority: "medium", tags: "" });
    setShowAdd(false);
    fetchIdeas();
  }

  async function handleUpdate(id: number) {
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
    });
    setEditId(null);
    fetchIdeas();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this idea?")) return;
    await fetch(`/api/ideas/${id}`, { method: "DELETE" });
    fetchIdeas();
  }

  async function quickStatus(id: number, status: string) {
    await fetch(`/api/ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchIdeas();
  }

  function startEdit(idea: Idea) {
    setForm({
      title: idea.title,
      content: idea.content,
      category: idea.category,
      status: idea.status,
      priority: idea.priority,
      tags: idea.tags.join(", "),
    });
    setEditId(idea.id);
  }

  const filtered = ideas
    .filter(i => filter === "all" || i.category === filter)
    .filter(i => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q) || i.tags.some(t => t.includes(q));
    })
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return (p[a.priority as keyof typeof p] ?? 1) - (p[b.priority as keyof typeof p] ?? 1);
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">💡 Ideas & Projects</h1>
          <p className="text-zinc-500 mt-1">{ideas.length} total ideas</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ title: "", content: "", category: "other", status: "planning", priority: "medium", tags: "" }); }}
          className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
        >
          + New Idea
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search ideas..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-amber-500"
      />

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(showAdd || editId !== null) && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">{editId ? "Edit Idea" : "New Idea"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-amber-500"
            />
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none"
            >
              {Object.entries(CATEGORIES).filter(([k]) => k !== "all").map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none"
            >
              {Object.entries(STATUSES).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <textarea
            placeholder="Describe your idea..."
            value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-amber-500 resize-none"
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
            className="w-full px-3 py-2 mb-4 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => editId ? handleUpdate(editId) : handleAdd()}
              className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 text-sm"
            >
              {editId ? "Save Changes" : "Add Idea"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setEditId(null); }}
              className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ideas List */}
      <div className="space-y-3">
        {filtered.map(idea => {
          const cat = CATEGORIES[idea.category] || CATEGORIES.other;
          const status = STATUSES[idea.status] || STATUSES.planned;
          const expanded = expandedId === idea.id;

          return (
            <div key={idea.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setExpandedId(expanded ? null : idea.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg mt-0.5">{PRIORITIES[idea.priority] || "🟡"}</span>
                    <div className="flex-1">
                      <div className="font-medium">{idea.title}</div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-xs ${cat.color}`}>{cat.icon} {cat.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${status.color}`}>{status.label}</span>
                        {idea.tags.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500">#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-zinc-600 text-sm">{expanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {expanded && (
                <div className="px-4 pb-4 border-t border-zinc-800 pt-3">
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap mb-4">{idea.content}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => startEdit(idea)} className="text-xs px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-300">✏️ Edit</button>
                    <button onClick={() => quickStatus(idea.id, "done")} className="text-xs px-3 py-1.5 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 text-emerald-400">✅ Done</button>
                    <button onClick={() => quickStatus(idea.id, "active")} className="text-xs px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 text-blue-400">🚀 Active</button>
                    <button onClick={() => quickStatus(idea.id, "blocked")} className="text-xs px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400">🚫 Blocked</button>
                    <button onClick={() => quickStatus(idea.id, "archived")} className="text-xs px-3 py-1.5 bg-zinc-700/30 rounded-lg hover:bg-zinc-700/50 text-zinc-500">📦 Archive</button>
                    <button onClick={() => handleDelete(idea.id)} className="text-xs px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-400 ml-auto">🗑️ Delete</button>
                  </div>
                  <div className="text-xs text-zinc-600 mt-3">
                    Created: {new Date(idea.createdAt).toLocaleDateString()} • Updated: {new Date(idea.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-4xl mb-3">💭</p>
            <p>No ideas found. Add one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
