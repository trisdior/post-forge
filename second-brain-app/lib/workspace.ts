import fs from "fs";
import path from "path";

const WORKSPACE = path.resolve("C:\\Users\\trisd\\clawd");

export function readFile(relativePath: string): string | null {
  try {
    return fs.readFileSync(path.join(WORKSPACE, relativePath), "utf-8");
  } catch {
    return null;
  }
}

export function listFiles(dir: string, ext?: string): string[] {
  try {
    const fullPath = path.join(WORKSPACE, dir);
    if (!fs.existsSync(fullPath)) return [];
    return fs.readdirSync(fullPath)
      .filter(f => !ext || f.endsWith(ext))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export function getMemoryFiles(): { name: string; date: string; content: string }[] {
  const files = listFiles("memory", ".md");
  return files.map(f => ({
    name: f,
    date: f.replace(".md", ""),
    content: readFile(`memory/${f}`) || "",
  }));
}

export function getDocuments(): { name: string; path: string; size: number; modified: Date }[] {
  const docs: { name: string; path: string; size: number; modified: Date }[] = [];
  const scanDirs = ["", "data", "scripts", "agents/hunter"];

  for (const dir of scanDirs) {
    try {
      const fullPath = path.join(WORKSPACE, dir);
      if (!fs.existsSync(fullPath)) continue;
      const entries = fs.readdirSync(fullPath);
      for (const entry of entries) {
        const fp = path.join(fullPath, entry);
        const stat = fs.statSync(fp);
        if (stat.isFile() && /\.(md|html|txt|json|py|ps1|xlsx|csv)$/i.test(entry)) {
          docs.push({
            name: entry,
            path: dir ? `${dir}/${entry}` : entry,
            size: stat.size,
            modified: stat.mtime,
          });
        }
      }
    } catch { /* skip */ }
  }

  return docs.sort((a, b) => b.modified.getTime() - a.modified.getTime());
}

export function getTasks(): { text: string; done: boolean; source: string }[] {
  const tasks: { text: string; done: boolean; source: string }[] = [];
  const memoryContent = readFile("MEMORY.md") || "";

  // Extract tasks from MEMORY.md (lines with - [ ] or - [x] or bullet items under "TODO" sections)
  const lines = memoryContent.split("\n");
  let inTodoSection = false;

  for (const line of lines) {
    if (/##.*todo/i.test(line) || /##.*project/i.test(line) || /##.*active/i.test(line)) {
      inTodoSection = true;
      continue;
    }
    if (/^##/.test(line) && inTodoSection) {
      inTodoSection = false;
      continue;
    }

    const checkboxMatch = line.match(/^-\s*\[([ x~])\]\s*(.+)/);
    if (checkboxMatch) {
      tasks.push({
        text: checkboxMatch[2].trim(),
        done: checkboxMatch[1] !== " ",
        source: "MEMORY.md",
      });
      continue;
    }

    if (inTodoSection) {
      const bulletMatch = line.match(/^-\s+(?:~~)?(.+?)(?:~~)?$/);
      if (bulletMatch) {
        const isDone = line.includes("~~") && line.includes("✅");
        tasks.push({
          text: bulletMatch[1].replace(/~~/g, "").replace(/✅/g, "").trim(),
          done: isDone,
          source: "MEMORY.md",
        });
      }
    }
  }

  return tasks;
}

export function getStats() {
  const memories = listFiles("memory", ".md").length;
  const docs = getDocuments().length;
  const tasks = getTasks();
  const memoryMd = readFile("MEMORY.md") || "";
  const wordCount = memoryMd.split(/\s+/).length;

  return {
    memoryFiles: memories,
    documents: docs,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.done).length,
    pendingTasks: tasks.filter(t => !t.done).length,
    memoryWords: wordCount,
  };
}
