'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, CheckCircle2, BookOpen } from 'lucide-react';

export default function BookReader({
  bookId, pdfUrl, pagesCount, initialProgress,
}: { bookId: string; pdfUrl: string; pagesCount: number | null; initialProgress: number; }) {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const startTimeRef = useRef<number | null>(null);
  const savedRef = useRef(initialProgress);

  // تقدير وقت القراءة الكلي (بمعدل ~2 دقيقة لكل صفحة، بحد أدنى 10 دقائق)
  const estimatedMinutes = Math.max(10, (pagesCount || 40) * 2);

  useEffect(() => {
    if (!open) return;
    startTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (!startTimeRef.current) return;
      const minutesElapsed = (Date.now() - startTimeRef.current) / 60000;
      const pct = Math.min(99, Math.round((minutesElapsed / estimatedMinutes) * 100));
      if (pct > savedRef.current) {
        setProgress(pct);
        savedRef.current = pct;
        fetch(`/api/books/${bookId}/progress`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readProgress: pct }),
        }).catch(() => {});
      }
    }, 20000); // كل 20 ثانية

    return () => clearInterval(interval);
  }, [open, bookId, estimatedMinutes]);

  async function markFinished() {
    setProgress(100);
    savedRef.current = 100;
    await fetch(`/api/books/${bookId}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markFinished: true }),
    }).catch(() => {});
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 glass-royal border border-brand-royal/30 text-brand-royal-light rounded-xl font-tajawal font-bold flex items-center justify-center gap-2 hover:bg-brand-royal/10 transition-colors"
      >
        <BookOpen size={18} /> اقرأ داخل المتصفح
      </button>

      {progress > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[11px] text-brand-white/40 font-tajawal mb-1">
            <span>تقدم القراءة</span><span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full royal-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 glass-dark border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-white/60 font-tajawal">تقدمك: {progress}%</span>
              {progress < 100 && (
                <button onClick={markFinished} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-tajawal">
                  <CheckCircle2 size={13} /> أنهيت القراءة
                </button>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-brand-white/60 hover:text-brand-white">
              <X size={22} />
            </button>
          </div>
          <iframe src={pdfUrl} className="flex-1 w-full bg-white" title="قراءة الكتاب" />
        </div>
      )}
    </>
  );
}
