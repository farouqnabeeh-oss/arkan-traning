import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CounterStats from "@/components/CounterStats";
import FaqAccordion from "@/components/FaqAccordion";
import { db } from "@/lib/db";

import {
  BookOpen,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Star,
  Users,
  CheckCircle2,
  GraduationCap,
  ChevronLeft,
  Award,
  Quote,
  Brain,
  Layers,
  QrCode,
  Rocket,
  Library,
} from "lucide-react";

/* ─── جلب بيانات حقيقية من قاعدة البيانات ─────────────────────────────── */
async function getHomeData() {
  try {
    const [
      studentsCount,
      coursesCount,
      certificatesCount,
      publishedCourses,
      reviews,
      books,
    ] = await Promise.all([
      db.user.count({ where: { role: "STUDENT" } }),
      db.course.count({ where: { isPublished: true } }),
      db.certificate.count(),
      db.course.findMany({
        where: { isPublished: true },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { createdAt: "desc" },
      }),
      db.review.findMany({
        orderBy: { rating: 'desc' },
        take: 3,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
      }),
      db.book.findMany({
        where: { isPublished: true },
        include: { _count: { select: { purchases: true } } },
        orderBy: { createdAt: 'desc' },
        take: 4,
      }),
    ]);

    const avgRatingAgg = await db.review.aggregate({
      _avg: { rating: true },
      _count: true,
    });
    const avgRating =
      avgRatingAgg._count > 0 ? avgRatingAgg._avg.rating || 0 : null;

    const featuredCourses = [...publishedCourses]
      .sort((a, b) => b._count.enrollments - a._count.enrollments)
      .slice(0, 3);
    
    const topBooks = [...(books || [])]
      .sort((a, b) => b._count.purchases - a._count.purchases)
      .slice(0, 4);

    const tracksMap = new Map<string, typeof publishedCourses>();
    publishedCourses.forEach((c) => {
      const key = c.category || "عام";
      if (!tracksMap.has(key)) tracksMap.set(key, []);
      tracksMap.get(key)!.push(c);
    });
    const tracks = Array.from(tracksMap.entries()).map(([name, courses]) => ({
      name,
      courses,
    }));

    return {
      studentsCount,
      coursesCount,
      certificatesCount,
      featuredCourses,
      reviews,
      avgRating,
      tracks,
      topBooks,
    };
  } catch {
    return {
      studentsCount: 0,
      coursesCount: 0,
      certificatesCount: 0,
      featuredCourses: [],
      reviews: [],
      avgRating: null,
      tracks: [],
      topBooks: [],
    };
  }
}

async function getFaqs() {
  try {
    const dbFaqs = await db.fAQ.findMany({
      orderBy: { sortOrder: "asc" },
      take: 5,
    });
    if (dbFaqs.length > 0) return dbFaqs;
  } catch {
    /* fallback */
  }
  return [];
}

