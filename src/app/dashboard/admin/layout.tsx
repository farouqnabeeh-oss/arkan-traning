import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Logo from '@/components/Logo';
import {
  LayoutDashboard, BookOpen, Users, Settings, Library,
  Gamepad2, MessageSquare, LogOut, ExternalLink, History, BarChart3, Award, Ticket,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/admin', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/dashboard/admin/courses', label: 'الدورات', icon: BookOpen },
  { href: '/dashboard/admin/students', label: 'الطلاب', icon: Users },
  { href: '/dashboard/admin/vouchers', label: 'قسائم الاشتراك', icon: Ticket },
  { href: '/dashboard/admin/books', label: 'المكتبة', icon: Library },
  { href: '/dashboard/admin/games', label: 'الألعاب', icon: Gamepad2 },
  { href: '/dashboard/admin/certificates', label: 'قوالب الشهادات', icon: Award },
  { href: '/dashboard/admin/analytics', label: 'تحليلات متقدمة', icon: BarChart3 },
  { href: '/dashboard/admin/messages', label: 'رسائل التواصل', icon: MessageSquare },
  { href: '/dashboard/admin/audit-log', label: 'سجل التدقيق', icon: History },
  { href: '/dashboard/admin/settings', label: 'الإعدادات العامة', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-brand-dark flex" dir="rtl">
      {/* الشريط الجانبي */}
      <aside className="w-72 shrink-0 hidden lg:flex flex-col glass-dark border-l border-brand-royal/10 sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <Logo className="h-10 w-auto" />
          <p className="mt-3 text-xs text-brand-silver-dim">لوحة تحكم المدرب/الأدمن</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-silver hover:text-brand-white hover:bg-brand-royal/10 transition-all group"
              >
                <Icon size={18} className="text-brand-royal-light group-hover:text-brand-royal transition-colors" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-silver-dim hover:text-brand-white hover:bg-white/5 transition-all"
          >
            <ExternalLink size={18} />
            <span className="text-sm">عرض الموقع</span>
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </aside>

      {/* المحتوى */}
      <main className="flex-1 min-w-0">
        {/* شريط علوي للموبايل */}
        <div className="lg:hidden glass-dark border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-30">
          <Logo className="h-8 w-auto" />
          <Link href="/" className="text-xs text-brand-silver-dim">عرض الموقع ↗</Link>
        </div>
        <div className="p-5 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
