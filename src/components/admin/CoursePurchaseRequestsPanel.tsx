'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

interface Request {
  id: string;
  transferNote: string;
  user: { name: string; email: string };
  course: { title: string; price: number };
}

export default function CoursePurchaseRequestsPanel({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDecision(id: string, status: 'APPROVED' | 'REJECTED') {
    setLoadingId(id);
    await fetch(`/api/admin/course-purchases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="card-premium bg-brand-navy/60 glass-dark p-4 rounded-xl border border-white/5 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-medium text-brand-white">{r.user.name} <span className="text-brand-silver-dim">({r.user.email})</span></p>
            <p className="text-xs text-brand-silver-dim">{r.course.title} — {r.course.price} ₪</p>
            <p className="text-xs text-brand-royal-light mt-1">إشعار التحويل: {r.transferNote}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDecision(r.id, 'APPROVED')}
              disabled={loadingId === r.id}
              className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
              title="موافقة وتوليد رمز الوصول"
            >
              {loadingId === r.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={() => handleDecision(r.id, 'REJECTED')}
              disabled={loadingId === r.id}
              className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
