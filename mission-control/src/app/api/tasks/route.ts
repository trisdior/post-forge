import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const TASKS_FILE = 'C:\\Users\\trisd\\clawd\\data\\tasks.json';

interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  category: 'lead-gen' | 'marketing' | 'admin' | 'project' | 'personal';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
  notes?: string;
  createdAt: string;
}

function loadTasks(): Task[] {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveTasks(tasks: Task[]) {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

export async function GET() {
  const tasks = loadTasks();
  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const tasks = loadTasks();
  
  if (body.action === 'add') {
    const task: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: body.title,
      date: body.date,
      time: body.time || undefined,
      category: body.category || 'admin',
      priority: body.priority || 'medium',
      completed: false,
      recurring: body.recurring || null,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    saveTasks(tasks);
    return NextResponse.json({ ok: true, task });
  }
  
  if (body.action === 'toggle') {
    const task = tasks.find(t => t.id === body.id);
    if (task) {
      task.completed = !task.completed;
      saveTasks(tasks);
    }
    return NextResponse.json({ ok: true, task });
  }
  
  if (body.action === 'update') {
    const idx = tasks.findIndex(t => t.id === body.id);
    if (idx > -1) {
      tasks[idx] = { ...tasks[idx], ...body.data };
      saveTasks(tasks);
    }
    return NextResponse.json({ ok: true, task: tasks[idx] });
  }
  
  if (body.action === 'delete') {
    const filtered = tasks.filter(t => t.id !== body.id);
    saveTasks(filtered);
    return NextResponse.json({ ok: true });
  }
  
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
