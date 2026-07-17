'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col mt-10 items-center justify-center py-20 px-4 text-center">
        {/* Error icon */}
        <div className="relative mb-10">
          <div className="w-24 h-24 rounded-full royal-gradient flex items-center justify-center shadow-royal-glow">
            <span className="text-brand-dark text-4xl font-black">!</span>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-brand-royal/30 scale-125 animate-pulse" />
        </div>

        <h1 className="text-3xl md:text-4xl font-tajawal font-black text-brand-white mb-4">
          حدث خطأ غير متوقع
        </h1>
        <p className="text-brand-white/50 font-tajawal max-w-md mb-10 text-lg leading-relaxed">
          واجه خادم أركان مشكلة فنية غير متوقعة. يتم إرسال تقارير الأخطاء للمشرفين لحلها فوراً.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => reset()}
            className="royal-gradient text-brand-dark font-tajawal font-black px-10 py-3.5 rounded-2xl shadow-royal-glow hover:scale-105 transition-transform duration-300"
          >
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="glass-dark text-brand-royal font-tajawal font-bold border border-brand-royal/30 px-10 py-3.5 rounded-2xl hover:border-brand-royal hover:scale-105 transition-all duration-300"
          >
            العودة للرئيسية
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
