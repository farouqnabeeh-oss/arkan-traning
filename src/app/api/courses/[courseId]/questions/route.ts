import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول لطرح سؤال.' }, { status: 401 });

  const { title, content } = await request.json();
  if (!title || title.trim().length < 4 || !content || content.trim().length < 5) {
    return NextResponse.json({ error: 'يرجى كتابة عنوان ومحتوى واضحين للسؤال.' }, { status: 400 });
  }

  const question = await db.courseQuestion.create({
    data: { courseId: params.courseId, userId: user.id, title: title.trim(), content: content.trim() },
    include: { user: { select: { name: true } }, answers: true },
  });

  return NextResponse.json({ success: true, question });
}
