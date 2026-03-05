'use client';

import { useEffect, useState, useCallback } from 'react';

interface Lead {
  id: number; dateFound: string; source: string; category: string;
  clientName: string; phone: string; email: string; location: string;
  description: string; estValue: number; priority: string; status: string;
  dateContacted: string; followUpDate: string; quoteSent: string; notes: string;
}

const COLUMNS = [
  { key: 'new', label: 'New', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { key: 'contacted', label: 'Contacted', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { key: 'consultation scheduled', label: 'Consultation', color: 'border-purple-500', bg: 'bg-purple-500/10' },
  { key: 'quote sent', label: 'Quote Sent', color: 'border-orange-500', bg: 'bg-orange-500/10' },
  { key: 'won', label: 'Won ✅', color: 'border-green-500', bg: 'bg-green-500/10' },
  { key: 'lost', label: 'Lost', color: 'border-red-500', bg: 'bg-red-500/10' },
];

const PRIORITY_ICONS: Record<string, string> = { Hot: '🔥', Warm: '⚡', Cold: '❄️' };

function fmt$(n: number) { return '$' + n.toLocaleString(); }

function daysSince(dateStr: string) {
  if (!dateStr) return null;
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    try {
      const r = await fetch('/api/leads');
      const d = await r.json();
      setLeads(d.leads || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const getColumnLeads = (status: string) =>
    leads.filter(l => l.status.toLowerCase() === status)
      .sort((a, b) => {
        const pOrder: Record<string, number> = { Hot: 0, Warm: 1, Cold: 2 };
        return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
      });

  const columnTotals = (status: string) =>
    getColumnLeads(status).reduce((s, l) => s + (l.estValue || 0), 0);

  if (loading) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#666]">Loading pipeline...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="border-b border-[#222] px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-10 lg:ml-0">
          <h1 className="text-lg font-semibold">
            <span className="text-[#D4A017]">🔄 Pipeline</span>
            <span className="text-[#888] text-sm ml-3">{leads.length} leads</span>
          </h1>
        </div>
        <button onClick={fetchLeads} className="px-3 py-1.5 text-xs rounded border border-[#333] text-[#888] hover:text-white hover:border-[#D4A017] transition">
          ↻ Refresh
        </button>
      </header>

      <div className="p-4 sm:p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-[900px]">
          {COLUMNS.map(col => {
            const colLeads = getColumnLeads(col.key);
            const total = columnTotals(col.key);
            return (
              <div key={col.key} className="flex-1 min-w-[200px]">
                {/* Column Header */}
                <div className={`border-t-2 ${col.color} rounded-t-lg p-3 bg-[#161616] border-x border-b border-[#222]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{col.label}</span>
                    <span className="text-xs text-[#666] bg-[#0A0A0A] px-2 py-0.5 rounded">{colLeads.length}</span>
                  </div>
                  {total > 0 && <div className="text-xs text-[#D4A017] mt-1">{fmt$(total)}</div>}
                </div>

                {/* Cards */}
                <div className="space-y-2 mt-2">
                  {colLeads.length === 0 && (
                    <div className="text-xs text-[#444] text-center py-8 bg-[#161616]/50 rounded-lg border border-dashed border-[#222]">
                      No leads
                    </div>
                  )}
                  {colLeads.map(lead => {
                    const days = daysSince(lead.dateContacted || lead.dateFound);
                    return (
                      <div key={lead.id} className="bg-[#161616] border border-[#222] rounded-lg p-3 hover:border-[#333] transition cursor-pointer">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-[#D4A017] truncate">{lead.clientName || '(unnamed)'}</span>
                          <span className="text-xs flex-shrink-0 ml-1">{PRIORITY_ICONS[lead.priority] || ''}</span>
                        </div>
                        <div className="text-xs text-[#888] truncate">{lead.category}</div>
                        {lead.estValue > 0 && <div className="text-xs text-[#D4A017] mt-1 font-medium">{fmt$(lead.estValue)}</div>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-[#555]">{lead.source}</span>
                          {days !== null && (
                            <span className={`text-[10px] ${days > 7 ? 'text-red-400' : days > 3 ? 'text-yellow-400' : 'text-[#555]'}`}>
                              {days}d ago
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
