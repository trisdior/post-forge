'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/pipeline', label: 'Pipeline', icon: '🔄' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/outreach', label: 'Outreach', icon: '📞' },
  { href: '/?tab=approvals', label: 'Approvals', icon: '🤝', badge: true },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/approval-queue?status=pending-approval');
        const data = await res.json();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch { /* ignore */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#161616] border border-[#222] text-white"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect y="3" width="20" height="2" rx="1" />
          <rect y="9" width="20" height="2" rx="1" />
          <rect y="15" width="20" height="2" rx="1" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-56 bg-[#111] border-r border-[#222] z-40 flex flex-col
        transition-transform duration-200
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="p-4 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D4A017] animate-pulse" />
            <div>
              <div className="text-sm font-bold text-[#D4A017] tracking-wide">VALENCIA</div>
              <div className="text-[10px] text-[#666] tracking-widest">MISSION CONTROL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition
                  ${active
                    ? 'bg-[#D4A017]/15 text-[#D4A017] font-medium'
                    : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#222]">
          <div className="text-[10px] text-[#444]">Valencia Construction LLC</div>
          <div className="text-[10px] text-[#333]">v2.0 • Mission Control</div>
        </div>
      </aside>
    </>
  );
}
