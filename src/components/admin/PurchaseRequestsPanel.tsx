'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2 } from 'lucide-react';

interface Purchase {
  id: string;
  originalPrice: number;
  user: { name: string; email: string };
  book: { title: string; price: number };
}

export default function PurchaseRequestsPanel({ purchases }: { purchases: Purchase[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [discounts, setDiscounts] = useState<Record<string, number>>({});

  async function handleDecision(id: string, status: 'APPROVED' | 'REJECTED') {
    setLoadingId(id);
    await fetch(`/api/admin/purchases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, discountPercent: discounts[id] || 0 }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {purchases.map((p) => (
        <div key={p.id} className="card-premium bg-brand-navy/60 glass-dark p-4 rounded-xl border border-white/5 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-medium text-brand-white">{p.user.name} <span className="text-brand-silver-dim">({p.user.email})</span></p>
            <p className="text-xs text-brand-silver-dim">{p.book.title} — {p.originalPrice} ₪</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              placeholder="خصم %"
              onChange={(e) => setDiscounts((d) => ({ ...d, [p.id]: parseInt(e.target.value || '0', 10) }))}
              className="input-premium w-20 text-xs py-1.5"
            />
            <button
              onClick={() => handleDecision(p.id, 'APPROVED')}
              disabled={loadingId === p.id}
              className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {loadingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={() => handleDecision(p.id, 'REJECTED')}
              disabled={loadingId === p.id}
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
