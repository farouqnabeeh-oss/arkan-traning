'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Mail, MapPin, Phone, Send, MessageSquare, Clock, Loader2,
  CheckCircle2, AlertCircle, Landmark,
} from 'lucide-react';

interface ContactInfo { email: string; phone: string; whatsapp: string; address: string; }
interface BankAccount { id: string; label: string; value: string; isActive: boolean; }

const SUBJECTS = ['استفسار عام', 'استفسار عن دورة', 'مشكلة تقنية', 'شراكة أو تعاون', 'أخرى'];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'استفسار عام', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetch('/api/settings/public').then((r) => r.json()).then((d) => {
      setContactInfo(d.contactInfo);
      setBankAccounts(d.bankAccounts || []);
    });
  }, []);

  function validate(values = form) {
    const e: Record<string, string> = {};
    if (!values.name.trim() || values.name.trim().length < 2) e.name = 'يرجى إدخال اسمك الكامل.';
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'يرجى إدخال بريد إلكتروني صحيح.';
    if (!values.message.trim() || values.message.trim().length < 10) e.message = 'الرسالة قصيرة جدًا (10 أحرف على الأقل).';
    return e;
  }

  function handleChange(field: string, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) setErrors(validate(next));
  }

  function handleBlur(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  }

  const currentErrors = validate();
  const isValid = Object.keys(currentErrors).length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'حدث خطأ أثناء إرسال الرسالة.');
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
      setForm({ name: '', email: '', subject: 'استفسار عام', message: '' });
      setTouched({});
    } catch {
      setServerError('تعذر الاتصال بالخادم، حاول مرة أخرى.');
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />

      <section className="relative pt-36 pb-20 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,91,219,0.1)_0%,transparent_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-royal/5 rounded-full blur-[90px] animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-500/5 rounded-full blur-[80px] animate-float-rev pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold shadow-royal-glow-sm mx-auto animate-fade-in-up">
            <MessageSquare className="w-4 h-4" /> نحن هنا لخدمتك
          </div>
          <h1 className="text-5xl md:text-7xl font-tajawal font-black text-brand-white leading-[1.2] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            تواصل <span className="shimmer-text text-glow-royal">معنا</span>
          </h1>
          <p className="text-xl text-brand-white/60 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            سواء كان لديك استفسار حول الدورات، أو تبحث عن استشارة تقنية، فريقنا متواجد للرد عليك في أسرع وقت.
          </p>
        </div>
      </section>

      <main className="flex-grow py-4 relative z-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* نموذج التواصل */}
            <div className="lg:col-span-7">
              <div className="glass-dark rounded-[2rem] border border-brand-royal/15 p-8 md:p-12 shadow-dark-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 royal-gradient opacity-50" />

                {submitted ? (
                  <div className="py-16 text-center space-y-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-tajawal font-black text-brand-white">تم إرسال رسالتك بنجاح!</h3>
                    <p className="text-brand-white/50 font-tajawal">وصلتنا رسالتك وراح يتم الرد عليك خلال 24 ساعة على بريدك الإلكتروني.</p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-brand-royal-light hover:text-brand-royal font-tajawal text-sm font-bold"
                    >
                      إرسال رسالة أخرى
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <h2 className="text-3xl font-tajawal font-black text-brand-white mb-3">
                        أرسل <span className="text-brand-royal">رسالة</span>
                      </h2>
                      <p className="text-brand-white/50 font-tajawal text-sm">
                        كل الحقول مطلوبة، وما رح تقدر ترسل إلا بعد تعبئتها بشكل صحيح.
                      </p>
                    </div>

                    {serverError && (
                      <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl font-tajawal">
                        <AlertCircle size={16} /> {serverError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-brand-white/70 font-tajawal text-sm font-bold">الاسم الكامل *</label>
                          <input
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            className="input-premium w-full font-tajawal"
                          />
                          {touched.name && errors.name && <p className="text-red-400 text-xs font-tajawal">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-brand-white/70 font-tajawal text-sm font-bold">البريد الإلكتروني *</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            onBlur={() => handleBlur('email')}
                            className="input-premium w-full font-tajawal"
                            dir="ltr"
                          />
                          {touched.email && errors.email && <p className="text-red-400 text-xs font-tajawal">{errors.email}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-brand-white/70 font-tajawal text-sm font-bold">نوع الاستفسار *</label>
                        <select
                          value={form.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className="input-premium w-full font-tajawal"
                        >
                          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-brand-white/70 font-tajawal text-sm font-bold">الرسالة *</label>
                        <textarea
                          value={form.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          onBlur={() => handleBlur('message')}
                          rows={6}
                          className="input-premium w-full font-tajawal resize-none"
                        />
                        {touched.message && errors.message && <p className="text-red-400 text-xs font-tajawal">{errors.message}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full royal-gradient text-white font-tajawal font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {submitting ? (
                          <><Loader2 className="animate-spin" size={18} /> جارِ الإرسال...</>
                        ) : (
                          <><Send size={18} /> إرسال الرسالة</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-dark rounded-[2rem] border border-brand-royal/15 p-8 space-y-6">
                <h3 className="font-tajawal font-black text-brand-white text-xl">معلومات التواصل</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Mail size={17} className="text-brand-royal-light" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-white/40 font-tajawal">البريد الإلكتروني</p>
                      <p className="text-sm text-brand-white font-tajawal" dir="ltr">{contactInfo?.email || '...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Phone size={17} className="text-brand-royal-light" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-white/40 font-tajawal">الهاتف</p>
                      <p className="text-sm text-brand-white font-tajawal" dir="ltr">{contactInfo?.phone || '...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <MapPin size={17} className="text-brand-royal-light" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-white/40 font-tajawal">العنوان</p>
                      <p className="text-sm text-brand-white font-tajawal">{contactInfo?.address || '...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Clock size={17} className="text-brand-royal-light" />
                    </div>
                    <div>
                      <p className="text-xs text-brand-white/40 font-tajawal">وقت الرد المتوقع</p>
                      <p className="text-sm text-brand-white font-tajawal">خلال 24 ساعة</p>
                    </div>
                  </div>
                </div>
              </div>

              {bankAccounts.length > 0 && (
                <div className="glass-dark rounded-[2rem] border border-brand-royal/15 p-8 space-y-4">
                  <h3 className="font-tajawal font-black text-brand-white text-lg flex items-center gap-2">
                    <Landmark size={18} className="text-brand-royal-light" /> وسائل الدفع
                  </h3>
                  {bankAccounts.map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-sm font-tajawal">
                      <span className="text-brand-white/60">{a.label}</span>
                      <span className="text-brand-white font-bold" dir="ltr">{a.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {contactInfo?.whatsapp && (
                <a
                  href={`https://wa.me/${contactInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-tajawal font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageSquare size={18} /> تواصل عبر واتساب مباشرة
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
