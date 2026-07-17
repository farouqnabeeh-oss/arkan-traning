'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home, ArrowRight, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <Navbar />
      <main className="flex-grow flex mt-10 flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,91,219,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,91,219,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,91,219,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* 404 giant text */}
        <div className="relative mb-8 select-none">
          <span className="text-[160px] md:text-[220px] font-black font-inter leading-none text-brand-white/[0.04]">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Pillar graphic */}
            <div className="relative flex flex-col items-center">
              <div className="w-20 h-3.5 rounded-full royal-gradient shadow-royal-glow-sm" />
              <div className="w-14 h-28 border-x-4 border-dashed border-brand-royal/40 my-1 relative">
                {/* Fluting */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-royal/20" />
              </div>
              <div className="w-20 h-3.5 rounded-full royal-gradient shadow-royal-glow-sm" />
              {/* Overlay number */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black font-inter shimmer-text text-glow-royal">404</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-5 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-tajawal font-black text-brand-white">
            عذراً، الصفحة{' '}
            <span className="royal-text-gradient">غير موجودة</span>
          </h1>
          <p className="text-brand-white/50 font-tajawal text-lg leading-relaxed">
            يبدو أنك سلكت مساراً غير صحيح. الركن الذي تبحث عنه ربما تم نقله أو لم يكن موجوداً من الأساس.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/"
              className="group flex items-center justify-center gap-3 royal-gradient text-brand-dark font-tajawal font-black px-10 py-4 rounded-2xl shadow-royal-glow hover:scale-105 transition-transform duration-300"
            >
              <Home className="w-5 h-5" />
              العودة للرئيسية
              <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/courses"
              className="flex items-center justify-center gap-3 glass-dark text-brand-royal font-tajawal font-bold border border-brand-royal/30 px-10 py-4 rounded-2xl hover:border-brand-royal hover:scale-105 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
              تصفّح الدورات
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
