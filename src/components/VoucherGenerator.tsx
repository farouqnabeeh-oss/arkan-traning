'use client';

import React, { useState } from 'react';
import { Ticket, Clipboard, CheckCircle, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

export default function VoucherGenerator({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedCode(null);
    setCopied(false);
    setError(null);

    if (!courseId) {
      setError('يرجى تحديد الدورة التدريبية أولاً.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/instructor/vouchers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, expiresAt: expiresAt || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل توليد قسيمة الاشتراك.');
      }

      setGeneratedCode(data.voucher.code);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl text-right space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-brand-royal/10">
        <Ticket className="w-5 h-5 text-brand-royal" />
        <h3 className="text-lg font-bold text-brand-white">مولد قسائم الاشتراك (Vouchers)</h3>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 p-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-brand-white/70 mb-1">
            اختر الدورة التدريبية
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="input-premium w-full font-tajawal text-sm"
          >
            <option value="">-- اختر الدورة --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-white/70 mb-1">
            تاريخ الانتهاء (اختياري)
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="input-premium w-full font-tajawal text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-brand-dark royal-gradient hover:royal-gradient-hover hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 text-base"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-dark border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'توليد قسيمة جديدة'
          )}
        </button>
      </form>

      {generatedCode && (
        <div className="bg-brand-royal/10 border border-brand-royal/20 p-5 rounded-xl text-center space-y-3">
          <span className="text-xs text-brand-white/50 block font-tajawal">الكود المولد بنجاح:</span>
          <div className="flex items-center justify-between bg-brand-dark/50 border border-brand-royal/20 px-4 py-3 rounded-lg font-inter font-bold tracking-widest text-lg text-brand-royal-light">
            <button
              onClick={copyToClipboard}
              className="text-brand-royal-light hover:text-brand-royal transition-colors p-1"
              title="نسخ إلى الحافظة"
            >
              {copied ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Clipboard className="w-5 h-5" />}
            </button>
            <span>{generatedCode}</span>
          </div>
          {copied && <span className="text-xs text-emerald-400 font-bold block">تم نسخ الرمز إلى الحافظة!</span>}
        </div>
      )}
    </div>
  );
}
