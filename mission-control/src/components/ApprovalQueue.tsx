'use client';

import { useEffect, useState, useCallback } from 'react';

interface QueueItem {
  id: string;
  source: string;
  leadName: string;
  postUrl: string;
  score: number;
  status: string;
  draftReply: string | null;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

const SOURCE_ICONS: Record<string, string> = {
  facebook: '📱',
  reddit: '🔗',
  nextdoor: '🏘️',
  craigslist: '📋',
};

const SOURCE_COLORS: Record<string, string> = {
  facebook: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  reddit: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  nextdoor: 'bg-green-500/10 border-green-500/30 text-green-400',
  craigslist: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
};

export default function ApprovalQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [filter, setFilter] = useState('pending-approval');

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/approval-queue?status=${filter}`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('Failed to fetch queue:', e);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAction = async (id: string, action: 'approve' | 'reject', editedReply?: string) => {
    try {
      const res = await fetch('/api/approval-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, editedReply }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(`${action === 'approve' ? 'Approved' : 'Rejected'} — ${data.item.leadName}`);
        setTimeout(() => setActionMsg(''), 3000);
        setEditingId(null);
        fetchQueue();
      }
    } catch (e) {
      console.error('Action failed:', e);
      setActionMsg('Failed to process action');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const startEdit = (item: QueueItem) => {
    setEditingId(item.id);
    setEditText(item.draftReply || '');
  };

  const saveEdit = (id: string) => {
    handleAction(id, 'approve', editText);
  };

  const scoreColor = (score: number) => {
    if (score >= 50) return 'text-red-400';
    if (score >= 25) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const scoreIcon = (score: number) => {
    if (score >= 50) return '🔥';
    if (score >= 25) return '⚡';
    return '❄️';
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#D4A017]">🤝 Approval Queue</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-[#161616] border border-[#222] rounded px-2 py-1 text-xs text-[#aaa]"
          >
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="sent">Sent</option>
            <option value="all">All</option>
          </select>
          <button
            onClick={fetchQueue}
            className="px-3 py-1 text-xs rounded border border-[#333] text-[#888] hover:text-white hover:border-[#D4A017] transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Action notification */}
      {actionMsg && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm animate-pulse">
          {actionMsg}
        </div>
      )}

      {/* Queue Cards */}
      {loading ? (
        <div className="text-center py-12 text-[#444]">Loading queue...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-[#666] text-sm">
            {filter === 'pending-approval' ? 'No drafts waiting for approval' : `No items with status "${filter}"`}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-[#161616] border border-[#222] rounded-lg p-5 hover:border-[#333] transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${SOURCE_COLORS[item.source] || 'bg-gray-500/10 border-gray-500/30 text-gray-400'}`}>
                    {SOURCE_ICONS[item.source] || '📄'} {item.source}
                  </span>
                  <span className={`text-sm font-medium ${scoreColor(item.score)}`}>
                    {scoreIcon(item.score)} {item.score}
                  </span>
                </div>
                <span className="text-[10px] text-[#555]">{timeAgo(item.createdAt)}</span>
              </div>

              {/* Lead Info */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {item.leadName || '(unnamed lead)'}
                </h3>
                {item.postUrl && (
                  <a
                    href={item.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4A017] hover:underline truncate block"
                  >
                    {item.postUrl}
                  </a>
                )}
              </div>

              {/* Draft Reply */}
              {item.draftReply && editingId !== item.id && (
                <div className="mb-4">
                  <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Draft Reply</div>
                  <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm text-[#ccc] leading-relaxed">
                    {item.draftReply}
                  </div>
                </div>
              )}

              {/* Edit Mode */}
              {editingId === item.id && (
                <div className="mb-4">
                  <div className="text-[10px] text-[#666] uppercase tracking-wider mb-1">Edit Reply</div>
                  <textarea
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#D4A017]/50 rounded-lg p-3 text-sm text-white resize-none h-24 focus:outline-none focus:border-[#D4A017]"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="px-3 py-1.5 text-xs rounded bg-[#D4A017] text-black font-medium hover:bg-[#B8860B] transition"
                    >
                      Save & Approve
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs rounded border border-[#333] text-[#888] hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* No draft yet */}
              {!item.draftReply && item.status === 'new' && (
                <div className="mb-4 p-3 bg-[#0A0A0A] border border-[#222] rounded-lg text-xs text-[#555] italic">
                  Waiting for Karl to draft a reply...
                </div>
              )}

              {/* Action Buttons */}
              {item.status === 'pending-approval' && editingId !== item.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(item.id, 'approve')}
                    className="flex-1 px-3 py-2 text-xs rounded bg-green-600 text-white font-medium hover:bg-green-700 transition"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex-1 px-3 py-2 text-xs rounded border border-[#D4A017]/50 text-[#D4A017] font-medium hover:bg-[#D4A017]/10 transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'reject')}
                    className="flex-1 px-3 py-2 text-xs rounded border border-red-500/50 text-red-400 font-medium hover:bg-red-500/10 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {/* Status badge for non-pending items */}
              {item.status !== 'pending-approval' && (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                    item.status === 'approved' ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : item.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : item.status === 'sent' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] text-[#555]">Updated {timeAgo(item.updatedAt)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
