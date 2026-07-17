import { NextResponse } from 'next/server';
import { sendCertificateReadyEmail } from '@/lib/email';
import { checkLearningAchievements, checkProgressAchievements } from '@/lib/achievements';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    const { courseSlug, lessonId, isCompleted: rawIsCompleted, watchTime = 0 } = await request.json();
    const isCompleted = rawIsCompleted === undefined ? undefined : !!rawIsCompleted;

    if (!courseSlug || !lessonId) {
      return NextResponse.json(
        { error: 'يرجى تقديم الكود المعرف للدورة والدرس.' },
        { status: 400 }
      );
    }

    // 1. Find the course
    const course = await db.course.findUnique({
      where: { slug: courseSlug },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة.' }, { status: 404 });
    }

    // 2. Find enrollment
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'أنت غير مشترك في هذه الدورة.' },
        { status: 403 }
      );
    }

    // 3. Update or create LessonProgress
    const existingProgress = await db.lessonProgress.findUnique({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    });
    const isNewlyCompleted = !!isCompleted && !existingProgress?.isCompleted;
    const finalIsCompleted = isCompleted !== undefined ? isCompleted : (existingProgress?.isCompleted || false);

    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        isCompleted: finalIsCompleted,
        watchTime: Math.round(watchTime),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: finalIsCompleted,
        watchTime: Math.round(watchTime),
      },
    });

    // 4. Recalculate overall enrollment progress percentage
    const allLessons = course.modules.reduce((acc: any[], m) => [...acc, ...m.lessons], []);
    const totalLessonCount = allLessons.length;

    // Fetch all completed lessons for this enrollment
    const completedProgressCount = await db.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
    });

    const progressPercentage = totalLessonCount > 0 
      ? Math.min(100, Math.round((completedProgressCount / totalLessonCount) * 100 * 10) / 10)
      : 0;

    const courseCompleted = progressPercentage >= 100;

    // Update enrollment progress
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress: progressPercentage,
        isCompleted: courseCompleted,
      },
    });

    // 5. Automatic Certificate Generation — بعد إكمال كل الدروس + اجتياز الامتحان النهائي (إن وُجد)
    let certificateCreated = false;
    let verificationId = '';
    let finalExamRequired = false;
    let finalExamPassed = true;

    if (courseCompleted) {
      const finalExam = await db.quiz.findFirst({ where: { courseId: course.id, isFinalExam: true } });

      if (finalExam) {
        finalExamRequired = true;
        const passedAttempt = await db.quizAttempt.findFirst({
          where: { quizId: finalExam.id, userId: user.id, isPassed: true },
        });
        finalExamPassed = !!passedAttempt;
      }

      if (finalExamPassed) {
        const existingCert = await db.certificate.findFirst({
          where: { userId: user.id, courseId: course.id },
        });

        if (!existingCert) {
          verificationId = `ARK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

          await db.certificate.create({
            data: { userId: user.id, courseId: course.id, verificationId },
          });
          certificateCreated = true;
        } else {
          verificationId = existingCert.verificationId;
        }
      }
    }

    // 5.5 نقاط الخبرة والستريك اليومي
    if (isNewlyCompleted) {
      const now = new Date();
      const currentUser = await db.user.findUnique({ where: { id: user.id }, select: { lastActiveAt: true, streak: true } });
      let newStreak = currentUser?.streak || 0;
      if (currentUser?.lastActiveAt) {
        const diffDays = Math.floor((now.getTime() - new Date(currentUser.lastActiveAt).getTime()) / 86400000);
        if (diffDays === 1) newStreak += 1;
        else if (diffDays > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
      await db.user.update({ where: { id: user.id }, data: { xp: { increment: 10 }, streak: newStreak, lastActiveAt: now } });
      await checkProgressAchievements(user.id);
      await checkLearningAchievements(user.id);
    }

    if (courseCompleted) {
      await db.user.update({ where: { id: user.id }, data: { xp: { increment: 200 } } });
      await checkProgressAchievements(user.id);
    }

    if (certificateCreated) {
      await checkLearningAchievements(user.id);
      await db.notification.create({
        data: {
          userId: user.id,
          title: 'مبروك! حصلت على شهادتك 🏆',
          body: `أتممت دورة "${course.title}" بنجاح، شهادتك جاهزة الآن.`,
          link: `/certificates/${verificationId}`,
        },
      });
      sendCertificateReadyEmail(user.email, user.name, course.title, verificationId!).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      progressPercentage,
      isCompleted: progress.isCompleted,
      courseCompleted,
      certificateCreated,
      verificationId,
      finalExamRequired,
      finalExamPassed,
    });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ تقدم المشاهدة.' },
      { status: 500 }
    );
  }
}
