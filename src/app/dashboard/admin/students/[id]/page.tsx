import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ArrowRight, GraduationCap, Award, ClipboardList, Monitor, Library, Gamepad2 } from 'lucide-react';
import StudentActions from '@/components/admin/StudentActions';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const student = await db.user.findUnique({
    where: { id: params.id },
    include: {
      enrollments: { include: { course: { select: { id: true, title: true } } } },
      quizAttempts: { include: { quiz: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 15 },
      submissions: { include: { assignment: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 15 },
      certificates: { include: { course: { select: { title: true } } } },
      loginEvents: { orderBy: { createdAt: 'desc' }, take: 10 },
      sessions: { where: { isActive: true } },
      bookPurchases: { include: { book: { select: { title: true } } }, orderBy: { createdAt: 'desc' } },
      gameScores: { include: { game: { select: { name: true } } }, orderBy: { completedAt: 'desc' }, take: 10 },
    },
  });

  if (!student) notFound();

  const allCourses = await db.course.findMany({ select: { id: true, title: true }, orderBy: { title: 'asc' } });

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/students" className="flex items-center gap-2 text-sm text-brand-silver-dim hover:text-brand-white transition-colors w-fit">
        <ArrowRight size={16} /> رجوع لقائمة الطلاب
      </Link>

      <div>
        <h1 className="text-2xl font-black text-brand-white">{student.name}</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">{student.email} · انضم بتاريخ {new Date(student.createdAt).toLocaleDateString('ar-EG')}</p>
      </div>

      <StudentActions
        studentId={student.id}
        initial={{ name: student.name, email: student.email, phone: student.phone || '', isSuspended: student.isSuspended }}
        allCourses={allCourses}
        enrolledCourseIds={student.enrollments.map((e) => e.courseId)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {/* الدورات والتقدم */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><GraduationCap size={18} className="text-brand-royal-light" /> الدورات والتقدم</h3>
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">غير مسجل بأي دورة.</p>
          ) : (
            <div className="space-y-3">
              {student.enrollments.map((e) => (
                <div key={e.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-brand-white">{e.course.title}</span>
                    <span className="text-brand-silver-dim">{Math.round(e.progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full royal-gradient" style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الشهادات */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><Award size={18} className="text-brand-royal-light" /> الشهادات</h3>
          {student.certificates.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد شهادات بعد.</p>
          ) : (
            <div className="space-y-2">
              {student.certificates.map((c) => (
                <div key={c.id} className="text-sm text-brand-silver flex items-center justify-between">
                  <span>{c.course.title}</span>
                  <span className="text-xs text-brand-silver-dim">{new Date(c.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الكويزات */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-brand-royal-light" /> نتائج الكويزات</h3>
          {student.quizAttempts.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد محاولات بعد.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {student.quizAttempts.map((q) => (
                <div key={q.id} className="text-sm text-brand-silver flex items-center justify-between">
                  <span className="truncate">{q.quiz.title}</span>
                  <span className={`text-xs shrink-0 mr-2 ${q.score >= 60 ? 'text-emerald-400' : 'text-red-400'}`}>{q.score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الأجهزة والدخول */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><Monitor size={18} className="text-brand-royal-light" /> الجلسات النشطة</h3>
          {student.sessions.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد جلسات نشطة.</p>
          ) : (
            <div className="space-y-2">
              {student.sessions.map((s: any) => (
                <div key={s.id} className="text-xs text-brand-silver-dim">بصمة الجهاز: {s.fingerprint?.slice(0, 12) || 'غير معروفة'}... · {new Date(s.updatedAt).toLocaleString('ar-EG')}</div>
              ))}
            </div>
          )}
        </div>

        {/* المكتبة */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><Library size={18} className="text-brand-royal-light" /> مشتريات المكتبة</h3>
          {student.bookPurchases.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لا توجد مشتريات كتب.</p>
          ) : (
            <div className="space-y-2">
              {student.bookPurchases.map((b) => (
                <div key={b.id} className="text-sm text-brand-silver flex items-center justify-between">
                  <span>{b.book.title}</span>
                  <span className="text-xs text-brand-silver-dim">{b.status === 'APPROVED' ? 'مقبول' : b.status === 'PENDING' ? 'قيد المراجعة' : 'مرفوض'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* الألعاب */}
        <div className="card-premium bg-brand-navy/60 glass-dark p-6 rounded-2xl border border-white/5">
          <h3 className="font-bold text-brand-white mb-4 flex items-center gap-2"><Gamepad2 size={18} className="text-brand-royal-light" /> أداء الألعاب</h3>
          {student.gameScores.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">لم يلعب أي لعبة بعد.</p>
          ) : (
            <div className="space-y-2">
              {student.gameScores.map((g) => (
                <div key={g.id} className="text-sm text-brand-silver flex items-center justify-between">
                  <span>{g.game.name}</span>
                  <span className="text-xs text-brand-royal-light">{g.score} نقطة</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
