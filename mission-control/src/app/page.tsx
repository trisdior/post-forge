'use client';

import { useEffect, useState, useCallback } from 'react';
import RevenueSystems from '@/components/RevenueSystems';
import ApprovalQueue from '@/components/ApprovalQueue';
import SocialMediaCalendar from '@/components/SocialMediaCalendar';

interface Lead {
  id: number; dateFound: string; source: string; category: string;
  clientName: string; phone: string; email: string; location: string;
  description: string; estValue: number; priority: string; status: string;
  dateContacted: string; followUpDate: string; quoteSent: string; notes: string;
}
interface Stats {
  totalLeads: number; newLeads: number; quotesSent: number; won: number;
  lost: number; pipelineValue: number; wonRevenue: number; closeRate: number;
  bySource: Record<string, number>; byCategory: Record<string, number>;
}
interface Agent { name: string; emoji: string; role: string; status: string; detail: string; leadsToday?: number; }
interface Revenue {
  weeklyRevenue: number; monthlyRevenue: number; ytdRevenue: number;
  weeklyGoal: number; monthlyGoal: number; urusGoal: number; urusCurrent: number;
  byMonth: Record<string, number>;
}
interface OutreachData {
  today: { calls: number; texts: number; emails: number; facebookPosts: number };
  streak: number;
  weeklyTotals: { calls: number; texts: number; emails: number; facebookPosts: number };
  dailyGoals: { calls: number; texts: number; emails: number; facebookPosts: number };
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  contacted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'consultation scheduled': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'quote sent': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  won: 'bg-green-500/20 text-green-400 border-green-500/30',
  lost: 'bg-red-500/20 text-red-400 border-red-500/30',
  'no response': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  queued: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'draft-ready': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  engaged: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  'follow-up': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};
const PRIORITY_ICONS: Record<string, string> = { Hot: '🔥', Warm: '⚡', Cold: '❄️' };

