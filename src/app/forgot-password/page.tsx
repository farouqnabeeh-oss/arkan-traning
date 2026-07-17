"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ غير متوقع');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-royal/30 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-navy/30 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass-dark border border-brand-royal/20 rounded-3xl shadow-2xl mt-10 p-8 md:p-10 relative z-10">
            {success ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-tajawal font-bold text-brand-white">تم الإرسال بنجاح</h2>
                <p className="text-brand-white/70 font-tajawal text-sm leading-relaxed">
                  إذا كان البريد الإلكتروني <span className="text-brand-royal font-inter">{email}</span> مسجلاً لدينا، فستتلقى رابطاً لإعادة تعيين كلمة المرور قريباً. يرجى التحقق من صندوق الوارد أو مجلد البريد المزعج (Spam).
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex justify-center items-center gap-2 royal-gradient hover:royal-gradient-hover text-brand-dark px-4 py-3.5 rounded-xl font-tajawal font-bold transition-all shadow-lg"
                >
                  العودة لتسجيل الدخول
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-8 ">
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-tajawal font-bold text-brand-royal">
                    استعادة كلمة المرور
                  </h1>
                  <p className="text-brand-white/60 font-tajawal text-sm">
                    أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
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

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-tajawal text-brand-white/90 pr-1">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-brand-royal/50" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-4 pr-12 py-3.5 bg-brand-dark/50 border border-brand-royal/20 rounded-xl text-brand-white placeholder-brand-white/30 focus:outline-none focus:ring-2 focus:ring-brand-royal/50 focus:border-transparent transition-all font-inter dir-ltr"
                        placeholder="name@example.com"
                        dir="ltr"
                      />
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
                      'إرسال رابط الاستعادة'
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-brand-white/60 hover:text-brand-royal font-tajawal text-sm transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    تذكرت كلمة المرور؟ العودة للدخول
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
