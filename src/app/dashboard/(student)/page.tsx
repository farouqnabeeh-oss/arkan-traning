import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { BookOpen, Award, CheckCircle2, TrendingUp, ArrowLeft, PlayCircle, Gamepad2, Settings, AlertTriangle } from 'lucide-react';

async function getDashboardData(userId: string) {
  try {
    const enrollments = await db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        lessonProgresses: true,
      },
    });

    const certificates = await db.certificate.findMany({
      where: { userId },
      include: { course: true },
    });

    const recentScores = await db.gameScore.findMany({
      where: { userId },
      include: { game: true },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    return { enrollments, certificates, recentScores, error: false };
  } catch (err) {
    console.error('Database error in student dashboard data:', err);
    return { enrollments: [], certificates: [], recentScores: [], error: true };
  }
}

export default async function StudentDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
    redirect('/dashboard/admin');
  }

  const { enrollments, certificates, recentScores, error } = await getDashboardData(user.id);

  const stats = {
    enrolled: enrollments.length,
    completed: enrollments.filter((e) => e.isCompleted).length,
    certificatesCount: certificates.length,
    avgProgress: enrollments.length
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0,
  };

  return (
    <div className="space-y-10 text-right font-tajawal">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-brand-royal/10">
        <div>
          <h1 className="text-3xl font-bold text-brand-white">لوحتي التعليمية</h1>
          <p className="text-brand-white/50 text-sm mt-1">مرحباً بك مجدداً، {user.name} 👋. واصل رحلة التعلم وتحقيق الإنجازات.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 text-red-300 text-sm px-5 py-4 rounded-2xl">
          <AlertTriangle size={18} className="shrink-0" />
          <span>تعذّر تحميل بيانات لوحتك حاليًا بسبب مشكلة اتصال مؤقتة. جرّب تحديث الصفحة بعد لحظات.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-brand-white/40 block">الدورات المشترك بها</span>
            <span className="text-2xl font-bold text-brand-white font-inter mt-1 block">{stats.enrolled}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-royal/15 flex items-center justify-center text-brand-royal-light">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-brand-white/40 block">الدورات المكتملة</span>
            <span className="text-2xl font-bold text-brand-white font-inter mt-1 block">{stats.completed}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-brand-white/40 block">معدل التقدم العام</span>
            <span className="text-2xl font-bold text-brand-white font-inter mt-1 block">{stats.avgProgress}%</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="text-right">
            <span className="text-xs text-brand-white/40 block">الشهادات الموثقة</span>
            <span className="text-2xl font-bold text-brand-white font-inter mt-1 block">{stats.certificatesCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Enrolled Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-brand-white">دوراتي التدريبية الحالية</h2>

          {enrollments.length === 0 ? (
            <div className="glass-dark border border-brand-royal/20 p-10 rounded-2xl text-center space-y-4">
              <BookOpen className="w-12 h-12 text-brand-royal/40 mx-auto" />
              <h3 className="text-lg font-bold text-brand-white">لم تشترك في أي دورة بعد</h3>
              <p className="text-brand-white/50 text-sm max-w-sm mx-auto">
                ابدأ بتصفح قائمة الدورات التعليمية المتاحة واستخدم كود التفعيل الخاص بك للانضمام.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 bg-brand-royal/20 text-brand-royal-light border border-brand-royal/30 px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-brand-royal/30 transition-colors"
              >
                تصفح الدورات التدريبية
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enroll) => (
                <div
                  key={enroll.id}
                  className="glass-dark border border-brand-royal/20 p-6 rounded-2xl hover:border-brand-royal/40 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2 flex-grow text-right w-full">
                    <h3 className="text-xl font-bold text-brand-white">{enroll.course.title}</h3>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs text-brand-white/50 font-inter">
                        <span>{Math.round(enroll.progress)}% مكتمل</span>
                        <span>التقدم الحالي</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full royal-gradient"
                          style={{ width: `${enroll.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                      href={`/player/${enroll.course.slug}`}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto bg-brand-royal/20 hover:bg-brand-royal/30 text-brand-royal-light border border-brand-royal/30 hover:border-brand-royal/50 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      متابعة الشرح
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar (Certificates + Recent Game Scores) */}
        <div className="space-y-8">
          {/* Verified Certificates */}
          <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-brand-white">شهاداتي المعتمدة</h3>
            {certificates.length === 0 ? (
              <p className="text-brand-white/40 text-sm">لم تصدر لك أي شهادة بعد. أكمل منهاج دورتك بنسبة 100% لإصدار شهادتك فوراً.</p>
            ) : (
              <div className="space-y-3">
                {certificates.map((cert) => (
                  <Link
                    key={cert.id}
                    href={`/verify/${cert.verificationId}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-brand-royal/15 hover:bg-brand-royal/10 transition-colors"
                  >
                    <span className="text-xs text-brand-royal-light font-bold bg-brand-royal/10 px-2 py-1 rounded">عرض المستند</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-brand-white block">{cert.course.title}</span>
                      <span className="text-[10px] text-brand-white/30 font-inter block mt-0.5">{cert.verificationId}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Game History */}
          <div className="glass-dark border border-brand-royal/20 p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-brand-white">النشاط البرمجي الأخير</h3>
            {recentScores.length === 0 ? (
              <p className="text-brand-white/40 text-sm">لا يوجد نشاط برمجي مسجل. جرب إحدى الألعاب البرمجية في منصة الألعاب.</p>
            ) : (
              <div className="space-y-4">
                {recentScores.map((score) => (
                  <div key={score.id} className="flex justify-between items-center text-sm pb-3 border-b border-brand-royal/10 last:border-0 last:pb-0">
                    <span className="text-brand-royal-light font-bold font-inter">+{score.score} نقطة</span>
                    <div className="text-right">
                      <span className="font-bold text-brand-white block">{score.game.name}</span>
                      <span className="text-xs text-brand-white/40 block">المستوى: {score.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
