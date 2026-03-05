'use client';

import { useEffect, useState, useCallback } from 'react';

interface Task {
  id: string; title: string; date: string; time?: string;
  category: 'lead-gen' | 'marketing' | 'admin' | 'project' | 'personal';
  priority: 'high' | 'medium' | 'low'; completed: boolean;
  recurring?: 'daily' | 'weekly' | 'monthly' | null; notes?: string;
}

const CAT_COLORS: Record<string, string> = {
  'lead-gen': 'border-l-green-500 bg-green-500/10',
  marketing: 'border-l-blue-500 bg-blue-500/10',
  admin: 'border-l-yellow-500 bg-yellow-500/10',
  project: 'border-l-purple-500 bg-purple-500/10',
  personal: 'border-l-pink-500 bg-pink-500/10',
};
const CAT_DOTS: Record<string, string> = {
  'lead-gen': 'bg-green-500', marketing: 'bg-blue-500', admin: 'bg-yellow-500',
  project: 'bg-purple-500', personal: 'bg-pink-500',
};
const CAT_LABELS: Record<string, string> = {
  'lead-gen': '💰 Lead Gen', marketing: '📣 Marketing', admin: '📋 Admin',
  project: '🔨 Project', personal: '👤 Personal',
};
const PRI_ICONS: Record<string, string> = { high: '🔴', medium: '🟡', low: '🟢' };
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toLocal(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toLocal(new Date()));
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', date: '', time: '', category: 'admin', priority: 'medium', recurring: '', notes: '' });
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const fetchTasks = useCallback(async () => {
    const r = await fetch('/api/tasks');
    const d = await r.json();
    setTasks(d.tasks || []);
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async () => {
    if (!newTask.title || !newTask.date) return;
    await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', ...newTask, recurring: newTask.recurring || null }),
    });
    setNewTask({ title: '', date: selectedDate, time: '', category: 'admin', priority: 'medium', recurring: '', notes: '' });
    setShowAdd(false);
    fetchTasks();
  };

  const toggleTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id }),
    });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch('/api/tasks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    fetchTasks();
  };

  // Calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = toLocal(new Date());

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const tasksForDate = (dateStr: string) => tasks.filter(t => t.date === dateStr);
  const selectedTasks = tasksForDate(selectedDate).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority) return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : a.priority === 'medium' ? -1 : 1;
    return (a.time || 'zz').localeCompare(b.time || 'zz');
  });

  const upcomingTasks = tasks
    .filter(t => t.date >= today && !t.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
    .slice(0, 8);

  const overdueTasks = tasks.filter(t => t.date < today && !t.completed);
  const todayTasks = tasksForDate(today);
  const completedToday = todayTasks.filter(t => t.completed).length;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <a href="/" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition text-sm">← Dashboard</a>
          <h1 className="text-2xl font-bold">📅 Task Calendar</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('calendar')}
            className={`px-3 py-1.5 rounded text-sm transition ${view === 'calendar' ? 'bg-[var(--gold)] text-black font-semibold' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'}`}>
            Calendar
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded text-sm transition ${view === 'list' ? 'bg-[var(--gold)] text-black font-semibold' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white'}`}>
            List
          </button>
          <button onClick={() => { setNewTask({ ...newTask, date: selectedDate }); setShowAdd(true); }}
            className="bg-[var(--gold)] text-black px-4 py-1.5 rounded font-semibold text-sm hover:brightness-110 transition">
            + Add Task
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Today', value: todayTasks.length, sub: `${completedToday} done`, color: 'var(--gold)' },
          { label: 'Overdue', value: overdueTasks.length, sub: 'need attention', color: '#ef4444' },
          { label: 'This Week', value: tasks.filter(t => { const d = new Date(t.date); const now = new Date(); const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + (7 - now.getDay())); return d >= now && d <= weekEnd && !t.completed; }).length, sub: 'remaining', color: '#3b82f6' },
          { label: 'Completion', value: tasks.length ? Math.round(tasks.filter(t => t.completed).length / tasks.length * 100) + '%' : '0%', sub: 'all time', color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg p-4 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar / List */}
        <div className="col-span-2">
          {view === 'calendar' ? (
            <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="text-[var(--text-secondary)] hover:text-white text-lg px-2">‹</button>
                <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="text-[var(--text-secondary)] hover:text-white text-lg px-2">›</button>
              </div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium py-1" style={{ color: 'var(--text-secondary)' }}>{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={i} />;
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const dayTasks = tasksForDate(dateStr);
                  const isToday = dateStr === today;
                  const isSelected = dateStr === selectedDate;
                  const hasOverdue = dayTasks.some(t => !t.completed && dateStr < today);
                  return (
                    <button key={i} onClick={() => setSelectedDate(dateStr)}
                      className={`relative p-2 rounded-lg text-sm min-h-[64px] transition flex flex-col items-center
                        ${isSelected ? 'ring-2 ring-[var(--gold)]' : ''} 
                        ${isToday ? 'bg-[var(--gold)]/10' : 'hover:bg-[var(--bg-card-hover)]'}`}
                      style={{ background: isSelected ? 'rgba(212,160,23,0.15)' : undefined }}>
                      <span className={`text-xs font-medium ${isToday ? 'text-[var(--gold)] font-bold' : ''} ${hasOverdue ? 'text-red-400' : ''}`}>
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayTasks.slice(0, 4).map((t, j) => (
                            <div key={j} className={`w-1.5 h-1.5 rounded-full ${t.completed ? 'bg-gray-600' : CAT_DOTS[t.category] || 'bg-gray-500'}`} />
                          ))}
                          {dayTasks.length > 4 && <span className="text-[8px] text-[var(--text-secondary)]">+{dayTasks.length - 4}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List view */
            <div className="rounded-lg border p-4 space-y-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-semibold mb-3">All Tasks</h2>
              {tasks.sort((a,b) => a.date.localeCompare(b.date)).map(task => (
                <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${CAT_COLORS[task.category]} ${task.completed ? 'opacity-50' : ''}`}>
                  <button onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition
                      ${task.completed ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-[var(--border)] hover:border-[var(--gold)]'}`}>
                    {task.completed && <span className="text-black text-xs">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${task.completed ? 'line-through text-[var(--text-secondary)]' : ''}`}>{task.title}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{task.date} {task.time || ''} {task.recurring ? `• 🔁 ${task.recurring}` : ''}</div>
                  </div>
                  <span className="text-xs">{PRI_ICONS[task.priority]}</span>
                  <button onClick={() => deleteTask(task.id)} className="text-[var(--text-secondary)] hover:text-red-400 text-xs transition">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Selected day tasks */}
          {view === 'calendar' && (
            <div className="mt-4 rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {selectedDate === today ? '📌 Today' : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}</span>
              </div>
              {selectedTasks.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)] py-4 text-center">No tasks for this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map(task => (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${CAT_COLORS[task.category]} ${task.completed ? 'opacity-50' : ''}`}>
                      <button onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition
                          ${task.completed ? 'bg-[var(--gold)] border-[var(--gold)]' : 'border-[var(--border)] hover:border-[var(--gold)]'}`}>
                        {task.completed && <span className="text-black text-xs">✓</span>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${task.completed ? 'line-through text-[var(--text-secondary)]' : ''}`}>{task.title}</div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {task.time || ''} {CAT_LABELS[task.category]} {task.recurring ? `• 🔁 ${task.recurring}` : ''}
                        </div>
                        {task.notes && <div className="text-xs text-[var(--text-secondary)] mt-0.5 italic">{task.notes}</div>}
                      </div>
                      <span className="text-xs">{PRI_ICONS[task.priority]}</span>
                      <button onClick={() => deleteTask(task.id)} className="text-[var(--text-secondary)] hover:text-red-400 text-xs transition">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: '#ef4444' }}>
              <h3 className="font-semibold text-red-400 mb-2">⚠️ Overdue ({overdueTasks.length})</h3>
              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <button onClick={() => toggleTask(task.id)} className="w-4 h-4 rounded border border-red-500/50 flex-shrink-0 hover:bg-red-500/20 transition" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{task.title}</div>
                      <div className="text-xs text-red-400/60">{task.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-3">📋 Upcoming</h3>
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div key={task.id} className={`flex items-center gap-2 text-sm p-2 rounded border-l-2 ${CAT_COLORS[task.category]}`}>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs font-medium">{task.title}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{task.date} {task.time || ''}</div>
                  </div>
                  <span className="text-xs">{PRI_ICONS[task.priority]}</span>
                </div>
              ))}
              {upcomingTasks.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No upcoming tasks</p>}
            </div>
          </div>

          {/* Category legend */}
          <div className="rounded-lg border p-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {Object.entries(CAT_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${CAT_DOTS[key]}`} />
                  <span>{label}</span>
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {tasks.filter(t => t.category === key && !t.completed).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="rounded-xl border p-6 w-full max-w-md" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Task</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Title *</label>
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none"
                  placeholder="What needs to be done?" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">Date *</label>
                  <input type="date" value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">Time</label>
                  <input type="time" value={newTask.time} onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">Category</label>
                  <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none">
                    <option value="lead-gen">💰 Lead Gen</option>
                    <option value="marketing">📣 Marketing</option>
                    <option value="admin">📋 Admin</option>
                    <option value="project">🔨 Project</option>
                    <option value="personal">👤 Personal</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none">
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">Repeat</label>
                  <select value={newTask.recurring} onChange={e => setNewTask({ ...newTask, recurring: e.target.value })}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none">
                    <option value="">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Notes</label>
                <textarea value={newTask.notes} onChange={e => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:border-[var(--gold)] outline-none h-16 resize-none"
                  placeholder="Optional details..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 border border-[var(--border)] rounded py-2 text-sm hover:bg-[var(--bg-card-hover)] transition">Cancel</button>
              <button onClick={addTask} className="flex-1 bg-[var(--gold)] text-black rounded py-2 text-sm font-semibold hover:brightness-110 transition">Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