export default async function HomePage() {
  const {
    studentsCount,
    coursesCount,
    certificatesCount,
    featuredCourses,
    reviews,
    avgRating,
    tracks,
    topBooks,
  } = await getHomeData();
  const faqs = await getFaqs();

  const features = [
    {
      icon: BookOpen,
      title: "محتوى أكاديمي احترافي",
      desc: "فيديوهات عالية الدقة ومسار تعليمي منظم من الصفر للاحتراف مع تطبيقات عملية حقيقية.",
    },
    {
      icon: Gamepad2,
      title: "ألعاب برمجية تنافسية",
      desc: "تعلّم CSS وبايثون وجافا سكريبت بأسلوب الألعاب التي تقيس مهارتك وتصعّد مستواك.",
    },
    {
      icon: Library,
      title: "مكتبة كتب رقمية",
      desc: "كتب متخصصة بصيغة PDF تدعم رحلتك التعليمية خطوة بخطوة.",
    },
    {
      icon: ShieldCheck,
      title: "شهادات موثّقة",
      desc: "شهادة إتمام برمز QR فريد قابل للتحقق العام فور إكمالك جميع متطلبات الدورة.",
    },
  ];

  const learningSteps = [
    {
      num: "01",
      title: "سجّل حسابك",
      desc: "أنشئ حسابك مجانًا في دقيقة واحدة وادخل عالم أركان.",
    },
    {
      num: "02",
      title: "اختر مسارك",
      desc: "تصفح الدورات والمسارات التعليمية واختر ما يناسب هدفك.",
    },
    {
      num: "03",
      title: "تعلّم واحصل على شهادتك",
      desc: "أكمل الدروس والتحديات واحصد شهادتك الموثقة برمز QR.",
    },
  ];

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col overflow-x-hidden">
      <Navbar />

      {/* ═══ Hero ═══ */}
      <section className="relative pt-40 pb-28 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-royal/10 rounded-full blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-brand-royal-light/5 rounded-full blur-[100px] animate-float-rev pointer-events-none" />

        {/* أعمدة زخرفية خفيفة تعكس هوية "أركان" */}
        <div className="absolute inset-0 flex justify-center gap-32 opacity-[0.04] pointer-events-none">
          <div className="w-6 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
          <div className="w-6 h-full bg-gradient-to-b from-transparent via-brand-royal-light to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 glass-royal px-5 py-2 rounded-full text-brand-royal text-sm font-tajawal font-bold shadow-royal-glow-sm mx-auto animate-fade-in-up">
            <Sparkles className="w-4 h-4" /> منصة أركان التعليمية
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-tajawal font-black text-brand-white leading-[1.15] animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            ابنِ أساسك التقني على
            <br />
            <span className="shimmer-text text-glow-royal">أركان راسخة</span>
          </h1>

          <p
            className="text-lg md:text-xl text-brand-white/60 font-tajawal max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            دورات برمجية احترافية، ألعاب تفاعلية لصقل مهاراتك، ومكتبة رقمية
            متخصصة — كل ذلك بشهادات موثقة تفتح لك أبواب المستقبل.
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-4 pt-2 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/courses"
              className="group relative overflow-hidden flex items-center gap-2 royal-gradient text-white px-8 py-4 rounded-2xl font-tajawal text-base font-black shadow-royal-glow hover:-translate-y-1 transition-all duration-300"
            >
              <Rocket className="w-5 h-5" /> ابدأ رحلتك الآن
            </Link>
            <Link
              href="/games"
              className="flex items-center gap-2 glass-dark border border-brand-royal/20 text-brand-white px-8 py-4 rounded-2xl font-tajawal text-base font-bold hover:border-brand-royal/40 transition-all duration-300"
            >
              <Gamepad2 className="w-5 h-5 text-brand-royal-light" /> جرّب
              الألعاب مجانًا
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ أركان بالأرقام ═══ */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <CounterStats
            stats={[
              {
                icon: "🎓",
                label: "طالب مسجّل",
                target: studentsCount,
                suffix: "+",
              },
              {
                icon: "📚",
                label: "دورة احترافية",
                target: coursesCount,
                suffix: "+",
              },
              {
                icon: "🏆",
                label: "شهادة صادرة",
                target: certificatesCount,
                suffix: "+",
              },
              ...(avgRating
                ? [
                    {
                      icon: "⭐",
                      label: "متوسط تقييم الطلاب",
                      target: Math.round(avgRating * 10) / 10,
                      suffix: "/5",
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </section>

      {/* ═══ لماذا أركان ═══ */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-royal-light font-tajawal font-bold text-sm">
              لماذا أركان؟
            </span>
            <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white section-title-line">
              تجربة تعليمية{" "}
              <span className="text-brand-royal-light">متكاملة</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="glass-dark p-7 rounded-[2rem] border border-brand-royal/20 hover:border-brand-royal/40 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-royal-glow hover:-translate-y-1 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-royal/10 border border-brand-royal/20 flex items-center justify-center mb-5 group-hover:bg-brand-royal/20 transition-all">
                    <Icon className="w-6 h-6 text-brand-royal-light" />
                  </div>
                  <h3 className="font-tajawal font-bold text-brand-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-brand-white/50 font-tajawal leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ المسارات التعليمية ═══ */}
      {tracks.length > 0 && (
        <section className="py-24 relative bg-brand-navy/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-brand-royal-light font-tajawal font-bold text-sm">
                مسارك يبدأ من هنا
              </span>
              <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
                المسارات{" "}
                <span className="text-brand-royal-light">التعليمية</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks.map((track, i) => (
                <div
                  key={track.name}
                  className="glass-dark p-8 rounded-[2.5rem] border border-brand-royal/20 hover:border-brand-royal/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-royal/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div>
                    {/* Badge */}
                    <div className="flex justify-between items-center mb-6">
                      <span className="inline-block bg-brand-royal/15 border border-brand-royal/35 text-brand-royal-light font-tajawal text-xs px-3.5 py-1 rounded-full font-bold">
                        مسار مهني متكامل
                      </span>
                      <span className="text-[10px] text-brand-white/30 font-inter font-bold">
                        TRACK 0{i + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-royal/10 border border-brand-royal/25 flex items-center justify-center shadow-royal-glow-sm">
                        <Layers className="w-6 h-6 text-brand-royal-light" />
                      </div>
                      <h3 className="font-tajawal font-black text-brand-white text-xl group-hover:text-brand-royal-light transition-colors">
                        {track.name}
                      </h3>
                    </div>

                    <p className="text-sm text-brand-white/40 font-tajawal mb-6">
                      يحتوي هذا المسار على{" "}
                      <span className="text-brand-royal-light font-bold">
                        {track.courses.length} دورات متسلسلة
                      </span>{" "}
                      من البداية للاحتراف.
                    </p>

                    {/* Track roadmap / steps */}
                    <div className="space-y-4 mb-8 relative before:absolute before:right-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-brand-royal/10">
                      {track.courses.slice(0, 3).map((c, idx) => (
                        <Link
                          key={c.id}
                          href={`/courses/${c.slug}`}
                          className="flex items-center gap-4 text-sm text-brand-white/70 hover:text-brand-royal-light font-tajawal transition-colors group/item pr-2"
                        >
                          <span className="w-7 h-7 rounded-full bg-brand-dark border border-brand-royal/30 text-[11px] text-brand-white/60 font-bold flex items-center justify-center z-10 shrink-0 group-hover/item:border-brand-royal-light group-hover/item:text-brand-royal-light transition-all">
                            {idx + 1}
                          </span>
                          <span className="truncate">{c.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/courses"
                      className="w-full inline-flex justify-center items-center gap-2 bg-brand-royal/20 text-brand-royal-light border border-brand-royal/30 hover:border-brand-royal/60 hover:bg-brand-royal/30 transition-all duration-300 font-tajawal font-bold text-sm px-5 py-3 rounded-2xl"
                    >
                      استكشف المسار
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ الدورات المميزة ═══ */}
      {featuredCourses.length > 0 && (
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-brand-royal-light font-tajawal font-bold text-sm">
                الأكثر إقبالًا
              </span>
              <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
                دورات <span className="text-brand-royal-light">مميزة</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="group glass-dark rounded-[2.5rem] border border-brand-royal/20 hover:border-brand-royal/40 overflow-hidden hover:shadow-royal-glow hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between h-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-brand-royal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />

                  <div>
                    {/* Cover Graphic / Image */}
                    <div className="h-44 bg-[linear-gradient(135deg,rgba(31,46,99,0.5),rgba(7,11,20,0.8))] relative overflow-hidden flex items-center justify-center border-b border-brand-royal/10">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(59,91,219,0.15)_0%,transparent_80%)]" />
                      <BookOpen className="w-12 h-12 text-brand-royal-light/40 group-hover:scale-110 transition-transform duration-300" />

                      {c._count.enrollments > 0 && (
                        <span className="absolute top-4 right-4 text-[10px] bg-brand-royal/20 border border-brand-royal/30 backdrop-blur px-3 py-1 rounded-full text-brand-royal-light font-tajawal font-bold">
                          {c._count.enrollments} طالب مسجّل
                        </span>
                      )}

                      <span className="absolute bottom-4 left-4 text-[10px] bg-white/5 border border-white/10 px-3 py-1 rounded-full text-brand-white/60 font-tajawal">
                        {c.level === "BEGINNER"
                          ? "مبتدئ"
                          : c.level === "INTERMEDIATE"
                            ? "متوسط"
                            : c.level === "ADVANCED"
                              ? "متقدم"
                              : "كل المستويات"}
                      </span>
                    </div>

                    <div className="p-7 space-y-4">
                      <h3 className="font-tajawal font-black text-brand-white text-lg group-hover:text-brand-royal-light transition-colors leading-relaxed">
                        {c.title}
                      </h3>
                      <p className="text-sm text-brand-white/50 font-tajawal line-clamp-2 leading-relaxed">
                        {c.shortDescription || c.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-7 pt-0 space-y-4">
                    <div className="w-full h-px bg-brand-royal/10" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-brand-white font-inter">
                          {c.price}
                        </span>
                        <span className="text-sm font-bold text-brand-royal-light">
                          ₪
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-royal-light group-hover:text-brand-royal transition-colors">
                        عرض التفاصيل <ChevronLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ شهادة نموذجية ═══ */}
      <section className="py-24 relative bg-brand-navy/20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-brand-royal-light font-tajawal font-bold text-sm">
                شهادتك، إنجازك
              </span>
              <h2 className="text-3xl md:text-4xl font-tajawal font-black text-brand-white leading-relaxed">
                شهادة <span className="text-brand-royal-light">مواثقة</span>{" "}
                تفتح لك الأبواب
              </h2>
              <p className="text-brand-white/60 font-tajawal leading-relaxed">
                عند إتمامك لأي دورة بكل متطلباتها، تحصل فورًا على شهادة رقمية
                تحمل رمز QR فريد، يمكن لأي جهة توظيف التحقق منها مباشرة عبر رابط
                عام دائم.
              </p>
              <div className="flex items-center gap-3">
                <QrCode className="w-5 h-5 text-brand-royal-light" />
                <span className="text-sm text-brand-white/50 font-tajawal">
                  توثيق فوري قابل للتحقق العام
                </span>
              </div>
            </div>
            <div className="relative">
              {/* Elegant double border certificate card */}
              <div className="glass-dark border border-brand-royal/30 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                {/* Certificate gold frame effect */}
                <div className="absolute inset-4 border border-brand-royal/20 rounded-[2rem] pointer-events-none" />
                <div className="absolute inset-5 border-2 border-double border-brand-royal/30 rounded-[1.8rem] pointer-events-none" />

                {/* Background security patterns */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-royal/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="text-center space-y-6 py-8 px-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-brand-white/20 font-inter">
                      CERTIFICATE NO: ARK-98721
                    </span>
                    <Award className="w-12 h-12 text-brand-royal-light" />
                    <span className="text-[9px] text-brand-white/20 font-tajawal">
                      تاريخ الإصدار: فوري
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-tajawal font-bold text-brand-royal-light tracking-widest">
                      شهادة إتمام وتفوق
                    </h4>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-brand-royal-light to-transparent mx-auto" />
                  </div>

                  <p className="text-xs text-brand-white/40 font-tajawal">
                    تتقدم إدارة منصة أركان التعليمية للتدريب البرمجي والذكاء
                    الاصطناعي بأن تشهد بأن
                  </p>

                  <div className="py-2">
                    <p className="text-3xl font-tajawal font-black shimmer-text py-1">
                      فارس محمد أحمد
                    </p>
                    <div className="w-48 h-px bg-gradient-to-r from-transparent via-brand-royal-light/50 to-transparent mx-auto mt-2" />
                  </div>

                  <p className="text-xs text-brand-white/50 font-tajawal leading-relaxed">
                    قد اجتاز بنجاح وامتياز كافة الاختبارات والتطبيقات العملية
                    المقررة لدورة:
                    <br />
                    <span className="text-base font-bold text-brand-royal-light block mt-2 font-tajawal">
                      مطور الويب الشامل وتطبيقات الذكاء الاصطناعي
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-4 pt-6 items-end">
                    {/* Signatures */}
                    <div className="text-right space-y-1">
                      <p className="text-[9px] text-brand-white/30 font-tajawal">
                        رئيس الأكاديمية
                      </p>
                      <p className="text-xs font-playfair italic font-bold text-brand-white/80">
                        Farouk Al-Nabih
                      </p>
                      <div className="w-24 h-px bg-white/10" />
                    </div>

                    {/* QR and Verification */}
                    <div className="flex justify-end items-center gap-3">
                      <div className="text-left">
                        <p className="text-[8px] text-brand-white/30 font-tajawal">
                          التحقق من الشهادة
                        </p>
                        <p className="text-[9px] text-brand-royal-light font-inter font-bold">
                          arkan.edu/verify/qr
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-white/5 border border-brand-royal/20 rounded-lg flex items-center justify-center p-1">
                        <QrCode className="w-full h-full text-brand-royal-light/60" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ═══ قصة المؤسس ═══ */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-dark border border-brand-royal/15 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 royal-gradient opacity-50" />
            <div className="grid md:grid-cols-3 gap-10 items-center">
              <div className="md:col-span-1 flex justify-center">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-brand-royal/40 shadow-royal-glow group">
                  <img
                    src="/founder.png"
                    alt="فاروق النبيه"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <span className="text-brand-royal-light font-tajawal font-bold text-sm">
                  من مؤسس المنصة
                </span>
                <h3 className="text-2xl md:text-3xl font-tajawal font-black text-brand-white">
                  فاروق نبيه
                </h3>
                <p className="text-brand-white/60 font-tajawal leading-relaxed">
                  مطوّر برمجيات ومصمم UI/UX ومدرّب معتمد، أسست منصة أركان لأقدّم
                  للطلاب في فلسطين والعالم العربي تجربة تعليمية تجمع بين المحتوى
                  الأكاديمي الجاد والتفاعل العملي — دربنا مئات الطلاب وبنينا
                  مسارات حقيقية توصل للاحتراف، لا مجرد شهادات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ كيف تبدأ ═══ */}
      <section className="py-24 relative bg-brand-navy/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-royal-light font-tajawal font-bold text-sm">
              3 خطوات بسيطة
            </span>
            <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
              كيف <span className="text-brand-royal-light">تبدأ؟</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-brand-royal/30 to-transparent" />
            {learningSteps.map((step) => (
              <div key={step.num} className="text-center space-y-4 relative">
                <div className="w-20 h-20 rounded-2xl royal-gradient flex items-center justify-center mx-auto shadow-royal-glow font-tajawal font-black text-2xl text-white relative z-10">
                  {step.num}
                </div>
                <h3 className="font-tajawal font-bold text-brand-white text-lg">
                  {step.title}
                </h3>
                <p className="text-sm text-brand-white/50 font-tajawal max-w-xs mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ أهم الكتب ═══ */}
      {topBooks.length > 0 && (
        <section className="py-24 relative bg-brand-navy/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-brand-royal-light font-tajawal font-bold text-sm">مكتبة رقمية</span>
              <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
                أبرز <span className="text-brand-royal-light">الكتب</span>
              </h2>
              <p className="text-brand-white/50 font-tajawal text-sm max-w-lg mx-auto">كتب PDF متخصصة تدعم مسيرتك التعليمية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {topBooks.map((book) => (
                <Link
                  key={book.id}
                  href="/library"
                  className="group glass-dark rounded-3xl border border-brand-royal/20 hover:border-brand-royal/40 overflow-hidden hover:shadow-royal-glow hover:-translate-y-2 transition-all duration-500 flex flex-col"
                >
                  <div className="h-36 bg-[linear-gradient(135deg,rgba(31,46,99,0.5),rgba(7,11,20,0.8))] flex items-center justify-center border-b border-brand-royal/10 relative overflow-hidden">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-full h-full object-contain bg-brand-navy/60" />
                    ) : (
                      <Library className="w-10 h-10 text-brand-royal-light/40 group-hover:scale-110 transition-transform" />
                    )}
                    {book.price === 0 && (
                      <span className="absolute top-3 right-3 text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-tajawal font-bold">مجاني</span>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-brand-white text-sm mb-1 line-clamp-2 group-hover:text-brand-royal-light transition-colors">{book.title}</h3>
                    <p className="text-xs text-brand-silver-dim mb-3">{book.author}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-brand-royal-light font-black text-sm">{book.price > 0 ? `${book.price} ₪` : 'مجاني'}</span>
                      <span className="text-[10px] text-brand-silver-dim flex items-center gap-1">
                        <Users size={10} />{book._count.purchases} طالب
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/library" className="inline-flex items-center gap-2 border border-brand-royal/30 text-brand-royal-light px-6 py-3 rounded-xl font-tajawal font-bold hover:bg-brand-royal/10 transition-colors">
                <Library size={16} /> عرض كل الكتب <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ آراء الطلاب ═══ */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-brand-royal-light font-tajawal font-bold text-sm">
              شهادات حقيقية
            </span>
            <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
              آراء <span className="text-brand-royal-light">طلابنا</span>
            </h2>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="card-premium bg-brand-navy/50 glass-dark p-7 rounded-2xl border border-white/5"
                >
                  <Quote className="w-6 h-6 text-brand-royal/40 mb-4" />
                  <p className="text-sm text-brand-white/70 font-tajawal leading-relaxed mb-5">
                    {r.comment}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? "text-brand-royal-light fill-brand-royal-light" : "text-white/10"}`}
                      />
                    ))}
                  </div>
                  <p className="font-tajawal font-bold text-brand-white text-sm">
                    {r.user.name}
                  </p>
                  <p className="text-xs text-brand-white/40 font-tajawal">
                    {r.course.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-dark border border-white/5 rounded-2xl max-w-lg mx-auto">
              <Users className="w-10 h-10 text-brand-white/20 mx-auto mb-4" />
              <p className="text-brand-white/50 font-tajawal">
                كن أول من يشارك تجربته مع أركان بعد إتمام إحدى الدورات.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ الأسئلة الشائعة ═══ */}
      <section className="py-24 relative bg-brand-navy/20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12 space-y-3">
            <span className="text-brand-royal-light font-tajawal font-bold text-sm">
              لديك سؤال؟
            </span>
            <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
              الأسئلة <span className="text-brand-royal-light">الشائعة</span>
            </h2>
          </div>
          <FaqAccordion faqs={faqs} />
          <div className="text-center mt-10">
            <Link
              href="/faq"
              className="text-brand-royal-light hover:text-brand-royal font-tajawal font-bold text-sm inline-flex items-center gap-1.5"
            >
              عرض كل الأسئلة <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ دعوة أخيرة ═══ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10 space-y-6">
          <Trophy className="w-12 h-12 text-brand-royal-light mx-auto" />
          <h2 className="text-3xl md:text-5xl font-tajawal font-black text-brand-white">
            جاهز تبني <span className="shimmer-text">أساسك؟</span>
          </h2>
          <p className="text-brand-white/60 font-tajawal max-w-xl mx-auto">
            انضم لطلاب أركان اللي بدأوا رحلتهم فعلًا، وابدأ اليوم قبل بكرة.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 royal-gradient text-white px-8 py-4 rounded-2xl font-tajawal text-base font-black shadow-royal-glow hover:-translate-y-1 transition-all duration-300"
          >
            <GraduationCap className="w-5 h-5" /> أنشئ حسابك الآن
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
