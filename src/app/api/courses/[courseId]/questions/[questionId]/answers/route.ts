import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { grantAchievement, checkProgressAchievements } from '@/lib/achievements';

export async function POST(request: Request, { params }: { params: { courseId: string; questionId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول للإجابة.' }, { status: 401 });

  const { content } = await request.json();
  if (!content || content.trim().length < 3) {
    return NextResponse.json({ error: 'يرجى كتابة إجابة واضحة.' }, { status: 400 });
  }

  const question = await db.courseQuestion.findUnique({ where: { id: params.questionId }, select: { userId: true, title: true } });
  if (!question) return NextResponse.json({ error: 'السؤال غير موجود.' }, { status: 404 });

  const answer = await db.courseAnswer.create({
    data: { questionId: params.questionId, userId: user.id, content: content.trim() },
    include: { user: { select: { name: true, role: true } } },
  });

  // مكافأة XP للمُجيب (تشجيع المشاركة المجتمعية) — لا يُمنح لو الطالب بيجاوب على سؤاله هو نفسه
  if (question.userId !== user.id) {
    await db.user.update({ where: { id: user.id }, data: { xp: { increment: 20 } } });
    await grantAchievement(user.id, 'FIRST_ANSWER');
    await checkProgressAchievements(user.id);
    await db.notification.create({
      data: {
        userId: question.userId,
        title: 'حد جاوب على سؤالك! 💬',
        body: `${user.name} جاوب على سؤالك "${question.title}"`,
        link: `/courses`,
      },
    });
  }

  return NextResponse.json({ success: true, answer });
}
