import { NextResponse } from 'next/server';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const OUTREACH_FILE = 'C:\\Users\\trisd\\clawd\\data\\outreach-log.json';

interface OutreachEntry {
  date: string;
  calls?: number;
  texts?: number;
  emails?: number;
  facebookPosts?: number;
  notes?: string;
}

function loadOutreach(): { entries: OutreachEntry[]; contacts: unknown[] } {
  try {
    if (fs.existsSync(OUTREACH_FILE)) {
      const data = JSON.parse(fs.readFileSync(OUTREACH_FILE, 'utf-8'));
      return { entries: data.entries || [], contacts: data.contacts || [] };
    }
  } catch {}
  return { entries: [], contacts: [] };
}

export async function GET() {
  const data = loadOutreach();
  const today = new Date().toISOString().split('T')[0];
  
  const todayEntry = data.entries.find(e => e.date === today) || {
    date: today, calls: 0, texts: 0, emails: 0, facebookPosts: 0,
  };

  // Calculate streak
  let streak = 0;
  const sorted = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = d.toISOString().split('T')[0];
    const entry = sorted.find(e => e.date === dateStr);
    if (entry && ((entry.calls || 0) + (entry.texts || 0) + (entry.emails || 0) + (entry.facebookPosts || 0)) > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }

  // Weekly totals
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];
  const weekEntries = data.entries.filter(e => e.date >= weekStr);
  const weeklyTotals = {
    calls: weekEntries.reduce((s, e) => s + (e.calls || 0), 0),
    texts: weekEntries.reduce((s, e) => s + (e.texts || 0), 0),
    emails: weekEntries.reduce((s, e) => s + (e.emails || 0), 0),
    facebookPosts: weekEntries.reduce((s, e) => s + (e.facebookPosts || 0), 0),
  };

  return NextResponse.json({
    today: todayEntry,
    streak,
    weeklyTotals,
    entries: data.entries.slice(-30),
    dailyGoals: { calls: 10, texts: 15, emails: 5, facebookPosts: 3 },
    weeklyGoals: { calls: 50, texts: 75, emails: 25, facebookPosts: 15 },
  });
}
