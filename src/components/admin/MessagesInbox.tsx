'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Mail, MailOpen, Trash2, MessageSquare } from 'lucide-react';

interface Message {
  id: string; name: string; email: string; phone?: string; subject: string; message: string;
  isRead: boolean; createdAt: string;
}

export default function MessagesInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/messages', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          console.error('API Error:', d.error);
        }
        setMessages(d.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch Error:', err);
        setLoading(false);
      });
  }, []);

  async function toggleRead(id: string, isRead: boolean) {
    await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead }),
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isRead } : m)));
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-brand-silver-dim gap-2"><Loader2 className="animate-spin" size={20} /> جارِ التحميل...</div>;
  }

  if (messages.length === 0) {
    return (
      <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
        <MessageSquare size={40} className="mx-auto text-brand-silver-dim mb-4" />
        <p className="text-brand-silver-dim">لا توجد رسائل بعد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div key={m.id} className={`card-premium glass-dark rounded-2xl border p-5 transition-all ${m.isRead ? 'bg-brand-navy/40 border-white/5' : 'bg-brand-royal/8 border-brand-royal/25'}`}>
          <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => { setOpenId(openId === m.id ? null : m.id); if (!m.isRead) toggleRead(m.id, true); }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {m.isRead ? <MailOpen size={14} className="text-brand-silver-dim shrink-0" /> : <Mail size={14} className="text-brand-royal-light shrink-0" />}
                <p className={`text-sm font-bold truncate ${m.isRead ? 'text-brand-silver' : 'text-brand-white'}`}>{m.subject}</p>
              </div>
              <p className="text-xs text-brand-silver-dim mt-1">{m.name} — {m.email} {m.phone ? ` — ${m.phone}` : ''}</p>
            </div>
            <span className="text-xs text-brand-silver-dim shrink-0">{new Date(m.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
          {openId === m.id && (
            <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
              <p className="text-sm text-brand-silver leading-relaxed whitespace-pre-wrap">{m.message}</p>
              <div className="flex gap-2">
                <a href={`mailto:${m.email}`} className="text-xs px-3 py-1.5 rounded-lg bg-brand-royal/15 text-brand-royal-light hover:bg-brand-royal/25">الرد بالإيميل</a>
                <button onClick={() => handleDelete(m.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-1">
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
