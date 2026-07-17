'use client';

import React, { useState } from 'react';
import { Copy, Check, Zap, Flame, Share2 } from 'lucide-react';

export default function ReferralCard({ referralCode, xp, streak }: { referralCode: string; xp: number; streak: number; }) {
  const [copied, setCopied] = useState(false);
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : '';

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass-dark border border-brand-royal/15 rounded-3xl p-8 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-brand-royal-light" />
          </div>
          <div>
            <p className="text-lg font-tajawal font-black text-brand-white">{xp}</p>
            <p className="text-xs text-brand-white/40 font-tajawal">نقطة خبرة (XP)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-brand-royal-light" />
          </div>
          <div>
            <p className="text-lg font-tajawal font-black text-brand-white">{streak}</p>
            <p className="text-xs text-brand-white/40 font-tajawal">يوم متتالي</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <h3 className="text-sm font-tajawal font-bold text-brand-white mb-2 flex items-center gap-2">
          <Share2 size={15} className="text-brand-royal-light" /> ادعُ صديقك واحصل على مكافأة
        </h3>
        <p className="text-xs text-brand-white/50 font-tajawal mb-4">شارك رابط دعوتك — تحصل أنت على 100 نقطة خبرة، وصديقك يحصل على 50 عند انضمامه.</p>
        <div className="flex items-center gap-2">
          <input readOnly value={referralLink} className="input-premium flex-1 text-xs font-mono" dir="ltr" />
          <button onClick={copyLink} className="px-4 py-3 rounded-xl bg-brand-royal/15 text-brand-royal-light hover:bg-brand-royal/25 transition-colors shrink-0">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
