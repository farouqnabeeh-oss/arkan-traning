'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Terminal, ShieldCheck, Zap, BookOpen, ExternalLink } from 'lucide-react';
import Logo from './Logo';

interface SocialLink {
  label: string;
  url: string;
  icon?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.socialLinks) {
          setSocialLinks(data.socialLinks);
        }
      })
      .catch((err) => {
        console.error('Failed to load social links in footer:', err);
      });
  }, []);

  return (
    <footer className="relative bg-brand-dark pt-20 overflow-hidden border-t border-brand-white/5">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,91,219,0.05)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── Premium CTA Banner ── */}
        <div className="glass-dark border border-brand-royal/20 rounded-[2.5rem] p-10 md:p-14 mb-20 shadow-dark-xl relative overflow-hidden group">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-royal/5 via-transparent to-brand-royal/5 opacity-50 bg-[length:200%_100%] animate-shimmer" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-right flex-1">
              <h3 className="text-3xl md:text-4xl font-tajawal font-black text-brand-white mb-4">
                انضم إلى نخبة <span className="text-brand-royal">المبرمجين</span>
              </h3>
              <p className="text-brand-white/60 font-tajawal text-lg leading-relaxed max-w-xl">
                اشترك في نشرتنا البريدية لتحصل على أحدث التلميحات البرمجية، الألعاب التعليمية الجديدة، وعروض الدورات الحصرية مباشرة في صندوق الوارد الخاص بك.
              </p>
            </div>
            
            <div className="w-full md:w-auto flex-shrink-0">
              <form className="flex flex-col sm:flex-row gap-3 w-full md:w-[450px]">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني..."
                  className="flex-grow bg-brand-white/5 border border-brand-white/10 rounded-2xl px-6 py-4 text-brand-white font-tajawal focus:outline-none focus:border-brand-royal/50 focus:bg-brand-white/10 transition-all text-right placeholder:text-brand-white/30"
                  dir="rtl"
                />
                <button
                  type="button"
                  className="group/btn relative overflow-hidden royal-gradient text-brand-dark font-tajawal font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-royal-glow-sm hover:scale-105 transition-transform"
                >
                  <span className="absolute inset-0 bg-white/20 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 skew-x-12" />
                  <span className="relative z-10">اشتراك</span>
                  <ArrowLeft className="w-4 h-4 relative z-10" />
                </button>
              </form>
              <div className="flex items-center gap-2 mt-4 text-brand-white/40 font-tajawal text-xs justify-start md:justify-end">
                <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                <span>نحن نكره البريد المزعج بقدر ما تكرهه. خصوصيتك في أمان.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Footer Links ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-brand-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Logo className="h-10" />
            <p className="text-brand-white/60 font-tajawal leading-relaxed text-sm max-w-xs">
              أركان هي الوجهة الأولى لتعلم البرمجة باللغة العربية بأسلوب تفاعلي يعتمد على الألعاب والذكاء الاصطناعي لبناء جيل تقني محترف.
            </p>
            
            {socialLinks.length > 0 && (
              <div className="pt-4 flex items-center flex-wrap gap-3">
                {socialLinks.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="w-10 h-10 rounded-xl glass-dark border border-brand-white/10 flex items-center justify-center text-brand-white/50 hover:text-brand-royal hover:border-brand-royal/30 hover:bg-brand-royal/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    {s.icon ? (
                      <img src={s.icon} alt={s.label} className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 text-right">
            <div>
              <h4 className="text-brand-white font-tajawal font-bold text-lg mb-6 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-royal" />
                المنصة
              </h4>
              <ul className="space-y-4">
                {[
                  { label: 'الرئيسية', href: '/' }, 
                  { label: 'الدورات التدريبية', href: '/courses' }, 
                  { label: 'المكتبة الرقمية', href: '/library' }, 
                  { label: 'الألعاب البرمجية', href: '/games' }, 
                  { label: 'لوحة الشرف', href: '/leaderboard' }
                ].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-brand-white/50 hover:text-brand-royal font-tajawal text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-royal/30 group-hover:bg-brand-royal transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-brand-white font-tajawal font-bold text-lg mb-6 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-royal" />
                أشهر المسارات
              </h4>
              <ul className="space-y-4">
                {[
                  { label: 'تطوير واجهات الويب', href: '/courses/web-development-basics' }, 
                  { label: 'بايثون للبيانات', href: '/courses/python-programming' }, 
                  { label: 'أساسيات جافا سكريبت', href: '/courses/advanced-javascript' }, 
                  { label: 'بناء واجهات API', href: '/courses/api-development' }
                ].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-brand-white/50 hover:text-brand-royal font-tajawal text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-royal/30 group-hover:bg-brand-royal transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-brand-white font-tajawal font-bold text-lg mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-royal" />
                الدعم والقانونية
              </h4>
              <ul className="space-y-4">
                {[
                  { label: 'تواصل معنا', href: '/contact' },
                  { label: 'شروط الاستخدام', href: '/terms' },
                  { label: 'سياسة الخصوصية', href: '/privacy' },
                  { label: 'الأسئلة الشائعة', href: '/faq' },
                ].map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-brand-white/50 hover:text-brand-royal font-tajawal text-sm transition-colors flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-royal/30 group-hover:bg-brand-royal transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-brand-white/40 font-tajawal text-sm">
          <p>© {currentYear} منصة أركان التعليمية. جميع الحقوق محفوظة.</p>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 glass-dark px-4 py-1.5 rounded-full border border-brand-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>جميع الأنظمة تعمل بكفاءة</span>
            <Zap className="w-3 h-3 text-brand-royal ml-1" />
          </div>
        </div>
      </div>
      
      {/* Bottom glowing line */}
      <div className="h-1 w-full royal-gradient opacity-80" />
    </footer>
  );
}
