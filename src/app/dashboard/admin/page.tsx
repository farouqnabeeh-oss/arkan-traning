import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import {
  Users, BookOpen, DollarSign, GraduationCap, MessageSquare,
  TrendingUp, ArrowLeft, Library, ShieldAlert, Mail, MailOpen,
} from 'lucide-react';

async function getStats() {
  try {
    const [studentsCount, coursesCount, publishedCourses, enrollmentsCount, unreadMessages, pendingBooks, suspendedUsers] =
      await Promise.all([
        db.user.count({ where: { role: 'STUDENT' } }),
        db.course.count(),
        db.course.count({ where: { isPublished: true } }),
        db.enrollment.count(),
        db.contactMessage.count({ where: { isRead: false } }).catch(() => 0),
        db.bookPurchase.count({ where: { status: 'PENDING' } }).catch(() => 0),
        db.user.count({ where: { isSuspended: true } }),
      ]);

    const recentStudents = await db.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const recentMessages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, subject: true, isRead: true, createdAt: true },
    }).catch(() => []);

    return {
      studentsCount, coursesCount, publishedCourses, enrollmentsCount,
      unreadMessages, pendingBooks, suspendedUsers, recentStudents, recentMessages,
    };
  } catch {
    return {
      studentsCount: 0, coursesCount: 0, publishedCourses: 0, enrollmentsCount: 0,
      unreadMessages: 0, pendingBooks: 0, suspendedUsers: 0, recentStudents: [], recentMessages: [],
    };
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: 'إجمالي الطلاب', value: stats.studentsCount, icon: Users, href: '/dashboard/admin/students' },
    { label: 'الدورات (منشورة/كل)', value: `${stats.publishedCourses}/${stats.coursesCount}`, icon: BookOpen, href: '/dashboard/admin/courses' },
    { label: 'إجمالي التسجيلات', value: stats.enrollmentsCount, icon: GraduationCap, href: '/dashboard/admin/students' },
    { label: 'رسائل غير مقروءة', value: stats.unreadMessages, icon: MessageSquare, href: '/dashboard/admin/messages' },
    { label: 'طلبات شراء كتب معلّقة', value: stats.pendingBooks, icon: Library, href: '/dashboard/admin/books' },
    { label: 'حسابات معلّقة', value: stats.suspendedUsers, icon: ShieldAlert, href: '/dashboard/admin/students' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-brand-white">أهلًا بك، فاروق 👋</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">نظرة سريعة على أداء المنصة اليوم</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              className="card-premium bg-brand-navy/60 glass-dark p-5 rounded-2xl border border-white/5 hover:border-brand-royal/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center">
                  <Icon size={18} className="text-brand-royal-light" />
                </div>
                <ArrowLeft size={16} className="text-brand-silver-dim group-hover:text-brand-royal-light group-hover:-translate-x-1 transition-all" />
              </div>
              <p className="text-2xl font-black text-brand-white">{c.value}</p>
              <p className="text-xs text-brand-silver-dim mt-1">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h2 className="font-bold text-brand-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-royal-light" /> آخر الطلاب المسجلين
          </h2>
          <div className="space-y-3">
            {stats.recentStudents.length === 0 && (
              <p className="text-sm text-brand-silver-dim">لا يوجد طلاب مسجلين بعد.</p>
            )}
            {stats.recentStudents.map((s: any) => (
              <Link
                key={s.id}
                href={`/dashboard/admin/students/${s.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-brand-white">{s.name}</p>
                  <p className="text-xs text-brand-silver-dim">{s.email}</p>
                </div>
                <span className="text-xs text-brand-silver-dim">
                  {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h2 className="font-bold text-brand-white mb-4">اختصارات سريعة</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/admin/courses/new" className="p-4 rounded-xl bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal-light text-sm font-medium text-center transition-colors">
              + دورة جديدة
            </Link>
            <Link href="/dashboard/admin/settings" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-brand-silver text-sm font-medium text-center transition-colors">
              البيانات البنكية
            </Link>
            <Link href="/dashboard/admin/books/new" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-brand-silver text-sm font-medium text-center transition-colors">
              + كتاب جديد
            </Link>
            <Link href="/dashboard/admin/students" className="p-4 rounded-xl bg-white/5 hover:bg-white/10 text-brand-silver text-sm font-medium text-center transition-colors">
              إدارة الطلاب
            </Link>
          </div>
        </div>
      </div>

      {/* آخر رسائل التواصل */}
      <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-brand-white flex items-center gap-2">
            <MessageSquare size={18} className="text-brand-royal-light" /> آخر رسائل التواصل
          </h2>
          <Link href="/dashboard/admin/messages" className="text-xs text-brand-royal-light hover:text-brand-royal transition-colors">
            عرض الكل ←
          </Link>
        </div>
        <div className="space-y-3">
          {stats.recentMessages.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد رسائل تواصل بعد.</p>
          ) : (
            stats.recentMessages.map((m: any) => (
              <Link
                key={m.id}
                href="/dashboard/admin/messages"
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  m.isRead ? 'hover:bg-white/5' : 'bg-brand-royal/5 hover:bg-brand-royal/10 border border-brand-royal/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {m.isRead
                    ? <MailOpen size={14} className="text-brand-silver-dim shrink-0" />
                    : <Mail size={14} className="text-brand-royal-light shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${m.isRead ? 'text-brand-silver' : 'text-brand-white'}`}>{m.subject}</p>
                    <p className="text-xs text-brand-silver-dim truncate">{m.name} — {m.email}</p>
                  </div>
                </div>
                <span className="text-xs text-brand-silver-dim shrink-0 mr-3">
                  {new Date(m.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
