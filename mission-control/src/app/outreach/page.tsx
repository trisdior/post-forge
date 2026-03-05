'use client';

import { useEffect, useState, useCallback } from 'react';

interface OutreachData {
  today: { calls: number; texts: number; emails: number; facebookPosts: number };
  streak: number;
  weeklyTotals: { calls: number; texts: number; emails: number; facebookPosts: number };
  dailyGoals: { calls: number; texts: number; emails: number; facebookPosts: number };
  weeklyGoals: { calls: number; texts: number; emails: number; facebookPosts: number };
  entries: Array<{ date: string; calls?: number; texts?: number; emails?: number; facebookPosts?: number }>;
}

const METRICS = [
  { key: 'calls' as const, icon: '📞', label: 'Calls', color: '#22c55e' },
  { key: 'texts' as const, icon: '💬', label: 'Texts', color: '#3b82f6' },
  { key: 'emails' as const, icon: '✉️', label: 'Emails', color: '#a855f7' },
  { key: 'facebookPosts' as const, icon: '📱', label: 'Facebook Posts', color: '#D4A017' },
];

export default function OutreachPage() {
  const [data, setData] = useState<OutreachData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/outreach');
      setData(await r.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!data) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#666]">Loading outreach data...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#222] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-10 lg:ml-0">
          <h1 className="text-lg font-semibold">
            <span className="text-[#D4A017]">📞 Outreach Center</span>
          </h1>
          {data.streak > 0 && (
            <span className="text-sm bg-[#D4A017]/20 text-[#D4A017] px-3 py-1 rounded-full">🔥 {data.streak} day streak</span>
          )}
        </div>
        <button onClick={fetchData} className="px-3 py-1.5 text-xs rounded border border-[#333] text-[#888] hover:text-white hover:border-[#D4A017] transition">
          ↻ Refresh
        </button>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Today's Progress */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">Today&apos;s Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map(m => {
              const current = data.today[m.key] || 0;
              const goal = data.dailyGoals[m.key] || 1;
              const pct = Math.min((current / goal) * 100, 100);
              return (
                <div key={m.key} className="bg-[#161616] border border-[#222] rounded-lg p-5 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="#222" strokeWidth="6" />
                      <circle cx="48" cy="48" r="40" fill="none" stroke={m.color} strokeWidth="6"
                        strokeDasharray={`${pct * 2.513} 251.3`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{current}</span>
                      <span className="text-[10px] text-[#666]">/ {goal}</span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{m.icon} {m.label}</div>
                  <div className="text-xs text-[#666] mt-1">{pct >= 100 ? '✅ Goal met!' : `${Math.round(pct)}% complete`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Totals */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">This Week</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {METRICS.map(m => {
              const current = data.weeklyTotals[m.key] || 0;
              const goal = data.weeklyGoals[m.key] || 1;
              const pct = Math.min((current / goal) * 100, 100);
              return (
                <div key={m.key} className="bg-[#161616] border border-[#222] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">{m.icon} {m.label}</span>
                    <span className="text-xs text-[#888]">{current}/{goal}</span>
                  </div>
                  <div className="w-full bg-[#222] rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Log (last 14 days) */}
        <div>
          <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">Activity Log (Last 14 Days)</h2>
          <div className="bg-[#161616] border border-[#222] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] text-[#666] text-xs uppercase tracking-wider">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-center">📞 Calls</th>
                  <th className="px-4 py-2 text-center">💬 Texts</th>
                  <th className="px-4 py-2 text-center">✉️ Emails</th>
                  <th className="px-4 py-2 text-center">📱 FB Posts</th>
                  <th className="px-4 py-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[#444]">No outreach activity logged yet</td></tr>
                ) : (
                  data.entries.slice(-14).reverse().map(entry => {
                    const total = (entry.calls || 0) + (entry.texts || 0) + (entry.emails || 0) + (entry.facebookPosts || 0);
                    return (
                      <tr key={entry.date} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a]">
                        <td className="px-4 py-2 text-[#888]">{entry.date}</td>
                        <td className="px-4 py-2 text-center">{entry.calls || 0}</td>
                        <td className="px-4 py-2 text-center">{entry.texts || 0}</td>
                        <td className="px-4 py-2 text-center">{entry.emails || 0}</td>
                        <td className="px-4 py-2 text-center">{entry.facebookPosts || 0}</td>
                        <td className="px-4 py-2 text-center font-medium text-[#D4A017]">{total}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
