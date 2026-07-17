'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, CheckCircle, Ticket, CreditCard, AlertTriangle, Landmark, Clock, XCircle } from 'lucide-react';

interface Course { id: string; title: string; price: number; }
interface BankAccount { id: string; label: string; value: string; isActive: boolean; }
interface ContactInfo { email: string; whatsapp: string; }

export default function EnrollmentModal({
  course, isOpen, onClose,
}: { course: Course; isOpen: boolean; onClose: () => void; }) {
  const { user } = useAuth();
  const router = useRouter();
  const [voucherCode, setVoucherCode] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'voucher' | 'bank'>('bank');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings/public').then((r) => r.json()).then((d) => {
        setBankAccounts(d.bankAccounts || []);
        setContactInfo(d.contactInfo || null);
      });
      if (user) {
        fetch(`/api/courses/${course.id}/purchase-request`).then((r) => r.json()).then((d) => {
          if (d.purchaseRequest) setExistingStatus(d.purchaseRequest.status);
        });
      }
    }
  }, [isOpen, user, course.id]);

  if (!isOpen) return null;

  const handleActivateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) { router.push('/login'); return; }
    if (!voucherCode.trim()) { setError('يرجى إدخال رمز قسيمة التفعيل'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/enroll/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, code: voucherCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ غير متوقع أثناء تفعيل القسيمة.');

      setSuccess(true);
      setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشل التفعيل');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) { router.push('/login'); return; }
    if (!transferNote.trim() || transferNote.trim().length < 3) {
      setError('يرجى كتابة اسم المُحوِّل أو رقم العملية.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${course.id}/purchase-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferNote: transferNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ غير متوقع.');
      setRequestSubmitted(true);
      setExistingStatus('PENDING');
    } catch (err: any) {
      setError(err.message || 'فشل إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col glass-dark border border-brand-royal/20 rounded-2xl shadow-dark-xl overflow-hidden z-10 font-tajawal animate-fade-in text-right">
        <div className="p-6 shrink-0 flex items-center justify-between border-b border-white/5">
          <button onClick={onClose} className="text-brand-white/50 hover:text-brand-royal-light transition-colors">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold text-brand-white">الاشتراك في الدورة</h3>
        </div>

        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-brand-white">تهانينا! تم الاشتراك بنجاح</h4>
            <p className="text-brand-white/60 text-sm">
              تم تفعيل اشتراكك في دورة <strong className="text-brand-white">{course.title}</strong> بنجاح. نقوم الآن بتوجيهك إلى لوحة التحكم الخاصة بك...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-brand-white/40">الدورة المحددة:</span>
              <h4 className="text-lg font-bold text-brand-white mt-1">{course.title}</h4>
              <div className="flex justify-between items-center mt-3 text-sm pt-3 border-t border-white/5">
                <span className="font-bold text-brand-royal-light text-lg">{course.price} ₪</span>
                <span className="text-brand-white/50">سعر الدورة:</span>
              </div>
            </div>

            {existingStatus === 'PENDING' ? (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 text-amber-300 p-4 rounded-xl text-sm">
                <Clock className="w-5 h-5 shrink-0" />
                <span>طلبك قيد المراجعة، رح يوصلك إيميل فيه رمز الوصول فور الموافقة.</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row border border-white/10 rounded-lg overflow-hidden text-sm">
                  <button
                    onClick={() => setActiveTab('bank')}
                    className={`flex-1 py-3 px-2 font-bold transition-all ${activeTab === 'bank' ? 'bg-brand-royal/15 text-brand-royal-light' : 'text-brand-white/60 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-center gap-2 text-center"><CreditCard className="w-4 h-4 shrink-0" /> <span className="truncate">تحويل بنكي مباشر</span></div>
                  </button>
                  <button
                    onClick={() => setActiveTab('voucher')}
                    className={`flex-1 py-3 px-2 font-bold transition-all ${activeTab === 'voucher' ? 'bg-brand-royal/15 text-brand-royal-light' : 'text-brand-white/60 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center justify-center gap-2 text-center"><Ticket className="w-4 h-4 shrink-0" /> <span className="truncate">عندي رمز وصول جاهز</span></div>
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg text-sm">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> <span>{error}</span>
                  </div>
                )}
                {existingStatus === 'REJECTED' && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 text-red-300 p-3 rounded-lg text-sm">
                    <XCircle className="w-5 h-5 shrink-0" /> <span>تم رفض طلبك السابق، تقدر تعيد المحاولة تحت.</span>
                  </div>
                )}

                {activeTab === 'voucher' ? (
                  <form onSubmit={handleActivateVoucher} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-brand-white/70 mb-2">رمز الوصول / القسيمة</label>
                      <input
                        type="text"
                        required
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="ARK-XXXXXXXX"
                        className="input-premium w-full text-center font-bold tracking-widest text-lg"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl royal-gradient text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'تفعيل الاشتراك الفوري'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSubmitPurchaseRequest} className="space-y-4 text-sm leading-relaxed text-brand-white/70">
                    <p>حوّل مبلغ الدورة عبر إحدى الوسائل التالية، واكتب اسمك أو رقم العملية تحت — رح نراجع التحويل ونبعتلك رمز وصول خاص فيك على إيميلك فور الموافقة.</p>
                    {bankAccounts.filter((a) => a.isActive).length > 0 ? (
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                        {bankAccounts.filter((a) => a.isActive).map((a) => (
                          <div key={a.id} className="flex items-center justify-between">
                            <span className="text-brand-white/40 flex items-center gap-1.5"><Landmark size={13} /> {a.label}</span>
                            <strong className="text-brand-white font-mono" dir="ltr">{a.value}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-brand-white/40">وسائل الدفع غير متوفرة حاليًا، يرجى التواصل معنا مباشرة.</p>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-brand-white/70 mb-2">اسم المُحوِّل / رقم العملية</label>
                      <input
                        type="text"
                        required
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        placeholder="مثال: تحويل باسم أحمد محمد"
                        className="input-premium w-full"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-3.5 px-4 rounded-xl royal-gradient text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'إرسال طلب التفعيل'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
