const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash passwords
  const instructorPasswordHash = await bcrypt.hash('arkan123', 10);
  const studentPasswordHash = await bcrypt.hash('student123', 10);

  // 1. Create Users
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@arkan.edu' },
    update: {},
    create: {
      email: 'instructor@arkan.edu',
      name: 'المدرب أركان',
      passwordHash: instructorPasswordHash,
      role: 'INSTRUCTOR',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@arkan.edu' },
    update: {},
    create: {
      email: 'student@arkan.edu',
      name: 'أحمد طالب',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
    },
  });

  console.log('Users seeded:', { instructor: instructor.email, student: student.email });

  // 2. Create Games
  const games = [
    {
      slug: 'flexbox-defender',
      name: 'حامي Flexbox',
      category: 'HTML_CSS',
      description: 'تحكّم في تخطيط العناصر لحماية القاعدة من الهجمات باستخدام CSS Flexbox.',
    },
    {
      slug: 'css-battle',
      name: 'معركة CSS',
      category: 'HTML_CSS',
      description: 'طابق التصميم المستهدف بأقل كود ممكن من HTML/CSS.',
    },
    {
      slug: 'python-snake',
      name: 'ثعبان بايثون',
      category: 'PYTHON',
      description: 'اكتب أوامر بايثون للتحكم في الثعبان وتناول الطعام وتجنب العقبات.',
    },
    {
      slug: 'rps-ai',
      name: 'حجر ورقة مقص AI',
      category: 'PYTHON',
      description: 'نفّذ منطق اللعبة واهزم ذكاءً اصطناعياً يتعلم من حركاتك مسبقاً.',
    },
    {
      slug: 'tic-tac-toe',
      name: 'اكس او (Tic-Tac-Toe)',
      category: 'JAVASCRIPT',
      description: 'لعبة كلاسيكية مع إمكانية التراجع وخوارزمية ذكية لمنافستك.',
    },
    {
      slug: 'memory-card',
      name: 'لعبة الذاكرة',
      category: 'JAVASCRIPT',
      description: 'طابق البطاقات المتشابهة في أسرع وقت واختبر مهارتك في مصفوفات جافا سكريبت.',
    },
    {
      slug: 'code-typer',
      name: 'مُدرّب الكتابة',
      category: 'TYPING',
      description: 'اكتب مقتطفات برمجية بأسرع وقت ممكن وبأقل نسبة خطأ.',
    },
    {
      slug: 'algorithm-puzzle',
      name: 'أحجية الخوارزميات',
      category: 'PROBLEM_SOLVING',
      description: 'رتّب خطوات الخوارزمية لتخطي حالات الاختبار وحل المشكلة البرمجية.',
    },
    {
      slug: 'regex-hunter',
      name: 'صياد الأنماط Regex',
      category: 'PROBLEM_SOLVING',
      description: 'اكتب تعبيرًا نمطيًا (Regex) صحيحًا يطابق كل الأمثلة المطلوبة قبل نفاد الوقت، بمساعدة تلميحات متدرجة.',
    },
    {
      slug: 'sql-duel',
      name: 'مبارزة SQL',
      category: 'PROBLEM_SOLVING',
      description: 'اكتب استعلام SQL صحيحًا يحقق النتيجة المطلوبة من جدول بيانات حقيقي ضد عداد زمني.',
    },
    {
      slug: 'git-race',
      name: 'سباق Git',
      category: 'PROBLEM_SOLVING',
      description: 'اختر تسلسل أوامر Git الصحيح لحل سيناريو حقيقي بأسرع وقت وأقل تلميحات.',
    },
    {
      slug: 'debugging-detective',
      name: 'محقق الأخطاء',
      category: 'JAVASCRIPT',
      description: 'اكتشف السطر المسبب للخطأ بمقتطف كود جافا سكريبت قبل نفاد الوقت.',
    },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: game,
      create: game,
    });
  }

  console.log('Games seeded.');

  // 3. Create Courses, Modules, Lessons
  // Course 1
  const course1 = await prisma.course.upsert({
    where: { slug: 'web-development-basics' },
    update: {},
    create: {
      title: 'أساسيات تطوير الويب الحديثة',
      slug: 'web-development-basics',
      description: 'دورة شاملة لتعلم أساسيات تطوير الويب من الصفر باستخدام HTML، CSS، وجافا سكريبت مع تطبيقات عملية وألعاب تفاعلية.',
      price: 150.0,
      level: 'BEGINNER',
      isPublished: true,
      image: '/images/courses/web-dev.jpg',
    },
  });

  const m1 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'مقدمة في الويب وتصميم التخطيطات',
      sortOrder: 1,
    },
  });

  const l1 = await prisma.lesson.create({
    data: {
      moduleId: m1.id,
      title: 'ما هو الويب وكيف يعمل؟',
      slug: 'what-is-web',
      description: 'شرح مبسط لكيفية انتقال البيانات بين الخادم والعميل (Client-Server Architecture) ودور المتصفح.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010101', // Example Video URL
      duration: 300,
      sortOrder: 1,
      isPublished: true,
    },
  });

  const l2 = await prisma.lesson.create({
    data: {
      moduleId: m1.id,
      title: 'مقدمة في HTML5',
      slug: 'intro-to-html',
      description: 'تعرف على البنية الأساسية لصفحات الويب وكيفية كتابة وسوم HTML5 بشكل صحيح ومتوافق مع معايير SEO.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010102',
      duration: 600,
      sortOrder: 2,
      isPublished: true,
    },
  });

  const l3 = await prisma.lesson.create({
    data: {
      moduleId: m1.id,
      title: 'تصميم الواجهات باستخدام CSS Flexbox',
      slug: 'css-flexbox',
      description: 'تعلم تخطيط وتوزيع العناصر بمرونة فائقة وكيفية محاذاة المحتوى بشكل متجاوب باستخدام Flexbox.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010103',
      duration: 900,
      sortOrder: 3,
      isPublished: true,
    },
  });

  const m2 = await prisma.module.create({
    data: {
      courseId: course1.id,
      title: 'أساسيات لغة جافا سكريبت التفاعلية',
      sortOrder: 2,
    },
  });

  const l4 = await prisma.lesson.create({
    data: {
      moduleId: m2.id,
      title: 'مقدمة في جافا سكريبت والـ DOM',
      slug: 'intro-to-javascript',
      description: 'تعرف على كيفية جعل صفحات الويب تفاعلية وديناميكية من خلال معالجة أحداث DOM واستخدام المتغيرات والشروط.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010104',
      duration: 1200,
      sortOrder: 1,
      isPublished: true,
    },
  });

  // Course 2
  const course2 = await prisma.course.upsert({
    where: { slug: 'python-programming' },
    update: {},
    create: {
      title: 'بايثون للمبتدئين والمحترفين',
      slug: 'python-programming',
      description: 'تعلم لغة بايثون من الأساسيات إلى البرمجة كائنية التوجه وتصميم خوارزميات ذكاء اصطناعي تفاعلية.',
      price: 200.0,
      level: 'INTERMEDIATE',
      isPublished: true,
      image: '/images/courses/python.jpg',
    },
  });

  const m3 = await prisma.module.create({
    data: {
      courseId: course2.id,
      title: 'أساسيات البرمجة بلغة بايثون',
      sortOrder: 1,
    },
  });

  const l5 = await prisma.lesson.create({
    data: {
      moduleId: m3.id,
      title: 'المتغيرات وأنواع البيانات في بايثون',
      slug: 'variables-and-data-types',
      description: 'تعلم كيفية حجز المتغيرات والتعامل مع السلاسل النصية والأرقام والقوائم (Lists) في لغة بايثون.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010105',
      duration: 450,
      sortOrder: 1,
      isPublished: true,
    },
  });

  const l6 = await prisma.lesson.create({
    data: {
      moduleId: m3.id,
      title: 'الحلقات التكرارية والدوال البرمجية',
      slug: 'loops-and-functions',
      description: 'كيفية كتابة حلقات التكرار For/While، وإنشاء دوال منظمة ومحكمة لإعادة استخدام الكود البرمجي.',
      videoUrl: 'https://vimeo.com/channels/staffpicks/1010106',
      duration: 800,
      sortOrder: 2,
      isPublished: true,
    },
  });

  console.log('Courses, Modules, and Lessons seeded.');

  // 4. Create simple FAQs
  const faqs = [
    {
      question: 'كيف يمكنني الانضمام للدورات؟',
      answer: 'يمكنك إنشاء حساب طالب، ثم الدخول لصفحة الدورة واستخدام كود الفاوتشر (القسيمة) المفعلة من قبل المدرب مباشرة.',
      category: 'عام',
      sortOrder: 1,
    },
    {
      question: 'هل توجد شهادة بعد إتمام الدورة؟',
      answer: 'نعم، بمجرد حضور كافة الدروس واجتياز جميع الاختبارات وحل الواجبات، ستصدر لك شهادة معتمدة تحتوي على رمز تحقق QR فريد وصالح للتحقق العام.',
      category: 'الشهادات',
      sortOrder: 2,
    },
    {
      question: 'ما هي الألعاب البرمجية المتوفرة؟',
      answer: 'نوفر 8 ألعاب تفاعلية لتعلم البرمجة وتصميم المواقع مثل Flexbox Defender وCSS Battle ومطور خوارزميات الذكاء الاصطناعي وبايثون ومحجية جافا سكريبت وغيرها.',
      category: 'الألعاب والتفاعل',
      sortOrder: 3,
    },
  ];

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: faq,
    });
  }
  console.log('FAQs seeded.');

  // 6. Seed Achievements
  const achievements = [
    { code: 'FIRST_LESSON', title: 'أول خطوة', description: 'أكملت أول درس لك بمنصة أركان', icon: 'footprints' },
    { code: 'FIRST_COURSE', title: 'خريج أول دورة', description: 'أتممت أول دورة كاملة بنجاح', icon: 'graduation-cap' },
    { code: 'FIVE_COURSES', title: 'جامع المعرفة', description: 'أتممت 5 دورات كاملة', icon: 'library' },
    { code: 'FIRST_CERTIFICATE', title: 'أول شهادة', description: 'حصلت على أول شهادة موثقة لك', icon: 'award' },
    { code: 'XP_500', title: 'صياد النقاط', description: 'وصلت لـ 500 نقطة خبرة', icon: 'zap' },
    { code: 'XP_2000', title: 'أسطورة أركان', description: 'وصلت لـ 2000 نقطة خبرة', icon: 'crown' },
    { code: 'STREAK_7', title: 'مثابر', description: 'حافظت على نشاطك 7 أيام متتالية', icon: 'flame' },
    { code: 'STREAK_30', title: 'لا يُقهر', description: 'حافظت على نشاطك 30 يوم متتالي', icon: 'flame' },
    { code: 'FIVE_GAMES', title: 'نجم الألعاب', description: 'حققت نتيجة بـ5 ألعاب مختلفة', icon: 'gamepad-2' },
    { code: 'FIRST_BOOK', title: 'قارئ نهم', description: 'اشتريت أول كتاب من المكتبة', icon: 'book-open' },
    { code: 'FIRST_ANSWER', title: 'مساعد المجتمع', description: 'جاوبت على سؤال طالب تاني لأول مرة', icon: 'message-circle' },
    { code: 'FIRST_REFERRAL', title: 'سفير أركان', description: 'أول صديق انضم عن طريق دعوتك', icon: 'users' },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });
  }
  console.log('Achievements seeded.');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
