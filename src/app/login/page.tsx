'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Mail, Lock, AlertTriangle, ArrowLeft, ShieldCheck, Award, Gamepad2 } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.988 0-.746-.08-1.32-.176-1.887H12.24z" />
  </svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const highlights = [
  { icon: Award, text: 'شهادات موثقة برمز QR فور إتمام كل دورة' },
  { icon: Gamepad2, text: 'ألعاب برمجية تفاعلية تصقل مهاراتك' },
  { icon: ShieldCheck, text: 'حسابك محمي بتشفير كامل لبياناتك' },
];

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') router.push('/dashboard/admin');
      else router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('يرجى ملء جميع الحقول المطلوبة'); return; }
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.success) {
      if (res.needsVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(res.email || email)}`);
        return;
      }
      setError(res.error || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark relative overflow-hidden">
      {/* ── الجانب البصري (يمين) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden bg-dark-linear border-l border-white/5">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-brand-royal/10 rounded-full blur-[120px] animate-float pointer-events-none" />

        {/* أعمدة زخرفية */}
        <div className="absolute inset-0 flex justify-center gap-24 opacity-[0.05] pointer-events-none">
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
        </div>

        <div className="relative z-10 max-w-md px-10 text-center space-y-8">
          <Logo className="h-16 mx-auto" />
          <h2 className="text-3xl font-tajawal font-black text-brand-white leading-relaxed">
            ابنِ أساسك التقني على <span className="shimmer-text">أركان راسخة</span>
          </h2>
          <div className="space-y-4 text-right">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.text} className="flex items-center gap-3 glass-dark border border-white/5 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-royal/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-royal-light" />
                  </div>
                  <span className="text-sm text-brand-white/70 font-tajawal">{h.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── فورم تسجيل الدخول (يسار) ── */}
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-hero-mesh lg:hidden" />
        <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up">
          <div className="flex flex-col items-center lg:hidden">
            <Logo className="h-16" />
          </div>

          <div className="text-center lg:text-right">
            <h2 className="text-3xl font-tajawal font-black text-brand-white">مرحبًا بعودتك</h2>
            <p className="mt-2 text-sm font-tajawal text-brand-white/50">
              أو{' '}
              <Link href="/register" className="font-bold text-brand-royal-light hover:text-brand-royal transition-colors">
                إنشاء حساب جديد مجانًا
              </Link>
            </p>
          </div>

          <div className="glass-dark border border-brand-royal/15 py-8 px-6 shadow-dark-xl rounded-3xl sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm font-tajawal animate-fade-in">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" /> <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-tajawal font-bold text-brand-white/70 pr-1">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-royal-light/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input-premium w-full pr-11 text-sm" placeholder="name@example.com" dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-tajawal font-bold text-brand-white/70 pr-1">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-royal-light/70">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password" type="password" required autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="input-premium w-full pr-11 text-sm" placeholder="••••••••" dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-tajawal px-1">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="h-4 w-4 accent-brand-royal rounded" />
                  <label htmlFor="remember-me" className="mr-2 text-brand-white/60 font-medium">تذكرني</label>
                </div>
                <Link href="/forgot-password" className="font-bold text-brand-royal-light hover:text-brand-royal transition-colors">نسيت كلمة المرور؟</Link>
              </div>

              <button
                type="submit" disabled={submitting}
                className="w-full flex justify-center py-4 rounded-xl royal-gradient text-white font-tajawal font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'تسجيل الدخول'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
              <div className="relative flex justify-center text-sm font-tajawal">
                <span className="px-3 bg-brand-navy text-brand-white/40 rounded-full">أو سجل الدخول بواسطة</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link href="/api/auth/social/google" className="flex items-center justify-center py-3 border border-white/10 hover:border-brand-royal/40 rounded-xl hover:bg-brand-royal/5 transition-all text-brand-white/70" title="Google">
                <GoogleIcon className="w-5 h-5" />
              </Link>
              <Link href="/api/auth/social/facebook" className="flex items-center justify-center py-3 border border-white/10 hover:border-brand-royal/40 rounded-xl hover:bg-brand-royal/5 transition-all text-brand-white/70" title="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </Link>
              <Link href="/api/auth/social/linkedin" className="flex items-center justify-center py-3 border border-white/10 hover:border-brand-royal/40 rounded-xl hover:bg-brand-royal/5 transition-all text-brand-white/70" title="LinkedIn">
                <LinkedinIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-tajawal font-medium text-brand-white/50 hover:text-brand-royal-light transition-colors">
              <ArrowLeft className="w-4 h-4" /> العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
