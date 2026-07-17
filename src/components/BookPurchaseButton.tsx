'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, X, Loader2, CheckCircle2, AlertCircle, Landmark, Download, Clock, XCircle } from 'lucide-react';

interface BankAccount { id: string; label: string; value: string; isActive: boolean; }

export default function BookPurchaseButton({
  bookId, isLoggedIn, hasAccess, purchaseStatus, pdfUrl,
}: {
  bookId: string; isLoggedIn: boolean; hasAccess: boolean; purchaseStatus: string | null; pdfUrl: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (open) {
      fetch('/api/settings/public').then((r) => r.json()).then((d) => setBankAccounts(d.bankAccounts || []));
    }
  }, [open]);

  async function handleSubmit() {
    if (!note.trim() || note.trim().length < 3) {
      setError('يرجى كتابة اسم المُحوِّل أو رقم العملية.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await fetch(`/api/books/${bookId}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferNote: note }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'حدث خطأ.');
      setSubmitting(false);
      return;
    }
    setSuccess(true);
    setSubmitting(false);
    router.refresh();
  }

  if (hasAccess && pdfUrl) {
    return (
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full py-4 royal-gradient text-white rounded-xl font-tajawal font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Download className="w-5 h-5" /> تحميل الكتاب الآن
      </a>
    );
  }

  if (purchaseStatus === 'PENDING') {
    return (
      <div className="w-full py-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-tajawal font-bold text-center flex items-center justify-center gap-2">
        <Clock className="w-5 h-5" /> طلبك قيد المراجعة
      </div>
    );
  }

  if (purchaseStatus === 'REJECTED') {
    return (
      <div className="space-y-2">
        <div className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-tajawal text-sm text-center flex items-center justify-center gap-2">
          <XCircle className="w-4 h-4" /> تم رفض طلبك السابق
        </div>
        <button onClick={() => setOpen(true)} className="w-full py-3 royal-gradient text-white rounded-xl font-tajawal font-bold hover:opacity-90 transition-opacity">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => (isLoggedIn ? setOpen(true) : router.push('/login'))}
        className="w-full py-4 royal-gradient text-white rounded-xl font-tajawal font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <CreditCard className="w-5 h-5" /> اشترِ هذا الكتاب
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && setOpen(false)}>
          <div className="glass-dark border border-brand-royal/20 rounded-3xl p-8 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-5 left-5 text-brand-white/40 hover:text-brand-white">
              <X size={20} />
            </button>

            {success ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-tajawal font-black text-brand-white">تم إرسال طلبك!</h3>
                <p className="text-brand-white/50 font-tajawal text-sm">راح نراجع التحويل ونفعّل وصولك للكتاب خلال وقت قصير.</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-tajawal font-black text-brand-white mb-2">إتمام الشراء</h3>
                <p className="text-sm text-brand-white/50 font-tajawal mb-5">حوّل المبلغ عبر إحدى الوسائل، ثم اكتب رقم العملية أو اسم المُحوِّل بالأسفل.</p>

                <div className="space-y-2 mb-5">
                  {bankAccounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm font-tajawal">
                      <span className="text-brand-white/60 flex items-center gap-2"><Landmark size={14} className="text-brand-royal-light" /> {a.label}</span>
                      <span className="text-brand-white font-bold" dir="ltr">{a.value}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl font-tajawal mb-4">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <label className="text-sm text-brand-white/70 font-tajawal font-bold block mb-2">اسم المُحوِّل / رقم العملية</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="input-premium w-full font-tajawal mb-5"
                  placeholder="مثال: تحويل باسم أحمد محمد"
                />

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3.5 royal-gradient text-white rounded-xl font-tajawal font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  تأكيد إرسال الطلب
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
