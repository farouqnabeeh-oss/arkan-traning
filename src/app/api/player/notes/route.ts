import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// Get notes for a lesson
export async function GET(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) {
      return NextResponse.json({ error: 'معرف الدرس مطلوب.' }, { status: 400 });
    }

    const notes = await db.note.findMany({
      where: {
        userId: user.id,
        lessonId,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الملاحظات.' },
      { status: 500 }
    );
  }
}

// Add a note
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح.' }, { status: 401 });
    }

    const { lessonId, content, timestamp } = await request.json();

    if (!lessonId || !content || timestamp === undefined) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة لإضافة الملاحظة.' },
        { status: 400 }
      );
    }

    const note = await db.note.create({
      data: {
        userId: user.id,
        lessonId,
        content,
        timestamp: Math.round(timestamp),
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الملاحظة.' },
      { status: 500 }
    );
  }
}
