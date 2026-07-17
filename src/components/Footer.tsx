import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Terminal, ShieldCheck, Zap, BookOpen } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
            
            <div className="pt-4 flex items-center gap-4">
              {[
                { 
                  name: 'Twitter', 
                  href: '#', 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> 
                },
                { 
                  name: 'Github', 
                  href: '#', 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg> 
                },
                { 
                  name: 'Linkedin', 
                  href: '#', 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> 
                },
                { 
                  name: 'Youtube', 
                  href: '#', 
                  icon: (props: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> 
                },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <a
                    key={i}
                    href={social.href}
                    className="w-10 h-10 rounded-xl glass-dark border border-brand-white/10 flex items-center justify-center text-brand-white/50 hover:text-brand-royal hover:border-brand-royal/30 hover:bg-brand-royal/5 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
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
