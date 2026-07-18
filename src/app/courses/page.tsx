import React from "react";

export const dynamic = 'force-dynamic';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import CoursesGrid from "@/components/CoursesGrid";
import { Sparkles } from "lucide-react";
import { fallbackCourses } from "@/lib/fallbackData";

async function getCourses(userId?: string) {
  try {
    const courses = await db.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        modules: { include: { lessons: true } },
        _count: { select: { enrollments: true } },
        reviews: { select: { rating: true } },
        ...(userId && {
          enrollments: { where: { userId }, select: { progress: true } },
        }),
      },
    });

    return courses.map((c: any) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription,
      description: c.description,
      price: c.price,
      compareAtPrice: c.compareAtPrice,
      level: c.level,
      category: c.category,
      image: c.image,
      enrollmentsCount: c._count.enrollments,
      lessonsCount: c.modules.reduce(
        (sum: number, m: any) => sum + m.lessons.length,
        0,
      ),
      avgRating:
        c.reviews.length > 0
          ? c.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
            c.reviews.length
          : null,
      progress: userId && c.enrollments?.[0] ? c.enrollments[0].progress : null,
    }));
  } catch {
    return fallbackCourses;
  }
}

export default async function CoursesPage() {
  const user = await getSessionUser();
  const courses = await getCourses(user?.id);

  return (
    <div className="min-h-screen flex flex-col bg-brand-dark">
      <Navbar />

      <section className="relative pt-36 pb-16 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-brand-royal/8 rounded-full blur-[100px] animate-float pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold mx-auto animate-fade-in-up">
            <Sparkles className="w-4 h-4" /> {courses.length} دورة احترافية
            بانتظارك
          </div>
          <h1
            className="text-4xl md:text-6xl font-tajawal font-black text-brand-white animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            استكشف <span className="shimmer-text">الدورات</span>
          </h1>
          <p
            className="text-lg text-brand-white/60 font-tajawal max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            دورات مصممة بعناية لتأخذك من الصفر حتى الاحتراف، بمحتوى عملي وشهادات
            موثقة.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        <CoursesGrid courses={courses} />
      </main>

      <Footer />
    </div>
  );
}
