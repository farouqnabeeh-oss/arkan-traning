'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { MailCheck, Loader2, AlertCircle, RotateCcw, CheckCircle2 } from 'lucide-react';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getFingerprint } = useAuth();
  const email = searchParams.get('email') || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const code = digits.join('');
    if (code.length !== 6) {
      setError('يرجى إدخال الرمز المكوّن من 6 أرقام كاملًا.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-email/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, fingerprint: getFingerprint() }),
      });
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) {
        setError(data.error || 'حدث خطأ ما.');
        return;
      }
      router.push('/onboarding');
      router.refresh();
    } catch {
      setSubmitting(false);
      setError('تعذر الاتصال بالخادم.');
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setResending(false);
      if (!res.ok) {
        setError(data.error || 'تعذر إعادة الإرسال.');
        return;
      }
      setResent(true);
      setCooldown(60);
      setTimeout(() => setResent(false), 4000);
    } catch {
      setResending(false);
      setError('تعذر الاتصال بالخادم.');
    }
  }

  if (!email) {
    return (
      <div className="text-center py-24">
        <p className="text-brand-white/50 font-tajawal">رابط غير صالح. <Link href="/register" className="text-brand-royal-light underline">سجّل من جديد</Link></p>
      </div>
    );
  }

  return (
    <div className="glass-dark border border-brand-royal/15 rounded-3xl p-8 md:p-10 space-y-6 max-w-md w-full">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl royal-gradient flex items-center justify-center mx-auto shadow-royal-glow">
          <MailCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-tajawal font-black text-brand-white">تحقق من بريدك</h1>
        <p className="text-brand-white/50 font-tajawal text-sm">
          بعتنالك رمز مكوّن من 6 أرقام على <span className="text-brand-royal-light font-bold" dir="ltr">{email}</span>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl font-tajawal">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {resent && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl font-tajawal">
          <CheckCircle2 size={16} /> تم إرسال رمز جديد.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black input-premium"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full royal-gradient text-white font-tajawal font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          تأكيد الرمز
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending || cooldown > 0}
        className="w-full flex items-center justify-center gap-2 text-sm text-brand-white/50 hover:text-brand-royal-light font-tajawal disabled:opacity-40"
      >
        {resending ? <Loader2 className="animate-spin" size={14} /> : <RotateCcw size={14} />}
        {cooldown > 0 ? `أعد الإرسال بعد ${cooldown} ثانية` : 'لم يصلك الرمز؟ أعد الإرسال'}
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 pt-32 pb-16">
        <Suspense fallback={<Loader2 className="animate-spin text-brand-royal-light" size={28} />}>
          <VerifyEmailForm />
        </Suspense>
      </main>
    </div>
  );
}
