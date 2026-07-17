import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Plus, BookOpen } from 'lucide-react';
import CourseRowActions from '@/components/admin/CourseRowActions';

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      modules: { include: { lessons: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-brand-white">إدارة الدورات</h1>
          <p className="text-brand-silver-dim mt-1 text-sm">{courses.length} دورة إجمالًا</p>
        </div>
        <Link
          href="/dashboard/admin/courses/new"
          className="royal-gradient text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> دورة جديدة
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-16 text-center">
          <BookOpen size={40} className="mx-auto text-brand-silver-dim mb-4" />
          <p className="text-brand-silver-dim">لا يوجد أي دورة بعد. ابدأ بإنشاء أول دورة.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const lessonsCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
            return (
              <div key={course.id} className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-brand-white truncate">{course.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                        course.isPublished ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-brand-silver-dim'
                      }`}>
                        {course.isPublished ? 'منشورة' : 'مسودة'}
                      </span>
                    </div>
                    <p className="text-xs text-brand-silver-dim">
                      {course.modules.length} موديول · {lessonsCount} درس · {course._count.enrollments} طالب مسجل
                    </p>
                    <p className="text-sm text-brand-royal-light font-bold mt-2">{course.price} ₪</p>
                  </div>
                </div>
                <CourseRowActions courseId={course.id} isPublished={course.isPublished} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
