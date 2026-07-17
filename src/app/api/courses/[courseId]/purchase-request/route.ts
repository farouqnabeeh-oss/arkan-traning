import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'يرجى تسجيل الدخول أولًا.' }, { status: 401 });

  const { transferNote } = await request.json();
  if (!transferNote || transferNote.trim().length < 3) {
    return NextResponse.json({ error: 'يرجى كتابة اسم المُحوِّل أو رقم العملية للتحقق من التحويل.' }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { id: params.courseId } });
  if (!course || !course.isPublished) return NextResponse.json({ error: 'الدورة غير متاحة.' }, { status: 404 });

  const existingEnrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existingEnrollment) return NextResponse.json({ error: 'أنت مسجل بهذه الدورة بالفعل.' }, { status: 400 });

  const existing = await db.coursePurchaseRequest.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existing && existing.status !== 'REJECTED') {
    return NextResponse.json({ error: 'لديك طلب سابق لهذه الدورة قيد المراجعة بالفعل.' }, { status: 400 });
  }

  const purchaseRequest = await db.coursePurchaseRequest.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: { status: 'PENDING', transferNote: transferNote.trim(), reviewedAt: null, accessCode: null },
    create: { userId: user.id, courseId: course.id, status: 'PENDING', transferNote: transferNote.trim() },
  });

  return NextResponse.json({ success: true, purchaseRequest });
}

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ purchaseRequest: null });

  const purchaseRequest = await db.coursePurchaseRequest.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: params.courseId } },
  });

  return NextResponse.json({ purchaseRequest });
}
