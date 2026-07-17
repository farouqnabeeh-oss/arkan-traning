export const fallbackCourses = [
  {
    id: "fallback-course-1",
    title: "أساسيات برمجة Python",
    slug: "python-basics",
    shortDescription: "ابدأ رحلتك مع البرمجة من الصفر عبر مشاريع عملية ومبسطة.",
    description:
      "دورة عملية لتعلم أساسيات Python مع أمثلة يومية ومشاريع صغيرة.",
    price: 149,
    compareAtPrice: 199,
    level: "BEGINNER",
    category: "برمجة",
    image: null,
    enrollmentsCount: 320,
    lessonsCount: 18,
    avgRating: 4.8,
    progress: null,
  },
  {
    id: "fallback-course-2",
    title: "تصميم Frontend بالـ HTML وCSS",
    slug: "frontend-html-css",
    shortDescription: "تعلم بناء واجهات جذابة وتفاعلها مع المستخدمين.",
    description:
      "دورة موجهة لتطوير الواجهات الحديثة باستخدام HTML وCSS بشكل احترافي.",
    price: 179,
    compareAtPrice: 239,
    level: "INTERMEDIATE",
    category: "ويب",
    image: null,
    enrollmentsCount: 240,
    lessonsCount: 22,
    avgRating: 4.7,
    progress: null,
  },
  {
    id: "fallback-course-3",
    title: "JavaScript من الصفر إلى الاحتراف",
    slug: "javascript-pro",
    shortDescription: "افهم JavaScript بشكل عملي وابدأ ببناء مشاريع حقيقية.",
    description:
      "مجموعة شاملة لتعلّم JavaScript، ES6، والأحداث والتعامل مع APIs.",
    price: 199,
    compareAtPrice: 269,
    level: "ADVANCED",
    category: "برمجة",
    image: null,
    enrollmentsCount: 410,
    lessonsCount: 28,
    avgRating: 4.9,
    progress: null,
  },
];

export const fallbackBooks = [
  {
    id: "fallback-book-1",
    title: "دليل Python العملي",
    slug: "python-practical-guide",
    description: "كتاب مختصر ومفيد يشرح أساسيات Python بطريقة عملية.",
    author: "فريق أركان",
    price: 89,
    category: "برمجة",
    coverImage: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "fallback-book-2",
    title: "أساسيات CSS الحديثة",
    slug: "modern-css-basics",
    description: "ملف مرجعي مختصر لأساسيات CSS والتخطيط والتنسيق.",
    author: "فريق أركان",
    price: 79,
    category: "ويب",
    coverImage: null,
    isPublished: true,
    createdAt: new Date().toISOString(),
  },
];

export const fallbackLeaderboard = [
  { id: "fallback-leader-1", name: "سارة", xp: 3200, streak: 12 },
  { id: "fallback-leader-2", name: "أحمد", xp: 2950, streak: 9 },
  { id: "fallback-leader-3", name: "ليان", xp: 2780, streak: 7 },
];

export const fallbackFaqs = [
  {
    id: "1",
    question: "كيف يمكنني الانضمام للدورات؟",
    answer: "أنشئ حسابك ثم تواصل معنا لتفعيل التسجيل بالدورة المناسبة لك.",
  },
  {
    id: "2",
    question: "هل توجد شهادة بعد إتمام الدورة؟",
    answer:
      "نعم، شهادة موثقة برمز QR فريد للتحقق العام فور إكمال جميع متطلبات الدورة.",
  },
  {
    id: "3",
    question: "ما هي الألعاب البرمجية المتوفرة؟",
    answer:
      "مجموعة ألعاب تفاعلية لتعلم CSS وبايثون والخوارزميات بأسلوب تنافسي وممتع.",
  },
];

export const fallbackFeaturedCourses = [
  {
    id: "fallback-featured-1",
    title: "أساسيات برمجة Python",
    slug: "python-basics",
    shortDescription: "ابدأ رحلتك مع البرمجة من الصفر عبر Projects عملية.",
    description:
      "دورة عملية لتعلم أساسيات Python مع أمثلة يومية ومشاريع صغيرة.",
    price: 149,
    level: "BEGINNER",
    category: "برمجة",
    _count: { enrollments: 320 },
  },
  {
    id: "fallback-featured-2",
    title: "تصميم Frontend بالـ HTML وCSS",
    slug: "frontend-html-css",
    shortDescription: "تعلم بناء واجهات جذابة وتفاعلها مع المستخدمين.",
    description:
      "دورة موجهة لتطوير الواجهات الحديثة باستخدام HTML وCSS بشكل احترافي.",
    price: 179,
    level: "INTERMEDIATE",
    category: "ويب",
    _count: { enrollments: 240 },
  },
  {
    id: "fallback-featured-3",
    title: "JavaScript من الصفر إلى الاحتراف",
    slug: "javascript-pro",
    shortDescription: "افهم JavaScript بشكل عملي وابدأ ببناء مشاريع حقيقية.",
    description:
      "مجموعة شاملة لتعلّم JavaScript، ES6، والأحداث والتعامل مع APIs.",
    price: 199,
    level: "ADVANCED",
    category: "برمجة",
    _count: { enrollments: 410 },
  },
];

export const fallbackTracks = [
  { name: "برمجة", courses: fallbackFeaturedCourses.slice(0, 2) },
  { name: "ويب", courses: fallbackFeaturedCourses.slice(1, 3) },
];

export const fallbackHomeStats = {
  studentsCount: 1200,
  coursesCount: 18,
  certificatesCount: 230,
  avgRating: 4.8,
};
