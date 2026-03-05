import { NextResponse } from 'next/server';
import { readLeads } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';

export async function GET() {
  let leads: { leads: Array<{ status: string; estValue: number; dateContacted: string; dateFound: string }> };
  try {
    leads = readLeads();
  } catch {
    leads = { leads: [] };
  }

  const wonLeads = leads.leads.filter(l => l.status?.toLowerCase() === 'won');
  const ytdRevenue = wonLeads.reduce((s, l) => s + (l.estValue || 0), 0);

  // Revenue by month
  const byMonth: Record<string, number> = {};
  wonLeads.forEach(l => {
    const date = l.dateContacted || l.dateFound || '';
    const month = date.slice(0, 7); // YYYY-MM
    if (month) byMonth[month] = (byMonth[month] || 0) + (l.estValue || 0);
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Simple weekly/monthly from won leads
  const weeklyRevenue = wonLeads
    .filter(l => {
      const d = l.dateContacted || l.dateFound || '';
      return d >= weekStart.toISOString().split('T')[0];
    })
    .reduce((s, l) => s + (l.estValue || 0), 0);

  const monthlyRevenue = wonLeads
    .filter(l => {
      const d = l.dateContacted || l.dateFound || '';
      return d >= monthStart.toISOString().split('T')[0];
    })
    .reduce((s, l) => s + (l.estValue || 0), 0);

  return NextResponse.json({
    weeklyRevenue,
    monthlyRevenue,
    ytdRevenue,
    weeklyGoal: 1500,
    monthlyGoal: 6000,
    urusGoal: 200000,
    urusCurrent: ytdRevenue,
    urusDeadline: '2026-12-31',
    byMonth,
  });
}
