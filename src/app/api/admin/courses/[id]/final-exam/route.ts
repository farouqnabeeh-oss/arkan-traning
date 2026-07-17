import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

async function requireAdminOrInstructor() {
  const user = await getSessionUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) return null;
  return user;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const exam = await db.quiz.findFirst({
    where: { courseId: params.id, isFinalExam: true },
    include: { questions: true },
  });

  return NextResponse.json({ exam });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { title, passingScore, questions } = await request.json();

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'يرجى إدخال عنوان الامتحان وسؤال واحد على الأقل.' }, { status: 400 });
  }

  const existing = await db.quiz.findFirst({ where: { courseId: params.id, isFinalExam: true } });

  // إعادة بناء الأسئلة بالكامل (أبسط طريقة لمزامنة التعديلات)
  if (existing) {
    await db.question.deleteMany({ where: { quizId: existing.id } });
  }

  const exam = existing
    ? await db.quiz.update({
        where: { id: existing.id },
        data: {
          title,
          passingScore: passingScore ? parseFloat(passingScore) : 70,
          questions: {
            create: questions.map((q: any) => ({
              type: 'MULTIPLE_CHOICE',
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              points: q.points ? parseInt(q.points, 10) : 10,
            })),
          },
        },
        include: { questions: true },
      })
    : await db.quiz.create({
        data: {
          courseId: params.id,
          isFinalExam: true,
          title,
          passingScore: passingScore ? parseFloat(passingScore) : 70,
          questions: {
            create: questions.map((q: any) => ({
              type: 'MULTIPLE_CHOICE',
              questionText: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              points: q.points ? parseInt(q.points, 10) : 10,
            })),
          },
        },
        include: { questions: true },
      });

  return NextResponse.json({ success: true, exam });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdminOrInstructor();
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const existing = await db.quiz.findFirst({ where: { courseId: params.id, isFinalExam: true } });
  if (existing) await db.quiz.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}
