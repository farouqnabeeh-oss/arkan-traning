import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCurriculum from "@/components/CourseCurriculum";
import CourseEnrollButton from "@/components/CourseEnrollButton";
import CourseQA from "@/components/CourseQA";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import {
  Clock,
  BookOpen,
  Star,
  Award,
  Shield,
  User,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await db.course.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      image: true,
    },
  });
  if (!course) return { title: "الدورة غير موجودة | أركان" };

  const description =
    course.shortDescription || course.description.slice(0, 160);
  return {
    title: `${course.title} | أركان`,
    description,
    openGraph: {
      title: course.title,
      description,
      images: course.image ? [course.image] : undefined,
    },
  };
}

function getYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

async function getCourseDetails(slug: string) {
  return db.course.findUnique({
    where: { slug },
    include: {
      modules: { include: { lessons: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      courseQuestions: {
        include: {
          user: { select: { name: true } },
          answers: {
            include: { user: { select: { name: true, role: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function CourseDetailPage({ params }: Props) {
  const course = await getCourseDetails(params.slug);
  if (!course || !course.isPublished) notFound();

  const user = await getSessionUser();
  let isEnrolled = false;
  let isCourseCompleted = false;
  if (user) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    isEnrolled = !!enrollment;
    isCourseCompleted = enrollment?.isCompleted || false;
  }

  const totalLessons = course.modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0,
  );
  const totalDurationSeconds = course.modules.reduce(
    (sum, mod) => sum + mod.lessons.reduce((lSum, l) => lSum + l.duration, 0),
    0,
  );
  const totalHours = Math.round((totalDurationSeconds / 3600) * 10) / 10;
  const avgRating =
    course.reviews.length > 0
      ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
      : null;
  const trailerId = course.trailerUrl ? getYoutubeId(course.trailerUrl) : null;
  const levelLabel =
    course.level === "BEGINNER"
      ? "مبتدئ"
      : course.level === "INTERMEDIATE"
        ? "متوسط"
        : course.level === "ADVANCED"
          ? "متقدم"
          : "كل المستويات";
  const whatYoullLearn = course.whatYoullLearn || [];
  const requirements = course.requirements || [];
  const targetAudience = course.targetAudience || [];

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark">
      <Navbar />

      <section className="bg-brand-dark pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-royal/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-brand-navy/40 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm font-tajawal text-brand-white/50 mb-8">
            <Link
              href="/"
              className="hover:text-brand-royal-light transition-colors"
            >
              الرئيسية
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <Link
              href="/courses"
              className="hover:text-brand-royal-light transition-colors"
            >
              الدورات
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-brand-royal-light font-bold">
              {course.title}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 text-right">
            <div className="lg:col-span-2 space-y-8">
              <div className="inline-flex items-center gap-2 glass-royal px-4 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold">
                <Sparkles className="w-4 h-4" />{" "}
                {course.category || "دورة احترافية"}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-tajawal font-black text-brand-white leading-[1.2]">
                {course.title}
              </h1>
              <p className="text-lg md:text-xl text-brand-white/70 font-tajawal leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {trailerId && (
                <div className="rounded-2xl overflow-hidden border border-brand-royal/20 aspect-video max-w-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerId}`}
                    title="فيديو تعريفي"
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  {
                    icon: BookOpen,
                    label: "الدروس",
                    value: `${totalLessons} درس`,
                  },
                  {
                    icon: Clock,
                    label: "المدة الكلية",
                    value: `${totalHours} ساعة`,
                  },
                  {
                    icon: Star,
                    label: "التقييم",
                    value: avgRating ? `${avgRating.toFixed(1)} ★` : "جديدة",
                  },
                  { icon: Award, label: "المستوى", value: levelLabel },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="glass-dark border border-white/5 p-5 rounded-2xl text-center"
                    >
                      <Icon className="w-5 h-5 text-brand-royal-light mx-auto mb-3" />
                      <div className="text-xs text-brand-white/40 font-tajawal mb-1">
                        {stat.label}
                      </div>
                      <div className="text-base font-bold text-brand-white font-tajawal">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 text-right">
          <div className="lg:col-span-8 space-y-16">
            {whatYoullLearn.length > 0 && (
              <div className="glass-dark rounded-3xl p-8 md:p-10 border border-white/5">
                <h2 className="text-2xl md:text-3xl font-tajawal font-bold text-brand-white mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-8 royal-gradient rounded-full block" />{" "}
                  ماذا ستتعلم في هذه الدورة؟
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 font-tajawal text-brand-white/80">
                  {whatYoullLearn.map((skill, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-brand-royal-light mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(requirements.length > 0 || targetAudience.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-6">
                {requirements.length > 0 && (
                  <div className="glass-dark rounded-2xl p-6 border border-white/5">
                    <h3 className="font-tajawal font-bold text-brand-white mb-4">
                      المتطلبات المسبقة
                    </h3>
                    <ul className="space-y-2 text-sm text-brand-white/60 font-tajawal">
                      {requirements.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {targetAudience.length > 0 && (
                  <div className="glass-dark rounded-2xl p-6 border border-white/5">
                    <h3 className="font-tajawal font-bold text-brand-white mb-4">
                      الفئة المستهدفة
                    </h3>
                    <ul className="space-y-2 text-sm text-brand-white/60 font-tajawal">
                      {targetAudience.map((r, i) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-tajawal font-bold text-brand-white flex items-center gap-3">
                <span className="w-1.5 h-8 royal-gradient rounded-full block" />{" "}
                منهاج الدورة بالتفصيل
              </h2>
              <div className="glass-dark rounded-3xl p-8 md:p-10 border border-white/5">
                <CourseCurriculum modules={course.modules} />
              </div>
            </div>

            <CourseQA
              courseId={course.id}
              initialQuestions={JSON.parse(
                JSON.stringify(course.courseQuestions),
              )}
              isLoggedIn={!!user}
            />
          </div>

          <div className="lg:col-span-4">
            <div className="glass-dark border border-brand-royal/15 rounded-[2rem] shadow-dark-xl lg:-mt-64 relative z-30 overflow-hidden sticky top-32">
              <div className="absolute top-0 left-0 w-full h-1.5 royal-gradient" />
              <div className="p-8 space-y-8">
                <div className="text-center pb-8 border-b border-white/5">
                  <span className="text-sm text-brand-white/50 font-tajawal block mb-2 font-bold">
                    الاستثمار المطلوب:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    {course.compareAtPrice && (
                      <span className="text-lg text-brand-white/30 line-through font-tajawal">
                        {course.compareAtPrice} ₪
                      </span>
                    )}
                    <span className="text-5xl font-black text-brand-white">
                      {course.price}
                    </span>
                    <span className="text-2xl font-bold text-brand-royal-light">
                      ₪
                    </span>
                  </div>
                </div>

                <div className="space-y-5 font-tajawal text-sm text-brand-white/70">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-brand-royal-light" />
                    </div>
                    <span className="font-bold">ضمان تحديث المحتوى مجانًا</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-brand-royal-light" />
                    </div>
                    <span className="font-bold">شهادة إتمام موثقة برمز QR</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-royal/15 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-brand-royal-light" />
                    </div>
                    <span className="font-bold">وصول دائم ومستمر للمنهاج</span>
                  </div>
                </div>

                <CourseEnrollButton
                  course={{
                    id: course.id,
                    title: course.title,
                    price: course.price,
                  }}
                  isLoggedIn={!!user}
                  isEnrolled={isEnrolled}
                />
                {isEnrolled && isCourseCompleted && (
                  <Link
                    href={`/courses/${course.slug}/final-exam`}
                    className="mt-3 w-full royal-gradient text-white font-tajawal font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <GraduationCap size={18} /> قدّم الامتحان النهائي واحصل على
                    شهادتك
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
