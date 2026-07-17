'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Monitor, LogOut } from 'lucide-react';

interface Session { id: string; fingerprint: string; updatedAt: string; expiresAt: string; }

export default function SessionsPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/sessions').then((r) => r.json()).then((d) => {
      setSessions(d.sessions || []);
      setLoading(false);
    });
  }, []);

  async function revoke(id: string) {
    setRevokingId(id);
    await fetch(`/api/account/sessions/${id}`, { method: 'DELETE' });
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setRevokingId(null);
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-brand-white/40 font-tajawal text-sm py-6"><Loader2 className="animate-spin" size={16} /> جارِ التحميل...</div>;
  }

  if (sessions.length === 0) {
    return <p className="text-sm text-brand-white/40 font-tajawal py-4">لا توجد جلسات نشطة أخرى حاليًا.</p>;
  }

  return (
    <div className="space-y-3">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <Monitor size={18} className="text-brand-royal-light" />
            <div>
              <p className="text-sm text-brand-white font-tajawal">جهاز موثوق</p>
              <p className="text-xs text-brand-white/40 font-tajawal">آخر نشاط: {new Date(s.updatedAt).toLocaleString('ar-EG')}</p>
            </div>
          </div>
          <button
            onClick={() => revoke(s.id)}
            disabled={revokingId === s.id}
            className="flex items-center gap-1.5 text-xs text-red-400/80 hover:text-red-400 font-tajawal disabled:opacity-50"
          >
            {revokingId === s.id ? (
              <><Loader2 size={14} className="animate-spin" /> جارِ الإنهاء...</>
            ) : (
              <><LogOut size={14} /> إنهاء الجلسة</>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
