import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: 'يرجى تحديد الدورة.' }, { status: 400 });
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: params.id, courseId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'الطالب مسجل بالفعل بهذه الدورة.' }, { status: 400 });
  }

  const enrollment = await db.enrollment.create({
    data: { userId: params.id, courseId },
    include: { course: { select: { title: true } } },
  });

  return NextResponse.json({ success: true, enrollment });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await getSessionUser();
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { courseId } = await request.json();
  if (!courseId) {
    return NextResponse.json({ error: 'يرجى تحديد الدورة.' }, { status: 400 });
  }

  await db.enrollment.delete({
    where: { userId_courseId: { userId: params.id, courseId } },
  });

  return NextResponse.json({ success: true });
}
