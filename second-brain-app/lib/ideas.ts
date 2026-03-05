import fs from "fs";
import path from "path";

const IDEAS_FILE = path.join("C:\\Users\\trisd\\clawd\\second-brain-app\\data", "ideas.json");

export interface Idea {
  id: number;
  title: string;
  category: string;
  content: string;
  status: "active" | "planning" | "planned" | "in-progress" | "blocked" | "done" | "archived";
  priority: "high" | "medium" | "low";
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function getIdeas(): Idea[] {
  try {
    const raw = fs.readFileSync(IDEAS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveIdeas(ideas: Idea[]) {
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
}

export function addIdea(idea: Omit<Idea, "id" | "createdAt" | "updatedAt">): Idea {
  const ideas = getIdeas();
  const newId = ideas.length ? Math.max(...ideas.map(i => i.id)) + 1 : 1;
  const now = new Date().toISOString();
  const newIdea: Idea = { ...idea, id: newId, createdAt: now, updatedAt: now };
  ideas.push(newIdea);
  saveIdeas(ideas);
  return newIdea;
}

export function updateIdea(id: number, updates: Partial<Idea>): Idea | null {
  const ideas = getIdeas();
  const idx = ideas.findIndex(i => i.id === id);
  if (idx === -1) return null;
  ideas[idx] = { ...ideas[idx], ...updates, updatedAt: new Date().toISOString() };
  saveIdeas(ideas);
  return ideas[idx];
}

export function deleteIdea(id: number): boolean {
  const ideas = getIdeas();
  const filtered = ideas.filter(i => i.id !== id);
  if (filtered.length === ideas.length) return false;
  saveIdeas(filtered);
  return true;
}

export const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  "valencia": { label: "Valencia Construction", icon: "🏗️", color: "text-amber-400" },
  "ai-agency": { label: "AI Agency", icon: "🤖", color: "text-purple-400" },
  "investing": { label: "Investing / Crypto", icon: "💰", color: "text-green-400" },
  "personal-goals": { label: "Personal Goals", icon: "🎯", color: "text-blue-400" },
  "tech": { label: "Tech / Projects", icon: "💻", color: "text-cyan-400" },
  "content": { label: "Content / YouTube", icon: "🎬", color: "text-pink-400" },
  "other": { label: "Other", icon: "💡", color: "text-zinc-400" },
};

export const STATUSES: Record<string, { label: string; color: string }> = {
  "active": { label: "Active", color: "bg-emerald-500/20 text-emerald-400" },
  "in-progress": { label: "In Progress", color: "bg-blue-500/20 text-blue-400" },
  "planning": { label: "Planning", color: "bg-purple-500/20 text-purple-400" },
  "planned": { label: "Planned", color: "bg-zinc-500/20 text-zinc-400" },
  "blocked": { label: "Blocked", color: "bg-red-500/20 text-red-400" },
  "done": { label: "Done", color: "bg-emerald-500/20 text-emerald-500" },
  "archived": { label: "Archived", color: "bg-zinc-700/20 text-zinc-500" },
};