function fmt$(n: number) { return '$' + n.toLocaleString(); }

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [outreach, setOutreach] = useState<OutreachData | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortCol, setSortCol] = useState<keyof Lead>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionMsg, setActionMsg] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchData = useCallback(async () => {
    setSyncing(true);
    try {
      const [lr, ar, rv, or_, aq] = await Promise.all([
        fetch('/api/leads'), fetch('/api/agents'), fetch('/api/revenue'), fetch('/api/outreach'),
        fetch('/api/approval-queue?status=pending-approval'),
      ]);
      const ld = await lr.json();
      const ad = await ar.json();
      const rd = await rv.json();
      const od = await or_.json();
      const aqd = await aq.json();
      setLeads(ld.leads || []);
      setStats(ld.stats || null);
      setAgents(ad.agents || []);
      setRevenue(rd);
      setOutreach(od);
      setPendingCount(Array.isArray(aqd) ? aqd.length : 0);
    } catch (e) { console.error(e); }
    setSyncing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerAction = async (action: string) => {
    try {
      const r = await fetch('/api/actions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const d = await r.json();
      setActionMsg(d.message || 'Action triggered');
      setTimeout(() => setActionMsg(''), 4000);
    } catch { setActionMsg('Failed to trigger action'); }
  };

  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))];
  const categories = [...new Set(leads.map(l => l.category).filter(Boolean))];

  // Alerts
  const today = new Date().toISOString().split('T')[0];
  const alerts: { text: string; level: 'red' | 'yellow' | 'green' }[] = [];
  const hotUncontacted = leads.filter(l => l.priority === 'Hot' && l.status.toLowerCase() === 'new');
  if (hotUncontacted.length > 0) alerts.push({ text: `🔥 ${hotUncontacted.length} hot lead${hotUncontacted.length > 1 ? 's' : ''} not contacted`, level: 'red' });
  const overdue = leads.filter(l => l.followUpDate && l.followUpDate < today && !['won', 'lost'].includes(l.status.toLowerCase()));
  if (overdue.length > 0) alerts.push({ text: `⏰ ${overdue.length} overdue follow-up${overdue.length > 1 ? 's' : ''}`, level: 'yellow' });
  const stale = leads.filter(l => {
    if (['won', 'lost'].includes(l.status.toLowerCase())) return false;
    const lastDate = l.dateContacted || l.dateFound;
    if (!lastDate) return false;
    const diff = (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7;
  });
  if (stale.length > 0) alerts.push({ text: `💤 ${stale.length} stale lead${stale.length > 1 ? 's' : ''} (>7 days)`, level: 'yellow' });

  let filtered = leads.filter(l => {
    if (filterStatus !== 'all' && l.status.toLowerCase() !== filterStatus) return false;
    if (filterSource !== 'all' && l.source !== filterSource) return false;
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    return true;
  });
  filtered.sort((a, b) => {
    const av = a[sortCol], bv = b[sortCol];
    const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (col: keyof Lead) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const alertColors = { red: 'bg-red-500/10 border-red-500/30 text-red-400', yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400', green: 'bg-green-500/10 border-green-500/30 text-green-400' };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header */}
      <header className="border-b border-[#222] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-10 lg:ml-0">
          <h1 className="text-sm sm:text-lg font-semibold tracking-wide">
            <span className="text-[#D4A017]">VALENCIA</span>
            <span className="text-[#555] mx-2 hidden sm:inline">—</span>
            <span className="text-[#888] hidden sm:inline">MISSION CONTROL</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={() => setShowModal(true)} className="px-3 py-1.5 text-xs rounded bg-[#D4A017] text-black font-medium hover:bg-[#B8860B] transition">
            + Add Lead
          </button>
          <button onClick={fetchData} disabled={syncing} className="px-3 py-1.5 text-xs rounded border border-[#333] text-[#888] hover:text-white hover:border-[#D4A017] transition disabled:opacity-50">
            {syncing ? '⟳' : '↻'} Sync
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[#222] px-4 sm:px-6 flex gap-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'dashboard' 
              ? 'border-[#D4A017] text-[#D4A017]' 
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('revenue-systems')}
          className={`py-3 px-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'revenue-systems'
              ? 'border-[#D4A017] text-[#D4A017]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          🚀 Revenue Systems
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`py-3 px-2 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-[#D4A017] text-[#D4A017]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          🤝 Approvals
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('social-calendar')}
          className={`py-3 px-2 text-sm font-medium border-b-2 transition ${
            activeTab === 'social-calendar'
              ? 'border-[#D4A017] text-[#D4A017]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          📅 Social Calendar
        </button>
      </div>

      {/* Action notification */}
      {actionMsg && (
        <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-pulse">
          ✅ {actionMsg}
        </div>
      )}

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <div className="mx-4 sm:mx-6 mt-3 flex flex-wrap gap-2">
          {alerts.map((a, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg border text-sm ${alertColors[a.level]}`}>
              {a.text}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-6">
        {activeTab === 'revenue-systems' && <RevenueSystems />}

        {activeTab === 'approvals' && <ApprovalQueue />}

        {activeTab === 'social-calendar' && <SocialMediaCalendar />}

        {activeTab === 'dashboard' && (
          <>
        {/* Revenue + Outreach + Quick Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Revenue Widget */}
          {revenue && (
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">💰 Revenue Tracker</h2>
              <div className="space-y-3">
                <ProgressRow label="Weekly" current={revenue.weeklyRevenue} goal={revenue.weeklyGoal} />
                <ProgressRow label="Monthly" current={revenue.monthlyRevenue} goal={revenue.monthlyGoal} />
                <ProgressRow label="YTD" current={revenue.ytdRevenue} goal={revenue.urusGoal} />
                <div className="pt-2 border-t border-[#222]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#888]">🏎️ Lamborghini Urus Fund</span>
                    <span className="text-xs text-[#D4A017]">{fmt$(revenue.urusCurrent)} / {fmt$(revenue.urusGoal)}</span>
                  </div>
                  <div className="w-full bg-[#222] rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#B8860B] to-[#D4A017] rounded-full transition-all"
                      style={{ width: `${Math.min((revenue.urusCurrent / revenue.urusGoal) * 100, 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-[#555] mt-1">{((revenue.urusCurrent / revenue.urusGoal) * 100).toFixed(1)}% — Target: End of 2026</div>
                </div>
                {/* Mini month chart */}
                {Object.keys(revenue.byMonth).length > 0 && (
                  <div className="pt-2 border-t border-[#222]">
                    <div className="text-[10px] text-[#666] mb-2 uppercase">Revenue by Month</div>
                    <div className="flex items-end gap-1 h-16">
                      {Object.entries(revenue.byMonth).sort(([a],[b]) => a.localeCompare(b)).slice(-6).map(([month, val]) => {
                        const max = Math.max(...Object.values(revenue.byMonth), 1);
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full bg-[#D4A017] rounded-t" style={{ height: `${(val / max) * 48}px` }} />
                            <span className="text-[8px] text-[#666]">{month.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Outreach Activity */}
          {outreach && (
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-[#666]">📞 Today&apos;s Outreach</h2>
                {outreach.streak > 0 && (
                  <span className="text-xs bg-[#D4A017]/20 text-[#D4A017] px-2 py-0.5 rounded">🔥 {outreach.streak} day streak</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'calls', icon: '📞', label: 'Calls' },
                  { key: 'texts', icon: '💬', label: 'Texts' },
                  { key: 'emails', icon: '✉️', label: 'Emails' },
                  { key: 'facebookPosts', icon: '📱', label: 'FB Posts' },
                ] as const).map(item => {
                  const current = outreach.today[item.key] || 0;
                  const goal = outreach.dailyGoals[item.key] || 1;
                  const pct = Math.min((current / goal) * 100, 100);
                  return (
                    <div key={item.key} className="relative flex flex-col items-center p-3 rounded-lg bg-[#0A0A0A]">
                      {/* Progress ring */}
                      <div className="relative w-14 h-14 mb-1">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#222" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#D4A017" strokeWidth="4"
                            strokeDasharray={`${pct * 1.508} 150.8`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{current}</span>
                      </div>
                      <span className="text-[10px] text-[#888]">{item.icon} {item.label}</span>
                      <span className="text-[9px] text-[#555]">Goal: {goal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions + Agent Feed */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">⚡ Quick Actions</h2>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => triggerAction('cl-scan')}
                  className="w-full text-left px-3 py-2 rounded-lg border border-[#333] text-sm text-[#ccc] hover:border-[#D4A017] hover:text-[#D4A017] transition">
                  🔍 Run CL Scan
                </button>
                <button onClick={() => triggerAction('outreach-package')}
                  className="w-full text-left px-3 py-2 rounded-lg border border-[#333] text-sm text-[#ccc] hover:border-[#D4A017] hover:text-[#D4A017] transition">
                  📦 Generate Outreach Package
                </button>
                <button onClick={() => triggerAction('check-leads')}
                  className="w-full text-left px-3 py-2 rounded-lg border border-[#333] text-sm text-[#ccc] hover:border-[#D4A017] hover:text-[#D4A017] transition">
                  ✅ Check Leads
                </button>
              </div>
            </div>

            {/* Live Agent Feed */}
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">🤖 Agent Feed</h2>
              <div className="space-y-3">
                {agents.map(a => (
                  <div key={a.name} className="flex items-start gap-2">
                    <span className="text-lg">{a.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{a.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] text-[#555] ml-auto">Active now</span>
                      </div>
                      <div className="text-xs text-[#888] mt-0.5">{a.detail}</div>
                      {a.leadsToday !== undefined && a.leadsToday > 0 && (
                        <div className="text-xs text-[#D4A017] mt-0.5">Found {a.leadsToday} new leads today</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
            {[
              { label: 'Total Leads', value: stats.totalLeads },
              { label: 'New', value: stats.newLeads },
              { label: 'Quotes Sent', value: stats.quotesSent },
              { label: 'Won', value: stats.won },
              { label: 'Pipeline', value: fmt$(stats.pipelineValue) },
              { label: 'Revenue', value: fmt$(stats.wonRevenue) },
              { label: 'Close Rate', value: stats.closeRate + '%' },
            ].map(s => (
              <div key={s.label} className="bg-[#161616] border border-[#222] rounded-lg p-3 sm:p-4">
                <div className="text-[#666] text-[10px] sm:text-xs uppercase tracking-wider mb-1">{s.label}</div>
                <div className="text-lg sm:text-2xl font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content: Lead Table + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lead Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters */}
            <div className="flex gap-3 items-center flex-wrap">
              <span className="text-xs text-[#666] uppercase tracking-wider">Filters:</span>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-[#161616] border border-[#222] rounded px-2 py-1 text-xs text-[#aaa]">
                <option value="all">All Status</option>
                {['New','Contacted','Consultation Scheduled','Quote Sent','Won','Lost','No Response'].map(s => (
                  <option key={s} value={s.toLowerCase()}>{s}</option>
                ))}
              </select>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                className="bg-[#161616] border border-[#222] rounded px-2 py-1 text-xs text-[#aaa]">
                <option value="all">All Sources</option>
                {sources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="bg-[#161616] border border-[#222] rounded px-2 py-1 text-xs text-[#aaa]">
                <option value="all">All Categories</option>
                {categories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className="bg-[#161616] border border-[#222] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#222] text-[#666] text-xs uppercase tracking-wider">
                      {([
                        ['id', '#'], ['dateFound', 'Date'], ['source', 'Source'], ['category', 'Category'],
                        ['clientName', 'Client'], ['location', 'Location'], ['description', 'Description'],
                        ['estValue', 'Est Value'], ['priority', 'Priority'], ['status', 'Status'],
                      ] as [keyof Lead, string][]).map(([col, label]) => (
                        <th key={col} className="px-3 py-2 text-left cursor-pointer hover:text-[#D4A017] select-none whitespace-nowrap" onClick={() => toggleSort(col)}>
                          {label} {sortCol === col && (sortDir === 'asc' ? '↑' : '↓')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={10} className="px-3 py-12 text-center text-[#444]">
                        No leads yet. Add your first lead or run a CL scan.
                      </td></tr>
                    ) : filtered.map(l => (
                      <tr key={l.id} onClick={() => setSelectedLead(l)} className="border-b border-[#1a1a1a] hover:bg-[#1a1a1a] transition cursor-pointer">
                        <td className="px-3 py-2 text-[#666]">{l.id}</td>
                        <td className="px-3 py-2 text-[#888] whitespace-nowrap">{l.dateFound}</td>
                        <td className="px-3 py-2">{l.source}</td>
                        <td className="px-3 py-2">{l.category}</td>
                        <td className="px-3 py-2 font-medium text-[#D4A017]">{l.clientName || '(unnamed)'}</td>
                        <td className="px-3 py-2 text-[#888]">{l.location}</td>
                        <td className="px-3 py-2 text-[#888] max-w-[200px] truncate">{l.description}</td>
                        <td className="px-3 py-2 text-[#D4A017]">{l.estValue ? fmt$(l.estValue) : '—'}</td>
                        <td className="px-3 py-2">
                          <span className="whitespace-nowrap">{PRIORITY_ICONS[l.priority] || ''} {l.priority}</span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[l.status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Charts */}
          <div className="space-y-4">
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">Leads by Source</h2>
              {stats && Object.keys(stats.bySource).length > 0 ? (
                <BarChart data={stats.bySource} />
              ) : (
                <p className="text-xs text-[#444]">No data yet</p>
              )}
            </div>
            <div className="bg-[#161616] border border-[#222] rounded-lg p-4">
              <h2 className="text-xs uppercase tracking-wider text-[#666] mb-3">Leads by Category</h2>
              {stats && Object.keys(stats.byCategory).length > 0 ? (
                <BarChart data={stats.byCategory} />
              ) : (
                <p className="text-xs text-[#444]">No data yet</p>
              )}
            </div>
          </div>
        </div>
          </>
        )}

      {showModal && <AddLeadModal onClose={() => setShowModal(false)} onAdded={() => { setShowModal(false); fetchData(); }} />}
      {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      </div>
    </div>
  );
}

function ProgressRow({ label, current, goal }: { label: string; current: number; goal: number }) {
  const pct = Math.min((current / goal) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#888]">{label}</span>
        <span className="text-xs text-[#D4A017]">{fmt$(current)} / {fmt$(goal)}</span>
      </div>
      <div className="w-full bg-[#222] rounded-full h-2 overflow-hidden">
        <div className="h-full bg-[#D4A017] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BarChart({ data }: { data: Record<string, number> }) {
  const max = Math.max(...Object.values(data), 1);
  return (
    <div className="space-y-2">
      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([label, count]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-xs text-[#888] w-24 truncate">{label}</span>
          <div className="flex-1 bg-[#222] rounded-full h-2 overflow-hidden">
            <div className="h-full bg-[#D4A017] rounded-full transition-all" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="text-xs text-[#666] w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

function getGamePlan(lead: Lead): { steps: string[]; script: string; timing: string } {
  const cat = lead.category?.toLowerCase() || '';
  const priority = lead.priority || 'Warm';
  const status = lead.status?.toLowerCase() || 'new';
  const name = lead.clientName || 'the homeowner';
  const timing = priority === 'Hot' ? '⚡ Contact within 1 hour' : priority === 'Warm' ? '📞 Contact within 24 hours' : '📋 Contact within 48 hours';
  let steps: string[] = [];
  let script = '';
  if (status === 'new' || status === 'no response') {
    steps = [`Call/text ${name} — introduce yourself as the owner of Valencia Construction`, 'Ask about their project scope, timeline, and budget range', 'Offer a free in-home estimate at their convenience', 'If no answer: send a text, follow up in 24h, then again in 72h', 'Log result in lead tracker and set follow-up date'];
    script = `"Hi ${name}, this is Christopher from Valencia Construction. I saw your post about ${cat || 'your project'} and wanted to reach out. We're a licensed and insured GC here in Chicago — I'd love to come take a look and give you a free estimate. When works best for you?"`;
  } else if (status === 'contacted') {
    steps = ['Follow up — ask if they had a chance to think about scheduling an estimate', 'Mention a specific benefit (licensed, insured, owner-managed)', 'Offer 2-3 specific time slots this week', 'If hesitant: offer to answer any questions first'];
    script = `"Hey ${name}, just following up from our conversation. I've got some availability this week if you'd like me to come take a look at your ${cat || 'project'}. No pressure — happy to answer any questions first."`;
  } else if (status === 'consultation scheduled') {
    steps = ['Confirm appointment day-of with a text', 'Bring business cards and flyer', 'Take measurements, photos, and detailed notes', 'Discuss timeline, materials, and budget honestly', 'Send 3-tier proposal within 24 hours'];
    script = `"Looking forward to seeing your place today, ${name}. I'll take some measurements and we'll talk through exactly what you're looking for. I'll have a detailed quote to you within a day or two."`;
  } else if (status === 'quote sent') {
    steps = ['Follow up 48h after sending quote', 'Ask if they have questions about any of the options', 'Be ready to negotiate on scope, not price', 'Create urgency: mention current scheduling availability', 'If they go silent: follow up at 1 week and 2 weeks'];
    script = `"Hi ${name}, wanted to check in on the estimate I sent over. Did you get a chance to look it through? Happy to walk through any of the options or adjust the scope if needed."`;
  } else {
    steps = ['Lead is ' + status + ' — review notes and decide next action'];
  }
  if (cat.includes('kitchen')) steps.push('💡 Tip: Mention cabinet + countertop combos. Kitchens sell on visuals — bring photos');
  else if (cat.includes('bathroom')) steps.push('💡 Tip: Emphasize waterproofing quality — differentiator from cheap contractors');
  else if (cat.includes('basement')) steps.push('💡 Tip: Ask about egress windows early — code requirement that surprises many homeowners');
  else if (cat.includes('paint') || cat.includes('handyman')) steps.push('💡 Tip: Quick turnaround jobs — emphasize speed and convenience');
  return { steps, script, timing };
}

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const plan = getGamePlan(lead);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161616] border border-[#222] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="border-b border-[#222] p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-[#D4A017]">{lead.clientName || '(Unnamed Lead)'}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_COLORS[lead.status.toLowerCase()] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>{lead.status}</span>
              <span className="text-sm">{PRIORITY_ICONS[lead.priority] || ''} {lead.priority}</span>
            </div>
            <div className="text-sm text-[#888]">Lead #{lead.id} • {lead.source} • {lead.dateFound}</div>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white text-xl transition">✕</button>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Category</span><div className="text-sm font-medium">{lead.category || '—'}</div></div>
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Location</span><div className="text-sm">{lead.location || '—'}</div></div>
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Est. Value</span><div className="text-sm text-[#D4A017] font-semibold">{lead.estValue ? fmt$(lead.estValue) : '—'}</div></div>
            </div>
            <div className="space-y-2">
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Phone</span><div className="text-sm">{lead.phone ? <a href={`tel:${lead.phone}`} className="text-[#D4A017] hover:underline">{lead.phone}</a> : '—'}</div></div>
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Email</span><div className="text-sm">{lead.email ? <a href={`mailto:${lead.email}`} className="text-[#D4A017] hover:underline">{lead.email}</a> : '—'}</div></div>
              <div><span className="text-xs text-[#666] uppercase tracking-wider">Follow-up Date</span><div className="text-sm">{lead.followUpDate || '—'}</div></div>
            </div>
          </div>
          {lead.description && (<div><span className="text-xs text-[#666] uppercase tracking-wider">Description</span><div className="text-sm mt-1 bg-[#0A0A0A] border border-[#222] rounded-lg p-3">{lead.description}</div></div>)}
          {lead.notes && (<div><span className="text-xs text-[#666] uppercase tracking-wider">Notes</span><div className="text-sm mt-1 bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-[#888]">{lead.notes}</div></div>)}
          <div className="border border-[#D4A017]/30 bg-[#D4A017]/5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎯</span>
              <h3 className="font-bold text-[#D4A017]">Game Plan</h3>
              <span className="ml-auto text-xs bg-[#D4A017]/20 text-[#D4A017] px-2 py-0.5 rounded">{plan.timing}</span>
            </div>
            <div className="space-y-2 mb-4">
              {plan.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <span className="text-[#D4A017] font-bold flex-shrink-0">{step.startsWith('💡') ? '' : `${i + 1}.`}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            {plan.script && (
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wider mb-1">📝 Suggested Script</div>
                <div className="text-sm bg-[#0A0A0A] border border-[#222] rounded-lg p-3 italic text-[#ccc] leading-relaxed">{plan.script}</div>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {lead.phone && <a href={`tel:${lead.phone}`} className="flex-1 text-center py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition min-w-[100px]">📞 Call</a>}
            {lead.phone && <a href={`sms:${lead.phone}`} className="flex-1 text-center py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition min-w-[100px]">💬 Text</a>}
            {lead.email && <a href={`mailto:${lead.email}`} className="flex-1 text-center py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition min-w-[100px]">✉️ Email</a>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddLeadModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [form, setForm] = useState({ source: '', category: '', clientName: '', location: '', description: '', estValue: '', priority: 'Warm', notes: '' });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/leads/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, estValue: Number(form.estValue) || 0 }) });
      onAdded();
    } catch (err) { console.error(err); }
    setSaving(false);
  };
  const input = "w-full bg-[#0A0A0A] border border-[#333] rounded px-3 py-1.5 text-sm text-white placeholder-[#555] focus:border-[#D4A017] focus:outline-none";
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#161616] border border-[#222] rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Add New Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className={input} placeholder="Source (e.g. Craigslist)" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
          <input className={input} placeholder="Category (e.g. Remodel)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className={input} placeholder="Client Name" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} />
          <input className={input} placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className={input} placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <input className={input} placeholder="Est. Value ($)" type="number" value={form.estValue} onChange={e => setForm({ ...form, estValue: e.target.value })} />
          <select className={input} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="Hot">🔥 Hot</option><option value="Warm">⚡ Warm</option><option value="Cold">❄️ Cold</option>
          </select>
          <textarea className={input + ' resize-none h-16'} placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-3 py-2 text-sm rounded border border-[#333] text-[#888] hover:text-white transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-3 py-2 text-sm rounded bg-[#D4A017] text-black font-medium hover:bg-[#B8860B] transition disabled:opacity-50">{saving ? 'Saving...' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
