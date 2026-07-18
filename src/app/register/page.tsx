'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Mail, Lock, User, AlertTriangle, ArrowLeft, Eye, EyeOff, BookOpen, Gamepad2, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

const features = [
  { icon: BookOpen, title: 'دورات برمجية احترافية', desc: 'تعلّم من أفضل المحتويات باللغة العربية' },
  { icon: Gamepad2, title: 'ألعاب تعليمية تفاعلية', desc: 'اصقل مهاراتك وأنت تستمتع بالتحديات البرمجية' },
  { icon: Trophy, title: 'شهادات موثقة', desc: 'احصل على شهادات إتمام موثقة برمز QR لكل دورة' },
  { icon: Zap, title: 'مساعد ذكاء اصطناعي', desc: 'احصل على إجابات فورية من مساعد Gemini المدمج' },
];

function RegisterForm() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') router.push('/dashboard/admin');
      else if (justRegistered) router.push('/onboarding');
      else router.push('/dashboard');
    }
  }, [user, loading, router, justRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (!termsAccepted) {
      setError('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية');
      return;
    }

    setSubmitting(true);
    const res = await register(name.trim(), email.trim(), password, referralCode);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'فشل إنشاء الحساب. يرجى المحاولة لاحقاً.');
    } else if (res.needsVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(res.email || email.trim())}`);
    } else {
      setJustRegistered(true);
    }
  };

  return (
    <div className="min-h-screen flex bg-brand-dark relative overflow-hidden">

      {/* ── الجانب البصري (يمين) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden bg-dark-linear border-l border-white/5">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute inset-0 noise-overlay" />

        {/* Glow blobs */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-brand-royal/15 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-56 h-56 bg-brand-royal-light/10 rounded-full blur-[80px] animate-float-rev pointer-events-none" />

        {/* أعمدة زخرفية */}
        <div className="absolute inset-0 flex justify-center gap-24 opacity-[0.05] pointer-events-none">
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
          <div className="w-8 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
        </div>

        <div className="relative z-10 max-w-sm px-8 space-y-8">
          <div className="text-center space-y-3">
            <Logo className="h-14 mx-auto" />
            <h2 className="text-3xl font-tajawal font-black text-brand-white leading-relaxed">
              انضم لمجتمع{' '}
              <span className="shimmer-text">أركان</span>
              {' '}التعليمي
            </h2>
            <p className="text-brand-white/50 font-tajawal text-sm leading-relaxed">
              آلاف الطلاب يتعلمون ويبنون مستقبلهم التقني معنا كل يوم
            </p>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="flex items-center gap-3 glass-dark border border-white/5 rounded-xl px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-royal/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-brand-royal-light" />
                  </div>
                  <div>
                    <div className="text-sm font-tajawal font-bold text-brand-white">{f.title}</div>
                    <div className="text-xs font-tajawal text-brand-white/40 mt-0.5">{f.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { value: '+500', label: 'طالب نشط' },
              { value: '+30', label: 'دورة متاحة' },
              { value: '10', label: 'ألعاب برمجية' },
            ].map((s) => (
              <div key={s.label} className="glass-dark border border-white/5 rounded-xl p-3 text-center">
                <div className="text-lg font-tajawal font-black text-brand-royal-light">{s.value}</div>
                <div className="text-[10px] font-tajawal text-brand-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── فورم التسجيل (يسار) ── */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-hero-mesh lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-7 relative z-10"
        >
          {/* Logo (mobile only) */}
          <div className="flex flex-col items-center lg:hidden">
            <Logo className="h-14" />
          </div>

          <div className="text-center lg:text-right">
            <h2 className="text-3xl font-tajawal font-black text-brand-white">إنشاء حساب جديد</h2>
            <p className="mt-2 text-sm font-tajawal text-brand-white/50">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="font-bold text-brand-royal-light hover:text-brand-royal transition-colors">
                سجل الدخول هنا
              </Link>
            </p>
          </div>

          <div className="glass-dark border border-brand-royal/15 py-8 px-6 shadow-dark-xl rounded-3xl sm:px-10">
            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-sm font-tajawal"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-tajawal font-bold text-brand-white/70 pr-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-royal-light/70">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium w-full pr-11 font-tajawal text-sm"
                    placeholder="محمد أحمد"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-tajawal font-bold text-brand-white/70 pr-1">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-royal-light/70">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium w-full pr-11 text-sm"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-tajawal font-bold text-brand-white/70 pr-1">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-brand-royal-light/70">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium w-full pr-11 pl-11 text-sm"
                    placeholder="6 أحرف على الأقل"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-brand-white/30 hover:text-brand-royal-light transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          password.length >= i * 3
                            ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-400'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 mt-0.5 accent-brand-royal rounded shrink-0"
                />
                <label htmlFor="terms" className="text-sm font-tajawal text-brand-white/50 leading-relaxed cursor-pointer">
                  أوافق على{' '}
                  <Link href="/terms" className="text-brand-royal-light hover:text-brand-royal transition-colors font-bold">
                    شروط الاستخدام
                  </Link>{' '}
                  و{' '}
                  <Link href="/privacy" className="text-brand-royal-light hover:text-brand-royal transition-colors font-bold">
                    سياسة الخصوصية
                  </Link>
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-4 rounded-xl royal-gradient text-white font-tajawal font-bold text-base hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-royal/20"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'إنشاء الحساب مجاناً'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm font-tajawal">
                <span className="px-3 bg-brand-navy text-brand-white/40 rounded-full">أو سجل بواسطة</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="flex justify-center">
              <Link
                href="/api/auth/social/google"
                className="w-full flex items-center justify-center gap-3 py-3 border border-white/10 hover:border-brand-royal/40 rounded-xl hover:bg-brand-royal/5 transition-all text-brand-white/70 font-tajawal text-sm"
                title="Google"
              >
                <GoogleIcon className="w-5 h-5" />
                <span>المتابعة باستخدام Google</span>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-tajawal font-medium text-brand-white/50 hover:text-brand-royal-light transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-royal border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
