import React from "react";
import { db } from "@/lib/db";
import {
  TrendingDown,
  ClipboardCheck,
  AlertTriangle,
  Users,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import InstructorCharts from "@/components/InstructorCharts";

async function getAnalytics() {
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      modules: { include: { lessons: { include: { progresses: true } } } },
      _count: { select: { enrollments: true } },
      enrollments: { select: { createdAt: true, isCompleted: true } },
    },
  });

  const lessonDropoff: {
    courseTitle: string;
    lessonTitle: string;
    completionRate: number;
    enrollments: number;
  }[] = [];
  for (const course of courses) {
    if (course._count.enrollments === 0) continue;
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        const completedCount = lesson.progresses.filter(
          (p) => p.isCompleted,
        ).length;
        const rate = (completedCount / course._count.enrollments) * 100;
        lessonDropoff.push({
          courseTitle: course.title,
          lessonTitle: lesson.title,
          completionRate: rate,
          enrollments: course._count.enrollments,
        });
      }
    }
  }
  lessonDropoff.sort((a, b) => a.completionRate - b.completionRate);

  const quizzes = await db.quiz.findMany({
    include: {
      attempts: true,
      lesson: { select: { title: true } },
      course: { select: { title: true } },
    },
  });
  const quizStats = quizzes
    .filter((q) => q.attempts.length > 0)
    .map((q) => ({
      title: q.title,
      lessonTitle: q.isFinalExam
        ? `امتحان نهائي — ${q.course?.title || ""}`
        : q.lesson?.title || "—",
      attempts: q.attempts.length,
      passRate:
        (q.attempts.filter((a) => a.isPassed).length / q.attempts.length) * 100,
    }))
    .sort((a, b) => a.passRate - b.passRate);

  const courseRevenue = courses
    .map((c) => ({
      name: c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title,
      revenue: c._count.enrollments * c.price,
    }))
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  const totalRevenue = courses.reduce(
    (sum, c) => sum + c._count.enrollments * c.price,
    0,
  );
  const completedEnrollments = courses.reduce(
    (sum, c) => sum + c.enrollments.filter((e) => e.isCompleted).length,
    0,
  );
  const totalStudents = await db.user.count({ where: { role: "STUDENT" } });
  const pendingPurchases = await db.bookPurchase.count({
    where: { status: "PENDING" },
  });
  const allAttempts = quizzes.reduce((sum, q) => sum + q.attempts.length, 0);
  const passedAttempts = quizzes.reduce(
    (sum, q) => sum + q.attempts.filter((a) => a.isPassed).length,
    0,
  );
  const averagePassRate =
    allAttempts > 0 ? (passedAttempts / allAttempts) * 100 : 0;

  const monthLabels = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  const now = new Date();
  const allEnrollments = courses.flatMap((c) => c.enrollments);
  const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const count = allEnrollments.filter((e) => {
      const ed = new Date(e.createdAt);
      return (
        ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth()
      );
    }).length;
    return { month: monthLabels[d.getMonth()], enrollments: count };
  });

  return {
    lessonDropoff: lessonDropoff.slice(0, 8),
    quizStats: quizStats.slice(0, 8),
    courseRevenue,
    monthlyTrend,
    summary: {
      totalStudents,
      completedEnrollments,
      totalRevenue,
      pendingPurchases,
      averagePassRate,
    },
  };
}

export default async function AdminAnalyticsPage() {
  const { lessonDropoff, quizStats, courseRevenue, monthlyTrend, summary } =
    await getAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-brand-white">تحليلات متقدمة</h1>
        <p className="text-brand-silver-dim mt-1 text-sm">
          مؤشرات تشغيل حقيقية تساعدك على معرفة أين تتوقف رحلة الطالب
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-silver-dim">إجمالي الطلاب</p>
              <p className="text-xl font-black text-brand-white mt-1">
                {summary.totalStudents.toLocaleString("ar-EG")}
              </p>
            </div>
            <div className="rounded-xl bg-brand-royal/15 p-2 text-brand-royal-light">
              <Users size={18} />
            </div>
          </div>
        </div>
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-silver-dim">
                الاختبارات المكتملة
              </p>
              <p className="text-xl font-black text-brand-white mt-1">
                {summary.completedEnrollments.toLocaleString("ar-EG")}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-silver-dim">إجمالي الإيرادات</p>
              <p className="text-xl font-black text-brand-white mt-1">
                {summary.totalRevenue.toLocaleString("ar-EG")} ₪
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/15 p-2 text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
        </div>
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-silver-dim">طلبات شراء معلقة</p>
              <p className="text-xl font-black text-brand-white mt-1">
                {summary.pendingPurchases.toLocaleString("ar-EG")}
              </p>
            </div>
            <div className="rounded-xl bg-brand-royal/15 p-2 text-brand-royal-light">
              <ClipboardCheck size={18} />
            </div>
          </div>
        </div>
        <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-brand-silver-dim">
                متوسط نجاح الكويزات
              </p>
              <p className="text-xl font-black text-brand-white mt-1">
                {Math.round(summary.averagePassRate)}%
              </p>
            </div>
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-400">
              <TrendingDown size={18} />
            </div>
          </div>
        </div>
      </div>

      <InstructorCharts
        courseRevenue={courseRevenue}
        monthlyTrend={monthlyTrend}
      />

      <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-6">
        <h2 className="font-bold text-brand-white mb-1 flex items-center gap-2">
          <TrendingDown size={18} className="text-red-400" /> أعلى نقاط تسرب
          الطلاب
        </h2>
        <p className="text-xs text-brand-silver-dim mb-5">
          الدروس اللي أقل نسبة من الطلاب بيكملوها (مرتبة من الأسوأ)
        </p>
        {lessonDropoff.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            لا توجد بيانات كافية بعد.
          </p>
        ) : (
          <div className="space-y-3">
            {lessonDropoff.map((l, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="text-sm text-brand-white truncate">
                    {l.lessonTitle}
                  </p>
                  <p className="text-xs text-brand-silver-dim">
                    {l.courseTitle} · {l.enrollments} طالب مسجل
                  </p>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 mr-3 ${l.completionRate < 30 ? "text-red-400" : l.completionRate < 60 ? "text-amber-400" : "text-emerald-400"}`}
                >
                  {Math.round(l.completionRate)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-premium bg-brand-navy/60 glass-dark rounded-2xl border border-white/5 p-6">
        <h2 className="font-bold text-brand-white mb-1 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-brand-royal-light" /> معدل
          نجاح الكويزات
        </h2>
        <p className="text-xs text-brand-silver-dim mb-5">
          الكويزات اللي فيها أعلى نسبة رسوب (مرتبة من الأسوأ)
        </p>
        {quizStats.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            لا توجد محاولات كويز بعد.
          </p>
        ) : (
          <div className="space-y-3">
            {quizStats.map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
              >
                <div className="min-w-0">
                  <p className="text-sm text-brand-white truncate flex items-center gap-1.5">
                    {q.passRate < 50 && (
                      <AlertTriangle
                        size={12}
                        className="text-red-400 shrink-0"
                      />
                    )}{" "}
                    {q.title}
                  </p>
                  <p className="text-xs text-brand-silver-dim">
                    {q.lessonTitle} · {q.attempts} محاولة
                  </p>
                </div>
                <span
                  className={`text-sm font-bold shrink-0 mr-3 ${q.passRate < 50 ? "text-red-400" : q.passRate < 75 ? "text-amber-400" : "text-emerald-400"}`}
                >
                  {Math.round(q.passRate)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
