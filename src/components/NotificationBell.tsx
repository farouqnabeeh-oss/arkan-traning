'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';

interface Notif { id: string; title: string; body: string; link: string | null; isRead: boolean; createdAt: string; }

export default function NotificationBell({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const load = () => fetch('/api/notifications').then((r) => r.json()).then((d) => {
      setNotifs(d.notifications || []);
      setUnreadCount(d.unreadCount || 0);
    }).catch(() => {});
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  if (!isLoggedIn) return <div className="hidden" />;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((p) => !p)} className="relative w-10 h-10 flex items-center justify-center rounded-xl glass-dark border border-brand-royal/15 text-brand-white/70 hover:text-brand-royal-light transition-colors">
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 w-4.5 h-4.5 min-w-[18px] px-1 rounded-full bg-brand-royal text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-3 w-80 glass-dark border border-brand-royal/15 rounded-2xl shadow-dark-xl overflow-hidden animate-fade-in-up" style={{ animationDuration: '150ms' }}>
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-sm font-tajawal font-bold text-brand-white">الإشعارات</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-royal-light hover:text-brand-royal flex items-center gap-1 font-tajawal">
                <CheckCheck size={13} /> تعليم الكل كمقروء
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-center text-xs text-brand-white/40 font-tajawal py-8">لا توجد إشعارات بعد.</p>
            ) : (
              notifs.map((n) => {
                const content = (
                  <div 
                    className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-right ${!n.isRead ? 'bg-brand-royal/5' : ''}`} 
                    onClick={() => {
                      setOpen(false);
                      if (!n.isRead) markRead(n.id);
                    }}
                  >
                    <p className="text-sm font-tajawal font-bold text-brand-white">{n.title}</p>
                    <p className="text-xs text-brand-white/50 font-tajawal mt-1">{n.body}</p>
                  </div>
                );
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
