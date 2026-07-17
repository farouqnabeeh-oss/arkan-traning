import { db } from './db';

// ─── تعريف كل الإنجازات المتاحة بالمنصة (مصدر الحقيقة الوحيد) ──────────
export const ACHIEVEMENTS = [
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
] as const;

export type AchievementCode = typeof ACHIEVEMENTS[number]['code'];

/** يمنح إنجاز لطالب لو ما كان حاصل عليه من قبل، ويرجع true لو مُنح فعليًا الآن */
export async function grantAchievement(userId: string, code: AchievementCode): Promise<boolean> {
  const achievement = await db.achievement.findUnique({ where: { code } });
  if (!achievement) return false; // لسه ما انزرع بقاعدة البيانات (شغّل الـ seed)

  const existing = await db.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return false;

  await db.userAchievement.create({ data: { userId, achievementId: achievement.id } });
  await db.notification.create({
    data: {
      userId,
      title: `إنجاز جديد: ${achievement.title} 🏅`,
      body: achievement.description,
      link: '/dashboard/settings',
    },
  });
  return true;
}

/** يفحص كل الإنجازات المرتبطة بالتقدم العام للطالب (XP، ستريك) ويمنح المستحق منها */
export async function checkProgressAchievements(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { xp: true, streak: true } });
  if (!user) return;

  if (user.xp >= 500) await grantAchievement(userId, 'XP_500');
  if (user.xp >= 2000) await grantAchievement(userId, 'XP_2000');
  if (user.streak >= 7) await grantAchievement(userId, 'STREAK_7');
  if (user.streak >= 30) await grantAchievement(userId, 'STREAK_30');
}

/** يفحص إنجازات إكمال الدروس والدورات */
export async function checkLearningAchievements(userId: string) {
  const [completedLessonsCount, completedCoursesCount, certificatesCount] = await Promise.all([
    db.lessonProgress.count({ where: { isCompleted: true, enrollment: { userId } } }),
    db.enrollment.count({ where: { userId, isCompleted: true } }),
    db.certificate.count({ where: { userId } }),
  ]);

  if (completedLessonsCount >= 1) await grantAchievement(userId, 'FIRST_LESSON');
  if (completedCoursesCount >= 1) await grantAchievement(userId, 'FIRST_COURSE');
  if (completedCoursesCount >= 5) await grantAchievement(userId, 'FIVE_COURSES');
  if (certificatesCount >= 1) await grantAchievement(userId, 'FIRST_CERTIFICATE');
}

/** يفحص إنجاز تنوع الألعاب الملعوبة */
export async function checkGameAchievements(userId: string) {
  const distinctGames = await db.gameScore.findMany({
    where: { userId },
    select: { gameId: true },
    distinct: ['gameId'],
  });
  if (distinctGames.length >= 5) await grantAchievement(userId, 'FIVE_GAMES');
}
