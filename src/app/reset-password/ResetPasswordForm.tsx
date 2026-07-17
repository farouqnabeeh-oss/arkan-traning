"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="text-center space-y-4 font-tajawal">
        <h2 className="text-red-400 font-bold text-xl">رابط غير صالح</h2>
        <p className="text-brand-white/70 text-sm">
          لم يتم العثور على رمز التحقق في الرابط. يرجى التأكد من نسخ الرابط بشكل صحيح.
        </p>
        <Link href="/forgot-password" className="text-brand-royal hover:underline mt-4 inline-block">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ غير متوقع');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-tajawal font-bold text-brand-white">تم تغيير كلمة المرور</h2>
        <p className="text-brand-white/70 font-tajawal text-sm leading-relaxed">
          تم تحديث كلمة المرور الخاصة بك بنجاح. سيتم تحويلك إلى صفحة تسجيل الدخول...
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-tajawal font-bold text-brand-royal">
          تعيين كلمة مرور جديدة
        </h1>
        <p className="text-brand-white/60 font-tajawal text-sm">
          يرجى إدخال كلمة المرور الجديدة الخاصة بحسابك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-tajawal"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-tajawal text-brand-white/90 pr-1">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-brand-royal/50" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-4 pr-12 py-3.5 bg-brand-dark/50 border border-brand-royal/20 rounded-xl text-brand-white placeholder-brand-white/30 focus:outline-none focus:ring-2 focus:ring-brand-royal/50 focus:border-transparent transition-all font-inter dir-ltr"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-tajawal text-brand-white/90 pr-1">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-brand-royal/50" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-4 pr-12 py-3.5 bg-brand-dark/50 border border-brand-royal/20 rounded-xl text-brand-white placeholder-brand-white/30 focus:outline-none focus:ring-2 focus:ring-brand-royal/50 focus:border-transparent transition-all font-inter dir-ltr"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-tajawal font-bold text-brand-dark royal-gradient hover:royal-gradient-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-royal focus:ring-offset-brand-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02]"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-brand-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            'حفظ كلمة المرور'
          )}
        </button>
      </form>
    </div>
  );
}
