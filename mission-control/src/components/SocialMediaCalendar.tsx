'use client';

import { useEffect, useState } from 'react';
import socialCalendarData from '@/data/social-calendar.json';

interface Post {
  id: number;
  date: string;
  day: string;
  time: string;
  platform: string[];
  type: string;
  content: string;
  status: 'draft' | 'scheduled' | 'posted';
  image: string | null;
  cta: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  scheduled: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  posted: 'bg-green-500/10 border-green-500/30 text-green-400',
};

const TYPE_ICONS: Record<string, string> = {
  'Kitchen Remodel Tips': '🍳',
  'Before/After Project': '🖼️',
  'Team Spotlight': '👥',
  'Customer Testimonial': '⭐',
  'Industry Tips': '💡',
  'Service Highlight': '🔧',
  'Seasonal Promotion': '🎯',
};

export default function SocialMediaCalendar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'posted'>('all');
  const [filterMonth, setFilterMonth] = useState('2026-03');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    setPosts(socialCalendarData.calendar);
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filterStatus !== 'all' && post.status !== filterStatus) return false;
    if (!post.date.startsWith(filterMonth)) return false;
    return true;
  });

  const handleMarkAs = (postId: number, newStatus: 'draft' | 'scheduled' | 'posted') => {
    const updated = posts.map((p) =>
      p.id === postId ? { ...p, status: newStatus } : p
    );
    setPosts(updated);
    if (selectedPost?.id === postId) {
      setSelectedPost({ ...selectedPost, status: newStatus });
    }
  };

  const stats = {
    draft: posts.filter((p) => p.status === 'draft').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    posted: posts.filter((p) => p.status === 'posted').length,
  };

  // Calendar helper functions
  const [year, month] = filterMonth.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getPostsForDate = (day: number) => {
    const dateStr = `${filterMonth}-${String(day).padStart(2, '0')}`;
    return posts.filter((p) => p.date === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthName = monthNames[month - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#D4A017]">📅 Social Media Calendar</h2>
        <div className="flex gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-[#161616] border border-[#222] rounded px-3 py-1 text-xs text-[#aaa]"
          >
            <option value="2026-03">March 2026</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-05">May 2026</option>
          </select>
          {viewMode === 'list' && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#161616] border border-[#222] rounded px-3 py-1 text-xs text-[#aaa]"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="posted">Posted</option>
            </select>
          )}
          <div className="flex gap-1 border border-[#222] rounded p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-xs rounded transition ${
                viewMode === 'calendar'
                  ? 'bg-[#D4A017] text-black font-semibold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded transition ${
                viewMode === 'list'
                  ? 'bg-[#D4A017] text-black font-semibold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#161616] border border-[#222] rounded-lg p-3">
          <div className="text-[10px] text-[#666] uppercase mb-1">Draft</div>
          <div className="text-2xl font-bold text-blue-400">{stats.draft}</div>
        </div>
        <div className="bg-[#161616] border border-[#222] rounded-lg p-3">
          <div className="text-[10px] text-[#666] uppercase mb-1">Scheduled</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.scheduled}</div>
        </div>
        <div className="bg-[#161616] border border-[#222] rounded-lg p-3">
          <div className="text-[10px] text-[#666] uppercase mb-1">Posted</div>
          <div className="text-2xl font-bold text-green-400">{stats.posted}</div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-[#161616] border border-[#222] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-6">{monthName} {year}</h3>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-[#666] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg border p-2 transition ${
                  day === null
                    ? 'bg-[#0A0A0A] border-[#111]'
                    : 'bg-[#0A0A0A] border-[#333] hover:border-[#D4A017]'
                }`}
              >
                {day !== null && (
                  <div className="h-full flex flex-col">
                    <div className="text-sm font-semibold text-[#D4A017]">{day}</div>
                    <div className="flex-1 min-h-0 overflow-y-auto mt-1 space-y-1">
                      {getPostsForDate(day).map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className={`text-[10px] px-1.5 py-1 rounded cursor-pointer truncate transition ${
                            post.status === 'draft'
                              ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                              : post.status === 'scheduled'
                                ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          }`}
                          title={post.content}
                        >
                          {TYPE_ICONS[post.type]} {post.type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-[#444]">No posts for this month</div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-[#161616] border border-[#222] rounded-lg p-4 hover:border-[#333] cursor-pointer transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{TYPE_ICONS[post.type] || '📱'}</span>
                    <span className="font-semibold text-white">{post.type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${STATUS_COLORS[post.status]}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#666]">
                    {post.day}, {post.date} @ {post.time}
                  </div>
                </div>
              </div>

              {/* Platforms */}
              <div className="flex gap-2 mb-3">
                {post.platform.map((p) => (
                  <span key={p} className="text-[10px] bg-[#0A0A0A] border border-[#333] rounded px-2 py-1 text-[#aaa]">
                    {p}
                  </span>
                ))}
                {post.image && (
                  <span className="text-[10px] bg-[#0A0A0A] border border-[#333] rounded px-2 py-1 text-[#aaa]">
                    🖼️ Image needed
                  </span>
                )}
              </div>

              {/* Content preview */}
              <div className="text-sm text-[#aaa] mb-2 line-clamp-2">{post.content}</div>

              {/* CTA */}
              <div className="text-xs text-[#D4A017]">{post.cta}</div>
            </div>
          ))
        )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-[#161616] border border-[#222] rounded-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{TYPE_ICONS[selectedPost.type] || '📱'}</span>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedPost.type}</h2>
                    <div className="text-xs text-[#666]">
                      {selectedPost.day}, {selectedPost.date} @ {selectedPost.time}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-[#666] hover:text-white text-xl transition">
                ✕
              </button>
            </div>

            {/* Status & Platforms */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[selectedPost.status]}`}>
                {selectedPost.status.toUpperCase()}
              </span>
              {selectedPost.platform.map((p) => (
                <span key={p} className="text-xs bg-[#0A0A0A] border border-[#333] rounded px-2 py-1 text-[#aaa]">
                  {p}
                </span>
              ))}
            </div>

            {/* Content */}
            <div className="mb-4">
              <div className="text-[10px] text-[#666] uppercase mb-2">Post Content</div>
              <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-3 text-sm text-[#ccc] leading-relaxed">
                {selectedPost.content}
              </div>
            </div>

            {/* CTA */}
            <div className="mb-4">
              <div className="text-[10px] text-[#666] uppercase mb-1">Call to Action</div>
              <div className="text-sm font-semibold text-[#D4A017]">{selectedPost.cta}</div>
            </div>

            {/* Image status */}
            {selectedPost.image && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="text-xs text-yellow-400">🖼️ Image needed - Upload before posting</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-[#222]">
              {selectedPost.status !== 'draft' && (
                <button
                  onClick={() => handleMarkAs(selectedPost.id, 'draft')}
                  className="px-3 py-2 text-xs rounded border border-[#333] text-[#888] hover:text-white transition"
                >
                  ← Back to Draft
                </button>
              )}
              {selectedPost.status === 'draft' && (
                <button
                  onClick={() => handleMarkAs(selectedPost.id, 'scheduled')}
                  className="px-3 py-2 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700 transition"
                >
                  Schedule for Posting
                </button>
              )}
              {selectedPost.status === 'scheduled' && (
                <button
                  onClick={() => handleMarkAs(selectedPost.id, 'posted')}
                  className="px-3 py-2 text-xs rounded bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Mark as Posted
                </button>
              )}
              <button onClick={() => setSelectedPost(null)} className="flex-1 px-3 py-2 text-xs rounded border border-[#333] text-[#888] hover:text-white transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
