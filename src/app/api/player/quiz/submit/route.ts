import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import crypto from 'crypto';
import { sendCertificateReadyEmail } from '@/lib/email';
import { checkLearningAchievements, checkProgressAchievements } from '@/lib/achievements';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    const { quizId, answers } = await request.json(); // answers is { [questionId]: string }

    if (!quizId || !answers) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة مفقودة لتقديم الاختبار.' },
        { status: 400 }
      );
    }

    // 1. Fetch Quiz questions
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'الاختبار غير موجود.' }, { status: 404 });
    }

    let totalPoints = 0;
    let pointsScored = 0;
    const gradingResults: { [questionId: string]: boolean } = {};
    const correctAnswers: { [questionId: string]: string } = {};

    // 2. Grade each question
    for (const q of quiz.questions) {
      totalPoints += q.points;
      correctAnswers[q.id] = q.correctAnswer;
      
      const studentAnswer = answers[q.id]?.trim();
      const isCorrect = studentAnswer?.toLowerCase() === q.correctAnswer.trim().toLowerCase();
      
      if (isCorrect) {
        pointsScored += q.points;
      }
      gradingResults[q.id] = isCorrect;
    }

    // Calculate score
    const scorePercentage = totalPoints > 0 
      ? Math.round((pointsScored / totalPoints) * 100)
      : 0;

    const isPassed = scorePercentage >= quiz.passingScore;

    // 3. Save QuizAttempt
    const attempt = await db.quizAttempt.create({
      data: {
        quizId,
        userId: user.id,
        score: scorePercentage,
        answers,
        isPassed,
      },
    });

    // مكافأة XP عند اجتياز الاختبار (يشمل الامتحان النهائي)
    let certificateJustCreated = false;
    let verificationId: string | null = null;

    if (isPassed) {
      await db.user.update({ where: { id: user.id }, data: { xp: { increment: quiz.isFinalExam ? 50 : 25 } } });
      await checkProgressAchievements(user.id);

      // لو هذا امتحان نهائي واجتازه، وأكمل الدروس بالفعل، وما عندوش شهادة بعد → أصدرها الآن
      if (quiz.isFinalExam && quiz.courseId) {
        const enrollment = await db.enrollment.findUnique({
          where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
        });

        if (enrollment?.isCompleted) {
          const existingCert = await db.certificate.findFirst({ where: { userId: user.id, courseId: quiz.courseId } });
          if (!existingCert) {
            verificationId = `ARK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            await db.certificate.create({ data: { userId: user.id, courseId: quiz.courseId, verificationId } });
            certificateJustCreated = true;
            await checkLearningAchievements(user.id);

            const course = await db.course.findUnique({ where: { id: quiz.courseId }, select: { title: true } });
            await db.notification.create({
              data: {
                userId: user.id,
                title: 'مبروك! حصلت على شهادتك 🏆',
                body: `اجتزت الامتحان النهائي لدورة "${course?.title}"، شهادتك جاهزة الآن.`,
                link: `/certificates/${verificationId}`,
              },
            });
            sendCertificateReadyEmail(user.email, user.name, course?.title || '', verificationId).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      score: scorePercentage,
      isPassed,
      gradingResults,
      correctAnswers,
      certificateJustCreated,
      verificationId,
    });
  } catch (error) {
    console.error('Quiz grading error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رصد نتيجة الاختبار.' },
      { status: 500 }
    );
  }
}
